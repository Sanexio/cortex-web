# N-6 Self-Check — `cw-transfer diff shopify:page`

**Spec:** `specs/cross-site-transfer/N-6_cw-transfer-diff.md`
**Datum:** 2026-04-23 (Session 26, Cluster-Mini-02, autonom)
**Theme/Adapter-Stand:** content-bridge-v1 + N-5/N-7 (Session 24) + N-6 (diese Session)

---

## Akzeptanzkriterien — Stand

| # | AK | Erwartet | Gemessen | Status |
|:-:|---|---|---|:-:|
| AK-1 | Spec existiert + ≥4 §-Sections | ≥4 | 6 | ✅ |
| AK-2 | `diff-page.mjs` ≥100 produktive Zeilen | ≥100 | 240 | ✅ |
| AK-3 | „not yet implemented" entfernt | grep -c = 0 | 0 | ✅ |
| AK-4 | DIFF_TOOLS-Eintrag `shopify:page` → `diff-page.mjs` | vorhanden | `tools/cw-transfer:93` | ✅ |
| AK-5 | Read-only: `client.X(` (Aufruf-Pattern) für post/put/delete | 0 | 0 | ✅ |
| AK-6 | `build-page.mjs` reused (nicht dupliziert) | ≥1 | 6 Erwähnungen | ✅ |
| AK-7 | Help-Text: `diff` ist produktiv gelistet | vorhanden | 4 Zeilen | ✅ |
| AK-8 | ohne SHOPIFY_STORE → exit 1 + Config-Fehler | exit 1 | exit 1, `DIFF_ERROR: env SHOPIFY_STORE missing …` | ✅ |
| AK-9 | ohne YAML-Argument → exit 1 + Usage | exit 1 | exit 1, `DIFF_ERROR: usage: bun diff-page.mjs <path-to-trunk-yaml>` | ✅ |
| AK-10 | Success-Pfad: spawnt build, fetched live, erzeugt Diff | full pipeline | siehe Live-Run unten | ✅ |
| AK-11 | `tools/validate.sh` bleibt grün | exit 0 | `validate: OK (1 file(s))` | ✅ |
| AK-12 | Bundle-Build mit `bun build … --target=bun` | exit 0 | `Bundled 2 modules in 6ms · 7.53 KB` | ✅ |

**Gesamtscore: 12/12 = 100 %**

---

## Live-Run (AK-10 + bonus)

### Aufruf
```bash
cd ~/Cortex/projects/Cortex-Web
bun adapters/shopify/diff-page.mjs trunk/content/pages/_shared/ueber-uns.yaml
```

### Output (text-Modus)
```
spec             : shopify:page
source           : trunk/content/pages/_shared/ueber-uns.yaml
handle           : uber-uns
live_page_id     : 157742137611
live_updated_at  : 2026-04-22T20:46:28+02:00
title            : EQUAL (local="Ärzte & Team", live="Ärzte & Team")
template_suffix  : DIFFER (local=null, live="uber-uns")
body_html        : DIFFER (local 8505 chars, live 0 chars, first diff at offset 0)
published        : SKIPPED (PUBLISH env not set — Trunk-draft vs. Site-published is expected (CW-001))
RESULT           : DIFF (2 fields)
EXIT=1
```

### Output (FORMAT=json)
```json
{
  "spec": "shopify:page",
  "source": "trunk/content/pages/_shared/ueber-uns.yaml",
  "handle": "uber-uns",
  "live": { "exists": true, "id": 157742137611, "updated_at": "2026-04-22T20:46:28+02:00" },
  "fields": {
    "title":           { "equal": true,  "local": "Ärzte & Team", "live": "Ärzte & Team" },
    "template_suffix": { "equal": false, "local": null, "live": "uber-uns" },
    "body_html":       { "equal": false, "local_length": 8505, "live_length": 0, "first_diff_offset": 0 },
    "published":       { "skipped": true, "reason": "PUBLISH env not set — Trunk-draft vs. Site-published is expected (CW-001)" }
  },
  "result": "DIFF",
  "diff_count": 2
}
```

### `cw-transfer diff` Dispatch-Smoke
```bash
bun tools/cw-transfer diff shopify:page trunk/content/pages/_shared/ueber-uns.yaml
# → identischer Output wie direkter Aufruf (cmdDiff dispatcht korrekt auf diff-page.mjs)
```

---

## Bonus-Erkenntnis (Drift-Detection als Real-World-Wert)

Die Live-Page `/uber-uns` wurde in Session 22 als **Pattern B (Template-Based)**
deployed: `template_suffix="uber-uns"` + `body_html=""` (Content liegt im
Theme-Template-Asset `templates/page.uber-uns.json`).

Der Trunk-YAML `ueber-uns.yaml` ist auch für **Pattern A (body_html)**
build-bar (über `build-page.mjs` + `pages-to-shopify.mjs`). Würde man
heute `cw-transfer push shopify:page` mit derselben YAML aufrufen,
würde man die Pattern-B-Page mit Pattern-A-Content überschreiben:
- `template_suffix` würde von `"uber-uns"` auf `null` gesetzt
- `body_html` würde von `""` auf 8505 chars gesetzt
- → Pattern-B-Template-Asset wäre weiterhin im Theme, aber die Page
  würde es nicht mehr verwenden (Drift)

**Genau diese Drift macht N-6 sichtbar.** Ohne `diff` würde der Operator
das erst nach dem Push (oder gar nicht) bemerken. CW-008-Backup würde
greifen, aber der Verlust wäre real.

→ Dies ist **kein N-6-Bug**, sondern der Grund, warum `cw-transfer diff`
als Pre-Push-Verifikation existiert. Empfohlene Folgehandlung:
- **Nicht `push shopify:page`** für `ueber-uns` benutzen — die Page ist
  Pattern B, daher gehört der Push-Pfad zu `push shopify:template`.
- Oder `pages-to-shopify.mjs` um eine „skip if template_suffix is set"-
  Schutzregel ergänzen (separater Sub-Task, nicht N-6-Scope).

---

## Read-Only-Garantie (CW-001/008)

```bash
$ grep -nE 'client\.(post|put|delete)\(' adapters/shopify/diff-page.mjs
# (kein Output → 0 Aufruf-Pattern)
```

Einziges textuelles Match (in einem Kommentar Zeile 21) ist die
Negativ-Dokumentation der Read-Only-Garantie:
```js
// no client.post/put/delete code path in this file. The build sub-process
```

---

## Build-Output (AK-12)

```bash
$ bun build adapters/shopify/diff-page.mjs --target=bun --outfile=/tmp/diff-page.bundle.js

  diff-page.bundle.js  7.53 KB  (entry point)

Bundled 2 modules in 6ms
```

---

## Pre-Flight am Session-Ende

```bash
$ bash tools/validate.sh
validate: trunk/content/products/bluttests/basic-check.yaml
validate: OK (1 file(s))
```

```bash
$ bash ~/Cortex/Nexus/tools/cortex-sanitizer/rotate.sh --probe
Alle Dateien im Budget (LL-044).
```

(Sanitizer-Probe kommt am Session-Ende erneut, um die Auswirkung der
neuen Spec + Code zu verifizieren.)

---

*Autor: Claude (Architekten-Modus, Session 26, autonom Cluster-Mini-02). Selbstprüfung 12/12 = 100 %.*
