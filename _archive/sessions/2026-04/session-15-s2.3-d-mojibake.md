## §3-legacy (historisch) — Session 15, 2026-04-20 (Praxis-Sprint 2 / S2.3-D Phase 1)

### Ziel
Vorbereitungs-Pass für Full-Content-Migration: (1) UTF-8-Mojibake systematisch aus 177 publish-Pages entfernen, (2) vollständiges Trunk-ready Page-Inventar (189 Zeilen, 15 Spalten) für thematische Folge-Sessions, (3) Scope-Klarheit über echte kuratur-relevante Page-Anzahl schaffen.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Phase 1 Verständnis-Sicherung** — 7+2 Freigabefragen formuliert (F1–F9), Dr.-Stracke-Delegation an Architekten-Wahl. Endziel-Kontext-Schärfung (Bridge Shopify↔Praxis) direkt in F8/F9 integriert.
2. **Phase 2 Lösungsdesign** — Spec `specs/sprint-2/S2.3-D_content-curation.md` (342 Zeilen, 13 AKs, 8 Risiken + Mitigationen, Rollback-Plan). Commit A `f50110c`.
3. **Phase 3 Umsetzung (15 T-Tasks) mit Architektur-Pivot:**
   - T2 mysqldump Pre-Snapshot 1.5 MB (gzip OK) — committed als Rollback-Evidenz
   - T3 Pre-Count Shell-LIKE zeigt nur 1/15 Muster (31 `â€ž`-Hits) → Pivot-Entscheidung
   - T4–T5 Migration in PHP mit `mb_convert_encoding`-Paar + Per-Page-Safety-Check (has_mojibake, 4 Marker-Klassen byte-präzise). Lauf 1 = 20 Pages fixed. Lauf 2 = 0 Changes → Idempotenz-Beweis.
   - T6–T7 Residuen-Check: PHP-has_mojibake 177/177 == false. SQL-HEX-Check wirft `ERROR 3854 Cannot convert from binary to utf8mb4` als indirekten Byte-Residuen-Sauberkeits-Beweis.
   - T8–T9 Inventar-Generator (PHP) → `page-inventory-full.csv` (189 Zeilen, 15 Spalten inkl. `trunk_candidate` + `cross_site_potential` + `image_count` + `image_source_hint`) + `.md` mit Cluster-Summary und Batch-Empfehlung. sql_mode-Override für MySQL 8 `only_full_group_by` (S2.3-D-LL-4).
   - T10 AK-0 Drift 177/178 dokumentiert (Delta=1, nicht blockierend).
   - T11 verify.sh + smoke-http.sh + validate.sh alle grün.
   - T12 Home+Karriere MD5-Null-Delta trivial (Theme unberührt).
   - T13 Self-Check `evidence/2026-04-20_s2.3-d_self-check.md` — 13/13 AKs = 100 %.
   - T14 Commit B `2c6e881` (8 Files: Migration-Skripte + mysqldump + Evidenz + Inventar + Self-Check).
4. **Phase 4 Selbstprüfung** — FK-Check alle grün. Out-of-Scope-Einhaltung bestätigt (kein Content-Edit, kein Template-Wechsel, kein Theme-Touch, keine Page-Löschung). Pivot als „besser als Plan" dokumentiert (nicht FK-1…FK-5).

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-http.sh` (5 URLs) | 5/5 HTTP 200 ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Theme Working Tree | clean, HEAD `ae9b1b8` ✓ |
| Cortex-Web Working Tree | clean ✓ |
| Mojibake Post-Count (byte-präzise) | 0 Residuen auf 177/177 Pages ✓ |
| Idempotenz (2. Lauf) | 0 Changes ✓ |
| Inventar-Zeilen | 189 (177+4+8) ✓ |
| Self-Check AKs | 13/13 = 100 % ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten)
- **S2.3-D-LL-1** `wp-mojibake-mb-convert-fix.md` — Shell-LIKE-Pre-Count ist kein Mojibake-Audit; PHP `mb_convert_encoding`-Paar ist kanonischer ftfy-Ansatz für double-encoded UTF-8 in WP-Imports.
- **S2.3-D-LL-2** Safety-Check-Schema: `has_mojibake()` mit 4 Marker-Klassen (â€-prefix, Ã-umlaut, Â-punct, lone â€), dann fix-Versuch mit marker-diff-Check + UTF-8-Validity.
- **S2.3-D-LL-3** `mysql-utf8mb4-binary-rejection-proof.md` — `ERROR 3854 Cannot convert from binary to utf8mb4` bei UNHEX-Literal-Search ist indirekter Sauberkeits-Beweis (invalid-UTF-8-Bytes können in utf8mb4 gar nicht existieren).
- **S2.3-D-LL-4** MySQL 8 `only_full_group_by` bei LEFT JOIN + GROUP BY: `SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')` am Connection-Start.
- **S2.3-D-LL-5** `trunk-ready-page-inventory.md` — i18n-Dubletten sind >70 % von WPML-Page-Inventar; Scope-Schätzung muss das früh offenlegen. Echt kuratur-relevante deutsche Pages: 55 (nicht 189).

### Cluster-Verteilung (Schlüssel-Erkenntnis)

| Cluster | Priorität | Pages |
|---|:-:|--:|
| kern | P0 | 7 |
| checkups | P0 | 6 |
| diagnostik | P1 | 10 |
| services | P1 | 4 |
| aerzte | P1 | 2 |
| fachrichtung | P1 | 1 |
| legacy | P2 | 25 |
| **i18n-dublette** | P2 | **134** |

→ **55 deutsche kuratur-relevante Pages.** Folge-Sessions werden nach Cluster gebündelt (3–8 Pages/Session).

---
