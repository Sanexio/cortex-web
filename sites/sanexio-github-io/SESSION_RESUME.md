# sanexio-github-io — SESSION_RESUME

> Hot-Memory dieses Sub-Projekts (LL-053, Cap 12 k Tokens).
> Bei „Projekt fortsetzen sanexio-github-io" wird diese Datei zuerst gelesen.

---

## §1 — Sprint 1 LIVE (2026-05-03, abgeschlossen)

**Status:** Sanexio-Brand-Hub läuft auf `https://sanexio.github.io/`. DSGVO-clean (null externe Requests). Lighthouse Mobile 90 / 90 / 96 / 100.

**Live-Stack:**
- Branch `main` HEAD `1f183b1` (Astro-Source) → Action → Branch `gh-pages` HEAD `82c49ffe` (Build, gh-pages-Settings auf `/(root)`)
- Pages-Source-Switch von `master` auf `gh-pages` durch Dr. Stracke am 2026-05-03 ~11:20 erledigt
- Astro 5.18.1 · Tailwind 4.2.4 · Bun 1.3.13 · 3 Pages, ~1.5 MB Build

**Heutige Welle (Polish-Run nach Sprint-1-Scaffold):**
1. **Live-URL-Verify** — Action `6949b8a` success, gh-pages bedient Astro-Stand
2. **Lighthouse Mobile** (live, throttled): Performance 90 · A11y 90 · Best-Practices 96 · SEO 100. LCP 2.9 s · CLS 0 · TBT 0 ms. Reports unter `_audits/2026-05-03/lh-mobile-home.report.{html,json}`
3. **Self-Hosted Inter + Inter Tight** (Commit `4903239`): Latin Variable woff2 (47 + 44 KB) in `repo/public/fonts/`, `src/styles/fonts.css` mit `@font-face` weight 100-900, Default.astro Google-Fonts raus / Preload rein, health-graph.html Iframe-Inline `@font-face`. Pattern: `Nexus/_memory/patterns/self-hosted-google-fonts-latin-variable.md`. Tutorial: `Second Brain/30 Tutorials/Webentwicklung/Webdesign/09-dsgvo-fonts-self-hosted.md`
4. **HRB ergänzt** (Commit `1f183b1`): Sanexio GmbH HRB **2535** (Amtsgericht Frankfurt am Main) im Impressum. USt-IdNr als sichtbarer „[wird nachgereicht]"-Platzhalter

---

## §2 — Carry-over für nächste Session(en)

**Daten-Blocker (warten auf Dr. Stracke):**
- USt-IdNr `DE…` ergänzen → 1 Edit in `src/pages/impressum.astro` Zeile 24 + Push, ~1 min Re-Deploy

**GitHub-Settings-Carry-over:**
- Default-Branch `master → main` umstellen — letzter Versuch hat „Could not change default branch" geliefert. Wege für nächste Session:
  - Sudo-Mode neu auslösen (Logout + Login auf github.com, dann sofort Setting versuchen) — häufigste Ursache abgelaufene Sicherheits-Session
  - Alternative: Personal Access Token (`repo` scope) + REST-API: `curl -X PATCH -H "Authorization: token …" https://api.github.com/repos/Sanexio/sanexio.github.io -d '{"default_branch":"main"}'`
  - Falls erfolgreich: anschließend `master`-Branch löschen (Tag `legacy-2015` sichert den Stand)

**Sprint 2 Polish-Punkte (technisch):**
- **A11y-Findings beheben** (Lighthouse 90 → 100):
  - `[aria-hidden="true"]`-Elemente enthalten focusable Kinder — wahrscheinlich der Nav-EKG-Puls oder die Footer-Social-SVGs. Audit mit `axe-core` empfohlen.
  - Kontrastdefizit — vermutlich Subtext auf Brand-Dark in Hero oder Footer. Prüfen mit `contrast-ratio.com` oder DevTools-Color-Picker.
- **Best-Practices 96 → 100:** Console-Errors auflösen. Quelle in DevTools-Console live öffnen.
- **OG-Image** (`public/og-image.png`, 1200×630, Brand-Dark + Wordmark) rendern — aktuell 404, kein Render-Fehler, aber kein Social-Preview
- **Mission-Werte** (`src/data/mission.ts`) und **News-Teaser** (`src/data/news.ts`) — aktueller Text ist Stub-Vorschlag, Dr. Stracke kann verfeinern

**Datenschutz-Review:**
- **Vor Live-Schaltung an Endkunden** Datenschutz-Erklärung (`src/pages/datenschutz.astro`) juristisch prüfen lassen. Self-Hosted Fonts sind jetzt drin → Google-Fonts-Klausel im Datenschutz kann ggf. gestrichen werden.

---

## §3 — Architektur kompakt

**Stack:** Astro 5.18.1 · Tailwind 4.2.4 · TypeScript 5.9.3 · Bun 1.3.13 (Cluster-Mini-02 only)

**Token-Modell** (4-Schichten):
- Namespace `--sx-*` (distinct from `--pxz-*` Praxis und Juvantis-Settings)
- Brand-Anchor: `#0a2540` Dark-Blue · `#c1121f` Pulse-Red · `#028090 → #02C39A` Teal-Data-Akzent
- Schriften: Georgia (Brand-Wortmarke, System) · Inter Tight (Display, self-hosted) · Inter (Body, self-hosted)

**Sektionen / Komponenten** (10 Astro + 4 Daten):
- `Nav.astro` (sticky transparent → solid-with-blur)
- `Hero.astro` (Brand-Dark, Inline-SVG-EKG-Puls als „n", zwei CTAs)
- `Manifest.astro` (3-Punkt „Human Enhancement")
- `DhtTimeline.astro` (4 Phasen: SEBaNA → Bloody Check → Health Graph → Juvantis)
- `HealthGraphEmbed.astro` (Iframe `/health-graph.html` 1:1 aus Juvantis-Theme, jetzt DSGVO-clean)
- `PartnerBlock.astro` (helle Insel, Praxis-Rot-Akzent, Quote-Card)
- `MissionBlock.astro` (4 Wertepfeiler)
- `NewsTeaser.astro` (3 Stubs → sanexio.de/blog)
- `SocialBar.astro` (8 Kanäle inline-SVG)
- `ContactFooter.astro` (4-Spalten + bottom-bar)
- `LegalPage.astro` (gemeinsames Layout für Impressum + Datenschutz)

**Routes:** `/`, `/impressum/`, `/datenschutz/`, statische Assets (`/health-graph.html`, Logos, Favicon, `/fonts/`)

**Deploy:** GitHub Action `.github/workflows/deploy.yml` (push main → `bun build` → `dist/` auf `gh-pages`-Branch via `peaceiris/actions-gh-pages@v4`). Build ~10-15 s, Deploy ~30 s.

---

## §4 — Pre-Flight für nächste Session

```bash
cd ~/Cortex/projects/Cortex-Web/sites/sanexio-github-io/repo
bun install                # idempotent, falls package.json änderte
bun run build              # 3 Pages, ~1 s
bun run preview            # localhost:4321 — visueller Smoke-Check
```

Action-/Live-Status:
```bash
curl -s 'https://api.github.com/repos/Sanexio/sanexio.github.io/actions/runs?per_page=1' | python3 -c "import json,sys; r=json.load(sys.stdin)['workflow_runs'][0]; print(r['head_sha'][:8], r['status'], r['conclusion'])"
curl -sI -L https://sanexio.github.io/ | grep -E "HTTP|last-modified"
```

---

## §5 — Pfade & Quick-Reference

| Was | Wo |
|-----|-----|
| Spec | `sites/sanexio-github-io/SPEC.md` |
| Source-Repo | `sites/sanexio-github-io/repo/` |
| Audits-Archiv | `sites/sanexio-github-io/_audits/YYYY-MM-DD/` |
| GitHub-Repo | `git@github.com:Sanexio/sanexio.github.io.git` |
| Live-URL | https://sanexio.github.io/ |
| Health-Graph-Quelle | `Juvantis/juvantis-web/theme/assets/health-graph.html` |
| Sanexio-Logo-Quellen | `sites/praxis-webseite/assets-source/sanexio-logo/` |
| DSGVO-Fonts-Pattern | `Nexus/_memory/patterns/self-hosted-google-fonts-latin-variable.md` |
| Tutorial DSGVO-Fonts | `Second Brain/30 Tutorials/Webentwicklung/Webdesign/09-dsgvo-fonts-self-hosted.md` |

---

## §6 — Verbote / harte Regeln für nächste Session

- **NIE** Google Fonts CDN wieder einbauen (DSGVO-Fortschritt geht sonst verloren). Bei neuer Family: Pattern `self-hosted-google-fonts-latin-variable.md` strikt anwenden.
- **NIE** Tag `legacy-2015` löschen — er sichert den 2017er-Stand für Restore-Fall.
- **NIE** master-Branch ohne vorherigen Default-Branch-Switch löschen (GitHub blockiert ohnehin, Risiko aber: jemand könnte mit Force-Push tricksen).
- **Live-Schaltung an Endkunden NICHT** vor juristischer Datenschutz-Prüfung.

---

*Letzter Stand: Sprint 1 Polish abgeschlossen 2026-05-03 ~14:10. Nächster Trigger: „Projekt fortsetzen sanexio-github-io" → §2 Carry-over abarbeiten oder Sprint 2 öffnen.*
