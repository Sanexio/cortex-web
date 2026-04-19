# Sprint 0 — Offene Entscheidungen (blockierend)

**Status:** wartet auf Dr. Stracke. Ohne Antworten starte ich Sprint 0 nicht.
**Freigegeben:** Reihenfolge Sprint 0 → 1 → 2 → 3 → 4 (am 2026-04-18)
**Offen:** (b), (c), (d)

---

## (b) Git-Remote?

Wohin soll das Theme-Repository angebunden werden?

| Option | Vorteil | Nachteil |
|--------|---------|----------|
| 1. Nur lokal | sofort einsatzfähig, keine Credentials | kein Off-Device-Backup, kein Pair-Work |
| 2. GitHub privat | Backup, PR-Review, Issues | Credentials pflegen, ggf. Kosten bei Co-Entwicklung |
| 3. Bare-Repo im Cortex-Nexus (Git-Sync über Geräte) | integriert in bestehenden Sync | Nexus wächst, Binary-Handling |
| 4. Delegation: Claude wählt | keine Zeit verloren | ohne Ihre Entscheidung wähle ich Option 1 |

## (c) Was wird Git-Repo?

| Option | Konsequenz |
|--------|------------|
| 1. Nur `praxiszentrum/` (Theme) | Prozess-Docs bleiben ungetrennt ad hoc — einfach, klar |
| 2. Auch `praxis-redesign/` — zwei Repos | Code und Docs sauber getrennt, zwei `git log` |
| 3. Nur `praxis-redesign/`, Theme als Submodule | Ein Einstiegspunkt, aber Submodule-Komplexität |

## (d) Deadline 48 h

SESSION_RESUME nennt „Go-Live innerhalb 48 h" (ursprünglich ab Session-Start).

| Option | Sprint-0-Scope |
|--------|----------------|
| 1. Deadline halten | Sprint 0 minimal: nur S0.1 (Git) + S0.4 (Registry). S0.2 (CSS-Extraktion) und S0.3 (Token-SSoT) ins Backlog. |
| 2. Deadline auflösen | Sprint 0 vollständig S0.1–S0.4. Go-Live-Datum neu setzen. |
| 3. Hybrid | Sprint 0 komplett, aber Sprint-1/2-Infrastruktur parallel vorbereiten — kostet zusätzliche Koordination. |

---

## Format der Antwort

Beispiel:
```
(b) = 2
(c) = 1
(d) = 2
```

Danach starte ich Sprint 0 mit S0.1 gemäß `specs/sprint-0/README.md`.
