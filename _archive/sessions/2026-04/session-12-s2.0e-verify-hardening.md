## §3a Vorletzte Session — Session 12, 2026-04-19

### Ziel
Praxis-Sprint 2 / S2.0e Verify-Hardening — `tools/verify.sh` um Split-Check-Erweiterung
(§1b) und Component-Probe (§3b) ergänzen, um die in S2.0b auf „später" verschobenen
AK-8 + AK-10 nachzuholen. Keine Theme-Änderung.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Pflicht-Init geladen** (Nexus + Cortex-Web + Praxis-WORKING_MODE + SESSION_RESUME Session 11).
   Pre-Flight: `validate.sh` ✅, Praxis `verify.sh` ✅.
2. **Phase 1 Verständnis-Sicherung** mit 7 Freigabefragen (F1–F7) + 3 Detail-Fragen
   (Page-Status, Viewport-Umfang, Migration-Pattern). Alles delegiert durch Dr. Stracke
   an Architekten-Wahl.
3. **Phase 2 Lösungsdesign:** Spec `S2.0e_verify-hardening.md` (14 KB, 8 AKs, 6 Risiken,
   Out-of-Scope-Liste). Architekten-Entscheidungen: F1a-modifiziert + F2b + F3a + F4a +
   F5b+F5c + F6b + 90-min-Cap. Für die 3 Detail-Fragen: publish statt draft,
   1440 only, Migration-Skript statt ad-hoc SQL.
4. **Phase 3 Umsetzung — mit Architektur-Pivot:**
   - T1 Spec committed (`88290b0`)
   - T2 Migration-Skript `tools/migrations/2026-04-19_s2.0e_probe-page-setup.sh` angelegt,
     idempotent-Verhalten verifiziert (2× OK-Ausgabe). Page 9670 auf publish + Probe-Markup.
   - T3 `page-registry.mjs` erweitert um `component-probe`-Eintrag.
   - **Pivot-Entdeckung:** Puppeteer-Probe schlägt fehl — `/s2-0b-probe/` gibt 404,
     trotz publish + Probe-Markup. Grund: WordPress-Rewrite-Rules werden nach direktem
     SQL-INSERT nicht zuverlässig für den Slug generiert (Santapress-Plugin-Interaktion).
     Diagnose via 4 Versuche: `DELETE rewrite_rules` + Warmup (fail), PHP-CLI `flush_rewrite_rules`
     (fail am Local-DB-Socket), `/?pagename=` (301), `/index.php/…/` (301). Alle scheitern.
   - **Architektur-Pivot:** T2 + T3 rückgängig (Page auf draft/leer, Skript gelöscht,
     page-registry-Eintrag entfernt). §3b neu als zweistufige **Bash-Probe**:
     · Stufe A — 8 `grep`-Assertions auf `components.css` (Datei-Korrektheit)
     · Stufe B — 2 `curl`+`grep`-Checks auf Home-HTML (Enqueue-Korrektheit)
     Multi-Line-CSS via `grep -E <head> -A <ctx> | grep -qE <content>` gelöst.
   - T4 `PROBED_PROPS` in `probe-design.mjs` um `textTransform`/`fontWeight`/`fontSize`
     erweitert (zukunftsfähig für Page-Typografie-Probes in S2.3).
   - T5 `grep_split_css()` + `component_probe()` in `verify.sh` + Dispatch.
   - T6 Komplett-Lauf `verify.sh`: §1 + §1b + §2 + §3 + §3b + §4 alle grün, Exit 0.
   - T7 S2.0e-Self-Check `evidence/2026-04-19_s2.0e_self-check.md` (8/8 AKs).
   - T8 S2.0b-Self-Check-Nachtrag: AK-8 + AK-10 → grün durch S2.0e, finaler Score
     **12/12 (100 %)**.
   - T9 Cortex-Web-Commit B (`6352b1e`).
5. **Phase 4 Selbstprüfung:** AK-Tabelle 8/8 grün. 5 Lessons Learned S2.0e-LL-1…5.
   Pivot explizit als „architektonische Abweichung" im Self-Check dokumentiert.
6. **„Session beenden"-Workflow LL-042 (6 Schritte):**
   - Schritt 1: Projekt-Audit grün (verify/validate beide OK, Theme clean, keine Backups).
   - Schritt 2: Nexus-Audit — MEMORY.md + CLAUDE.md brauchten Session-12-Updates.
   - Schritt 3: Pattern-Optimierung — neues Pattern `verify-probe-code-vs-integration.md`
     angelegt (plattform-agnostisch WP/Shopify/Next.js/iOS).
     `local-wp-mysql-socket.md` um Rewrite-Rule-Warnsektion erweitert.
   - Schritt 4: Tutorial 13 `13-verify-probe-architektur-und-wp-rewrite-grenze.md`
     angelegt (Meta-Ebene-Lehrsätze: Dimensionen trennen, Architektur-Pivots als
     Chance, Rollback muss DB mit zurücksetzen).
   - Schritt 5: diese Datei finalisiert.
   - Schritt 6: Dashboard (siehe unten im Chat).

### Verifiziert (AK-Tabelle aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | `grep_split_css()` in verify.sh (Def + Aufruf) |
| AK-2 | ✅ | 3× „Keine doppelten Basis-Selektoren" |
| AK-3 | ✅ | `component_probe()` mit 8+2 Assertions (Bash, statt page-registry-DOM-Probe) |
| AK-4 | ✅ | PROBED_PROPS enthält textTransform/fontWeight/fontSize |
| AK-5 | ✅ | verify.sh --component-probe grün, 10× ✓ |
| AK-6 | ✅ | Full verify.sh Exit 0 mit §1 + §1b + §2 + §3 + §3b + §4 |
| AK-7 | ✅ | Theme-HEAD `8f596f7` unverändert, clean |
| AK-8 | ✅ | S2.0b-Self-Check-Nachtrag mit S2.0e-Ref |

**Score: 8/8 = 100 %**

### Lessons Learned (S2.0e-LL-1…5 — ins Pattern + Tutorial 13 übernommen)
- **S2.0e-LL-1:** Puppeteer-DOM-Probe auf direkt-SQL-angelegte Pages scheitert an
  WP-Rewrite-Rules. Gilt besonders mit Plugins wie Santapress, die eigene URL-Handler
  registrieren. Regel: direkt-SQL nur für Backend-Objekte, nicht für Frontend-Slug-URLs.
- **S2.0e-LL-2:** Architektur-Pivot unter Zeitdruck ist architektonisch oft besser
  als Forcieren des ursprünglichen Plans. Hier: Trennung Code- vs. Integrations-Test
  gewinnt gegenüber „ein DOM-Test für alles".
- **S2.0e-LL-3:** `grep -E <head> -A <ctx> | grep -qE <content>` ist ein robustes
  Muster für Multi-Line-CSS-Assertions (kein pcregrep/perl nötig).
- **S2.0e-LL-4:** Gute Pre-Flight-Probes testen die zwei Fragen, die echte Aussagen
  treffen: „Läuft der Code?" und „Ist die Regel da?" sind unterschiedlich.
- **S2.0e-LL-5:** Rollback nach Architektur-Pivot muss DB-Zustand mit zurücksetzen
  (post_status, post_content) — nicht nur Dateien.

---
