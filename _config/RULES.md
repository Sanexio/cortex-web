# Cortex-Web — Projekt-Regeln

> Ergänzt die Nexus-Regeln (`Nexus/_rules/GLOBAL_RULES.md` LL-001…LL-043+).
> CW-001 bis CW-005 sind in Phase 0 definiert; weitere werden beim POC ergänzt.

---

## CW-001 — Trunk ist Master (Single Source of Truth)

**Regel:** Änderungen an Content, Design-Tokens, Komponenten-Specs und Medien-Metadaten
werden IMMER im Trunk (`trunk/`) vorgenommen. Niemals direkt in einer Site.

**Warum:** Zwei Orte = Divergenz. Wenn ein Produkt im Shopify-Admin geändert wird
und gleichzeitig im Trunk steht, entstehen widersprüchliche Wahrheiten. Der Adapter
kann das nicht auflösen.

**Wie anwenden:**
- Edit → `trunk/<pfad>`
- `bash tools/validate.sh`
- `bash tools/sync-<plattform>.sh`
- Verify über Puppeteer/Visual-Diff vor Deploy

**Ausnahmen:** Plattform-spezifische Settings (Shopify-Payment-Provider, WP-Security-Plugins)
bleiben in der jeweiligen Plattform und werden NICHT im Trunk abgebildet.

---

## CW-002 — Schema-Validation vor Build

**Regel:** Kein Adapter-Build läuft, ohne dass vorher alle Content-Dateien gegen
ihr JSON-Schema validiert wurden.

**Warum:** Fehlende Pflichtfelder, falsche Datentypen, inkonsistente Locale-Abdeckung
führen zu brüchigen Renderings. Fail fast ist billiger als Fail late.

**Wie anwenden:**
- `tools/validate.sh` läuft AJV gegen alle YAML-/MD-Files in `trunk/content/`
- Bei Verletzung: Adapter stoppt, Fehler wird genannt
- Pre-Commit-Hook (optional) verhindert Commit bei Schema-Fehler

---

## CW-003 — Lokale Originale pflichtig (Medien-Sicherheitsnetz)

**Regel:** Jedes Medium, das in Shopify Files hochgeladen wird (M-3c), MUSS gleichzeitig
eine lokale Kopie in `_media-source/<kategorie>/<dateiname>` haben.

**Warum:**
1. Eigentumsbeweis: Bilder/Rechte liegen nachweisbar beim Tenant-Operator, nicht nur bei Shopify.
2. Migration vorbereitet: Bei Umzug auf M-3d (NAS) wird aus `_media-source/` direkt gespiegelt.
3. Ausfallsicherheit: Shopify-Ausfall ≠ Verlust der Originale.

**Wie anwenden:**
- `tools/media/register.mjs <datei>` kopiert in `_media-source/`, lädt zu Shopify Files
  hoch und trägt Eintrag in `trunk/media/registry.yaml`
- `_media-source/` ist git-ignoriert (siehe `.gitignore`), wird separat gesichert (GDrive/NAS)

---

## CW-004 — I18n I-2 hybrid

**Regel:** Content-Schemas trennen sprach-invariante Felder (Top-Level) und
mehrsprachige Felder (verschachtelt unter `.de/.en/.fr/.es`).

**Warum:** CMS-Zukunft (Directus/Decap), validierbare Übersetzungs-Abdeckung,
gängiger Industriestandard.

**Wie anwenden:**
- Sprach-invariant (Top-Level): IDs, SKUs, Preise, Medien-Keys, Kategorien, Flags
- Mehrsprachig (verschachtelt): Titel, Beschreibungen, CTA-Labels, SEO-Meta
- Default-Locale: `de` (Pflicht). `en/fr/es` optional; Adapter rendert dann nur `de`.
- JSON-Schema erzwingt Präsenz von `.de` für alle mehrsprachigen Felder.

---

## CW-005 — Plattform-Trennung bleibt bestehen

**Regel:** Die beiden Sites sind und bleiben rechtlich, organisatorisch und
markentechnisch getrennt. Der Trunk teilt nur Substanz, keine Identität.

**Warum:** Wenn ein Tenant mehrere Sites mit unterschiedlicher rechtlicher
Stellung betreibt (typisches Beispiel: Heilberuf-Site nach Werbe-/Berufsrecht
vs. Handelsgewerbe-Shop mit kommerzieller Werbung), gelten je Site
unterschiedliche regulatorische Constraints (Werbe- und Berufsrecht, Steuer-
Einordnung, Datenschutz-Anforderungen). Vermischung = rechtliches Risiko
(Abmahnung, fehlerhafte steuerliche Einordnung, Berufsrechts-Verstoß).
Konkrete Tenant-Beispiele dokumentiert der jeweilige Tenant in
`<tenant>/_meta/rechtsrahmen.md`.

**Wie anwenden:**
- Jede Site hat EIGENES Impressum, EIGENE DSGVO, EIGENE AGB (im Trunk als separate Dateien)
- KEINE gemeinsame Kasse, KEINE gemeinsamen Nutzerkonten
- Adapter-Views respektieren die regulatorischen Constraints der jeweiligen Site
  (Tenant-Beispiel im Tenant-Repo dokumentiert):
  - `views.<heilberuf-site>.show_price: false` ist Pflicht für Produkte,
    wenn die Site Heilberuf-/HWG-Regeln unterliegt
  - Kauf-CTA ist auf solchen Sites verboten, nur Info-Links auf die
    Distributions-Site erlaubt
- Bei Produkt-Neuanlage: alle für den Tenant relevanten Views sind explizit zu definieren
- Cross-Links zwischen Sites sind erlaubt, aber als „Partnerinfo" / „Mehr erfahren" zu markieren

---

## CW-006 — Gerichteter, expliziter Transfer (Cross-Site)

**Regel:** Jeder Transfer zwischen den beiden Sites ist ein bewusst ausgelöster,
gerichteter Befehl. Kein Auto-Sync, keine Webhooks, keine Zwei-Wege-Merges.
Die Transfer-Richtung ist im Befehlsverb explizit enthalten (push/pull).

**Warum:** Bidirektionaler Live-Sync hat drei teure Probleme: Konflikt-Auflösung,
HWG-Verletzungsrisiko (CW-005), und Debugging-Aufwand bei Ghost-Writes. Explizit
gerichtete Transfers sind vorhersagbar, auditierbar (Git-Historie), und
rollback-fähig.

**Wie anwenden:**
- Verb im Befehl: `push` (Trunk→Site) oder `pull` (Site→Trunk)
- Meta-Orchestrator: `tools/cw-transfer <verb> <target>:<type> <arg>`
- Keine Automatisierung ohne explizite Tenant-Operator-Auslösung
- Bei Bedarf: Cron/Hook nur für `pull` + Diff-Report, nie für automatisches `push`

---

## CW-007 — Trunk ist alleinige Brücke (Bridge-Pflicht)

**Regel:** Zwischen WordPress und Shopify existiert NIEMALS ein direkter
Datenfluss. Jeder Cross-Site-Transfer läuft Site → Trunk → Site, auch wenn
dazwischen keine menschliche Kuration stattfindet.

**Warum:**
- Single Source of Truth für jeden Transfer (auditierbar)
- Schema-Validation als Mittelstation (CW-002)
- HWG-View-Overrides müssen explizit durchlaufen werden (CW-005)
- Rollback-Point ist immer der Trunk-Commit

**Wie anwenden:**
- Keine Adapter-zu-Adapter-Aufrufe. Wenn ein Shopify-Inhalt zu WordPress soll:
  1. `cw-transfer pull shopify:<type> <id>` → Proto-JSON
  2. Kuration → `trunk/...`
  3. `cw-transfer push wp:<type> <trunk-yaml>`
- Direkte Shopify→WP-Extraktoren sind verboten, auch als "Bequemlichkeits-Shortcut"

**Ausnahmen:** Keine.

---

## CW-008 — Backup vor destruktivem Push

**Regel:** Jeder Push, der existierenden Site-Content überschreibt, legt VOR dem
Write ein lokales Backup an. Ohne Backup: kein Write.

**Warum:** Shopify/WordPress haben keine nativen Versions-History-APIs für
Pages/Templates mit angemessener Granularität. Ein falsch gepushter Trunk-Build
kann Wochen an Admin-Edits zerstören.

**Wie anwenden:**
- `adapters/<target>/.backups/<ISO-timestamp>_<asset-key-or-id>.<ext>`
- Backup-Speicherort ist git-ignoriert (`.backups/` in `.gitignore`)
- Im Adapter-Output-Summary: `backup_path` (null wenn create, Pfad wenn update)
- Bereits implementiert: `adapters/shopify/template-to-shopify.mjs`
- Zu erweitern (geplant): `pages-to-shopify.mjs`, WP-Page-Adapter

**Anti-Pattern:**
❌ „Ich setze `ALLOW_OVERWRITE=1` einfach — ist ja nur ein Test"
✅ Backup automatisch, dann `ALLOW_OVERWRITE=1` als bewusstes Go

---

## CW-PRIO-001 — Holistische System-Priorität (seit 2026-04-23, Session 31)

**Regel:** Vor jeder Front-Wahl innerhalb Cortex-Web prüft Claude, auf
welcher Prio-Stufe (P1–P6 / Ppol / Popt / Pios) die vorgeschlagene Front
liegt. Fronten der Stufen **P1–P5** dominieren. Stufen **Popt** (Adapter-
Suite-Vervollständigung) und **Pios** (iOS-Integration / N-3 Design-
Token) werden nur aufgegriffen, wenn ein **konkreter, benannter
Pain-Point** sie in die P1–P5-Ebene zieht — nicht wegen akademischer
Symmetrie oder Architektur-Eleganz.

**Warum:** Session-Audit 2026-04-23 (Session 31) hat gezeigt, dass 7/10
vorangegangener Sessions in Infrastruktur-Symmetrie gelaufen sind,
während das holistische 3-Projekt-System (Cortex-Web + Juvantis +
Praxis-Webseite) in seinem Alltags-Wert nicht entsprechend gewachsen ist.
Das ist FK-3 (Plausible Scheinlösung) auf Programmleitungs-Ebene: die
Adapter sehen komplett aus, aber der Content-Pflege-Alltag, die Medien-
Registry und die Prod-Deploy-Pipelines existieren noch nicht.

**Die Prio-Leiter (von oben nach unten):**

| Prio | Inhalt | Definition „fertig" |
|:---:|---|---|
| **P1** | Medien-Registry + `_media-source/`-Flow + N-1b Media-ID-Resolver | Jede Content-Änderung, die Bilder braucht, läuft deterministisch durch den Trunk |
| **P2** | Prod-Deployment-Pipelines (Praxis via DF/SFTP + Juvantis-Shopify-Sync dokumentiert und wiederholbar) | Von Trunk-Edit bis Prod-Live ≤ 10 Min, ohne manuelle WP-/Shopify-Admin-Klicks |
| **P3** | Praxis Content-Rest (Cluster C, Impressum/Datenschutz, 7 Arzt-Profile, Aktuelles, WPForms, Google My Map) | Alle Praxis-Pages haben Echt-Content; Stub-Pages sind namentlich dokumentiert mit Blocker-Grund |
| **P4** | M1: Erster Prod-Push Primär-Domain des Tenants + Verify | Domain live, HTTPS, alle Cluster erreichbar, SEO-Layer aktiv |
| **P5** | Juvantis Content-Alltag (2–3 weitere Bridge-Seiten, Content-Pflege als Gewohnheit) | Trunk-Edit → beide Sites upgedatet ist routinierte Operation, kein Einzelnachweis |
| **P6** | Mehrsprachigkeit Praxis (i18n-Mechanik + externe Übersetzungen + Integration) | Praxis DE + mindestens EN, idealerweise FR/ES |
| **Ppol** | Design-Polish, A11y-Audit, Mobile-Finish | Accessibility-Score ≥ 90, Mobile-Core-Web-Vitals grün |
| **Popt** | Adapter-Suite-Vervollständigung (N-6.4, N-6.5, Pattern C Metafield) | **Nur wenn konkreter Pain-Point** — sonst gefrierend offen |
| **Pios** | N-3 Design-Token-Adapter + iOS-Adapter | **Nur wenn iOS-App-Projekt aktiv wird** — sonst gefrierend offen |

**Wie anwenden:**

- In `SESSION_RESUME.md §0 Roadmap` steht die aktuelle Prio-Position
  (welcher Block ist dran, welcher als nächstes).
- `§5 Sofort-Status-Frage` schlägt als Default den nächsten P1–P5-Schritt
  vor, nicht eine Liste gleichrangiger Fronten.
- Wenn Claude eine Popt-/Pios-Front vorschlägt, muss der konkrete
  Pain-Point (was wird heute blockiert, weil das fehlt?) explizit
  benannt werden. Ohne benannten Pain-Point ist die Antwort: verschieben.
- Der Tenant-Operator kann jederzeit über die Prio hinweg entscheiden
  („Ad-hoc-Front") — aber die Default-Pfad der Session ist
  Prio-getrieben.

**Anti-Pattern:**

❌ „Lass uns N-6.5 machen, dann ist der Diff-Quadrant 100 % komplett."
✅ „N-6.5 ist Popt — kein aktueller Pain-Point. Wir machen stattdessen
P1 (Medien-Registry), weil ohne die alle Content-Flows Torsos bleiben."

---

## CW-009 — Multi-Device-Mirror + Promotion-Pipeline

**Regel:** Cortex-Web liegt auf **allen** Nexus-Macs als aktueller
Mirror (`primary` oder `mirror`), wird aber per Konvention nur von
**einem** Mac gleichzeitig bearbeitet. Aufnahme neuer Tools/Sub-Projekte
in den Trunk erfolgt ausschließlich über einen vorab definierten
Integration-Slot (`_integration-slots/<name>/SLOT.md`) und das
Promotion-Skript (`tools/promote-to-trunk.sh`).

**Warum:**
1. **Mirror auf allen Macs**, damit jederzeit von jedem Mac aus ein
   Tool aus einem Projekt-Sandbox in den Cortex-Web-Trunk promotet
   werden kann, ohne erst klonen/syncen zu müssen.
2. **Bearbeitung von nur einem Mac**, weil zwei parallele Writer auf
   einem geteilten Trunk denselben Klassen-Bug (140-Commit-Split
   2026-04-24, Nexus) wiederholen würden — und der Mirror-Auftrag dafür
   nicht den nötigen Konflikt-Apparat hat (kein Lease, kein Heartbeat).
3. **Slot-Vertrag vor Promotion**, weil „Tool wandert in den Trunk"
   ohne Interface-Vertrag und Akzeptanz-Kriterien zur stillen
   Trunk-Verschmutzung führt (FK-3 auf Tool-Ebene).

**Wie anwenden:**

*Mirror-Setup (pro Mac einmalig):*
- `git clone git@github.com:Sanexio/cortex-web.git ~/Cortex/projects/Cortex-Web`
  (falls noch nicht vorhanden)
- `cp tools/cw-mirror-sync.plist ~/Library/LaunchAgents/com.cortex.cw-mirror.plist`
- `launchctl load ~/Library/LaunchAgents/com.cortex.cw-mirror.plist`
- Eintrag in `Nexus/.config/devices.json` mit Feld `primary: false` (Mirror)
  oder `primary: true` (Bearbeitungs-Mac)

*Bearbeitungs-Regel:*
- Vor jeder Welle: `git pull --ff-only`. Bei Divergenz: STOP, kein Edit.
- Während der Welle: Edits committen, am Ende `git push`.
- Mirror-Sync (Pull-only) erkennt lokale Modifikationen und skippt
  automatisch — kein manuelles Stoppen nötig.

*Promotion-Pipeline (für neue Tools):*
1. Slot anlegen: `_integration-slots/<name>/SLOT.md` aus Template,
   Status `PROPOSED`.
2. Sandbox-Build im Quell-Projekt (`projects/<x>/` oder anderswo),
   Status `SANDBOX`.
3. Härtung auf ≥2 Macs + ≥2 echte Anwendungsfälle, Status `HARDENED`.
4. `tools/promote-to-trunk.sh <slot> --commit` (führt `cp -R` +
   Status-Update + Commit aus; pusht nicht — Verify zuerst).
5. Push nach manuellem Trunk-Test.

**Anti-Pattern:**

❌ „Ich kopiere das Tool schnell direkt in `tools/`, der Slot-Kram ist
   für später." → Trunk verschmutzt, keine Vertragsdoku, keine
   ≥2-Mac-Härtung.
✅ Slot erst, dann Sandbox, dann Härtung, dann Promotion-Skript.

❌ Zwei Macs bearbeiten gleichzeitig den Trunk (z.B. Cluster-Mini-02
   und Mac-Studio mergen parallel zwei Feature-Branches in `main`).
✅ Ein Bearbeitungs-Mac pro Welle. Andere Macs sind passive Mirror,
   skippen Sync wegen Heartbeat-Schutz (skipt bei lokalen Mods).

---

## Weitere Regeln (wachsen beim POC)

- CW-010+ werden bei Phasen C2/D/F (Extraktion/Design/Funktion) ergänzt,
  sobald die jeweilige Transfer-Realität weitere Patterns zeigt.
