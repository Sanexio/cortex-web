# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg** seit 2026-04-18 (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):
> Tippen Sie in einer neuen Claude-Code-Session **„Projekt fortsetzen Cortex-Web"**.
> Claude lädt automatisch:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (sobald implementiert; Phase 0: entfällt)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Phase/Front

---

## §0 EINSTIEG „Projekt fortsetzen Cortex-Web" — Pflicht-Lesung

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md`
5. `~/Cortex/projects/Cortex-Web/CLAUDE.md`
6. Diese Datei (`SESSION_RESUME.md`)
7. `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md` (Phasen-Roadmap + Status)
8. `~/Cortex/projects/Cortex-Web/_config/RULES.md` (CW-001…005)
9. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (Architekten-Modus)
10. Phasen-spezifisch (siehe §5 unten)

---

## §1 Stand & Version

- **Version:** 0.1.0 (Phase 0 abgeschlossen)
- **Stand:** 2026-04-18, Session 1 abgeschlossen
- **Git-Commit:** *(wird nach Initial-Commit eingetragen)*
- **Skelett:** vollständig (Ordnerstruktur, Regeln, Schemas-Gerüste, Adapter-READMEs)
- **Nexus-Integration:** MEMORY.md, CLAUDE.md, devices.json aktualisiert
- **Adapter:** NICHT implementiert (kommen in Phase 1/2)
- **Trunk-Content:** leer (kein Produkt, keine Page, keine Medien bisher)

---

## §2 Pre-Flight-Befehl

**Phase 0:** *(keiner — Adapter existieren noch nicht)*

**Ab Phase 1:**
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```

---

## §3 Letzte Session — Phase 0, 2026-04-18

### Durchgeführt
1. Entscheidungs-Trilogie abgeschlossen:
   - `projects/praxis-redesign/specs/bridge-strategy/00_BRAINSTORMING_KONZEPT.md`
   - `projects/praxis-redesign/specs/bridge-strategy/01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md`
   - `projects/praxis-redesign/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md`
2. Name: **Cortex-Web**. Struktur: S-A. Medien: M-3c (Shopify Files) + lokales Backup. I18n: I-2 hybrid. Trunk: Maximal.
3. `projects/Cortex-Web/` Ordnerstruktur komplett
4. Kern-Dateien: PROJECT, CLAUDE, README, CHANGELOG, .gitignore, package.json
5. `_config/`: RULES.md (CW-001…005), FEHLERPROTOKOLL.md, WORKFLOW_CHECKLIST.md
6. `_rules/`: WORKING_MODE.md (Verweis auf praxis-redesign), ARCHITECTURE.md, PRE_FLIGHT_CHECKLIST.md, FEHLERPROTOKOLL.md
7. `trunk/schema/`: 5 Schema-Gerüste (product, page, team-member, component, media)
8. `trunk/media/registry.yaml`: leerer Platzhalter
9. `adapters/{wordpress,shopify,ios}/README.md`: Platzhalter
10. `tools/README.md`: Platzhalter
11. `.gitkeep`-Platzhalter in leeren Ordnern (damit Git sie verfolgt)
12. Nexus-Updates:
    - `Nexus/_memory/MEMORY.md` — Cortex-Web als aktives Projekt ergänzt
    - `Nexus/CLAUDE.md` — Abschnitt Cortex-Web hinzugefügt
    - `Nexus/.config/devices.json` — Cortex-Web unter Cluster-Mini-02
13. `projects/praxis-redesign/_rules/ARCHITECTURE.md` — Sprint T0–T5 + Parallelität dokumentiert
14. `projects/Juvantis/PROJECT.md` — Vermerk über spätere Subsumierung
15. Git-Repo initialisiert + Initial-Commit

### Verifiziert
- Ordnerstruktur vollständig: ✅
- Nexus-Updates: ✅
- Git init + commit: ✅ (siehe §1)

---

## §4 Offene Tasks (Priorität absteigend) — Phase 1 startet mit Session 2

1. **Phase 1 — POC WordPress-Adapter** (nächste Session)
   - `trunk/schema/product.schema.json` konkretisieren (Beispiel aus `02_ENTSCHEIDUNGEN_FINAL.md`)
   - 1 Beispielprodukt `trunk/content/products/bluttests/basic-check.yaml` schreiben
   - `adapters/wordpress/build.mjs` Minimal-Implementation
   - `adapters/wordpress/content-to-wp-pages.mjs` (WP-CLI-basiert)
   - `tools/validate.sh` Minimal-Implementation (AJV)
   - `tools/sync-wp.sh` Minimal-Implementation
   - Test: Produkt erscheint auf Local-WP als neue Page, HWG-konform (ohne Preis)

2. Parallel: Sprint 2 praxis-redesign läuft WEITER (S2.1 Seiten-Inventar)
3. Parallel: Juvantis-Entwicklung läuft WEITER

---

## §5 Phasen-spezifische Pflicht-Lesung

### Für Phase 1 (POC WP-Adapter)
- `projects/praxis-redesign/_rules/ARCHITECTURE.md` (Theme-Strukturen, PXZ_VERSION)
- `projects/praxis-redesign/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md` §3.1 (Beispiel-Schema)
- `/Users/cluster-mini-02/Local Sites/.../app/public/wp-content/themes/praxiszentrum/` (Target-Theme)

### Für Phase 2 (POC Shopify-Adapter)
- `projects/Juvantis/CLAUDE.md` (Shopify-Regeln, Theme-ID)
- `projects/Juvantis/juvantis-web/theme/` (Target-Theme)
- `projects/Juvantis/_config/RULES.md` (R-001…R-018)

### Für Phase 3 (Review)
- Outputs aus Phase 1 + 2
- Verify-Screenshots

### Für Phase 4 (Praxis-Subsumierung)
- `projects/praxis-redesign/SESSION_RESUME.md` (aktueller Sprint-Stand)
- **WICHTIG:** Phase 4 setzt Go von Dr. Stracke voraus (`git mv`-Operation ist invasiv)

### Für Phase 5 (Juvantis-Web-Subsumierung)
- `projects/Juvantis/juvantis-web/` (Theme-Git-Status)
- **WICHTIG:** ebenfalls Go erforderlich

---

## §6 Sofort-Status-Frage für nächste Session

> **„Cortex-Web Phase 0 abgeschlossen. Soll ich Phase 1 (POC WP-Adapter) starten?
> Das bedeutet: product.schema konkretisieren, 1 Beispielprodukt schreiben,
> Minimal-Adapter bauen, gegen Local-WP testen. Keine Änderung am aktiven
> praxis-redesign-Theme. Freigabe?"**

---

## §7 Verbote / harte Regeln — dürfen NIE passieren

- **Keine Datenverschiebung** aus praxis-redesign/ oder Juvantis/juvantis-web/ in Phase 1–3
  (erst Phase 4/5, jeweils mit separatem Go)
- **Kein Push zu Prod-Shopify oder Prod-WP** während POC-Phasen
- **CW-001 Trunk-ist-Master** — keine direkten Shopify-Admin-Edits für Trunk-gepflegten Content
- **CW-005 Plattform-Trennung** — KEIN Preis, KEIN Kauf-CTA auf Praxis-Site
- **Keine Shopify-API-Credentials oder WP-Passwörter** im Repo (nicht in `.env.*.template`, nirgends)
- **Kein `--force` bei Git** außer bei explizitem Dr.-Stracke-Go

---

## §8 Session-Historie

| Session | Datum | Phase | Ergebnis |
|---------|-------|:-----:|----------|
| 1 | 2026-04-18 | 0 | Skelett + Regeln + Nexus ✅ |
| *(2)* | *tbd* | *1* | *POC WP-Adapter* |

---

*Stand: 2026-04-18, Ende Phase 0.*
