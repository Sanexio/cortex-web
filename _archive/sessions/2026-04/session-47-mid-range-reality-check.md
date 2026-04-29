# Session 47 — Mid-Range-Reality-Check (Fluid Type-Scale + Header right-sized)

> **Datum:** 2026-04-27
> **Theme-Commit:** `501f9d5` PXZ 2.7.71 (5 Files +157/-214 LoC)
> **Cortex-Web-Commit:** `86b741c` (`docs(s47): SESSION_RESUME §1 + §3 + S43-S46-catch-up + akzeptanz S47`)
> **Status bei Schreibung:** Ausgelagert in Session 51 (2026-04-28) als erste produktive Anwendung von LL-053a Sliding-Window-Auto-Archive. War bis dahin §3 in `SESSION_RESUME.md`.

<a id="s47"></a>

## Gerät

**Cluster-Mini-02** (home-Mac M2) via SSH von Mac-Studio (praxis-studio).
Dr. Stracke saß am Mac-Studio + Studio Display, Browser auf der Local-Site mit `innerWidth: 1365 px`, Claude Code per SSH am Home-Mac.

## Auftrag

Initial: „Projekt fortsetzen Cortex-Web". Während des Pre-Flight meldete Dr. Stracke einen Layout-Bruch im Header + „Body wirkt zu groß" — der ganze Sprint wurde zur S47 „Mid-Range-Reality-Check".

## Verlauf

**Phase 0 — Setup-Hürde:**
Setup-Skript für Praxis-Mac-Browser-Zugriff auf Local-Site funktionierte nicht (scp scheiterte, weil Tailscale MagicDNS auf Mac-Studio nicht aktiv). Lösung: einzeiliger /etc/hosts-Eintrag ohne das Skript. Site lief sofort.

**Phase 1 — Diagnose Header-Bug:**
Probe bei 1365 × 879 zeigte: Logo 296 px (S46-Bump) + Wortmarke 370 px + Nav-Liste 1049 px + Lang 226 px = ~2200 px Mindestbreite. Header brach auf jedem Viewport unter 2200 px. SESSION_RESUME war auf S42-Stand fixiert („7 Top-Level"), tatsächlich war Theme längst auf 5 Top-Level + PXZ 2.7.68.

**Phase 2 — Spec-Freigabe:**
Architekten-Modus: Spec mit AK-1 bis AK-5, drei Optionen für Mid-Range-Schwelle / Wortmarke / Hero-Type-Scale. Dr. Stracke wählte Option A in allen drei Punkten (1100 px / Wortmarke aus / clamp()-Hero).

**Phase 3 — Umsetzung:**
- `nav.css`: Logo 64/80/96/120 (statt 110/150/240/296), Wortmarke nur ≥1440, Nav-List kompakter (1.05rem statt 1.85rem), CTA 17–18 px (statt fix 34), Right-Side inline statt column-stack
- `tokens.css`: T1–T8 alle als clamp() (vorher fix Desktop + 767px-Override für T1–T5)
- `homepage.css`: Header-Block (Logo + Wortmarke + Right-Side + CTA + Lang) komplett entfernt — Pattern `single-source-ui-region` aus S38 endlich konsequent durchgezogen. Davor war der Block in homepage.css dupliziert und drift­ete bei jedem S46-Bump
- 4 Hard-Coded Hero/MFA/Final-Buttons + Final-Privacy ebenfalls clamp()
- `page.css`: `.pxz-page-content-inner` max-width 1140 → 960 px für Lesetext

**Phase 4 — Selbstprüfung:**
Probe bei 5 Viewports (1024 / 1280 / 1365 / 1440 / 1920): kein Overflow, Hero fluid 51 → 80, Body fluid 17 → 26, Privacy 18 → 32 (statt fix 46).

## Pre-Flight-Metriken am Session-Ende 47

- `validate.sh` — OK · `verify.sh` — VERIFY OK
- Sanitizer `--probe`: alle 5 Dateien im Budget
- HTTP-Sweep: nicht relaufen (Theme-CSS-only Änderung, keine Routes geändert)
- Pending-Queues: 0 Fragen, 2 Anweisungen (langlaufend WV-001 / WV-002)

## Working-Tree (Commit-Stand am Session-Ende 47)

- **Theme** ✅ committed `501f9d5` (5 Files +157/-214 LoC) — PXZ 2.7.71
- **Theme** 🟡 3 Files seit S43–S46 uncommitted (arzt.css / inc/homepage-data.php / template-homepage.php) — nicht von S47, nicht angetastet
- **Cortex-Web** 🟡 SESSION_RESUME.md (dieses Update) — committed `86b741c`
- **Nexus** 🟡 2 neue Patterns + Tutorial 27 — committed mit S47

## Patterns + Memory + Tutorials neu in Session 47

- **Pattern:** `Nexus/_memory/patterns/mid-range-viewport-coverage.md` — 5-Viewport-Probe-Pflicht (1024/1280/1365/1440/1920) statt nur 1440+430
- **Pattern:** `Nexus/_memory/patterns/fluid-type-scale-clamp.md` — clamp() für T-Tokens, Faustregel für vw-Faktor, Anti-Patterns
- **Tutorial:** `Second Brain/30 Tutorials/Webentwicklung/Webdesign/27-fluid-type-scale-mid-range-coverage.md` — komplett mit Glossar (Viewport, Retina, dpr, vw, Skalierung, Mid-Range, Stufen-Shift, Apple-HIG)

## Nicht erledigt (bewusst, am S47-Ende)

- **DESIGN_GUIDELINES §5.2 / §8.2 / §9.1** Update mit clamp()-Konvention — Spec-Block E offen
- **`probe-mid-range.mjs` in `verify.sh` integrieren** — Spec-Block D offen (verify.sh ist alt, Cleanup-Aufwand größer als heute geplant)
- **S43–S46-SESSION_RESUME-Lücke vollständig nachpflegen** — in S47 nur Catch-Up-Tabelle, keine §3-legacy-43..46-Blöcke (✅ in S51 nachgepflegt durch LL-053-Cold-Archive)
- **3 Theme-Files uncommitted (arzt.css / homepage-data.php / template-homepage.php)** — gehören zu früheren Sessions, klären beim nächsten Sessionstart
- **P3a Phase 3 Content-Review** — wartet weiter auf Dr. Stracke

## Konsistenz-Auffälligkeiten (KON-001) am S47-Ende

- `sites/praxis-webseite/SESSION_RESUME.md` weiterhin veraltet seit S19
- Tutorial „WP-CLI mit Local-by-Flywheel auf Mac" weiter offen

## Bezüge

- **Vorher:** S43–S46 Sonntags-Sprint → [`sessions-43-46-catch-up.md`](sessions-43-46-catch-up.md)
- **Nachher:** S49 Sanexio-Spiegel-Umbau (Top-Nav 5 Items + 19 Detail-Pages) → siehe `SESSION_RESUME.md` §1.1
- **Folge:** S50 Sanexio-Detail-Page-Mirror (25 Pages mit Hero-Layout)
- **LL-053-Auslöser:** Resume-Inhalt von S47 lebte 2026-04-27 bis 2026-04-28 in HOT-§3, wurde mit Sliding-Window in Session 51 ausgelagert.

---

*Erstellt 2026-04-28 in Session 51 als erste produktive Anwendung von LL-053a Sliding-Window-Auto-Archive (`SESSION_LIFECYCLE.md` Schritt 3c). Quelle: `SESSION_RESUME.md` §3-Block.*
