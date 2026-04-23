# N-1 — WP-Template-Adapter (Pattern B reverse für `/team/`)

> **Session 29, 2026-04-23, autonom auf Cluster-Mini-02**
> Spec-Stand: vor Implementierung. AKs 1–13. Pattern: `wp-theme-data-json` (neu).

---

## §0 Problem

Die Praxis-Webseite (`westend-hausarzt.com`) hat seit S2.3-aerzte-services (2026-04-22)
eine aus 8 Arzt-Einträgen bestehende `/team/`-Seite, deren Datenquelle das PHP-Array
`pxz_team_doctors()` in `inc/team-data.php` ist. Die Trunk-YAMLs unter
`trunk/content/team/*.yaml` wurden in content-bridge-v1 (Session 22) als SSoT
ausgewiesen — aber es existiert **kein Adapter**, der Trunk → Praxis-Theme pushet.

**Konsequenz:** Änderungen im Trunk müssen händisch ins PHP-Array übertragen werden.
Das ist die klassische Drift-Konfiguration (CW-001 verletzt sich selbst).

---

## §1 Ziel

Ein Adapter, der aus allen 8 `trunk/content/team/*.yaml` eine **einzige, konsumierbare
Datei** ins Praxis-Theme schreibt, und eine minimale (einmalige) Theme-Anpassung,
damit `pxz_team_doctors()` diese Datei liest statt des Inline-Arrays.

**Symmetrie-Ziel:** Pattern B reverse zu `adapters/shopify/template-to-shopify.mjs`:
- Shopify schreibt Theme-**Asset** via Admin-API (`PUT /themes/.../assets.json`).
- WP schreibt Theme-**File** via Filesystem (Node `fs.writeFile` in Local-WP-Pfad).
- Beide mit CW-008-Backup vor Write.
- Beide diffbar später (N-6.3 reuse).

---

## §2 Architektur-Entscheidung — Warum JSON-Data-File

4 Varianten wurden geprüft:

| Variante | Ziel | Pro | Contra |
|---|---|---|---|
| V1 PHP-Generate | `inc/data/team-generated.php` | reines PHP, include-schnell | Code-Generation, schwer diffbar, PHP-Syntax-Fragile |
| **V2 JSON-Data-File** ⭐ | `inc/data/team.json` | symmetrisch zu Shopify, diffbar, WP-Cache-fähig | benötigt einmalige team-data.php-Anpassung |
| V3 WP-Option | `update_option` via REST | keine Theme-Änderung | keine Git-Historie, DB-Backup nötig, WP-Auth |
| V4 Post-Meta | `/team/`-Page-Meta | WP-nativ | unsauberes Datenmodell (ein großes Meta-Feld) |

**Gewählt: V2 JSON-Data-File.** Begründung: höchste Symmetrie zum produktiven
Shopify-Pattern-B (beide schreiben eine Theme-Datei, beide CW-008-Backup-fähig,
beide git-diffbar, beide später über N-6.3 diffbar). Die einmalige Theme-Anpassung
in `inc/team-data.php` kostet ~15 Zeilen PHP und trennt danach sauber Daten (JSON)
von Logik (Helper-Funktionen, die unverändert bleiben).

---

## §3 Mechanik

```
trunk/content/team/*.yaml (8 Files)
  ↓ adapters/wordpress/build-team.mjs
     • AJV-Validation gegen team-member.schema.json (je YAML)
     • Sort nach order
     • Schema-Transformation Trunk → Praxis-View (siehe §4)
     • Stable serialization (sorted keys, 2-space indent, trailing newline)
Payload JSON { asset: { path: "inc/data/team.json", value: "<json-string>" },
               meta: { source_count, generated_at, schema_version } }
  ↓ adapters/wordpress/team-to-wp.mjs
     • resolve Theme-Root (via THEME_PATH env oder THEME_POINTER.md-Konstante)
     • Target-Pfad = <theme>/inc/data/team.json
     • Falls existiert: Backup in adapters/wordpress/.backups/<ts>_team.json
     • fs.writeFile Target
     • Summary JSON auf stdout
  ↓ inc/team-data.php (einmalig gepatcht)
     • pxz_team_doctors() lädt zuerst inc/data/team.json, mapt Schema
     • Fallback auf Inline-Array bei File-Missing / JSON-Decode-Error
     • Helper-Funktionen (pxz_doctor_slugs, pxz_doctor_by_slug,
       pxz_is_sanexio_uri, pxz_render_other_doctors) unverändert
```

**Keine Änderung** an: `template-team.php`, `template-arzt.php`, `inc/seo-data.php`.

---

## §4 Schema-Mapping Trunk → Praxis-View

Die Trunk-YAMLs tragen mehr Felder als die Praxis-View braucht (Juvantis-bio,
Asset-Image, i18n). Der Renderer extrahiert nur die Praxis-relevanten Felder:

| Trunk-Feld (YAML) | Praxis-JSON-Feld | Transformation |
|---|---|---|
| `slug` | `slug` | 1:1 |
| `name` | `name` | 1:1 |
| `role.de` | `title` | .de-Lookup (CW-004: DE ist Praxis-Kanon) |
| `languages` | `languages` | 1:1 (bereits Array) |
| `intro.de` | `intro` | .de-Lookup, getrimmt |
| `accent` | `accent` | 1:1 (enum: red/amber/ink) |
| `image` (`media://...` \| null) | `image_id` | Phase 0: immer `0` (wie IST). Media-Resolver in späterer Phase. |
| `profile_urls.praxis` | `profile_url` | Fallback `/${slug}/` wenn fehlend |
| `order` | — | implizit über Array-Position nach Sort |
| `id`, `qualifications`, `bio`, `image_asset_juvantis` | — | Praxis-View ignoriert |

**Invariante:** Die aus den 8 YAMLs gerenderte Reihenfolge + Feldmenge MUSS
identisch zum IST-`pxz_team_doctors()`-Output sein (AK-11: Dry-Run-Parität).

---

## §5 Schnittstellen

### 5.1 `adapters/wordpress/build-team.mjs`

**Usage:** `bun adapters/wordpress/build-team.mjs`

**Input:** keine CLI-Args (liest immer alle `trunk/content/team/*.yaml`).

**Output:** Payload-JSON auf stdout:
```json
{
  "asset": {
    "path": "inc/data/team.json",
    "value": "<team-array-als-json-string-mit-trailing-newline>"
  },
  "meta": {
    "source_count": 8,
    "generated_at": "2026-04-23T...",
    "schema_version": "team-member.schema.json"
  }
}
```

**Exit-Codes:** 0 success · 1 IO/YAML · 2 Schema-Validation · 3 Render-Error.

### 5.2 `adapters/wordpress/team-to-wp.mjs`

**Usage:** `... | bun adapters/wordpress/team-to-wp.mjs`

**Input (stdin):** Payload-JSON aus build-team.

**Env:**
- `THEME_PATH` (optional) — Override Theme-Root-Pfad. Default:
  `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum`
  (aus THEME_POINTER.md, Local-WP auf Cluster-Mini-02).

**Output:** Summary-JSON auf stdout:
```json
{
  "theme_path": "<abs>",
  "target_path": "<abs>/inc/data/team.json",
  "action": "create" | "update",
  "size_bytes": 1234,
  "backup_path": "adapters/wordpress/.backups/<ts>_team.json" | null,
  "generated_at": "..."
}
```

**Exit-Codes:** 0 · 1 config/IO · 2 backup-fail · 3 write-fail.

### 5.3 `tools/sync-team-wp.sh`

Orchestrator (analog `sync-template-shopify.sh`):
```bash
bash tools/sync-team-wp.sh
# optional: THEME_PATH=<abs> bash tools/sync-team-wp.sh
```

### 5.4 `tools/cw-transfer push wp:template trunk/content/team/`

Neuer Dispatch-Eintrag in `PUSH_TOOLS`:
```js
"wp:template": "tools/sync-team-wp.sh"
```

Argument-Konvention für `wp:template`: Ordner-Pfad (nicht einzelne YAML), weil der
Team-Build alle 8 YAMLs zusammen rendert. `sync-team-wp.sh` akzeptiert und ignoriert
den Ordner-Argument für Zukunftskompatibilität.

### 5.5 Theme-Patch `inc/team-data.php`

**Neue Funktion:**
```php
function pxz_team_doctors_from_json() {
    static $cache = null;
    if ( $cache !== null ) return $cache;
    $file = PXZ_PATH . '/inc/data/team.json';
    if ( ! is_readable( $file ) ) return null;
    $raw = file_get_contents( $file );
    $data = json_decode( $raw, true );
    if ( ! is_array( $data ) ) return null;
    $cache = $data;
    return $cache;
}
```

**`pxz_team_doctors()`** wird minimal angepasst:
- Erste Zeile: `$json = pxz_team_doctors_from_json();`
- Falls `$json` != null: normalize + profile_url-Derivation (wie IST) + return
- Sonst: Fallback auf Inline-Array (unverändert, nur als Notbetrieb)

Helper-Funktionen (`pxz_doctor_slugs`, `pxz_doctor_by_slug`, `pxz_is_sanexio_uri`,
`pxz_render_other_doctors`) rufen intern weiter `pxz_team_doctors()` auf — sie
sehen den Umbau nicht.

---

## §6 CW-Regel-Konformität

| Regel | Einhaltung |
|---|---|
| CW-001 Trunk ist Master | ✅ — Trunk-YAMLs werden Quelle, Theme-Array wird Derivat |
| CW-002 Schema-Validation | ✅ — AJV gegen team-member.schema.json vor Render |
| CW-003 Lokale Originale | n.a. — keine Medien in N-1 |
| CW-004 i18n I-2 hybrid | ✅ — .de-Lookup (Praxis-Kanon), Top-Level-Fields 1:1 |
| CW-005 Plattform-Trennung | ✅ — nur Praxis-View, keine Juvantis-Überlagerung |
| CW-006 Gerichteter Transfer | ✅ — explizit `push wp:template`, kein Auto-Sync |
| CW-007 Trunk alleinige Brücke | ✅ — kein Shopify-WP-Direktzugriff |
| CW-008 Backup vor Push | ✅ — `.backups/<ts>_team.json` bei update |

---

## §7 Akzeptanzkriterien (13)

| # | AK | Messung |
|---:|---|---|
| 1 | Spec-Datei mit ≥ 7 §-Abschnitten | grep `^## §` |
| 2 | `build-team.mjs` ≥ 150 Z., AJV-Validation aller 8 YAMLs | wc -l + grep `Ajv` |
| 3 | `team-to-wp.mjs` ≥ 80 Z., CW-008-Backup vor Write | wc -l + grep `.backups` |
| 4 | Renderer `lib/renderers/team-praxis.mjs` erzeugt 8 Einträge aus YAMLs | stdout-Check `source_count: 8` |
| 5 | Schema-Mapping deckt alle PHP-IST-Felder ab (slug/name/title/languages/intro/image_id/accent/profile_url) | grep im Renderer |
| 6 | Bei `update`-Action: `.backups/<ts>_team.json` existiert | ls |
| 7 | Theme `inc/team-data.php` gepatcht: JSON-first, Inline-Fallback | grep `pxz_team_doctors_from_json\|team.json` |
| 8 | `tools/sync-team-wp.sh` existiert, orchestriert build → write | Datei + bash syntax-check |
| 9 | `tools/cw-transfer` registriert `wp:template` + `wordpress.template.praxis` als `stable` im RENDERER_REGISTRY | grep |
| 10 | `bash tools/validate.sh` grün | Exit 0 |
| 11 | **Dry-Run-Parität:** gerenderter JSON-Array (decoded) inhaltlich = Output von `pxz_team_doctors()` (8 Einträge, gleiche Felder pro Eintrag, gleiche Reihenfolge) | PHP-side compare via `php -r 'include ...; echo json_encode(...);'` und `diff` gegen adapter-JSON |
| 12 | **Live-Test Local-WP nach Theme-Patch:** `curl /team/ | grep -c 'pxz-team-card'` = 8; 3 Doctor-Slugs in Response nachweisbar | curl + grep |
| 13 | Evidence-Datei unter `specs/cross-site-transfer/evidence/2026-04-23_n-1_self-check.md` + Commit(s) | ls + git log |

---

## §8 Scope-Verbote (nicht in N-1)

- Kein Media-ID-Resolver (image_id bleibt 0 in Phase 0).
- Kein Push auf Production (`westend-hausarzt.com`). Nur Local-WP.
- Kein N-6.3 (`diff wp:template`) — eigene Folge-Front.
- Keine WP-REST-Abhängigkeit (N-1 ist reiner Filesystem-Adapter).
- Keine Änderung an Template-Dateien außer `inc/team-data.php`.
- Keine Entfernung des Inline-Arrays (bleibt als dokumentierter Fallback).
