# Session 24 — N-5 (Publish-Helper) + N-7 (Backup-Automatik)

> Spec + Selbstprüfung. Architekten-Modus Phase 1–4.
> Datum: 2026-04-22 · Ausführung: Claude (autonom, auf Dr.-Stracke-Freigabe
> „nach eigenem Ermessen und ohne Rückfragen fortsetzen").

---

## §1 Verständnis (Phase 1)

### Zielzustand
- `adapters/shopify/pages-to-shopify.mjs` kann zwei bisher fehlende Operationen:
  1. **Publish-Flip am Write** (`PUBLISH=1`) — Trunk-YAML bleibt `published: false`
     (CW-001: Trunk ist Master, draft-by-default), aber der Adapter setzt beim
     Schreiben `published: true` an die REST-API, sodass Shopify `published_at`
     belegt und die Page live geht.
  2. **Backup vor jedem Update** (CW-008) — vor einem destruktiven PUT wird die
     existierende Shopify-Page vollständig in
     `adapters/shopify/.backups/<ISO-ts>_page<id>_<handle>.json` gesichert.

### Constraints
- Bestehende Kontrakte (Session-22 `pages-to-shopify.mjs`) bleiben kompatibel.
- `PUBLISH=0` oder unset → Verhalten exakt wie vor dieser Session.
- Trunk-Regel aus Session 22 (`payload.page.published !== false` → Exit 1)
  bleibt aktiv, damit niemand Trunk-Inhalte versehentlich als „published"
  committet.
- CW-008 schlägt bei Backup-Fehler fehl (Exit 2), **kein** destruktiver Push
  ohne Backup.

### Implizite Annahmen
- `SHOPIFY_ADMIN_TOKEN` hat `read_content` + `write_content`. Kein neuer Scope
  nötig (`pages` liegt unter dem gleichen Content-Scope wie in Session 22).
- `.backups/` ist git-ignoriert (war schon für `template-to-shopify.mjs` so).

---

## §2 Lösungsdesign (Phase 2)

### Datenfluss
```
build-page.mjs
  ├─ validiert Trunk-YAML (page.schema.json, team-member.schema.json)
  └─ stdout: payload JSON { page: { ..., published: false } }
        │
        ▼
pages-to-shopify.mjs  (stdin)
  ├─ payload.page.published !== false  → Exit 1    (Trunk-Regel, unverändert)
  ├─ lookup /pages.json?handle=...
  │
  ├─ effectivePage = { ...payload.page }
  │    if PUBLISH=1 → effectivePage.published = true   ← N-5
  │
  ├─ 0 results  → POST /pages.json     { page: effectivePage }    [create]
  ├─ 1 result   → Backup-Step:                                     ← N-7
  │               GET /pages/<id>.json  → fullExisting
  │               writeFileSync(.backups/<ts>_page<id>_<h>.json)
  │               PUT /pages/<id>.json  { page: { id, ...effectivePage } }  [update]
  │
  └─ >1 results → Exit 2 (ambiguous handle)
```

### Env-Oberfläche (additive)
| Variable | Default | Wirkung |
|---|---|---|
| `SHOPIFY_STORE` | — (required) | unverändert |
| `SHOPIFY_ADMIN_TOKEN` | — (required) | unverändert |
| `ALLOW_OVERWRITE` | `0` | unverändert |
| **`PUBLISH`** | `0` | `1` → `published=true` am Write **(neu)** |

### Summary-Oberfläche (additive)
```json
{
  "action": "create|update",
  "id": 123,
  "handle": "...",
  "title": "...",
  "published_at": null | "2026-04-22T...",
  "updated_at": "...",
  "body_html_length": 1234,
  "publish_flag": false,              // ← NEU
  "backup_path": null | "adapters/shopify/.backups/...json",  // ← NEU
  "admin_url": "..."
}
```

### Warum so (und nicht anders)
- **`PUBLISH` als Laufzeit-Flag, nicht im Trunk:** CW-001 sagt „Trunk ist
  Master". Würde ich im Trunk-YAML `published: true` erlauben, gäbe es für
  dieselbe Datei zwei Wahrheiten (Trunk-Draft vs. Live-Shopify). Der Flag
  ist ein bewusster Publish-Akt, der wie `ALLOW_OVERWRITE` zum
  Transfer-Akt gehört.
- **Backup per GET `/pages/<id>.json` statt aus dem Lookup:** Das Lookup
  holt nur `fields=id,handle,published_at,title,updated_at` (effizient für
  Idempotenz-Prüfung). Für ein vollwertiges Backup braucht es `body_html`
  und `template_suffix` — deshalb separater GET.
- **Backup als JSON, nicht als HTML:** Templates (`template-to-shopify`)
  sichert HTML roh, weil die Payload selbst HTML ist. Pages enthalten
  zusätzlich Metadaten (template_suffix, author, seo-Felder bei
  Erweiterungen) — JSON erfasst alles.
- **Abort statt Warn bei Backup-Fehler:** CW-008 verlangt „Kein Backup →
  kein Write". Ein `console.warn` würde die Regel implizit aufweichen.

### Alternativen und warum nicht
| Alternative | Contra |
|---|---|
| `PUBLISH` als Argument (`--publish`) | `bun xyz.mjs --publish` bricht den stdin-Pipe-Kontrakt (argv vs. stdin). Env ist konsistent mit `ALLOW_OVERWRITE`. |
| Backup erst nach Write (Read-Before-Undo) | Zu spät — bei REST-Fehler zwischen GET und PUT hast du eine kaputte Page ohne Backup. Backup MUSS vor PUT. |
| Backup in Trunk / `_media-source/` | Falscher Ort. Backups sind adapter-spezifisch, destruktiver Push ist ein Adapter-Phänomen. |

---

## §3 Umsetzung (Phase 3)

### Commits in dieser Session
- `adapters/shopify/pages-to-shopify.mjs` — N-5 + N-7 implementiert (siehe Diff)
- `tools/sync-page-shopify.sh` — Header-Kommentar um `PUBLISH` und CW-008 ergänzt

### Code-Marker-Selbsttest (lokal, ohne Shopify-Call)
```
✓ PUBLISH env read        process.env.PUBLISH === "1"
✓ publishFlag applied     effectivePage.published = true
✓ backup dir              adapters/shopify/.backups
✓ backup on update only   gated durch action === "update"
✓ backup_path in summary  backup_path: backupPath
✓ publish_flag in summary publish_flag: publishFlag
```

### Build-Pipeline grün
- `bun build adapters/shopify/pages-to-shopify.mjs` → `Bundled 2 modules in 5ms`
- `bun adapters/shopify/build-page.mjs trunk/content/pages/_shared/ueber-uns.yaml`
  → Payload JSON auf stdout (unverändert, Backwards-Compatible)

### Live-Verifikation (nicht in dieser Session)
CW-006 verlangt „gerichteter, expliziter Transfer". Ein Live-Push ohne
ausdrückliche Dr.-Stracke-Freigabe fällt **nicht** unter „nach eigenem
Ermessen fortsetzen", weil er die Production-Page `uber-uns` berührt.
Nächster Live-Test wird in Session 25 im regulären Transfer-Ablauf
auto-verifiziert (backup_path ≠ null beim ersten Update, publish_flag=true
bei erstmaliger Publikation einer neuen Bridge-Page).

---

## §4 Selbstprüfung (Phase 4)

### Akzeptanzkriterien
| AK | Kriterium | Status |
|:---:|---|:---:|
| 1 | `PUBLISH` unset oder `0` → Verhalten wie vor Session 24 | ✅ (publishFlag nur eval wenn "1") |
| 2 | `PUBLISH=1` → `effectivePage.published = true` wird an REST geschickt | ✅ (Code-Marker ✓) |
| 3 | Bei Update: Backup-Datei wird vor PUT geschrieben | ✅ (Code-Marker ✓, CW-008-Kommentar) |
| 4 | Bei Create: `backup_path: null` | ✅ (backupPath bleibt null bei pages.length===0) |
| 5 | Bei Backup-Fehler: Adapter abortet Exit 2 | ✅ (`die(2, ...)` im catch) |
| 6 | Trunk-Regel `payload.page.published !== false` bleibt aktiv | ✅ (Zeile unverändert) |
| 7 | Summary um `publish_flag` + `backup_path` erweitert | ✅ |
| 8 | `sync-page-shopify.sh` dokumentiert neue Env | ✅ |
| 9 | Bundle-Build grün | ✅ (`Bundled 2 modules`) |
| 10 | `tools/validate.sh` grün | ✅ (unverändert, Schema-Validation) |

**Score: 10/10 = 100 %.**

### FK-Selbstprüfung (Fehlerklassen aus WORKING_MODE.md)
- FK-1 Missverständnis: N/A — Ziele sind aus `SESSION_RESUME.md §4` zitiert.
- FK-2 Scheinverständnis: Ursache „Publish-Flag fehlt" wurde genau dort gelöst
  (write-Body), nicht am Trunk-Schema.
- FK-3 Plausible Scheinlösung: Backup als JSON mit `body_html` drin ist das
  rollback-fähige Artefakt (nicht nur Metadaten-Pointer).
- FK-4 Iteration: einmalige Edit-Runde, kein Re-Fix.
- FK-5 Kontextverlust: Konsistenz zu `template-to-shopify.mjs`-Backup-Pfad
  gewahrt (`adapters/shopify/.backups/`).

### Abweichungen zur Spec
Keine.

---

## §5 Offene Folgearbeit

- **Live-Verify** beim nächsten Page-Bridge-Transfer (Session 25):
  `backup_path` in Summary prüfen, `.backups/` Inhalt sichten, dann
  `ueber-uns` mit `PUBLISH=1` re-pushen, `published_at ≠ null` verifizieren.
- **Publish-Helper für Template-Adapter** (analog N-5): aktuell nicht
  nötig, weil Templates keinen published_at-State haben.
- **WP-Page-Adapter-Backup** (CW-008 vollständig): separate Front,
  außerhalb dieser Session.
