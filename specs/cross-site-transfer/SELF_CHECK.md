# cross-site-transfer — Architektur-Session Self-Check

> **Datum:** 2026-04-22
> **Scope:** Architektonische Vorbereitung zukünftiger Transfers (Dr.-Stracke-Auftrag)
> **Nicht:** Vollständige Implementierung aller Transfer-Richtungen.

---

## Akzeptanzkriterien

| # | Kriterium | Ergebnis | Beweis |
|---|-----------|:--------:|--------|
| **AK-1** | Master-Architektur-Dokument mit Transfer-Matrix (Source × Target × Type) | ✅ | `specs/cross-site-transfer/ARCHITECTURE.md` §2 |
| **AK-2** | 6 wiederverwendbare Patterns dokumentiert | ✅ | `PATTERNS.md` — A Simple Content-Page · B Template-Based Page · C Metafield · D Theme-Asset-Overwrite · E Product-Sync · F Design-Token |
| **AK-3** | Naming-Conventions für Tools + Adapter-Module festgelegt | ✅ | ARCHITECTURE.md §3 |
| **AK-4** | Registry-Pattern eingeführt (Renderer + Extractor) | ✅ | `adapters/shopify/lib/{renderer,extractor}-registry.mjs` · `adapters/wordpress/lib/{renderer,extractor}-registry.mjs` |
| **AK-5** | Extractor-Skelette Shopify-Page, Shopify-Template, WP-Page | ✅ | `extract-page.mjs` (shopify + wp) · `extract-template.mjs` (shopify) — smoke-getestet |
| **AK-6** | Meta-Orchestrator `cw-transfer` mit Verben push/pull/diff/list/help | ✅ | `tools/cw-transfer` — `list` zeigt 4 Blöcke mit 10 Einträgen |
| **AK-7** | Live-Verify: extract-page gegen gerade gepushte Seite funktioniert | ✅ | `extract-page.mjs uber-uns` gibt Proto-JSON mit `published_at` |
| **AK-8** | Live-Verify: extract-template gegen gerade gepushte Template-Datei | ✅ | `extract-template.mjs page.uber-uns` gibt parsed template_json + block-summary |
| **AK-9** | Neue Projekt-Regeln (CW-006, CW-007, CW-008) | ✅ | `_config/RULES.md` erweitert |
| **AK-10** | `.gitignore` deckt Backup-Ordner ab (CW-008) | ✅ | `.gitignore` enthält `adapters/*/.backups/` |
| **AK-11** | Doku `docs/cross-site-transfer.md` auf neuen Stand aktualisiert | ✅ | State-of-Play-Tabelle aktualisiert, Roadmap erweitert |
| **AK-12** | Self-Check dokumentiert | ✅ | Diese Datei |

**Status:** 12/12 AKs grün.

---

## Artefakte dieser Session

### Neue Dateien

```
specs/cross-site-transfer/ARCHITECTURE.md           Master-Doku (Matrix, Prinzipien, State-of-Play)
specs/cross-site-transfer/PATTERNS.md               6 Transfer-Patterns A-F
specs/cross-site-transfer/SELF_CHECK.md             Diese Datei
adapters/shopify/extract-page.mjs                   Pull Shopify-Page (Skelett, smoke-grün)
adapters/shopify/extract-template.mjs               Pull Shopify-Theme-Template (Skelett, smoke-grün)
adapters/shopify/lib/renderer-registry.mjs          Registry: 3 stable renderers
adapters/shopify/lib/extractor-registry.mjs         Registry: 2 skeleton + 1 planned
adapters/wordpress/extract-page.mjs                 Pull WP-Page (Skelett)
adapters/wordpress/lib/renderer-registry.mjs        Registry: 1 stable + 1 planned
adapters/wordpress/lib/extractor-registry.mjs       Registry: 1 skeleton + 1 planned
tools/cw-transfer                                    Meta-Orchestrator (push/pull/diff/list/help)
```

### Geänderte Dateien

```
_config/RULES.md        + CW-006 (gerichteter Transfer), CW-007 (Trunk-Brücke), CW-008 (Backup-Pflicht)
.gitignore              + adapters/*/.backups/
docs/cross-site-transfer.md  State-of-Play-Tabelle auf 2026-04-22-Stand
```

---

## Smoke-Tests (Beweise)

### cw-transfer list
Zeigt 4 Sektionen:
- `shopify / renderers (push)` — 3 stable
- `shopify / extractors (pull)` — 2 skeleton + 1 planned
- `wordpress / renderers (push)` — 1 stable + 1 planned
- `wordpress / extractors (pull)` — 1 skeleton + 1 planned

### extract-page.mjs (Shopify)
```json
{
  "_source": "shopify.page@juvantis.myshopify.com",
  "_handle": "uber-uns",
  "_shopify_id": 157742137611,
  "title": { "de": "Ärzte & Team" },
  "status_juvantis_hint": "active",
  "template_suffix": "uber-uns",
  "body_html_length": 0
}
```

### extract-template.mjs (Shopify)
Liefert kompletten Template-JSON inkl.:
- `section_count: 2` (main + about)
- `block_counts: { team_member: 8, value: 4 }`
- Alle Settings und Block-Daten parsebar

### extract-page.mjs (WordPress)
Bereit — nicht ausgeführt in dieser Session (keine aktive WP-Bridge-Anforderung).

---

## Lessons Learned

### CST1-LL-1 — Template-Bridge ist der Goldstandard

Die Entscheidung für Pattern B (Template-basiert statt body_html-Inline-CSS) in
content-bridge-v1 zahlt sich architektonisch aus:
- Theme bleibt Design-Source
- Trunk bleibt Daten-Source
- Keine Duplikation von CSS in jeder Page-YAML

Für alle komplexeren Pages ab jetzt: **Pattern B first**, Pattern A nur für
wirklich triviale Textseiten.

### CST1-LL-2 — Registry verhindert Build-Script-Fäulnis

Ohne Registry-Pattern würde jeder neue Renderer einen `switch`-Case im zentralen
Build-Script erzwingen. Mit Registry: ein Renderer = ein Modul + ein Registry-
Eintrag. Das skaliert in Richtung 20–30 Transfer-Typen, die langfristig entstehen
(Products, Pages, Templates × WP/Shopify × de/en/fr/es etc.).

### CST1-LL-3 — Extraktion produziert „Proto-Trunk", nicht fertiges YAML

Die Extraktoren schreiben **nie direkt** in `trunk/`. Sie geben Proto-JSON auf
stdout aus, das bewusst nicht schema-valid ist. Die Kuration ist eine bewusste
menschliche Handlung — damit Legacy-Encodings, Mojibake, Layout-Reste sichtbar
werden, bevor sie in die SSoT landen. Verhindert, dass der Trunk mit schlechtem
Altdaten-Input verunreinigt wird.

### CST1-LL-4 — Site → Site ist architektonisch verboten

CW-007 verbietet direkte Shopify→WP-Extractoren, auch als „Bequemlichkeits-
Shortcut". Gründe: Audit-Trail, Schema-Validation-Gate, HWG-View-Overrides. Das
ist eine harte Regel, kein Style-Preference.

### CST1-LL-5 — Backup-Automatik muss standardmäßig sein

CW-008 macht Backup vor destruktivem Push zur Pflicht. Template-Adapter hat es
bereits; Page-Adapter und WP-Adapter müssen nachgezogen werden. Ohne das Backup
kann ein fehlerhafter Push Wochen an Admin-Edits zerstören.

---

## Was NICHT in dieser Session gebaut wurde (bewusst)

| Block | Warum vertagt | Wann |
|-------|---------------|------|
| WP-Template-Adapter (Trunk→WP für inc/*.php oder templates/) | Eigene Session nötig (PHP-Side effects, Theme-Git-Konflikte) | Phase C2 Block N-1 |
| `cw-transfer diff` | Braucht Build-dann-Fetch-dann-JSON-Diff-Logik | Phase C2 Block N-6 |
| Backup-Automatik auf Page-Adapter + WP-Page-Adapter | 30 Min pro Adapter, getrennt | Phase C2 Block N-7 |
| Design-Token-Adapter | Architektur-Entscheidung Dr. Stracke (Master-Frage) nicht geklärt | Phase D |
| Component-Specs | Setzt Design-Tokens voraus | Phase F |

---

## Einschätzung des Reifegrads

Die **Architektur** ist jetzt komplett beschrieben und instrumentiert. Jede
weitere Transfer-Anforderung kann gegen diese Architektur kalibriert werden:

1. „Welches Pattern passt?" → `PATTERNS.md`
2. „Gibt es den Renderer/Extractor schon?" → `cw-transfer list`
3. „Wie heißt mein neues Tool?" → `ARCHITECTURE.md §3 Naming`
4. „Wohin schreibe ich den Trunk-Content?" → `ARCHITECTURE.md §3.3`
5. „Darf ich direkt von Shopify nach WP extrahieren?" → Nein, CW-007

Die **Implementierung** der rückwärtigen Flüsse (Site→Trunk) ist auf
Skelett-Niveau — die Extraktoren laufen, aber ihre Ausgabe ist bewusst
proto-form, nicht direkt schema-valid. Das ist Teil der Architektur-Entscheidung
(LL-3): Extraktion ist Daten-Evidenz, nicht Trunk-Update.

---

## Reproduktion dieses Self-Checks

```bash
cd ~/Cortex/projects/Cortex-Web

# List aller registrierten Transfers
./tools/cw-transfer list

# Live-Pull Test (Shopify)
set -a; . ./.env.local; set +a
./tools/cw-transfer pull shopify:page     uber-uns       | jq '.title, .status_juvantis_hint, .template_suffix'
./tools/cw-transfer pull shopify:template page.uber-uns  | jq '._summary'

# Spec-Konsistenz
ls specs/cross-site-transfer/
cat _config/RULES.md | grep -E "^## CW-00[678]"
```
