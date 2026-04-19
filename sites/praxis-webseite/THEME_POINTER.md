# Theme-Pointer praxiszentrum (Local-by-Flywheel)

> Phase 4 Subsumierungs-Artefakt (`Cortex-Web/specs/phase-4/SUBSUMPTION.md` §3.4).
> Erstellt 2026-04-19 mit Subtree-Add der praxis-redesign-Docs.

---

## Wo das Theme physisch lebt

Das WordPress-Child-Theme `praxiszentrum` (Parent: Blocksy) lebt physisch unter:

```
/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum/
```

Es hat ein **eigenes lokales Git-Repo** ohne Remote.

---

## Warum getrennt von Cortex-Web

Local-by-Flywheel scannt `wp-content/themes/<name>/` literal nach validen Themes
(`style.css` mit Header, `functions.php`, etc.). Symlinks aus Cortex-Web in
diesen Pfad sind unzuverlässig:

- LBF-Updates können Symlinks invalidieren.
- WP-Core-Funktionen wie `get_template_directory()` folgen Symlinks
  inkonsistent über PHP-Versionen hinweg.
- WP-CLI verhält sich teilweise anders bei Symlink-Themes.

Daher bleibt das Theme-Repo am LBF-Pfad, und dieser Pointer dokumentiert die
Verbindung.

---

## Aktueller Theme-Stand (Stand Phase-4-Subsumierung)

| Eintrag | Wert |
|---------|------|
| Commit-Hash | `257304e7e9473d77a3a57d7f1b5c39b74e5dc13d` (`257304e`) |
| Commit-Message | `feat(s2.0): design-token SSoT; bump PXZ_VERSION 2.7.4 → 2.7.5` |
| PXZ_VERSION | `2.7.5` |
| Bedeutung | S2.0 Design-Token-SSoT (Token-Datei `assets/css/tokens.css`), MD5-byte-identisch zu v2.7.4 (visuell unverändert) |
| Letzte Dr.-Stracke-Freigabe | 2026-04-18 („Das sieht gut aus") |

### Versionskette des Themes (Stand 2026-04-19)

```
257304e  feat(s2.0): design-token SSoT; bump PXZ_VERSION 2.7.4 → 2.7.5
914af8d  feat(s0.2): extract karriere CSS; bump PXZ_VERSION 2.7.3 → 2.7.4
c3f7db7  feat(s0.2): extract homepage CSS from inline to assets/css/homepage.css
8c9d0fa  chore: baseline v2.7.3 (homepage + karriere + mfa-formular)
```

---

## Wiederherstellung (falls Local-Site neu aufgesetzt wird)

1. Local-by-Flywheel Backup importieren → das Theme liegt automatisch am
   richtigen Pfad mit eigenem `.git`.
2. Falls Theme verloren: aus letzter bekannter Commit-Quelle clonen oder
   Backup-Tarball entpacken (Archivierung wird gerätelokal organisiert,
   Cortex-Web hostet keine Theme-Binaries).
3. PXZ_VERSION-Bump-Policy: siehe `CHANGELOG.md` im Theme-Repo selbst.

---

## Pflege dieses Pointers

Bei jedem signifikanten Theme-Commit (PXZ_VERSION-Bump oder Tokens-Änderung)
wird der **Commit-Hash + Message** in der Tabelle oben aktualisiert. Manuelle
Pflege, weil getrennte Repos. Spätestens beim Befehl „Session beenden"
(LL-042 Schritt 1) wird Konsistenz geprüft.

---

## Beziehung zu den Docs/Tools in diesem Ordner

Dieser Ordner (`sites/praxis-webseite/`) enthält **nur Docs, Specs, Tools und
Screenshots** des praxis-redesign-Projekts (subsumiert per `git subtree add`
am 2026-04-19, Cortex-Web-Commit `94e6e91`). Die WordPress-Theme-Quellen
selbst sind nicht hier — sie liegen am LBF-Pfad oben.

Die Tools in `tools/` (verify.sh, probe-design.mjs, ab-diff.mjs, …) richten
sich gegen die Local-by-Flywheel-Site, nicht gegen Dateien in diesem Ordner.

---

*Erstellt 2026-04-19 (Phase-4-T3, SUBSUMPTION.md §3.4). Bei Theme-Updates pflegen.*
