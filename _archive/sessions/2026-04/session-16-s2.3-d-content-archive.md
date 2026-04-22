## §3-legacy-session16 (historisch) — Session 16, 2026-04-20 (Praxis-Sprint 2 / S2.3-D Phase 2)

### Ziel
Content-Archive als Sicherungs-Schicht **vor** der Cluster-weisen Kuration. Dr.-Stracke-Leitprinzip wörtlich: *„Ich möchte es richtig und ohne Informationsverlust machen — du entscheidest."* Konsequente Interpretation: jede Page im aktuellen Local-WP-Stand bekommt eine unveränderliche Kopie im Git, bevor irgendeine Kurations-Entscheidung fällt.

### Durchgeführt (Architekten-Modus 4 Phasen)

1. **Phase 1 Verständnis-Sicherung** — Dr. Stracke delegiert alle Architektur-Entscheidungen an Claude (expliziter Auftrag „du entscheidest"). 13 Entscheidungspunkte (F1–F13) direkt in §2 der Spec dokumentiert.
2. **Phase 2 Lösungsdesign** — Spec `specs/sprint-2/S2.3-D_Phase2_content-extraction.md` (398 Zeilen, 12 AKs, 10 Risiken + Mitigationen, Rollback-Plan, Out-of-Scope-Bekräftigung). Commit A `661a4cd`.
3. **Phase 3 Umsetzung (13 T-Tasks):**
   - T0 Spec committed (Commit A `661a4cd`).
   - T2 Generator-Skript `tools/migrations/2026-04-20_s2.3-d-p2_content-extract.php` (~300 Zeilen, PHP-CLI, mysqli + Local-WP-Socket, MySQL 8 sql_mode-Override, deterministische YAML-Serialisierung ohne ext-yaml-Abhängigkeit).
   - T3 `_content-archive/README.md` mit Format-Doku, MD5-Contract, Pfad-Schema, Reverse-Lookup-Hinweisen.
   - T4 Generator Lauf 1: `created=189, errors=0` → alle 189 Archive-Dateien angelegt.
   - T5 Generator Lauf 2: `skipped=189, created=0` → Idempotenz bewiesen.
   - T6 Verifier-Skript `..._verify-md5.php` (~80 Zeilen): dreifacher MD5-Check (Body ↔ Front-Matter ↔ DB) → `OK: 189/189, FAIL: 0`.
   - T7 `find _content-archive -name '*.md' -not -name 'README.md' \| wc -l` = 189.
   - T8 Inventar-CSV um Spalte `archive_path` erweitert (16 Spalten, pro Zeile nicht-leer).
   - T9 verify.sh + smoke-http.sh + validate.sh alle grün.
   - T10 Home+Karriere MD5-Null-Delta trivial (Theme unberührt, keine DB-Content-Mutation).
   - T11 Self-Check `evidence/2026-04-20_s2.3-d-p2_self-check.md` mit 12/12 AKs grün und 5 Lessons.
   - T12 Commit B `d5051eb` (194 Files: Spec-Skripte + 189 Archive + README + CSV-Update + Self-Check).
   - T13 SESSION_RESUME Session-16-Block + §8-Historie.
4. **Phase 4 Selbstprüfung** — 12/12 AKs = 100 %. FK-Check 0/5 eingetreten.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| Generator Lauf 1 | `created=189, errors=0` ✓ |
| Generator Lauf 2 (Idempotenz) | `created=0, skipped=189` ✓ |
| verify-md5 3-way match | 189/189 ✓ |
| Archive-Dateien | 189 ✓ |
| CSV-Spalte `archive_path` | vorhanden, pro Zeile belegt ✓ |
| verify.sh | §1+§1b+§2+§3+§3b+§4 grün ✓ |
| smoke-http.sh | 5/5 HTTP 200 ✓ |
| validate.sh | OK ✓ |
| Theme Working Tree | clean, HEAD `ae9b1b8` ✓ |
| Cortex-Web Working Tree | clean (nach Commit B) ✓ |
| Self-Check AKs | 12/12 = 100 % ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten)

- **S2.3-D-P2-LL-1** `content-archive-pre-curation.md` — Unveränderliches Original-Archive vor Kuration ist billigste Versicherung gegen Informationsverlust. Kosten: ~2 MB Git-Wachstum. Nutzen: jede Folge-Session hat Original nebendran, Diff trivial.
- **S2.3-D-P2-LL-2** `yaml-front-matter-md5-contract.md` — Dreifache MD5-Verankerung (Body-File ↔ Front-Matter-Hash ↔ DB-Hash) als deterministischer, automatisch prüfbarer Integritäts-Contract für Dateisystem ↔ DB-Kohärenz.
- **S2.3-D-P2-LL-3** — Slug ist in WPML-Setups nie eindeutig (3× impressum, 3× home, 7× frequently-asked-questions). Dateinamen immer `<slug>-<id>`, nie Slug alleine.
- **S2.3-D-P2-LL-4** — YAML-Front-Matter ohne ext-yaml: ~30 Zeilen eigene Serialisierung (strings always-quoted, Zahlen bare, Blocks als Listen) sind diff-freundlich und deterministisch.
- **S2.3-D-P2-LL-5** — Ordner-Hierarchie ist zugleich Storage und Planungs-Artefakt. `ls kern/de/` zeigt die nächste Kurations-Session. Flache Ablage speichert dasselbe, aber der kognitive Nutzen wäre null.

### Archive-Verteilung (189 Dateien)

| Bereich | Anzahl |
|---|--:|
| `kern/de/` | 7 |
| `checkups/de/` | 6 |
| `services/de/` | 4 |
| `aerzte/de/` | 2 |
| `fachrichtung/de/` | 1 |
| `diagnostik/de/` | 10 |
| `legacy/de/` | 23 |
| `i18n-dublette/{en,fr,es,unknown}` | 42+41+39+2 = 124 |
| `_status/{draft,private}` | 4+8 = 12 |
| **Gesamt** | **189** |

→ **30 deutsche kuratur-relevante Pages** (kern+checkups+services+aerzte+fachrichtung+diagnostik) + 23 legacy (teils fremdsprachig) + 124 i18n-Dubletten + 12 Status-abweichend. Phase 3 beginnt mit Cluster `kern`.

---
