# Cortex-Web — Projekt-Regeln

> Ergänzt die Nexus-Regeln (`Nexus/_rules/GLOBAL_RULES.md` LL-001…LL-043+).
> CW-001 bis CW-005 sind in Phase 0 definiert; weitere werden beim POC ergänzt.

---

## CW-001 — Trunk ist Master (Single Source of Truth)

**Regel:** Änderungen an Content, Design-Tokens, Komponenten-Specs und Medien-Metadaten
werden IMMER im Trunk (`trunk/`) vorgenommen. Niemals direkt in einer Site.

**Warum:** Zwei Orte = Divergenz. Wenn ein Produkt im Shopify-Admin geändert wird
und gleichzeitig im Trunk steht, entstehen widersprüchliche Wahrheiten. Der Adapter
kann das nicht auflösen.

**Wie anwenden:**
- Edit → `trunk/<pfad>`
- `bash tools/validate.sh`
- `bash tools/sync-<plattform>.sh`
- Verify über Puppeteer/Visual-Diff vor Deploy

**Ausnahmen:** Plattform-spezifische Settings (Shopify-Payment-Provider, WP-Security-Plugins)
bleiben in der jeweiligen Plattform und werden NICHT im Trunk abgebildet.

---

## CW-002 — Schema-Validation vor Build

**Regel:** Kein Adapter-Build läuft, ohne dass vorher alle Content-Dateien gegen
ihr JSON-Schema validiert wurden.

**Warum:** Fehlende Pflichtfelder, falsche Datentypen, inkonsistente Locale-Abdeckung
führen zu brüchigen Renderings. Fail fast ist billiger als Fail late.

**Wie anwenden:**
- `tools/validate.sh` läuft AJV gegen alle YAML-/MD-Files in `trunk/content/`
- Bei Verletzung: Adapter stoppt, Fehler wird genannt
- Pre-Commit-Hook (optional) verhindert Commit bei Schema-Fehler

---

## CW-003 — Lokale Originale pflichtig (Medien-Sicherheitsnetz)

**Regel:** Jedes Medium, das in Shopify Files hochgeladen wird (M-3c), MUSS gleichzeitig
eine lokale Kopie in `_media-source/<kategorie>/<dateiname>` haben.

**Warum:**
1. Eigentumsbeweis: Bilder/Rechte liegen nachweisbar bei Dr. Stracke / Sanexio, nicht nur bei Shopify.
2. Migration vorbereitet: Bei Umzug auf M-3d (NAS) wird aus `_media-source/` direkt gespiegelt.
3. Ausfallsicherheit: Shopify-Ausfall ≠ Verlust der Originale.

**Wie anwenden:**
- `tools/media/register.mjs <datei>` kopiert in `_media-source/`, lädt zu Shopify Files
  hoch und trägt Eintrag in `trunk/media/registry.yaml`
- `_media-source/` ist git-ignoriert (siehe `.gitignore`), wird separat gesichert (GDrive/NAS)

---

## CW-004 — I18n I-2 hybrid

**Regel:** Content-Schemas trennen sprach-invariante Felder (Top-Level) und
mehrsprachige Felder (verschachtelt unter `.de/.en/.fr/.es`).

**Warum:** CMS-Zukunft (Directus/Decap), validierbare Übersetzungs-Abdeckung,
gängiger Industriestandard.

**Wie anwenden:**
- Sprach-invariant (Top-Level): IDs, SKUs, Preise, Medien-Keys, Kategorien, Flags
- Mehrsprachig (verschachtelt): Titel, Beschreibungen, CTA-Labels, SEO-Meta
- Default-Locale: `de` (Pflicht). `en/fr/es` optional; Adapter rendert dann nur `de`.
- JSON-Schema erzwingt Präsenz von `.de` für alle mehrsprachigen Felder.

---

## CW-005 — Plattform-Trennung bleibt bestehen

**Regel:** Die beiden Sites sind und bleiben rechtlich, organisatorisch und
markentechnisch getrennt. Der Trunk teilt nur Substanz, keine Identität.

**Warum:** Praxis = Dr. Stracke (freier Beruf, §4 Nr. 14 UStG, HWG §11, Berufsordnung §27 LÄK Hessen).
Juvantis = Sanexio GmbH (gewerblich, umsatzsteuerpflichtig, kommerzielle Werbung erlaubt).
Vermischung = rechtliches Risiko (Abmahnung, steuerliche Einordnung, Berufsrecht).

**Wie anwenden:**
- Jede Site hat EIGENES Impressum, EIGENE DSGVO, EIGENE AGB (im Trunk als separate Dateien)
- KEINE gemeinsame Kasse, KEINE gemeinsamen Nutzerkonten
- Adapter-Views respektieren HWG-Konformität der Praxis-Seite:
  - `views.praxis.show_price: false` ist Pflicht für Produkte
  - Kauf-CTA ist auf Praxis-Site verboten, nur Info-Links auf sanexio.eu erlaubt
- Bei Produkt-Neuanlage: beide Views (`juvantis`, `praxis`) sind explizit zu definieren
- Cross-Links zwischen Sites sind erlaubt, aber als „Partnerinfo" / „Mehr erfahren" zu markieren

---

## Weitere Regeln (wachsen beim POC)

- CW-006+ werden bei Phasen 1/2 (POC) ergänzt, sobald die Adapter-Realität
  weitere Pattern zeigt (z. B. Cache-Buster-Strategie, Adapter-Idempotenz,
  Medien-Upload-Dedupe, o. ä.).
