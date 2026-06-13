# Praxis-Test — Sanexio Portal Welle P.1

Schritt-für-Schritt-Test des End-to-End-Flows
**Praxis-Footer → Sanexio Portal → Workforce-Time Magic-Link-Login**.

Lokales Setup auf einem Local-Flywheel-Host (Local-Stage-only).
`${LOCAL_WP_HOST}` ist der host der lokalen WP-Site, z.B. der
Flywheel-Default-Hostname eurer Site (im Local-App-UI unter „SSL ›
Site Domain" sichtbar).

---

## Voraussetzungen

- Local-Flywheel-Site läuft (`gpmedicalcenterwestend-…local`)
- Node.js ≥ 20 für Sanexio-Portal
- Node.js ≥ 24 für Workforce-Time
- Optional: Mailpit (`brew install mailpit` → `mailpit`) für Magic-Link-Mails
  unter `http://127.0.0.1:8025`

---

## Setup (einmalig)

```bash
# Sanexio Portal
cd ~/Cortex/projects/Cortex-Web/sites/sanexio-portal
npm install

# Workforce-Time (falls noch nicht erfolgt)
cd ~/Cortex/projects/Cortex-Web/sites/workforce-time
npm install
```

---

## Routine-Start (jeder Test-Lauf)

Drei Terminal-Tabs parallel:

### Tab 1 — Mailpit (Magic-Link-Mails)

```bash
mailpit
# UI: http://127.0.0.1:8025  · SMTP: 127.0.0.1:1025
```

### Tab 2 — Workforce-Time Backend + Frontend

```bash
cd ~/Cortex/projects/Cortex-Web/sites/workforce-time
export CORTEX_TENANT_DIR=~/Cortex/projects/Sanexio-Tenant
npm run dev
```

Erwartet:
- Browser-UI auf `http://127.0.0.1:5174`
- API auf `http://127.0.0.1:5175`

### Tab 3 — Sanexio Portal

```bash
cd ~/Cortex/projects/Cortex-Web/sites/sanexio-portal
npm run dev
```

Erwartet:
- Portal auf `http://127.0.0.1:5176`
- Konsole zeigt `[graph] wrote …/public/graph.json: N nodes, M edges, K clusters`

---

## End-to-End-Klickpfad

1. **Praxis-Webseite öffnen.** Im Browser:
   `https://${LOCAL_WP_HOST}`
2. **Footer ansteuern.** In Spalte 1 (Adresse) erscheinen zwei CTAs:
   - Rot: „Termin online buchen / über Doctolib"
   - Gelb: **„Sanexio Portal / Mitarbeiter-Zugang"** ← klicken (öffnet
     neuen Tab auf `http://127.0.0.1:5176`)
3. **Portal prüfen.**
   - Hero zeigt „Sanexio Portal", Active = 1, Locked = 6
   - Sieben Cards in Grid, nur **Workforce-Time** mit gelber
     PRODUCTION-Badge, alle anderen mit RESTRICTED-Hover-Overlay
   - Klick auf gesperrte Card → Toast „Modul gesperrt"
   - Sektion 04 Second Brain · Graph: Cytoscape rendert Force-Graph
4. **Workforce-Time öffnen.**
   - Klick auf Workforce-Time-Card → neuer Tab auf
     `http://127.0.0.1:5174`
   - Magic-Link-Login: Mitarbeiter-Mail eingeben (aus
     `tenant.config.json → workforce.team_members[*].email`)
5. **Mail abrufen.**
   - Mailpit-UI (`http://127.0.0.1:8025`) zeigt die Magic-Link-Mail
   - Klick auf den Link → Login erfolgreich
   - Optional: TOTP-Code aus Authenticator-App eingeben

---

## Smoke-Checks

```bash
# Sanexio Portal — Build grün?
cd ~/Cortex/projects/Cortex-Web/sites/sanexio-portal
npm run build      # tsc --noEmit + vite build

# Graph-Daten frisch?
ls -lh public/graph.json
```

---

## Häufige Fehler

| Symptom | Ursache | Lösung |
|---|---|---|
| Footer-Button bleibt rot (kein gelber CTA) | Browser-Cache, CSS-Datei mit altem `?ver=` | Hard-Reload (Cmd+Shift+R) |
| Portal lädt, Graph leer | `public/graph.json` fehlt | `npm run build:graph` |
| Workforce-Login-Mail kommt nicht an | Mailpit läuft nicht oder Workforce nutzt anderen SMTP | Mailpit starten + Workforce SMTP-Config prüfen |
| Card-Klick auf Workforce-Time öffnet 5176 statt 5174 | Portal-Default war versehentlich überschrieben | `src/data/cards.ts` `href` prüfen |

---

## Nicht-Praxis-Test-relevant

Diese Test-Doku deckt **nur** den lokalen Klickpfad ab. Cluster-Mini-04
Tailnet-Staging und etwaige Live-Deploys auf `.de` oder `.com` sind
**explizit aus Welle P.1 ausgeschlossen** (Memory
`feedback_praxis_webseite_local_only.md`).
