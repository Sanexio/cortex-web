# Live-Verify — N-8 Pattern-A-vs-B Guard (Production)

- **Datum:** 2026-04-23 (Session 31, Cluster-Mini-02)
- **Zweck:** Empirischer Beweis, dass der N-8 Pattern-B-Guard in
  `adapters/shopify/pages-to-shopify.mjs:129-131` einen versehentlichen
  Pattern-A-Push auf eine Pattern-B-Page im **produktiven** Shopify-Store
  (`juvantis.myshopify.com` → `sanexio.eu`) blockiert, bevor Schaden
  entsteht.
- **Target:** `pages/uber-uns`, Page ID `157742137611`
- **Freigabe:** Dr. Stracke, Chat 2026-04-23 („Lauf 1 freigegeben")
- **Scope:** nur Lauf 1 (Guard-Test). Lauf 2 (Bypass via
  `ALLOW_PATTERN_OVERRIDE=1`) bewusst ausgelassen — Override-Mechanik
  ist in S27 codeseitig geprüft, zusätzlicher Prod-Overwrite nicht nötig.

---

## 1. Pre-State

```
GET /admin/api/2025-01/pages/157742137611.json
{
  "id": 157742137611,
  "handle": "uber-uns",
  "title": "Ärzte & Team",
  "template_suffix": "uber-uns",
  "published_at": "2026-04-22T20:46:26+02:00",
  "updated_at": "2026-04-22T20:46:28+02:00",
  "body_html_length": 0
}
```

`ls adapters/shopify/.backups/` → `No such file or directory`

**Bestätigt:** Page ist Pattern B (`template_suffix != ""` und `body_html` leer,
weil Template-Asset `templates/page.uber-uns.json` + Section
`sections/juvantis-ueber-uns.liquid` den Content rendert, s. S28/N-6.2 Live-Diff).

---

## 2. Kommando

```bash
cd ~/Cortex/projects/Cortex-Web
bash tools/sync-page-shopify.sh trunk/content/pages/_shared/ueber-uns.yaml
```

Keine `ALLOW_*`-Env-Flags gesetzt. Default-Verhalten.

---

## 3. Output

**Exit-Code:** `2`

**stdout:**
```
sync-page-shopify: [1/2] build  (trunk/content/pages/_shared/ueber-uns.yaml)
sync-page-shopify: [2/2] push
```

**stderr:**
```
ADAPTER_ERROR: target page handle="uber-uns" id=157742137611 is Pattern B (template_suffix="uber-uns") — a Pattern-A push would discard the theme binding. Set ALLOW_PATTERN_OVERRIDE=1 to proceed.
```

Die Error-Message ist wortgleich mit `pages-to-shopify.mjs:130`.

---

## 4. Post-State

```
GET /admin/api/2025-01/pages/157742137611.json
{
  "id": 157742137611,
  "handle": "uber-uns",
  "title": "Ärzte & Team",
  "template_suffix": "uber-uns",
  "published_at": "2026-04-22T20:46:26+02:00",
  "updated_at": "2026-04-22T20:46:28+02:00",
  "body_html_length": 0
}
```

`ls adapters/shopify/.backups/` → `No such file or directory`

---

## 5. Beweis-Matrix

| Erwartung | Befund |
|---|:---:|
| Exit-Code 2 | ✅ |
| Error-Message enthält „Pattern B" + `template_suffix` + `ALLOW_PATTERN_OVERRIDE=1` | ✅ |
| `updated_at` unverändert (kein PUT durchgeführt) | ✅ 2026-04-22T20:46:28+02:00 == 2026-04-22T20:46:28+02:00 |
| `published_at` unverändert | ✅ 2026-04-22T20:46:26+02:00 == 2026-04-22T20:46:26+02:00 |
| `template_suffix` unverändert (theme binding intakt) | ✅ "uber-uns" == "uber-uns" |
| `body_html` unverändert (leer, weil Template rendert) | ✅ 0 == 0 |
| `.backups/`-Verzeichnis nicht erzeugt (Guard VOR Backup-Block) | ✅ Verzeichnis existiert nicht |

Alle 7 Erwartungen erfüllt. N-8-Guard verhält sich in Produktion
identisch zum Code-Pfad in `pages-to-shopify.mjs:121-131`.

---

## 6. Bedeutung — End-to-End-Härtung von S26/S27/S28/S30

Dieser Live-Test schließt die Adapter-Suite-Härtung für Pattern B:

| Session | Lieferung | Jetzt empirisch bestätigt durch Live-Verify |
|:---:|---|---|
| S26 (N-6) | `diff shopify:page` erkennt Pattern-A-vs-B-Drift | Drift-Erkennung korrekt (hier nicht nötig, weil Guard schon vorher blockt) |
| S27 (N-8) | Write-time Guard gegen Pattern-A-Push auf Pattern-B-Page | ✅ Guard feuert in Prod **wortgleich** zur Unit-Erwartung, blockiert alle schreibenden Aktionen, schreibt kein Backup-File |
| S28 (N-6.2) | `diff shopify:template` Canonical-JSON-EQUAL | Template-Binding blieb in diesem Test erhalten (template_suffix unverändert) → EQUAL-Status von S28 bleibt gültig |
| S30 (N-6.3) | Parallel-Beweis für WP (Pattern B reverse) | unabhängig, aber zusammen bilden sie den vollständigen Pattern-B-Schutzwall (Read via N-6.2/N-6.3 Diff, Write via N-8 Guard) |

Das Ergebnis: **Pattern B ist auf Shopify vollständig geschützt.** Ein
versehentlicher Trunk-Push eines Pattern-A-Adapters auf
`pages/uber-uns` kann die Template-Bindung nicht mehr silent strippen.

---

## 7. Kein Rollback nötig

- Shopify-Page byte-genau im Pre-State
- `.backups/` sauber (nicht erzeugt)
- Theme-Repo unverändert (`29dcaf8`, PXZ 2.7.22)
- Cortex-Web-Working-Tree sauber (nur dieses Evidence-File hinzugefügt)

---

## 8. Follow-ups

- **N-6.5** (nächste Session): `cw-transfer diff wp:page` für Pattern A WP
  (letzter offener Diff-Quadrant).
- **Lauf 2** (`ALLOW_PATTERN_OVERRIDE=1`) bleibt explizite Operator-
  Aktion. Nicht geplant, weil die produktive `/uber-uns`-Page korrekt
  konfiguriert ist und kein legitimer Grund für einen Pattern-A-
  Overwrite existiert. Falls einmal ein legitimer Anwendungsfall auftritt
  (z. B. Migration einer Page zurück zu Pattern A), wird das als eigene
  Front mit Rollback-Plan gestartet.
