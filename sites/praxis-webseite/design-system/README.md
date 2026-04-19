# Design-System-Backstop — Cortex Design System v1.0

## Zweck

Dieses Verzeichnis enthält eine **git-trackbare Kopie** des Cortex Design
System v1.0 als **Entscheidungs-Backstop** für die Praxis-Webseite.

Die Primär-Regel für Design-Entscheidungen ist `../DESIGN_GUIDELINES.md` v3.0
(siehe §0). Wenn dort eine Frage **nicht** geregelt ist, wird Cortex-DS
herangezogen — als neutraler, konsistenter Default.

## Datei

- `Cortex-Design-System.html` — Claude-Artifact, React-Bundle (~2 MB)
  - Entpackt via `python3 + gzip + base64` → `.tsx` Source verfügbar
  - Views: Foundations · Components (40+) · Patterns (7) · Playground
  - Primärquellen-Namensraum: `--c-*` (NICHT `--pxz-*`)

## Öffnen

Die Datei ist ein eigenständiges HTML-Bundle. Browser-seitig:
```bash
open design-system/Cortex-Design-System.html
```
Dann erscheint das Design-System als interaktive Web-App.

## Wichtig

- **Dies ist NICHT der Stack der Praxis-Webseite.**
- Praxis nutzt Apple HIG + SF Pro (siehe `../DESIGN_GUIDELINES.md` §1).
- Cortex-DS wird **nur als Backstop** konsultiert, wenn die Praxis-Regeln
  eine Lücke zeigen. Jede solche Anwendung wird sofort in
  `../DESIGN_GUIDELINES.md` als §-Ergänzung verankert (siehe v3.0 §0).

## Herkunft

- **Original:**
  `~/Library/CloudStorage/GoogleDrive-team@sanexio.de/Meine Ablage/Cortex-Design-System.html`
- **Version:** V1.0 (SVG-Wordmark)
- **Kopiert am:** 2026-04-19 (Sprint 2 / S2.0c)
- **Integrity:** MD5-Hash gleich zum Original (siehe Commit-Diff)
