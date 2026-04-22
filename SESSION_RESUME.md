# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg** (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):
> In einer neuen Session **„Projekt fortsetzen Cortex-Web"** tippen. Claude lädt:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/validate.sh`, optional `CHECK_SHOPIFY=1`, optional `tools/review.sh`)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Front

---

## §0 EINSTIEG „Projekt fortsetzen Cortex-Web" — Pflicht-Lesung

### Basis (immer)
1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md`
5. `~/Cortex/projects/Cortex-Web/CLAUDE.md`
6. Diese Datei (`SESSION_RESUME.md`)
7. `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md`
8. `~/Cortex/projects/Cortex-Web/_config/RULES.md`
9. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/WORKING_MODE.md` (Architekten-Modus)

### Wenn Praxis-Sprint-Arbeit ansteht (S2.1+)
10. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/SESSION_RESUME.md` — Praxis-Sprint-Stand (lädt selbst weitere Pflicht-Dateien)
11. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/ARCHITECTURE.md` — Sprint 2 Plan
12. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/FEHLERPROTOKOLL.md` — PXZ-E-001…008
13. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/DESIGN_GUIDELINES.md` — v2.3, §13–§16

### Wenn Juvantis-Web-Arbeit ansteht
14. `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/SESSION_RESUME.md` — Juvantis-Site-Stand
15. `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/SHOPIFY_THEME_POINTER.md` — Theme-Topologie
16. `~/Cortex/projects/Juvantis/_config/RULES.md` — Shopify-Deploy-Regeln R-001…R-024

---

## §1 Stand & Version

- **Version:** `0.7.1` — Sanitizer V4 Retroaktiv-Kur ✅ (Session 23, 2026-04-22)
- **Stand:** 2026-04-22, Cortex-Web-Aufbau (Phase 0–5) ✅ + Content-Bridge + Cross-Site-Transfer-Architektur ✅ + Praxis-Sprint 2 → 6/7 Cluster migriert
- **Jüngste Commits:**
  - Cortex-Web: `987e3e4` (content-bridge-v1 Block 1) + `98e063b` (cross-site-transfer Block 2) + Sanitizer-Commit folgt
  - Theme (praxis-webseite): `25662ad` (PXZ_VERSION **2.7.18**)
  - Nexus: Sanitizer-Commit folgt (MEMORY + CLAUDE verdichtet, Tool, LL-044, SESSION_LIFECYCLE §2 Schritt 3b)
- **Working Tree:** Cortex-Web nach Sanitizer-Apply clean, Nexus nach Sanitizer-Apply clean

### §1.1 Phasen-Status

| Phase | Ziel | Status |
|:---:|------|:---:|
| 0 | Skelett + Regeln + Nexus | ✅ |
| 1 | POC WP-Adapter | ✅ |
| 2 (Setup+Adapter) | Shopify Custom App + POC-Adapter | ✅ |
| 3 | Review-Pipeline + Go/No-Go | ✅ |
| 4 | Subsumierung praxis-redesign → `sites/praxis-webseite/` | ✅ |
| 5 | Subsumierung Juvantis-Web-Docs → `sites/juvantis-webseite/` | ✅ |
| **Praxis S2.3-B…S2.3-kern…checkups…S2.4…aerzte-services…diagnostik** | **6 Content-Cluster + Menü + Bridge Praxis↔Juvantis** | **✅ Session 14→21** |
| **Cortex-Web content-bridge-v1** | **Shopify-Page/Template-Adapter + Trunk `ueber-uns`** | **✅ Session 22** |
| **Cortex-Web cross-site-transfer** | **Architektur + 6 Patterns + 4 Registries + cw-transfer CLI + CW-006/007/008** | **✅ Session 22** |
| **Sanitizer V4 Retroaktiv-Kur** | **SESSION_RESUME + MEMORY + Nexus/CLAUDE verdichtet, 12 Sessions archiviert, Tool + LL-044 + SESSION_LIFECYCLE §2 Schritt 3b** | **✅ Session 23** |

**Status:** Cortex-Web-Aufbau abgeschlossen. Common-Trunk-Bridge funktional bewiesen. Menü-Infrastruktur steht. 6 von 7 Haupt-Clustern migriert (kern, checkups, aerzte, services, diagnostik ✅). Verbleibend: `legacy/de` (23 P2, größtenteils archivierbar). Design-Feintuning noch offen.

---

## §2 Pre-Flight-Befehle

### Standard
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```
Erwartet: `validate: OK (1 file(s))`, Exit 0.

### Mit Shopify-Connectivity-Check
```bash
cd ~/Cortex/projects/Cortex-Web && CHECK_SHOPIFY=1 bash tools/validate.sh
```

### Praxis-Site Pre-Flight (für Sprint-2-Arbeit)
```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite && bash tools/verify.sh
```

### Juvantis-Site Pre-Flight (für Theme-/Content-Arbeit)
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://sanexio.eu/
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme rev-parse HEAD
```

### Vollreview (langsam, Regressions-Schutz)
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/review.sh
```

### Sanitizer-Probe (NEU seit Session 23)
```bash
bash ~/Cortex/Nexus/tools/cortex-sanitizer/rotate.sh --probe
```
Erwartet: Alle gepflegten Dateien unter Token-Budget (LL-044). Siehe `Nexus/tools/cortex-sanitizer/README.md`.

---

## §3 Letzte Praxis-Session — Session 21, 2026-04-22 (Praxis-Sprint 2 / S2.3-diagnostik)

### Ziel
Cluster `diagnostik` live bringen. Eigener Top-Nav-Bereich `Diagnostik ▼`. Hub `/diagnostik/` + Sub-Hub `/sonographie/` mit 3 Nested-Kindern + 3 flache Detail-Pages. Labor-Konsolidierung. 301-Redirects. atlas DSGVO-gated.

### Kernergebnisse
- 8 neue URLs (7 publish + 1 draft atlas), 4 alte Slugs → 301, 3 URLs → 404 wie erwartet
- `inc/diagnostik-data.php` als SSoT (4 Helper)
- `template-diagnostik-hub.php` (Dual-Mode: Top-Hub + Sub-Hub)
- `inc/seo-data.php` +8 Funktionen (MedicalProcedure, DiagnosticProcedure, MedicalTest, MedicalWebPage, ImageGallery)
- `inc/nav-data.php` neues Top-Item `Diagnostik ▼` + `match_prefix`-Feld für Nested-Active-State
- `pxz_old_slug_fallback_redirect()` weil WP-Core-Redirect für Pages unzuverlässig ist

### Verifiziert
- Migration idempotent (Lauf 2 = 0 Mutationen)
- HTML-Assertions: 4 Card-Grids, 5 H2 Labor, Mojibake 0×, Active-State auf allen Diagnostik-URIs
- verify.sh §1+§3 grün (Full-Run hatte unrelated Puppeteer-Chrome-Hang, nicht blockierend)
- 12/12 AK = 100 %

### Commits
- Theme: `25662ad` (PXZ_VERSION 2.7.18)
- Cortex-Web: `fb9c0eb` (Spec+Migration+Evidence+Self-Check) + `133d7f1` (SESSION_RESUME)
- Nexus: `71d6358` (MEMORY-Update)

### 5 Pattern-Kandidaten → Nexus
`wp-old-slug-redirect-reliability` · `wp-nested-pages-rewrite-flush` · `nav-match-prefix-active-state` · `dsgvo-draft-gate-pattern` · `php-getenv-normalization`

### Tutorial
`Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/22-wp-nested-pages-und-old-slug-redirects.md`

---

## §3b Parallele Cortex-Web-Session — Session 22, 2026-04-22 (content-bridge-v1 + cross-site-transfer)

- **Commits:** `987e3e4` (Block 1) + `98e063b` (Block 2)
- **Live:** `sanexio.eu/pages/uber-uns` (Shopify Page ID 157742137611) aus Trunk gerendert via Template-Bridge (Pattern B, Goldstandard)
- **Architektur:** 6 Patterns A–F (Simple Page · Template-Based Page · Metafield · Theme-Asset-Overwrite · Product-Sync · Design-Token), 4 Registries, `tools/cw-transfer` Meta-Orchestrator, CW-006/007/008 kodifiziert
- **Inhalte:** 8 Team-YAMLs + `ueber-uns.yaml` + erweiterte Schemas (page + team-member)
- **Kanonische Doku:** `specs/content-bridge-v1/SELF_CHECK.md` + `specs/cross-site-transfer/ARCHITECTURE.md` + `PATTERNS.md` + `docs/cross-site-transfer.md`
- **Voller Session-Log:** `_archive/sessions/2026-04/session-22-content-bridge-v1.md`

---

## §3c Aktuelle Session — Session 23, 2026-04-22 (Cortex-Sanitizer V4 Retroaktiv-Kur)

- **Anlass:** SESSION_RESUME.md 123 KB + MEMORY.md 53 KB + Nexus/CLAUDE.md 41 KB → Pflicht-Init sprengt Read-Limit
- **Spec:** `specs/cortex-sanitizer/SPEC.md` (10 Abschnitte, 12 AK, Retention-1)
- **Retroaktiv umgesetzt:**
  - 12 Legacy-Session-Blöcke (7, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 22) nach `_archive/sessions/2026-04/` extrahiert
  - SESSION_RESUME.md neu geschrieben (§0–§6 behalten, §3b/§3c kompakt, §7 Archiv-Index, Duplikat-§4 entfernt)
  - MEMORY.md Aktive-Projekte-Zellen auf 3-Zeilen-Index verdichtet
  - Nexus/CLAUDE.md Cortex-Web-Abschnitt komprimiert, Sprint-Logs → `Nexus/_archive/claude-md/2026-04.md`
- **Neu:**
  - `Nexus/tools/cortex-sanitizer/rotate.sh` (Bash, idempotent, dry-run-fähig)
  - `Nexus/_rules/GLOBAL_RULES.md` §21 LL-044 Token-Budgets
  - `Nexus/_rules/SESSION_LIFECYCLE.md` §2 Schritt 3b Sanitizer-Probe
- **Ziel-Metrik (AK-11):** Pflicht-Init unter 50 k Tokens (vorher ~120 k)
- **Voller Session-Log:** wird bei Session-Ende angelegt

---

## §4 Offene Tasks (Priorität absteigend)

### Wählbare Fronten für Session 24

**Praxis-Sprint (nahe am nächsten DE-Meilenstein):**

| Prio | Front | Aufwand | Kommentar |
|:---:|---|---|---|
| **A** | **S2.4b Footer-Umbau** | 1 Session | Blocksy-Default ersetzen. Kann Notfall-Block + `/leistungen/` + `/diagnostik/` integrieren. |
| **B** | **Design-Feintuning S2.4 + S2.3-aerzte-services + S2.3-diagnostik** | 1 Session, Spec-lastig | Dr.-Stracke-Wunsch seit S19. Hover-Polish, Mobile-Drawer-Animation, Card-Spacing, Diagnostik-Hub-Typo. |
| **C** | **Cluster `legacy/de`** (23 P2) | mittel–groß | Letzter DE-Content-Block vor Sprint 3. Großteil wahrscheinlich archivierbar. |
| **D** | **Echt-Content + Fotos für 7 Stub-Arzt-Profile** | groß | Braucht Bio-Text-Input + Foto-Shooting. Extern-abhängig. |
| **E** | **Cross-Links `/leistungen/` + `/diagnostik/` aus `/praxis/` integrieren** | ½ Session | Folge aus S20 + S21. |
| **F** | **Strukturhygiene + Patterns konsolidieren** | klein | Pattern-Index, Tutorial-Querverweise. |
| **G** | **Beginn Sprint 3 i18n** | 6+ Sessions | Erst nach C sinnvoll. |

**Cortex-Web-Fronten (aus Session 22):**

| Prio | Front | Aufwand | Kommentar |
|:---:|---|---|---|
| **N-1** | **WP-Template-Adapter (Pattern B reverse)** | 1–2 Sessions | Dasselbe YAML für WP `/team/`. |
| **N-2** | **Extraktoren produktivieren** | 1–2 Sessions | Site→Trunk halbautomatisch. |
| **N-3** | **Design-Token-Adapter (Phase D)** | 2 Sessions | Farben/Typo/Spacing aus Trunk. **Blocker:** Master-Frage (Praxis/Sanexio/Neutral). |
| **N-4** | **Component-Specs (Phase F)** | 3+ Sessions | `team-grid` reusable. |
| **N-5** | **Shopify-Publish-Helper** | 30 Min | `--publish`-Flag. |
| **N-6** | **`cw-transfer diff`** | 1 Session | Build-then-fetch-then-JSON-diff. |
| **N-7** | **Backup-Automatik auf Page-Adapter** | 30 Min | CW-008 vollständig. |

### Blockiert (nicht wählbar)

| Front | Blocker |
|---|---|
| S2.3-A (Datenschutz/Impressum) | Fehlende Rechtsquelle |
| R-7 sono-atlas Klärung | DSGVO-Entscheidung Dr. Stracke |

### P1-Punkte aus Vorgänger-Sessions (offen)

- Santapress-Archive-Entscheidung fällig ab 2026-05-19
- WPForms-Marker (S2.3-kern)
- Google My Map mit POIs (S2.3-kern)
- „Aktuelles aus der Praxis"-Inhalt (S2.3-kern Setting leer)

---

## §5 Sofort-Status-Frage an Dr. Stracke

> **Session 23 abgeschlossen:** Cortex-Sanitizer V4 Retroaktiv-Kur. SESSION_RESUME 123 KB → ~15 KB, MEMORY 53 KB → ~15 KB, Nexus/CLAUDE 41 KB → ~20 KB. 12 Sessions archiviert, Tool `rotate.sh` live, LL-044 Token-Budgets in Kraft, Sanitizer-Probe in Session-Ende-Ritual verankert.
>
> **R-7 sono-atlas** bleibt offen (DSGVO-Entscheidung).
>
> **Welche Front für Session 24?**
>
> - **A** — S2.4b Footer-Umbau
> - **B** — Design-Feintuning (dein Wunsch seit S19)
> - **C** — Cluster `legacy/de` (letzter DE-Content-Block)
> - **E** — `/leistungen/` + `/diagnostik/` Cross-Links aus `/praxis/`
> - **G** — Beginn Sprint 3 i18n (DE→EN/FR/ES)
> - **N-1** — WP-Template-Adapter (Pattern B reverse)
> - **N-5/N-7** — Shopify-Publish-Helper / Backup-Automatik (je 30 Min, gut als Warmup)
> - **Ad-hoc:** „Heute möchte ich X von A nach B übertragen."

---

## §6 Verbote / harte Regeln (in Session 24 NIE passieren darf)

- **HWG/Berufsordnung:** Keine Werbung, keine Heilversprechen, keine Preise auf Praxis-Site (CW-005)
- **Trunk ist Master (CW-001):** Bei Bridge-Pages keine Inhalte direkt im WP-Admin oder Shopify-Admin ändern
- **Gerichteter, expliziter Transfer (CW-006):** Kein Auto-Sync, kein Webhook-Live-Mirror
- **Trunk alleinige Brücke (CW-007):** Keine direkten Shopify→WP-/WP→Shopify-Extractoren. Immer Site→Trunk→Site
- **Backup vor destruktivem Push (CW-008):** Kein Overwrite ohne vorheriges Backup in `adapters/*/.backups/`
- **Mojibake-Disziplin:** Bei Content-Migration IMMER Mojibake-Check
- **Brand-Switch-Konsistenz:** Neue Doctor-Slugs IMMER in `pxz_doctor_slugs()` registrieren
- **`grep -c` ist tückisch:** WP-HTML auf einer Zeile → IMMER `grep -oE … | wc -l` für Counts
- **WP-Filter-Hooks-Lade-Reihenfolge:** Helper vor Filter-Registrierung laden
- **Keine eigenmächtigen Strukturänderungen** in Nexus oder Cortex-Web ohne Dr.-Stracke-Freigabe (LL-023, KON-001)
- **Token-Budgets einhalten (LL-044):** SESSION_RESUME ≤ 15 k · MEMORY ≤ 10 k · Nexus/CLAUDE ≤ 12 k. Sanitizer-Probe bei Session-Ende pflichtig.

---

## §7 Archivierte Sessions — Index

Alle historischen Session-Logs sind git-tracked unter `_archive/sessions/YYYY-MM/`.

| Session | Datum | Thema | Archiv-Pfad |
|:---:|---|---|---|
| 22 | 2026-04-22 | Cortex-Web content-bridge-v1 + cross-site-transfer | `_archive/sessions/2026-04/session-22-content-bridge-v1.md` |
| 20 | 2026-04-22 | Praxis S2.3-aerzte-services (8 Arzt-Pages + Services-Hub) | `_archive/sessions/2026-04/session-20-s2.3-aerzte-services.md` |
| 19 | 2026-04-22 | Praxis S2.4 Menü-Restrukturierung | `_archive/sessions/2026-04/session-19-s2.4-menue.md` |
| 16 | 2026-04-20 | Praxis S2.3-D Phase 2 Content-Archive | `_archive/sessions/2026-04/session-16-s2.3-d-content-archive.md` |
| 15 | 2026-04-20 | Praxis S2.3-D Phase 1 Mojibake | `_archive/sessions/2026-04/session-15-s2.3-d-mojibake.md` |
| 14 | 2026-04-19 | Praxis S2.3-B (3 P0-Pages + SEO + Brand-Switch) | `_archive/sessions/2026-04/session-14-s2.3-b-3p0-pages.md` |
| 13 | 2026-04-19 | Praxis S2.0f Santapress-Entfernung | `_archive/sessions/2026-04/session-13-s2.0f-santapress.md` |
| 12 | 2026-04-19 | Praxis S2.0e Verify-Hardening | `_archive/sessions/2026-04/session-12-s2.0e-verify-hardening.md` |
| 11 | 2026-04-19 | Praxis S2.0b Component-Library | `_archive/sessions/2026-04/session-11-s2.0b-components.md` |
| 10 | 2026-04-19 | Praxis S2.2 Template-Typologie | `_archive/sessions/2026-04/session-10-s2.2-templates.md` |
| 9 | 2026-04-19 | Praxis S2.1 Page-Inventory | `_archive/sessions/2026-04/session-09-s2.1-page-inventory.md` |
| 7 | 2026-04-19 | Phase 5 Juvantis-Web-Subsumption | `_archive/sessions/2026-04/session-07-phase5-juvantis-subsumption.md` |

**Sessions 17, 18, 21** sind inhaltlich in §3 (Session 21) und `MEMORY.md`-Aktive-Projekte-Zelle enthalten + im Nexus-Sprint-Log; separates Archive nicht notwendig.

**Vor-Session-7-Historie** (Phasen 0–5 Aufbau + Praxis S2.0 / S2.0c / S2.1): siehe `Nexus/_archive/claude-md/2026-04.md` und Git-Log (`git log --oneline`).
