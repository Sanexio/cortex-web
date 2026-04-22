# Cortex-Sanitizer — SPEC V4 (Retroaktiv-Kur + Minimal-Rotation)

> Stand: 2026-04-22 · Architekt: Claude (Phase 2 Lösungsdesign) · Freigabe: offen
> Ziel-Session: 23 · Vorläufer: SESSION_22 (content-bridge-v1 + cross-site-transfer)

---

## §1 Ziel

Nexus + Cortex-Web auf **Token-effizientes Arbeiten** zurückführen, ohne Informationsverlust.
„Single Source per Fact" durchsetzen: jede Information wohnt an genau einem Ort, andere Stellen verweisen.

**Primäre Metrik:** Nach Kur liest Claude alle Pflicht-Init-Dateien in einer Session **unter 50 k Tokens** ein (heute: ~120 k, Read-Limit bei 25 k/Datei wird dreimal gesprengt).

---

## §2 Scope V4

**Teil A — Retroaktiv-Einmal-Kur** (Session 23)
1. `Cortex-Web/SESSION_RESUME.md` verkleinern
2. `Nexus/_memory/MEMORY.md` Aktive-Projekte-Zellen verdichten
3. `Nexus/CLAUDE.md` Projektabschnitte entschlacken
4. Archiv-Struktur anlegen

**Teil B — Minimal-Rotation-Tool** (Session 23)
5. `Nexus/tools/cortex-sanitizer/rotate.sh` — simples Bash-Skript, idempotent, dry-run-fähig
6. Neue Regel `LL-044` in `Nexus/_rules/GLOBAL_RULES.md`
7. `SESSION_LIFECYCLE.md` §2 ergänzen um Schritt 3b (Sanitizer-Probe bei Session-Ende)

**Außerhalb Scope V4** (spätere Sessions):
- Probes (Redundanz-Scan, Dead-Ref-Scan)
- `--guard` Pre-Commit-Hook
- Auto-Apply bei Session-Ende
- Andere Projekte als Cortex-Web/Nexus

---

## §3 Token-Budgets (neu, als Basis für LL-044)

| Datei-Typ | Soll-Max Tokens | Hard-Warn | Kur-Aktion bei Überschreitung |
|---|---:|---:|---|
| `<projekt>/SESSION_RESUME.md` | 15 k | 20 k | Rotation: §3-legacy-* → `<projekt>/_archive/sessions/YYYY-MM/` |
| `Nexus/_memory/MEMORY.md` | 10 k | 15 k | Aktive-Projekte-Zellen auf 3 Zeilen verdichten + Pointer |
| `Nexus/CLAUDE.md` | 12 k | 18 k | Projekt-Sprint-Logs in `Nexus/_archive/claude-md/YYYY-MM.md` auslagern |
| `Nexus/_rules/GLOBAL_RULES.md` | 12 k | 18 k | (heute 23 k → in späterer Session: Lessons-Learned-Block extrahieren) |

Richtwert: 1 Token ≈ 4 Bytes für deutsche Markdown-Texte. Sanitizer misst per `wc -c`.

---

## §4 Algorithmen

### 4.1 SESSION_RESUME-Rotation (Cortex-Web)

**IST heute (1627 Zeilen, 123 KB):**
```
§0  EINSTIEG Pflicht-Lesung            [BEHALTEN]
§1  Stand & Version                    [BEHALTEN]
§2  Pre-Flight-Befehle                 [BEHALTEN]
§3  Letzte Session — Session 21        [BEHALTEN]
§3-legacy-session22-parallel           [BEHALTEN als jüngster Legacy — wird in Session 24 rotiert]
§3-legacy-session20                    [ARCHIV]
§4  Offene Tasks                       [BEHALTEN, DEDUP]
§5  Sofort-Status-Frage                [BEHALTEN]
§6  Verbote                            [BEHALTEN]
§3-legacy-session19                    [ARCHIV]
§3-legacy-session16                    [ARCHIV]
§3-legacy   Session 15                 [ARCHIV]
§3-legacy   Session 14                 [ARCHIV]
§3b Session 13                         [ARCHIV]
§3a Session 12                         [ARCHIV]
§3a Session 11                         [ARCHIV]
§3a Session 10                         [ARCHIV]
§3a Session 9                          [ARCHIV]
§3b Session 7                          [ARCHIV]
§4 (Duplikat ab Z.1153)                [LÖSCHEN — Duplikat aus alter Version]
```

**SOLL nach Kur:**
Die §3-legacy-Blöcke der Sessions 20, 19, 16, 15, 14, 13, 12, 11, 10, 9, 7 werden je als eigene Datei nach `Cortex-Web/_archive/sessions/2026-04/session-XX-thema.md` verschoben (schreibend, nicht kopierend). In SESSION_RESUME.md bleibt ein Archiv-Index:

```markdown
## §7 Archivierte Sessions (Cross-Reference)

| Session | Datum | Thema | Archiv |
|---|---|---|---|
| 20 | 2026-04-22 | S2.3-aerzte-services | _archive/sessions/2026-04/session-20-aerzte-services.md |
| 19 | 2026-04-22 | S2.4 Menu | _archive/sessions/2026-04/session-19-s2.4-menu.md |
| …  | … | … | … |
```

**Regel „Retention-2":** SESSION_RESUME.md hält IMMER §3 (letzte Session) + §3-legacy der vorletzten Session. Alles ältere wird archiviert.

### 4.2 MEMORY.md Aktive-Projekte-Verdichtung

**IST (Zeile 22 heute):** Eine Tabellenzelle für `praxis-webseite` enthält ~15 k Tokens narrativen Session-Log-Text mit `<br><br>Vorher (Session X):`-Stapeln bis Session 14.

**SOLL:** Jede Aktive-Projekte-Zelle max. 3 Zeilen:
```
| praxis-webseite (in Cortex-Web) | Sprint 2 aktiv, 6/7 Cluster migriert · Theme PXZ 2.7.18 | Details → SESSION_RESUME.md · Letzte Session: 21 (S2.3-diagnostik ✅) |
```

Der vollständige Session-Log wird **nicht dupliziert** — er steht bereits in `SESSION_RESUME.md` + `_archive/sessions/`. MEMORY.md ist Index, nicht Speicher.

### 4.3 Nexus/CLAUDE.md Projektabschnitte

**IST (Zeilen 394–651 heute):** Abschnitt „Cortex-Web — Common-Trunk-Dachprojekt" enthält vollständige Session-Logs Session 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20 als Prosa.

**SOLL:** Ein kompakter Abschnitt:
```markdown
## Cortex-Web — Common-Trunk-Dachprojekt (ab 2026-04-18)

[Architektur-Beschreibung — BEHALTEN, ~40 Zeilen]

**Aktueller Stand:** siehe `Cortex-Web/SESSION_RESUME.md`
**Session-Historie:** siehe `Cortex-Web/_archive/sessions/` und `Nexus/_archive/claude-md/2026-04.md`

[Pflicht-Lesung Liste — BEHALTEN]
[Phasen-Plan Tabelle — BEHALTEN, statisch]
```

Die ausgelagerten Session-Logs landen 1:1 (append-only) in `Nexus/_archive/claude-md/2026-04.md` — nichts geht verloren, nur Lesepfad ändert sich.

---

## §5 Archiv-Ort (Vorschlag: Hybrid)

| Archiv-Inhalt | Ziel-Pfad | Begründung |
|---|---|---|
| SESSION_RESUME-Legacy-Blöcke | `<projekt>/_archive/sessions/YYYY-MM/session-XX-thema.md` | Projekt-lokal, weil projekt-spezifisch, Git-tracked |
| MEMORY-Legacy-Zelleninhalt | **nicht archivieren** — schon in SESSION_RESUME + Session-Archive redundant vorhanden | Keine Informations-Insel |
| Nexus/CLAUDE.md Sprint-Logs | `Nexus/_archive/claude-md/YYYY-MM.md` | Zentral, weil projekt-übergreifender Ursprung |

`_archive/`-Ordner sind Git-tracked (damit wiederherstellbar), aber werden von der Pflicht-Init-Reihenfolge nicht geladen.

---

## §6 Werkzeug `rotate.sh` (Minimal-Variante)

```
Nexus/tools/cortex-sanitizer/
├── rotate.sh          # bash, ~200 Zeilen
├── README.md          # wie benutze ich das
└── config.yaml        # Token-Budgets + Pfade
```

**Aufruf:**
```bash
# Nur Report (default)
bash Nexus/tools/cortex-sanitizer/rotate.sh --probe

# Dry-run mit Vorschlag
bash Nexus/tools/cortex-sanitizer/rotate.sh --plan <projekt>

# Anwenden (legt Backup in _archive/sanitizer/<ts>/ an)
bash Nexus/tools/cortex-sanitizer/rotate.sh --apply <projekt>
```

**Kernlogik (Pseudocode):**
```
for each file in scope:
  count_tokens(file)
  if over_budget:
    parse markdown sections
    detect §3-legacy-* blocks (regex '^## §3-legacy')
    for each block (except most recent):
      slugify heading -> filename
      write to <archive-path>
      remove from source
    dedupe §4 if appears twice
  report diff-stat
```

Keine Node-Dependency, keine JS-Tooling, kein puppeteer. Bash + `awk`/`sed` reicht für markdown-section-splitting.

---

## §7 Akzeptanzkriterien (12)

| # | Kriterium | Messung |
|---|---|---|
| AK-1 | SESSION_RESUME.md < 20 KB nach Kur | `wc -c` |
| AK-2 | MEMORY.md < 20 KB nach Kur | `wc -c` |
| AK-3 | Nexus/CLAUDE.md < 25 KB nach Kur | `wc -c` |
| AK-4 | 11 Legacy-Session-Blöcke in `Cortex-Web/_archive/sessions/2026-04/` auffindbar | `ls \| wc -l` |
| AK-5 | `§7 Archivierte Sessions`-Index in SESSION_RESUME.md listet alle Archive | grep |
| AK-6 | Duplikat-§4 ab Z.1153 entfernt | grep `^## §4 Offene Tasks` → 1 Treffer |
| AK-7 | `Nexus/_archive/claude-md/2026-04.md` enthält Cortex-Web Session-Logs 3–20 | grep |
| AK-8 | `Nexus/_rules/GLOBAL_RULES.md` hat neuen Abschnitt LL-044 | grep |
| AK-9 | `SESSION_LIFECYCLE.md` §2 hat Schritt 3b mit Sanitizer-Probe-Aufruf | grep |
| AK-10 | `rotate.sh --probe` exit 0 auf heutigem Stand nach Kur | bash |
| AK-11 | Pflicht-Init-Lesung (alle §0-Dateien von Cortex-Web) summiert < 50 k Tokens | manuell/wc |
| AK-12 | Kein Informationsverlust: alle archivierten Session-Inhalte per Pfad-Pointer auffindbar | Stichprobe 3× |

---

## §8 Risiken + Rollback

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Unintendierte Löschung durch sed-/awk-Fehler | mittel | Pre-Apply-Backup in `_archive/sanitizer/<ts>/` (vollständige Kopie der Originale) |
| Verwaiste Pointer nach Verschiebung | niedrig | AK-12 Stichproben-Check; grep auf alte Pfade |
| Git-History verliert Kontext | niedrig | Archivierte Sessions behalten eigene Git-History, nur Lesepfad ändert sich |
| Kur bricht aktive Arbeit (z. B. läuft während Sprint 23) | niedrig | Pre-Flight `git status` muss clean sein (derzeit ✓, nach Session-22-Commit) |

**Rollback:** `git reset --hard` auf Commit vor Kur. Weil alles Git-tracked, ist Rollback atomar.

---

## §9 Umsetzungs-Reihenfolge (Phase 3 nach Freigabe)

1. T1 Backup: `cp -r` der 3 Ziel-Dateien in `_archive/sanitizer/2026-04-22_pre-v4/`
2. T2 `Cortex-Web/_archive/sessions/2026-04/` anlegen + 11 Legacy-Sessions extrahieren
3. T3 SESSION_RESUME.md neu schreiben (§0–§6 behalten, §7 Archiv-Index ergänzen, Duplikat-§4 raus)
4. T4 `Nexus/_archive/claude-md/2026-04.md` anlegen + Session-Logs aus Nexus/CLAUDE.md extrahieren
5. T5 Nexus/CLAUDE.md Cortex-Web-Abschnitt komprimieren
6. T6 MEMORY.md Aktive-Projekte-Zellen verdichten
7. T7 `Nexus/tools/cortex-sanitizer/` anlegen (rotate.sh + README + config.yaml)
8. T8 `LL-044` in GLOBAL_RULES.md ergänzen
9. T9 `SESSION_LIFECYCLE.md` §2 Schritt 3b ergänzen
10. T10 `rotate.sh --probe` Run → muss grün sein
11. T11 AK-Self-Check 12/12
12. T12 Commits: 2 sinnvolle Einheiten (Cortex-Web-Kur + Nexus-Kur+Tool+Regel)

---

## §10 Offene Freigabe-Fragen

**F1 — Retention-Tiefe:** Jüngste Session immer behalten. Aber §3-legacy-session22 (committet, aber inhaltlich außerhalb Praxis-Sprint) auch behalten?
- (F1a) Ja, als Referenz für aktuelle Cross-Site-Architektur
- (F1b) Nein, auch archivieren — SESSION_RESUME ist nur „Letzte Session"

**F2 — Archiv-Commit-Strategie:**
- (F2a) Ein großer Kur-Commit „sanitizer v4 retroaktiv"
- (F2b) Zwei Commits: Cortex-Web-Kur + Nexus-Kur+Tool

**F3 — Tool-Ort:**
- (F3a) `Nexus/tools/cortex-sanitizer/` (mein Vorschlag, projekt-übergreifend)
- (F3b) `Cortex-Web/tools/cortex-sanitizer/` (konsistent mit anderen Cortex-Web-Tools)

**F4 — LL-044-Wirkung:**
- (F4a) Nur beschreibend (Soll-Budgets, Claude prüft bei Session-Ende manuell)
- (F4b) Enforcement via Sanitizer-Probe in SESSION_LIFECYCLE §2 Schritt 3b (automatisch)
- (F4c) Enforcement + git-pre-commit-hook

Nach Freigabe: Phase 3 Umsetzung (alle T1–T12 in einer Session oder aufteilbar).
