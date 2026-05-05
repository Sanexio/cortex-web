---
sprint: γ (Trunk-First-i18n-Migration)
phase: 0 (Skizze)
status: SHELVED — 2026-05-05 zurückgestellt (Dr.-Stracke-Entscheidung WPML behalten)
created: 2026-05-05
shelved: 2026-05-05
trigger: Dr.-Stracke-Entscheidung 2026-05-05 — WPML komplett ablösen
shelf_reason: Dr.-Stracke-Entscheidung 2026-05-05 (Welle F-1) — WPML wird beibehalten. Sprint γ wird nicht weiter verfolgt; bei späterer Re-Aktivierung als neuer Sprint mit dieser Spec als Ausgangspunkt.
predecessors: Welle G (Trunk-i18n κ Architektur, sD), Welle G3-Voll (62×5 Trunk-YAMLs ergänzt), Welle H (Cleanup), Welle F (Übergangs-Live)
---

# Sprint γ — Trunk-First-i18n-Migration (SHELVED)

> **STATUS 2026-05-05: Sprint zurückgestellt.** Dr. Stracke hat bei Welle F-1
> entschieden, WPML als Übersetzungs-Plattform beizubehalten. Die folgende
> Spec bleibt als Referenz erhalten, falls die Architektur-Entscheidung in
> einer späteren Sprint-Welle erneut auf den Tisch kommt.
>
> **Konsequenz:**
> - WPML bleibt aktive Plattform-Schicht (sitepress-multilingual-cms +
>   wpml-import + wpml-media-translation + wpml-string-translation)
> - 315 Übersetzungen leben weiter in `wp_posts` mit `wp_icl_translations.trid`
> - Trunk bleibt Master für Theme + 27 Hubs, WP-DB bleibt Träger der
>   Detail-Page-Übersetzungen
> - Sprint γ-Phasen (γ.1–γ.8) werden NICHT umgesetzt

---

## Ursprünglicher Auftrag (historisch)

> **Auftrag:** WPML als Plattform-Schicht entfernen. Alle 315 Übersetzungen
> leben dann ausschließlich im Trunk (`trunk/content/pages/_shared/<slug>.yaml`),
> Theme rendert sprach-aware ohne WPML-Hooks, WP-Pages werden auf
> eine Hülse pro DE-Slug reduziert.

---

## §1 Warum γ und nicht jetzt (in Welle H)

WPML trägt aktuell vier Funktionen:

| Funktion | Träger heute | Träger nach γ |
|---|---|---|
| Posts-Verknüpfung | `wp_icl_translations.trid` | gleicher Slug-Stamm + Sprach-Suffix in YAML |
| Sprach-Erkennung | `ICL_LANGUAGE_CODE` | eigener Helper `pxz_current_lang()` aus `?lang=` Query |
| Sprach-Switcher | `icl_get_languages()` | eigener Theme-Dropdown aus Theme-Config-Liste |
| URL-Routing | WPML-Rewrite-Hooks | reine Query-Param-Lösung oder eigene Rewrite-Rules |

Inhalt-Substanz (315 Übersetzungen) ist bereits **fertig** — sie liegt in
`wp_posts.post_content` der EN/FR/ES/IT/pt-PT-Übersetzungen. Die Migration
ist eine reine Wanderung von WP-DB nach YAML, keine Übersetzungsarbeit.

**Warum nicht in Welle H:** Welle H zielt auf Live-Deploy der Übergangsseite.
Sprint γ ist ein 2-Wochen-Re-Architektur-Sprint. Vermischung würde Welle H um
Wochen verzögern und Übergangs-Live wäre nicht mehr „sofort".

---

## §2 Phasen-Skizze (Detail-Spec folgt nach Welle F)

| Phase | Inhalt | Risiko |
|---|---|:---:|
| **γ.0** | Detail-Spec — pro Phase Acceptance, Backup-Strategie, Rollback | – |
| **γ.1** | Schema-Erweiterung Trunk-YAML auf 6 Sprachen für ALLE Pages (nicht nur die 27 Hubs). Schema-Validation aktualisieren. | gering |
| **γ.2** | **Migration:** Adapter `wp_posts → trunk/content/pages/_shared/*.yaml`. Pro WP-Page mit Trid: alle Sprach-Varianten in eine YAML zusammenführen. Test gegen Trid-Sample. | mittel |
| **γ.3** | **Theme-Refactor:** `ICL_LANGUAGE_CODE` → `pxz_current_lang()`. Helper-Datei + Audit aller WPML-API-Aufrufe (~20 Stellen). | mittel |
| **γ.4** | **Sprach-Switcher Eigenbau:** Dropdown-Komponente, Sprach-Liste aus Theme-Config, URL-Konstruktion über `?lang=` oder Slug-Suffix. | gering |
| **γ.5** | **URL-Routing-Strategie:** Entscheidung zwischen `?lang=de`, lokalisierte Slugs (`/de/`, `/en/`), oder Subdomain. Pro Variante Vor-/Nachteile. | mittel — SEO-relevant |
| **γ.6** | **WPML deaktivieren:** Plugin droppen, `wp_icl_translations` + `wp_icl_translation_status` Tabellen droppen. WP-Pages auf 1 pro DE-Slug reduzieren. | hoch |
| **γ.7** | **Verify:** alle 60 DE-Slugs × 6 Sprachen rendern, kein 500/404, Sprach-Switcher überall, SEO-Tags konsistent. | – |
| **γ.8** | **Live-Deploy** auf Übergangsseite (oder direkt Greenfield, je nach Zeitpunkt). | hoch |

---

## §3 Voraussetzungen vor γ-Start

- [ ] Welle H abgeschlossen (Cleanup vor Live-Deploy)
- [ ] Welle F abgeschlossen (Übergangsseite live, Druck weg)
- [ ] Greenfield-POC-Stand bekannt (gleiche Architektur wie γ → Synergien)
- [ ] WPML-Backup als „Recovery-Anker" archiviert (`_backups/gamma/wpml-pre-migration.sql.gz`)

---

## §4 Cross-Architektur — Greenfield + γ

Greenfield-Pfad (GR-1 Bootstrap-Manifest) wird **WPML-frei** konzipiert.
Greenfield übernimmt direkt die γ-Architektur:
- WP-Instanz ohne WPML-Plugin
- Theme mit `pxz_current_lang()` statt `ICL_LANGUAGE_CODE`
- Pages werden aus Trunk-YAMLs erzeugt, nicht aus WP-Admin

→ Sprint γ liefert die **Brücke** zwischen Übergangsseite (mit WPML) und
Greenfield (ohne WPML). Cutover ist dann nicht nur ein DNS-Wechsel,
sondern auch ein Architektur-Wechsel auf eine bereits validierte Basis.

---

## §5 Offene Fragen (zur Phase-γ.0-Klärung)

- F-γ-1: URL-Routing-Variante (`?lang=` Query / Slug-Suffix `/en/` / Subdomain `en.westend-hausarzt.com`) — SEO-Trade-off und WP-Konventionen
- F-γ-2: Was mit AIOSEO-JSON-LD-Schema-Description, das aktuell 4 Pages noch DE im Schema hat? In γ.1 mit-migrieren?
- F-γ-3: Wie viele 4xxx-Page-IDs (alte WPML-Übersetzungen) sollen nach γ.6 als 301-Redirect erhalten bleiben? (SEO-Continuity)

---

*Vollständige Spec wird nach Welle F erstellt — γ.0 als eigener Phase-Block.*
