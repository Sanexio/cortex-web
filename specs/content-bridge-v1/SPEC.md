# content-bridge-v1 — Explizite gerichtete Content-Übertragung

> **Status:** Entwurf zur Umsetzung
> **Freigabe:** Dr. Stracke, 2026-04-22 ("Variante 2, direkt umsetzen")
> **Architekten-Phase:** 2 (Lösungsdesign) → 3 (Umsetzung)

---

## 1. Ziel

Dr. Stracke möchte **manuell, explizit** Content von einer der beiden Seiten auf die
andere übertragen können. Kein Auto-Sync, keine Bidirektionalität — sondern ein
gerichteter Build: „nimm den Team-Inhalt der Praxis-Webseite und rendere ihn
jetzt als `/pages/uber-uns` auf sanexio.eu".

Perspektivisch soll das gleiche Muster für Content **und** Design **und** Funktion
funktionieren. Dieser Spec deckt nur **Content** ab. Design/Funktion kommen in
Folge-Specs (`cross-site-transfer-v2`, v3).

Konkreter Erst-Anwendungsfall:

| Quelle | Ziel | Inhalt |
|--------|------|--------|
| WP `/team/` (Theme `praxiszentrum`, `inc/team-data.php` + Page-Template) | Shopify `sanexio.eu/pages/uber-uns` | Intro-Text + 8-Ärzte-Grid |

---

## 2. Strategie (CW-001-kompatibel)

**Variante 2 aus Dr. Strackes Entscheidung 2026-04-22:**
Content wird nicht direkt Site→Site kopiert, sondern via **Trunk** gereicht. Der
Trunk wird zur Single Source of Truth für das Team-Roster. Jeder Adapter-Lauf
rendert den aktuellen Trunk-Zustand auf die jeweilige Zielplattform.

```
   [WP /team/ heute]                    [Shopify /pages/uber-uns heute]
         │                                          │
         │ (1) Extraktion in Trunk (Einmal-Pass)   │
         ▼                                          │
   [trunk/content/team/*.yaml]                      │
   [trunk/content/pages/_shared/ueber-uns.yaml]     │
         │                                          │
         │ (2) Shopify-Page-Adapter                 │
         └────────────────────────►─────────────────┘
         │
         │ (3) WP-Page-Adapter (optional, später)
         ▼
   [WP /team/ bleibt vorerst unberührt — Theme-Template-Logik]
```

**Warum WP `/team/` in diesem Sprint nicht re-migriert wird:**
Das WP-Theme hat bereits eine funktionierende Darstellung mit dynamischen Helpern
(`pxz_render_other_doctors`, Brand-Switch via `pxz_is_sanexio_uri`). Diese
Template-Funktion jetzt durch statischen Trunk-Content zu ersetzen wäre eine
separate Migration. Sie kommt in einem späteren Sprint. Für diese Session ist
der **Trunk die SSoT für Content**, aber das WP-Rendering bleibt Template-gesteuert.

---

## 3. Umfang (Scope)

### In Scope (diese Umsetzung)

1. **Trunk-Content:**
   - `trunk/content/team/*.yaml` — 1 YAML pro Arzt (8 Stück, Stracke + 7 Stubs)
   - `trunk/content/pages/_shared/ueber-uns.yaml` — Page-Definition mit Intro + Team-Grid-Referenz
2. **Schema-Konkretisierung:**
   - `trunk/schema/team-member.schema.json` — reales Schema
   - `trunk/schema/page.schema.json` — reales Schema mit `sections[]`
3. **Shopify-Page-Adapter (neu):**
   - `adapters/shopify/build-page.mjs` — YAML-Lader, Schema-Validator, Renderer-Dispatcher
   - `adapters/shopify/pages-to-shopify.mjs` — REST-Push (`/admin/api/<v>/pages.json`)
   - `adapters/shopify/lib/renderers/page-juvantis.mjs` — Page+Sections→Shopify-HTML
4. **Tool:**
   - `tools/sync-page-shopify.sh` — validate + build + push
5. **Deploy:**
   - Shopify-Page `uber-uns` angelegt/aktualisiert, published=false (entspricht CW-001 Roundtrip-Prinzip)
6. **Verify:**
   - `GET /admin/api/<v>/pages.json?handle=uber-uns` → genau 1 Treffer, Titel + Inhalt korrekt
   - HTML enthält alle 8 Arzt-Namen + Intro-Text

### Out of Scope (Folge-Specs)

- WP `/team/` von Template-Logik auf Trunk-Content umstellen
- Design-Übertragung (Component-Specs, Liquid-Sections)
- Funktions-Übertragung (Template-Logik, Helper-Pendants)
- Auto-Sync oder Webhooks
- Media-Registry für Arzt-Fotos (derzeit alle image_id=0 → Initialen-Avatar)

---

## 4. Datenmodell

### 4.1 Team-Member (`trunk/content/team/<slug>.yaml`)

```yaml
id: dr-stracke                    # stable key, entspricht slug
slug: dr-stracke                  # URL-slug
name: "Dr. med. Siegbert Stracke, MBA"
role:
  de: "Facharzt für Innere Medizin · Praxisinhaber"
languages: [de, en]
intro:
  de: |
    Schwerpunkt Innere Medizin …
accent: red                       # red | amber | ink
image: null                       # perspektivisch media://dr-stracke-portrait
```

### 4.2 Page mit Sections (`trunk/content/pages/_shared/ueber-uns.yaml`)

```yaml
id: ueber-uns
site: shared
slugs:
  praxis: team                    # WP-Slug
  juvantis: uber-uns              # Shopify-Handle
title:
  de: "Ärzte & Team"
status_juvantis: draft            # CW-001 Roundtrip-konform
sections:
  - type: intro
    heading:
      de: "Unsere Praxisgemeinschaft"
    body_md:
      de: |
        Acht Ärztinnen und Ärzte …
  - type: team-grid
    members: all                  # "all" oder Liste von slugs
```

### 4.3 Renderer-Verhalten (Juvantis-View)

Der Renderer produziert **semantisches HTML** für `body_html` der Shopify-Page.
Stil-Klassen werden mit Präfix `pxz-uber-*` versehen, sodass sie im
Sanexio-Shopify-Theme später gezielt gestylt werden können. Das Theme bleibt für
diesen Sprint **unberührt** — Darstellung erfolgt mit Theme-Default-Styling plus
inline minimalen Styling-Helpern.

---

## 5. Akzeptanzkriterien (AKs)

| # | Kriterium | Prüfweg |
|---|-----------|:-------:|
| **AK-1** | 8 `team/*.yaml` existieren, schema-valide | `bash tools/validate.sh` |
| **AK-2** | `ueber-uns.yaml` existiert, schema-valide | `bash tools/validate.sh` |
| **AK-3** | `team-member.schema.json` ist konkretisiert (required-Felder erweitert) | File-Diff gegen Platzhalter |
| **AK-4** | `page.schema.json` mit `sections[]`-Support | File-Diff gegen Platzhalter |
| **AK-5** | `build-page.mjs` liest YAML → validiert → stdout-JSON-Payload | `bun adapters/shopify/build-page.mjs trunk/content/pages/_shared/ueber-uns.yaml \| jq .` |
| **AK-6** | `pages-to-shopify.mjs` POST/PUT idempotent via handle=`uber-uns` | Lauf 1 = create oder update, Lauf 2 = update ohne Error |
| **AK-7** | `sync-page-shopify.sh` orchestriert die 3 Schritte erfolgreich | Exit-Code 0 |
| **AK-8** | Shopify-Page existiert nach Push, API-Lookup liefert 1 Treffer | `curl … /admin/api/<v>/pages.json?handle=uber-uns` |
| **AK-9** | `body_html` der Page enthält alle 8 Arzt-Namen und den Intro-Text | Grep gegen API-Response |
| **AK-10** | Page ist `published_at: null` (Draft, CW-001) | API-Response-Feld |
| **AK-11** | Idempotenz-Beweis: zwei aufeinanderfolgende Läufe → `updated_at` ändert sich, sonst keine Drift | Vergleich Lauf 1 vs. Lauf 2 |
| **AK-12** | Self-Check dokumentiert in `specs/content-bridge-v1/SELF_CHECK.md` | File existiert |

---

## 6. Perspektivische Erweiterung (nicht in dieser Umsetzung)

Wird in folgender Struktur angelegt, damit der Erweiterungspfad transparent ist,
aber nicht implementiert:

- `docs/cross-site-transfer.md` — Überblick über das Muster (was Content / Design /
  Funktion jeweils bedeutet, welche Mechanismen sie brauchen).

Das ist genug, um Dr. Stracke später zu zeigen: „hier läuft der nächste Schritt".

---

## 7. Risiken & Annahmen

| # | Risiko | Mitigation |
|---|--------|:----------:|
| R-1 | Shopify-Site ist passwortgeschützt (Coming-Soon). | Kein Problem — Admin-API ist unabhängig von Storefront-Passwort. Dr. Stracke sieht die Page nach Login. |
| R-2 | Handle `uber-uns` ist schon belegt. | Adapter erkennt via Lookup und geht in Update-Pfad. |
| R-3 | Renderer-HTML passt nicht zum Shopify-Theme-Stil. | Für diesen Sprint akzeptabel — Styling kommt in Design-Transfer-Spec. HTML ist semantisch korrekt. |
| R-4 | WP `/team/` und Trunk driften auseinander. | Dokumentiert in §2 — Trunk ist ab jetzt SSoT; WP-Template-Rendering muss in Folge-Sprint nachgezogen werden. |

---

## 8. Freigabe & nächster Schritt

Dr. Stracke hat die Umsetzung am 2026-04-22 freigegeben ("Variante 2, direkt
umsetzen"). Nach Abschluss der 12 AKs: Self-Check-Dokument + Kurz-Demo, dann
Dr. Stracke gibt Feedback, was am Output (HTML, Layout, Struktur) noch
angepasst werden soll — genau dieses Feedback-Zyklen sind der Zweck des Tests.
