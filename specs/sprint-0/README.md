# Sprint 0 — Foundation

**Status:** Lösungsdesign fertig, wartet auf Freigabe der offenen Entscheidungen (b)/(c)/(d) — siehe `OPEN_DECISIONS.md`.

**Datum Start-Design:** 2026-04-18
**Freigegeben von Dr. Stracke:** Reihenfolge Sprint 0 → 1 → 2 → 3 → 4 (am 2026-04-18)
**Offen:** Umfang Sprint 0, Git-Scope, Deadline-Realität

---

## Ziel des Sprints

Projekt-Fundament stabilisieren, damit spätere Sprints deterministisch laufen. **Vier Deliverables, strikt reihenfolge-abhängig. Kein Feature-Arbeit.**

## Globale Constraints (gelten für alle vier Teilschritte)

- Homepage v2.5.0 + Karriere v2.6.0 bleiben **funktionsgleich** (keine Verhaltensänderung, auch nicht visuell)
- `tools/verify.sh` muss nach jedem Teilschritt grün bleiben
- Keine Plugin-Änderungen, keine DB-Schema-Änderungen
- Keine Änderung an `mu-plugins/000-local-mail-redirect.php` (Prod-neutral)

## Implizite Annahmen, die ich explizit gemacht habe

1. Das eigentliche WordPress-Theme (`praxiszentrum/`) wird versioniert, nicht `wp-content/` als Ganzes.
2. Git bleibt lokal (kein GitHub-Push), solange Dr. Stracke nichts Gegenteiliges sagt.
3. Design-Token-SSoT bricht keine Bestands-Selektoren, weil Token-Namen identisch bleiben.

---

## Teilschritte

### S0.1 — Git-Repo für Theme + MU-Plugin

**Scope:**
- `wp-content/themes/praxiszentrum/` wird eigenes Git-Repo
- `wp-content/mu-plugins/000-local-mail-redirect.php` wird in ein schmales Neben-Repo `mu-plugins-dev/` aufgenommen (oder im selben Repo als Unterordner — zu entscheiden im Detail)

**Layout `praxiszentrum/`:**
```
├── .gitignore            (node_modules, .DS_Store, *.log)
├── .git/
├── CHANGELOG.md          (Semver, Einstieg v2.6.0)
├── README.md             (Setup + WP-CLI-Snippet + PXZ_VERSION-Policy)
├── functions.php
├── style.css
├── template-homepage.php
├── template-karriere.php
└── assets/               (später in S0.2)
```

**Baseline-Commit-Nachricht:** `chore: baseline v2.6.0 (homepage + karriere + mfa form)`

**Kein Remote** in S0.1; Remote-Anbindung erst nach Antwort auf `OPEN_DECISIONS.md (b)`.

**Akzeptanzkriterien:**
- `git log` zeigt mindestens einen Commit mit PXZ_VERSION 2.6.0 als Referenz
- `git status` sauber
- `tools/verify.sh` grün (Homepage-Regression ausgeschlossen)
- README.md enthält den verbindlichen WP-CLI-Aufruf-Block (Socket-Override, memory_limit)

### S0.2 — CSS-Extraktion (Inline → Datei)

**Strategie:** Zwei-Schritt, verify-grün zwischen Schritten.
1. `template-homepage.php` Inline-`<style>` → neue Datei `assets/css/homepage.css`, via `wp_enqueue_style` mit `PXZ_VERSION` als `ver`-Parameter geladen.
2. `template-karriere.php` analog → `assets/css/karriere.css`.

**Risiken:**
- Blocksy-Reset-Spezifität (PXZ-E-001). Mitigation: identische Selektoren, identisches `!important`, 1:1-Transfer. Kein Refactor im selben Commit.
- Cache-Buster: `PXZ_VERSION` bleibt die Quelle, nur das Vehikel ändert sich (Datei statt Inline).

**Akzeptanzkriterien:**
- `diff` des gerenderten HTML vor/nach S0.2 zeigt nur geänderten Stylesheet-Pfad (kein Inline-`<style id="pxz-home-v...">` mehr)
- `verify.sh` grün
- Screenshot-Pixel-Diff (Puppeteer) zwischen v2.6.0-Baseline und S0.2-Ergebnis < akzeptable Rendering-Jitter-Toleranz

### S0.3 — Design-Token-SSoT + Komponenten-Abstraktion

**Strategie:** additiv, nicht destruktiv.

- Neue Datei `assets/css/tokens.css` mit allen `--pxz-*` Custom Properties auf `:root`
- Neue Datei `assets/css/components.css` mit `.pxz-card--dark`, `.pxz-card--light`, `.pxz-card--amber` (72/96/112-Padding-Skala, entspricht DESIGN_GUIDELINES §13)
- Bestehende Klassen (`.pxz-mfa-card`, `.pxz-loc-card--main`, `.pxz-kar-card`) bekommen in S0.3 **noch keine** Abhängigkeit auf Komponenten — nur Tokens werden konsolidiert
- Migration der drei Card-Klassen auf `.pxz-card--dark` = **separater Sprint-2-Task**, nicht in S0

**Akzeptanzkriterien:**
- Keine visuelle Abweichung
- Tokens existieren zentral (einmalige `:root`-Definition)
- Alte Deklarationen bleiben bis Sprint 2 bestehen (keine Breaking-Change-Welle)

### S0.4 — Verify-Pipeline auf Page-Registry umstellen

**Struktur:**
```
tools/
├── page-registry.mjs       export default [{slug, url, selectors, expected}]
├── probe-design.mjs        liest Registry, iteriert
└── shoot.mjs               generisch (ersetzt shoot_karriere.mjs)
```

**Initialer Registry-Inhalt:**
- Homepage (bestehende EXPECTED-Werte aus `probe-design.mjs` unverändert übernommen)
- Karriere (neue EXPECTED-Werte aus v2.6.0 abgeleitet: `.pxz-kar-card` padding-top 112/96/72; `.pxz-kar-hero .pxz-kar-eyebrow` color amber; form-Feld vorhanden `wpforms-field-checkbox` mit `required`)

**Akzeptanzkriterien:**
- `bun run tools/probe-design.mjs` liefert für Home + Karriere alle OK
- `bun run tools/shoot.mjs` erzeugt versionsbenannte Shots für beide
- Alt-Skript `shoot_karriere.mjs` wird als Deprecated markiert oder entfernt

---

## Alternativen je Teilschritt (dokumentiert für späteren Re-Review)

| Teilschritt | Gewählt | Alternative | Warum gewählt |
|-------------|---------|-------------|---------------|
| S0.1 Git-Scope | Nur `praxiszentrum/` | `praxis-redesign/` + Theme als Submodule | Theme ist der Code-Träger, Docs bleiben getrennt |
| S0.2 CSS-Extraktion | 2 Commits (Home, Karriere) | 1 Big-Bang-Commit | Kleinere Reviewschritte, Rollback-freundlicher |
| S0.3 Token-Konsolidierung | additiv, keine Breaking Changes | direktes Refactor der 3 Card-Klassen auf 1 Basis | Breaking-Refactor = Regressionsrisiko im selben Sprint |
| S0.4 Registry-Format | JS-Modul mit typisiertem Schema | JSON | JS erlaubt Computed Expectations (Viewport-abhängig) |

---

## Selbstprüfung-Schema (wird am Ende jedes Teilschritts ausgefüllt)

| Kriterium | Soll | Ist | Abweichung | Bewertung |
|-----------|------|-----|------------|-----------|
| Funktional identisch | 100 % | ? | ? | ? |
| `verify.sh` grün | OK | ? | ? | ? |
| Visueller Diff | ≤ Jitter-Toleranz | ? | ? | ? |
| Keine Scope-Erweiterung | Ja | ? | ? | ? |
| Gesamt (0–100 %) | 100 % | ? | — | — |
