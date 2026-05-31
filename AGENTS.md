# AGENTS.md — Cortex-Web

> Onboarding für nicht-Claude-KIs (Codex, Cursor, Cline, Continue,
> Gemini-CLI, etc.). Diese Datei wird von den meisten Coding-Agenten
> automatisch beim Workspace-Open gelesen.

---

## Kontext in einem Absatz

Cortex-Web ist seit Welle 1.3+1.5b (Mai 2026) ein OSS-Framework-Repo
(`Sanexio/cortex-web`) für Multi-Site-Trunk-Architekturen: Schemas,
Adapter (WordPress + Shopify), Tools, Trunk-Generika, Slot-Definitionen.
**Tenant-eigene Sites leben NICHT in diesem Repo** — sie liegen im
privaten Tenant-Repo `Sanexio/sanexio-tenant`, dessen Pfad via Env-Var
`CORTEX_TENANT_DIR` (oder Fallback `~/.cortex/tenant-path`) aufgelöst
wird. Helper-Trio: `tools/lib/tenant-path.{sh,mjs}` +
`tools/lib/theme-path.mjs` + `tools/lib/tenant-config.mjs`.

Konkret treibt das Framework heute zwei rechtlich getrennte
Stracke-Sites (im Tenant): `praxis-webseite` (WordPress,
`westend-hausarzt.com`) und `juvantis-webseite` (Shopify,
`sanexio.eu`). Plattformen bleiben getrennt (Impressum, DSGVO, Domain),
Substanz wird über den Trunk geteilt.

Dieses Projekt ist Teil eines größeren Cortex/Nexus-Ökosystems unter
`~/Cortex/`. Du arbeitest in `~/Cortex/projects/Cortex-Web/`.

---

## Hard Boundaries (lies das zuerst)

1. **Kein direkter Filesystem-Schreibzugriff außerhalb dieses Repos.**
   Insbesondere nicht in:
   - `~/Cortex/Nexus/` (R2 — Nexus-Kern, Filesystem-Schreiben durch
     Codex/Cursor/andere KIs verboten, **siehe 1a** für den erlaubten
     Vorschlagsweg)
   - `~/.claude/` (Claude-Code-Konfiguration)
   - `~/.config/`, `~/.ssh/`, `~/Library/`, alles ausserhalb `~/Cortex/`
1a. **Erlaubter Nexus-Vorschlagsweg (neu seit 2026-05-12):** Wenn du eine
   Nexus-Regel/Spec/Aenderung anregen willst, schreibe einen Vorschlag
   als Datei nach `~/Cortex/projects/_ai-cooperation-outbox/` (Format:
   `YYYY-MM-DD_codex-to-claude_<topic>.md`). Du darfst nicht selbst in
   Nexus schreiben, committen, mergen oder pushen. Claude und Dr.
   Stracke reviewen, finale Umsetzung durch Stracke-Freigabe. Details:
   `Nexus/_rules/AI_COOPERATION.md` + `MULTI_AI_BOUNDARIES.md` (v2).
2. **Keine Secrets committen.** `.env`, `.env.*` (außer `*.template`)
   sind via `.gitignore` blockiert. Wenn du Secrets brauchst, frag
   den User explizit nach Werten — niemals raten oder ableiten.
3. **HWG-/Berufsordnung** ist relevant für die
   Stracke-Praxis-Site (`${CORTEX_TENANT_DIR}/sites/praxis-webseite/`):
   keine Preise nennen, kein Anpreisen von Behandlungen, keine
   irreführende Werbung. Im Zweifel: Inhalt vorlegen, nicht publishen.
4. **GitHub ist Truth.** Vor Arbeit `git pull --ff-only`, nach Arbeit
   `commit + push`. Es kann sein, dass parallel auf einem anderen Mac
   gearbeitet wird — bei Konflikt: STOP und melden.
5. **Live-Push (`.com`-Production-Domain) niemals autonom.** Lokale
   Edits und GitHub-Pushes sind wellenweise OK; ein Push auf die
   Live-Domain passiert nur auf explizite User-Ansage.

---

## Verzeichnis-Übersicht

Framework-Repo `Sanexio/cortex-web` (das hier):

```
Cortex-Web/
├── AGENTS.md                ← diese Datei
├── CLAUDE.md                ← Claude-spezifische Instruktionen (du darfst lesen)
├── PROJECT.md               ← Projekt-Charta
├── SESSION_RESUME.md        ← Wiederaufnahme-Punkt für die nächste Session
├── _rules/                  ← Architektur, Working Mode, Konventionen
├── _config/                 ← Trunk-Konfig, Schema-Definitionen
├── _media-source/           ← Lokale Medien-Originale (gitignored)
├── _archive/                ← Alte Sessions, archivierte Artefakte
├── _integration-slots/      ← Slot-Spezifikationen für Tenant-Sub-Projekte
├── adapters/                ← Plattform-Adapter (WordPress, Shopify, Astro)
├── docs/                    ← Doku
├── sites/                   ← nur Framework-Stub-Sites:
│   ├── _examples/           ← Demo-Tenant-Slot-Stub
│   ├── sanexio-github-io/   ← öffentliches Sanexio-GitHub-Pages-Skelett (OSS)
│   └── workforce-time/      ← Generika-Slot (post-Promotion)
├── trunk/                   ← Geteilte Substanz (Produkt-Schemas, Medien-Refs)
├── tools/                   ← Build-/Sync-Skripte + Helper-Trio (lib/)
└── specs/                   ← Sprint-Specs
```

Tenant-Repo `Sanexio/sanexio-tenant` (privat, separates Git-Repo;
Pfad via `CORTEX_TENANT_DIR`-Env oder `~/.cortex/tenant-path`):

```
Sanexio-Tenant/
├── tenant.config.json       ← funktionale Tenant-Konstanten
└── sites/
    ├── praxis-webseite/     ← WordPress-Theme + Content (Stracke)
    └── juvantis-webseite/   ← Shopify-Theme + Content (Stracke)
```

Cortex-Web-Adapter dürfen Tenant-Inhalte **niemals hartkodiert über
`sites/praxis-webseite/...`** lesen — immer über das Helper-Trio
`tools/lib/tenant-path.{sh,mjs}` + `tenant-config.mjs`.

---

## Cortex-Wissen lesen (read-only)

Wenn du Hintergrund zu einem Projekt, einer Goldenen Regel oder einem
User-Profil-Detail brauchst, **greife nicht auf `~/Cortex/Nexus/` direkt
zu**. Stattdessen Connexio (MCP-Server, lokal):

- Tool-Aufruf (sofern in deinem MCP-Setup registriert):
  `mcp__connexio_readonly__get_project("cortex-web")`
- HTTP (loopback): `curl -H "X-Connexio-Key: $KEY" http://127.0.0.1:7766/context?project=cortex-web`

Verfügbare Connexio-Tools:
- `get_user_profile()` — Dr.-Stracke-Profil
- `list_projects()` — alle aktiven Projekte
- `get_project(id)` — Projekt-Stand + SESSION_RESUME
- `get_golden_rules()` — destillierte Cortex-Regeln
- `search_patterns(query, project=…)` — Vault-FTS5
- `get_recent_sessions(project, limit=5)` — Session-Summaries
- `get_tutorial(domain)` — Vault-Tutorials

Connexio ist hardcoded read-only (SQLite `mode=ro`, Pfad-Whitelist,
medizin/patient/steuer/secret-Tags blockiert). Schreibversuche schlagen
auf DB-Ebene fehl — kein Workaround nötig oder möglich.

---

## Working Mode

Dieses Projekt arbeitet im **Architekten-Modus**:
1. Verständnis (Pflicht-Dateien lesen, Bestand verstehen)
2. Lösungsdesign (Spec, kurz, Approval einholen)
3. Umsetzung (kleine Schritte, jeder verifiziert)
4. Selbstprüfung (Smoke-Test, Diff-Audit)

Volle Spec: `${CORTEX_TENANT_DIR}/sites/praxis-webseite/_rules/WORKING_MODE.md`
(FK-1…FK-5; Datei liegt im Tenant-Repo).

Wichtig: **„Fertig" = funktionstüchtig**, nicht „Datei abgelegt". Wenn
du ein Feature umsetzt, teste es auch.

---

## Sprache & Stil

- Antworten an den User: **Deutsch**, vollständiges Hochdeutsch, keine
  Umgangssprache.
- Code-Kommentare: **Englisch**, sparsam, nur bei nicht-trivialer
  Logik.
- Commits: deutsche Beschreibung, Prefix nach Convention (`feat`, `fix`,
  `chore`, `refactor`, …) — siehe `git log --oneline | head -20` für
  bestehenden Stil.
- HTML/Content: gemäß Site-Sprache. Stracke-praxis-webseite ist
  primär DE + EN/FR/ES/IT/pt-PT i18n.

---

## Wenn du nicht weiterkommst

1. Lies `SESSION_RESUME.md` — dort steht der zuletzt definierte Schritt.
2. Lies `_rules/ARCHITECTURE.md` für die große Linie.
3. Frag den User direkt — keine Antwort raten, wenn der Fakt nicht
   im Repo oder in Connexio steht.

---

## Was Claude separat tut (Umsetzungs-Agent fuer Nexus)

Claude pflegt im Auftrag von Dr. Stracke (kein alleiniger Gatekeeper):
- Regeldateien unter `~/Cortex/Nexus/_rules/`
- Specs unter `~/Cortex/Nexus/specs/`
- User-Profil, Memory-DB, Mode-State (`autonomy`/`safe`)
- Cron-Recipes, Gateway, Connexio
- Vault `Second Brain/`

Codex und Claude sind **Peer-Reviewer** fuer Nexus-Vorschlaege. Wenn du
eine Regel veraltet findest oder eine neue Regel vorschlaegst:

1. Schreibe einen Vorschlag in
   `~/Cortex/projects/_ai-cooperation-outbox/` (Outbox-Konvention).
2. Claude reviewt, Dr. Stracke gibt frei, Claude oder Stracke setzt um.
3. Nicht selbst in Nexus committen.

---

*v2 — 2026-05-12. Praezisiert Boundary nach Welle 1 + Welle 2 (Phoenix-
Cleanup). Frueheres v1 vom 2026-05-10 hatte harte Claude-Exklusivitaet,
v2 erlaubt strukturierten Codex-Vorschlagsweg ueber Outbox.*
