# praxis-web

WordPress-Seite der Praxis Dr. Stracke & Kollegen — https://westend-hausarzt.com/

Unterprojekt von Juvantis. Hoster: Domainfactory.

## Struktur

```
praxis-web/
├── _config/          Regeln, Fehlerprotokoll, Checklisten, Changelog
├── Input/            Eingangs-Material (neue Texte, Briefings, Bilder)
├── Output/           Verarbeitete Dokumente (Reports, Briefings-Outputs)
├── exports/          WP-XML-Exporte, DB-Dumps
├── theme/            Lokale Theme-Kopie + Git-Repo (kein Remote)
└── scripts/          Hilfsskripte (REST-API-Wrapper, Deploy, etc.)
```

## Einstieg

1. `_config/RULES.md` lesen
2. `_config/.env` anlegen (Application Password)
3. REST-API-Verbindung testen:
   ```bash
   curl -u "$WP_USER:$WP_APP_PASSWORD" "$WP_URL/wp-json/wp/v2/pages?per_page=5"
   ```

## Verknuepfte Ressourcen

- Gemeinsame Brand-/Content-Assets: `../​_shared/`
- Dach-Regeln: `../_config/RULES.md`
- Nexus-Regeln: `Nexus/_rules/GLOBAL_RULES.md`
