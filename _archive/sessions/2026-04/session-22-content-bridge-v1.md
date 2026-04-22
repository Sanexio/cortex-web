## §3-legacy-session22-parallel — Parallel-Arbeit Cortex-Web content-bridge-v1 (NICHT committet)

> Offener Punkt (**Konsistenz-Anomalie**): Bei diesem „Session beenden" waren im Cortex-Web-Root 30+ untracked files aus einer parallelen Cortex-Web-Architekturarbeit (Shopify-/WP-Adapter für `uber-uns`, 8 Team-YAML-Dateien, cross-site-transfer-Architektur, cw-transfer-CLI, 2 Spec-Ordner). Diese Arbeit ist inhaltlich abgeschlossen (laut ursprünglichem §3-Block darunter), aber weder die Dateien noch die Spec/SELF_CHECK-Dokumente sind committet. Session 21 (S2.3-diagnostik) hat diese Dateien bewusst nicht angefasst — Dr. Stracke sollte die parallele Arbeit in eigener Session abschließen und committen.

### Was dort (vermutlich) entstanden ist (aus ursprünglichem §3, ungeprüft)

### Ziel
Dr. Stracke will, dass `sanexio.eu/pages/uber-uns` inhaltlich mit WP `/team/` abgleichbar ist (Content) und perspektivisch Content/Design/Funktion explizit + gerichtet zwischen beiden Sites transferiert werden kann. Keine Auto-Sync, Trunk als alleinige Brücke.

### Durchgeführt (Architekten-Modus, zwei zusammenhängende Blöcke)

**Block 1 — content-bridge-v1 produktiv**

1. **Pattern A (Inline-HTML)** erstmals umgesetzt: `adapters/shopify/build-page.mjs` + `pages-to-shopify.mjs` + `lib/renderers/page-juvantis.mjs`. Sauber gebaut, aber im Shopify-Theme-Kontext visuell unbefriedigend (RTE-Container überschreibt Styling).
2. **Pattern B (Template-Bridge)** — Goldstandard: `adapters/shopify/build-template.mjs` + `template-to-shopify.mjs` + `lib/renderers/template-juvantis-ueber-uns.mjs`. Schreibt `templates/page.uber-uns.json` ins Live-Theme; Custom-Section `juvantis-ueber-uns` rendert aus Trunk-Daten. Backup-Automatik vor destruktivem Write (CW-008 Ur-Implementierung).
3. **OAuth-Scope-Erweiterung in zwei Runden:** `+read_content,+write_content` → Pattern-A-Push. Dann `+read_themes,+write_themes` → Pattern-B-Push. Authorize-Catcher-Workflow 30 s pro Re-Auth.
4. **Trunk-Content:** `trunk/content/pages/_shared/ueber-uns.yaml` (sections[] + views.juvantis.{hero,mission,history,values,cta,team,padding}) + 8 `trunk/content/team/*.yaml`. Schemas `page.schema.json` + `team-member.schema.json` konkretisiert (required-Felder, oneOf für Section-Types, order-Feld für Display-Reihenfolge).
5. **Live-Deployment:** Shopify Page ID 157742137611 (`handle=uber-uns`) hat `template_suffix=uber-uns` + `body_html=""`. Theme-Asset `templates/page.uber-uns.json` im Live-Theme (ID 181128757515). Dr. Stracke hat die Seite am 20:46:26 freigegeben.

**Block 2 — cross-site-transfer Architektur**

6. **ARCHITECTURE.md** + **PATTERNS.md** geschrieben. Transfer-Matrix (Source × Target × Type), 6 wiederverwendbare Patterns (A Simple Page · B Template-Based Page · C Metafield · D Theme-Asset-Overwrite · E Product-Sync · F Design-Token), Naming-Conventions, Registry-Pattern.
7. **3 Extraktions-Skelette** Site → Proto-Trunk-JSON: `adapters/shopify/extract-page.mjs`, `extract-template.mjs`, `adapters/wordpress/extract-page.mjs`. Smoke-getestet gegen Live-Page.
8. **4 Registry-Dateien** (Renderer + Extractor × Shopify + WP) als zentrale Dispatch-Tabelle.
9. **Meta-Orchestrator `tools/cw-transfer`** mit Verben push/pull/diff/list/help. `list` zeigt 10 registrierte Transfers mit Status-Badge (stable/skeleton/planned).
10. **Projekt-Rules erweitert:** CW-006 (gerichteter Transfer), CW-007 (Trunk-Brücke-Pflicht), CW-008 (Backup vor destruktivem Push). `.gitignore` um `adapters/*/.backups/` erweitert.
11. **Docs + Self-Check:** `specs/content-bridge-v1/SELF_CHECK.md` 12/12 AK grün · `specs/cross-site-transfer/SELF_CHECK.md` 12/12 AK grün · `docs/cross-site-transfer.md` State-of-Play aktualisiert.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `validate.sh` | OK ✓ |
| 3 Shopify-Builds (product/page/template) | 3/3 OK ✓ |
| `cw-transfer list` | 10 Einträge (3 stable push shopify, 2 skeleton pull shopify, 1 planned · 1 stable push wp, 1 planned · 1 skeleton pull wp, 1 planned) ✓ |
| Live-Verify Shopify-Page API | 1 Treffer id=157742137611, 8 Arzt-Namen im body_html, intro present ✓ |
| Live-Verify Shopify-Template-Asset API | 6860 Bytes, 8 team_member + 4 value blocks ✓ |
| Idempotenz (2× Push) | body_md5 identisch, `updated_at` unverändert (Shopify diff-aware) ✓ |
| Page `published_at` | 2026-04-22T20:46:26 (Dr.-Stracke-Freigabe nach Preview) ✓ |
| Self-Check content-bridge-v1 | **12/12 = 100 %** ✓ |
| Self-Check cross-site-transfer | **12/12 = 100 %** ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten)

- **CB1-LL-1** Shopify-OAuth-Scopes iterativ erweitern: neuer Adapter-Typ → neuer Scope → Re-Auth via authorize-Script+Catcher (~30 s). Single-Source der Scopes ist `tools/shopify-authorize.sh`.
- **CB1-LL-2** Shopify-Pages: `published: true|false` statt `status: "draft"|"active"` (Pages ≠ Products). Page-Adapter hardcoded `published:false` als CW-001-Safeguard.
- **CB1-LL-3** Shopify ist bei Page/Asset-PUTs diff-aware: identischer Body → `updated_at` bleibt unverändert. Stärkere Idempotenz als in Spec gefordert.
- **CB1-LL-4** Template-Suffix vs. Handle: Shopify matcht `templates/page.<suffix>.json` über `template_suffix`-Feld, nicht über Handle. Ein altes Template mit anderem Suffix wird nie gerendert → `template_suffix` muss explizit gesetzt sein.
- **CB1-LL-5** Bridge-Architektur skaliert über Content hinaus. Skelette Pattern-C (Metafield) und Pattern-F (Design-Token) benötigen dieselbe Grundarchitektur (Build → Payload → API-Push → Verify → Backup).

### Drei Wissens-Artefakte für Folge-Sessions

- Pattern `Nexus/_memory/patterns/shopify-template-bridge.md` — Pattern-B-Kern
- Pattern `Nexus/_memory/patterns/cross-site-transfer-registry.md` — Meta-Architektur (Registry + cw-transfer)
- Pattern `Nexus/_memory/patterns/shopify-oauth-scope-iteration.md` — Re-Auth-Workflow
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/07-shopify-template-bridge.md`
- Session-Log `Nexus/_memory/logs/2026-04-22_cortex-web-content-bridge-und-cross-site-architektur.md`

---
