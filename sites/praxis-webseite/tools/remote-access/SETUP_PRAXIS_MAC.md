# Praxis-Webseite vom Praxis-Mac aus aufrufen

**Ziel:** Vom **SSMD-MacBookPro** (Praxis-Mac) im Browser auf die lokale
WordPress-Entwicklungs-Site zugreifen, die auf dem **Cluster-Mini-02**
(Home-Mac) in Local by Flywheel läuft.

**Voraussetzungen (bereits erfüllt):**
- Tailscale läuft auf beiden Macs (`piranha-marlin.ts.net`)
- SSH-Login `cluster-mini-02` funktioniert (Claude Code per SSH)
- Master-nginx auf Home-Mac lauscht auf `*:443` inkl. Tailscale-Interface

**Site-Hostname (in Local by Flywheel generiert):**
```
gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local
```

**Tailscale-IP des Home-Macs:** `100.89.44.67`

---

## Variante A — Direkt über Tailscale-IP (empfohlen, einmalig einrichten)

Funktioniert sofort, kein Tunnel, kein Cloud-Setup. Nutzt den bereits
laufenden Master-nginx auf dem Home-Mac.

### Einrichtung (einmalig auf dem Praxis-Mac):

```bash
# /etc/hosts editieren (sudo nötig)
sudo nano /etc/hosts
```

Folgende Zeile am Ende einfügen:

```
100.89.44.67   gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local
```

Speichern (`Ctrl+O`, Enter), beenden (`Ctrl+X`).

### Aufrufen:

Im Praxis-Mac-Browser:
```
https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local
```

**Beim ersten Aufruf:** Browser zeigt Zertifikatswarnung
(„Diese Verbindung ist nicht sicher" / Local-by-Flywheel-selbstsigniert).
→ „Erweitert" → „Trotzdem fortfahren" akzeptieren. Danach ist die Site
dauerhaft erreichbar, solange der Home-Mac läuft und Tailscale aktiv ist.

**WP-Admin:**
```
https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-admin
```

### Vorteile
- Echte Site-URL → alle WP-Links funktionieren nativ
- Kein Terminal-Tunnel nötig, kein Prozess offen halten
- Funktioniert solange Tailscale läuft

### Nachteile
- Einmalig `sudo` für `/etc/hosts`-Eintrag
- Zertifikatswarnung beim ersten Aufruf (selbstsigniert)

---

## Variante B — SSH-Tunnel (Fallback, on demand)

Nutzt die bestehende SSH-Session zu Cluster-Mini-02 für Port-Forwarding.

### Einrichtung (einmalig — zsh-Alias auf Praxis-Mac):

```bash
echo "alias praxis-tunnel='ssh -L 8080:localhost:10003 cluster-mini-02'" >> ~/.zshrc
source ~/.zshrc
```

### Nutzung:

Terminal A (Praxis-Mac):
```bash
praxis-tunnel
```
Lässt die SSH-Session offen. Browser:
```
http://localhost:8080
```

### Vorteile
- Funktioniert ohne `sudo`, ohne `/etc/hosts`-Eintrag
- Maximal sicher (alles durch SSH-Tunnel)

### Nachteile
- Terminal muss offen bleiben
- WordPress generiert Links auf den Site-Hostnamen → manche
  internen Klicks zeigen ins Leere. Für Page-by-Page-Review per
  direkter URL-Eingabe ok, für intensive Klick-Navigation eher
  Variante A nutzen.

---

## Variante C — Tailscale Serve (Bonus, falls einmal aktiviert)

Aktuell **deaktiviert** im Tailnet. Falls du den Komfort einer
sauberen MagicDNS-URL `https://cluster-mini-02.piranha-marlin.ts.net`
willst:

1. Im Browser einmalig öffnen:
   `https://login.tailscale.com/f/serve?node=n229qurbhu11CNTRL`
   und mit deinem Tailscale-Account aktivieren.
2. Auf Home-Mac:
   ```bash
   tailscale serve --bg 10003
   ```
3. URL vom Praxis-Mac: `https://cluster-mini-02.piranha-marlin.ts.net`

**Caveat:** WordPress sieht den MagicDNS-Hostnamen, generiert aber Links
auf `gpmedicalcenter…local` → gleiches Problem wie bei Variante B.
Variante A bleibt die sauberste Wahl.

---

## Troubleshooting

| Problem | Ursache | Lösung |
|---|---|---|
| `curl: connection refused` auf Tailscale-IP | Home-Mac aus oder Tailscale gestoppt | `tailscale status` auf Home-Mac prüfen |
| Browser-Warnung „nicht privat" | Selbstsigniertes Zertifikat von Local | „Erweitert → Trotzdem fortfahren" einmalig bestätigen |
| WP-Login-Loop / Cookies | falscher Hostname im Browser | exakt `gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` aufrufen, nicht IP |
| `localhost:8080` zeigt 404 / nginx default | Tunnel-Port falsch | Site-Port 10003 prüfen: `lsof -iTCP -sTCP:LISTEN -P \| grep nginx` |
| Site lädt aber Klicks brechen | Variante B/C, WP-Site-URL-Mismatch | Auf Variante A wechseln |

---

## Schnell-Check: Funktioniert alles?

Auf Praxis-Mac:
```bash
# Erreichbarkeit Tailscale
tailscale ping cluster-mini-02
# Erreichbarkeit Site (vor /etc/hosts-Setup)
curl -skI -H "Host: gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local" https://100.89.44.67/
```

Beides muss antworten (Tailscale: „pong", curl: „HTTP/2 200").
