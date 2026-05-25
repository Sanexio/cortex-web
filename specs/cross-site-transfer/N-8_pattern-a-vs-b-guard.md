# N-8 — Pattern-A-vs-B-Guard in `pages-to-shopify.mjs`

**Status:** In Umsetzung (Session 27, 2026-04-23)
**Aufwand:** ~30 Min
**Abhängigkeiten:** N-5 (`PUBLISH=1`) ✅ · N-7 (CW-008-Backup) ✅ · N-6 (`cw-transfer diff`) ✅
**Auslöser:** Session 26 Live-Test — N-6-Diff gegen `<distribution-domain>/pages/uber-uns` zeigte `template_suffix DIFFER` (live="uber-uns" ↔ trunk=null/""). Ein naiver Re-Push via `cw-transfer push shopify:page` würde die Pattern-B-Page mit Pattern-A-Content überschreiben.
**Freigabe:** „du darfst entscheiden" (Tenant-Operator, Session 27) — autonome Front-Wahl Claude.

---

## §1 Verständnis

### IST (vor N-8)

- `adapters/shopify/pages-to-shopify.mjs` aktualisiert eine existierende Shopify-Page
  via `PUT /pages/<id>.json` mit dem Trunk-Build-Payload.
- Schutz-Layer heute:
  - **CW-001** (Z. 74–77): Trunk-Payload muss `published=false` haben (Sanity-Check
    am Adapter-Eingang).
  - **ALLOW_OVERWRITE** (Z. 110–112): published Live-Pages brauchen expliziten Flag.
  - **CW-008 Backup** (Z. 115–135, N-7): Full-Page-Dump vor PUT.
  - **Pattern-B-Schutz:** **keiner.**
- Konsequenz: Eine Live-Page, die Pattern B ist (`template_suffix="uber-uns"`,
  `body_html=""`, Rendering aus Theme-Section-Blocks), wird vom Push eines
  Pattern-A-Payloads (YAML-`sections[]` → `body_html` mit ~8500 Chars, `template_suffix=null`)
  überschrieben. Das Backup wird korrekt angelegt (CW-008 hält), aber:
  - Das `template_suffix`-Setting auf der Page wird entfernt (Shopify akzeptiert `null`).
  - Die Page rendert sofort aus dem neuen `body_html` statt aus dem Theme-Template.
  - Pattern-B-Konfiguration muss manuell wiederhergestellt werden (Admin → Online Store → Pages → Template).

### Probleme, die N-8 löst

1. **Unbeabsichtigte Pattern-Konversion B → A:** Aktuell ist sie im Weg „default",
   obwohl Pattern B der Goldstandard ist (PATTERNS.md §Pattern B).
2. **Silent Loss of Theme-Binding:** Der Operator sieht kein Warnsignal vor dem
   Overwrite; der Fehler wird erst im Browser sichtbar.
3. **Asymmetrie mit N-6:** N-6-Diff zeigt den Drift read-only. Der Push-Pfad hat
   aber keinen korrespondierenden Block.

### Nicht-Scope

- Automatische B→A-Migration (z.B. Template-Asset-Cleanup) — bewusst manuell.
- WP-Page-Adapter — N-1 ist separate Front.
- Template-Adapter-Push (`template-to-shopify.mjs`) — hat andere Semantik
  (Asset-Overwrite ist dort der Zweck).

---

## §2 Lösungsdesign

### F-1 Datenfluss

```
Env: ALLOW_PATTERN_OVERRIDE (optional, "1")
       │
       ▼
Lookup-Response: { pages: [ { id, handle, published_at, title, updated_at,
                              template_suffix } ] }             ← +template_suffix
       │
       ▼ nur wenn pages.length === 1
Check: isPatternB = template_suffix != null && template_suffix !== ""
       │
       ├── isPatternB && !ALLOW_PATTERN_OVERRIDE  → die(2, Pattern-Guard-Message)
       │
       └── sonst → weiter (bestehende published-Prüfung, Backup, PUT)
```

### F-2 Wo greift der Guard?

Neuer Block **im `else if (pages.length === 1)`-Zweig**, **VOR** dem
`isPublished`/`ALLOW_OVERWRITE`-Check (Z. 107–112). Reihenfolge:

1. Pattern-B-Guard (neu, N-8)
2. Publish-Guard (bestehend, N-5-Vorgänger)
3. CW-008 Backup (bestehend, N-7)
4. PUT (bestehend)

Begründung: Pattern-Konversion ist die „gröbere" Aktion als ein simpler Publish-Overwrite.
Wenn Pattern-B-Seite vorliegt, ist der Abbruch immer richtig — auch wenn die Page
unpublished ist. Die Publish-Prüfung ist irrelevant, wenn der Pattern-Check eh
scheitert.

### F-3 Summary-Output

Zwei neue Felder, **immer** im Summary (auch bei Create):

- `live_template_suffix`: string oder null — das Feld wie vom Lookup gemeldet.
  Bei Create: `null` (keine Live-Page vorhanden).
- `pattern_override`: boolean — ob `ALLOW_PATTERN_OVERRIDE=1` gesetzt war.
  Bei Create oder Pattern-A-Page: irrelevant, aber zur Auditierbarkeit mitgeliefert.

### F-4 Lookup-Fields

`fields=id,handle,published_at,title,updated_at,template_suffix` — **ein** zusätzliches
Feld, **kein** Extra-Request. API-Kosten unverändert.

### F-5 Header-Doku

Adapter-Header-Comment + `tools/sync-page-shopify.sh`-Header dokumentieren den
neuen Flag. Kein separates `.env.local.template`-Update (Flag ist Operator-RUN-time,
nicht Config).

---

## §3 Akzeptanzkriterien (11 AKs)

| # | Kriterium | Verify-Methode |
|:--:|---|---|
| AK-1 | Spec-Dokument `N-8_pattern-a-vs-b-guard.md` existiert mit §1–§4 | `ls` |
| AK-2 | Lookup fragt `template_suffix` als zusätzliches Feld ab | `grep template_suffix pages-to-shopify.mjs` |
| AK-3 | Neuer Env-Flag `ALLOW_PATTERN_OVERRIDE` wird gelesen | `grep ALLOW_PATTERN_OVERRIDE pages-to-shopify.mjs` |
| AK-4 | Pattern-B-Guard greift im `pages.length === 1`-Zweig VOR published-Check | Code-Review + Linien-Reihenfolge |
| AK-5 | Bei `isPatternB && !allow` → `die(2, ...)` mit Message, die `template_suffix`-Wert + Flag-Hinweis enthält | grep nach Error-Message-Text |
| AK-6 | Bei `isPatternB && allow=1` → Push fortfahren (kein early-exit) | Code-Review |
| AK-7 | Bei `!isPatternB` (Pattern A / null / "") → unverändertes Verhalten | Code-Review |
| AK-8 | Bei `pages.length === 0` (create) → kein Pattern-Check, Summary setzt `live_template_suffix=null` | Code-Review |
| AK-9 | Summary enthält IMMER `live_template_suffix` + `pattern_override` | `grep -A2 "const summary" pages-to-shopify.mjs` |
| AK-10 | Adapter-Header + `sync-page-shopify.sh`-Header dokumentieren den neuen Flag | grep in beiden Dateien |
| AK-11 | `tools/validate.sh` grün + Bundle-Build grün | Tool-Run |

---

## §4 Selbstprüfung (wird nach Umsetzung ausgefüllt)

*Wird in Evidence-Datei `evidence/2026-04-23_n-8_self-check.md` ausgewertet.*
