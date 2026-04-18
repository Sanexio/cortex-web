# Local WP Setup für Cortex-Web Adapter

Zwei einmalige Eingriffe an Dr. Strackes Local-by-Flywheel-Site, damit der Cortex-Web-Adapter über WordPress-REST-API + Application Password authentifizieren kann.

**Beide Eingriffe sind lokal, reversibel, ändern weder `wp-config.php` noch das `praxiszentrum`-Theme noch Plugins.**

---

## 1. nginx: Authorization-Header an PHP-FPM weiterreichen

Local's nginx-Template schickt den `Authorization`-Header standardmäßig nicht an PHP. Ergebnis: WP sieht keine Credentials.

**Template-Datei** (überlebt Local-Restart):
`~/Local Sites/<site>/conf/nginx/site.conf.hbs`

Im `location ~ \.php$`-Block, nach der `fastcgi_param HTTPS`-Zeile, folgende Zeile ergänzen:

```nginx
# Cortex-Web (2026-04-18): forward Authorization header to PHP-FPM
fastcgi_param   HTTP_AUTHORIZATION      $http_authorization;
```

Danach Site in Local GUI „Stop/Start" oder nginx reloaden:

```bash
NGINX_PID=$(ps -ef | grep "nginx: master.*<site-id>" | grep -v grep | awk '{print $2}' | head -1)
kill -HUP "$NGINX_PID"
```

---

## 2. mu-plugin: `PHP_AUTH_USER`/`PHP_AUTH_PW` rekonstruieren + App-Passwords auf HTTP erlauben

WordPress' `wp_validate_application_password()` liest `PHP_AUTH_USER`/`PHP_AUTH_PW`. Apache befüllt die automatisch aus dem Basic-Auth-Header, nginx nicht. Zusätzlich verweigert WP Application Passwords standardmäßig auf reinem HTTP.

Kopieren:

```bash
cp tools/local-wp-setup/cortex-dev-auth.php \
   "~/Local Sites/<site>/app/public/wp-content/mu-plugins/cortex-dev-auth.php"
```

Ein mu-plugin (`must-use`) läuft automatisch und erscheint nicht in der Plugin-Verwaltung. Entfernen = Datei löschen.

---

## 3. Application Password anlegen

1. `http://<site>.local/wp-admin/` → Benutzer → Profil → **Anwendungspasswörter** (ganz unten)
2. Name: `cortex-web-adapter` → „Neues Anwendungspasswort hinzufügen"
3. Das in der gelben Box angezeigte 24-Zeichen-Passwort kopieren (wird nur einmal gezeigt)
4. In `Cortex-Web/.env.local` eintragen:
   ```
   WP_USER=<admin-user>
   WP_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
   ```

---

## 4. Smoke-Test

```bash
cd Cortex-Web
set -a; . ./.env.local; set +a
curl -s -u "$WP_USER:$WP_APP_PASSWORD" "$WP_REST_BASE/wp/v2/users/me" | jq .slug
```

Erwartet: `"<admin-user>"`. Wenn stattdessen `rest_not_logged_in` erscheint, ist entweder (1) die nginx-Zeile nicht aktiv (Site neu starten) oder (2) das mu-plugin nicht installiert oder (3) das Passwort falsch kopiert.

---

## 5. Cleanup (wenn Local-Site zurückgesetzt wird)

- mu-plugin-Datei wird gelöscht → Repo-Quelle (`tools/local-wp-setup/cortex-dev-auth.php`) bleibt erhalten
- nginx-Zeile im `.hbs`-Template kann von Local bei Reset überschrieben werden → einfach erneut ergänzen
- Application Password im WP-Admin widerrufen
