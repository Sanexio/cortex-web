# Spec — KI-Triage-Bot (LLM) (#15)

**Status:** 📋 Spec, HWG-/MBO-Bewertung erforderlich
**Blocker:** Rechts-Review + LLM-API-Key (Anthropic Claude oder OpenAI).

## Ziel
Erweiterung von `triage.php`: statt 4 vorgegebener Fragen ein freies
„Was ist Ihr Anliegen?"-Feld → LLM klassifiziert → empfiehlt Sprechstunde.

## Mechanik
1. Patient gibt Freitext ein (max. 500 Zeichen).
2. WP sendet via `Anthropic\Claude` API mit System-Prompt:
   ```
   Du bist Triage-Assistent einer Hausarzt-Praxis. Klassifiziere das Anliegen
   in eines von: notfall|akut_internal|akut_neuro|routine_internal|routine_psy|
   routine_neuro|routine_gyn|routine_uro|routine_ent|routine_physio|admin_rezept|admin_au|admin_ueberw|admin_neupat.
   Gib KEINE medizinische Beratung. Bei Notfall-Indikatoren (Brustschmerz,
   Lähmung, Atemnot, Suizidgedanken): klassifiziere als 'notfall'. JSON-Output.
   ```
3. Praxis-Backend nimmt JSON, mappt auf Service-Form.
4. UI zeigt Disclaimer + Empfehlung.

## HWG / MBO §27 (Werbung) / Patientenrechtegesetz
- **Erlaubt**: Triage-Tool, das nur sortiert, nicht berät.
- **Pflicht**: Disclaimer prominent, „kein medizinischer Rat", „im Notfall 112".
- **Verboten**: konkrete Diagnose-Vorschläge, Therapie-Empfehlung.
- **Zu klären**: Patient-Information nach §630e BGB für KI-Anwendungen.

## DSGVO
- Anfrage geht an LLM-Provider außerhalb EU (potenziell USA): Auftragsverarbeitungs-Vertrag, EU-SCC, Datenresidenz.
- Anthropic hat EU-Datenresidenz, OpenAI hat EU-Datenresidenz seit 2024.
- Empfehlung: **Anthropic Claude Haiku** mit `region=eu` (oder gar lokales Llama via Ollama auf Cluster-Mini-02 für Dev).

## Aufwand
2 Sprints + Rechts-Review (extern, ~ 1 Tag Anwalt-Zeit).

## Fallback
`triage.php` regelbasiert (heute gebaut) — funktioniert, ist HWG-safe.

## TODO
- [ ] Anwalt-Termin: ist die geplante Triage HWG-konform?
- [ ] Anthropic-Account einrichten (separate API-Org für Praxis).
- [ ] Prompt-Engineering + Eval-Set („was wäre korrekt?" — 50 Cases).
- [ ] Rate-Limit + Cost-Cap (z. B. 500 Anfragen/Tag).
