# Finale Entscheidungen — Cortex-Web Aufbau
## Entscheidungs-Protokoll Dr. Stracke, 2026-04-18

> **Vorgänger:** `00_BRAINSTORMING_KONZEPT.md` + `01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md`
> **Status:** Alle Entscheidungen getroffen. Umsetzung wartet auf finales Go von Dr. Stracke.
> **Architektur-Modus-Phase:** Ende Phase 2 (Lösungsdesign), bereit für Phase 3 (Umsetzung).

---

## 1. Entscheidungs-Matrix (chronologisch)

| # | Frage | Entscheidung | Begründung Dr. Stracke |
|---|-------|:------------:|------------------------|
| F2 | Praxis-Site kommerziell? | Nein — abgewandelte Produkte ohne Preis/Anpreisen | HWG-konform |
| F3 | FTP-Ausfall = Auslöser? | Nein, nur Anlass | Keine Panik-Migration |
| F4/F6 | Pflege durch Dr. Stracke, minimaler Betrieb | Ja | Bootstrapped, Alleingründer |
| Plattform | P1 (WP bleiben) oder P3 (Hybrid) | **P1 mit Option auf P3 pro Produkt** | Common Trunk macht beide äquivalent |
| Bridge-Prinzip | Runtime-Webhook vs. Build-Pipeline | **Common Trunk = Build-Pipeline** | Plattform-Unabhängigkeit |
| G1 / N1 | Name + Struktur-Rolle | **Cortex-Web** als Dach-Projekt | Passt ins Cortex-Ökosystem |
| G2 | CMS-Layer | Später (Directus/Decap-Option offen); Start mit direkten YAML/MD-Edits + Claude als Editor-Partner | Pragmatik |
| G3 / N3 | Medien-Strategie | **M-3c Shopify Files als Master** + lokale `_media-source/` als Backup → perspektivisch M-3d (NAS) | Null neue Infra, Migrations-Pfad definiert |
| G4 / N4 | Mehrsprachigkeit-Schema | **I-2 hybrid**: Top-Level sprach-invariant, Unter-Felder `.de/.en/.fr/.es` | CMS-/Validierungs-Freundlichkeit |
| G5 / N5 | Trunk-Tiefe | **Maximal** (inkl. UI-Komponenten-Specs) | Zukunftsfähigkeit + Figma-Code-Connect-Option |
| N2 | Struktur-Variante | **S-A Vollständige Subsumierung** (Sites unter Cortex-Web) | Klare Hierarchie |

---

## 2. Struktur — Cortex-Web Ziel-Architektur

```
~/Cortex/projects/Cortex-Web/
├── CLAUDE.md                             Projekt-Kontext für Claude
├── PROJECT.md                            Container-Manifest (Nexus-Standard)
├── README.md                             Onboarding Dr. Stracke
├── CHANGELOG.md                          Semver-Verlauf
├── SESSION_RESUME.md                     LL-042/043 Standard-Einstieg
├── package.json                          Bun-basiert (wie praxis-redesign)
├── bun.lock
├── .gitignore                            _media-source/ git-ignoriert
│
├── _config/
│   ├── RULES.md                          Projekt-Regeln (CW-001…)
│   ├── FEHLERPROTOKOLL.md
│   └── WORKFLOW_CHECKLIST.md
│
├── trunk/                                ← PLATTFORM-UNABHÄNGIG
│   ├── content/
│   │   ├── pages/
│   │   │   ├── _shared/                  auf beiden Sites
│   │   │   │   ├── partnerpraxis-westend.md
│   │   │   │   └── dht-erklaerung.md
│   │   │   ├── praxis/
│   │   │   │   ├── home.md
│   │   │   │   ├── team.md
│   │   │   │   └── ...
│   │   │   └── juvantis/
│   │   │       ├── home.md
│   │   │       └── ...
│   │   ├── products/
│   │   │   └── bluttests/
│   │   │       ├── basic-check.yaml
│   │   │       └── ...
│   │   ├── team/
│   │   │   └── dr-stracke.yaml
│   │   └── legal/
│   │       ├── impressum-praxis.md
│   │       ├── impressum-sanexio.md
│   │       └── datenschutz-bausteine.md
│   │
│   ├── design/
│   │   ├── tokens.json                   Maschinenlesbar (Schema-validiert)
│   │   ├── tokens.css                    Human-lesbar (kommt aus praxis-redesign v2.7.5)
│   │   ├── tokens-praxis.json            Praxis-Brand-Overrides
│   │   ├── tokens-juvantis.json          Juvantis-Brand-Overrides
│   │   └── components/                   MAXIMAL-TRUNK (N5)
│   │       ├── card/
│   │       │   ├── spec.md               Props, States, A11y
│   │       │   ├── reference.html        Browser-testable Referenz
│   │       │   └── tokens.json           Komponenten-lokale Tokens
│   │       ├── hero/
│   │       ├── pricing-table/
│   │       ├── team-card/
│   │       └── ...
│   │
│   ├── media/
│   │   └── registry.yaml                 Key → Master-URL + Meta
│   │
│   └── schema/
│       ├── page.schema.json
│       ├── product.schema.json
│       ├── team-member.schema.json
│       ├── component.schema.json
│       └── media.schema.json
│
├── _media-source/                        ← LOKALE ORIGINALE (git-ignoriert)
│   ├── logos/
│   ├── produkte/
│   └── ...                               → perspektivisch zu NAS gespiegelt
│
├── adapters/                             ← PLATTFORM-SPEZIFISCH
│   ├── wordpress/
│   │   ├── build.mjs                     Haupt-Renderer
│   │   ├── content-to-wp-pages.mjs       WP-CLI-basiert
│   │   ├── tokens-to-wp-css.mjs
│   │   ├── components-to-partials.mjs
│   │   ├── media-upload-to-wp.mjs        Medien aus Registry → WP-Media
│   │   └── README.md
│   ├── shopify/
│   │   ├── build.mjs
│   │   ├── products-to-shopify.mjs       Admin-API
│   │   ├── pages-to-shopify.mjs
│   │   ├── tokens-to-liquid.mjs
│   │   ├── components-to-sections.mjs
│   │   ├── media-upload-to-shopify.mjs   Medien → Shopify Files
│   │   └── README.md
│   └── ios/                              Platzhalter für Zukunft
│       └── README.md
│
├── tools/
│   ├── validate.sh                       Schema-Validation (alles)
│   ├── verify.sh                         Visual Regression (aus praxis-redesign übernommen)
│   ├── sync-wp.sh                        WP-Adapter + Deploy
│   ├── sync-shopify.sh                   Shopify-Adapter + Push
│   ├── sync-all.sh                       Beide in einem Rutsch
│   ├── watch.sh                          Auto-Rebuild bei Trunk-Änderung
│   └── media/
│       ├── register.mjs                  Neue Datei aus _media-source/ hochladen + in Registry eintragen
│       └── migrate-to-nas.mjs            Später: M-3c → M-3d
│
└── sites/                                ← SUBSUMIERTE PROJEKTE (Sprint-Verschieb-Ziel)
    ├── praxis-webseite/                  ← ex projects/praxis-redesign/
    │   └── [bestehende Struktur bleibt]
    └── juvantis-webseite/                ← ex projects/Juvantis/juvantis-web/
        └── [bestehende Struktur bleibt]
```

---

## 3. Schema-Entwürfe

### 3.1 Produkt-Schema (Kernbeispiel für I-2 hybrid)

```yaml
# trunk/content/products/bluttests/basic-check.yaml

# === SPRACH-INVARIANTE FELDER (Top-Level) ===
id: basic-check                           # stable key, never changes
sku: JVT-BLD-001                          # Shopify-SKU
category: bluttests
status: active                            # active | draft | archived
price_eur: 99                             # Juvantis-Preis, Praxis-Adapter ignoriert

images:
  hero: media://basic-check-hero          # löst in Registry auf
  gallery:
    - media://basic-check-sample-1
    - media://basic-check-sample-2

parameters:                               # 15 Laborwerte — invariant
  - code: HGB
    einheit: "g/dl"
  - code: WBC
    einheit: "/µl"

# === MEHRSPRACHIGE FELDER (I-2 verschachtelt) ===
title:
  de: "Basis-Bluttest"
  en: "Basic Blood Check"
  fr: "Analyse sanguine de base"
  es: "Análisis de sangre básico"

tagline:
  de: "Der kompakte Gesundheitscheck."
  en: "The compact health check."

beschreibung:
  de: |
    Kleiner Laborcheck mit 15 Parametern. Abnahme in der Praxis,
    Ergebnis innerhalb von 48 Stunden.
  en: |
    Small lab check with 15 parameters. Blood drawn in-practice,
    results within 48 hours.

# === ADAPTER-VIEWS (HWG-Logik, aus 00-Dokument) ===
views:
  juvantis:
    show_price: true
    cta_label:
      de: "Jetzt buchen"
      en: "Book now"
    cta_url: "/products/basic-check"

  praxis:
    show_price: false                     # HWG-konform
    headline_override:                    # optional: anderer Titel auf Praxis-Site
      de: "Laborcheck Basis — Informationen"
    cta_label:
      de: "Mehr erfahren auf sanexio.eu"
      en: "More at sanexio.eu"
    cta_url: "https://sanexio.eu/products/basic-check"
```

### 3.2 Medien-Registry-Schema

```yaml
# trunk/media/registry.yaml

basic-check-hero:
  master_backend: shopify_files           # M-3c
  master_url: https://cdn.shopify.com/s/files/1/XXXX/basic-check-hero.jpg
  backup_local: _media-source/produkte/basic-check/hero.jpg
  uploaded: 2026-04-18
  rechte: "© Sanexio GmbH, interner Shoot 2026-04"
  alt:
    de: "Blutentnahme in der Praxis Dr. Stracke"
    en: "Blood draw at Dr. Stracke's practice"
  sites:
    juvantis: auto-synced                 # aus master_url ziehen
    praxis: auto-synced                   # Adapter lädt zu WP-Media hoch → lokale URL

logo-praxis:
  master_backend: shopify_files
  master_url: https://cdn.shopify.com/s/files/1/XXXX/logo-praxis.svg
  backup_local: _media-source/logos/logo-praxis.svg
  uploaded: 2026-02-15
  rechte: "Eigentum Praxis Dr. Stracke & Kollegen"
  alt:
    de: "Logo Praxiszentrum Dr. Stracke und Kollegen"
  sites:
    juvantis: none                        # nutzt Juvantis-Logo, nicht Praxis-Logo
    praxis: auto-synced
```

### 3.3 Komponenten-Spec-Schema (Maximal-Trunk N5)

```markdown
# trunk/design/components/card/spec.md

## Card

Wiederverwendbare Inhalts-Karte für Produkt-Vorschau, Team-Mitglied, Fachrichtung.

### Props
| Name | Typ | Pflicht | Beschreibung |
|------|-----|:-------:|--------------|
| title | string | ✔ | Kartenüberschrift |
| body | string (md) | ✔ | Kurzbeschreibung, max 300 Zeichen |
| icon | media-key | – | Optional, media://... |
| cta_label | string | – | Button-Text |
| cta_url | url | – | Button-Ziel |
| variant | enum(default\|dark\|outlined) | – | Default: `default` |

### States
- default, hover, focus-visible, disabled

### A11y
- Button muss `aria-label` haben, wenn cta_label leer
- Kontrast dark-Variante: ≥ 4.5:1 (AA)

### Tokens
Liegen in `tokens.json` (Komponente nutzt `--card-padding`, `--card-radius`)

### Adapter-Rendering
- WordPress: Template-Partial `template-parts/card.php`
- Shopify: Section-Snippet `snippets/card.liquid`
- iOS: SwiftUI View `Card.swift` (später)
```

---

## 4. Migrationsplan — von S-A ist S-A mit Subsumierung (Ihrer Wahl)

### 4.1 Reihenfolge (keine Datenverschiebung ohne Einzel-Freigabe)

| Phase | Was passiert | Risiko | Ihr Go nötig |
|-------|--------------|:------:|:----:|
| **0. Skelett** | `projects/Cortex-Web/` anlegen; Ordner + Konfig + leere Schemas | Null | ✔ |
| **1. POC Minimal** | 1 Produkt in Trunk, minimaler WP-Adapter, rendert 1 Seite auf Praxis-Local | Null (neben bestehendem WP-Theme) | ✔ |
| **2. POC Erweiterung** | Shopify-Adapter für dasselbe Produkt; Medien-Registry + 2 Beispiel-Medien | Gering | ✔ |
| **3. Entscheidung Weitermachen** | Review: trägt der Ansatz? | – | ✔ |
| **4. Subsumierung Praxis** | `praxis-redesign/` → `Cortex-Web/sites/praxis-webseite/` verschieben; Pfad-Referenzen + MEMORY.md + devices.json mitziehen | Mittel | ✔ |
| **5. Subsumierung Juvantis-Web** | `Juvantis/juvantis-web/` → `Cortex-Web/sites/juvantis-webseite/`; Juvantis-Kern (DHT, Social-Media) bleibt als `projects/Juvantis/` | Mittel | ✔ |
| **6. Shared migrieren** | `Juvantis/_shared/` → `Cortex-Web/trunk/content/_shared/` + Registry | Gering | ✔ |
| **7. Komponenten-Ausbau** | Maximal-Trunk: bestehende Liquid-Sections als Component-Specs abbilden | Groß (viele Sections) | ✔ mehrfach |

### 4.2 Wichtig: bestehende Git-Historien

`praxis-redesign/` hat lokales Git (Docs-Repo seit Sprint 0 / S0.1). `Juvantis/juvantis-web/` ist Git-Klon von `shopify-theme` Branch.
→ Bei Phase 4/5 wird **git mv** verwendet (nicht cp/rm), damit History erhalten bleibt. Remote-Branches werden ggf. neu gepusht.

---

## 5. Was ich als nächstes TUN würde (auf Ihr Go warten)

### Sofort, heute, ca. 30 Min:
1. `projects/Cortex-Web/` anlegen (leeres Skelett + `_config/` + README + PROJECT.md)
2. Nexus-Pflichtdateien: CLAUDE.md, SESSION_RESUME.md
3. `MEMORY.md` um Cortex-Web ergänzen (neues aktives Projekt)
4. `devices.json` um Cortex-Web unter `Cluster-Mini-02` ergänzen
5. Ersten Commit machen

### In separater Session (Sprint T1 — POC WP-Adapter):
6. Schema-Entwürfe implementieren
7. EIN Produkt (z.B. `basic-check.yaml`) händisch schreiben
8. Minimal-Adapter, der aus YAML eine WP-Page generiert
9. Test gegen lokale WP: Seite erscheint mit Trunk-Content

### In Folge-Session (Sprint T2 — POC Shopify):
10. Gleiches Produkt über Shopify-Adapter rendern
11. Medien-Registry mit ersten Einträgen
12. Parität beweisen

---

## 6. Offene Langfrist-Themen (nicht POC-relevant)

- **CMS-Layer (G2):** Directus/Decap später auf dem Trunk als Editor-UI
- **Figma Code Connect:** Component-Specs aus Figma sync'en
- **Legacy-Seiten-Migration (172):** Aus WP-Export → Trunk-Content, parallel zu Sprint 2b
- **Suchfunktion über Trunk:** Volltextsuche auf der Quelle, nicht auf den Sites
- **iOS-Adapter:** Wenn DHT-App Produktlisten braucht, kommen sie aus Trunk
- **Multi-Partner-Praxis-Skalierung:** Neuer Partner → neues `sites/partner-X/` + eigener Adapter-Lauf

---

## 7. Aktualisierungen in bestehenden Dateien (nach Freigabe)

| Datei | Was wird aktualisiert |
|-------|----------------------|
| `Nexus/_memory/MEMORY.md` | Cortex-Web als aktives Projekt ergänzen; praxis-redesign-Sprint-Plan aktualisieren |
| `Nexus/CLAUDE.md` | Projekt-Sektion "Cortex-Web" einfügen |
| `Nexus/.config/devices.json` | Cortex-Web unter Cluster-Mini-02 |
| `Nexus/SYSTEM_MAP.md` | Struktur-Update |
| `projects/praxis-redesign/_rules/ARCHITECTURE.md` | Sprint T0-T3 ergänzen, Sprint 2 parallel |
| `projects/Juvantis/PROJECT.md` | Vermerk, dass `juvantis-web/` später umzieht |

---

## 8. Go/No-Go-Checkpoint

Dr. Stracke bestätigt mit **"Go"**:
- ✅ alle Entscheidungen in Tabelle §1 korrekt
- ✅ Phase 0 (Skelett anlegen) darf starten
- ✅ Keine Datenverschiebung (Phase 4/5) ohne erneute Einzel-Freigabe

Bei **"Stop"** oder Nachfrage:
- Spec wird überarbeitet
- Nichts wird angelegt

---

*Erstellt: 2026-04-18, Claude im Auftrag Dr. Stracke*
*Architekten-Modus Phase 2 abgeschlossen — bereit für Phase 3*
