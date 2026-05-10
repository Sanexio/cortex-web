# AGENTS.md — Cortex-Web

> Onboarding für nicht-Claude-KIs (Codex, Cursor, Cline, Continue,
> Gemini-CLI, etc.). Diese Datei wird von den meisten Coding-Agenten
> automatisch beim Workspace-Open gelesen.

---

## Kontext in einem Absatz

Cortex-Web ist das Dach-Projekt von Dr. Stracke (Internist, Praxisinhaber,
Sanexio GmbH) für zwei rechtlich getrennte Webseiten mit gemeinsamem
Trunk: `praxis-webseite` (WordPress, `westend-hausarzt.com`) und
`juvantis-shopify` (Shopify, `sanexio.eu`). Plattformen bleiben getrennt
(Impressum, DSGVO, Domain), Substanz wird geteilt (Trunk-Schema, Medien,
Design-Tokens).

Dieses Projekt ist Teil eines größeren Cortex/Nexus-Ökosystems unter
`~/Cortex/`. Du arbeitest in `~/Cortex/projects/Cortex-Web/`.

---

## Hard Boundaries (lies das zuerst)

1. **Schreibe niemals außerhalb dieses Repos.** Insbesondere nicht in:
   - `~/Cortex/Nexus/` (Wissens-Stammhirn, exklusiv Claude-managed)
   - `~/.claude/` (Claude-Code-Konfiguration)
   - `~/.config/`, `~/.ssh/`, `~/Library/`
2. **Keine Secrets committen.** `.env`, `.env.*` (außer `*.template`)
   sind via `.gitignore` blockiert. Wenn du Secrets brauchst, frag
   den User explizit nach Werten — niemals raten oder ableiten.
3. **HWG-/Berufsordnung** ist relevant für `sites/praxis-webseite/`:
   keine Preise nennen, kein Anpreisen von Behandlungen, keine
   irreführende Werbung. Im Zweifel: Inhalt vorlegen, nicht publishen.
4. **GitHub ist Truth.** Vor Arbeit `git pull --ff-only`, nach Arbeit
   `commit + push`. Es kann sein, dass parallel auf einem anderen Mac
   gearbeitet wird — bei Konflikt: STOP und melden.

---

## Verzeichnis-Übersicht

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
├── adapters/                ← Plattform-Adapter (WordPress, Shopify)
├── docs/                    ← Doku
├── sites/
│   ├── praxis-webseite/     ← WordPress-Theme + Content
│   ├── juvantis-shopify/    ← Shopify-Theme + Content
│   └── sanexio-github-io/   ← GitHub-Pages-Beistand
├── trunk/                   ← Geteilte Substanz (Produkt-Schemas, Medien-Refs)
├── tools/                   ← Build-/Sync-Skripte
└── specs/                   ← Sprint-Specs
```

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

Volle Spec: `sites/praxis-webseite/_rules/WORKING_MODE.md` (FK-1…FK-5).

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
- HTML/Content: gemäß Site-Sprache. praxis-webseite ist primär DE +
  EN/FR/ES/IT/pt-PT i18n.

---

## Wenn du nicht weiterkommst

1. Lies `SESSION_RESUME.md` — dort steht der zuletzt definierte Schritt.
2. Lies `_rules/ARCHITECTURE.md` für die große Linie.
3. Frag den User direkt — keine Antwort raten, wenn der Fakt nicht
   im Repo oder in Connexio steht.

---

## Was Claude separat tut (nicht dein Bereich)

Claude (im `~/Cortex/Nexus/` als Stammhirn) pflegt:
- Goldene Regeln, User-Profil, Memory-DB
- Mode-State (autonomy/safe), Tier-3-Hardstops
- Cron, Telegram-Bridge, Spawn-Watcher
- Vault `Second Brain/`

Berühre das nicht. Wenn du den Eindruck hast, eine Regel ist veraltet
oder fehlt, **schreibe sie nicht in Nexus** — melde es dem User, er
oder Claude pflegt es nach.

---

*v1 — 2026-05-10. Erstellt im Rahmen des Multi-Device-Multi-AI-Konzepts
(`Nexus/specs/multi-device-multi-ai/00_KONZEPT.md`).*
