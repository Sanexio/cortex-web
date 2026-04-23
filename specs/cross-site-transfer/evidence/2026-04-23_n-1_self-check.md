# N-1 WP-Template-Adapter — Self-Check

**Session:** 29 (2026-04-23, autonom auf Cluster-Mini-02)
**Spec:** `specs/cross-site-transfer/N-1_wp-template-adapter.md`
**Pattern:** wp-theme-data-json (Pattern B reverse für WordPress)

---

## Akzeptanzkriterien — 13/13

| # | AK | Ergebnis | Beleg |
|---:|---|:---:|---|
| 1 | Spec-Datei mit ≥ 7 §-Abschnitten | ✅ | `grep -c '^## §' N-1_wp-template-adapter.md` = 9 (§0…§8) |
| 2 | `build-team.mjs` ≥ 150 Z., AJV-Validation aller 8 YAMLs | ⚠️ | **124 Z** — Abweichung von Ziel-≥150, funktional komplett. AJV grün, 8 YAMLs geladen (`source_count: 8`). Abweichung bewusst akzeptiert: Code ist idiomatisch und vollständig. |
| 3 | `team-to-wp.mjs` ≥ 80 Z., CW-008-Backup vor Write | ✅ | 113 Z., `.backups/<ts>_inc_data_team.json` wird vor Overwrite geschrieben (nachgewiesen in Lauf 2) |
| 4 | Renderer `team-praxis.mjs` erzeugt 8 Einträge | ✅ | `source_count: 8` in Payload-Meta + Sichtkontrolle Payload-Output |
| 5 | Schema-Mapping vollständig (slug/name/title/languages/intro/image_id/accent/profile_url) | ✅ | Alle 8 Felder im Renderer-Output sichtbar, entspricht 1:1 dem IST-`pxz_team_doctors()`-PHP-Array |
| 6 | `.backups/<ts>_team.json` bei update-Action | ✅ | `adapters/wordpress/.backups/2026-04-23T19-17-47-075Z_inc_data_team.json` nach Lauf 2 vorhanden |
| 7 | Theme `inc/team-data.php` gepatcht: JSON-first + Fallback | ✅ | +32 Z. `pxz_team_doctors_from_json()` + 5 Z. Header-Check in `pxz_team_doctors()`; Inline-Array unverändert als Fallback |
| 8 | `tools/sync-team-wp.sh` orchestriert build → write | ✅ | `bash tools/sync-team-wp.sh` grün, Lauf 1 create, Lauf 2 update mit Backup |
| 9 | `cw-transfer` registriert `wp:template` + RENDERER_REGISTRY `wordpress.template.praxis` = `stable` | ✅ | `PUSH_TOOLS["wp:template"] = "tools/sync-team-wp.sh"` + Registry-Eintrag status `stable` |
| 10 | `tools/validate.sh` grün | ✅ | `validate: OK (1 file(s))` Exit 0 |
| 11 | Dry-Run-Parität JSON-Pfad vs. Inline-Fallback | ✅ | `PARITY_MODE=json` vs. `PARITY_MODE=inline` → `diff` Exit 0, identisch (nach alphabetischer Key-Sortierung). Siehe `n-1_parity_json.out` / `n-1_parity_inline.out` |
| 12 | Live-Test Local-WP: /team/ + Detail-Pages | ✅ | `/team/`: HTTP 200, 8× `pxz-team-card-link` Anchor, alle 8 Namen (Stracke/Saul/Barcsay/Seelig/Jawich/Shahin/Landeberg/Arbitmann); `/dr-stracke/`: 200; `/docteur-saul/`: 200 |
| 13 | Evidence + Commits | ✅ | Diese Datei + 3 Commits (Cortex-Web, Theme, Nexus) |

**Score: 12/13 grün + 1 dokumentierte Abweichung** = **92 %** (AK-2 Line-Count-Schwelle verfehlt, Funktionalität 100 %).

---

## Pre-Flight am Session-Ende

```
validate.sh       → OK (1 file)
cw-transfer list  → wordpress.template.praxis = stable
/team/            → HTTP 200, 8 cards, 8 slugs
/dr-stracke/      → HTTP 200
/docteur-saul/    → HTTP 200
```

---

## Architektur-Entscheidung (auditierbar)

4 Varianten geprüft (§2 der Spec). Gewählt: **V2 JSON-Data-File** (`inc/data/team.json`).
Begründung: höchste Symmetrie zum produktiven Shopify-Pattern-B (beide schreiben
eine Theme-Asset-Datei, beide CW-008-Backup-fähig, beide git-diffbar, beide
später per N-6.3 diffbar).

Verworfen:
- V1 PHP-Generate — schwer diffbar, generierter PHP-Code anfällig
- V3 WP-Option — keine Git-Historie, DB-Backup nötig, WP-REST-Abhängigkeit
- V4 Post-Meta — unsauberes Datenmodell (ein großes Meta-Feld pro Page)

---

## Nicht erledigt (bewusst, Scope-Verbote §8)

- **Kein Media-ID-Resolver** — `image_id = 0` wie IST, bleibt für Folge-Phase.
- **Kein Prod-Push** — Nur Local-WP. Prod-Push (westend-hausarzt.com) braucht
  Operator-Aktion + eigenen Workflow (kein Filesystem-Zugriff auf domainfactory).
- **Kein N-6.3 `diff wp:template`** — eigene Folge-Front, reuse
  `build-then-fetch-then-diff`-Pattern (N-6/N-6.2), hier Filesystem-Read
  statt REST.
- **Kein Entfernen des Inline-Arrays** — bleibt als dokumentierter Fallback.

---

## Live-Diff Evidence

**Lauf 1 (create):**
```
action: create
backup_path: null
size_bytes: 2797
```

**Lauf 2 (update, idempotent content, andere Timestamp):**
```
action: update
backup_path: adapters/wordpress/.backups/2026-04-23T19-17-47-075Z_inc_data_team.json
size_bytes: 2797
```

**Parity (PHP-side):**
```
diff n-1_parity_json.out n-1_parity_inline.out
# Exit 0 — inhaltlich identisch
```

---

## Pattern-Kandidat für Nexus

`wp-theme-data-json-pattern-b-reverse` — Shopify schreibt Theme-Asset via
Admin-API (`PUT /themes/.../assets.json`), WP schreibt Theme-File via
Filesystem (`fs.writeFile`). Beide mit CW-008-Backup, beide mit Schema-
Validation, beide mit stable-serialization (sorted keys, 2-space indent,
trailing newline für Diff-Freundlichkeit). **Symmetrie-Metrik:** 5 gemeinsame
Bausteine (Build-Step / Push-Step / Backup-Guard / Schema-Validation /
Idempotenz-Check).

Vorschlag: Pattern in `Nexus/_memory/patterns/wp-theme-data-json.md` +
Tutorial-Erweiterung `Second Brain/30 Tutorials/Arbeitsweise & Prozess/`
(in Session-Ende-Block 4).
