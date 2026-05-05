# Exit-Solution Hosting — Wenn DF-Support nicht antwortet

> **Stand:** 2026-05-04 (Sprint-1 blockiert durch Apache-Bug auf
> Domainfactory-Account `e88c2b3jxfrg`)
> **Zweck:** Plan B/C/D, falls bis 2026-05-05 abends keine Support-Antwort
> kommt oder die Antwort nicht hilft.
> **Cross-Reference:**
> `Nexus/Second Brain/30 Tutorials/Netzwerk & Sysadmin/00-schichtenmodell-und-webhosting.md`

---

## Was wir brauchen

Eine **öffentlich erreichbare URL** mit HTTPS, hinter der eine
WordPress-Installation läuft, auf der wir das Praxis-Theme + Inhalte
testen können — und bei Erfolg per Domain-Wechsel zur Live-Seite machen.

**Nicht-Funktionale Anforderungen**
- Zugang nur für Dr. Stracke (Basic-Auth oder ähnlich).
- Kein Suchmaschinen-Indexing (`noindex`).
- E-Mail-Versand (SMTP) muss funktionieren — für den MFA-Bewerbungsformular-
  Test (Sprint-1 S1.3).
- Reproduzierbar im Falle eines erneuten Hoster-Wechsels.

---

## Drei Optionen — Vergleich

| Kriterium | **A · Cloudflare Tunnel** | **B · Hetzner Cloud + WP** | **C · Cloudways Managed WP** |
|---|---|---|---|
| Setup-Zeit | ~2 h | ~4 h | ~1 h (klick-basiert) |
| Kosten | 0 € | ~5 €/Monat | ~12 $/Monat |
| Eigene Server-Wartung nötig | nein | ja | nein |
| Performance | mittel (NAT-Traversal) | gut | gut |
| Kann die echte Domain `westend-hausarzt.de` nutzen? | ja | ja | ja |
| WordPress-Performance | mittel (lokale Mac muss laufen) | gut | sehr gut |
| Wenn Mac aus → Site offline | ja | nein | nein |
| Datenbank | lokal (MySQL/MariaDB auf Mac) | eigener Server | inklusive |
| Kompatibel mit DF-Migration zurück | sehr einfach | einfach | mittel (Plugin „All-in-one Migration") |

**Empfehlung kurz und ehrlich:**
- **Akut, heute Abend / morgen früh, ohne Geld** → Plan A
- **Wenn die DF-Geschichte sich über die ganze Woche zieht** → Plan B
- **Wenn Sie auf Dauer den Support-Kram loswerden wollen** → Plan C

---

## Plan A · Cloudflare Tunnel zum lokalen Mac

### Konzept

Auf Ihrem Cluster-Mini-02 läuft bereits eine **lokale WordPress-Installation**
(Local-by-Flywheel, Pfad
`/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-…`). Diese ist
aktuell nur unter `https://gpmedicalcenterwestend-…local/` erreichbar — also
nur am Mac selbst.

Ein **Cloudflare Tunnel** baut von Ihrem Mac eine **ausgehende verschlüsselte
Verbindung** zu Cloudflare auf. Cloudflare nimmt eingehende Anfragen auf einer
echten Domain (z.B. `staging.westend-hausarzt.com`) entgegen und schiebt
sie durch diesen Tunnel zu Ihrem Mac. Ihr Mac antwortet, Cloudflare reicht
das zurück an den Besucher.

```
   Browser → https://staging.westend-hausarzt.com
                              │
                              ▼
                        Cloudflare-Edge
                              │
                              ▼
                    [verschlüsselter Tunnel]
                              │
                              ▼
                Cluster-Mini-02 (lokal, kein offener Port)
                              │
                              ▼
                    Local-by-Flywheel WordPress
```

**Nichts** muss bei DF/cPanel angefasst werden. Der Tunnel umgeht Apache,
vhosts und globale Block-Regeln komplett.

### Voraussetzungen

1. **Cloudflare-Account** (kostenlos). Falls nicht vorhanden: Anlegen unter
   `dash.cloudflare.com/sign-up` — 2 Minuten.
2. **Domain bei Cloudflare DNS-gehostet.** Hier wird es interessant:
   - Variante 1: Eine bestehende Sanexio-Domain wird auf Cloudflare-DNS
     umgestellt (im DF-Kundencenter Nameserver auf
     `nina.ns.cloudflare.com / kurt.ns.cloudflare.com` ändern). Dauer:
     2–24 h DNS-Propagation.
   - Variante 2: Eine **neue** Domain registrieren (~10 €/Jahr) und sofort
     Cloudflare als DNS nutzen.
3. **`cloudflared` installieren** auf dem Mac:
   ```bash
   brew install cloudflared
   ```

### Konkrete Schritte (sobald Voraussetzungen erfüllt)

1. **Login + Tunnel anlegen:**
   ```bash
   cloudflared tunnel login         # öffnet Browser, Domain auswählen
   cloudflared tunnel create praxis-staging
   ```
   Erzeugt eine Tunnel-ID + JSON-Credentials-Datei
   in `~/.cloudflared/<UUID>.json`.

2. **DNS-Eintrag automatisch erstellen:**
   ```bash
   cloudflared tunnel route dns praxis-staging staging.westend-hausarzt.com
   ```
   Cloudflare legt einen `CNAME`-Eintrag an: `staging` → `<UUID>.cfargotunnel.com`.

3. **Tunnel-Konfiguration** in `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: praxis-staging
   credentials-file: /Users/cluster-mini-02/.cloudflared/<UUID>.json
   ingress:
     - hostname: staging.westend-hausarzt.com
       service: http://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local
       originRequest:
         httpHostHeader: gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local
     - service: http_status:404
   ```

4. **Tunnel starten:**
   ```bash
   cloudflared tunnel run praxis-staging
   ```
   Läuft im Vordergrund — als macOS-Service einrichten:
   ```bash
   sudo cloudflared service install
   ```

5. **WordPress-`siteurl`/`home`** auf die Tunnel-URL umstellen
   (in der WP-Datenbank oder via WP-CLI):
   ```bash
   cd "/Users/cluster-mini-02/Local Sites/.../app/public"
   wp option update siteurl https://staging.westend-hausarzt.com
   wp option update home    https://staging.westend-hausarzt.com
   ```

6. **Cloudflare „Access"** für Basic-Auth (im Cloudflare-Dashboard):
   - Zero Trust → Access → Applications → „Self-hosted" → Domain hinzufügen
   - Policy: nur E-Mail `stracke.md@me.com` erlaubt, mit Magic-Link-Login
   - Resultat: jeder Aufruf von `staging.westend-hausarzt.com` öffnet erst
     einen Cloudflare-Login-Screen, der Sie per Magic-Link einloggt

### Risiken Plan A

| Risiko | Mitigation |
|---|---|
| Mac aus / Schlafmodus → Site offline | macOS unter „Systemeinstellungen → Energie" auf „Display ausschalten OK, aber Mac wach halten" konfigurieren |
| Heim-Internet langsam | Cloudflare cached statische Inhalte, dadurch reduziert |
| DNS-Umstellung der Domain bei DF nötig (Variante 1) | Variante 2: separate Domain registrieren — kein DF-Eingriff |
| Lokale WordPress-Datenbank wird zur „echten" Datenbank, Backups nötig | Local-by-Flywheel hat eingebautes Backup. Zusätzlich `wp db export` per Cron |
| Bei Migration zur echten `westend-hausarzt.com`: WPML-DB muss konsistent sein | Better-Search-Replace-Plugin nutzen (kennen wir vom Sprint-Plan) |

---

## Plan B · Hetzner Cloud + eigenes WordPress

### Konzept

Eine **Cloud-VM** bei Hetzner mieten (~5 €/Monat, CX22), Ubuntu installieren,
Caddy/Nginx + PHP + MariaDB selbst aufsetzen. WordPress installieren,
Domain via DNS auf die Hetzner-IP zeigen.

### Vorteile

- Volle Kontrolle, kein Hoster-Bug-Risiko
- Skaliert beliebig
- Wäre ein **echter** Live-Server-Erfahrungs-Schritt

### Nachteile

- Server-Wartung Ihre Verantwortung (Updates, Sicherheit)
- 4 h Setup-Zeit
- Keine GUI wie cPanel

### Empfehlung

Nur sinnvoll, wenn Sie ohnehin überlegen, dauerhaft von DF wegzugehen, **und**
bereit sind, sich mit Linux-Sysadmin zu beschäftigen. Sonst Plan A oder C.

---

## Plan C · Cloudways Managed WordPress

### Konzept

**Cloudways** ist ein Managed-Hosting-Anbieter, der DigitalOcean/Hetzner-VMs
mit vorkonfiguriertem WordPress + GUI bereitstellt. Sie zahlen ~12 €/Monat
und bekommen:

- Fertige WP-Instanz, Klick-Setup
- SSL automatisch
- Staging-Funktion (Live ↔ Staging-Klon mit einem Klick)
- E-Mail-Add-on (Elastic Email, ~1 $/Monat)
- 24/7 Support

### Vorteile

- Sehr schneller Setup (1 h)
- Kein Server-Wartungs-Kopfschmerz
- Eingebaute Staging-Umgebung — perfekter Workflow für unsere Migration

### Nachteile

- Monatliche Kosten
- Wenn Sie zurück zu DF wollen: Migration nötig (geht aber per Plugin)

### Empfehlung

**Wenn Sie auf Dauer Frust mit DF-Hosting loswerden wollen**, ist Cloudways
der pragmatischste Hoster-Wechsel. Migrationspfad:

1. Cloudways-Account anlegen, Server provisionieren (1 h)
2. WordPress-Backup von DF-Live-Site (Akeeba-`.jpa`) auf Cloudways einspielen
3. Domain-Wechsel: DNS für `westend-hausarzt.com` von DF auf Cloudways-IP
4. SSL automatisch von Cloudways
5. DF-Account zur reinen Domain-Verwaltung zurückbauen (nur Domain-Forwarding,
   kein Hosting mehr)

---

## Empfohlener nächster Schritt

**Heute Abend:** Nichts. Pause. DF-Ticket arbeitet im Hintergrund.

**Morgen früh, falls noch keine DF-Antwort:**
- 30 Minuten in **Plan A** investieren (Cloudflare-Tunnel-Setup)
- Damit ist Staging unabhängig von DF erreichbar — wir verlieren keinen Tag
- Sobald DF antwortet, kann der Plan-A-Tunnel aktiv bleiben oder abgeschaltet
  werden, je nachdem ob die DF-Lösung schneller/zuverlässiger ist

**Wenn DF auch in 48 h nicht antwortet oder nicht hilft:**
- Plan-C-Wechsel zu Cloudways. Geld pro Monat (~12 $) gegen verlorene
  Sprint-Wochen — die Rechnung ist klar zugunsten des Wechsels.

---

## Was wir auf KEINEN Fall tun

- **Nicht** im Frust noch mehr cPanel-Klicks machen, die wir nicht
  verstehen. Jede zusätzliche Änderung erschwert die Diagnose des Supports.
- **Nicht** das Domain-Forwarding bei DF aufgeben, bevor wir eine
  funktionierende Alternative haben — sonst sind alle Westend-URLs offline.
- **Nicht** die Live-Site `westend-hausarzt.com` anfassen — die läuft, da
  bleibt sie.

---

*Diese Datei ist Teil des Cortex-Web-Praxis-Webseite-Sprint-1-Stands.
Bei nächster Session: SESSION_RESUME.md aktualisieren mit Verweis hierauf.*
