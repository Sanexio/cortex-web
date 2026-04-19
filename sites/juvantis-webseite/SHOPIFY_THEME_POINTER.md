# Shopify-Theme-Pointer JUVANTIS (Store `medzpoint`)

> Phase 5 Subsumierungs-Artefakt (`Cortex-Web/specs/phase-5/SUBSUMPTION.md` §3.2).
> Erstellt 2026-04-19 nach E1a + E2a + E3a + E4a.
> Pattern-Vorlage: `Nexus/_memory/patterns/cross-repo-subsumption.md` + PH4-LL-5.

---

## Wo das Theme physisch lebt

Der Shopify-Theme-Klon für die Juvantis-Webseite (`sanexio.eu`) lebt physisch
unter:

```
~/Cortex/projects/Juvantis/juvantis-web/theme/
```

Absolut auf diesem Gerät (Cluster-Mini-02):

```
/Users/cluster-mini-02/Cortex/projects/Juvantis/juvantis-web/theme/
```

Es ist ein **eigenes Git-Repo mit Remote auf GitHub** (Branch `shopify-theme`).

---

## Warum getrennt von Cortex-Web

1. **Shopify-GitHub-Integration ist bidirektional.** Der Remote-Branch
   `shopify-theme` wird von Shopify selbst mit „Update from Shopify for theme
   JUVANTIS/shopify-theme"-Commits aktualisiert, sobald Admin-Edits im Store
   passieren. Diese Auto-Sync-Commits würden das Cortex-Web-Git-Log dominieren
   (217 Commits + monatlich wachsend), ohne konzeptionellen Wert fürs Dach.
2. **Auto-Sync-Hook in `Juvantis/.claude/settings.local.json`** (Praxis-Mac-
   historisch, auf Cluster-Mini-02 inaktiv) zielt auf diesen Pfad. Verschiebung
   würde Pfad-Anpassungen an Hook + Skript erzwingen.
3. **Operativer Kontext.** Der Theme-Klon ist die lokale Arbeitsstelle des
   Juvantis-Web-Workstreams (Cursor + Claude Code). Er gehört inhaltlich zum
   Juvantis-Projekt, auch wenn die konzeptionelle Site-Ebene (Knowledge-Graph,
   Backup-ZIPs, Deploy-Skript) im Dach-Projekt Cortex-Web sichtbar ist.

Daher bleibt der Theme-Klon am Juvantis-Pfad, und dieser Pointer dokumentiert
die Verbindung.

---

## Remote-Repo (GitHub)

| Feld | Wert |
|------|------|
| Remote-URL | `git@github.com:Sanexio/JUVANTIS.git` |
| Branch | `shopify-theme` (Orphan-Branch, nur Theme-Dateien) |
| Shopify-Store (Admin) | `medzpoint` |
| Shopify-Store (Custom Domain) | `sanexio.eu` |
| Theme-ID (Shopify) | `181128757515` |
| GitHub-Integration | **aktiv** (Shopify pusht Admin-Edits automatisch nach GitHub) |
| Deploy-Tool lokal | `sites/juvantis-webseite/shopify-sync.sh` (`npx shopify theme push/pull`) |

---

## Aktueller Theme-Stand (Stand Phase-5-Subsumierung)

| Eintrag | Wert |
|---------|------|
| Commit-Hash | `1fbc35b` |
| Commit-Message | `Update from Shopify for theme JUVANTIS/shopify-theme` |
| Commit-Anzahl | 217 |
| Stand | 2026-04-19 vor Phase-5-Start |

### Letzte Commits (Stand 2026-04-19)

```
1fbc35b  Update from Shopify for theme JUVANTIS/shopify-theme
48f0851  Update from Shopify for theme JUVANTIS/shopify-theme
f42596b  Update from Shopify for theme JUVANTIS/shopify-theme
2de7327  Update from Shopify for theme JUVANTIS/shopify-theme
7d05458  Update from Shopify for theme JUVANTIS/shopify-theme
291898b  Update from Shopify for theme JUVANTIS/shopify-theme
1a4b692  Update from Shopify for theme JUVANTIS/shopify-theme
6bdd07f  Update from Shopify for theme JUVANTIS/shopify-theme
0d4a633  Update from Shopify for theme JUVANTIS/shopify-theme
d9dc2b3  Update from Shopify for theme JUVANTIS/shopify-theme
```

(Die gleichförmige Commit-Message-Reihe stammt aus der Shopify-GitHub-Integration
und ist erwartetes Verhalten — jeder Admin-Save erzeugt einen solchen Commit.)

---

## Live-Site

| Umgebung | URL |
|----------|-----|
| Public | https://sanexio.eu/ |
| Admin | https://admin.shopify.com/store/medzpoint/themes |

---

## Wiederherstellung (falls lokaler Klon verloren geht)

```bash
cd ~/Cortex/projects/Juvantis/juvantis-web
git clone -b shopify-theme git@github.com:Sanexio/JUVANTIS.git theme
cd theme && git status    # sollte clean sein, falls keine lokalen Änderungen
```

Alternativ: letzte bekannte `shopify_export/theme_export__...zip` (liegt
*hier* in `sites/juvantis-webseite/shopify_export/`) entpacken und als
Basis verwenden.

---

## Deploy (via Cortex-Web-Pfad)

Das Deploy-Skript lebt seit Phase 5 hier in Cortex-Web, der Theme-Klon nicht:

```bash
cd ~/Cortex/projects/Cortex-Web/sites/juvantis-webseite
./shopify-sync.sh            # alle geänderten Theme-Dateien pushen
./shopify-sync.sh --pull     # vom Store pullen
./shopify-sync.sh sections/juvantis-hero.liquid  # einzelne Datei pushen
```

Das Skript greift via absolutem Pfad `$HOME/Cortex/projects/Juvantis/juvantis-web/theme`
auf den Klon zu. Siehe `shopify-sync.sh` Zeile `THEME_DIR=…`.

---

## Pflege dieses Pointers

Bei jedem **signifikanten** Theme-Meilenstein (neues Section, neue
Custom-Template, Release auf `sanexio.eu`) wird der **Commit-Hash + Message**
in der Tabelle oben aktualisiert. Routine-Auto-Sync-Commits werden **nicht**
jedes Mal nachgetragen — das würde zu ständigem Doku-Drift führen. Spätestens
beim Befehl „Session beenden" (LL-042 Schritt 1) wird gegen den aktuellen
`git -C ~/Cortex/projects/Juvantis/juvantis-web/theme rev-parse HEAD`
abgeglichen und bei Bedarf korrigiert.

---

## Beziehung zu den Docs in diesem Ordner

Dieser Ordner (`sites/juvantis-webseite/`) enthält die **konzeptionelle Site-
Schicht**:

| Artefakt | Inhalt |
|----------|--------|
| `shopify-sync.sh` | Deploy-Wrapper um `npx shopify theme push/pull` |
| `shopify_export/` | ZIP-Backups historischer Theme-Stände |
| `knowledge-graph/` | Medical-Knowledge-Graph (Content-Referenz für Avatar-Pages) |
| `SHOPIFY_THEME_POINTER.md` | diese Datei |
| `SESSION_RESUME.md` | LL-043-Einstieg |
| `README.md` | Kurzbeschreibung |

Der Theme-Code selbst (Liquid, CSS, JS, Assets) liegt weiterhin bei
`Juvantis/juvantis-web/theme/` und ist von dort aus per `git` erreichbar.

---

*Stand: 2026-04-19, erstellt in Session 7 (Cortex-Web Phase 5).*
