# Cross-Site-Transfer — Übersicht

> Perspektivisches Muster für gerichtete, explizite Übertragung zwischen
> Praxis-Webseite (WP) und Juvantis/Sanexio (Shopify).
> Stand 2026-04-22 (nach content-bridge-v1).

---

## Der Grundgedanke

Dr. Stracke möchte **manuell, explizit** auslösen, dass etwas von einer Seite
auf die andere übertragen wird. Kein Auto-Sync. Keine Bidirektionalität. Der
Trunk ist dabei immer Vermittler (CW-001):

```
   Quelle                  Trunk                    Ziel
                          (SSoT)
  [WP / Shopify]  ──►  [Content / Design /  ──►  [Shopify / WP]
                        Funktion]
```

Drei Arten von Übertragung existieren nebeneinander:

| Art | Beispiel | Was ändert sich im Trunk | Was brauchen die Adapter |
|-----|----------|--------------------------|--------------------------|
| **Content** | Team-Seite, Impressum, Blog-Artikel | YAML/MD unter `trunk/content/` | Pages-/Posts-Renderer |
| **Design** | Farbwerte, Typo, Spacings, Button-Stile | `trunk/design/tokens.css` + `tokens.json` | Tokens→WP-CSS, Tokens→Liquid |
| **Funktion** | Team-Grid-Logik, Cross-Brand-CTA, Brand-Switch | `trunk/design/components/<name>/spec.md` + `reference.html` | Components→WP-Partial, Components→Liquid-Section |

---

## 1) Content (content-bridge-v1, ✅ produktiv)

**Was:** Texte, Überschriften, strukturierte Listen (wie Team-Roster, Sprechzeiten, Kontaktdaten).

**Pipeline heute:**

```bash
# 1. Trunk-YAML editieren (oder aus Quelle extrahieren)
#    trunk/content/pages/_shared/ueber-uns.yaml
#    trunk/content/team/*.yaml

# 2. Gerichteter Adapter-Lauf
bash tools/sync-page-shopify.sh trunk/content/pages/_shared/ueber-uns.yaml
# oder später:
bash tools/sync-page-wp.sh    trunk/content/pages/_shared/ueber-uns.yaml
```

**Baustein-Status:**

| Baustein | Stand |
|----------|-------|
| Shopify-Product-Adapter | ✅ |
| Shopify-Page-Adapter (`build-page.mjs` + `pages-to-shopify.mjs` + `page-juvantis.mjs`) | ✅ content-bridge-v1 |
| Shopify-Template-Adapter (`build-template.mjs` + `template-to-shopify.mjs` + `template-juvantis-ueber-uns.mjs`) | ✅ content-bridge-v1 Option B |
| WP-Page-Adapter (Products gemappt auf WP-Pages) | ✅ |
| WP-Page-Adapter für Pages-mit-Sections | 🔴 geplant |
| WP-Theme-File-Adapter (PHP inc/* schreiben) | 🔴 geplant |
| Page-Schema mit Sections + views.shop | ✅ content-bridge-v1 |
| Team-Member-Schema (8 Felder, required) | ✅ content-bridge-v1 |
| Extraction Shopify-Page (Skelett) | 🟡 extract-page.mjs |
| Extraction Shopify-Template (Skelett) | 🟡 extract-template.mjs |
| Extraction WP-Page (Skelett) | 🟡 extract-page.mjs |
| Renderer-Registry + Extractor-Registry | 🟡 Skelett (`adapters/*/lib/*-registry.mjs`) |
| cw-transfer Meta-Orchestrator | 🟡 `tools/cw-transfer` (push/pull/list; diff offen) |
| Backup vor destruktivem Push (CW-008) | ✅ im Template-Adapter; andere folgen |

**Was noch fehlt für Content-Bridge-v2:**

- WP-Page-Adapter, der dieselbe Page-YAML nach WP rendert — sodass
  `/team/` (WP) und `/pages/uber-uns` (Shopify) wirklich aus einer Quelle kommen.
- Weitere Section-Typen (Sprechzeiten-Tabelle, Kontakt-Block, FAQ, Galerie).
- Extraktions-Skripte (`tools/extract-from-wp.mjs`, `extract-from-shopify.mjs`),
  die beim ersten Mal Content aus der Quelle herausziehen und YAML erzeugen.

---

## 2) Design (geplant — cross-site-transfer-v2)

**Was:** Design-Tokens, Typo-Skalen, Komponenten-Default-Styles.

**Quelle-der-Wahrheit-Kandidaten:**

- `sites/praxis-webseite/theme/praxiszentrum/assets/css/tokens.css` (v2, Praxis-optimiert)
- `trunk/design/tokens.json` (Cortex-Web Master, noch leer)
- Figma-Variables (perspektivisch)

**Pipeline-Skizze:**

```bash
# Tokens im Trunk editieren
vim trunk/design/tokens.json
vim trunk/design/tokens.css

# Adapter-Läufe
bun adapters/wordpress/tokens-to-wp-css.mjs   # schreibt in Theme-CSS
bun adapters/shopify/tokens-to-liquid.mjs     # schreibt in Shopify-Theme
```

**Herausforderung:**
Praxis-Theme hat heute eigene Tokens (`tokens.css` v2) mit 4-Schichten-Modell.
Shopify-Theme hat eigene Variablen. Das zu vereinigen ist **Design-Aufgabe**,
nicht nur Adapter-Bau — welches der beiden ist die Vorlage? Oder beide →
Merge-Doku?

**Offene Entscheidung (Dr. Stracke):**
A) Praxis-Tokens sind Master → Shopify wird angepasst
B) Neue neutrale Cortex-Web-Tokens → beide werden angepasst
C) Pro-Brand-Tokens: `tokens-praxis.json` + `tokens-juvantis.json` teilen sich nur Grundwerte

---

## 3) Funktion (geplant — cross-site-transfer-v3)

**Was:** Wiederverwendbare UI-Bausteine mit Logik (Team-Grid mit Cross-Links,
Cross-Brand-CTA, Brand-Switch, Modal-Dialoge, FAQ-Accordion).

**Konzept (Maximal-Trunk, N5, ENTSCHEIDUNGEN_FINAL §3.3):**

Pro Komponente ein Ordner:

```
trunk/design/components/team-grid/
├── spec.md           # Props, States, A11y, was die Komponente tut
├── reference.html    # Browser-testbare Referenz-Implementation
└── tokens.json       # Komponenten-lokale Tokens
```

Adapter rendern daraus plattform-spezifische Artefakte:

```
# WordPress:
sites/praxis-webseite/theme/praxiszentrum/template-parts/team-grid.php
# Shopify:
sites/juvantis-webseite/theme/snippets/team-grid.liquid
# iOS (später):
Juvantis/ios/Views/TeamGrid.swift
```

**Beispiel Praxis → Shopify (Funktions-Transfer):**
`pxz_render_other_doctors()` ist ein PHP-Helper, der auf jeder Arzt-Seite die
anderen 7 Ärzte als Cross-Link-Grid rendert (Dr. Strackes Constraint „kein Arzt
steht isoliert"). Um das auf Shopify zu bekommen:

1. **Spec:** `trunk/design/components/other-doctors/spec.md` — Props (`exclude_slug`), A11y, visuelle Regeln
2. **Reference:** `reference.html` mit statischem Beispiel, browser-testbar
3. **Adapter WP:** → Bleibt der existierende `pxz_render_other_doctors()` (bereits konform)
4. **Adapter Shopify:** → generiert `snippets/other-doctors.liquid` aus derselben Spec

**Herausforderung:**
PHP- und Liquid-Logik sind nicht direkt übersetzbar. Der Trunk kann nur die
*Form* beschreiben, die plattform-spezifische *Implementierung* bleibt manuell.
Praktisch: Adapter generieren Skelette, Dr. Stracke (oder Claude) passt sie an.

---

## Leitprinzipien (Stand 2026-04-22)

1. **Trunk ist Master (CW-001)** — Admin-Edits werden beim nächsten Sync-Lauf
   überschrieben. Editieren darf man immer nur im Trunk.
2. **HWG-Trennung bleibt (CW-005)** — Practice-View und Shop-View pro Page
   sind getrennt; Preise nur in der Shop-View.
3. **Gerichteter Transfer, keine Bidirektion** — Sync nur Trunk→Site, nicht
   umgekehrt. Site→Trunk heißt Extraktions-Pass, einmalig, manuell.
4. **Explizit auslösen** — Kein Watchdog, kein Webhook. Jede Übertragung ist
   ein bewusster Befehl.
5. **Idempotent** — Zweimaliger Lauf derselben YAML produziert dieselbe
   Ziel-Seite, ohne `updated_at`-Bump (Shopify diff-aware).

---

## Nächste sinnvolle Schritte (Entscheidungshoheit Dr. Stracke)

Formale Roadmap: `specs/cross-site-transfer/ARCHITECTURE.md` §11. Offene Blöcke:

| Nr | Nächster Block | Erwarteter Aufwand | Nutzen |
|----|----------------|:-----------------:|--------|
| N-1 | WP-Template-/Theme-File-Adapter (Phase C2 Trunk→WP) | 1–2 Sessions | `/team/` auf WP aus Trunk, Doppelpflege weg |
| N-2 | Extraktions-Tools kuratieren (Skelett → Produktiv) | 1–2 Sessions | Rückwärts-Fluss Site→Trunk stabil |
| N-3 | Design-Token-Adapter (Phase D) | 2 Sessions (inkl. Master-Entscheidung) | Ein Farbschema konsistent |
| N-4 | Component-System (Phase F, Funktions-Bridge) | 3+ Sessions | Wiederverwendbare UI-Bausteine |
| N-5 | `tools/shopify-publish-page.sh` + Auto-Republish im Page-Adapter | 30 Min | Sync hebt nicht mehr auf Draft |
| N-6 | `cw-transfer diff` implementieren | 1 Session | Pre-Deploy-Vergleich Trunk vs. Site |
| N-7 | Backup-Automatik auf WP-Page-Adapter + Page-Adapter (CW-008) | 30 Min | Einheitlicher Rollback-Pfad |

## Referenzen

- **Architektur:** `specs/cross-site-transfer/ARCHITECTURE.md` — vollständige Transfer-Matrix, Registry-Pattern, Rollback-Strategie
- **Patterns:** `specs/cross-site-transfer/PATTERNS.md` — 6 wiederverwendbare Transfer-Muster (A–F)
- **Regeln:** `_config/RULES.md` CW-006/007/008 — Gerichtet, Trunk-Brücke, Backup-Pflicht
- **Orchestrator:** `tools/cw-transfer {push,pull,diff,list,help}`
