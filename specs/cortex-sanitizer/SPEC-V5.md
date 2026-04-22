# Cortex-Sanitizer — SPEC V5 (Selbstlernend + Auto-Apply)

> Stand: 2026-04-22 Session 23 · Erweiterung von `SPEC.md` (V4 Retroaktiv-Kur)
> Freigabe: Dr. Stracke implizit („wenn das implementiert ist, kannst du die Session beenden")

---

## §1 Ziel

V4 war Einmal-Kur + Probe. V5 macht den Sanitizer **dauerhaft selbstregulierend**:
- Er **lernt** aus dem Größenverlauf (Growth-Log) und erkennt Redundanz + tote Verweise
- Er **startet automatisch** bei Session-Ende (via LL-042 Schritt 3b) — nicht nur Report, sondern Auto-Apply bei Hard-Warn

---

## §2 Neue Module

### 2.1 `probes/growth-log.sh`
Jede Probe-Ausführung appended eine JSONL-Zeile `{ts, file, bytes, tokens, status}` an `Nexus/tools/cortex-sanitizer/logs/growth.jsonl`. Über Wochen sichtbar: welche Datei wächst wie schnell, wie oft Rotationen nötig sind.

### 2.2 `probes/redundancy-scan.sh`
Scant MD-Dateien auf Paragraphen (zwischen Leerzeilen, >160 Zeichen). MD5-Hash pro Paragraph, Zähler. Paragraphen mit Count ≥ 2 → Report in `logs/reports/redundancy-YYYY-MM-DD.md`.

### 2.3 `probes/stale-ref-scan.sh`
Extrahiert Pfad-Referenzen aus MEMORY, CLAUDE, GLOBAL_RULES, SESSION_RESUMEs (Regex `~/Cortex/[^\s)"]+` + ``projects/…` ` + `_memory/…`). Test-Existence via `test -e`. Tote Links → Report.

### 2.4 `actions/rotate-session-resume.sh`
**Echter Auto-Apply** der V4-Kur-Logik:
1. Backup in `_archive/sanitizer/auto-<ts>/`
2. Parse `^## §3-legacy-*` Blöcke aus SESSION_RESUME.md
3. Für jeden Block außer jüngstem: Titel → slugify → `_archive/sessions/YYYY-MM/session-XX-<slug>.md`
4. Blöcke aus SESSION_RESUME.md entfernen
5. §7 Archive-Index aktualisieren (neue Einträge anhängen)
6. Re-Probe → muss exit 0 liefern, sonst Rollback

### 2.5 `rotate.sh` erweitert
- `--probe` (unverändert, Report-only)
- `--plan` (unverändert, Report + Vorschläge)
- `--learn` (NEU): alle 3 Probes + growth-log-append + Zusammenfassung
- `--apply` (NEU: echt): bei Hard-Warn rotate-session-resume.sh; sonst „nothing to do"

### 2.6 `SESSION_LIFECYCLE.md §2 Schritt 3b` erweitert
```
bash rotate.sh --probe
if exit 1 (Hard-Warn):
  bash rotate.sh --apply
  bash rotate.sh --learn
  -> Dashboard §6 markiert mit 🔧 (auto-rotated)
else:
  bash rotate.sh --learn
  -> Dashboard §6 markiert mit ✅
```

---

## §3 Speicherort

```
Nexus/tools/cortex-sanitizer/
├── rotate.sh
├── README.md
├── probes/
│   ├── growth-log.sh
│   ├── redundancy-scan.sh
│   └── stale-ref-scan.sh
├── actions/
│   └── rotate-session-resume.sh
└── logs/
    ├── growth.jsonl            (git-tracked, klein, historisch wertvoll)
    └── reports/                (die 7 jüngsten Reports, ältere werden rotiert)
        └── latest.md
```

`logs/growth.jsonl` + `logs/reports/` sind **git-tracked** (Historie wichtig für Trend-Analysen). `logs/reports/` wird selbst-rotiert (nur letzte 7 Reports behalten).

---

## §4 Akzeptanzkriterien (8)

| # | Kriterium | Messung |
|---|---|---|
| AK-1 | `rotate.sh --learn` läuft durch, erzeugt growth.jsonl + Reports | bash + ls |
| AK-2 | `rotate.sh --apply` ist aktiv, nicht mehr „nicht implementiert" | grep |
| AK-3 | 3 Probe-Skripte existieren + sind ausführbar | ls -la |
| AK-4 | `actions/rotate-session-resume.sh` existiert | ls |
| AK-5 | `SESSION_LIFECYCLE.md §2 Schritt 3b` dokumentiert Auto-Apply | grep |
| AK-6 | Erste `--learn`-Run produziert non-empty growth.jsonl (≥ 1 Zeile pro Datei) | wc -l |
| AK-7 | Redundanz-Scan findet mindestens die V4-Kur-Duplikate (falls vorhanden) oder meldet „0 Duplikate" sauber | bash |
| AK-8 | Stale-Ref-Scan terminiert ohne Fehler, zeigt Anzahl toter Refs | bash |

---

## §5 Risiken + Rollback

| Risiko | Mitigation |
|---|---|
| Auto-Apply löscht versehentlich aktuellen §3-Block | Retention-1 hartkodiert: jüngste Session bleibt IMMER |
| Parse-Fehler in section-splitting | Pre-Apply-Backup + Rollback wenn re-probe exit ≠ 0 |
| Redundanz-Scan false-positives bei Standard-Phrasen | Min-Länge 160 Zeichen + Min-Count 2 |
| Stale-Ref-Scan false-positives bei geplanten Pfaden | Warning-only, kein Delete |

---

## §6 Nicht-Scope V5

- ML-basierte „Wichtigkeits-Bewertung" von Inhalten
- Auto-Verdichtung von MEMORY.md-Zellen (nur SESSION_RESUME wird auto-rotiert)
- Cross-Projekt-Semantik-Analyse
- Pre-Commit-Hook (weiterhin nur Session-Ende-Integration)
