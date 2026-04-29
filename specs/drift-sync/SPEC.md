# Drift-Sync — Shopify ↔ Praxis Auto-Synchronisation

> **Status:** Phase 2 → Phase 3 (Architekten-Modus, Session 51, 2026-04-29)
> **Auftrag Dr. Stracke (2026-04-29):** „Ich will, dass alle weiteren Untersuchungen und Labortests, die zuerst auf der Shopify-Seite implementiert werden, automatisch auf die Praxiswebpage übertragen werden. Du erkennst automatisch, wenn ich dir sage, dass du den Abgleich machen sollst, welche neu hinzugekommen sind, und pflegst sie selbst auf der Webpage ein. Auch bei lokal geändertem Praxis-Content musst du erkennen, von welcher ursprünglichen Sanexio-Seite die Praxis-Seite kommt."
> **Verwandt:** S49 `S49_shopify-content-bridge.md` (§12 Wiederverwendbarer Workflow), `specs/cross-site-transfer/ARCHITECTURE.md`, `PATTERNS.md`

---

## §1 Auftrag (Phase 1 — Verständnis)

### Kern-Ziele

1. **Drift-Erkennung:** Auf Befehl scannt Claude alle relevanten Sanexio-Sources (Bluttests-Collection, Body-Checks-Collection, Pages) und listet was seit dem letzten Sync neu/geändert/entfernt ist.
2. **Auto-Curation:** Pro neuer Quelle wird ein Trunk-YAML mit HWG-Cleanup (Preise raus, Sie-Form, Praxis-CTA) generiert.
3. **Auto-Push:** Trunk-YAML wird über bestehende `cw-transfer push wp:page`-Pipeline auf die Praxis-WP gepusht (initial als `draft` für Review-Gate).
4. **Provenance-Stabilität:** Auch bei lokal editiertem Praxis-Content bleibt der Bezug zur Sanexio-Source erhalten — über stabile `sanexio_source`-Markierung im Trunk-YAML.
5. **Lokaler Drift-Schutz:** Wenn Praxis lokal geändert wurde UND Sanexio sich neu geändert hat, wird der Konflikt erkannt und der Sync stoppt für manuelle Auflösung (`LOCAL_DRIFT`-Strategie).

### Pflicht-Constraints

- **CW-001 Trunk-Master:** Drift-Sync darf nur in `trunk/`-YAMLs schreiben, dann via `cw-transfer push` auf Sites
- **CW-005 Plattform-Trennung:** HWG-Curation pflichtig (keine Preise auf Praxis-Site)
- **LL-024 Transparenz:** Pro Drift-Eintrag schriftliche Erklärung WAS/WARUM/WAS BEDEUTET DAS
- **LL-034 Optionen:** Bei mehrdeutigen Curation-Entscheidungen Optionen vorlegen, keine Vorauswahl
- **LL-053 Hot/Warm/Cold:** Drift-Berichte nicht ins Resume → liegen als JSON im `tools/drift-sync/reports/`

---

## §2 Architektur-Entscheidungen

### E1 Source-Zugriff Shopify

| Option | Bewertung |
|---|---|
| **A** Shopify Admin API über bestehenden `tools/shopify-rest-client.mjs` | ✅ Vollständige Daten, bestehende OAuth-Setup, Read-Only via `read_products`, `read_pages` |
| B Storefront-API (öffentlich) | ✅ Kein Auth nötig, aber begrenzte Felder |
| C Theme-Klon-Files (`Juvantis/juvantis-web/theme/sections/*.liquid`) | ❌ Keine Daten, nur Template-HTML |

**Wahl: Option A** — Admin REST API. Bestehendes `.env.local` mit `SHOPIFY_STORE` + `SHOPIFY_ADMIN_TOKEN` wird wiederverwendet.

### E2 Provenance-Schema

Jedes Trunk-YAML, das von Shopify gespiegelt wurde, bekommt einen `sanexio_source`-Block:

```yaml
sanexio_source:
  type: product | page                # Shopify-Resource-Typ
  handle: blutbild-basic              # Shopify-Handle (= Slug)
  collection: bluttests               # nur bei type=product: Sanexio-Collection-Handle
  resource_id: 7894561234             # Shopify-Numerische-ID (stabil über Handle-Renaming)
  last_synced_at: 2026-04-29T17:42:00Z
  last_synced_hash: a3f2e1d4...       # SHA-256 des relevanten Source-Content (siehe §3)
  drift_strategy: auto-curate         # auto-curate | manual | frozen
  local_edits: false                  # true = Praxis-Content wurde lokal angepasst (SCHUTZ)
```

**Anchor:** `sanexio_source.resource_id` ist stabil — auch wenn Sanexio-Handle umbenannt wird, bleibt die Verknüpfung. `handle` ist Convenience.

### E3 Hash-Berechnung (Drift-Detektion)

`last_synced_hash = SHA-256(JSON.stringify(canonicalize(source_data)))` — wobei `canonicalize` definiert ist als:

| Type | Canonical Felder (alphabetisch sortiert) |
|---|---|
| `product` | `body_html`, `featured_image.src`, `handle`, `images[].src`, `metafields[]`, `tags`, `title`, `variants[].title` |
| `page` | `body_html`, `handle`, `published_at`, `template_suffix`, `title` |

Preise werden bewusst NICHT in den Hash genommen → Preisänderungen lösen kein Drift aus (HWG-konform).

### E4 Drift-Strategien

| Status | Bedingung | Aktion |
|---|---|---|
| **NEW** | Sanexio-Resource existiert, kein Trunk-YAML mit `sanexio_source.resource_id == X` | Auto-Curate → neuer Trunk-YAML mit `drift_strategy=auto-curate` |
| **UPDATED** | Trunk existiert, `local_edits=false`, `current_hash != last_synced_hash` | Auto-Curate-Update mit Backup `_archive/drift-sync/<resource>-<timestamp>.yaml` |
| **REMOVED** | Trunk hat `sanexio_source.resource_id`, Sanexio-Source nicht mehr da | Trunk-YAML in `_archive/drift-sync/removed/`, Praxis-Page auf draft, manueller Review |
| **LOCAL_DRIFT** | Trunk existiert, `local_edits=true`, `current_hash != last_synced_hash` | **STOPP** — Sanexio-Diff anzeigen, Sie wählen: (a) Lokal überschreiben, (b) Sanexio-Update ignorieren, (c) Manuell mergen |
| **CLEAN** | Trunk existiert, `current_hash == last_synced_hash` | Nichts zu tun |
| **LOCAL_ONLY** | Trunk existiert ohne `sanexio_source` (Praxis-eigene Page) | Wird ignoriert (kein Sanexio-Bezug) |

### E5 HWG-Curation-Pipeline

Jeder Auto-Curate-Lauf macht mechanisch:

| Schritt | Was |
|---|---|
| **C1 Preise raus** | `views.praxis.show_prices: false` setzen, `price_eur` nicht in `views.praxis` rendern |
| **C2 Sie-Form** | Regex-Replacements für Du→Sie, dein/deine→Ihr/Ihre, dich→Sie. Whitelist häufiger Begriffe |
| **C3 CTA-Override** | `views.praxis.cta_url: /service/terminanfrage/`, Label „Termin vereinbaren" |
| **C4 HWG-Filter** | Heilversprechen-Wörter erkennen (Liste in `lib/hwg-vocab.json`), bei Treffer: Stopp + manuelle Review |
| **C5 Bilder spiegeln** | Über `tools/mirror-shopify-images.sh`: Featured + Gallery → `_media-source/shopify-mirror/` |

**Default `drift_strategy=auto-curate`** macht C1–C3 automatisch. C4 stoppt bei Treffer. C5 ist immer aktiv.

### E6 Stufen-Wahl (D1–D4 aus Vorgespräch)

**Default-Stufe: D3 (Auto-Sync mit Review-Gate via WP-Draft).**

- Drift-Sync erstellt/aktualisiert Trunk-YAMLs voll-automatisch
- Auto-Push auf WP, aber Pages landen in **`post_status=draft`**
- Sie publishen manuell nach Sicht-Prüfung
- Optional: `--auto-publish` Flag für D4 (Voll-Auto, nur für `--scope=labor` empfohlen)

---

## §3 Tooling-Layout

```
Cortex-Web/
├── specs/drift-sync/
│   └── SPEC.md                          ← diese Datei
├── tools/drift-sync/
│   ├── detect.mjs                       ← Drift-Detector (read-only)
│   ├── sync.mjs                         ← Auto-Curate + Push (read-write)
│   ├── reports/                         ← JSON-Berichte (gitignored)
│   │   └── drift-<timestamp>.json
│   ├── config.json                      ← Watched-Sources (Collections, Page-Handles)
│   └── lib/
│       ├── shopify-collection.mjs       ← List-Products in Collection via Admin API
│       ├── shopify-page.mjs             ← Get Page via Admin API
│       ├── provenance.mjs               ← Hash + Compare
│       ├── hwg-curate.mjs               ← Preise raus, Sie-Form, CTA-Override
│       ├── hwg-vocab.json               ← Heilversprechen-Wortliste
│       └── trunk-walker.mjs             ← Trunk-YAML-Discovery
└── trunk/schema/
    ├── product.schema.json              ← + sanexio_source-Block
    └── page.schema.json                 ← + sanexio_source-Block
```

### CLI-Verben (Erweiterung von `tools/cw-transfer`)

```bash
cw-transfer drift status                    # Drift-Bericht ausgeben (read-only, alle scopes)
cw-transfer drift status --scope=labor      # Nur Labor-Drift
cw-transfer drift status --json             # Maschinenlesbar

cw-transfer drift sync                      # Auto-Curate + Push (D3, draft-Status)
cw-transfer drift sync --auto-publish       # D4: direkt published
cw-transfer drift sync --dry-run            # Schreibt nichts, simuliert
cw-transfer drift sync --scope=labor        # Nur Labor

cw-transfer drift backfill                  # Einmalig: bestehende Trunk-YAMLs mit sanexio_source-Block versehen
                                            # (für Provenance-Initialisierung der Bestandsdaten)
```

---

## §4 Watched-Sources (Initial-Konfiguration)

`tools/drift-sync/config.json`:

```json
{
  "version": 1,
  "shopify_store": "juvantis.myshopify.com",
  "scopes": {
    "labor": {
      "type": "collection",
      "collection_handle": "bluttests",
      "praxis_target": {
        "page_template": "template-detail-page.php",
        "trunk_dir": "trunk/content/products/bluttests/",
        "wp_parent_slug": "labor",
        "page_status_default": "draft"
      },
      "auto_publish_allowed": true
    },
    "untersuchungen": {
      "type": "collection",
      "collection_handle": "ultraschalluntersuchungen",
      "praxis_target": {
        "page_template": "template-detail-page.php",
        "trunk_dir": "trunk/content/pages/_shared/",
        "wp_parent_slug": "untersuchungen",
        "page_status_default": "draft"
      },
      "auto_publish_allowed": false
    },
    "body-checks": {
      "type": "collection",
      "collection_handle": "body-checks",
      "praxis_target": {
        "page_template": "template-detail-page.php",
        "trunk_dir": "trunk/content/pages/_shared/",
        "wp_parent_slug": "untersuchungen",
        "page_status_default": "draft"
      },
      "auto_publish_allowed": false
    },
    "pages-shared": {
      "type": "pages",
      "page_handles": ["body-checks", "bluttests", "biomarker"],
      "praxis_target": {
        "page_template": "template-page-hub.php",
        "trunk_dir": "trunk/content/pages/_shared/"
      },
      "auto_publish_allowed": false
    }
  },
  "hwg_vocab_file": "lib/hwg-vocab.json"
}
```

`scopes.<name>.auto_publish_allowed: true` — nur Labor (Bluttest-Produkte sind formal harmlos). Untersuchungen + Pages bleiben immer Draft, weil sie Heilversprechen enthalten könnten.

---

## §5 Datenfluss (Detail)

### Drift-Detection-Pipeline

```
1. Lade tools/drift-sync/config.json
2. Pro Scope:
   a. Frage Sanexio Admin API ab (Liste aller Resources im Scope)
   b. Berechne current_hash für jede Resource
   c. Walke trunk/ → Liste aller YAMLs mit sanexio_source.scope == <scope>
   d. Compare:
      - resource_id in Sanexio aber nicht in Trunk → NEW
      - resource_id in beiden, hash gleich, local_edits=false → CLEAN
      - resource_id in beiden, hash unterschiedlich, local_edits=false → UPDATED
      - resource_id in beiden, hash unterschiedlich, local_edits=true → LOCAL_DRIFT
      - resource_id in Trunk aber nicht in Sanexio → REMOVED
   e. Schreibe Bericht nach tools/drift-sync/reports/drift-<timestamp>.json
3. Konsolidierter Bericht über alle Scopes
```

### Sync-Pipeline

```
1. Lade Drift-Bericht (oder neu detect ausführen)
2. Pro NEW oder UPDATED:
   a. Wenn LOCAL_DRIFT → STOPP, manuelle Auflösung anbieten
   b. Lade aktuelle Sanexio-Source via Admin API
   c. Backup current Trunk-YAML nach _archive/drift-sync/<resource>-<timestamp>.yaml (nur bei UPDATED)
   d. Generiere/aktualisiere Trunk-YAML:
      - HWG-Curate-Pipeline (C1–C5)
      - sanexio_source-Block aktualisieren mit new hash + timestamp
      - local_edits=false (frischer Sync)
   e. Bilder spiegeln (Featured + Gallery)
   f. AJV-Validierung gegen schema
   g. cw-transfer push wp:page <yaml> --status=draft (oder published bei --auto-publish + scope erlaubt)
3. Pro REMOVED:
   a. Trunk-YAML nach _archive/drift-sync/removed/ verschieben
   b. WP-Page auf draft setzen (NICHT löschen — Stracke entscheidet)
4. Aktualisiere Hub-Page (z.B. /labor/) wenn neue Karten erforderlich
5. Schreibe Sync-Log: was getan, was übersprungen, was zur Review
```

### Local-Edits-Erkennung

Eine Trunk-YAML wird als „lokal editiert" markiert (`sanexio_source.local_edits=true`), wenn:

- **Manuell:** Sie editieren bewusst und setzen das Flag (oder ich setze es bei einem Edit der Praxis-Spalte)
- **Auto:** Hash der Praxis-spezifischen Felder (`views.praxis.*`, lokale `body_html.de`) hat sich seit `last_synced_hash` geändert

Solange `local_edits=true` ist, **stoppt Auto-Sync** bei UPDATE-Drift und fragt nach. Drift-Strategy `frozen` schaltet Auto-Sync für diese eine YAML komplett aus.

---

## §6 Provenance-Schema-Migration (Bestand)

Existierende Trunk-YAMLs (Stand 2026-04-29):

| Datei | Bestehende Provenance-Marker | Sanexio-Source ableitbar? |
|---|---|---|
| `trunk/content/products/bluttests/basic-check.yaml` | `slugs.juvantis: basic-check` (implizit) | ✅ aus S49-Spec dokumentiert (handle=basic-check, type=product) |
| `trunk/content/pages/_shared/untersuchungen.yaml` | `slugs.juvantis: body-checks` | ✅ handle=body-checks, type=page |
| `trunk/content/pages/_shared/labor.yaml` | nur Praxis-Felder | 🟡 in S49-Spec angedeutet (handle=bluttests) |
| `trunk/content/pages/_shared/carotis-duplex.yaml` etc. (24 Detail-Pages) | `image: shopify-mirror://detail/<slug>-hero.jpg` | 🟡 Bilder gespiegelt, aber Source-Page-Bezug unklar |

**Backfill-Plan:** Einmaliger `cw-transfer drift backfill`-Lauf, der existierende Trunk-YAMLs mit `sanexio_source`-Block versieht, soweit Sanexio-Source zuordenbar. Bei Mehrdeutigkeit: Eintrag in Backfill-Bericht, manuelle Klärung.

---

## §7 Acceptance-Kriterien

| AK | Kriterium | Verifizierung |
|---|---|---|
| **AK-1** | `cw-transfer drift status` listet Drift-Status für alle 4 Scopes | CLI-Output, Exit 0 |
| **AK-2** | Provenance-Block wird vom AJV-Schema akzeptiert | `tools/validate.sh` Exit 0 |
| **AK-3** | NEW-Eintrag wird auto-curated mit Sie-Form, ohne Preis | manueller Diff-Check ein generierter YAML |
| **AK-4** | UPDATED mit `local_edits=false` aktualisiert Trunk + WP-Draft | Roundtrip-Test |
| **AK-5** | UPDATED mit `local_edits=true` stoppt Auto-Sync, zeigt Diff | manueller Test |
| **AK-6** | Hash ist preis-unabhängig (Preisänderung in Sanexio löst kein Drift aus) | gezielter Test |
| **AK-7** | `--dry-run` schreibt nichts | git status sauber nach Lauf |
| **AK-8** | Bestehende Trunk-YAMLs (24 Pages) bekommen via `backfill` Provenance-Block | git diff zeigt nur sanexio_source-Additions |
| **AK-9** | Sanitizer-Probe grün, alle neuen Files unter Cap | `rotate.sh --probe` Exit 0 |
| **AK-10** | HWG-Curation entfernt Preise, ersetzt Du→Sie, setzt CTA | Test mit Sample-YAML |

---

## §8 Risiken + Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Auto-Sync überschreibt lokale Praxis-Edits | hoch (initial) | `local_edits`-Flag + LOCAL_DRIFT-Stopp |
| HWG-Curate übersieht Heilversprechen | mittel | C4-Vocab-Liste + WP-Draft-Status (Review-Gate) |
| Shopify-API-Rate-Limit | gering | Sequenzielle Requests, kein Bulk |
| Hash-Instabilität (gleicher Content, unterschiedlicher Hash) | mittel | Canonical-Form streng definiert (E3), Tests |
| Bilder-Mirror schlägt fehl | mittel | Idempotent + MD5-Verify (CW-008-Pattern) |

---

## §9 Out-of-Scope (Session 51, kommt später)

- ❌ Webhooks (Sanexio meldet aktiv „neuer Bluttest" an Cortex-Web) — manueller Trigger reicht initial
- ❌ Multi-Language-Drift (EN/FR/ES Sync) — DE-only, i18n folgt nach P6
- ❌ Bidirectional-Sync (Praxis → Sanexio) — nur Sanexio → Praxis
- ❌ Hub-Page-Auto-Update (Bento-Grid mit neuen Karten) — initial manuell, später S52+
- ❌ Drift-Sync für `pages-shared`-Scope (3 Hub-Pages: body-checks, bluttests, biomarker) — Tooling-Skelett da, aktiv ab Stufe D4

---

## §10 Freigabe-Punkte

| ID | Frage | Default-Antwort |
|---|---|---|
| **DS-F1** | Stufe (D1/D2/D3/D4)? | **D3** (Auto-Sync mit Review-Gate via WP-Draft) |
| **DS-F2** | Welche Scopes initial aktiv? | `labor` + `untersuchungen` + `body-checks` (siehe §4 config.json) |
| **DS-F3** | Backfill für bestehende 24+ Trunk-YAMLs jetzt durchführen? | **Ja** (für stabile Provenance) |
| **DS-F4** | HWG-Vocab-Liste — Wer definiert? | initial Claude (medizinische Werbe-Standardwörter), Sie reviewen |
| **DS-F5** | Drift-Bericht-Cadence | **on-demand** (Sie sagen „mach Abgleich") + optional: `cw-transfer drift status` als Hook bei Session-Init |

---

*Erstellt 2026-04-29 in Session 51 nach Dr.-Stracke-Auftrag „setze das heute vollumfänglich um". Architekten-Modus Phase 2 → direkter Übergang zu Phase 3 (Implementation), weil Auftrag eindeutig.*
