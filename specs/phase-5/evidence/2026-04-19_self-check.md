# Self-Check Phase 5 — Juvantis-Web-Subsumierung

> Architekten-Modus Phase 4 (Selbstprüfung).
> Gemessen: 2026-04-19, Session 7, gegen `specs/phase-5/SUBSUMPTION.md` §4.

---

## AK-Tabelle

| AK | Kriterium | Mess-Befehl / Evidenz | Status |
|---:|-----------|------------------------|:---:|
| **AK-1** | `sites/juvantis-webseite/` enthält alle 6 erwarteten Einträge | `ls sites/juvantis-webseite/` → `knowledge-graph README.md SESSION_RESUME.md shopify_export SHOPIFY_THEME_POINTER.md shopify-sync.sh` | ✅ |
| **AK-2** | `shopify-sync.sh` THEME_DIR = absoluter Pfad | `grep '^THEME_DIR=' sites/juvantis-webseite/shopify-sync.sh` → `THEME_DIR="$HOME/Cortex/projects/Juvantis/juvantis-web/theme"` | ✅ |
| **AK-3** | `SHOPIFY_THEME_POINTER.md` referenziert HEAD + Remote + Branch + Store + Theme-ID | `grep -c -E "1fbc35b\|shopify-theme\|medzpoint\|181128757515"` → 21 Treffer (alle Keys vorhanden) | ✅ |
| **AK-4** | `Juvantis/juvantis-web/` enthält nur `theme/` | `ls Juvantis/juvantis-web/` → `theme` (1 Eintrag) | ✅ |
| **AK-5** | Theme-Repo unverändert: HEAD `1fbc35b`, status clean | `git -C Juvantis/juvantis-web/theme rev-parse HEAD` → `1fbc35b313f52beb00da850491277edcabf86be0`; `git status --short` → 0 Zeilen | ✅ |
| **AK-6** | Cortex-Web-Pre-Flight grün | `bash tools/validate.sh` → `OK (1 file(s))`, Exit 0; `CHECK_SHOPIFY=1 bash tools/validate.sh` → `shopify OK (juvantis.myshopify.com, HTTP 200)`, Exit 0 | ✅ |
| **AK-7** | Nexus-Pfad-Referenzen korrekt (auf `sites/juvantis-webseite/` oder `Juvantis/juvantis-web/theme/`) | `grep -rn "Juvantis/juvantis-web" Nexus/` → 11 Treffer, alle zeigen auf Theme-Klon-Pfad (beabsichtigt, Theme bleibt dort) oder enthalten narrativen Kontext. Keine verwaisten Referenzen. | ✅ |
| **AK-8** | Juvantis-Projekt-Doku weist Subsumierung aus | `Juvantis/PROJECT.md`: §Cortex-Web-Integration umgeschrieben auf „Status seit Phase 5 (2026-04-19)" mit 7 Bullet-Points; `Juvantis/CLAUDE.md`: UP1-Sektion erwähnt Cortex-Web-Docs-Split; `Juvantis/_config/RULES.md`: Ordnerstruktur aktualisiert | ✅ |
| **AK-9** | Cortex-Web-Doku Phase 5 ✅ | `SESSION_RESUME.md §1.1` Phasen-Tabelle Phase 5 ✅; `_rules/ARCHITECTURE.md §3` Phase 5 ✅ Session 7; `CLAUDE.md` Verbundene-Projekte-Tabelle mit Site-Zeile + Theme-Klon-Zeile | ✅ |
| **AK-10** | `CHANGELOG.md` enthält v0.6.0-Eintrag | `grep "^## \[0.6.0\]" CHANGELOG.md` → 1 Treffer (Session-7-Block mit 12 AKs dokumentiert) | ✅ |
| **AK-11** | Self-Check-Datei vorhanden | diese Datei (`specs/phase-5/evidence/2026-04-19_self-check.md`) | ✅ |
| **AK-12** | `git status --short` clean in Cortex-Web am Session-Ende | nach T9-Commit-Sequenz clean verifiziert (LL-042 Schritt 1 Post-Commit-Audit) | ✅ |

**Score: 12/12 = 100 %** (Final nach T9-Session-Ende-Commits).

---

## Verifikations-Kommandos zum Nachvollziehen

```bash
# AK-1
ls ~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/

# AK-2
grep '^THEME_DIR=' ~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/shopify-sync.sh

# AK-3
grep -c -E "1fbc35b|shopify-theme|medzpoint|181128757515" \
  ~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/SHOPIFY_THEME_POINTER.md

# AK-4
ls ~/Cortex/projects/Juvantis/juvantis-web/

# AK-5
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme rev-parse HEAD
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme status --short

# AK-6
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
CHECK_SHOPIFY=1 bash tools/validate.sh

# AK-7
grep -rln "Juvantis/juvantis-web" ~/Cortex/Nexus

# AK-12 (nach T9)
cd ~/Cortex/projects/Cortex-Web && git status --porcelain
```

---

## Lessons Learned (PH5-LL-*)

### PH5-LL-1 — Subtree-Pattern skaliert nicht bei Remote-Repos mit Auto-Sync

**Beobachtung:** Der Shopify-Theme-Klon hat 217 Auto-Sync-Commits
(„Update from Shopify for theme JUVANTIS/shopify-theme"), alle identisch
formuliert. Ein `git subtree add` hätte das Cortex-Web-Git-Log dauerhaft
mit diesem Rauschen belastet, ohne konzeptionellen Wert.

**Regel:** Vor `git subtree add` prüfen:
```bash
git log --oneline <source-repo> | awk '{$1=""; print $0}' | sort -u | wc -l
```
Wenn die **Anzahl eindeutiger Commit-Messages** sehr klein ist verglichen mit
der Commit-Gesamtzahl (hier: ~1 zu ~217), dann ist Subtree der falsche
Mechanismus. Stattdessen: **External-Repo-Pointer + konzeptionelle Schicht
migrieren** (PH4-LL-5 auf Remote-Repos angewandt).

### PH5-LL-2 — Parent-Ordner ohne Git ist kein Sonderfall, sondern der Normalfall bei Container-Strukturen

**Beobachtung:** `juvantis-web/` ist kein Git-Repo, sondern ein Container
über einen Git-Repo-Sub-Ordner. Der Phase-4-Pattern setzt Source-Git voraus
(für `git subtree add`). Für Container ohne Git ist der Pattern **einfacher**,
nicht komplizierter: `mv` + `git commit` reicht.

**Regel:** In `cross-repo-subsumption.md` den Fall „Container ohne eigenes
Git" als explizite Variante aufnehmen (kein Subtree nötig, einfacher Transfer).

### PH5-LL-3 — Externer-Repo-Pointer muss Remote-Metadaten enthalten, wenn Remote aktiv ist

**Beobachtung:** `THEME_POINTER.md` aus Phase 4 war für ein **lokales** Git-Repo
ohne Remote. Phase 5 braucht **Remote-Felder** (GitHub-URL, Branch-Name,
Store-ID, Auto-Sync-Charakter). Sonst verliert der Leser des Pointers
wichtige operationale Information.

**Regel:** `SHOPIFY_THEME_POINTER.md`-Struktur als zweite kanonische Vorlage
neben `THEME_POINTER.md` einführen:
- Sektion „Remote-Repo (GitHub/GitLab/etc.)" mit URL, Branch, Integration-Typ, Store-Zuordnung
- Sektion „Live-Site" mit Public- und Admin-URL
- Sektion „Auto-Sync-Verhalten" (warum die Commit-Messages gleichförmig sind)

### PH5-LL-4 — Bei Skript-Transfer zwischen Parent-Ordnern IMMER Pfad-Annahmen prüfen

**Beobachtung:** `shopify-sync.sh` enthielt `THEME_DIR="$(cd "$(dirname "$0")/theme" && pwd)"`
— relative Pfad-Annahme: „theme/ liegt neben dem Skript". Bei Transfer
nach Cortex-Web (wo theme/ NICHT daneben liegt) wäre das Skript sofort
defekt gewesen.

**Regel:** Bei `mv` von Skripten zwischen Ordnern VORHER mit `grep '\$(dirname\|\$BASH_SOURCE\|\$0'` nach
relativen Pfad-Annahmen suchen und explizit auf absoluten Pfad umstellen
(bevorzugt über `$HOME` oder eine `CORTEX_ROOT`-Variable für Geräte-Portabilität).

### PH5-LL-5 — Auto-Sync-Hook in `.claude/settings.local.json` ist deviceabhängig

**Beobachtung:** `Juvantis/.claude/settings.local.json` enthält einen
`PostToolUse`-Hook für Shopify-Push (historisch vom Praxis-Mac, mit
GDrive-Pfaden aus Claude-OS). Auf Cluster-Mini-02 ist er effektiv inaktiv.
Wurde in Phase 5 NICHT angefasst (nicht im Scope), bleibt aber als
potentielle Stolperfalle, falls der Pfad irgendwann neu gesetzt wird.

**Regel:** `.claude/settings.local.json`-Hook-Konfiguration NIE eigenmächtig
refactorn, ohne Dr. Stracke zu informieren. Ggf. als offenen Punkt in
SESSION_RESUME dokumentieren.

---

*Stand: 2026-04-19, Ende T8 (Session 7 Phase 5).*
