# Sanexio.github.io — Phase-2-Spec (Sprint 1)

**Status:** Phase 2 — Lösungsdesign · v2 nach Freigabe-Dialog 2026-05-03
**Architekten-Modus:** verbindlich (FK-1…FK-5, WORKING_MODE.md aus praxis-webseite)
**Profil:** A2 + B2.5 + C3 + D3-light (Phase 1) · DHT-Dachstory + Health-Graph-Integration (Phase 2 v2)

---

## §1 Mission der Seite

Sanexio.github.io repositioniert sich von „GitHub-Linkliste" zu **Brand-Hub
des digitalen Health-Care-Startups Sanexio GmbH** mit Fokus auf
**Human Enhancement durch den Digital Health Twin (DHT)**.

Die Seite erzählt **eine** Geschichte chronologisch:

> *Aus einer ärztlichen Vorüberlegung (SEBaNA) wurde eine Datenmethode
> (Bloody Check), aus der Datenmethode wurde ein Wissensmodell
> (Health Graph), aus dem Wissensmodell wird ein digitaler Zwilling
> (Juvantis DHT). Klinisch validiert in der Partnerpraxis Dr. Stracke
> & Kollegen.*

Praxis Dr. Stracke & Kollegen ist **klinischer Validator**, nicht Eigentümer.

---

## §2 Sitemap (Single-Page mit Anker-Sektionen + 2 Sub-Routes)

```
/ (Astro-Page mit Anchor-Sektionen)
├── #vision         Hero + Manifest „Human Enhancement"
├── #dht            DHT-Dachstory mit chronologischer Timeline
│                   ├─ 1. SEBaNA       (Vorüberlegungen, Konzept)
│                   ├─ 2. Bloody Check (Datengrundlage Blutwerte, sanexio.eu)
│                   ├─ 3. Health Graph (Wissensvernetzung, Live-Embed)
│                   └─ 4. Juvantis     (DHT iOS-App, Avatar-Visualisierung)
├── #health-graph   Interaktive Live-Demo (D3.js Knowledge Graph fullscreen)
├── #praxis         Klinischer-Partner-Block (helle Insel, Praxis-Logo)
├── #mission        Werte / Vision / Fokus (4 Pfeiler)
├── #news           Blog-Teaser → externer Link sanexio.de/blog (D3-light)
└── #kontakt        Kontakt + Social-Bar (alle Kanäle, modernisiert)

/impressum/         Sanexio-GmbH-Impressum (übernommen aus sanexio.eu)
/datenschutz/       Sanexio-Datenschutz (übernommen aus sanexio.eu)
```

---

## §3 DHT-Dachstory — chronologische Timeline (Kernkonzept)

Sektion `#dht` ist das narrative Herz. Statt drei gleichberechtigter Cards
**eine Timeline mit vier Phasen**, die zeigt: Sanexio entwickelt seit Jahren
einen integrierten Digital Health Twin.

| # | Phase | Jahr | Pitch | Externer Link |
|---|-------|------|-------|---------------|
| 1 | **SEBaNA** | ~2017 | Selbständig erfasste Befund-Anamnese — die ärztliche Vorüberlegung zum digitalen Patientenbild | github.com/Sanexio/SEBaNA |
| 2 | **Bloody Check** | 2024 | Standardisierte Blutprofile als Datengrundlage des DHT — verfügbar auf sanexio.eu | sanexio.eu (Bloody Check) |
| 3 | **Health Graph** | 2026 | D3.js Knowledge Graph: Organe ↔ Laborwerte ↔ Erkrankungen — das medizinische Wissensmodell | live im `#health-graph`-Embed |
| 4 | **Juvantis DHT** | 2026 | Patienten-App mit Avatar-Visualisierung — der digitale Zwilling im Hosentaschenformat | github.com/Sanexio/JUVANTIS |

**Visuelles Konzept:** vertikale Timeline mit pulsierender Linie in
Sanexio-Pulse-Rot (`#c1121f`), die die vier Phasen verbindet — **EKG-Glyph
aus dem Logo wird zum Storytelling-Element**. Auf Desktop horizontal mit
Zeit-Achse, auf Mobile vertikal gestapelt.

---

## §4 Health-Graph-Integration (das Visuelle Zentrum)

Das vorhandene Asset `health-graph.html` aus dem Juvantis-Shopify-Theme
(580 Zeilen, D3.js v7, eigenständige Datei mit `#0A0F1A`-Background +
Inter-Schrift + Teal-Gradient) wird **1:1 in `public/health-graph.html`
übernommen** und in zwei Modi eingebunden:

- **Sektion `#health-graph`:** Fullscreen-Iframe (100vh) mit Headline darüber
  und Erklär-Text darunter. Das Visual läuft autonom (Force-Directed
  Animation) und liefert den „Wow"-Moment.
- **Hero-Decoration:** subtiler Teaser im Hero (verkleinerter Iframe oder
  statisches PNG) der Lust auf die Live-Demo macht.

**Vorteil:** kein Re-Implementation-Aufwand, kein D3.js-Build, das Asset
ist bereits getestet im Shopify-Kontext. Single-File HTML lädt sofort.

**Sub-Domain-Bonus:** das HTML kann auch direkt unter
`https://sanexio.github.io/health-graph.html` als eigene Mini-Site verlinkt
werden (z. B. für Vorträge / Demos).

---

## §5 Designsprache — Sanexio-Identitätslayer (B2.5)

### §5.1 Token-Ableitung

| Schicht | Quelle | Wert(e) |
|---|---|---|
| **Brand-Identität** | Sanexio-Logo `assets-source/sanexio-logo/` | `#0a2540` Brand-Dark, `#c1121f` Puls-Rot, Georgia-Serif für Wortmarke |
| **Health-Graph-Tonalität** | `health-graph.html` Background + Akzente | `#0A0F1A` (Hero-Dark, optional), `#028090 → #02C39A` Teal-Gradient für „Daten/Vernetzung"-Akzente |
| **Tech-Akzent** | Juvantis-Shopify | `#4ea1d9` Tech-Blau, `#73c25e` Vitality-Grün |
| **Klinische Insel** | Praxis-Webseite | `#FFFFFF` Bg, `#1D1D1F` Ink, `#C8161D` Praxis-Rot, SF Pro / Inter |
| **Layout-Grid** | Praxis 4-Schichten-Modell | Adoption: Primitives → Semantic → Components → Pages |

**Design-Erweiterung:** Da der Health Graph mit Teal-Gradient operiert,
wird **Teal als sekundärer Brand-Akzent „Daten/Vernetzung"** akzeptiert
(nicht primärer Brand — der bleibt Dunkelblau + Puls-Rot). So entsteht
visuelle Brücke vom Hero zur Health-Graph-Sektion ohne Stilbruch.

### §5.2 Sanexio-Token-Set (Schicht 1 + 2)

`src/styles/tokens.css`, Namensraum `--sx-*`:

```css
/* SCHICHT 1 — PRIMITIVES */
--color-brand-900: #0a2540;   /* Sanexio-Dark-Blue, Logo-Text */
--color-brand-950: #0A0F1A;   /* Health-Graph-BG, Hero optional */
--color-brand-700: #163b5e;
--color-brand-50:  #f0f4f8;
--color-pulse-600: #c1121f;   /* EKG-Puls-Rot, Sanexio-Akzent */
--color-pulse-700: #8e0d18;
--color-data-500:  #028090;   /* Teal-Tief — Health-Graph-Akzent */
--color-data-400:  #02C39A;   /* Teal-Hell — Health-Graph-Hover */
--color-tech-500:  #4ea1d9;   /* Juvantis-Tech-Blau */
--color-vital-500: #73c25e;   /* Juvantis-Vitality-Grün */
--color-ink-900:   #020912;
--color-ink-700:   #2a3340;
--color-ink-500:   #5b6878;
--color-line:      #d8dee6;
--color-snow:      #fcfcfc;
--color-white:     #ffffff;

/* SCHICHT 2 — SEMANTIC */
--sx-c-bg:           var(--color-snow);
--sx-c-bg-brand:     var(--color-brand-900);
--sx-c-bg-deep:      var(--color-brand-950);   /* nahtloser Übergang zu Health-Graph */
--sx-c-bg-soft:      var(--color-brand-50);
--sx-c-surface:      var(--color-white);
--sx-c-ink:          var(--color-ink-900);
--sx-c-ink-on-brand: var(--color-white);
--sx-c-ink-muted:    var(--color-ink-500);
--sx-c-accent:       var(--color-pulse-600);   /* CTA primär, Timeline-Linie */
--sx-c-accent-hover: var(--color-pulse-700);
--sx-c-data:         var(--color-data-500);    /* Health-Graph-Verbindungen */
--sx-c-data-hi:      var(--color-data-400);
--sx-c-tech:         var(--color-tech-500);
--sx-c-vital:        var(--color-vital-500);
--sx-c-line:         var(--color-line);

/* TYPO */
--font-brand:    Georgia, "Times New Roman", "Liberation Serif", serif;
--font-display:  "Inter Tight", "Inter", -apple-system, sans-serif;
--font-body:     "Inter", -apple-system, "Helvetica Neue", sans-serif;
```

- **Georgia** ausschließlich für Logo-Wortmarke + 1–2 Display-Headlines im Hero
- **Inter Tight** für H2/H3
- **Inter** für Body/UI (gleiche Schrift wie Health-Graph-Asset → konsistent)

### §5.3 Praxis-Insel — bewusster Tonbruch

Sektion `#praxis` setzt sich als helle, ruhige Sektion ab:
- BG: `--sx-c-bg` (Off-White)
- Akzent: `#C8161D` (Praxis-Rot, eigene Wertetabelle)
- Logo: Praxis-`logo.svg` (rundes Caduceus-Badge)
- Footer: Link zu `westend-hausarzt.com`

---

## §6 Komponenten-Inventar

| Komponente | Zweck | Quelle / Inspiration |
|---|---|---|
| `Nav.astro` | Sticky Top-Nav, transparent über Hero, solid bei Scroll | Praxis §8.2 |
| `Hero.astro` | Brand-Dark-BG, Georgia-Wortmarke, Vision-Claim, optional Health-Graph-Teaser im Hintergrund | Eigen + Juvantis-Hero |
| `Manifest.astro` | 3-Punkt-Manifest „Human Enhancement bedeutet …" | Eigen |
| **`DhtTimeline.astro`** | **Vertikale (Mobile) / horizontale (Desktop) Timeline mit 4 Phasen, Pulse-Rot-Verbindungslinie** | **Eigen — Kernkomponente §3** |
| **`HealthGraphEmbed.astro`** | **Fullscreen-Iframe von `health-graph.html` + Erklär-Block + Open-in-Fullscreen-Button** | **§4** |
| `PartnerBlock.astro` | Praxis-Insel | §5.3 |
| `MissionBlock.astro` | 4 Wertepfeiler (Vorschlag in §9) | Juvantis-Image-with-Text |
| `NewsTeaser.astro` | 3 statische Teaser → Link sanexio.de/blog | Eigen |
| `SocialBar.astro` | Alle 7+ Social-Kanäle, modernisiert, Hover-States, Inline-SVG-Icons | Eigen — Footer-Element |
| `ContactFooter.astro` | Kontakt + SocialBar + Legal-Links | Eigen |
| `LegalPage.astro` | Layout für /impressum + /datenschutz | Praxis-Standard |

**Social-Bar (alle behalten, designtechnisch verarbeitet):**
GitHub · LinkedIn (Dr. Stracke) · YouTube (reaktivierungs-bereit) · Twitter/X ·
Facebook Sanexio · Facebook Medzpoint · XING · Udemy.

Statt der alten Box-Anordnung mit jeweils Bild + Untertext: **eine
horizontale Icon-Row** mit Inline-SVG (gleiche Größe, Brand-Tinted-Hover),
alphabetisch oder nach Wichtigkeit sortiert. Pro Icon ein Tooltip mit
Kanalname. Mobile: 2 Reihen à 4 Icons.

---

## §7 Tech-Stack (C3 — Astro)

### §7.1 Framework
- **Astro 5.x** (statisches HTML, minimaler Client-JS)
- **Tailwind CSS 4.x** + Custom-Properties-Bridge zu `--sx-*`
- **TypeScript** für Komponenten
- **Bun** als Runtime (Cluster-Mini-02 hat Bun)

### §7.2 Verzeichnis-Layout

```
sites/sanexio-github-io/
├── SPEC.md                       (diese Datei)
├── SESSION_RESUME.md             (nach Phase-2-Freigabe)
├── README.md
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── public/
│   ├── logo-sanexio.svg          (kopiert aus Praxis assets-source)
│   ├── logo-praxis.svg           (für #praxis-Block)
│   ├── health-graph.html         (kopiert aus Juvantis-Theme assets/)
│   ├── favicon.ico
│   └── og-image.png              (1200×630)
├── src/
│   ├── styles/
│   │   ├── tokens.css            (Schicht 1 + 2)
│   │   └── global.css            (Reset + Typo + Tailwind-Bridge)
│   ├── layouts/
│   │   └── Default.astro
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Manifest.astro
│   │   ├── DhtTimeline.astro
│   │   ├── HealthGraphEmbed.astro
│   │   ├── PartnerBlock.astro
│   │   ├── MissionBlock.astro
│   │   ├── NewsTeaser.astro
│   │   ├── SocialBar.astro
│   │   └── ContactFooter.astro
│   ├── data/
│   │   ├── dht-phases.ts         (4 Phasen mit Pitch + Link + Year)
│   │   ├── mission.ts            (4 Werte)
│   │   ├── news.ts               (3 Teaser-Stubs)
│   │   └── social.ts             (8 Kanäle)
│   └── pages/
│       ├── index.astro
│       ├── impressum.astro       (aus Sanexio-Shopify übernommen)
│       └── datenschutz.astro     (aus Sanexio-Shopify übernommen)
├── .github/workflows/deploy.yml  (Astro build → gh-pages branch)
└── .gitignore
```

### §7.3 Build & Deploy

- Source-Branch `main` (Astro-Source) → Build via GitHub Action →
  Output-Branch `gh-pages` (HTML, von GitHub Pages serviert)
- `astro.config.mjs`: `site: 'https://sanexio.github.io'`, `output: 'static'`
- Action: bei Push auf `main` → `bun install && bun run build` →
  `peaceiris/actions-gh-pages` deployt `dist/` zu `gh-pages`

### §7.4 Repo-Strategie — entschieden: R1

**R1 — Backup-Tag, dann Reset:** vor erstem Astro-Push wird Tag
`legacy-2015` auf den aktuellen `main`-HEAD gelegt und gepusht; danach
`main` mit Astro-Source ersetzt. Alte Version bleibt unter
`https://github.com/Sanexio/sanexio.github.io/tree/legacy-2015` erreichbar.

Begründung der Entscheidung:
- verlustfrei (alle Commits + Stars bleiben)
- Git-Standard, keine GitHub-UI-Eingriffe
- Rollback in 30 Sekunden möglich (`git checkout legacy-2015`)

---

## §8 Inhalte — Quellen & Migration

| Inhalt | Quelle | Status |
|---|---|---|
| **Hero-Vision-Manifest** | neu (Phase 3 Vorschlag durch Claude) | Phase 3 |
| **DHT-Timeline 4 Phasen** | Theme-Material + Pitches (Phase 3 Vorschlag) | Phase 3 |
| **Health Graph (Visual)** | `Juvantis/juvantis-web/theme/assets/health-graph.html` | 1:1 übernehmen |
| **Praxis-Block** | Praxis-Webseite Logo + Kerntext | Phase 3 |
| **Mission 4 Werte** | Vorschlag Claude Phase 3, Dr. Stracke editiert | Phase 3 |
| **News-Teaser** | sanexio.de/blog (Titel-Stubs) — externer Link | Phase 3 |
| **Social-Bar (8 Kanäle)** | bestehende URLs aus altem HTML | übernommen |
| **Impressum** | `Juvantis/juvantis-web/theme/templates/page.impressum.json` | übernommen |
| **Datenschutz** | `page.datenschutz.json` aus Juvantis-Theme | übernommen |

**Impressum-Inhalt** (bereits Sanexio-GmbH-spezifisch im Shopify-Theme):
- Sanexio GmbH, Grüneburgweg 12, 60322 Frankfurt am Main
- GF Dr. med. Siegbert Stracke, MBA · AG Frankfurt am Main · HRB + USt-IdNr „wird ergänzt"
- Kontakt: Tel 069 727819 · privat 069 247 574 526 · Fax 069 97206408 · praxis@westend-hausarzt.de
- Verantwortlich § 55 Abs. 2 RStV: Dr. Stracke
- Berufsrechtlich: LÄK Hessen, KV Hessen
- HRB + USt-IdNr **müssen vor Live-Schaltung ergänzt werden** (offene
  Stellen im Shopify-Original).

---

## §9 Mission-Block — Vorschlag 4 Wertepfeiler

(Dr.-Stracke-Editier-Material in Phase 3)

| Pfeiler | Ein-Satz |
|---|---|
| **Evidence-Based** | Jeder Datenpunkt im DHT ist klinisch validiert — keine Wellness-Esoterik. |
| **Patient-First** | Der digitale Zwilling gehört dem Patienten, nicht der Plattform. Daten-Souveränität bleibt. |
| **Open Knowledge** | Health Graph + Forschungsergebnisse sind transparent und nachvollziehbar. |
| **Klinisch validiert** | Jede Methode wird in der Partnerpraxis Dr. Stracke & Kollegen am echten Patienten geprüft, bevor sie Produkt wird. |

Drei der vier Werte greifen die Sanexio-DNA auf, der vierte schlägt die
Brücke zur Praxis-Insel — narrative Konsistenz. Dr. Stracke kann jeden
Punkt anpassen oder ersetzen.

---

## §10 Akzeptanzkriterien (Phase-3-Abschluss-Gates)

1. ✅ `https://sanexio.github.io/` lädt Astro-Build
2. ✅ Lighthouse Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95
3. ✅ WCAG-AA-Kontraste
4. ✅ Mobile (375 px) – Tablet (768) – Desktop (1280, 1920) sauber
5. ✅ Kein 404 auf interne Links · keine Broken Externals
6. ✅ Praxis-Insel optisch klar abgegrenzt
7. ✅ Health-Graph-Iframe lädt + ist auf Mobile bedienbar
8. ✅ DHT-Timeline auf Mobile + Desktop konsistent (vertikal/horizontal)
9. ✅ Impressum + Datenschutz Sanexio-spezifisch + Hinweis „HRB + USt-IdNr ergänzen"
10. ✅ GitHub Action grün, Auto-Deploy bei `main`-Push
11. ✅ Legacy-Tag `legacy-2015` auf GitHub vorhanden
12. ✅ SocialBar zeigt alle 8 Kanäle, Hover-States funktionieren

---

## §11 Risiken & Mitigationen

| Risiko | Mitigation |
|---|---|
| Sanexio-Brand zu nahe an Juvantis | Token-Trennung `--sx-*`, Georgia-Brand-Schrift, `#0a2540` als Sanexio-Hue |
| Praxis-Insel fügt sich nicht ein | Soft-BG `#f0f4f8` (Brand-50) als Übergangs-Tinte |
| Health-Graph-Iframe lädt langsam (D3 + Daten) | Iframe `loading="eager"` für Sektion, `lazy` für Hero-Teaser; Fallback-Bild bei JS-Fail |
| Health-Graph nicht mobil bedienbar | Auf Mobile: statisches PNG-Snapshot mit „Zur Live-Demo →"-Button, der Fullscreen-Modal öffnet |
| GitHub-Pages-Limits | Astro-Static < 5 MB, far below Limit |
| Inhalt-Lücke (SEBaNA Pitch unklar) | Phase 3 erste Mini-Frage: ein Satz pro Phase reicht |
| Impressum HRB/USt-IdNr offen | Vor Live-Schaltung ergänzen — Hinweis im Akzeptanzkriterium 9 |
| Juristisch wackelig | Vor Live-Schaltung Impressum + Datenschutz juristisch gegenchecken |

---

## §12 Phasenplan ab Freigabe

- **Phase 3a** (~1 h): Astro-Init, Tokens, Base-Layouts, Repo-Klon
- **Phase 3b** (~2.5 h): 10 Komponenten + Index-Page + DHT-Timeline + Health-Graph-Embed
- **Phase 3c** (~45 min): Impressum + Datenschutz (Übernahme aus Juvantis-Theme)
- **Phase 3d** (~30 min): GitHub Action + Tag `legacy-2015` + Push
- **Phase 4** (~45 min): Selbstprüfung — Lighthouse, Mobile-Test, Kontrast-Probe
- **Live-Schaltung:** GitHub Pages auf `gh-pages`-Branch umstellen → Tier 3, Freigabe vor Push

Gesamt-Aufwand: **~5–6 h**, ein Sprint.

---

## §13 Beantwortete Phase-1-Fragen

1. **Social:** alle 8 behalten, designtechnisch verarbeitet als `SocialBar.astro` ✅
2. **YouTube:** drin (reaktivierungs-bereit) ✅
3. **DHT-Story:** SEBaNA + Bloody Check + Health Graph + Juvantis als chronologische 4-Phasen-Timeline ✅
4. **Mission-Werte:** Vorschlag Claude in §9, Dr. Stracke editiert in Phase 3
5. **Repo:** R1 (Backup-Tag legacy-2015) entschieden ✅
6. **Impressum:** aus Juvantis-Shopify `page.impressum.json` (Sanexio-GmbH-spezifisch) ✅

---

## §14 Verbleibende Mini-Frage

Eine Sache, bevor Phase 3 startet:

**Hero-Visual:** Soll der Hero den Health-Graph subtil als Hintergrund
anzeigen (animierter Iframe gedimmt) oder bleibt der Hero textfokussiert
(Brand-Dark-BG, Georgia-Wortmarke, statisches Decoration-Element)?

- **H1 — Health-Graph-Hintergrund** (Wow-Faktor von Sekunde 0, aber Performance-Risiko)
- **H2 — Statischer Hero, Health-Graph erst in eigener Sektion** (sauber, schneller First Paint, Health-Graph als Showpiece weiter unten)

Sonst: **Spec-Update freigeben → Phase 3a startet automatisch.**

---

*Spec-v2 Status: zur Freigabe. Bei Freigabe + H1-/H2-Wahl: Phase 3a startet
mit Astro-Setup + Repo-Klon (ohne Push — der bleibt Tier 3 am Ende).*
