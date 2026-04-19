# SESSION_START — praxis-redesign

> **Verbindlich beim Einstieg in jede neue Claude-Session.** Nicht überspringen.
> Wenn ein Punkt fehlschlägt: Dr. Stracke informieren, nicht weitermachen.

> **Ab 2026-04-18 gilt Architekten-Modus** — siehe Schritt 2, Punkt 4.
> Keine Umsetzung ohne Spec. Keine Spec ohne Freigabe.

---

## Schritt 1 — Cortex-/Nexus-Init (LL-023)

Lies in dieser Reihenfolge:

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`

---

## Schritt 2 — Projekt-Regeln und Fehler lesen

4. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` **(verbindlich ab 2026-04-18)**
   → 4-Phasen-Prozess (Verständnis → Design → Umsetzung → Selbstprüfung). Fehlerklassen FK-1..FK-5. Verbotene Muster.
5. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` **(seit 2026-04-18)**
   → IST/SOLL, Schwachstellen-Register, Sprint-Roadmap 0–4. Vor jedem Task prüfen, welchem Sprint/Teilschritt der Task zugehört.
6. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md`
   → Jeder PXZ-E-Eintrag ist eine Lektion. Diese Fehler dürfen nicht wiederholt werden.
7. `~/Cortex/projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md`
   → Die harten Prüfpunkte vor jedem Deploy.
8. `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md`
   → Insbesondere §13 (Spacing), §14 (Card-Referenz), §15/§16 (Anti-Patterns).
9. `~/Cortex/projects/praxis-redesign/SESSION_RESUME.md`
   → Aktueller Stand (Version, letzte Änderungen, offene Aufgaben, Sprint-Status).
10. `~/Cortex/projects/praxis-redesign/specs/sprint-0/README.md` + `specs/sprint-0/OPEN_DECISIONS.md`
    → Aktueller Arbeitsspec (Sprint 0 — Foundation) und **blockierende Entscheidungen (b)(c)(d)** von Dr. Stracke.

---

## Schritt 3 — Screenshots checken

8. `screenshots/` durchgehen:
   - Referenz-Bilder `1.png, 2.png …` von Dr. Stracke → **harte Vorgaben 1:1**
     (PXZ-E-003: keine Interpretation, keine Verallgemeinerung).
   - Wenn neue Referenzen (höhere Nummer als in SESSION_RESUME.md) dazugekommen
     sind → im Chat ansprechen, bevor Code geändert wird.
9. `screenshots/claude/` — letzte Verifizierungs-Shots sichten, um den
   aktuellen Design-Stand zu verstehen.

---

## Schritt 4 — Pre-Flight ausführen (nur **lesend**)

Bevor du Code änderst, den aktuellen Zustand messen:

```bash
cd ~/Cortex/projects/praxis-redesign
tools/verify.sh
```

Erwartet: Exit 0. `verify.sh --all` führt §1 Split-Check + §2 Reset-Scope + Screenshots
+ §3 Computed-Style-Probe + **§4 Alignment-Probe** aus. Wenn nicht grün — Befund
dokumentieren (in Chat + im Fehlerprotokoll), bevor eine Änderung startet.

**Wichtig nach jeder CSS-Änderung (§7a PRE_FLIGHT):** AB-Diff mit Beweis:

```bash
bun run tools/ab-diff.mjs --override='<rekonstruiertes vorher-CSS>'
```

Die beiden Shot-Pfade + Delta + Alignment-Ergebnis gehören mit in die
„fertig"-Meldung an Dr. Stracke. Keine DevTools-Delegation, keine Bitte um Cache-Leeren.

---

## Schritt 5 — Status-Statement im Chat (Architekten-Stil)

Melde Dr. Stracke **präzise, technisch, strukturiert, keine Fülltexte**:

1. Welche Version ist live (`PXZ_VERSION` in `functions.php`) — aktuell **v2.7.2**.
2. Welche Referenzbilder liegen vor (Anzahl in `screenshots/*.png`).
3. `tools/verify.sh`-Status (OK / FAIL welche Checks).
4. **Architektur-Ebene:** Sprint-0-Status laut `_rules/ARCHITECTURE.md` + `specs/sprint-0/`.
   - Welche Teilschritte (S0.1–S0.4) sind abgeschlossen? Welcher ist nächster?
   - Sind die Entscheidungen in `specs/sprint-0/OPEN_DECISIONS.md` beantwortet?
5. **Produkt-Ebene:** Offene Tasks aus `SESSION_RESUME.md`. Derzeit:
   - Task 2 wartet auf Browser-Freigabe (v2.6.0)
6. Frage: „Soll ich (a) auf Task-2-Freigabe warten, (b) die Sprint-0-Entscheidungen
   einholen, oder (c) einen anderen Sprint-Task beginnen?"

**Keine Code-Änderung, bevor Dr. Stracke freigibt.**
**Keine Spec ohne Lösungsdesign. Keine Umsetzung ohne Spec.**

---

## Schritt 6 — Während der Arbeit

- Jede sichtbare Änderung → Screenshot (`tools/verify.sh --screenshots`).
- Jede CSS-Änderung an harten Werten (Padding, Margin, Position) →
  Computed-Style-Probe (`tools/verify.sh --probe`).
- Jede Iteration wird in `screenshots/claude/YYYY-MM-DD_vX.Y.Z_*.png` abgelegt.
- Bei neuem Fehler: sofort in `_rules/FEHLERPROTOKOLL.md` eintragen und
  `PRE_FLIGHT_CHECKLIST.md` ergänzen.

---

## Schritt 7 — Session-Abschluss

- `PXZ_VERSION` in `functions.php` hochzählen.
- `SESSION_RESUME.md` aktualisieren (Version, Was-wurde-erledigt, Nächste-Schritte).
- Gesamt-`tools/verify.sh` muss OK sein, bevor „fertig" gemeldet wird (LL-021).
- Dr. Stracke Zusammenfassung mit Vorher-/Nachher-Screenshot.

---

## Was NIE passieren darf

- Status „fertig", ohne dass `tools/verify.sh` grün ist.
- CSS-Änderung an zwei Stellen (PXZ-E-001).
- Annahme über Design-Intent ohne Referenz-Bild (PXZ-E-003).
- Screenshot ohne begleitende Computed-Style-Probe (PXZ-E-004).
