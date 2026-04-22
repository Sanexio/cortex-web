# Cross-Site-Transfer — Wiederverwendbare Patterns

> **Companion:** `ARCHITECTURE.md` (Grundprinzipien + Matrix)
> **Status:** 2026-04-22 — 6 Patterns, davon 3 produktiv, 3 vorbereitet

Jedes Pattern beschreibt: **Wann anwenden**, **Mechanik**, **Beispiel**,
**Einschränkungen**. Wenn Sie eine neue Transfer-Anforderung haben, finden Sie
hier das passende Muster — oder einen Hinweis, dass ein neues Pattern gebraucht wird.

---

## Pattern A — Simple Content-Page (body_html)

**Stand:** 🟢 produktiv (content-bridge-v1)

**Wann anwenden:** Eine Seite besteht nur aus Fließtext + einfachen Sektionen
(Intro, Team-Grid, FAQ, Impressum-Absätze). Kein komplexes Layout nötig, das
Theme kann das Rendering übernehmen.

**Mechanik:**
```
Trunk-YAML (sections[])
  ↓ adapters/<target>/build-page.mjs
Payload { handle, title, body_html, published:false }
  ↓ adapters/<target>/pages-to-<target>.mjs
Site-API (POST/PUT /pages/…)
```

**Beispiel:**
```bash
bash tools/sync-page-shopify.sh trunk/content/pages/_shared/ueber-uns.yaml
```

**Einschränkungen:**
- `body_html` wird in generische `rte`/`main-page`-Container gerendert → nur Basis-Styling
- Inline-`<style>`-Blöcke möglich, aber vom Theme teilweise überschrieben
- Keine Section-Anchors, keine komplexen Layouts
- Bei 10+ Pages wiederholt sich das Inline-CSS → DRY-Verletzung

**Besser mit Pattern B**, wenn: die Seite ein spezifisches Layout/Design braucht oder im Theme bereits eine Custom-Section existiert.

---

## Pattern B — Template-Based Page (Theme-Section-Composition)

**Stand:** 🟢 produktiv (content-bridge-v1 Option B, ueber-uns-Template)

**Wann anwenden:** Das Theme hat eine **Custom-Section** (wie `juvantis-ueber-uns`)
mit Block-Schema. Die Daten kommen aus dem Trunk, das Design bleibt im Theme.
Das ist der **Goldstandard** für Shopify-seitige Rich-Pages.

**Mechanik:**
```
Trunk-YAML (views.<view>.{hero,mission,values,...} + team[])
  ↓ adapters/<target>/build-template.mjs
  ↓ lib/renderers/template-<section-type>.mjs
Payload { asset.key: "templates/page.<slug>.json", asset.value: "<json>" }
  ↓ adapters/<target>/template-to-<target>.mjs
Site-API (PUT /themes/<id>/assets.json)
          + page.template_suffix = <slug>
          + page.body_html = ""
```

**Beispiel:**
```bash
bash tools/sync-template-shopify.sh trunk/content/pages/_shared/ueber-uns.yaml
```

**Vorteile:**
- Design liegt EINMAL im Theme, wird von allen Instanzen der Section genutzt
- Daten kommen aus Trunk (SSoT)
- Shopify-Admin-UI zeigt Blocks übersichtlich
- Fall-Back: Wenn Section erweitert werden muss, Theme-Commit + Template-Push

**Einschränkungen:**
- Setzt voraus: passende Section existiert im Theme (oder wird manuell gebaut)
- Block-Schema der Section begrenzt die Daten-Struktur
- Section-Liquid kann Hardcodings enthalten (z.B. Icon-Mapping über Case-Statement — siehe `juvantis-ueber-uns.liquid`)
- Template-Suffix auf der Page muss auf den Slug gesetzt sein

**Migration von A → B:**
1. Section im Theme bauen (Liquid + Schema mit Blocks)
2. Renderer `template-<section-type>-<view>.mjs` schreiben
3. Trunk-YAML um `views.<view>.*` erweitern
4. `sync-template-<target>.sh` pushen
5. Page-Settings: `template_suffix` setzen, `body_html` leeren

---

## Pattern C — Metafield-backed Section-Settings

**Stand:** 🔴 nicht gebaut, Entwurf

**Wann anwenden:** Shopify-Section soll Daten aus der Product-/Page-Metafields
laden statt aus Section-Settings. Vorteil: Metafields können von der API frei
gepflegt werden, ohne das Template-Asset anzufassen.

**Mechanik-Skizze:**
```
Trunk-YAML → adapter schreibt:
  1. Metafields auf Page/Product (via /metafields.json)
  2. OPTIONAL: Template-Asset nur beim Erstbau, Section liest Metafield
Section-Liquid: {{ page.metafields.cortex.team_members | json }}
```

**Vorteil gegenüber B:** Trunk-Änderungen brauchen keinen Theme-Asset-Write
mehr — nur ein Metafield-Update. Weniger Theme-Churn.

**Einschränkung:** Metafield-Schema muss erst im Shopify-Admin definiert werden
(Settings → Custom data). Nicht alle Section-Arten profitieren.

**Offen:** Entscheidung ob Pattern C die default-Evolution von B werden soll,
oder nur für bestimmte Inhalte (z.B. Produkt-Laborwerte).

---

## Pattern D — Theme-Asset-Overwrite (Section-Liquid selbst)

**Stand:** 🔴 nicht gebaut, gefährlich, nur in Notfällen

**Wann anwenden:** Die Section-Liquid-Datei selbst soll aus dem Trunk gepflegt
werden (z.B. wenn das Design im Trunk als `reference.html` lebt und der Adapter
das zu Liquid übersetzt).

**Mechanik:**
```
Trunk-Component-Spec (reference.html + tokens.json)
  ↓ adapters/shopify/build-component-section.mjs
Payload { asset.key: "sections/<name>.liquid", asset.value: "<liquid>" }
  ↓ adapters/shopify/template-to-shopify.mjs  (reused)
```

**Warum gefährlich:**
- Shopify's GitHub-Integration kann nach dem Push einen Theme-Commit triggern → Merge-Konflikte
- Liquid-Syntax-Fehler im Asset brechen die gesamte Storefront
- Theme-Entwicklung parallel durch Claude + Shopify-Admin = Divergenz

**Regel:** Nur anwenden, wenn klar ist, dass Theme im Trunk-Mode läuft (keine
parallelen Admin-Edits). **Nicht für produktive Custom-Sections empfohlen.**

---

## Pattern E — Product-Sync (Shopify-Produkte)

**Stand:** 🟢 produktiv (Phase 2 POC, Session 4)

**Wann anwenden:** Bluttests, Body-Checks, Subscription-Produkte — alle
Juvantis-Verkaufs-Artefakte. Praxis-Seite nutzt dieselbe YAML, rendert sie aber
HWG-konform (keine Preise, keine Buy-CTA).

**Mechanik:**
```
Trunk-YAML (products/<cat>/<id>.yaml mit views.juvantis + views.praxis)
  ↓ adapters/shopify/build.mjs → lib/renderers/product-juvantis.mjs
  ↓ adapters/shopify/products-to-shopify.mjs
Payload { product: { handle, title, body_html, variants[], status:draft } }
```

**Besonderheit:** `views.praxis.show_price: false` erzwingt HWG-Konformität
schema-seitig (AJV).

**Erweiterung:** Praxis-seitig rendert `adapters/wordpress/content-to-wp-pages.mjs`
dieselbe YAML mit Praxis-View auf WordPress — bereits produktiv seit S2.3-checkups
(Bridge `/basic-check/` auf Praxis-Site rendert aus basic-check.yaml).

---

## Pattern F — Design-Token-Propagation

**Stand:** 🔴 nicht gebaut, Roadmap Phase D

**Wann anwenden:** Farbwerte, Typo-Skalen, Spacing, Radius, Shadow —
alles, was mehrfach verwendet wird und konsistent bleiben soll.

**Mechanik-Skizze:**
```
trunk/design/tokens.json (Master)
  + trunk/design/tokens-praxis.json (Overrides)
  + trunk/design/tokens-juvantis.json (Overrides)
        ↓ adapters/wordpress/tokens-to-wp-css.mjs
        ↓ adapters/shopify/tokens-to-liquid.mjs
  → Praxis-Theme: assets/css/tokens.css (ersetzt v2)
  → Shopify-Theme: CSS-Variables in theme.liquid
```

**Offene Architektur-Entscheidungen (Dr. Stracke):**
1. **Wer ist Master?** Praxis-tokens.css v2 existiert schon (4-Schichten-Modell).
   Variante A: Praxis ist Master, Juvantis erbt.
   Variante B: Neuer neutraler Master, beide erben.
   Variante C: Pro-Brand-Tokens, nur Grundwerte geteilt.
2. **Wie weit teilen?** Farben + Typo immer, Radius + Shadow optional.
3. **Override-Semantik?** JSON-Merge vs. Layered CSS.

**Vorbedingung:** Diese Fragen müssen geklärt sein, bevor der Adapter gebaut wird.
Das ist eine **Design-Strategie-Entscheidung**, keine Technik-Entscheidung.

---

## Pattern-Auswahl-Matrix

| Szenario | Pattern | Warum |
|----------|:---:|------|
| Einfache Textseite, gleich auf beiden Seiten | A | Reicht, kein Theme-Eingriff |
| Seite mit komplexem Layout + existierender Theme-Section | **B** | Goldstandard |
| Neue Section soll beide Sites bedienen | B + Theme-Entwicklung | Erst Section, dann Adapter |
| Produkt (Juvantis primär, Praxis sekundär) | E | HWG-konform, bewährt |
| Theme-weite Design-Änderung (Farben, Typo) | F (nicht gebaut) | Phase D |
| Metafield-getriebene Section (z.B. Laborwerte) | C (nicht gebaut) | Evolution von B |
| Liquid-Section selbst aus Trunk pflegen | D (nur Notfall) | Bricht GitHub-Sync |

---

## Neues Pattern dokumentieren

Wenn Sie auf eine Transfer-Anforderung stoßen, die in keines der 6 Patterns
passt, legen Sie sie hier als neuen Abschnitt an — auch wenn sie „nur" eine
Variation ist. Das PATTERNS.md ist der Platz, um die Gedanken-Geometrie sichtbar
zu halten.

Template für neues Pattern:

```markdown
## Pattern X — <Name>

**Stand:** 🔴 / 🟡 / 🟢

**Wann anwenden:** …

**Mechanik:** …

**Einschränkungen:** …

**Beispiel:** …
```
