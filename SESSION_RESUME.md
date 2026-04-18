# Session-Resume — Einstieg via Befehl „Projekt fortsetzen"

> **Standard-Einstieg seit 2026-04-18 (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):**
> In neuer Claude-Code-Session schreibst Dr. Stracke einfach
> **„Projekt fortsetzen"** (optional „… praxis-redesign"). Claude lädt dann
> automatisch:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/verify.sh`)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Front

---

## §0 EINSTIEG „Projekt fortsetzen" — Pflicht-Lesung in dieser Reihenfolge

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md` (LL-042/043)
5. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (Architekten-Modus)
6. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` (Sprint-Roadmap)
7. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md` (PXZ-E-001…008)
8. `~/Cortex/projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md` (§7a/7b/7c)
9. `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md` (v2.3, §13–§16.6)
10. `~/Cortex/projects/praxis-redesign/specs/sprint-0/README.md` + `OPEN_DECISIONS.md`
11. Diese Datei (SESSION_RESUME.md)
12. `cd ~/Cortex/projects/praxis-redesign && tools/verify.sh` (muss grün sein)

---

## §1 Stand & Version (gültig: 2026-04-18 Abend, nach S2.0 Design-Token-SSoT)

- **PXZ_VERSION:** **2.7.5** live auf Local by Flywheel (Cluster-Mini-02). Stand: Design-Token-SSoT in `assets/css/tokens.css`, keine Optik-Änderung gegenüber v2.7.4 (MD5-byte-identisch).
- **Site-Root:** `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/`
- **URL:** `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local`
- **Child-Theme:** `wp-content/themes/praxiszentrum/`
- **Homepage + Karriere** weiter abgenommen, visuelle Abnahme v2.7.5 durch Dr. Stracke 2026-04-18.

### Sprint-Status (Stand 2026-04-18 Abend)

| Sprint | Status | Kommentar |
|---|---|---|
| Sprint 0 — Foundation | ✅ abgeschlossen (S0.3 final als S2.0 in Sprint 2 erledigt) |
| **Sprint 1 — Rollout-Infrastruktur** | ⏸ **PAUSIERT** | DF-Support wegen fehlender SFTP-Credentials angeschrieben. Spec bleibt gültig. Reanimieren, sobald Credentials in `.env.sprint1.local` eingetragen sind. Check beim Einstieg: `SFTP_DE_HOST` in `.env.sprint1.local` nicht mehr leer? |
| **Sprint 2 — Kernseiten-Ausbau + Design-System** | 🟢 **aktiv, S2.0 ✅** | **S2.0 (Token-SSoT) abgeschlossen 2026-04-18 v2.7.5**, 0-Delta-Verifizierung. Offen: S2.0b (Komponenten-Abstraktion, optional), S2.1 (Seiten-Inventar), S2.2 (Template-Typologie), S2.3 (Kernseiten in Batches), S2.4 (Menü), S2.5 (QA-Audit). |
| Sprint 2b — Legacy-Content-Migration | ⏳ nach Sprint 2 | 172 Legacy-Seiten, verschoben. |
| Sprint 3 — Mehrsprachigkeit (WPML) | ⏳ geplant | |
| Sprint 4 — Go-Live (SEO/Schema/Cut-Over) | ⏳ geplant | |

- **`tools/verify.sh`:** alle 4 Checks grün (Split, Reset, Computed-Style via Registry 54/54, Alignment) — zuletzt 2026-04-18 nach S2.0-Commit.

### Theme-Repo (`praxiszentrum/`) Commit-Stand

```
257304e  feat(s2.0): design-token SSoT; bump PXZ_VERSION 2.7.4 → 2.7.5
914af8d  feat(s0.2): extract karriere CSS; bump PXZ_VERSION 2.7.3 → 2.7.4
c3f7db7  feat(s0.2): extract homepage CSS from inline to assets/css/homepage.css
8c9d0fa  chore: baseline v2.7.3 (homepage + karriere + mfa-formular)
```

### Docs-Repo (`projects/praxis-redesign/`) Commit-Stand

```
6dbd214  chore: v2.7.5 verify shots (S2.0 token-SSoT, md5-identical to pre-S2.0)
29383cd  docs(sprint-2): S2.0 design-token SSoT spec
519c4e1  docs(sprint-1): spec + env template; pause for DF-support; preschedule sprint 2
bee530a  docs: S0.2 abschließen (v2.7.4) + Session-Resume finalisieren
7de7ee0  chore: verify-shots from S0.2 extraction (2026-04-18 v2.7.4)
```

---

## §2 Pre-Flight-Befehl

```bash
cd ~/Cortex/projects/praxis-redesign && tools/verify.sh
```

Erwartet: Exit 0. Prüft §1 Split-Check + §2 Reset-Scope + Screenshots +
§3 Computed-Style-Probe + §4 Alignment-Probe (PXZ-E-008).

Nach jeder CSS-Änderung **zusätzlich**:
```bash
bun run tools/ab-diff.mjs                          # nur Nachher
bun run tools/ab-diff.mjs --override='<vorher-css>' # mit Vorher-Vergleich
```

---

---

## §3 Sofort-Status-Frage an Dr. Stracke (Architekten-Stil)

Nach Pflicht-Init + Pre-Flight grün, fragt Claude:

> „Sprint 2 / S2.0 Design-Token-SSoT ist ✅ abgeschlossen (v2.7.5, 0-Delta-verifiziert). Sprint 1 weiter pausiert (DF-Support-Antwort abwarten). Welche Front bearbeiten wir?
>
> A. **Sprint 2 / S2.1 — Seiten-Inventar & Content-Audit** — Muss-Seiten-Liste, Content-Quellen klären (Prod-Übernahme/Neu-Text). Vorbereitung für S2.3 Kernseiten-Implementierung.
> B. **Sprint 2 / S2.0b — Komponenten-Abstraktion** — `assets/css/components.css` mit `.pxz-card--dark/--light`, `.pxz-section`, `.pxz-eyebrow`, `.pxz-btn`. Additiv, risikoarm; reduziert Duplikation der drei Card-Klassen. Optional, nicht blockierend für S2.1.
> C. **Sprint 2 / S2.3 Batch A — Datenschutz + Impressum** — Legal-Textseiten vorziehen (parallele Front zu S2.1). Vorbedingung: Rechtssicherheit-Entscheidung (Anwalt/Generator/Prod-Text).
> D. **Sprint 1 reanimieren** — nur falls DF-Support SFTP-Credentials geliefert hat. Check: `SFTP_DE_HOST` in `.env.sprint1.local` nicht mehr leer?
> E. **Backlog 2026-04-18** — CTA-Anschnitt @ 1440 px · PHP-Deprecation `theme-freesia-demo-import` · Mobile-Eyebrow MFA.
> F. **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor expliziter Wahl.

**Checks vor der Antwort auf die Status-Frage:**
- `grep -E "^SFTP_DE_HOST=." .env.sprint1.local` — leer? dann D nicht möglich.
- Gibt es eine Mail vom DF-Support? → D möglich
- Sonst: A (S2.1) ist der direkt nutzbare nächste Schritt, weil er die Voraussetzung für Kernseiten-Batches schafft

---

## §4 Verbote / harte Regeln für die nächste Session

- Niemals Status „fertig", ohne dass `tools/verify.sh` grün ist.
- Niemals CSS-Änderung an zwei Stellen (PXZ-E-001).
- Niemals Annahme über Design-Intent ohne Referenz-Bild (PXZ-E-003).
- Niemals Screenshot ohne Computed-Style-Probe (PXZ-E-004).
- Niemals globaler `.pxz-home p { … }`-Reset — immer `.pxz-home :where(p) { … }` (PXZ-E-008).
- Niemals Cache-/DevTools-Delegation an Dr. Stracke (PXZ-E-007 §7a).
- Bei „einige Punkte"/„passt nicht"-Formulierungen: Paraphrase in 1 Satz vor jedem Edit (§7b).
- Bei Hauptask-Abschluss: proaktiv „Session beenden" anbieten (LL-042).

---

## §5 Letzte Session — Was wurde erledigt

### Session 2026-04-18 (Abend) — Sprint 2 / S2.0 Design-Token-SSoT (v2.7.5)

**Auftrag Dr. Stracke:** Front A — S2.0 Design-Token-SSoT starten. Entscheidungen 1a (nur tokens.css, kein components.css), 2a (Duplikate löschen, echte SSoT), 3a (karriere.css auf `var()`-Referenzen), 4a (PXZ_VERSION 2.7.4 → 2.7.5 als patch-bump).

**Architekten-Modus-Durchlauf:**

1. **Phase 1 (Verständnis):** IST-Bestandsaufnahme — 171 `var(--pxz-*)`-Zugriffe in 4 Dateien, Primitives 3-fach dupliziert (style.css, homepage.css, karriere.css), semantische Tokens nur seiten-lokal.
2. **Phase 2 (Lösungsdesign):** Spec `specs/sprint-2/S2.0_tokens.md` mit 4 Entscheidungspunkten, explizit gemachten Annahmen, Akzeptanzkriterien-Tabelle, Rollback-Plan. Dr. Stracke freigegeben → Umsetzung.
3. **Phase 3 (Umsetzung):**
   - `assets/css/tokens.css` neu — 12 Primitives + 6 semantische Light-Defaults auf `:root`, zwei-Schicht-Aufbau mit `var()`-Referenz zwischen Schichten.
   - `functions.php` — Enqueue-Dependency-Kette umgestellt: `pxz-tokens` → `blocksy-parent` → `praxiszentrum` → `pxz-homepage`/`pxz-karriere`. PXZ_VERSION 2.7.4 → 2.7.5.
   - `style.css` — `:root`-Block mit 9 Primitives entfernt, Kommentar-Verweis auf `tokens.css`.
   - `assets/css/homepage.css` — Primitive-Block in `.pxz-home` (11 Primitives + 6 semantische Defaults) entfernt; Dark-Mode-Override `.pxz-mfa { --pxz-bg: var(--pxz-ink) … }` bleibt unverändert (Custom Properties vererben durch Subtree).
   - `assets/css/karriere.css` — 4 Primitive-Duplikate entfernt, Amber über `var(--pxz-amber)` referenziert, Karriere-spezifisches `#0E0E10` lokal im Scope mit Kommentar-Begründung.
   - `CHANGELOG.md` — v2.7.5-Block mit Detail-Eintrag.
4. **Phase 4 (Selbstprüfung):** 100 % — alle 13 Akzeptanzkriterien erfüllt.

**Verifikation:**
- `tools/verify.sh` grün: §1 Split-Check, §2 Reset-Scope, §3 Computed-Style-Probe **54/54** auf Home + Karriere × 3 Viewports, §4 Alignment-Probe **10/10** Showpiece-Zentrierungen.
- Neue versionsbenannte Shots: `screenshots/claude/2026-04-18_v2.7.5_{home,karriere}_{desktop1440,tablet768,mobile430}_full.png` (6 Shots).
- **MD5-Byte-Vergleich:** alle 6 v2.7.5-Shots md5-identisch zu ihren Baseline-Pendants (Home v2.7.3, Karriere v2.6.0). Stärkster möglicher Null-Delta-Beweis.
- **Visuelle Abnahme Dr. Stracke:** 2026-04-18 im Browser bestätigt („Das sieht gut aus").

**Commits:**
- Theme-Repo: `257304e feat(s2.0): design-token SSoT; bump PXZ_VERSION 2.7.4 → 2.7.5` (6 Dateien, +87/−46).
- Docs-Repo: `29383cd docs(sprint-2): S2.0 design-token SSoT spec` + `6dbd214 chore: v2.7.5 verify shots`. Kein Remote-Push (b=1 aus Sprint 0).

**Nexus-Architektur-Updates (Session-Ende Schritt 3):**
- `Nexus/_memory/MEMORY.md` — Projekt-Status-Zeile auf „Sprint 2 aktiv, S2.0 ✅ v2.7.5", Theme-Repo-Pfad auf Commit `257304e`, Tutorial-Referenz auf `05-design-tokens-und-cascade.md` erweitert, Pattern-Katalog um `design-token-ssot.md` ergänzt.
- `Nexus/_memory/patterns/design-token-ssot.md` neu — wiederverwendbares Pattern (Zwei-Schicht-Tokens + Dependency-Kette + MD5-Byte-Beweis).
- `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/05-design-tokens-und-cascade.md` neu — Erklär-Tutorial für Dr. Stracke (CSS Custom Properties, zwei-Schicht-Aufbau, Cascade-Ordnung in WP, MD5-Null-Delta-Beweis).

**Cleanup:** 6 Zwischenstand-verify-Shots (`2026-04-18_{1636,1656,1703}_verify_*`) nach `screenshots/claude/_archive/` verschoben (gitignored).

**Offene Punkte für nächste Session:**
- **S2.0b Komponenten-Abstraktion** — optional, additiv (siehe Front B in §3).
- **S2.1 Seiten-Inventar** — Vorbedingung für S2.3 Kernseiten-Batches (siehe Front A).
- **DF-Support-Antwort** — Sprint 1 reaktivierbar sobald `.env.sprint1.local` gefüllt.
- **Backlog unverändert:** CTA-Anschnitt @ 1440 px, PHP-Deprecation `theme-freesia-demo-import`, Mobile-Eyebrow MFA.

---

### Session 2026-04-18 (Abend, vorher) — Sprint-1-Design, DF-Blocker, Roadmap-Umstellung

**Auftrag Dr. Stracke:** Front A (Sprint 1 starten — Staging + Backup + Mail-Test).

**Durchgeführt:**

1. **Architekten-Modus Phase 1/2 für Sprint 1** — Verständnis + Lösungsdesign mit blockierenden Entscheidungen (a)/(b)/(c)/(d) + Test-Empfänger.
2. **Entscheidungen freigegeben 2026-04-18 durch Dr. Stracke:**
   - (a) = 2 → Root-Domain `westend-hausarzt.de` als Staging (Weiterleitung zu `.com` wird aufgehoben)
   - (b) = 1 → AkeebaBackup für Full-Backup + Restore
   - (c) = 2 → Mail-Test mit Text + 1 PDF-Anhang (~2 MB)
   - (d) = offen, ASAP
   - Test-Empfänger: `stracke.md@me.com`
   - Credentials-Lieferweg: Option B (`.env.sprint1.local`, gitignore-geschützt)
3. **Spec-Artefakte neu angelegt:**
   - `specs/sprint-1/README.md` — detaillierte Sprint-1-Spec mit Akzeptanzkriterien für S1.1/S1.2/S1.3
   - `specs/sprint-1/OPEN_DECISIONS.md` — Credentials-Checkliste
   - `.env.sprint1.local.template` — ausfüllbares Template mit allen Feldern
   - `.gitignore` erweitert um `.env*` + Negation `!.env.*.template`
4. **Blocker:** Dr. Stracke fand SFTP-Zugangsdaten im DF-Kundencenter (ManagedHosting 24) nicht, Support am 2026-04-18 angeschrieben. Sprint 1 pausiert.
5. **Roadmap umdisponiert 2026-04-18 (Dr.-Stracke-Auftrag):**
   - Sprint 1 ⏸ bis DF-Support antwortet
   - Sprint 2 (neu: „Kernseiten-Ausbau + Design-System") vorgezogen, weil vollständig auf Local machbar
   - Ursprüngliches Sprint-2-Scope (Legacy-Migration 172 Seiten) → als Sprint 2b verschoben
   - `_rules/ARCHITECTURE.md` §4 aktualisiert
6. **Sprint-2-Grobskizze erstellt:** `specs/sprint-2/README.md` mit S2.0 (Token-SSoT, vorgezogen aus Sprint 0) bis S2.5 (QA-Audit). Detail-Specs kommen in der nächsten Session vor Umsetzung.

**Verifikation:**
- `tools/verify.sh` grün (vor Session-Ende, unverändert seit Nachmittag — keine Theme-Änderung diese Session).
- Keine Live-Änderung an `.com` oder `.de`.
- Keine Credentials im Repo (überprüft: `.env.sprint1.local` matched `.gitignore:12`, Template matched Negation `:13`).

**Nexus-Architektur-Update:**
- `Nexus/_memory/MEMORY.md` — Status-Zeile `praxis-redesign` aktualisiert auf neuen Sprint-Status.
- Ergänzendes Tutorial: `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/04-credentials-und-env-dateien.md` (Credentials-Hygiene, `.gitignore`-Negation, Lieferoptionen A/B/C).

**Offene Punkte für nächste Session:**
- DF-Support-Antwort abwarten → sobald da, `.env.sprint1.local` füllen und Sprint 1 reaktivieren
- Entscheidung in nächster Session: Front A (S2.0 Token-SSoT) oder Front D (Legal-Seiten vorziehen)?
- Sprint-2-Details: Offene Fragen in `specs/sprint-2/README.md` unten (Content-Quellen, Datenschutz-Text, Fotos, Doctolib-Einbettung)

---

### 0. ARBEITSWEISE AB 2026-04-18 — ARCHITEKTEN-MODUS (VERBINDLICH)

Dr. Stracke hat am 2026-04-18 die Arbeitsweise umgestellt. Du agierst ab
sofort als **strukturierter Software-Architekt und technischer Projektpartner**,
nicht als reaktiver Assistent. Deterministisch, nachvollziehbar, reproduzierbar.

**Pflicht-Lesung vor jeder Aufgabe (zusätzlich zu den Nexus-Dateien):**
`_rules/WORKING_MODE.md` — enthält:
- 4-Phasen-Prozess: Verständnis-Sicherung → Lösungsdesign → Umsetzung → Selbstprüfung
- Fehlerklassen FK-1 bis FK-5
- Verbotene Muster + Kommunikationsstandard

**Regel in 1 Zeile:** Keine Umsetzung ohne Spec. Keine Spec ohne Freigabe.

---

## 1. PFLICHT-INITIALISIERUNG (LL-023, KON-001 + 2026-04-18 Update)

Lies in dieser Reihenfolge, **bevor** irgendetwas getan wird:

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (**neu 2026-04-18 — Architekten-Modus**)
5. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` (**neu 2026-04-18 — IST/SOLL, Sprint-Plan**)
6. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md`
7. `~/Cortex/projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md`
8. `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md` (v2.3 — verbindlich, inkl. §13–§16.6)
9. `~/Cortex/projects/praxis-redesign/HANDOFF_PROMPT.md` (Projekt-Kontext, 8 Aufgaben)
10. `~/Cortex/projects/praxis-redesign/PHASE1_AUDIT.md` (5-Phasen-Plan)
11. `~/Cortex/projects/praxis-redesign/specs/sprint-0/README.md` (**aktueller Arbeitsspec**)
12. `~/Cortex/projects/praxis-redesign/specs/sprint-0/OPEN_DECISIONS.md` (**offene Freigaben**)
13. Pre-Flight ausführen: `cd ~/Cortex/projects/praxis-redesign && tools/verify.sh`

---

## 2. NUTZER & ARBEITSWEISE

- **Nutzer:** Dr. Stracke — Internist, Praxisinhaber, kein IT-Experte
- **Sprache Chat:** Deutsch · **Code-Kommentare:** Englisch
- **Transparenz (LL-024):** jeder Schritt mit WAS / WARUM / WAS BEDEUTET DAS
- **Entscheidungen (LL-034):** alle Optionen mit Vor-/Nachteilen, Dr. Stracke wählt
- **Fertig (LL-021):** funktionstüchtig, nicht „Datei existiert"
- **Tempo:** Dr. Stracke hat ausdrücklich gefordert: *„Wir sind zu langsam."* →
  KEINE Zwischenfragen bei klaren Aufgaben. Batches statt Einzelschritten.
- **Design-Verifizierung ist PFLICHT** nach jeder sichtbaren Änderung via
  Chrome Headless Screenshot. Nicht nur Code ändern und behaupten es sei besser.

---

## 3. AKTUELLER STAND (Stand: 2026-04-18)

**WordPress-Instanz (Local by Flywheel):**
- Site-Root: `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/`
- URL: `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` (HTTPS via self-signed cert)
- Child-Theme: `wp-content/themes/praxiszentrum/` (Parent = Blocksy)
- **PXZ_VERSION: 2.7.2** (Logo +35 % final, Dr. Stracke abgenommen — „Das passt jetzt erst mal")
- WP-CLI (Cluster-Mini-02): `PHP=/Applications/Local.app/Contents/Resources/extraResources/lightning-services/php-8.2.29+0/bin/darwin-arm64/bin/php`
  + `PHAR=/Applications/Local.app/Contents/Resources/extraResources/bin/wp-cli/wp-cli.phar`
  + `SOCK=/Users/cluster-mini-02/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock`
  + Aufruf: `"$PHP" -d memory_limit=512M -d mysqli.default_socket="$SOCK" -d pdo_mysql.default_socket="$SOCK" "$PHAR" --path="$SITE" <cmd>`

**Letzte Session (2026-04-18 v2.6.0) — Task 2: MFA-Bewerbungsformular live**

Dr. Stracke hat Task 1 (v2.5.0: Hero/Standorte/MFA) freigegeben. Task 2 umgesetzt:

1. **Karriere-Seite angelegt** — `/karriere/` (WP-Page-ID 9666) mit
   `template-karriere.php` als Page-Template. Dark-Theme mit Amber-Glow,
   eigener Hero „Werden Sie Teil unseres Teams." + Formular-Card mit
   Anker `#bewerben` (Scroll-Target für den MFA-CTA auf der Homepage).
2. **WPForms-Formular „Bewerbung MFA" programmatisch erzeugt** — Form-ID 9664.
   Felder: Name (Vor/Nachname), E-Mail, Telefon, Nachricht (optional),
   File-Upload (PDF/DOC/JPG, max. 5 Dateien × 10 MB, required), Datenschutz-
   Checkbox mit Link auf `/datenschutz/`. Benachrichtigung an
   `praxis@westend-hausarzt.de`, Reply-To = Bewerber-Mail, File-Upload
   als Anhang. Idempotentes Skript: `tools/create_mfa_form.php`.
3. **Karriere-Page-Inhalt idempotent erstellbar** via
   `tools/create_karriere_page.php` (findet Formular per Marker).
4. **WPForms im Dark-Mode gestylt** — Inputs, Dropzone, Submit-Button
   (Amber-Pill), Checkbox (Amber-Accent), Validation-Messages — alles
   scoped auf `.pxz-kar` (kein Bleed auf andere Seiten, §16.2 respektiert).
5. **Mail-Pipeline in Local bestätigt** — MU-Plugin
   `wp-content/mu-plugins/000-local-mail-redirect.php` leitet auf `.local`-
   Hosts WP-Mail-SMTP an Mailpit (SMTP 10001) um; Production (Outlook) bleibt
   unangetastet. Testmail in Mailpit angekommen: From
   `dev@westend-hausarzt.local` → To `praxis@westend-hausarzt.de`.
6. **Neuer Fehlereintrag PXZ-E-005** — `gdpr-checkbox`-Typ rendert
   programmatisch nicht, wurde durch normalen `checkbox`-Typ mit
   Pflicht-Option ersetzt. Regel: jedes neue Formular visuell verifizieren.

**Verifikation v2.6.0:**
- `tools/verify.sh` grün (Homepage-Regression ausgeschlossen).
- `tools/shoot_karriere.mjs` produziert Desktop/Tablet/Mobile-Shots unter
  `screenshots/claude/2026-04-17_v2.6.0_karriere_*.png`.
- Formular-HTML vorhanden: `wpforms-field-name/email/phone/textarea/file-upload/checkbox`,
  Anker `#bewerben` rendert, Shortcode `[wpforms id="9664"]` eingebettet.

**Status v2.6.0:** ✅ Freigegeben durch Dr. Stracke am 2026-04-18.

---

## Session 2026-04-18 (nachm.) — Sprint 0 / S0.2 CSS-Extraktion (v2.7.4)

**Auftrag Dr. Stracke:** „Erst F (offene Commits abräumen) dann B (Sprint-0-Backlog) dann Session beenden."
Für B wurde die Wahl zwischen S0.2 und S0.3 an Claude delegiert (Effektivität/Effizienz).
Claude entschied sich für **S0.2**, weil es Vorbedingung für S0.3 ist und einen konkreten
Tech-Debt entschuldet (Inline-CSS-Bloat).

### Durchgeführt

**F — Offene Commits:**
- Befund: die in §5 gelisteten „offenen Commits" (s0.4 feat + docs reflect) waren
  bereits erledigt. Nur 2 Verify-Screenshots aus dem Pre-Flight 12:46 untracked.
- Commit Docs-Repo: `67dca8d chore: verify-shots post-v2.7.3 (2026-04-18 12:46 pre-flight)`.

**B — Sprint 0 / S0.2 CSS-Extraktion:**

Theme-Repo (`praxiszentrum/`):
1. `assets/css/homepage.css` neu — 563 Zeilen aus Inline `<style>`-Block von
   `template-homepage.php` 1:1 extrahiert (PHP-Echo im Kommentar durch statischen
   Text ersetzt, CSS-Body unverändert).
2. `assets/css/karriere.css` neu — 291 Zeilen analog aus `template-karriere.php`.
3. `template-homepage.php` — Inline-Block (Zeilen 27–591) entfernt; `$v`-Variable
   für Logo-Cache-Buster bleibt erhalten (wird noch für `logo.svg?v=` verwendet).
4. `template-karriere.php` — Inline-Block + tote `$v`-Zuweisung entfernt.
5. `functions.php` — `wp_enqueue_scripts`-Action erweitert um zwei conditional
   enqueues (`is_page_template()`), Dep auf `'praxiszentrum'` → Cascade-Position
   bleibt identisch zum ehemaligen Inline-Block im Body.
6. `functions.php` — `PXZ_VERSION` 2.7.3 → 2.7.4 (semver-patch, Architektur-
   Infra-Change, keine Optik-Änderung).
7. `CHANGELOG.md` — neuer v2.7.4-Eintrag mit 1:1-Transfer-Vermerk.

Commits Theme-Repo:
- `c3f7db7 feat(s0.2): extract homepage CSS from inline to assets/css/homepage.css`
- `914af8d feat(s0.2): extract karriere CSS; bump PXZ_VERSION 2.7.3 → 2.7.4`

Commit Docs-Repo:
- `7de7ee0 chore: verify-shots from S0.2 extraction (2026-04-18 v2.7.4)`

### Verifikation

| Check | Ergebnis |
|---|---|
| `tools/verify.sh` §1 Split | ✅ keine Dupes `style.css` ↔ `template-homepage.php` (siehe unten, Split-Check kennt noch nicht die neuen `assets/css/*.css` — Nachzügler-Task) |
| `tools/verify.sh` §2 Reset-Scope | ✅ keine generischen Tag-Selektoren mit `!important padding:0` |
| `tools/verify.sh` §3 Computed-Style-Probe | ✅ 54/54 Assertions grün auf Home + Karriere × 3 Viewports |
| `tools/verify.sh` §4 Alignment | ✅ delta = 0px auf allen Showpiece-Elementen |
| `bun run tools/probe-design.mjs` | ✅ 54/54 grün |

### Nexus-Architektur-Update

- `Nexus/_memory/MEMORY.md` — Projektzeile `praxis-redesign` auf v2.7.4 aktualisiert;
  Pfad-Referenz Theme-Repo auf Stand v2.7.4 (914af8d) ergänzt; Pattern-Katalog-Eintrag
  `wp-inline-css-to-external.md` verlinkt.
- `Nexus/_memory/patterns/wp-inline-css-to-external.md` neu — wiederverwendbares
  Pattern für Inline→Extern-CSS-Extraktion in WordPress mit Conditional Enqueue.
- `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/03-inline-css-zu-externer-datei.md`
  neu — Tutorial für Dr. Stracke (Enqueue-System, Cascade-Disziplin, 1:1-Transfer,
  Beweis über Computed-Style-Probe statt Screenshots).
- `_rules/ARCHITECTURE.md` — Kategorie A1 gestrichen (erledigt), Sprint-0-Status
  aktualisiert (S0.2 ✅).

### Offener Nachzügler (nicht blockierend)

**Split-Check-Ausweitung:** `tools/verify.sh` §1 vergleicht aktuell nur `style.css`
gegen `template-homepage.php`. Nach S0.2 könnten sich Selektor-Duplikate in
`assets/css/{homepage,karriere}.css` unbemerkt einschleichen. → in §3 als Front C
gelistet.

---

## Session 2026-04-18 — MFA-Sektion halbiert + Conversion-Text (v2.7.3)

**Auftrag Dr. Stracke:** „Wir suchen Dich"-Container auf ≈ 50 % Höhe der Hero-Sektion bringen UND verkaufsstärkeren Text mit hoher CTA-Conversion. Wahl: **L1** (schlanker CTA-Block, Grid raus) + **T-C** (persönlich, Versprechen, kurz).

**Änderungen v2.7.3:**
- `template-homepage.php` — MFA-Block: `.pxz-mfa-rule` + `.pxz-mfa-grid` (Benefits + Tasks) entfernt. Bleibt: Eyebrow, Titel, Sub, 2 CTAs, Mail-Note.
- `template-homepage.php` Inline-CSS: verwaiste Selektoren `.pxz-mfa-rule`, `.pxz-mfa-grid`, `.pxz-mfa-col-title`, `.pxz-mfa-benefits`, `.pxz-mfa-benefit-h/d`, `.pxz-mfa-tasks`, `.pxz-mfa-task` aufgeräumt.
- `inc/homepage-data.php` — DE/EN/FR/ES Texte auf T-C: Eyebrow „Wir suchen dich · MFA m/w/d", Titel „Hier wirst du **gesehen.**", Subtitle Pull-Faktor mit `„interdisziplinär"`-Highlight, Sekundär-CTA „Mehr über die Stelle". `mfa_benefits[]` und `mfa_tasks[]` bleiben im Daten-Array (nicht gelöscht — verwendbar für spätere Karriere-Seite-Erweiterung).
- `functions.php` — PXZ_VERSION 2.7.2 → 2.7.3.

**Höhen-Beweis (Headless Chrome, Inkognito, cache-disabled):**

| Sektion | v2.7.2 (vorher) | v2.7.3 (nachher) | Delta |
|---|---|---|---|
| MFA Desktop 1440 | 1658 px (113 % Hero) | **864 px (59 % Hero)** | **−794 px (−48 %)** |
| MFA Mobile 430   | 2161 px (272 % Hero) | **884 px (111 % Hero)** | **−1277 px (−59 %)** |

Hero (1474 / 796 px) unverändert.

**Verifikation:**
- `tools/verify.sh` grün (§1 Split + §2 Reset + §3 Computed-Style + §4 Alignment alle ✓).
- AB-Diff via `tools/ab-diff.mjs` (Nachher-Shot + Probe + Alignment grün auf 1440 + 430).
- MFA-Section-Crop: `screenshots/claude/2026-04-18_v2.7.3_mfa_only_{1440,430}.png`.
- Volle After-Shots: `screenshots/claude/2026-04-18_v2.7.3_AB_after_{1440,430}.png`.

**Ziel-Abweichung (transparent):** 50 % wurde nicht exakt getroffen (59 % Desktop). 50 % würde zusätzlich Card-Padding kürzen erfordern (z. B. 112→80 Desktop, ~60 px Gewinn) — als optionale Feinjustage offen.

**Mobile-Hinweis:** Eyebrow „WIR SUCHEN DICH · MFA M/W/D" bricht durch Uppercase + 0.2em letter-spacing in 430 px-Card auf 2 Zeilen um. Nicht fatal, aber kürzbar (z. B. nur „Wir suchen dich" auf Mobile). Klarstellen: Soll nachgeregelt werden?

**Status v2.7.3:** Umsetzung abgeschlossen, Probe grün, wartet auf Browser-Freigabe.

---

## Session 2026-04-18 — Designregeln + visuelle Fixes (v2.6.1 → v2.7.2)

**Dr. Stracke-Abnahme:** v2.7.2 „passt jetzt erst mal". Homepage ist bis
hierhin freigegeben (Hero/MFA/Stats/Fachrichtungen/Team/Service/Standorte/
Final-CTA/Footer + Nav mit großem Logo). Task 2 (Karriere v2.6.0) ist
separat unberührt freigabepflichtig.

### Versionskette dieser Session

| Version | Änderung | Abnahme |
|--------|----------|---------|
| v2.6.0 | Baseline (Karriere + MFA-Formular, Sprint-0-Lösungsdesign) | pending |
| v2.6.1 | Desk-Audit: `.pxz-sect` 160→96 Desktop, `.pxz-mfa-sub` 48→40rem, `.pxz-btn` Mobile-Padding — PXZ-E-006 | zwischen |
| v2.6.2 | Hero+Final-CTA Abstände größer, Standort 2 roter Rahmen + Badge | zwischen |
| v2.6.3 | **Root-Cause-Fix** `.pxz-home :where(p)` statt `.pxz-home p` — Hero-Subtitle + CTAs zentrieren jetzt wirklich — PXZ-E-008 | ✅ |
| v2.7.0 | Logo +54 % (96/128/160 px), Text proportional mit skaliert | zwischen |
| v2.7.1 | Logo max in Nav-Höhe (112/148/184 px), Padding reduziert auf 8/10/12 | zwischen |
| v2.7.2 | **Logo +35 % final** (151/200/248 px), Nav-Höhe wächst proportional | ✅ „passt jetzt" |

### Neue Fehlerkategorien, die NIE mehr passieren dürfen

- **PXZ-E-006 (FK-5)**: alte `DESIGN_GUIDELINES` §3.3 vs. aktuelle §13.4 —
  §3.3 ist ab sofort mit ⚠️ markiert. Regel §16.6: alte Tabellen explizit
  als obsolet kennzeichnen.
- **PXZ-E-007 (FK-1 + Prozess)**: „einige Punkte, die nicht korrigiert
  wurden" wurde als DESIGN_GUIDELINES-Abweichung fehlinterpretiert. Regel:
  PRE_FLIGHT §7b — Aufgaben-Scope in 1 Satz paraphrasieren vor Edit.
  Zusatz: AB-Diff-Beweis mit „fertig"-Meldung mitliefern, keine DevTools-
  Delegation an Dr. Stracke.
- **PXZ-E-008 (FK-5)**: `.pxz-home p { margin: 0 }` hatte Spezifität 0,1,1
  und überschrieb seit Projekt-Start still alle p-Klassen-Margins
  (Hero-Sub, Final-Priv, MFA-Sub, Loc-City, MFA-Email-Note). Fix:
  `:where(p)` macht den Reset spezifitätsneutral. Regel §16.5
  (DESIGN_GUIDELINES).

### Neue/geänderte Tools

- `tools/ab-diff.mjs` — Vorher/Nachher-Shots + Höhen-Delta + Selector-Probe
  + Alignment-Check (Inkognito-Headless, cache-disabled). **Nach jeder
  CSS-Änderung Pflicht.**
- `tools/alignment-probe.mjs` — standalone Spezifitäts-/Alignment-Check für
  Showpiece-Elemente. Lässt sich von `verify.sh --alignment` aufrufen, ist
  Teil von `verify.sh` --all.
- `tools/verify.sh` — erweitert um §4 Alignment-Probe.
- `tools/shoot_karriere.mjs` — zugunsten von `ab-diff.mjs` **deprecated**
  (siehe Datei-Kopf).

### Screenshot-Archivierung

`screenshots/claude/_archive/` enthält alle Test-Shots dieser Session (112
Dateien, ca. 65 MB). Als **aktuelle Baseline** bleiben in `claude/`:
`2026-04-18_v2.7.2_nav_*` + `2026-04-18_v2.7.1_nav_*` + letzter
`verify_desktop/mobile`.

### Offene Backlog-Punkte aus dieser Session

- **CTA-Anschnitt bei exakt 1440 px Viewport:** Logo-Block (248 px) + Nav-Items +
  Right-Block laufen bei genau 1440 px an. Auf ≥ 1500 px unauffällig. Entscheidung
  noch offen, ob Nav-Items-Abstand gekürzt oder Logo-Text leicht kleiner wird.
- **PHP-Deprecation-Warnung:** Plugin `theme-freesia-demo-import` wirft bei
  PHP 8.2 eine Warning (`__wakeup()` public visibility). In Dev sichtbar
  (WP_DEBUG=true), in Prod nicht. Vor Go-Live: Plugin updaten oder entfernen.
- **Sprint-0 `OPEN_DECISIONS.md`** (b)/(c)/(d) weiter offen — durch
  visuelle Detailarbeit diese Session überlagert, keine Antworten.
- **probe-design.mjs EXPECTED-Werte** reflektieren noch v2.5.0-Zeitpunkt —
  ok für Regressionsschutz, könnte Ergänzung um Hero-Sub/Final-CTA-Werte
  vertragen (Sprint 0 / S0.4).

---

**Historie: Session 2026-04-18 v2.6.1 — Desk-Audit Homepage gegen DESIGN_GUIDELINES**

Dr. Stracke-Auftrag: eigenständig die Designregeln durchgehen und offene
Abweichungen auf der Homepage korrigieren. 3 harte Befunde (4-Phasen-Prozess
gemäß WORKING_MODE.md):

1. **`.pxz-sect` Sektions-Padding** (Fachrichtungen/Team/Service/Standorte):
   `96/128/160 px` → **`64/80/96 px`** (§13.4 Standard-Sektion). Desktop war
   +67 % über Soll — Grund für aufgebläht-Eindruck. Neuer
   FEHLERPROTOKOLL-Eintrag `PXZ-E-006` (FK-5 Kontextverlust zwischen §3.3 v2.0
   und §13.4 v2.1).
2. **`.pxz-mfa-sub max-width`**: `48rem` → **`40rem`** (§13.5) +
   `text-wrap: balance` (§15.6 Orphan-Words).
3. **`.pxz-btn` Mobile-Padding**: `14 × 26 px` → **`14 × 28 px`** (§6.1
   Tap-Target-Minimum).

**Verifikation v2.6.1:**
- `tools/verify.sh` grün (Split/Reset/Probe/Shots).
- Ad-hoc-Probe der neuen Werte: `.pxz-sect { paddingTop: 96px }` auf
  Fachrichtungen/Team/Service/Standorte grün; `.pxz-mfa-sub { maxWidth: 640px }`
  grün; `style#pxz-home-v2-6-1` im DOM.
- Screenshots: `screenshots/claude/2026-04-18_v2.6.1_desktop_{full,mfa,fachrichtungen,team,service,standorte}.png`
  + `_mobile_full.png`.

**Status v2.6.1:** Umsetzung abgeschlossen, Probe grün, wartet auf
Browser-Freigabe durch Dr. Stracke. Task 2 (v2.6.0 Karriere) bleibt
freigabe-pflichtig und wird durch v2.6.1 nicht berührt (Karriere-Template
unverändert).

---

**Historie: Session 2026-04-17 v2.5.0 — Hero + Standorte + MFA-Card korrigiert:**

Dr. Stracke-Feedback zu v2.4.0: *„Die Texte in 1 und 3 sind nicht gut positioniert,
Abstände stimmen immer noch nicht, wirkt nicht symmetrisch. Entweder zentral
positionieren oder linksbündig. Bei 2 möchte ich den Container genauso haben wie
bei dem ersten Standort."*

Drei konsistente Batch-Fixes in `template-homepage.php`:

1. **Hero (`.pxz-hero-sub`):** Vollständig zentriert — `text-align: center !important;
   max-width: 36rem; text-wrap: balance/pretty;`.
2. **Standorte (`.pxz-loc-card--main`):** Konsequent linksbündig. Badge
   (`.pxz-loc-badge`) vom `position: absolute` auf Inline-Pill umgestellt
   (auf ALLEN Viewports `position: static`, `display: inline-block`, `margin-bottom: 1.25rem`).
   Header-`padding-right` entfernt, damit der Inhalt nicht mehr asymmetrisch wirkt.
3. **MFA (`.pxz-mfa-card`):** Neue Wrapper-Klasse mit demselben Padding-Scale wie
   Standort-1 (72/96/112 px). Amber-Border + sanftes Shadow + `border-radius: 28px`.
   Zwischen Hero und Grid wurde ein `.pxz-mfa-rule` Trenner (1 px amber) eingefügt.
   HTML: `.pxz-mfa-hero` + `.pxz-mfa-grid` liegen jetzt in einem gemeinsamen
   `<div class="pxz-mfa-card">`.

**Verifikation (alle 3 Viewports grün):**
- `bun run tools/probe-design.mjs` — alle erwarteten Computed-Styles (1440/768/430)
  gematcht: Hero-Sub `textAlign: center`, Standort-Badge `position: static`,
  MFA-Card padding `112/96/72`, Final-Card plain.
- `tools/verify.sh` — Split-Check, Reset-Scope-Check, Screenshots und Probe GREEN.
- Desktop-Slices (Hero/MFA/Standorte/Final) liegen in `screenshots/claude/`.

**Selbstlernendes System (aus v2.4.0, weiterhin aktiv):**
- `_rules/FEHLERPROTOKOLL.md` — PXZ-E-001 bis PXZ-E-004.
- `_rules/PRE_FLIGHT_CHECKLIST.md` — verbindliche Checks vor jedem Deploy.
- `tools/verify.sh` — Split-Check + Reset-Scope-Check + Screenshots + Probe.
- `tools/probe-design.mjs` — Puppeteer-Computed-Style-Probe gegen §13 (v2.5.0 EXPECTED).
- `SESSION_START.md` — 7-Schritt-Einstieg für jede neue Claude-Session.
- `DESIGN_GUIDELINES.md v2.2` — §16 Anti-Patterns auf Implementierungs-Ebene.

**Status v2.5.0:** Umsetzung abgeschlossen, Probe grün, wartet auf Browser-
Freigabe durch Dr. Stracke. KEINE weiteren Code-Änderungen bis zur Freigabe.

**Bekannter, nicht blockierender Minor:** Mobile 430 px — „Bockenheimer Landstraße"
läuft rechts aus dem Container; kein Blocker für Task-1-Freigabe.

---

## 4. OFFENE AUFGABEN (Priorität absteigend)

**Architektur-Ebene (übergeordnet, Stand 2026-04-18 nachm.):**

- **Sprint 0 — Foundation** — bis auf S0.3 abgeschlossen:
  - Entscheidungen freigegeben: b=1 (lokal), c=2 (zwei Repos), d=1 (Deadline halten).
  - ✅ S0.1 Git-Repos (Theme-Repo + Docs-Repo), Baseline-Commits.
  - ✅ **S0.2 CSS-Extraktion (Home + Karriere inline → `assets/css/`) — NEU 2026-04-18 v2.7.4.**
  - ⏸ S0.3 Design-Token-SSoT — Backlog (Sprint-2-Kandidat, Risiko niedrig, additiv).
  - ✅ S0.4 Page-Registry (Home + Karriere), generischer `shoot.mjs`.
  - ⏸ **Nachzügler:** Split-Check in `tools/verify.sh` auf `assets/css/*.css` ausweiten.
- **Sprint 1 — Rollout-Infrastruktur** — noch nicht begonnen.
  - S1.1 Staging (Subdomain Domainfactory oder lokal)
  - S1.2 Backup/Rollback-SOP + Pre-Deploy-Snapshot
  - S1.3 End-to-End-Mail-Test (echte Outlook-SMTP + Anhang)

**Produkt-Ebene (aus HANDOFF_PROMPT.md):**

1. **v2.7.2 Homepage (Logo +35 %)** — ✅ freigegeben 2026-04-18 „passt jetzt erst mal".
2. **Task 2 — v2.6.0 Karriere + MFA-Formular** — ✅ freigegeben 2026-04-18.
3. **Task 1 — v2.5.0** (Hero/Standorte/MFA-Card) ✅ am 2026-04-18 freigegeben.
3. **Task 3 — WPML-Homepage-Duplikate** für EN/FR/ES → läuft als **Sprint 3 / S3.1**
   (siehe `_rules/ARCHITECTURE.md` §4). Nicht vor Sprint 0 beginnen.
4. **Task 4 — Menü „Hauptnavigation"** befüllen.
5. **Task 5 — Phase 4 Rollout** Design-System auf 172 Seiten.
6. **Task 6 — Phase 5 Go-Live** QA / SEO / Schema / Formulare / Staging→Live.
7. **Task 7 — 11 Blogposts** überarbeiten + Content-Pipeline.
8. **Task 8 — Echte Fotos** für 6 Ärzte (Barcsay, Seelig, Jawich, Shahin, Landeberg, Arbitmann).

**Deadline:** Go-Live innerhalb 48 h (ursprünglich ab Session-Start).

---

## Session 2026-04-18 — Sprint 0 Minimal-Scope umgesetzt (S0.1 + S0.4)

**Auftrag Dr. Stracke:** Front A mit b=1 (Git lokal), c=2 (zwei Repos), d=1 (Deadline halten).

### S0.1 — Zwei lokale Git-Repos

**Repo A — Theme** (`wp-content/themes/praxiszentrum/`)
- Neu: `.gitignore`, `CHANGELOG.md` (Pre-Git-Historie v2.5.0…v2.7.3 + PXZ_VERSION-Bump-Policy), `README.md` (Setup + WP-CLI-Aufrufmuster + Struktur).
- `git init -b main`, Baseline-Commit `8c9d0fa`: `chore: baseline v2.7.3 (homepage + karriere + mfa-formular)`.
- 10 Dateien im Commit, `git status` sauber.

**Repo B — Docs/Tools** (`~/Cortex/projects/praxis-redesign/`)
- Neu: `.gitignore` (`node_modules/`, `.DS_Store`, `*.log`, `screenshots/_archive/`, `screenshots/claude/_archive/`).
- `git init -b main`, Baseline-Commit `2f288a3`: `chore: baseline Sprint-0 start (docs + verify tools, post-v2.7.3)`.
- 87 Dateien im Commit, 28 MB komprimiert, `git status` sauber.
- Kein Remote (b=1).

### S0.4 — Verify-Pipeline auf Page-Registry

**Neue Dateien in `tools/`:**
- `page-registry.mjs` — Export `pages = [{slug, url, viewports, expected, exists}]`. Initial: Home + Karriere, 3 Viewports.
- `shoot.mjs` — Generischer Screenshot-Runner mit `--slug=` / `--ver=` Flags.

**Refactor:**
- `probe-design.mjs` — liest Registry statt hartkodierte Home-Map. Neu: `exists`-Liste pro Page (DOM-Existenz-Check). `--slug=` Flag zum Isolieren einer Page.

**Gelöscht:** `shoot_karriere.mjs` (ersetzt durch `shoot.mjs`).

**Karriere-EXPECTED ad-hoc vermessen:**
- `.pxz-kar-card` padding-top 112/96/72, padding-left/right 96/72/40
- `.pxz-kar-eyebrow` color `rgb(245, 184, 0)` auf allen Viewports
- DOM-Existenz: `.pxz-kar-hero`, `.pxz-kar-card`, `form[id^='wpforms-form-']`, alle 6 WPForms-Felder inkl. DSGVO-Checkbox mit `required` (PXZ-E-005-Schutz)

### Verifikation

- `bun run tools/probe-design.mjs` — **54 Assertions grün** auf 2 Pages × 3 Viewports.
- `bun run tools/shoot.mjs --slug=home --ver=2.7.3` — 3 Shots gespeichert.
- `bun run tools/shoot.mjs --slug=karriere --ver=2.6.0` — 3 Shots gespeichert.
- `tools/verify.sh` — alle 4 Checks grün (Split, Reset, Computed-Style, Alignment).

### Docs-Pflege

- `_rules/ARCHITECTURE.md` — tools-Tree + SOLL/IST-Tabelle + Sprint-0-Status + Artefakte-Tabelle auf neuen Stand.
- `SESSION_RESUME.md` — §1 Stand, §3 Fronten-Liste, §5 Session-Block (diese), §4 Tasks-Block aktualisiert.
- `Nexus/_memory/MEMORY.md` — Projekt-Status-Zeile praxis-redesign.

### Offene Commits (nach S0.4)

Die Docs-Änderungen + S0.4-Tool-Dateien liegen in Repo B und brauchen noch ihre Commits:
- `feat(s0.4): page registry + generic probe/shoot; remove shoot_karriere`
- `docs: reflect sprint-0 minimal-scope completion`

---

## 5. SESSION-EFFIZIENZ-KONZEPT (vom Nutzer gefordert)

Dr. Stracke hat verlangt, ein Konzept zu entwickeln, damit redundante Sessions
endlich effektiv werden. Grundregeln:

1. **Rules-First-Prinzip:** Jede Kritik wird sofort als Regel in
   DESIGN_GUIDELINES.md §15 „Anti-Patterns" dokumentiert. Keine Kritik darf
   zweimal geäußert werden müssen.
2. **Batch-Fixes statt Einzelfixes:** Wenn ein Problem auftritt, systematisch
   alle verwandten Stellen gleichzeitig korrigieren.
3. **Pflicht-Verifizierung:** Nach jeder sichtbaren Änderung Chrome-Headless-
   Screenshot. Desktop 1440 + Mobile 390, in Sektions-Slices.
4. **Screenshot-Ordnung:**
   - Dr. Stracke legt Referenzbilder als `1.png, 2.png…` in `screenshots/` ab.
   - Claude legt Verifikationen in `screenshots/claude/` mit Schema
     `YYYY-MM-DD_vX.X.X_device_NN_section.png` ab.
   - Alles Alte wandert in `_archive/`.
5. **Keine Zwischenfragen bei klaren Aufgaben.** Dr. Stracke trifft strategische
   Entscheidungen; Claude arbeitet autonom durch die Umsetzung.
6. **Abschlussbericht pro Batch** mit WAS geändert / WARUM / Vorher-Nachher-
   Screenshots — dann warten auf Freigabe.

---

## 6. ERSTER SCHRITT IN DER NEUEN SESSION (Stand 2026-04-18)

Kurzform:

1. **Alle Pflicht-Dateien aus Abschnitt 1 dieses Dokuments lesen** — insbesondere
   die neuen `WORKING_MODE.md` + `ARCHITECTURE.md`, sowie
   `specs/sprint-0/README.md` und `specs/sprint-0/OPEN_DECISIONS.md`.
2. `screenshots/` prüfen: neue Referenzbilder von Dr. Stracke?
3. **`tools/verify.sh` ausführen (nur lesend)** — muss OK sein (v2.6.0 ist grün).
4. Status-Statement an Dr. Stracke im **Architekten-Stil** (präzise, strukturiert,
   keine Fülltexte):
   - Aktuelle Version: **v2.6.0** (Karriere-Seite + MFA-Formular live).
   - Task 2 wartet auf Browser-Freigabe durch Dr. Stracke.
   - Sprint 0 (Architektur-Foundation) wartet auf Antworten zu
     `specs/sprint-0/OPEN_DECISIONS.md` (b), (c), (d).
5. **KEINE Code-Änderungen, bis:**
   - Task 2 freigegeben **und**
   - Sprint-0-Entscheidungen (b)(c)(d) beantwortet.
6. Nach Freigabe beider: Sprint 0 gemäß `specs/sprint-0/README.md` starten,
   streng nach `WORKING_MODE.md` (4-Phasen-Prozess).
7. Ende der Session: `SESSION_RESUME.md` aktualisieren, ggf. neue Specs unter
   `specs/<sprint>/<task>.md` anlegen.

---

## 7. KRITISCHE KONTAKTDATEN

- Hauptstandort: Grüneburgweg 12, 60322 Frankfurt am Main
- Zweitstandort: Bockenheimer Landstraße, 60323 Frankfurt am Main
- Kasse: 069 247 574 523 · Privat: 069 247 574 526
- E-Mail: praxis@westend-hausarzt.de

---

## 8. ABSOLUTE VERBOTE (DESIGN_GUIDELINES §1.1 + §15)

- NIE schwarzer Text auf dunklem Hintergrund
- NIE Text, der erst bei Hover sichtbar wird
- NIE opacity < 0.95 auf Fließtext
- NIE Text, der am Card-Border klebt (mind. 72px Mobile / 96px Tablet / 112px Desktop)
- NIE Eyebrows direkt gegen den oberen Card-Rand
- NIE Sektionen-Padding > 96px Desktop bei CTA/Formular-Bereichen
