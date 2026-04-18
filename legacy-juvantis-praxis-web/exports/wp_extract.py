#!/usr/bin/env python3
"""
WordPress XML Export → Strukturierte Content-Datei für Juvantis Shopify-Migration.

Verwendung:
    python3 wp_extract.py <wordpress-export.xml> [output.md]

Extrahiert aus einem WordPress-Export (Werkzeuge → Export → Alle Inhalte):
- Alle Seiten (Pages) mit Titel, URL-Slug, Inhalt
- Alle Beiträge (Posts) mit Titel, Datum, Inhalt
- Menü-Struktur (falls im Export enthalten)
- Medien-URLs (Bilder)

Output: Markdown-Datei mit strukturiertem Content, bereit zum Einbetten
in den Shopify Build Prompt.
"""

import sys
import re
import html
from pathlib import Path

try:
    import xml.etree.ElementTree as ET
except ImportError:
    print("ERROR: xml.etree.ElementTree nicht verfügbar")
    sys.exit(1)


# WordPress XML Namespaces
NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
    'dc': 'http://purl.org/dc/elements/1.1/',
}


def strip_html(text: str) -> str:
    """HTML-Tags entfernen, Entities decodieren, Whitespace normalisieren."""
    if not text:
        return ""
    # WordPress shortcodes entfernen [shortcode attr="val"]...[/shortcode]
    text = re.sub(r'\[/?[a-zA-Z_][^\]]*\]', '', text)
    # HTML-Tags entfernen
    text = re.sub(r'<[^>]+>', '\n', text)
    # HTML-Entities decodieren
    text = html.unescape(text)
    # Mehrfache Leerzeilen reduzieren
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_pages(root) -> list[dict]:
    """Alle WordPress-Seiten extrahieren."""
    pages = []
    for item in root.iter('item'):
        post_type_el = item.find('wp:post_type', NS)
        status_el = item.find('wp:status', NS)

        if post_type_el is None or post_type_el.text != 'page':
            continue
        if status_el is not None and status_el.text not in ('publish', 'draft'):
            continue

        title = item.findtext('title', '')
        slug = item.findtext('wp:post_name', '', NS)
        content_raw = item.findtext('content:encoded', '', NS)
        excerpt = item.findtext('excerpt:encoded', '', NS)
        menu_order = item.findtext('wp:menu_order', '0', NS)
        parent_id = item.findtext('wp:post_parent', '0', NS)
        status = status_el.text if status_el is not None else 'unknown'

        pages.append({
            'title': title,
            'slug': slug,
            'content_html': content_raw,
            'content_text': strip_html(content_raw),
            'excerpt': strip_html(excerpt),
            'menu_order': int(menu_order) if menu_order.isdigit() else 0,
            'parent_id': parent_id,
            'status': status,
        })

    # Nach Menü-Reihenfolge sortieren
    pages.sort(key=lambda p: (p['menu_order'], p['title']))
    return pages


def extract_posts(root) -> list[dict]:
    """Alle WordPress-Beiträge extrahieren."""
    posts = []
    for item in root.iter('item'):
        post_type_el = item.find('wp:post_type', NS)
        status_el = item.find('wp:status', NS)

        if post_type_el is None or post_type_el.text != 'post':
            continue
        if status_el is not None and status_el.text != 'publish':
            continue

        title = item.findtext('title', '')
        slug = item.findtext('wp:post_name', '', NS)
        content_raw = item.findtext('content:encoded', '', NS)
        pub_date = item.findtext('wp:post_date', '', NS)
        categories = [
            cat.text for cat in item.findall('category')
            if cat.get('domain') == 'category' and cat.text
        ]

        posts.append({
            'title': title,
            'slug': slug,
            'content_text': strip_html(content_raw),
            'date': pub_date,
            'categories': categories,
        })

    posts.sort(key=lambda p: p['date'], reverse=True)
    return posts


def extract_menus(root) -> list[dict]:
    """WordPress-Navigationsmenüs extrahieren."""
    menus = []
    for item in root.iter('item'):
        post_type_el = item.find('wp:post_type', NS)
        if post_type_el is None or post_type_el.text != 'nav_menu_item':
            continue

        title = item.findtext('title', '')
        menu_order = item.findtext('wp:menu_order', '0', NS)

        # Meta-Daten auslesen
        meta = {}
        for pm in item.findall('wp:postmeta', NS):
            key = pm.findtext('wp:meta_key', '', NS)
            val = pm.findtext('wp:meta_value', '', NS)
            if key and val:
                meta[key] = val

        menus.append({
            'title': title,
            'order': int(menu_order) if menu_order.isdigit() else 0,
            'url': meta.get('_menu_item_url', ''),
            'object': meta.get('_menu_item_object', ''),
            'parent': meta.get('_menu_item_menu_item_parent', '0'),
        })

    menus.sort(key=lambda m: m['order'])
    return menus


def extract_media(root) -> list[dict]:
    """WordPress-Medien (Bilder) extrahieren."""
    media = []
    for item in root.iter('item'):
        post_type_el = item.find('wp:post_type', NS)
        if post_type_el is None or post_type_el.text != 'attachment':
            continue

        title = item.findtext('title', '')
        url = item.findtext('wp:attachment_url', '', NS)

        if url and any(url.lower().endswith(ext) for ext in
                       ('.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif')):
            media.append({
                'title': title,
                'url': url,
            })

    return media


def generate_markdown(pages, posts, menus, media, site_title: str) -> str:
    """Strukturierte Markdown-Datei generieren."""
    lines = []
    lines.append(f"# WordPress Content-Export: {site_title}")
    lines.append(f"\n> Automatisch extrahiert mit wp_extract.py")
    lines.append(f"> Quelle: westend-hausarzt.com")
    lines.append(f"> Zweck: Content-Migration nach Juvantis Shopify (sanexio.eu)")
    lines.append("")

    # --- SEITEN ---
    lines.append("---")
    lines.append(f"\n## Seiten ({len(pages)} gefunden)\n")

    for i, page in enumerate(pages, 1):
        lines.append(f"### {i}. {page['title']}")
        lines.append(f"**Slug:** `{page['slug']}` | **Status:** {page['status']}")
        if page['excerpt']:
            lines.append(f"\n**Excerpt:** {page['excerpt']}")
        lines.append(f"\n**Inhalt:**\n")
        lines.append(page['content_text'] if page['content_text'] else "(Kein Textinhalt)")
        lines.append("\n---\n")

    # --- BEITRÄGE ---
    if posts:
        lines.append(f"\n## Blog-Beiträge ({len(posts)} gefunden)\n")
        for i, post in enumerate(posts, 1):
            lines.append(f"### {i}. {post['title']}")
            lines.append(f"**Datum:** {post['date']} | **Kategorien:** {', '.join(post['categories']) or 'Keine'}")
            lines.append(f"\n{post['content_text'][:2000]}")
            if len(post['content_text']) > 2000:
                lines.append(f"\n*[... gekürzt, {len(post['content_text'])} Zeichen gesamt]*")
            lines.append("\n---\n")

    # --- MENÜS ---
    if menus:
        lines.append(f"\n## Navigation / Menüs ({len(menus)} Einträge)\n")
        for m in menus:
            indent = "  " if m['parent'] != '0' else ""
            lines.append(f"{indent}- {m['title']} → `{m['url'] or m['object']}`")
        lines.append("")

    # --- MEDIEN ---
    if media:
        lines.append(f"\n## Medien / Bilder ({len(media)} gefunden)\n")
        for m in media:
            lines.append(f"- {m['title']}: `{m['url']}`")
        lines.append("")

    # --- MAPPING-HINWEISE ---
    lines.append("\n---\n")
    lines.append("## Content-Mapping Hinweise für Shopify\n")
    lines.append("Die folgenden WordPress-Seiten sollten wie folgt auf Juvantis/Shopify gemappt werden:\n")
    lines.append("| WP-Seite | → Shopify-Ziel | Aktion |")
    lines.append("|----------|---------------|--------|")
    lines.append("| Startseite | index.json (Homepage) | Texte übernehmen, Design neu |")
    lines.append("| Team/Über uns | page.ueber-uns | Team-Infos + Juvantis-Mission |")
    lines.append("| Leistungen | page.bluttests / page.body-checks | Aufteilen nach Kategorie |")
    lines.append("| Kontakt | page.kontakt | Übernehmen + Doctolib-Link |")
    lines.append("| Impressum | page.impressum | Sanexio GmbH Daten ergänzen |")
    lines.append("| Datenschutz | page.datenschutz | DSGVO-konform neu erstellen |")
    lines.append("")
    lines.append("*Dieses Mapping muss nach dem Export manuell geprüft und ergänzt werden.*")

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Verwendung: python3 wp_extract.py <wordpress-export.xml> [output.md]")
        print("\nExport erstellen: WordPress Admin → Werkzeuge → Export → Alle Inhalte")
        sys.exit(1)

    xml_path = Path(sys.argv[1])
    if not xml_path.exists():
        print(f"ERROR: Datei nicht gefunden: {xml_path}")
        sys.exit(1)

    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else xml_path.with_suffix('.md')

    print(f"Lese WordPress-Export: {xml_path}")
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # Site-Titel extrahieren
    channel = root.find('channel')
    site_title = channel.findtext('title', 'WordPress Site') if channel else 'WordPress Site'
    print(f"Site: {site_title}")

    pages = extract_pages(root)
    print(f"  → {len(pages)} Seiten gefunden")

    posts = extract_posts(root)
    print(f"  → {len(posts)} Beiträge gefunden")

    menus = extract_menus(root)
    print(f"  → {len(menus)} Menü-Einträge gefunden")

    media = extract_media(root)
    print(f"  → {len(media)} Bilder gefunden")

    markdown = generate_markdown(pages, posts, menus, media, site_title)

    output_path.write_text(markdown, encoding='utf-8')
    print(f"\n✓ Content exportiert nach: {output_path}")
    print(f"  Größe: {len(markdown):,} Zeichen")
    print(f"\nNächster Schritt:")
    print(f"  1. Datei prüfen und ggf. Content ergänzen")
    print(f"  2. Datei nach projects/Juvantis/_config/wp_content.md kopieren")
    print(f"  3. Claude Code Prompt starten (SHOPIFY_BUILD_PROMPT.md)")


if __name__ == '__main__':
    main()
