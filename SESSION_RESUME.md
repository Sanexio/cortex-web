# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg „Projekt fortsetzen Cortex-Web"** (Lean v3, 2026-05-13).
> Pflicht-Init: `Nexus/CLAUDE.md` + `Nexus/_rules/AUTONOMY_CONTRACT.md`.
> Plus diese Datei + `_rules/ARCHITECTURE.md` + `sites/praxis-webseite/_rules/WORKING_MODE.md`.
> Pre-Flight: `bash tools/validate.sh`.
> Vor Schreibarbeit: Lease via Connexio `lease_project("Sanexio/cortex-web", "<scope>", ...)`.

## §1 Stand (HOT)

- **Cortex-Web-HEAD:** `bd506ff` (2026-05-12, Codex Phoenix-Drift-Cleanup CLAUDE.md + dieser SESSION_RESUME alt).
- **Praxis-Theme PXZ:** `2.7.179` Tag `live-de-2026-05-08-01` (Rollback-Anker), Live-Push auf `.de` lief in separater Praxis-Mac-Session.
- **Repo-Workflow:** Modell A (Local = Master), `tools/sync-local-to-de.sh` mit Pre-Push-Guard.
- **Aktive Phase:** Praxis-Polish-Arc (S55+ ff.), DE-Content-Vervollständigung (P3a) + Doctolib-Mapping + Page-Review.

Detail aller Sessions S31–S55 liegt im Cold-Archive (siehe §5).

## §2 Pre-Flight

```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
cd sites/praxis-webseite && bash tools/verify.sh   # Praxis-spezifisch
```

## §3 Holistische Prio-Leiter (CW-PRIO-001, kompakt)

| Prio | Block | Status |
|:---:|---|:---:|
| P1 | Medien-Pipeline (8 Fotos) | 🟢 2/8 live, Rest extern |
| P2 | Prod-Deployment-Pipelines | 🟢 .de live, .com pending C-1 |
| P3 | DE-Content + Menü + SEO | 🟡 P3a aktiv |
| P4 | M1 Prod-Push .com | 🔴 nach P3a + L-1/L-2 + C-1 |
| P5 | Juvantis Content-Alltag | 🔴 nach M1 |
| P6 | i18n EN/FR/ES | 🔴 nach P5 |
| Ppol-rest | A11y / Mobile / Polish | 🔴 nach P4 |
| Popt/Pios | iOS / Pattern C / Media-Registry | ⏸ |

Externe Blocker: L-1/L-2 (Anwalt — Impressum/Datenschutz), C-1 (DF-Support für SFTP-`.com`).

## §4 Top-3-Open-Tasks (HOT)

1. **CR-1..5 Page-Review** (25 Sanexio-Detail-Pages): Sie-Form, HWG, Bilder. Iterativ pro Page.
2. **Doctolib-Mapping** (Phase 3d): pro Page `views.praxis.doctolib_url` setzen.
3. **eye-check + labor-biohack** Stub schließen (Praxis-eigenes Bild + Text).

## §5 Cold-Archive (verlinkte Detail-Historie)

- S31–S55 Praxis-Polish-Arc, holistische Prio-Tabelle Vollversion, alle Sprint-Boxen,
  Fronten-Liste, Hygiene-Checkliste:
  [`_archive/sessions/2026-05/sessions-S31-S55-praxis-polish-arc-pre-lean-v3.md`](_archive/sessions/2026-05/sessions-S31-S55-praxis-polish-arc-pre-lean-v3.md)
- Sessions 7–46 (S2.x + MVP + Polish-Arc): `_archive/sessions/2026-04/`
- S65–S67 i18n-Welle: `_archive/sessions/2026-05/sessions-65-67-praxisgemeinschaft-i18n-welle.md`

## §6 Harte Verbote

- HWG / Berufsordnung: keine Werbung, keine Heilversprechen, keine Preise.
- CW-001 Trunk ist Master: keine Inhalte direkt im WP-Admin / Shopify-Admin.
- CW-006 expliziter Transfer: kein Auto-Sync, kein Webhook-Mirror.
- CW-008 Backup vor destruktivem Push.
- Theme-Render-Source vor DB-Schreiben verifizieren (`inc/*-data.php` ist Master für nav/footer/practice/team/homepage, NICHT WP-Admin).
- Type-Scale-Pflicht (T1–T8) bei Font-Änderungen.
- Holistische Prio (CW-PRIO-001): P1–P5 dominieren; Popt/Pios nur bei echtem Pain-Point.

---

*HOT-File ≤80 LOC nach Lean-v3-Welle L2 Paket B (Claude 2026-05-13).*
*Vorgängerversion 431 LOC ist im Cold-Archive verlinkt in §5.*
