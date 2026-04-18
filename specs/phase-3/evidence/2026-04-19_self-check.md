# Phase-3 Self-Check — 2026-04-19

> **Architekten-Modus Phase 4 — Selbstprüfung.** Jedes AK aus `specs/phase-3/REVIEW.md` §3 wird gegen die tatsächlich produzierte Evidenz geprüft. Score am Ende. Lessons Learned für das Nexus-Tutorial-System.

**Review-Lauf:** `bash tools/review.sh` am 2026-04-19, Commit `f52abc2` + Review-Tools (uncommitted zum Zeitpunkt des Laufs).
**Summary-Datei:** `specs/phase-3/evidence/summary.json`
**Trunk-Quelle:** `trunk/content/products/bluttests/basic-check.yaml`

---

## AK-Tabelle

| AK | Kriterium | Status | Evidenz |
|----|-----------|:------:|---------|
| **AK-1** | Pre-Flight `validate.sh` grün + `CHECK_SHOPIFY=1` grün | ✅ | `summary.json` → `validate_exit: 0`, `validate_shopify_exit: 0` |
| **AK-2** | WP-Page-9668 enthält: headline_override, tagline, beschreibung, cta_label, cta_url, alle 15 Parameter | ✅ | `content-parity.json` → alle 6 `checks.*: true` |
| **AK-3** | Shopify-Product-10940942844171 enthält: title, tagline, beschreibung, 15 Parameter, price=99, SKU=JVT-BLD-001 | ✅ | `content-parity.json` → alle 6 `shopify.checks.*: true` |
| **AK-4** | WP-Page enthält KEINE der 6 verbotenen Tokens; erlaubter Praxis-CTA (Label + URL) vorhanden | ✅ | `hwg-scan.json` → alle 6 `found: false`, beide `present: true` |
| **AK-5** | Shopify hat Variant/Preis>0, SKU, product_type, tags, vendor, status=draft | ✅ | `commerce-check.json` → alle 7 `checks.*: true` |
| **AK-6** | WP 2. Lauf: Page-ID 9668 unverändert, `action: "update"`, gleicher Slug | ✅ | `idempotency-wp.json` → `same_id: true`, `run2.action: "update"` |
| **AK-7** | Shopify 2. Lauf: Product-ID 10940942844171 unverändert, `action: "update"`, gleiche Handle | ✅ | `idempotency-shopify.json` → `same_id: true`, `same_handle: true`, `run2.action: "update"` |
| **AK-8** | Trunk-Master-Roundtrip: PUT `status=active` → `sync-shopify.sh` → `status=draft` wiederhergestellt | ✅ | `roundtrip.json` → `read-before: draft` → `admin-flip: active` → `adapter-run: exit 0` → `read-after: draft` |
| **AK-9** | `wp-page-9668.png` existiert, > 10 KB | ✅ | 91 618 Bytes (`screenshots.json`) |
| **AK-10** | `shopify-body-preview.png` existiert, > 10 KB | ✅ | 45 439 Bytes |
| **AK-11** | `side-by-side.html` + `side-by-side.png` existieren, PNG > 10 KB | ✅ | 2 328 Bytes HTML + 131 126 Bytes PNG |
| **AK-12** | Diese Self-Check-Datei existiert mit AK-Tabelle, Score, Lessons Learned | ✅ | `specs/phase-3/evidence/2026-04-19_self-check.md` |

**Score: 12/12 = 100 %** — alle AKs grün. Schwelle C-7 (Dr. Stracke explizit „alles grün") erfüllt.

---

## Kernevidenzen (kurz zitiert)

### Content-Parität (AK-2 + AK-3)

- WP-Page 9668 enthält alle 15 Parameter-Codes als Tabellen-Zellen (`>HGB<`, `>WBC<`, …, `>CRP<`).
- Shopify-body_html enthält dieselben 15 Codes in gleicher Struktur.
- Preis in Shopify: `"99.00"` (Strings-Format) = `Number(trunk.price_eur)` = `99` → `priceCheck: true`.
- SKU in Shopify: `JVT-BLD-001` = `trunk.sku` → `skuCheck: true`.

### HWG-Compliance (AK-4)

Sechs verbotene Tokens scannen — alle Treffer `found: false`:
`€`, `EUR`, `Kaufen`, `Warenkorb`, `Bestellen`, `Jetzt buchen`.

Erlaubter CTA `Mehr erfahren auf sanexio.eu` + Ziel-URL `https://sanexio.eu/products/basic-check` präsent.

**Bedeutung:** HWG-Trennung ist nicht nur schema-theoretisch, sondern auch auf der tatsächlich gerenderten WP-Seite empirisch durchgezogen. Die `views.praxis.show_price: const false`-Regel + die Renderer-Struktur liefern die gewünschte Compliance.

### Trunk-Master-Roundtrip (AK-8, CW-001)

Beweiskette aus `roundtrip.json`:

```
read-before     → status: draft
admin-flip      → result_status: active  (simulierter Admin-Eingriff)
adapter-run     → exit 0                  (sync-shopify.sh mit ALLOW_OVERWRITE=1)
read-after      → status: draft           (Trunk hat gewonnen)
```

**Bedeutung:** Selbst wenn jemand im Shopify-Admin den Status auf `active` ändert, setzt der nächste Adapter-Lauf das wieder auf `draft` zurück (weil `status: "draft"` im juvantis-Renderer hartcodiert ist). CW-001 ist nicht nur eine Regel, sondern technisch durchgesetzt.

### Idempotenz (AK-6 + AK-7)

Zwei aufeinanderfolgende Läufe beider Sync-Pipelines produzieren keinen zweiten Artefakt:

| Lauf | WP-Page-ID | WP-Action | Shopify-Product-ID | Shopify-Action |
|------|-----------|-----------|--------------------|----------------|
| 1 | 9668 | update | 10940942844171 | update |
| 2 | 9668 | update | 10940942844171 | update |

`updated_at`-Timestamps sind identisch, weil der Trunk zwischen den Läufen nicht geändert wurde — Shopify erkennt den Zustand als unverändert und gibt den gleichen Timestamp zurück.

---

## FK-Abweichungen (Architekten-Modus)

Zwei Fehler im Review-Lauf selbst (nicht im Produkt) — beide vor der Self-Check-Erstellung gefixt, protokolliert zur Transparenz:

| ID | FK-Klasse | Befund | Ursache | Fix | Dauer |
|---|:---:|---|---|---|---|
| PH3-FIX-1 | **FK-2 Scheinverständnis** | AK-6/AK-7 rot trotz exit=0 beider Sync-Läufe | Regex `/\{[\s\S]*\}\s*$/` griff nicht, weil Sync-Scripts nach der JSON noch `sync-*: OK` ausgeben — JSON war nicht am stdout-Ende | Line-basierter Parser: letzte `}`-Zeile finden, rückwärts zur `{`-Zeile scannen, parse-and-accept | ~3 min |
| PH3-FIX-2 | **FK-5 Kontextverlust** | AK-9 rot: WP-Screenshot `net::ERR_CERT_AUTHORITY_INVALID` | Local-WP läuft auf HTTPS mit selbstsigniertem Zertifikat. Puppeteer akzeptiert das nicht ohne explizites Opt-in. Diese Info war in Phase-1/2-Sessions nicht notiert worden. | `puppeteer.launch({ acceptInsecureCerts: true, args: ["--ignore-certificate-errors"] })` | ~2 min |

Beide Fixes sind in `tools/review/idempotency.mjs` + `tools/review/screenshots.mjs` eingearbeitet. Zweite Ausführung: 11/11 automatische AKs grün (AK-12 dieser Self-Check = 12/12).

---

## Lessons Learned (für Tutorial-Update)

1. **Sync-Script-Output ist nicht-atomar:** Shell-Wrapper-Scripts wie `sync-wp.sh` mischen Progress-Logs und Adapter-JSON. Wer das JSON aus stdout extrahieren will, darf nicht auf trailing-JSON setzen, sondern muss line-basiert parsen (letzte `}`-Zeile). **Pattern-würdig** für jedes zukünftige Review-/Test-Tool, das existing sync-Pipelines re-runt.

2. **Local-by-Flywheel-HTTPS und Puppeteer:** Local-WP liefert standardmäßig `https://<site>.local/` mit selbstsigniertem Zertifikat. Puppeteer braucht `acceptInsecureCerts: true` + Chrome-Flag `--ignore-certificate-errors`. Gilt für alle Mac-lokalen WordPress-Dev-Setups, die per Puppeteer getestet werden.

3. **HWG-Compliance ist 2-stufig abgesichert:** Schema (`const false`) fängt Build-Time-Fehler, Token-Scan fängt Runtime-Drift (z.B. wenn irgendjemand später den Praxis-Renderer manipuliert und heimlich einen Preis einbaut). Doppel-Sicherung ist keine Redundanz — sie prüft zwei unterschiedliche Failure-Modes.

4. **Trunk-Master beweisbar, nicht nur dokumentierbar:** Der Admin-flip-and-reset-Test in 4 API-Calls + 1 Adapter-Lauf liefert eine unwiderlegbare Aussage zur CW-001-Compliance. Besser als jede Dokumentation.

5. **Review-Tools als eigene Kategorie:** Review-Tools gehören NICHT in `adapters/`, weil sie Adapter von außen beobachten, nicht selbst schreiben. Eigener Baum unter `tools/review/` mit Orchestrator + Module + JSON-Evidenz-Konvention.

---

## Empfehlung (im Sinne LL-034: Optionen, keine Vorauswahl)

Review ist 100 % grün. Nächster Schritt ist eine Architektur-Entscheidung für Dr. Stracke — das Go/No-Go auf den Common-Trunk-Ansatz. Optionen siehe `SESSION_RESUME.md §4` (α = direkt Phase 4 Subsumierung, β = Phase 2b Medien-Pipeline, γ = Pause).

Score 100 % ist keine Pauschal-Empfehlung für Phase 4 — sie beweist nur, dass der Ansatz für 1 Produkt auf 2 Plattformen trägt. Ob der Ansatz auch die echten Inhalte (mehrere Produkte, Medien, i18n, Team-Seiten, Legal) trägt, ist eine separate Frage.

---

*Stand: 2026-04-19 Session 5, Architekten-Modus Phase 4 abgeschlossen. Nächster Schritt: Dr. Stracke erteilt Go/No-Go.*
