# SESSION_RESUME — sites/juvantis-webseite/

> Pflichtformat nach `Nexus/_rules/SESSION_LIFECYCLE.md §3`.
> Diese Datei ist der LL-043-Einstieg, wenn Dr. Stracke künftig innerhalb
> Cortex-Web mit dieser Sub-Site arbeitet.
>
> **Stand 2026-04-19 (Ende Phase 5):** Site gerade frisch subsumiert. Noch
> kein eigenständiger Sprint-Plan — Juvantis-Web wird vorerst im Juvantis-
> Workstream (Theme-Klon-Edits) weiterbearbeitet. Dach-Integration startet,
> sobald Trunk-Content für Juvantis-Produkte über den Shopify-Adapter gerendert
> werden soll (Phase-2-POC war `basic-check`, weitere Produkte folgen bei Bedarf).

---

## §1 Stand & Version

- **Site-Pfad:** `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/`
- **Theme-Pfad:** `~/Cortex/projects/Juvantis/juvantis-web/theme/` (unverändert,
  siehe `SHOPIFY_THEME_POINTER.md`)
- **Live-URL:** https://sanexio.eu/
- **Admin:** https://admin.shopify.com/store/medzpoint
- **Theme-HEAD (Stand Phase-5-Abschluss):** `1fbc35b` (`Update from Shopify for theme JUVANTIS/shopify-theme`)
- **Cortex-Web-Version bei Subsumierung:** v0.6.0 (Session 7, 2026-04-19)

## §2 Pflicht-Init für „Projekt fortsetzen"

Wenn Dr. Stracke explizit diese Sub-Site fortsetzen möchte:

1. Nexus-Pflicht-Init (`Nexus/CLAUDE.md` + `_memory/MEMORY.md` +
   `_rules/GLOBAL_RULES.md` + `_rules/SESSION_LIFECYCLE.md`).
2. Cortex-Web-Dach-Init (`Cortex-Web/CLAUDE.md` + `Cortex-Web/SESSION_RESUME.md` +
   `Cortex-Web/_rules/ARCHITECTURE.md` + `Cortex-Web/_config/RULES.md`).
3. Diese Datei.
4. `sites/juvantis-webseite/SHOPIFY_THEME_POINTER.md` (Theme-Topologie).
5. `sites/juvantis-webseite/README.md`.
6. `Juvantis/_config/RULES.md` — Shopify-Deploy-Regeln (R-007 … R-018).

## §3 Pre-Flight-Befehl

```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```

Für Theme-Connectivity-Check (noch nicht automatisiert):

```bash
# Smoke-Test Store erreichbar:
curl -s -o /dev/null -w "%{http_code}\n" https://sanexio.eu/
# → erwartet: 200

# Theme-Repo-Stand:
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme rev-parse HEAD
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme status --short
```

## §4 Letzte Session — Phase 5 (2026-04-19, Session 7)

### Ziel
Subsumierung der Juvantis-Web-Konzeptschicht nach `sites/juvantis-webseite/`,
analog zum Phase-4-Pattern, ohne den Shopify-Theme-Klon anzufassen.

### Durchgeführt
- Transfer: `shopify-sync.sh` (mit absolutem Theme-Pfad-Patch), `shopify_export/`,
  `knowledge-graph/` aus `Juvantis/juvantis-web/` → `sites/juvantis-webseite/`.
- `SHOPIFY_THEME_POINTER.md` erzeugt (Remote-Repo-Variante: GitHub-URL, Branch
  `shopify-theme`, Store `medzpoint`, Theme-ID `181128757515`, Auto-Sync).
- README + diese SESSION_RESUME angelegt.
- Pfad-Referenz-Updates in Nexus + Cortex-Web.
- Juvantis-Projekt-Doku (`Juvantis/CLAUDE.md`, `_config/RULES.md`) angepasst.
- Theme-Repo **unverändert**: HEAD `1fbc35b`, status clean (verifiziert).

### Verifiziert
- Cortex-Web `tools/validate.sh` ✅
- Theme-Repo HEAD stabil (AK-5 grün)
- Self-Check `specs/phase-5/evidence/2026-04-19_self-check.md` — AK-Tabelle

## §5 Offene Tasks (Priorität absteigend)

### P0 — Content-Trunk für Juvantis-Produkte
Weitere YAML-Produktquellen in `Cortex-Web/trunk/content/products/` pflegen
(POC `basic-check.yaml` ist exemplarisch; Body Checks, Bluttests, DHT gehören
noch eingeführt). Jedes neue Produkt wird via `adapters/shopify/` als
Draft-Produkt in den Store gerendert und via Admin freigegeben.

### P1 — Medien-Pipeline (Phase 2b, verschoben aus Phase-5-Plan)
`trunk/media/registry.yaml` befüllen, `_media-source/` strukturieren, Upload-
Skript gegen Shopify Files bauen. Blockiert keine anderen Sprints.

### P2 — Theme-Sync-Workflow dokumentieren
Tutorial-Update: wie arbeite ich weiter am Theme bei `Juvantis/juvantis-web/theme/`,
wenn Deploy-Skript jetzt bei `Cortex-Web/sites/juvantis-webseite/` liegt?
(Thema für spätere Session — kein akuter Blocker.)

## §6 Sofort-Status-Frage für nächste Session

> Juvantis-Web ist unter Cortex-Web subsumiert. Theme bleibt bei
> `Juvantis/juvantis-web/theme/` (Shopify-GitHub-Integration unberührt).
> **Was möchten Sie machen?**
>
> A. Neues Produkt in Trunk + Shopify-Adapter-Run (Draft im Store).
> B. Medien-Pipeline Phase 2b (Trunk-Media + Shopify-Files-Upload).
> C. Theme-Edit am klassischen Juvantis-Pfad (keine Dach-Interaktion nötig).
> D. Etwas anderes.

## §7 Verbote / harte Regeln — dürfen NIE passieren

### Theme-Repo-Schutz (Phase 5 spezifisch)
- **Kein Commit, kein Merge, kein Push** in `Juvantis/juvantis-web/theme/`
  aus einer Cortex-Web-Session heraus ohne explizites Dr.-Stracke-Go.
- **Kein Eingriff in die Shopify-GitHub-Integration** (Branch-Weichen,
  Webhook-Konfig etc.) — das ist außerhalb Cortex-Web-Scope.
- **Kein Push** mit `shopify-sync.sh` ohne explizites Go, wenn Store-Inhalte
  verändert werden. Pull-Ops sind lesend und unbedenklich.

### Allgemein (aus Cortex-Web übernommen)
- **Trunk ist Master (CW-001).** Content-Änderung im Trunk + Adapter-Run,
  nicht direkt im Shopify-Admin.
- **Plattform-Trennung (CW-005).** Juvantis darf Preise und Kauf-CTAs haben;
  Praxis nicht.
- **Keine Secrets im Chat oder im Repo** (Admin-API-Token liegt in
  `Cortex-Web/.env.local`, chmod 600, gitignored).
- **Kein `--force` bei Git** ohne Go.

---

## §8 Historie

| Session | Datum | Phase | Ergebnis |
|---------|-------|:-----:|----------|
| — | — | vor Cortex-Web | Theme lebte als `Juvantis/juvantis-web/theme/`, Docs bei `Juvantis/juvantis-web/` |
| 7 | 2026-04-19 | 5 (Subsumierung) | Konzeptschicht in `sites/juvantis-webseite/`, Theme unverändert |

---

*Stand: 2026-04-19, Ende Phase 5.*
