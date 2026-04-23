# N-6 — `cw-transfer diff` (Build → Fetch → Diff)

**Status:** In Umsetzung (Session 26, 2026-04-23)
**Aufwand:** ~1 Session
**Abhängigkeiten:** content-bridge-v1 ✅ · cross-site-transfer ARCHITECTURE/PATTERNS ✅ · `pages-to-shopify.mjs` (N-5/N-7) ✅
**Dr.-Stracke-Freigabe:** Session 26 Front-Wahl „Patt → N-6", Scope-Bestätigung „MVP shopify:page only"

---

## §1 Verständnis

### IST (vor N-6)

- `cw-transfer push shopify:page <yaml>` schreibt Trunk → Site
- `cw-transfer pull shopify:page <handle>` holt Site → Proto-Trunk
- `cw-transfer diff <spec> <arg>` ist als Verb registriert, aber `cmdDiff`
  ist Stub: `process.stderr.write("not yet implemented"); process.exit(1)`
- Konsequenz: Es gibt **keinen Weg**, vor einem `push` zu sehen, ob er
  überhaupt etwas verändern würde. Operator muss live pushen + per
  Augenmaß im Shopify-Admin vergleichen — was CW-008 (Backup) und
  CW-006 (gerichteter expliziter Transfer) widerspricht: man pusht
  eventuell für nichts.

### Probleme, die N-6 löst

1. **Pre-Push-Verifikation fehlt:** Vor jedem Trunk-Push will man wissen
   „würde sich überhaupt was ändern?". Heute nur durch Live-Push erkennbar.
2. **Drift-Erkennung fehlt:** Wenn jemand im Shopify-Admin manuell editiert
   (Verstoß gegen CW-001), muss man das erkennen können — dafür ist
   ein read-only Vergleich nötig.
3. **Backup-Ergänzung:** N-7 backup-pre-write greift erst beim Push.
   Mit `diff` kann man pre-Push entscheiden, ob ein Push überhaupt
   nötig ist — Backup-Häufigkeit sinkt automatisch.

### Nicht-Scope (MVP)

- `shopify:template` — Pattern B Diff-Logik ist anders (Asset-JSON-Diff,
  nicht Page-Field-Diff). Folge-Front (N-6.2).
- `shopify:product` — Product-Diff hat eigene Felder/Variants. Folge-Front.
- `wp:page` — symmetrische Diff-Logik für WP-Seiten. Folge-Front (N-6.3).
- Visuelle Diffs (Screenshots, Pixel-Vergleich) — Review-Pipeline (separat).

---

## §2 Lösungsdesign

### F-1 Datenfluss

```
Trunk-YAML (z.B. ueber-uns.yaml)
  ↓ spawn: bun adapters/shopify/build-page.mjs <yaml>
  ↓ stdout (capture)
Local-Payload  { page: { handle, title, body_html, published, template_suffix, ... } }
                                                                                |
SHOPIFY_STORE + SHOPIFY_ADMIN_TOKEN                                             |
  ↓ GET /admin/api/<v>/pages.json?handle=<handle>                               |
Live-Page  { id, handle, title, body_html, published_at, template_suffix, ... } |
                                                                                v
                                              Field-by-field comparison
                                                                                |
                                                                                v
                                              Text-or-JSON diff output
                                              Exit 0 (identical) / 1 (diff) / 2 (error)
```

### F-2 Vergleichsregeln pro Feld

| Feld | Vergleich | Hinweis |
|---|---|---|
| `handle` | string-equal | implizit identisch (Lookup-Schlüssel) |
| `title` | string-equal | exakter Vergleich |
| `body_html` | length-Delta + Char-Diff (erste Diff-Position) | volle Diffs sind zu groß für Terminal |
| `template_suffix` | string-equal | `null` ↔ `null`, beachte Shopify liefert `""` ≈ `null` |
| `published` | **konditional**: nur vergleichen wenn `PUBLISH=1` | Default: Trunk=draft, Live oft=published — erwartete Differenz, kein Diff-Treffer |
| `author` | ignoriert | site-bestimmt, nicht trunk-relevant |
| `created_at`/`updated_at` | ignoriert | site-bestimmt |
| `id` | ignoriert | site-bestimmt |

### F-3 Spezialfall: Live-Page existiert nicht

Wenn `pages.json?handle=<h>` 0 Treffer liefert: Output „ABSENT — push
would CREATE", Exit-Code 1 (= Diff-Vorhanden, weil ein Push nicht
no-op wäre).

### F-4 Output-Modi

**Default (text):** human-lesbar, kompakt:
```
cw-transfer diff shopify:page trunk/content/pages/_shared/ueber-uns.yaml
> handle           : ueber-uns
> live_page_id     : 157742137611
> title            : EQUAL ("Über uns")
> template_suffix  : EQUAL ("uber-uns")
> body_html        : DIFFER (local 12345 chars, live 12340 chars, first diff at offset 4231)
> published        : SKIPPED (PUBLISH not set)
RESULT: DIFF (1 field)
```

**JSON-Modus (`FORMAT=json`):** strukturiert für Tooling-Integration:
```json
{
  "spec": "shopify:page",
  "source": "trunk/content/pages/_shared/ueber-uns.yaml",
  "handle": "ueber-uns",
  "live": { "exists": true, "id": 157742137611 },
  "fields": {
    "title": { "equal": true, "local": "Über uns", "live": "Über uns" },
    "body_html": { "equal": false, "local_length": 12345, "live_length": 12340, "first_diff_offset": 4231 },
    "template_suffix": { "equal": true, "value": "uber-uns" },
    "published": { "skipped": true, "reason": "PUBLISH env not set" }
  },
  "result": "DIFF",
  "diff_count": 1
}
```

### F-5 Read-Only-Garantie (CW-001/008)

`diff-page.mjs` darf NUR `client.get()` aufrufen — keine `post`/`put`/`delete`.
Selbsttest in §4 prüft das per `grep`.

### F-6 Architektur-Konsequenz

`cmdDiff` in `cw-transfer` wird symmetrisch zu `cmdPush`/`cmdPull`:
- Dispatch-Tabelle `DIFF_TOOLS = { "shopify:page": "adapters/shopify/diff-page.mjs", ... }`
- Spawnt `bun <tool> <yaml>` mit `stdio: "inherit"`
- Übernimmt den Exit-Code des Sub-Prozesses (0/1/2)

---

## §3 Umsetzung

### T-1 Spec
Diese Datei.

### T-2 `adapters/shopify/diff-page.mjs` (NEU)

- Imports: `node:child_process` (spawnSync), `node:path`, `./lib/shopify-rest-client.mjs`
- Argv: `<trunk-yaml-path>`
- Schritt A: `spawnSync("bun", ["adapters/shopify/build-page.mjs", yamlPath])` mit `stdio: ["ignore", "pipe", "inherit"]`
  - Bei Sub-Exit ≠ 0: Exit 2 mit Pass-Through-Code
  - stdout = Local-Payload-JSON
- Schritt B: `JSON.parse(stdout)` → `local.page`
- Schritt C: GET `/pages.json?handle=<handle>&fields=id,handle,title,body_html,published_at,template_suffix`
- Schritt D: Field-Compare gemäß F-2
- Schritt E: Output je nach `process.env.FORMAT` (text default, json optional)
- Exit-Code: 0 wenn alle Felder equal, 1 wenn ≥ 1 Diff, 2 bei Error

### T-3 `tools/cw-transfer` (MOD)

- `DIFF_TOOLS = { "shopify:page": "adapters/shopify/diff-page.mjs" }`
- `cmdDiff(spec, target)`:
  ```js
  if (!target) die(1, `diff: missing trunk-yaml argument`);
  const tool = DIFF_TOOLS[spec];
  if (!tool) die(1, `diff: no diff-tool registered for "${spec}" (try: cw-transfer list)`);
  runShell("bun", [tool, target]);
  ```
- `printHelp()` Block aktualisieren: `diff` ist jetzt produktiv für `shopify:page`

### T-4 Header-Doku in `diff-page.mjs`
Selbst-erklärend mit Env-Vars, Exit-Codes, Read-Only-Garantie, Beispiel-Aufruf.

### T-5 KEIN Wrapper-Shell-Script
Im Gegensatz zu `tools/sync-page-shopify.sh` gibt es **kein** `tools/diff-page-shopify.sh`. Begründung: `cw-transfer diff shopify:page <yaml>` ist bereits idiomatisch und kurz; ein zweites Wrapper-Script wäre Boilerplate-Drift.

---

## §4 Selbstprüfung — Akzeptanzkriterien

| # | AK | Prüfmethode |
|:-:|---|---|
| AK-1 | Spec-Datei existiert + 4 Dr-Stracke-Section-Format (Verständnis/Lösungsdesign/Umsetzung/Selbstprüfung) | `ls + grep` |
| AK-2 | `adapters/shopify/diff-page.mjs` existiert + ≥ 100 Zeilen produktiv | `wc -l` |
| AK-3 | `cmdDiff` in `cw-transfer` ist nicht mehr "not yet implemented" | `grep "not yet implemented" cw-transfer` = 0 |
| AK-4 | `DIFF_TOOLS["shopify:page"]` zeigt auf `diff-page.mjs` | `grep` |
| AK-5 | Read-Only: `diff-page.mjs` enthält keine `client.post`/`client.put`/`client.delete` | `grep -E "client\.(post\|put\|delete)" diff-page.mjs` = 0 |
| AK-6 | `diff-page.mjs` spawnt `build-page.mjs` (Reuse statt Duplikation) | `grep "build-page.mjs" diff-page.mjs` ≥ 1 |
| AK-7 | Help-Text in `cw-transfer` listet `diff` als verfügbar (nicht mehr nur `push`/`pull`) | bun cw-transfer help \| grep diff |
| AK-8 | Aufruf ohne `SHOPIFY_STORE` Env → Exit 1 mit Config-Fehler (nicht stiller Stack-Trace) | bun diff-page.mjs <yaml> ohne env |
| AK-9 | Aufruf ohne YAML-Argument → Exit 1 mit Usage-Fehler | bun diff-page.mjs |
| AK-10 | Aufruf mit existierendem YAML → spawnt build-page.mjs → bekommt valides Payload | Echo-Marker im Sub-Spawn |
| AK-11 | `tools/validate.sh` bleibt grün | exit 0 |
| AK-12 | Bundle-Build: `bun build adapters/shopify/diff-page.mjs --target=bun` läuft fehlerfrei | exit 0 |

**Live-Verify NICHT in §4 enthalten** — das wäre ein echter Live-Diff
gegen `sanexio.eu/pages/uber-uns`. Setzt funktionierende `.env.local`
voraus, ist aber nicht für die N-6-Selbstprüfung notwendig (CW-006:
Live-Push/Verify ist eigene Operation, nicht implizit Teil eines
Adapter-Tasks).

---

## §5 Ergebnis-Ort

- Spec: `specs/cross-site-transfer/N-6_cw-transfer-diff.md` (diese Datei)
- Code: `adapters/shopify/diff-page.mjs` + `tools/cw-transfer` (MOD)
- Evidence: `specs/cross-site-transfer/evidence/2026-04-23_n-6_self-check.md`

---

## §6 Pattern-Kandidat → Nexus

`build-then-fetch-then-diff` — Generelle Architektur für read-only
Adapter-Diffs ohne Code-Duplikation: der Diff-Adapter spawnt den
Build-Adapter (statt dessen Render-Logik zu duplizieren) und ruft
selbst nur GET-APIs auf. Anwendbar auf alle Cross-Site-Adapter mit
Push-Pendant. Pattern-Anlage in Session-Ende prüfen.

---

*Autor: Claude (Architekten-Modus, Session 26, autonom auf Cluster-Mini-02). Dr.-Stracke-Freigabe: „JA" auf Plan Block 1+2 + Scope MVP shopify:page.*
