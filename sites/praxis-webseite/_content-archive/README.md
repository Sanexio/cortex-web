# Content-Archive — Praxis-Webseite

Ein unveränderliches Sicherungs-Archiv des kompletten Content-Stands **vor** der Cluster-weisen Kuration in Sprint 2. Angelegt durch Phase 2 von S2.3-D (Session 16, 2026-04-20).

---

## Zweck

Jede WordPress-Seite aus dem aktuellen Local-WP-Stand (nach Mojibake-Fix aus Phase 1) liegt hier als eine **Markdown-Datei mit YAML-Front-Matter und RAW-HTML-Body** vor. Das Archiv existiert aus einem einzigen Grund:

> **Dr.-Stracke-Leitprinzip (2026-04-20):** „Ich möchte es richtig und ohne Informationsverlust machen."

Jede Kurations-Entscheidung in Folge-Sessions ist damit reversibel, jede vermeintliche Text-Lücke auf der neuen Seite ist am Archiv abgleichbar, und kein Inhalt kann unabsichtlich verschwinden.

---

## Ablage-Schema

```
_content-archive/
├── README.md                           ← diese Datei
├── kern/de/<slug>-<id>.md               (7 Dateien — P0, Patientenreise Kern)
├── checkups/de/<slug>-<id>.md           (6 Dateien — P0, Check-Up-Angebote)
├── services/de/<slug>-<id>.md           (4 Dateien — P1)
├── aerzte/de/<slug>-<id>.md             (2 Dateien — P1)
├── fachrichtung/de/<slug>-<id>.md       (1 Datei — P1)
├── diagnostik/de/<slug>-<id>.md         (10 Dateien — P1)
├── legacy/de/<slug>-<id>.md             (~23 Dateien — P2)
├── i18n-dublette/
│   ├── en/<slug>-<id>.md
│   ├── fr/<slug>-<id>.md
│   ├── es/<slug>-<id>.md
│   └── unknown/<slug>-<id>.md           (gesamt ~124 Dateien — P2)
└── _status/
    ├── draft/<slug>-<id>.md             (4 Dateien — Entwürfe)
    └── private/<slug>-<id>.md           (8 Dateien — private)
```

**Regeln:**

- **Eine Page ist an genau einer Stelle.** publish+cluster-X → `<cluster>/<lang>/`; draft/private → `_status/<status>/`.
- **Dateiname:** `<slug>-<id>.md`. Das ID-Suffix schützt vor Slug-Kollisionen in WPML-Dubletten (z. B. 3× `impressum`).
- **Kein Sub-Sub-Folder.** Flache Zwei-Ebenen-Hierarchie.

---

## Datei-Format

```markdown
---
# Inventar-Spalten (1:1 aus page-inventory-full.csv)
id: 9671
slug: "praxis"
title: "Unsere Praxis"
status: "publish"
parent_id: 0
template: "template-standard.php"
wpml_lang: "de"
content_length: 2340
image_count: 0
image_source_hint: "none"
mojibake_hits_pre: 0
cluster: "kern"
priority: "P0"
trunk_candidate: "maybe"
cross_site_potential: "no"

# Extraktions-Metadaten
post_date: "2023-09-12 14:22:10"
post_modified: "2026-04-19 18:45:02"
post_excerpt: ""
menu_order: 0
post_password_protected: false
comment_status: "closed"
ping_status: "closed"

# SEO- / Plugin-Meta (Whitelist + _aioseo_*/_yoast_* Wildcard)
meta:
  _wp_page_template: "template-standard.php"
  _thumbnail_id: null
  _aioseo_title: "Unsere Praxis — Praxiszentrum Dr. Stracke"
  # …

# Bilder-Referenzen (keine Downloads in dieser Phase)
image_urls: []

# Integritäts-Contract
content_md5: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
extracted_at: "2026-04-20T21:34:12+02:00"
extractor_version: "2026-04-20_s2.3-d-p2_v1"

# Prod-URL (Best-Effort Rekonstruktion aus Slug + Parent-Chain)
prod_url_guess: "https://westend-hausarzt.com/praxis/"

# Archive-Verwaltung
archive_path: "kern/de/praxis-9671.md"
---

<!-- BODY-BEGIN — ab hier ORIGINAL post_content 1:1, keine Änderung erlaubt. content_md5 bezieht sich auf alles NACH dieser Marker-Zeile bis Dateiende (ohne finalen Newline). -->
<p>Unsere Praxis liegt mitten im Frankfurter Westend …</p>
```

---

## MD5-Integritäts-Contract

**Dreifach-Verankerung:**

1. **`content_md5` im Front-Matter** ist die MD5-Summe des `post_content`.
2. **Der Body der Datei** (alles nach der `<!-- BODY-BEGIN … -->`-Marker-Zeile) ist byteweise identisch zum `post_content` in der DB.
3. **`SELECT MD5(post_content) FROM wp_posts WHERE ID = <id>`** liefert denselben Wert.

Wenn eins der drei abweicht, ist die Datei kompromittiert. Ein Self-Check-Script im Skript-Ordner prüft das (siehe `tools/migrations/` — AK-5 und AK-6 aus der Spec).

**Body extrahieren (Shell):**

```bash
# Alles nach der Marker-Zeile:
awk '/^<!-- BODY-BEGIN/{found=1;next} found' <file>.md
```

---

## Reverse-Lookup

Suchen nach Text → Seite:

```bash
grep -rl "Ihr Suchbegriff" _content-archive/
```

Pfad aus ID:

```bash
grep -l "^id: 9671$" _content-archive/**/*.md
```

Alle Pages mit Bildern:

```bash
grep -l '^image_urls:$' _content-archive/**/*.md | \
  xargs grep -L '^image_urls: \[\]$'
```

---

## Was dieses Archiv NICHT ist

- **Keine Quelle für Live-Änderungen.** Wer Text ändern will, ändert in WordPress → `post_content` in DB wird Mojibake-frei gespeichert → neuer Extraktions-Lauf schreibt die Datei neu (content_md5 ändert sich). Nicht umgekehrt.
- **Kein Bild-Archiv.** Es enthält nur URL-Referenzen. Bilder-Download ist Phase 2b (Medien-Pipeline).
- **Keine Revisions-Historie.** Nur aktueller `post_content` pro Page. Notfall-Rollback via Phase-1-mysqldump.
- **Kein Menü-Plan, kein Navigations-Plan.** Das ist S2.4.

---

## Regenerierung

```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite
php tools/migrations/2026-04-20_s2.3-d-p2_content-extract.php
```

Idempotent: Pages ohne Content-Änderung werden übersprungen (MD5-Vergleich).

Nach Änderungen in der WP-DB (Content-Edits in WordPress selbst) neu laufen, um das Archive auf den aktuellen Stand zu ziehen. Git-Diff zeigt dann die Veränderung.

---

## Kontext

- **Spec:** `specs/sprint-2/S2.3-D_Phase2_content-extraction.md`
- **Inventar-Quelle:** `specs/sprint-2/S2.3-D/page-inventory-full.csv` (189 Zeilen)
- **Vorgänger-Phase:** S2.3-D Phase 1 (Mojibake-Fix + Inventar, Session 15)
- **Folge-Phase:** S2.3-D Phase 3 = Cluster-weise Kuration, Start bei `kern`

---

*Erzeugt: 2026-04-20 Session 16.*
