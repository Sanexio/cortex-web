# Phase 4 Self-Check — 2026-04-19, Session 6

> Architekten-Modus, Phase 4 (Selbstprüfung) zu Phase 4 (Subsumierung praxis-redesign).
> Spec: `specs/phase-4/SUBSUMPTION.md`. Entscheidungen Dr. Stracke: **E1a + E2b + E3a**.
> Methodik: alle 12 Akzeptanzkriterien einzeln gemessen, Evidenz protokolliert.

---

## §0 Ausführungs-Reihenfolge (referenziert SUBSUMPTION.md §3.6)

| T | Aktion | Commit / Artefakt |
|---|--------|-------------------|
| T0 | Pre-Flight grün vor Beginn | `validate.sh` OK + `verify.sh` 54/54 + 10/10 grün |
| T1 | Cleanup (E2b): bridge-strategy promoten + Modified-Commits | `c350b05` (Cortex-Web) + `4583856` + `c519852` (praxis-redesign) |
| T2 | `git subtree add` (E1a) | `94e6e91 Add 'sites/praxis-webseite/'` |
| T3 | THEME_POINTER schreiben | `77adfc7 docs(phase-4): add THEME_POINTER` |
| T4 | Pfad-Referenz-Updates Nexus + Cortex-Web | `dd38922` (Cortex-Web), Nexus separat |
| T5 | `rm -rf praxis-redesign` (E3a) | (vorher `.env.sprint1.local` migriert mit MD5-Beweis) |
| T6 | Post-Subsumption Pre-Flight | verify.sh + validate.sh + review.sh alle ✅ |
| T7 | Self-Check (diese Datei) | `specs/phase-4/evidence/2026-04-19_self-check.md` |

---

## §1 AK-Tabelle mit Evidenz

| AK | Kriterium | Status | Evidenz |
|---:|-----------|:------:|---------|
| **AK-1** | `sites/praxis-webseite/` enthält ≥118 Dateien (+ THEME_POINTER + 2 cleanup verify-shots + 2 T6 verify-shots = ≥123) | ✅ | `git ls-files sites/praxis-webseite/ \| wc -l` → **123** |
| **AK-2** | `Cortex-Web/specs/bridge-strategy/` enthält 00, 01, 02 | ✅ | `ls -1 specs/bridge-strategy/ \| wc -l` → **3** (00_BRAINSTORMING_KONZEPT.md, 01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md, 02_ENTSCHEIDUNGEN_FINAL.md) |
| **AK-3** | THEME_POINTER mit aktuellem Theme-Commit `257304e` | ✅ | `grep "257304e" sites/praxis-webseite/THEME_POINTER.md` → 2 Treffer (Hash + Commit-Message) |
| **AK-4** | Git-Historie verfügbar: alle 13 praxis-Commits erreichbar | ✅ | `git log c519852 --oneline \| wc -l` → **13** (caveat: `git log <pfad>` zeigt sie nicht direkt, weil Subtree-Add die Commits ohne Pfad-Prefix einmerged; Workaround: `git log c519852` oder `git log --all`) |
| **AK-5** | Pre-Flight am neuen Pfad grün | ✅ | `cd sites/praxis-webseite && bash tools/verify.sh` → §1 Split + §2 Reset + §3 Computed-Style **54/54** + §4 Alignment **10/10** grün, Exit 0 |
| **AK-6** | Cortex-Web validate.sh basic + CHECK_SHOPIFY grün | ✅ | `bash tools/validate.sh` → `validate: OK (1 file(s))`, Exit 0; `CHECK_SHOPIFY=1 bash tools/validate.sh` → `validate: shopify OK (juvantis.myshopify.com, HTTP 200)`, Exit 0 |
| **AK-6b** | Cortex-Web review.sh weiterhin 11/11 grün (Phase-3-Funktionalität unberührt) | ✅ | `bash tools/review.sh` → `AK automatisch: 11/11 grün`, Evidenz-Refresh in `specs/phase-3/evidence/` (Commit `61b5187`) |
| **AK-7** | Local-WP-Theme funktional, PXZ_VERSION 2.7.5 live | ✅ | verify.sh §3 Computed-Style 54/54 grün auf Home + Karriere × 3 Viewports — Theme rendert unverändert |
| **AK-8** | Keine aktiven `projects/praxis-redesign`-Pfade mehr in Nexus oder Cortex-Web | ✅ | 34 verbleibende Treffer, alle historisch klassifiziert: 19 in SUBSUMPTION.md (Spec selbst), 3+1+1 in Nexus-Tutorials (didaktische Beispiele), 2 in bridge-strategy/02 (Strategie-Doku), 2 im Session-Log 2026-04-18 (Geschichts-Treue), 1 je in POC_*-Specs / CHANGELOG / PRE_FLIGHT_CHECKLIST (mit Klammer-Hinweis "vor 2026-04-19") / design-token-pattern. Keine funktionalen Verweise. Klassifikation: `grep -rn "projects/praxis-redesign" \| awk -F: '{print $1}' \| sort \| uniq -c` |
| **AK-9** | `~/Cortex/projects/praxis-redesign/` existiert nicht mehr (E3a) | ✅ | `ls ~/Cortex/projects/` → Cortex-Web, Gaming, Juvantis, telegram-bridge (kein praxis-redesign) |
| **AK-10** | praxis-redesign Working-Tree-Reste sauber vor Subsumierung | ✅ | T1 hat alle `M`/`??` aufgelöst (3 Commits: `c350b05`, `4583856`, `c519852`) |
| **AK-11** | Theme-Repo unverändert: HEAD = `257304e` | ✅ | `cd <theme-pfad> && git rev-parse HEAD` → `257304e7e9473d77a3a57d7f1b5c39b74e5dc13d`, `git status --short` → leer |
| **AK-12** | Self-Check-Datei vorhanden | ✅ | Diese Datei (`specs/phase-4/evidence/2026-04-19_self-check.md`) |

---

## §2 Score

**12/12 = 100 %** (AK-6b ist Bonus-Check, zählt als Teil von AK-6).

---

## §3 Architekten-Selbstprüfung (4-Phasen-Prozess)

### Phase 1 (Verständnis) — Spec §1

Anforderung präzise paraphrasiert in `SUBSUMPTION.md §1.1`. Zielzustand (8 Punkte),
Constraints (8 Punkte) und implizite Annahmen (6 Punkte) explizit gemacht.
Pre-Audit hat **vier Befunde** geliefert, die in der Spec dokumentiert sind:
1. Drei separate Git-Repos (kein triviales `git mv` möglich)
2. Working-Tree-Unclean (Modified ARCHITECTURE.md + untracked bridge-strategy)
3. Undokumentierter Ordner `legacy-juvantis-praxis-web/`
4. `git-filter-repo` nicht installiert

Drei Entscheidungspunkte (E1/E2/E3) mit jeweils 3 Optionen + Architekten-Empfehlung
formuliert. Dr. Stracke hat „ich folge deiner Entscheidung" geantwortet → E1a + E2b + E3a.

### Phase 2 (Lösungsdesign) — Spec §3 + §3.6

7-Schritte-Plan T0–T7 deterministisch dokumentiert mit Befehlen, erwarteten
Outputs und Rollback-Plan. Akzeptanzkriterien-Tabelle (12 AKs) und
Risiken-Matrix (7 Risiken, 5 Mitigationen) vor der Umsetzung niedergeschrieben.

### Phase 3 (Umsetzung)

Genau wie geplant. Keine Abweichungen, keine Scope-Erweiterung. Eine bewusste
Erweiterung: T1 hatte einen Sub-Commit für die T0-verify-Shots in praxis-redesign
ergänzt (`c519852`), um AK-10 (Working-Tree clean) sauber zu erfüllen — fiel
während T1 auf, kein Re-Plan.

Kritischer Sicherheits-Check vor T5: `.env.sprint1.local` (gitignored, 13 echte
Werte) wurde vor `rm -rf` per `cp` + `chmod 600` nach
`sites/praxis-webseite/.env.sprint1.local` migriert (MD5-Beweis: beide Dateien
`1c2675e95c423784cf5b9b04f8a65c9c`). Cortex-Web's `.gitignore` deckt `.env.*` ab,
also automatisch ignoriert. **Spec hatte das nicht antizipiert** — Lessons learned
für Phase 5 (siehe §4).

### Phase 4 (Selbstprüfung)

Diese Datei. 12/12 AKs grün, alle mit objektiver Evidenz (Befehl + Output).

---

## §4 Lessons Learned (für Phase 5 Juvantis-Subsumierung)

| LL | Beobachtung | Konsequenz für Phase 5 |
|----|-------------|------------------------|
| **PH4-LL-1** | `.env.sprint1.local` (gitignored) wäre bei `rm -rf` ohne Sicherheits-Check verloren gewesen. Spec §3.6 hatte den Schritt nicht antizipiert. | Pre-Audit für Phase 5 MUSS explizit alle gitignored Dateien mit echten Daten auflisten (nicht nur `*.env.*`, auch z.B. `_secrets/`, `private/`, `.shopify/`). Sicherer Migrations-Schritt VOR `rm -rf` ist Pflicht-Bestandteil von T5. |
| **PH4-LL-2** | `git subtree add` ohne `--squash` macht alle Commits erreichbar, aber `git log <pfad>` zeigt sie nicht (weil ursprünglicher Pfad ohne Prefix war). Dokumentation wichtig. | Im SUBSUMPTION.md-Template für Phase 5 prominenter Caveat in AK-4. Optionale Alternative `git subtree add --squash` erwähnen, wenn nur „aktueller Stand" reicht. |
| **PH4-LL-3** | T6 Re-Run von `review.sh` hat `phase-3/evidence/*` aktualisiert — diese mussten in einem separaten Commit landen, sonst hätte der Phase-4-Doku-Commit unschuldig die Phase-3-Evidenz mit-modifiziert. | Phase-5-Plan: vor T6 entscheiden, welche Evidenz-Pfade „dürfen" mit-aktualisiert werden, und den Commit-Plan entsprechend strukturieren. |
| **PH4-LL-4** | 34 historische Verweise auf alten Pfad sind nicht ohne weiteres unterscheidbar von „vergessenen aktiven Verweisen" — hier nur durch manuelle Klassifikation gelöst. | AK-8-Definition für Phase 5 sollte ein Whitelist-Pattern liefern (z.B. Datei-Typ + Glob), damit die Auswertung automatisierbar wird. Vorschlag für Pattern-Katalog: `Nexus/_memory/patterns/cross-repo-subsumption.md`. |
| **PH4-LL-5** | Theme-Pointer-Pattern (Datei mit Pfad + Commit-Hash + Wiederherstellung) ist wiederverwendbar für Juvantis-Theme. | Phase-5-Spec: gleiche Struktur für `sites/juvantis-webseite/THEME_POINTER.md`, aber zusätzlich der GitHub-Branch (`shopify-theme`) als Quelle (dort gibt es Remote, anders als beim Praxis-Theme). |

---

## §5 Was diese Subsumierung NICHT angefasst hat (Verifikation)

| Bereich | Geprüft | Stand |
|---------|:-------:|-------|
| Theme-Repo (`praxiszentrum/`) HEAD | ✅ | `257304e` unverändert (AK-11) |
| Theme-Repo Working Tree | ✅ | leer (`git status --short` = nichts) |
| Cortex-Web Adapter (`adapters/wordpress/`, `adapters/shopify/`) | ✅ | unberührt, review.sh AK-2/3/6/7 grün |
| Trunk-Content (`trunk/content/products/bluttests/basic-check.yaml`) | ✅ | unberührt, AK-2 Content-Parität grün |
| Juvantis-Repo (`projects/Juvantis/`) | ✅ | nicht angefasst — kein Phase-5-Go |
| Telegram-Bridge | ✅ | unabhängig, nicht angefasst |
| Shopify-Test-Produkt `10940942844171` | ✅ | bleibt im Store, AK-7 Idempotenz greift weiterhin |

---

## §6 Verbleibende Cleanup-Punkte (nicht-blockierend)

Werden in Phase-5-Vorbereitung oder „Session beenden"-Workflow adressiert:

1. CHANGELOG.md `Cortex-Web` braucht v0.5.0-Eintrag mit Phase-4-Highlights (T8 — wird beim „Session beenden"-Workflow LL-042 Schritt 5 ergänzt).
2. SESSION_RESUME.md Status-Block (§3 Letzte Session, §4 Offene Tasks, §6 Sofort-Status-Frage, §8 Session-Historie) auf Phase 4 ✅ + Sprint-2-Wahl als Nächstes umschreiben — auch beim „Session beenden".
3. Optional: Pattern `Nexus/_memory/patterns/cross-repo-subsumption.md` aus dieser Erfahrung extrahieren (PH4-LL-1…5).
4. Optional: Tutorial in `Second Brain/30 Tutorials/Webentwicklung/` zur `git-subtree`-Migration mit Cortex-Web-Beispiel.

---

## §7 Sign-off

- **Architekten-Modus 4-Phasen-Prozess** vollständig durchlaufen.
- **12/12 AKs** mit objektiver Evidenz grün.
- **Verbote** aus SESSION_RESUME §7 alle eingehalten:
  - `git mv` erst nach Spec-Freigabe ✅ (Spec lag vor T1)
  - Keine Datenverschiebung aus Juvantis ✅
  - Kein Push zu Prod-Shopify in `status="active"` ✅
  - Kein Touch am `praxiszentrum`-Theme ✅ (HEAD unverändert)
  - CW-001 Trunk-Master unbestritten ✅ (review.sh AK-8 grün)
  - CW-005 Plattform-Trennung ✅ (HWG-Compliance AK-4 grün)
  - Keine Secrets im Repo ✅ (`.env.sprint1.local` über `.gitignore` abgedeckt, chmod 600)
  - Kein `--force` ✅
  - Test-Produkt `10940942844171` nicht gelöscht ✅

**Phase 4 abgeschlossen.** Bereit für „Session beenden" (LL-042 Schritt 1–5) oder direkten Übergang in Praxis-Sprint-2 / S2.1.

---

*Stand: 2026-04-19, Ende Phase 3 (Umsetzung) + Phase 4 (Selbstprüfung) der Phase-4-Subsumierung.*
