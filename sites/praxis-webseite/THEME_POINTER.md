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

## Aktueller Theme-Stand (Stand 2026-04-22 nach S2.3-checkups)

| Eintrag | Wert |
|---------|------|
| Commit-Hash | `c7acaf7` (auf `058b062` → `15cf331` → `70d1b29` → `ae9b1b8` folgend) |
| Commit-Message | `feat(s2.3-checkups): cluster checkups + bridge zu Juvantis (PXZ_VERSION 2.7.15)` |
| PXZ_VERSION | `2.7.15` |
| S2.3-checkups-Bedeutung | Cluster `checkups` Content-Migration (6 P0): Hub `/check-ups/` mit Card-Grid (NEU `template-checkup-hub.php`) · Detail-Pages Gesundheits/Cardio/Angio/Tumor auf `template-standard.php` mit Hero-Image + modernisiertem Content (Doppeltexte raus durch Verlinkung auf Detail-Pages) · Bridge `/basic-check/` (NEU `template-bridge-product.php`) → vom WP-Adapter aus `trunk/content/products/bluttests/basic-check.yaml` (views.praxis) gerendert, **CW-001 Roundtrip-Beweis erneuert**. NEU: `inc/cross-brand-cta.php` (`pxz_cross_brand_cta($partner,$product,$variant)` mit Registry, Card-/Inline-Variante) + `assets/css/cross-brand-cta.css`. 6 SEO-Funktionen in `inc/seo-data.php` (MedicalProcedure / MedicalClinic). 3 Detail-Pages verlinken auf `/basic-check/`, Bridge verlinkt auf sanexio.eu. HWG-konform. Home + Karriere unverändert (CSS-Audit + 0 neue Klassen). 12/12 AKs grün. Siehe `specs/sprint-2/evidence/2026-04-22_s2.3-checkups/self-check.md`. |
| S2.3-kern-Bedeutung | Cluster `kern` Content-Migration: Kontakt auf `template-kontakt.php` mit Google-Maps + Parkplatz-Hinweisen + Formular-Fallback · Sprechstunden-Page neu (ID 9673) mit Sprechzeiten-Tabelle + offener Sprechstunde + Doctolib-CTA + bedingter Aktuelles-Sektion (WP-Option-editierbar) · `inc/practice-data.php` als Single-Source-of-Truth für Adressen/Sprechzeiten/Telefone/Doctolib-URL · Home MD5-Null-Delta bewiesen (normalisiert `?ver=`/`?v=`) · Karriere-Archive-MD5 MATCH, keine Änderung. Siehe `specs/sprint-2/evidence/2026-04-21_s2.3-kern_self-check.md` (12/13 AK grün, 1 partial).
| Bedeutung | S2.3 Batch B Content — 3 P0-Seiten mit Echt-Content + theme-eigene SEO-Meta-Schicht. `inc/seo-data.php` + `inc/seo-meta.php` unterdrücken AIOSEO auf überschriebenen Seiten. `template-standard.php` dynamisiert aus `post_meta`. `standard.css` + `404.css` Finals (Tokens-only). 404.php erweitert um Search-Form + 3 Top-Links. 21/21 smoke-seo-Assertions grün. Home+Karriere 5/6 MD5-MATCH, 1/6 Delta (home_tablet768, dokumentiert S2.3-B-LL-1). |
| Architektonische Verschiebung | Sprint-Reihenfolge: S2.2 ✅ → S2.0b ✅ → S2.0e ✅ → S2.0f ✅ → S2.3-B ✅ → S2.3-C + S2.3-G + S2.0d verbleiben |
| Verify.sh-Stand | grün (§1–§4, alle Computed-Styles + 10/10 Alignment + Component-Probe) |
| smoke-seo.sh-Stand | **21/21 grün** (title/meta/canonical/og/jsonld auf praxis+team+404) |
| Letzte Dr.-Stracke-Freigabe | 2026-04-19 (S2.3-B-Spec freigegeben, Architekten-Entscheidungen F1…F7 delegiert, Content-Ton-Direktive: modern/Puls der Zeit/Rundumversorgung) |

### Versionskette des Themes (Stand 2026-04-22, Ende S2.3-checkups)

```
c7acaf7  feat(s2.3-checkups): cluster checkups + bridge zu Juvantis (PXZ_VERSION 2.7.15)
058b062  feat(s2.3-kern): populate sprechstunden page + aktuelles setting (2.7.14)
15cf331  feat(s2.3-kern): populate kontakt page (template + css + DB template switch)
70d1b29  feat(s2.3-kern): extract practice-data SSoT from homepage-data (2.7.14)
ae9b1b8  feat(s2.3-b-rev4 / Option A): universal page.php + site-wide nav via wp_body_open
dd1de0f  feat(s2.3-b-rev3): Sanexio logo for /team/ brand switch
e2bb7b1  feat(s2.3-b-rev2): unified site header via template-part + nav.css
81d3f62  feat(s2.3-b-rev): Dr.-Stracke-Feedback — branding + H1 sizes + team grid + 404 cartoon
74a9512  feat(s2.3-b): SEO-Layer, /praxis/+/team/+404 content, PXZ_VERSION 2.7.9
8f596f7  refactor(s2.0b): extract promoted classes from homepage.css + add specificity fix
08f40ff  feat(s2.0b): add components.css Schicht 3 + pxz-components enqueue + PXZ_VERSION 2.7.8
dd3e4e1  fix(s2.2): comment strings triggering WP page-template auto-discovery
6c02cb4  feat(s2.2): 8 skelett-templates + functions.php enqueue + PXZ_VERSION 2.7.7
c4f18ba  feat(s2.0c): tokens.css v2 with 4-layer model; bump PXZ_VERSION 2.7.5 → 2.7.6
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
