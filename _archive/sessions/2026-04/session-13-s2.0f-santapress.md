## §3b Vor-vorletzte Session — Session 13, 2026-04-19

### Ziel
Praxis-Sprint 2 / S2.0f Santapress-Plugin-Entfernung — das in S2.0e als Interferenz-Quelle identifizierte Santapress-Plugin aus Local-WP entfernen. Freigabe durch Dr. Stracke in Session 12. Reversibel, regressions-frei, audit-nachvollziehbar.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Pflicht-Init** (Nexus + Cortex-Web + Praxis-WORKING_MODE + SESSION_RESUME Session 12). Pre-Flight `validate.sh` ✅ + `verify.sh` ✅.
2. **Phase 1 Verständnis-Sicherung** mit 4 Freigabe-Fragen (F1–F4). Dr. Stracke wählt: F1a (S2.0f in Sprint 2), F2c (Archive-Then-Delete auf Vorschlag hin, statt F2b Hard-Delete), F3b (verify.sh + HTTP-Smoke), F4a (volle Spec).
3. **Phase 2 Lösungsdesign:** Spec `S2.0f_santapress-removal.md` (Hard-Cap 60 min, 5 T-Tasks, 6 AKs, 6 Risiken). 3 weitere Freigabe-Fragen (F5/F6/F7) — Dr. Stracke delegiert an Claude. Entscheidungen: F5b-modifiziert (5xx-Fail-Regel, 5 URLs inkl. 3 WP-Core-Routen), F6b (Verfallsdatum 2026-05-19), F7b (wp_posts-Count-Snapshot als Paranoia).
4. **Phase 3 Umsetzung — alle 5 T-Tasks in Reihenfolge:**
   - T0 Spec committed (`e036328`)
   - T1 Pre-Condition-Snapshot: 26 active_plugins (Santapress an Index 15), rewrite_rules 13085 Bytes, wp_posts 2860 gesamt, Plugin 21 MB
   - T2 Hook-Dependency-Audit: **0 externe Referenzen** in Plugins/Theme/mu-Plugins/andere-Themes → Entfernung sicher
   - T3a PHP-Serialize-Manipulation via `mysqli->prepare` (S2.0f-LL-2: `'localhost'` + Socket-Argument statt `null`): before=26 after=25 removed=1 affected_rows=1
   - T3b Plugin-Ordner nach `_archive/santapress-2026-04-19/` verschoben (21 MB, identisch zum Source), ARCHIVE_README.md mit Rollback-Anleitung + Verfallsdatum
   - T4 `DELETE FROM wp_options WHERE option_name='rewrite_rules'` + 2× Warmup-curl (beide HTTP 200) → neue Größe **10979 Bytes** (−2106 = Santapress-Routen weg, S2.0f-LL-3)
   - T5a `smoke-http.sh` neu angelegt, 5 URLs (`/`, `/karriere/`, `/wp-login.php`, `/feed/`, `/?s=test`), Exit 0, alle HTTP 200
   - T5b `verify.sh` Komplett-Lauf: §1+§1b+§2+§3+§3b+§4 alle grün, Exit 0 → **keine Regression**
   - T7 Self-Check `evidence/2026-04-19_s2.0f_self-check.md` (6/6 AKs grün), 5 Lessons Learned
   - T8 Commit B (`a6cc6f3`) — 16 Files (.gitignore + Spec-Update + Tool + 13 Evidenz-Files + Self-Check)
5. **Phase 4 Selbstprüfung:** AK-Tabelle 6/6 grün. **F7b-Paranoia-Check bestätigt:** `wp_posts`-Count vor/nach identisch (2860 gesamt, Delta=0 je post_status) → kein `deactivation_hook`-Schaden.
6. **„Session beenden"-Workflow LL-042 (6 Schritte):**
   - Schritt 1: Projekt-Audit grün (verify/validate/smoke alle OK, Theme clean, keine Backup-Files, nur erwartete S2.3-TODO-Marker in Specs)
   - Schritt 2: Nexus-Audit — CLAUDE.md + MEMORY.md brauchen Session-13-Updates
   - Schritt 3: Pattern-Optimierung — neues Pattern `wp-plugin-safe-removal.md` angelegt; `.gitignore`-Hygiene (`screenshots/claude/` ergänzt, Commit `ced4e0a`)
   - Schritt 4: Tutorial 14 `14-wp-plugin-sicher-entfernen.md` angelegt (5-Schritt-Protokoll, PHP-Serialize-Erklärung, Governance-Pattern)
   - Schritt 5: diese Datei finalisiert
   - Schritt 6: Dashboard (siehe Chat-Ausgabe)

### Verifiziert (AK-Tabelle aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | active_plugins 26 → 25 (Santapress raus) |
| AK-2 | ✅ | Plugins-Dir ohne santapress, Archive 21 MB identisch |
| AK-3 | ✅ | rewrite_rules 13085 → 10979 Bytes (−2106) |
| AK-4 | ✅ | verify.sh Exit 0, 6 §-Blöcke grün |
| AK-5 | ✅ | smoke-http.sh Exit 0, 5/5 URLs HTTP 200 |
| AK-6 | ✅ | T2-Dependency-Audit: 0 externe Referenzen |

**Score: 6/6 = 100 %**

### Lessons Learned (S2.0f-LL-1…5 — ins Pattern + Tutorial 14 übernommen)

- **S2.0f-LL-1:** Page-Registry (`tools/page-registry.mjs`) ist Definition-of-Done-Artefakt für S2.3. Registry hat aktuell nur 2 Einträge (home, karriere) — die 8 S2.2-Skelett-Slugs sind nicht registriert. Bei S2.3-Pages muss Registry mitgepflegt werden.
- **S2.0f-LL-2:** `mysqli` + Unix-Socket: `new mysqli('localhost', ..., $socket)` ist robuster als `new mysqli(null, ..., $socket)`. `null` als Host ist in manchen PHP-Versionen inkonsistent.
- **S2.0f-LL-3:** `rewrite_rules`-Größen-Delta ist das einfachste Signal für Plugin-Route-Entfernung. Hier: −2106 Bytes.
- **S2.0f-LL-4:** F7b `wp_posts`-Count ist billige Paranoia (2×50ms) mit hoher Aussagekraft gegen `deactivation_hook`-Schaden. Standard-Evidenz für Plugin-Entfernungen.
- **S2.0f-LL-5:** `smoke-http.sh` gehört **nicht** in `verify.sh`. Scope-Disziplin (S2.0e-LL-4): Code-Korrektheit deterministisch/offline vs. Request-Verfügbarkeit netzwerkabhängig. Zwei Dimensionen → zwei Tools.

---
