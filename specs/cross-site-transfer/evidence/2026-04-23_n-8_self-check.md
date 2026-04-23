# N-8 Self-Check Evidence — 2026-04-23 Session 27

**Session:** 27 (autonom, Cluster-Mini-02 M2)
**Task:** Pattern-A-vs-B-Guard in `adapters/shopify/pages-to-shopify.mjs`
**Spec:** `specs/cross-site-transfer/N-8_pattern-a-vs-b-guard.md`

---

## Verify-Runs

### R-1 `tools/validate.sh`

```
validate: trunk/content/products/bluttests/basic-check.yaml
validate: OK (1 file(s))
```

Exit 0. ✅

### R-2 Syntax-Load-Probe (leerer Stdin)

```
$ echo "" | bun adapters/shopify/pages-to-shopify.mjs
ADAPTER_ERROR: no payload on stdin — pipe output of build-page.mjs
exit=1
```

Adapter lädt, parst, erreicht den ersten Input-Guard → Exit 1. ✅

### R-3 Bundle-Build

```
$ bun build --target=bun adapters/shopify/pages-to-shopify.mjs --outfile=/tmp/pages-to-shopify.bundle.mjs
Bundled 2 modules in 30ms
  pages-to-shopify.bundle.mjs  6.88 KB  (entry point)
```

Bundler durchgelaufen, keine Import- oder Syntax-Fehler. ✅

### R-4 Größen-Delta

| Datei | Vorher | Nachher | Δ |
|---|--:|--:|--:|
| `adapters/shopify/pages-to-shopify.mjs` | 166 Z. | 191 Z. | +25 |
| `tools/sync-page-shopify.sh` | 57 Z. | 59 Z. | +2 |
| `specs/cross-site-transfer/N-8_pattern-a-vs-b-guard.md` | — | 125 Z. | +125 (neu) |
| `specs/cross-site-transfer/evidence/2026-04-23_n-8_self-check.md` | — | dieses File | neu |

---

## Akzeptanzkriterien-Selbstprüfung (Spec §3)

| # | Kriterium | Ergebnis | Beleg |
|:--:|---|:--:|---|
| AK-1 | Spec-Dokument `N-8_pattern-a-vs-b-guard.md` existiert mit §1–§4 | ✅ | `specs/cross-site-transfer/N-8_pattern-a-vs-b-guard.md` (125 Z., §1–§4) |
| AK-2 | Lookup fragt `template_suffix` als zusätzliches Feld ab | ✅ | Zeile 95: `fields=id,handle,published_at,title,updated_at,template_suffix` |
| AK-3 | Neuer Env-Flag `ALLOW_PATTERN_OVERRIDE` wird gelesen | ✅ | Zeile 77: `const allowPatternOverride = process.env.ALLOW_PATTERN_OVERRIDE === "1";` |
| AK-4 | Pattern-B-Guard greift im `pages.length === 1`-Zweig VOR published-Check | ✅ | Zeile 121–131 (Guard) vor Zeile 133–136 (isPublished-Check) |
| AK-5 | Bei `isPatternB && !allow` → `die(2, ...)` mit Message, die `template_suffix`-Wert + Flag-Hinweis enthält | ✅ | Zeile 130: `...is Pattern B (template_suffix="${liveTemplateSuffix}")... Set ALLOW_PATTERN_OVERRIDE=1 to proceed.` |
| AK-6 | Bei `isPatternB && allow=1` → Push fortfahren (kein early-exit) | ✅ | Code-Review: Guard ist `if (isPatternB && !allowPatternOverride) die(...)` — bei `allow=1` fällt der Zweig durch, Control läuft zu Zeile 133 weiter |
| AK-7 | Bei `!isPatternB` (Pattern A / null / "") → unverändertes Verhalten | ✅ | Code-Review: `isPatternB` ist `typeof "string" && !== ""` — null/undefined/"" aus Shopify bleiben alle false, Control läuft identisch zu pre-N-8 weiter |
| AK-8 | Bei `pages.length === 0` (create) → kein Pattern-Check, Summary setzt `live_template_suffix=null` | ✅ | Zeile 107 initialisiert `liveTemplateSuffix = null`, Create-Zweig (Z. 114–117) modifiziert es nicht, Summary-Zeile 187 liefert `null` aus |
| AK-9 | Summary enthält IMMER `live_template_suffix` + `pattern_override` | ✅ | Zeile 187–188 sind außerhalb jedes conditionals, immer im Summary |
| AK-10 | Adapter-Header + `sync-page-shopify.sh`-Header dokumentieren den neuen Flag | ✅ | Adapter-Header Z. 14–17 (Pattern-B-guard-Block) + Z. 23–24 (Env-Tabelle). Shell-Wrapper Z. 12–14. |
| AK-11 | `tools/validate.sh` grün + Bundle-Build grün | ✅ | R-1 + R-3 oben |

**Selbstprüfung: 11/11 AK = 100 %** ✅

---

## Bonus-Betrachtung — Verhalten in 4 Szenarien (gedanklich durchgespielt)

| # | Szenario | `template_suffix` Live | `ALLOW_PATTERN_OVERRIDE` | Erwartung | Belegt durch |
|:--:|---|---|---|---|---|
| S-1 | Neue Page | n/a (Create) | — | POST läuft, Summary `live_template_suffix=null` | AK-8 |
| S-2 | Update Pattern-A-Page | `null` oder `""` | — | Guard inaktiv, Publish-Check wie bisher, Backup + PUT | AK-7 |
| S-3 | Update Pattern-B-Page, kein Flag | z.B. `"uber-uns"` | unset/≠1 | **Exit 2 mit klarer Message** | AK-5 + Z. 130 |
| S-4 | Update Pattern-B-Page, Flag gesetzt | z.B. `"uber-uns"` | `1` | Guard fällt durch, Publish-Check greift, Backup schreibt, PUT läuft. Summary zeigt `live_template_suffix="uber-uns"` + `pattern_override=true` | AK-6 + AK-9 |

Der Live-Test (reale Shopify-Operation für S-3/S-4) wird bewusst NICHT autonom
durchgeführt (CW-006 — gerichteter expliziter Transfer nur durch Operator).
Stattdessen wird S-3 beim nächsten realen Push-Versuch gegen `/uber-uns` als
natürlicher Integrationstest greifen.

---

## Bezug zum N-6-Befund

N-6-Diff (Session 26) hat gegen `sanexio.eu/pages/uber-uns` exakt das Szenario S-3
beschrieben:

```
template_suffix DIFFER (live="uber-uns" ≠ trunk=null)
body_html DIFFER (live=0 chars, trunk=8505 chars)
```

Nach N-8 würde ein `bash tools/sync-page-shopify.sh trunk/content/pages/_shared/ueber-uns.yaml`
mit `ALLOW_OVERWRITE=1` (published-Page akzeptiert) jetzt vorher am Pattern-B-Guard
scheitern:

```
ADAPTER_ERROR: update failed: target page handle="uber-uns" id=157742137611 is Pattern B (template_suffix="uber-uns") — a Pattern-A push would discard the theme binding. Set ALLOW_PATTERN_OVERRIDE=1 to proceed.
```

Das ist das beabsichtigte Verhalten. Der Operator sieht den Grund sofort und
kann entweder bewusst konvertieren (Flag setzen) oder das Problem an der Wurzel
lösen (Pattern-B-Renderer in `template-to-shopify.mjs` via `sync-template-shopify.sh`).

---

## Status

- Spec: ✅
- Code: ✅ (+25 Z. Adapter, +2 Z. Shell-Wrapper)
- Self-Check: 11/11 AK = 100 %
- Live-Verify: bewusst zurückgehalten (CW-006)
- Commit: folgt in derselben Session
