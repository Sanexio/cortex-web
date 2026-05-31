# WORKING_MODE — Cortex-Web

> **Architekten-Modus** gilt. Quelle:
> `${CORTEX_TENANT_DIR}/sites/praxis-webseite/_rules/WORKING_MODE.md`
> (im Tenant-Repo `Sanexio/sanexio-tenant`; vor Welle 1.3 am 2026-05-26:
> `Cortex-Web/sites/praxis-webseite/`; vor Phase-4-Subsumierung am
> 2026-04-19: `projects/praxis-redesign/_rules/WORKING_MODE.md`).
>
> Um Drift zu vermeiden, wird der Modus nicht dupliziert, sondern referenziert.
> Bei Änderungen am Architekten-Modus: Quelle bearbeiten, hier nur Verweis pflegen.

## Geltungsbereich

Der Architekten-Modus gilt für JEDE Cortex-Web-Session, unabhängig von Phase:

- Phasen 0–5 (Aufbau Cortex-Web selbst)
- Post-Phase-5: laufender Content-/Design-Betrieb
- Alle Adapter-Arbeiten

## Referenzdokument

**→ `${CORTEX_TENANT_DIR}/sites/praxis-webseite/_rules/WORKING_MODE.md`**

(Konkret z.B. `~/Cortex/projects/Sanexio-Tenant/sites/praxis-webseite/_rules/WORKING_MODE.md`,
wenn der Tenant lokal unter `~/Cortex/projects/Sanexio-Tenant/` ausgecheckt ist.)

Enthält:
- Rollen (Tenant-Operator = Projektleiter, Claude = Architekt)
- 4-Phasen-Prozess (Verständnis → Lösungsdesign → Umsetzung → Selbstprüfung)
- Fehlerklassen FK-1 bis FK-5
- Verbotene Muster
- Verhalten bei Unsicherheit

## Cortex-Web-spezifische Ergänzungen

### Adapter-Bugs

- Ein Adapter-Fehler darf NIE zu einem kaputten Deploy führen
- Pre-Flight (`tools/verify.sh`) ist VOR jedem Sync pflichtig, sobald implementiert
- Bei unerwartetem Ergebnis: Rollback via `git revert`, Selbstprüfung nach FK-2/FK-3

### Plattform-Trennung

- CW-005 (Plattform-Trennung) ist eine HARTE Regel
- Bei Unsicherheit, ob ein Inhalt auf einer Praxis-Site HWG-konform ist:
  **Rückfrage an den Tenant-Operator** (Phase 1, Verständnis-Sicherung)
- Niemals eigenmächtig „vermutete" Preise oder Kauf-CTAs auf Praxis-Site rendern

## Zukünftige Promotion

Wenn Cortex-Web und praxis-redesign langfristig dieselben Working-Mode-Regeln teilen
(wahrscheinlich), wird die Datei nach `Nexus/_rules/WORKING_MODE.md` promotet und
dann von beiden Projekten referenziert. Dieser Schritt ist für Phase 4 Kandidat.
