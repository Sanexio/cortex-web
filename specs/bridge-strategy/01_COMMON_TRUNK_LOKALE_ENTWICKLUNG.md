# Common Trunk + Lokale Entwicklung
## Ergänzung zu 00_BRAINSTORMING_KONZEPT.md

> **Stand:** 2026-04-18
> **Dr. Strackes Vorgaben aus Chat:**
> - F2: Produkte auf Praxis-Site **abgewandelt ohne Preis, ohne Anpreisen** (HWG-konform) → P1/P3 bleiben, P2 entfällt
> - F3: FTP-Ausfall war **Anlass, nicht Auslöser**
> - Keine Zeit verlieren → lokal maximal weiterentwickeln
> - Bridge als **Ressourcen-Pool** ist gesetzt
> - Idee: **Common Trunk** über mehrere Plattformen hinweg
>
> **Damit engt sich der Entscheidungsraum ein.**

---

## Teil A — Wie viel kann lokal entwickelt werden?

### A.1 WordPress (Local by Flywheel — bereits aktiv auf Cluster-Mini-02)

| Kann lokal | Beispiele | Status |
|:---:|----------|:-----:|
| ✅ | Theme-Code (Liquid, PHP, CSS, JS) | Läuft seit Sprint 0 |
| ✅ | Neue Pages anlegen (Gutenberg-Editor oder Templates) | Läuft |
| ✅ | WPForms-Formulare bauen & testen (Mailpit-Abfang) | Läuft |
| ✅ | WPML-Übersetzungen **technisch** (ohne Live-Domain-Lizenz) | Bedingt — Lizenz-Check ggf. erst live |
| ✅ | AIOSEO-Meta-Tags + Schema.org | Läuft |
| ✅ | Visuelle Regressions-Tests (Puppeteer `verify.sh`) | Läuft |
| ✅ | 172 Legacy-Seiten migrieren & umstylen | Läuft |
| ✅ | Barrierefreiheits-Tests (axe-core, Lighthouse) | Offline möglich |
| ❌ | End-to-End-Mail-Versand mit Outlook-SMTP (Sprint 1.3) | **Nur Prod** |
| ❌ | Live-SEO-Crawling, Sitemap-Indexierung durch Google | **Nur Prod** |
| ❌ | DNS-Switch / Domain-Umzug | **Nur Prod** |
| ❌ | Echte SSL-Zertifikate (self-signed lokal reicht für Dev) | **Nur Prod** |
| ❌ | Plugins mit Lizenz-Domain-Lock (WPForms Pro, WPML Premium) — manche Features | **Prüfen pro Plugin** |

**Konsequenz:** Sprint 2 (Kernseiten-Ausbau) + Sprint 2b (Legacy-Migration) + Sprint 3 (Mehrsprachigkeit) können **vollständig lokal** entwickelt werden. Sprint 1 (Staging + SMTP-Test + Rollback) ist der **einzige** Block, der Prod braucht.

### A.2 Shopify (Juvantis produktiv — Cluster-Mini-02 nutzt Theme-Dev)

| Kann lokal | Beispiele | Status |
|:---:|----------|:-----:|
| ✅ | `shopify theme dev` (Live-Preview auf localhost:9292) | Läuft |
| ✅ | Sections, Templates, Schema, Liquid | Läuft |
| ✅ | Produkt-Daten (über Development Store oder via Admin-Preview) | Läuft |
| ✅ | Custom-Metaobjekte definieren + Preview | Shopify-Admin |
| ✅ | GitHub-Sync ist optional — Theme-ID 181128757515 nur für Push | Läuft |
| ✅ | Theme-Editor-Vorschau (unveröffentlicht) | Läuft |
| ❌ | Echte Käufe / Test-Checkout (Shopify bietet Test-Orders, aber gegen Live-Produkte) | **Dev-Store oder Bogus-Gateway** |
| ❌ | Custom-Domain-Zuordnung / DNS | **Nur Prod** |
| ❌ | Shopify Markets Live (Mehrsprachig/Mehrwährung Live-Routing) | **Nur Prod** |
| ❌ | Externe Webhooks gegen Live-Services | **Prod + ngrok für lokale Tests** |

**Konsequenz:** Juvantis-Weiterentwicklung 100% lokal möglich, auch wenn Dev-Store ohne echten Traffic läuft.

### A.3 Common Trunk (Vorschlag dieses Dokuments)

Common Trunk ist **per Definition lokal** — er ist ein Git-Repository, das Adapter-Skripte zur Plattform produzieren. Bis zum letzten Schritt (Deploy) alles offline.

| Phase | Ort |
|-------|-----|
| Content schreiben (Markdown, YAML) | Lokal, Obsidian / VS Code / Cursor |
| Schema-Validierung | Lokal (`validate-trunk.sh`) |
| Adapter-Build (Trunk → WP-Pages / Shopify-Sections) | Lokal |
| Preview (WP via Local, Shopify via `theme dev`) | Lokal |
| Deploy | Live (GitHub-Actions oder `shopify theme push`) |

---

## Teil B — Common Trunk: Architektur und Begründung

### B.1 Das Leitbild in einem Bild

```
                     ┌──────────────────────────┐
                     │   _trunk/  (Git-Repo)    │
                     │   Single Source          │
                     │   of Truth               │
                     │   ──────────────         │
                     │   • content/             │
                     │   • design/tokens.*      │
                     │   • schema/              │
                     │   • components/specs     │
                     └──┬──────────────┬────────┘
                        │              │
          ┌─────────────▼───┐   ┌──────▼──────────┐
          │ adapters/       │   │ adapters/        │
          │ wordpress/      │   │ shopify/         │
          │ (build script)  │   │ (build script)   │
          └────┬────────────┘   └──────┬───────────┘
               │                       │
          ┌────▼──────────┐      ┌─────▼─────────────┐
          │ praxiszentrum │      │ juvantis-web      │
          │ (WP Theme)    │      │ (Shopify Theme)   │
          │ → Live WP     │      │ → Live Shopify    │
          └───────────────┘      └───────────────────┘
                                        │
                                  (später ggf.)
                                        │
                                   ┌────▼───────┐
                                   │ adapters/  │
                                   │ ios/       │
                                   │ (USDZ +    │
                                   │  HealthKit)│
                                   └────────────┘
```

### B.2 Arzt-Analogie für Dr. Stracke

Der Trunk ist wie eine **einzige Patientenakte**, aus der mehrere Dokumente erzeugt werden:
- Ein Arztbrief für den Kollegen (Fachjargon, Diagnosen im ICD-Code) = Shopify mit Preisen, Kauf-CTA
- Ein Patientenbrief (verständliche Sprache, ohne Fachjargon) = Praxis-WP ohne Preis, mit Info-CTA
- Eine Überweisung (Kurzfassung) = iOS-App-Produktübersicht

**Die medizinische Substanz (Diagnose, Werte, Empfehlung) ist identisch.** Nur die Darstellung unterscheidet sich.
Beim Trunk: **Die Produkt-/Seiten-Substanz (Name, Beschreibung, Indikation, Zusammensetzung) ist identisch.** Nur das Rendering unterscheidet sich.

### B.3 Ordner-Struktur (Vorschlag)

Lokation: **`~/Cortex/projects/_trunk/`** (neues Top-Level-Projekt, Git-versioniert, device-übergreifend via Nexus-Sync oder separates Git-Repo).

```
_trunk/
├── README.md                          Onboarding, wie man editiert
├── CHANGELOG.md                       Human-readable Versionsverlauf
├── package.json                       Bun/Node für Adapter
│
├── content/                           (Plattform-unabhängig, Dr. Stracke editiert hier)
│   ├── pages/
│   │   ├── _shared/
│   │   │   ├── partnerpraxis-westend.md         auf beiden Sites
│   │   │   ├── dht-erklaerung.md                auf beiden Sites
│   │   │   └── sanexio-brand.md                 auf beiden Sites
│   │   ├── praxis/
│   │   │   ├── home.md
│   │   │   ├── team.md
│   │   │   ├── sprechstunden.md
│   │   │   ├── fachrichtungen/innere.md
│   │   │   └── ...
│   │   └── juvantis/
│   │       ├── home.md
│   │       ├── bluttests-uebersicht.md
│   │       └── ...
│   │
│   ├── products/
│   │   └── bluttests/
│   │       ├── basic-check.yaml
│   │       │   ├── core: {name, indikation, parameter, beschreibung}
│   │       │   ├── views:
│   │       │   │   ├── juvantis: {preis, kauf_cta, shopify_variant_id}
│   │       │   │   └── praxis:   {info_cta_url, hwg_konforme_beschreibung}
│   │       │   └── media: [bildrefs]
│   │       ├── vital-check.yaml
│   │       └── ...
│   │
│   ├── team/
│   │   ├── dr-stracke.yaml
│   │   └── ...
│   │
│   ├── legal/
│   │   ├── impressum-praxis.md
│   │   ├── impressum-sanexio.md
│   │   └── datenschutz-bausteine.md
│   │
│   └── media/
│       ├── brand/logo-praxis.svg
│       ├── brand/logo-sanexio.svg
│       └── ...
│
├── design/
│   ├── tokens.json                    Maschinenlesbar (für Adapter)
│   ├── tokens.css                     Human-editable (ist BEREITS in Theme v2.7.5!)
│   ├── tokens-juvantis.json           Brand-Unterschiede
│   ├── tokens-praxis.json             Brand-Unterschiede
│   └── components/
│       ├── card.md                    Spec: Props, States, A11y, HTML-Referenz
│       ├── hero.md
│       ├── product-card.md
│       ├── pricing-table.md
│       └── team-card.md
│
├── schema/                            JSON-Schema für Validierung
│   ├── page.schema.json
│   ├── product.schema.json
│   └── team-member.schema.json
│
├── adapters/
│   ├── wordpress/
│   │   ├── build.mjs                  Haupt-Renderer: Trunk → WP-Theme
│   │   ├── content-to-wp-pages.mjs    Markdown/YAML → WP-Page-Imports (WP-CLI)
│   │   ├── tokens-to-wp-css.mjs       tokens.css → wp-content/themes/praxiszentrum/assets/css/tokens.css
│   │   ├── components-to-partials.mjs Component-Specs → Theme-Partials
│   │   └── README.md
│   │
│   ├── shopify/
│   │   ├── build.mjs                  Haupt-Renderer: Trunk → Shopify-Theme
│   │   ├── products-to-shopify.mjs    products/*.yaml → Shopify Products (via Admin API)
│   │   ├── pages-to-shopify.mjs       pages/*.md → Shopify Pages
│   │   ├── tokens-to-liquid.mjs       tokens → config/settings_data.json + assets/tokens.css
│   │   ├── components-to-sections.mjs Component-Specs → Liquid-Sections
│   │   └── README.md
│   │
│   └── ios/ (Platzhalter)
│       └── README.md
│
└── tools/
    ├── validate.sh                    Schemas + Links + Bilder
    ├── sync-wp.sh                     Build WP-Adapter + Copy to Theme + Git-Commit
    ├── sync-shopify.sh                Build Shopify-Adapter + Theme Push
    ├── sync-all.sh                    Beide Plattformen in einem Rutsch
    └── watch.sh                       Auto-Rebuild bei Trunk-Änderung
```

### B.4 Entwicklungs-Workflow für Dr. Stracke

**Tag 1 — Content-Änderung:**
```
1. cd ~/Cortex/projects/_trunk/
2. Öffne content/products/bluttests/basic-check.yaml in Cursor/Obsidian
3. Ändere "preis: 99" → "preis: 119"
4. git commit -am "feat(basic-check): Preis auf 119 angepasst"
5. bash tools/sync-all.sh
   → adapters/shopify/build.mjs läuft → Shopify Theme + Products
   → adapters/wordpress/build.mjs läuft → WP-Pages (Praxis-Variante OHNE Preis)
6. Beide Sites zeigen konsistente Info (Shopify mit Preis, WP ohne)
```

**Tag 2 — Neues Produkt anlegen:**
```
1. Kopiere content/products/bluttests/basic-check.yaml → vital-check.yaml
2. Fülle Felder aus
3. tools/validate.sh → OK
4. tools/sync-all.sh → auf beiden Sites erscheint das Produkt in richtiger Form
```

**Tag 3 — Design-Änderung:**
```
1. Ändere design/tokens.css (z.B. Primär-Farbe)
2. tools/sync-all.sh → beide Sites haben neues Design
3. Verify via Puppeteer / Shopify-Preview
```

### B.5 Was bringt das konkret Dr. Stracke?

| Vorteil | Konkret |
|---------|---------|
| **1× Pflegen** | Produkt ändert sich → EINMAL editieren → beide Sites aktuell |
| **Plattform-Unabhängigkeit** | Wenn WP morgen ausfällt (domainfactory), kann derselbe Trunk auf Netlify/Vercel/andere WP deployt werden — Content bleibt |
| **Rechtssicherheit automatisch** | Praxis-Adapter rendert per Definition ohne Preis + ohne Kauf-CTA. Kein versehentliches HWG-Problem |
| **Versionierung** | Git = vollständige Historie jeder Änderung, Rollback per `git revert` |
| **Mehrsprachigkeit wird strukturell** | `basic-check.de.yaml` / `basic-check.en.yaml` — saubere Trennung |
| **Zukunftsfähigkeit iOS** | iOS-App-Adapter kann später aus Trunk bauen (Produktlisten, Referenzwerte) |
| **Review vor Live-Gehen** | Trunk-Änderung + Adapter-Build + Puppeteer-Diff = Gate vor jedem Deploy |

### B.6 Was kostet das?

| Posten | Einmalig | Laufend |
|--------|----------|---------|
| Trunk-Struktur aufsetzen | 1-2 Tage | – |
| WordPress-Adapter schreiben | 3-5 Tage | – |
| Shopify-Adapter schreiben | 3-5 Tage | – |
| Bestehender Content in Trunk migrieren | 2-3 Tage (je nach Seitenzahl) | – |
| Adapter-Wartung | – | ~1h/Monat bei Plattform-Updates |
| Hosting | – | 0€ (Git-basiert, Plattform-Kosten unverändert) |

**Gesamt-Initialaufwand:** ca. **10-15 Entwicklertage**, parallel zu laufenden Sprints.
**Laufender Nutzen:** Jede Produkt-/Content-Änderung spart ca. 50% der Zeit (1 Edit statt 2).

### B.7 Risiken & Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|--------|---------------|
| Adapter-Bug führt zu fehlerhaftem Theme-Deploy | Verify-Pipeline aus praxis-redesign (`tools/verify.sh`) wird Teil des sync-Skripts — kein Deploy bei Visual-Regression |
| Dr. Stracke findet YAML/Markdown zu technisch | Obsidian-Vault bereits da → Content-Editor UX wie Notizen; fortgeschritten: Directus/Decap-CMS als UI über Trunk (optional später) |
| Produkte werden direkt im Shopify-Admin geändert, Trunk läuft auseinander | „Trunk is Master"-Regel, Admin nur noch für Test-Daten. Alternativ: Admin-Änderungen per Skript zurück in Trunk importieren (Bidirektional — später) |
| Plattform-spezifische Features (Shopify-Metaobjekte, WP-Gutenberg-Blocks) nicht 1:1 in Trunk abbildbar | Trunk bildet nur die Schnittmenge ab. Plattform-spezifische Extras bleiben plattform-spezifisch (z.B. Shopify-Checkout-Settings) |

---

## Teil C — Entscheidungs-Reduktion

Nach Ihren Antworten (F2 ohne Preise, F3 nur Anlass, F6 minimal):

### C.1 Plattform-Optionen, die übrigbleiben

| Option | Bewertung nach Ihrer Eingabe |
|--------|---------------|
| P1 WP bleiben | ✅ Konsistent mit Ihren Antworten |
| P2 Shopify-Migration | ❌ Sie wollen Produkte ohne Preis/Anpreisen auf Praxis-Site → Shopify-Optik passt nicht, HWG-Risiko bleibt |
| P3 Hybrid | ✅ Konsistent — Produkte als Info ohne Kauf-CTA auf Praxis möglich |
| P4 Headless | ⚠️ Timeline-Reset, widerspricht „keine Zeit verlieren" |
| P5 Webflow | ⚠️ Re-Migration beider Sites, widerspricht „keine Zeit verlieren" |

→ **Es bleiben P1 und P3.**

### C.2 Common Trunk macht P1 und P3 fast äquivalent

Mit Common Trunk unterscheidet sich P1 von P3 nur noch darin, **wo das Produkt formal „lebt"**:

| Frage | P1 + Trunk | P3 + Trunk |
|-------|-----------|------------|
| Produkt wird gepflegt in... | Trunk (`content/products/`) | Trunk (`content/products/`) |
| Shopify-Adapter rendert... | Produkt mit Preis + Kauf-CTA | Produkt mit Preis + Kauf-CTA |
| WP-Adapter rendert... | Produkt-Info ohne Preis, mit „Mehr auf sanexio.eu"-Link | KEINE Produktseite auf Praxis — stattdessen Verweis auf sanexio.eu |
| Patient auf Praxis-Site findet... | Produkt-Infoseite auf westend-hausarzt.com | Einen CTA „Partnerangebot: Details auf sanexio.eu" |

**Der Unterschied ist eine Adapter-Konfig, nicht eine Architektur-Entscheidung.** Das heißt: Sie können mit P1 starten und später zu P3 umschalten (oder mischen pro Produkt) — der Trunk bleibt identisch.

### C.3 Vorgeschlagener Sprint-Fahrplan (nicht empfohlen, nur strukturiert)

**Sofort (parallel zu laufenden Sprints):**
- Sprint T0 (Trunk-Foundation, ~3 Tage)
  - `_trunk/`-Repo anlegen
  - Content-Schema für Pages + Products + Team definieren
  - Design-Tokens aus v2.7.5 in Trunk migrieren (tokens.css ist ja bereits zentral!)
  - README, Validator, Minimaler Build-Skelett

**Danach wechselnd:**
- Sprint T1 (WP-Adapter, ~5 Tage): Homepage + Karriere aus Trunk rendern → 1:1-Vergleich gegen aktuellen Stand (MD5-Byte-Beweis wie bei S2.0)
- Sprint T2 (Shopify-Adapter, ~5 Tage): Eine Section aus Trunk rendern → Parität zum aktuellen Stand beweisen
- Sprint T3 (Produkt-Inventar): Erstes Produkt in Trunk → erscheint auf beiden Sites korrekt

**Währenddessen:**
- Sprint 1 (Staging/FTP) bleibt pausiert — wird entblockt, sobald domainfactory-Support liefert
- Sprint 2 (Kernseiten) läuft auf WP lokal weiter, **jede neue Seite wird direkt im Trunk erzeugt** (nicht mehr inline im Template)

**Vorteil:** Sie verlieren keine Zeit, bauen aber die Basis für Plattform-Unabhängigkeit parallel auf.

---

## Teil D — Offene Fragen, die Sie jetzt entscheiden müssten

| F# | Frage | Auswirkung |
|----|-------|-----------|
| G1 | Trunk als **eigenes Projekt** (`projects/_trunk/`) oder als Teil von Nexus? | Scope-Frage; eigenes Projekt sauberer, Nexus einfacher |
| G2 | Wollen Sie Markdown/YAML direkt editieren oder brauchen Sie ein visuelles CMS (Directus/Decap) darüber? | Entscheidet über Adapter-Aufwand und Dr.-Stracke-UX |
| G3 | Sollen Produktbilder im Trunk liegen (Git LFS nötig) oder extern (Shopify CDN + WP Media)? | Entscheidet Repo-Größe und Sync-Logik |
| G4 | Mehrsprachigkeit (DE/EN/FR/ES) im Trunk von Anfang an oder später? | Entscheidet Schema-Design |
| G5 | Soll Juvantis-Theme mit in den Trunk oder bleibt es separat? | Entscheidet, wie weit Trunk geht — Minimal: nur Content+Tokens; Maximal: auch Komponenten-Pattern-Lib |

---

## Teil E — Was jetzt konkret passiert, wenn Sie „go" sagen

1. **Sofort-Schritt** (heute): `projects/_trunk/` anlegen, README schreiben, Schema-Entwürfe committen.
2. **Nächste Session:** Ein Produkt (z.B. Bluttest) als YAML in Trunk überführen, Minimal-Adapter für WP schreiben, Praxis-Site zeigt generierte Info-Page.
3. **Session danach:** Shopify-Adapter für dasselbe Produkt — Parität beweisen.
4. **Review nach 2 Wochen:** Wenn Proof-of-Concept trägt → systematische Migration; wenn nicht → Rückfall auf P1 pur (Trunk-Arbeit ist nicht verloren, nur ruhend).

---

## Referenzen

- `_rules/ARCHITECTURE.md` (wird nach G-Entscheidungen um Trunk-Sektion ergänzt)
- `00_BRAINSTORMING_KONZEPT.md` (Elternentscheidung)
- `projects/Juvantis/_shared/README.md` (bestehender Shared-Ordner — geht im Trunk auf)
- Pattern `Nexus/_memory/patterns/design-token-ssot.md` (tokens.css → Trunk-Design-Teil)
