# Strategische Entscheidung: Plattform + Bridge
## Praxis-Webseite (`westend-hausarzt.com`) × Juvantis-Webseite (`sanexio.eu`)

> **Typ:** Architekten-Modus Phase 1 (Verständnis) + Phase 2 (Lösungsdesign)
> **Stand:** 2026-04-18
> **Autor:** Claude (im Auftrag Dr. Stracke)
> **Regel:** LL-034 — Optionen + Trade-offs, keine Empfehlung. Entscheidung trifft Dr. Stracke.
> **Nächster Schritt nach Entscheidung:** Sprint-Plan anpassen (`_rules/ARCHITECTURE.md`), Bridge-Spec schreiben.

---

## 0. Zusammenfassung in 6 Sätzen

1. Es werden **zwei getrennte Projekte** bleiben — rechtlich, organisatorisch, markentechnisch. Diese Trennung ist nicht verhandelbar (HWG, Berufsordnung, Sanexio GmbH ≠ Praxis).
2. Die **technische Plattform** ist offen — WordPress bleiben, Shopify übernehmen, Hybrid, Headless oder Webflow.
3. Die **Bridge** ist ein unabhängiges Problem: auch wenn beide Sites auf derselben Plattform liegen, braucht es ein definiertes Sync-Modell (was ist Master, welche Richtung, welcher Trigger).
4. Die **FTP-Störung** bei domainfactory ist ein Symptom, keine Plattform-Entscheidung. Sie lässt sich mit jeder Architektur isolieren — sie taugt nicht als alleiniger Switch-Grund, wohl aber als Katalysator.
5. Kritische Nebenbedingungen, die oft übersehen werden: **Heilmittelwerbegesetz (HWG)**, **Berufsordnung der Landesärztekammer**, **WPML-vs-Shopify-Multi-Language**, **172 Legacy-Seiten** und **Juvantis Auto-Sync-Hook, der schon produktiv läuft**.
6. Die Entscheidungen bauen aufeinander auf: erst Plattform Praxis, dann Bridge-Modell, dann Master-Quelle. Deshalb diese Reihenfolge im Dokument.

---

## 1. Phase 1 — Verständnis

### 1.1 Ziele (priorisiert)

| # | Ziel | Warum kritisch |
|---|------|-----------------|
| Z1 | Praxis-Webseite rechtssicher & wartbar online bringen | Dr. Strackes Tagesgeschäft, Patientenerwartung, SEO |
| Z2 | Juvantis-Distributionsnetzwerk skalieren (Partnerpraxen) | Sanexio-Wachstum, Umsatzträger |
| Z3 | Gemeinsame Inhalte (Produkte, Content) nicht doppelt pflegen | Zeit Dr. Stracke ≫ Tool-Kosten |
| Z4 | Produkt-Änderungen auf der einen Seite schlagen auf die andere durch | Konsistenz, Vermeidung von Preis-/Infokonflikten |
| Z5 | Rechtlich saubere Trennung Arztpraxis ↔ Sanexio GmbH | HWG, Berufsordnung, GmbH-Haftung |
| Z6 | Wartbar für **EINEN** Nicht-ITler (Dr. Stracke) ohne Dauer-Agentur | Bootstrapped Startup + laufende Praxis |

### 1.2 Constraints (harte Rahmenbedingungen)

| ID | Constraint | Quelle |
|----|-----------|--------|
| C-1 | Praxis darf nicht kommerziell anpreisend auftreten | HWG §1, §3; Berufsordnung §27 LÄK Hessen |
| C-2 | Sanexio GmbH DARF kommerziell werben (Produktverkauf) | Gewerbe, kein Arzt-Berufsrecht |
| C-3 | Praxis-Domain: `westend-hausarzt.com` / `.de` bleibt | SEO, Printmaterial, Visitenkarten |
| C-4 | Juvantis-Domain: `sanexio.eu` bleibt | Markenrecht, GitHub/Shopify/Apple schon konfiguriert |
| C-5 | WPML läuft installiert, WordPress kennt 172 Legacy-Seiten | Sprint-2-Scope |
| C-6 | Shopify-Store `medzpoint` ist produktiv, GitHub-Sync aktiv | Juvantis-Deploy-Pipeline |
| C-7 | Dr. Stracke ist Alleingründer, kein dediziertes Dev-Team | Zeit + Komplexitätsbudget |
| C-8 | Go-Live-Fähigkeit Praxis im Sprint 4 geplant | Aktueller Sprint-Plan |
| C-9 | `_shared/` existiert strukturell, aber ohne Auto-Sync | Manuelle Pflege reicht aktuell nicht |
| C-10 | FTP-Zugang zu domainfactory aktuell nicht auffindbar | Sprint 1 pausiert |

### 1.3 Das eigentliche Problem in einem Satz

> **„Wie bekomme ich ZWEI rechtlich getrennte Webseiten mit gemeinsamer Produkt-/Content-Substanz so gebaut, dass ich Inhalte nur EINMAL pflege, die Plattformen aber getrennt bleiben?"**

Das ist KEIN Plattform-Problem — das ist ein **Content-Operating-Model-Problem**. Die Plattform ist nur das Werkzeug zur Umsetzung.

### 1.4 Rechtliche Besonderheiten — oft unterschätzt

| Thema | Auswirkung |
|-------|-----------|
| **HWG §11 Abs. 1 Nr. 11** | Keine Werbung mit Dankschreiben/Gutachten-Anpreisungen für ärztliche Leistungen. Shopify-Produkt-Karussells auf Praxis-Site → grenzwertig. |
| **Berufsordnung LÄK Hessen §27** | Sachliche Information erlaubt, berufswidrige Werbung verboten. „Jetzt im Shop bestellen"-Buttons auf Praxis-Site sind problematisch. |
| **DSGVO** | Shopify = EU-Server (Dublin), Parent Company Kanada. WordPress bei domainfactory (DE) ist datenschutzrechtlich gradliniger. |
| **Impressums-/Anbieter-Pflichten** | Praxis = Dr. Stracke (freier Beruf). Juvantis = Sanexio GmbH (HRB, Geschäftsführer). **Jede Site braucht eigenes Impressum** — keine Vermischung. |
| **Steuerrecht** | Praxis-Umsatz ist freiberuflich (umsatzsteuerbefreit §4 Nr. 14 UStG). Juvantis-Umsatz ist gewerblich (USt-pflichtig). Shared Checkout/Shop wäre steuerlich unsauber. |

**Konsequenz:** Selbst wenn beide Sites technisch auf einer Plattform liegen, müssen sie als **getrennte Mandanten/Stores** auftreten. Keine gemeinsame Kasse, keine gemeinsamen AGB, keine geteilten „Jetzt buchen"-Flows.

---

## 2. Phase 2a — Plattform-Optionen Praxis-Webseite

Fünf real diskutierbare Optionen. Juvantis bleibt in allen Optionen auf Shopify (dort läuft es, keine Gründe zu wechseln).

### Option P1 — WordPress bleiben (Status Quo, FTP reparieren)

| Aspekt | Bewertung |
|--------|-----------|
| Aufwand Migration | **0** — bestehendes Theme weiter nutzen |
| Aufwand Sprint-Plan-Anpassung | Minimal — FTP-Problem separat lösen (SFTP-Reset, WebDAV, Plesk-Filemanager, oder direkt Git→Deploy via GitHub Actions) |
| Kosten laufend | domainfactory-Tarif (bereits da) |
| 172 Legacy-Seiten | Bleiben, Sprint-2-Migration wie geplant |
| WPML (DE/EN/FR/ES) | Weiterhin nutzbar — WPML ist eines der reifsten Multi-Language-Systeme |
| Rechtliche Sauberkeit | Hoch — klassisches Praxis-CMS, keine Shop-Optik |
| Bridge-Komplexität | Mittel — WordPress ≠ Shopify, braucht API-Sync |
| Performance | Mittel — WP+Plugins, optimierbar |
| Dr.-Stracke-Wartbarkeit | Mittel — WP-Admin kennt er |
| Lock-in | Niedrig — WordPress ist portabel |

**Pro:** Nichts wegwerfen, Architekten-Modus-Sprints 2/3/4 laufen weiter, rechtlich unverdächtig, alles eingerichtet.
**Contra:** FTP-Problem bleibt aktuell, zwei Plattformen = doppelter Mental-Overhead, Bridge muss gebaut werden.

---

### Option P2 — Praxis auf Shopify migrieren (zweiter Store)

| Aspekt | Bewertung |
|--------|-----------|
| Aufwand Migration | **Hoch** — 172 Legacy-Seiten, WP-Forms → Shopify-Forms, WPML → Shopify-Markets |
| Aufwand Sprint-Plan-Anpassung | **Reset** — aktueller Sprint 2 für WordPress wird obsolet, neue Sprints für Shopify |
| Kosten laufend | **2× Shopify-Abo** (Juvantis + Praxis) — ab ~$29/mo/Store, real eher $79/mo (Premium-Features) → **~$200/mo Mehrkosten** |
| 172 Legacy-Seiten | Alle neu in Liquid/Shopify-Pages übertragen |
| WPML (DE/EN/FR/ES) | **Shopify Markets** ist kein 1:1-Ersatz. Mehrsprachigkeit auf Shopify ist schwächer als WPML (weniger SEO-Kontrolle, Sprach-Übersetzungs-UX eingeschränkt, je nach Plan begrenzt) |
| Rechtliche Sauberkeit | **Problematisch** — Shopify-Optik suggeriert Commerce, HWG/Berufsordnung sehen das kritisch; Commerce-Features (Cart, Checkout) müssen komplett deaktiviert werden |
| Bridge-Komplexität | **Trivial** — beide Sites im Shopify-Ökosystem, Produkte über Collections referenzierbar, gleicher Admin |
| Performance | Hoch (Shopify CDN) |
| Dr.-Stracke-Wartbarkeit | Hoch — er kennt Shopify bereits von Juvantis |
| Lock-in | **Hoch** — Shopify-Exit ist schmerzhaft (Liquid-spezifisch) |

**Pro:** EIN Admin für alles, Bridge trivial (weil selbes Ökosystem), FTP-Problem komplett weg, GitHub-Deploy wie bei Juvantis.
**Contra:** Commerce-Plattform für Arztpraxis rechtlich grenzwertig, WPML-Downgrade, Re-Migration 172 Seiten, doppelte Shopify-Kosten, starker Vendor-Lock-in.

> **Hinweis:** Shopify hat keinen dedizierten „Content-only-Modus". Cart/Checkout lassen sich per Theme-Code ausblenden, aber strukturell bleibt es ein Shop — inklusive Admin-Begriffe wie „Produkte", „Bestellungen".

---

### Option P3 — Hybrid: Praxis bleibt WordPress, Produkte LEBEN auf Juvantis-Shopify

| Aspekt | Bewertung |
|--------|-----------|
| Aufwand Migration | **Niedrig** — Praxis bleibt WP, auf der Praxis-Site werden Produkt-Referenzen eingebunden (Embed, Link, iframe, oder rendert via Shopify Storefront API) |
| Aufwand Sprint-Plan-Anpassung | Gering — Sprint 2/3/4 laufen weiter, neue Teil-Aufgabe „Produkt-Embed" |
| Kosten laufend | Nur Juvantis-Shopify-Abo (bereits da) + domainfactory (bereits da) |
| 172 Legacy-Seiten | Bleiben, keine Re-Migration |
| WPML (DE/EN/FR/ES) | Unverändert nutzbar |
| Rechtliche Sauberkeit | **Gut lösbar** — Praxis-Site bleibt inhaltlich; „Mehr Infos" führt zu sanexio.eu (getrennte Marke, Sanexio-Impressum, Sanexio-AGB) |
| Bridge-Komplexität | **Niedrig bis Mittel** — Produkte sind nur einmal (Shopify), Praxis-Site zieht sie per Storefront-API lesend |
| Performance | Gut |
| Dr.-Stracke-Wartbarkeit | Mittel — Produkt-Pflege nur in Shopify, Praxis-Content nur in WP → klare Zuständigkeit |
| Lock-in | Niedrig (WP portabel, Shopify nur für Produkte) |

**Pro:** Rechtlich am saubersten (klare Markentrennung), billigste Variante, keine Re-Migration, Produkte-Master ist eindeutig (Shopify), Bridge entfällt in der Form weil Praxis nur liest.
**Contra:** Teil-UX-Bruch beim Wechsel auf sanexio.eu (bewusster Übergang, kann aber auch als Feature verkauft werden: „In Kooperation mit Sanexio"), zwei Systeme bleiben.

---

### Option P4 — Headless: Sanity / Contentful / Strapi + Next.js für beide Sites

| Aspekt | Bewertung |
|--------|-----------|
| Aufwand Migration | **Sehr hoch** — beide Sites neu bauen, Content-Modell definieren, Frontend-Entwicklung |
| Aufwand Sprint-Plan-Anpassung | **Kompletter Reset** beider Projekte |
| Kosten laufend | Sanity: gratis bis 3 user; Contentful: ab ~$300/mo; Strapi: selbst hosten; + Vercel/Netlify ~$20/mo |
| 172 Legacy-Seiten | Alle in Sanity einpflegen |
| WPML-Funktionalität | Headless-CMS haben i.d.R. gutes I18n (Feldebene) — potenziell besser als Shopify, vergleichbar mit WPML |
| Rechtliche Sauberkeit | Hoch — beide Frontends individuell gestaltbar |
| Bridge-Komplexität | **Trivial** — gemeinsames Schema, beide Frontends rendern aus derselben Quelle |
| Performance | Exzellent (statische/ISR-Generierung) |
| Dr.-Stracke-Wartbarkeit | **Niedrig kurzfristig** — Dr. Stracke müsste Next.js + Sanity lernen oder Agentur beauftragen |
| Lock-in | Mittel (Content portabel, Frontend-Code bleibt) |

**Pro:** Architektur der nächsten 10 Jahre, beste Bridge-Qualität („Bridge" ist dann keine Bridge mehr, sondern shared source), maximale Designfreiheit.
**Contra:** Projekt-Reset, Timeline Praxis-Go-Live 2026 nicht haltbar, Dr. Stracke als Maintainer überfordert ohne externe Hilfe, Shopify müsste ebenfalls als Commerce-Layer bestehen bleiben (Headless-Commerce via Shopify Storefront-API).

---

### Option P5 — Webflow für beide Sites

| Aspekt | Bewertung |
|--------|-----------|
| Aufwand Migration | **Hoch** — beide Sites neu in Webflow |
| Aufwand Sprint-Plan-Anpassung | Reset beider Projekte |
| Kosten laufend | Webflow Business ~$49/mo × 2 + Webflow-Commerce schwächer als Shopify |
| 172 Legacy-Seiten | Re-Import nötig |
| WPML-Funktionalität | Webflow Localization (mittelmäßig, Extra-Kosten) |
| Rechtliche Sauberkeit | Hoch |
| Bridge-Komplexität | Mittel — Webflow hat CMS-Collections, Sync via Zapier/Make möglich |
| Performance | Gut |
| Dr.-Stracke-Wartbarkeit | Hoch (Visual Builder) |
| Lock-in | Hoch (Webflow-Export ist HTML-Dump, kein CMS) |

**Pro:** Moderner Visual Builder, Dr.-Stracke-freundlich, beide Sites auf einer Plattform.
**Contra:** Shopify-Commerce muss trotzdem bleiben (Webflow-Commerce reicht nicht für Juvantis-Produkte), also effektiv **drei** Systeme, Re-Migration beider Sites, Lock-in.

---

### Plattform-Vergleichsmatrix (aggregiert)

| Kriterium | P1 WP bleiben | P2 Shopify-2 | P3 Hybrid | P4 Headless | P5 Webflow |
|-----------|:--:|:--:|:--:|:--:|:--:|
| Migrations-Aufwand | ★★★★★ | ★☆☆☆☆ | ★★★★★ | ★☆☆☆☆ | ★★☆☆☆ |
| Laufende Kosten | ★★★★★ | ★★☆☆☆ | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ |
| Rechtliche Sauberkeit Praxis | ★★★★★ | ★★☆☆☆ | ★★★★★ | ★★★★★ | ★★★★★ |
| Mehrsprachigkeit | ★★★★★ | ★★★☆☆ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Bridge-Komplexität (je besser desto einfacher) | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| Dr.-Stracke-Wartbarkeit | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★☆☆☆☆ | ★★★★☆ |
| Vendor-Lock-in-Risiko (je besser desto niedriger) | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ |
| Zeitplan-Verträglichkeit Go-Live | ★★★★☆ | ★★☆☆☆ | ★★★★★ | ★☆☆☆☆ | ★★☆☆☆ |
| **Summe (von 40)** | **34** | **21** | **36** | **22** | **22** |

> Zahlen sind keine Empfehlung, nur strukturiertes Sichtbarmachen der Trade-offs. Die Gewichtung der Kriterien ist Dr. Strackes Entscheidung.

---

## 3. Phase 2b — Bridge-Architektur-Optionen

**Wichtig:** Diese Optionen sind zum Teil **unabhängig** von der Plattform-Wahl, zum Teil hängen sie zusammen.

### Bridge-Option B-A — Dateisystem `_shared/` mit Git (Status Quo ausgebaut)

```
~/Cortex/projects/_shared-cross/
├── brand/        ← Logos, CI
├── content/      ← Claims, Produkt-Kurztexte
├── legal/        ← Impressums-Bausteine
├── products/     ← Produkt-Master als JSON/YAML
└── CHANGELOG.md
```

- Beide Sites haben Build-Skripte, die aus `_shared/` ihre Outputs generieren
- Git = Wahrheit; Änderungen via Commit; Branches/Tags möglich

**Pro:** Kostenlos, transparent, Rollback trivial, funktioniert plattform-agnostisch.
**Contra:** Kein „Ich ändere Preis in Shopify und alles aktualisiert sich" — Änderung muss erst in `_shared/` wandern; Dr.-Stracke-Workflow wird gebrochen, weil Shopify-Admin nicht primär genutzt werden kann.

---

### Bridge-Option B-B — Shopify als Master (Single Source of Truth)

- Produkte, Preise, Produkt-Content → **Shopify-Admin** (dort pflegt Dr. Stracke sowieso)
- Webhooks (Shopify → Middleware) bei `products/update`
- Middleware = kleiner Bun/Node-Service (läuft lokal oder auf Render/Fly.io für ~$5/mo)
- Middleware pusht die Änderung an Praxis-Site (WP REST API, Webflow-CMS-API, oder Next.js-Revalidation)

**Pro:** Einheitlicher Ort für Produkt-Pflege, Shopify-Admin bleibt zentral, automatischer Sync.
**Contra:** Middleware muss entwickelt + betrieben werden, Praxis-Site kann Produkte nicht editieren (nur lesen), bei Middleware-Ausfall Sync-Delay.

> Kompatibel mit P1, P3, P4, P5. Bei P2 (beides Shopify) ist diese Bridge entweder trivial (gemeinsame Collections) oder sogar unnötig (Shared-Ressourcen via Shopify-Metaobjekte).

---

### Bridge-Option B-C — Headless-CMS als zentrale Quelle

- Sanity/Contentful/Strapi pflegt Produkt-Stammdaten, Content-Bausteine, Medien
- Shopify und Praxis-Site ziehen per API
- Shopify bleibt Checkout-System (Preise kommen aber aus Sanity)

**Pro:** Professionelle Lösung, Designer-UX für Content-Pflege, Multi-Channel-fähig (iOS-App könnte auch ziehen).
**Contra:** Drittsystem, Lernkurve, zusätzliche Kosten, Shopify-Preise-Sync nicht out-of-the-box.

> Kompatibel mit allen Plattformen. Am stärksten bei P4, überdimensioniert bei P1/P3.

---

### Bridge-Option B-D — Shopify-Metaobjekte + Storefront-API (Shopify-native)

- Shopify 2.0 bietet **Metaobjekte**: strukturierte, wiederverwendbare Daten (z.B. „Produkt-Kurztext", „Partnerpraxis-Card")
- Praxis-Site (egal welche Plattform) zieht per **Storefront-API** lesend aus Shopify
- Shopify ist Master; Schreiben nur in Shopify

**Pro:** Kein Drittsystem, Shopify bietet dies nativ, API ist ausgereift, Dr. Stracke arbeitet im gewohnten Shopify-Admin.
**Contra:** Praxis-Site muss Storefront-API-Calls bauen (Technik-Aufwand), bei Shopify-Ausfall fällt Content auf Praxis-Site aus (Caching gegensteuern).

> Besonders stark bei P1 (WP + Shopify-API-Aufrufe) oder P3 (Hybrid).

---

### Bridge-Option B-E — No-Code-Sync (Zapier / Make / n8n)

- Trigger: „Produkt in Shopify geändert"
- Aktion: „Update WP-Page via REST"
- No-Code-Editor, Dr.-Stracke-freundlich

**Pro:** Keine Programmierung, schnell eingerichtet, flexibel.
**Contra:** Laufende Kosten (Zapier ab ~$20/mo, n8n self-host gratis aber zu betreiben), Fehlerbehandlung bei komplexen Feldern dürftig, Vendor-Risiko.

---

### Bridge-Vergleichsmatrix

| Kriterium | B-A Git | B-B Shopify-Master | B-C Headless-CMS | B-D Metaobjekte | B-E No-Code |
|-----------|:--:|:--:|:--:|:--:|:--:|
| Einrichtungsaufwand | ★★★★☆ | ★★☆☆☆ | ★★☆☆☆ | ★★★☆☆ | ★★★★★ |
| Laufende Kosten | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ |
| Automatisierung | ★☆☆☆☆ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★☆ |
| Dr.-Stracke-UX (Arbeitsfluss) | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| Fehlerrobustheit | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ |
| Multi-Channel-Erweiterbarkeit (iOS-App!) | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ | ★★☆☆☆ |

---

## 4. Kombinations-Entscheidungen

| Plattform-Wahl | Sinnvollste Bridge | Warum |
|---------------|--------------------|-------|
| **P1 (WP bleiben)** | B-D (Metaobjekte) oder B-B (Shopify-Master) | Produkte nur in Shopify, WP liest via Storefront-API |
| **P2 (beides Shopify)** | nativ (gemeinsame Metaobjekte im 2. Store ODER Duplikate mit B-B) | EIN Ökosystem |
| **P3 (Hybrid)** | B-D (Metaobjekte) | Produkte leben nur 1× in Shopify, Praxis zeigt via Embed/API |
| **P4 (Headless)** | B-C (Headless-CMS) | Headless IST die Bridge |
| **P5 (Webflow)** | B-E (Zapier/Make) oder B-B | Pragmatisch |

---

## 5. Was ist in jeder Option mit dem aktuellen Sprint-Plan?

| Option | Aktuelle Sprints praxis-redesign | Aktueller Stand Juvantis |
|--------|----------------------------------|--------------------------|
| P1 | Weiter wie geplant; FTP-Fix separat (Sprint 1 unblocken) | Unverändert |
| P2 | **Sprint-Reset**, komplett neu auf Shopify; Sprint 2/3/4 obsolet | Unverändert, aber Brand-Anpassung für 2. Store |
| P3 | Weiter wie P1, + neuer Sprint „Produkt-Embed-Layer" | Unverändert, evtl. Metaobjekte hinzufügen |
| P4 | **Sprint-Reset**, neuer Tech-Stack; 6-12 Mo Verzögerung | Bleibt auf Shopify oder parallel-Migration |
| P5 | Sprint-Reset Praxis; Juvantis bleibt | Unverändert |

---

## 6. Risiken & blind spots

| ID | Risiko | Betrifft |
|----|--------|----------|
| R-1 | **HWG-Abmahnung** (Kammer, Wettbewerbszentrale) bei shop-nahem Auftritt der Praxis | P2 (hoch), P3/P5 (mittel), P1/P4 (gering) |
| R-2 | **WPML-Verlust** bei Shopify-Migration — DE/EN/FR/ES-Setup zerbricht | P2 |
| R-3 | **Shopify-Abhängigkeit** bei Ausfall/Preiserhöhung | P2, P4 (teilweise) |
| R-4 | **Timeline** — Go-Live 2026 nicht haltbar | P2, P4, P5 |
| R-5 | **Middleware-Ausfall** bricht Sync → veraltete Preise | B-B, B-C, B-E |
| R-6 | **Lizenzrechte an Bildern/Videos** — Master in `_shared/` muss Rechte-Metadaten tragen | Alle Bridge-Optionen |
| R-7 | **Juvantis-Design ≠ Praxis-Design** — shared Components kommen mit Brand-Konflikten | Alle Bridge-Optionen |
| R-8 | **Domain-Crossover** — Patienten auf sanexio.eu zu leiten vs. Sanexio-Kunden auf westend-hausarzt.com braucht klares UX-Konzept | P3 insbesondere |

---

## 7. Offene Entscheidungsfragen an Dr. Stracke

Diese Fragen strukturieren die Entscheidung. Reihenfolge ist wichtig — sie bauen aufeinander auf.

### F1 — Wie viele Produkte / wie viel gemeinsamer Content real?

Wenn die Schnittmenge klein ist (<20 Items), ist **B-A Git-basiert** völlig ausreichend. Wenn die Schnittmenge wächst (>50 Items oder aktive Preisänderungen pro Woche), wird **B-B/B-D** pflicht.

### F2 — Soll die Praxis-Site kommerziell wirken dürfen?

- **Nein (rechtlich sauber):** P1 oder P3 oder P4.
- **Ja (Risiko akzeptiert):** P2 oder P5.

### F3 — Ist der FTP-Ausfall der Auslöser oder nur der Anlass?

- **Anlass**: FTP reparieren (Domainfactory-Support, SFTP-Reset, oder Switch auf GitHub-Actions-Deploy), alles andere bleibt.
- **Auslöser**: Plattform-Neubewertung — dann ehrlich durchziehen, nicht halbherzig.

### F4 — Wer pflegt Content in 12 Monaten realistisch?

- **Dr. Stracke allein**: P1/P3 (WP-Admin kennt er), B-D/B-B (Shopify-Admin als Primärtool).
- **Externe Agentur später geplant**: P4 (Headless) wird zukunftsfähig.

### F5 — Welche Domain-Strategie für Juvantis-Content in der Praxis?

- a) Patienten bleiben auf westend-hausarzt.com, Produkte werden dort dargestellt (P1/P2/P3 mit eingebetteten Inhalten)
- b) Patienten werden bewusst zu sanexio.eu geleitet (P3 mit „In Kooperation mit"-Button)
- c) Cross-Branding — kann je nach Berufsordnung problematisch sein

### F6 — Wie viel technische Infrastruktur willst Du selbst betreiben?

- **Minimum:** P1 + B-A (beides vorhanden, kein neuer Service)
- **Mittel:** P1/P3 + B-B (ein kleiner Sync-Service, z.B. via telegram-bridge-Pattern)
- **Maximum:** P4 + B-C (CMS, Frontend-Deploy, Pipelines)

---

## 8. Vorgeschlagene nächste Schritte (nach Entscheidung)

> Je nach Deiner Entscheidung auf F1-F6 ändern sich die Schritte. Beispielhaft die häufigsten Pfade:

### Pfad „P1 + B-D" (WP bleiben, Bridge via Shopify-Metaobjekte)
1. FTP/SFTP-Problem bei domainfactory lösen (Sprint 1 entblocken) oder auf GitHub-Actions-Deploy umsteigen
2. Spec `specs/bridge-strategy/bridge-v1-metaobjekte.md` schreiben (Metaobjekt-Schema, Storefront-API-Auth, WP-Plugin oder Shortcode)
3. Produkt-Inventar erstellen: Welche Produkte sind auf beiden Sites?
4. WP-Theme um Storefront-API-Client erweitern (Cache-Layer wichtig)
5. Sprint 2 praxis-redesign weiter + parallel Bridge-Sprint

### Pfad „P3 + B-D" (Hybrid)
1. Spec für Produkt-Embed-Layer schreiben (was genau wird auf Praxis-Site gezeigt?)
2. Markentrennung definieren: Welche Texte/Icons gehen mit?
3. UX-Konzept: Link zu sanexio.eu ist kein Bruch, sondern ein „Mehr erfahren"-CTA
4. Ansonsten wie P1

### Pfad „P2 + nativ" (Praxis zu Shopify)
1. Kammer-Rechtsberatung einholen (HWG-Risiko klären, Kosten einplanen)
2. Komplett neuer Sprint-Plan, Sprint 0/1 auf Shopify-Side
3. WPML-Alternative prüfen (Shopify Markets + Langify/Weglot)
4. Content-Migrations-Tool bauen (WP → Shopify-Pages)

---

## 9. Was NICHT Thema dieses Dokuments ist

- Welche konkreten Produkte auf beide Sites sollen (→ separates Inventar-Dokument nach Entscheidung)
- DHT-iOS-App-Anbindung (die ist bereits geplant, Shopify-API ist hier der natürliche Partner)
- Konkrete Domain-/DNS-Strategie (→ Implementierungs-Spec)
- Figma-Design-System-Sharing zwischen beiden Sites (→ eigener Design-System-Sprint)

---

## 10. Ablage & Querverweise

| Dokument | Zweck |
|----------|-------|
| **Dieses Dokument** | Entscheidungsgrundlage |
| `_rules/ARCHITECTURE.md` | Wird nach Entscheidung um Bridge-Sprint ergänzt |
| `specs/sprint-2/README.md` | Je nach Entscheidung angepasst |
| `projects/Juvantis/_shared/README.md` | Aktuelles Shared-Konzept — wird je nach Bridge-Option erweitert |
| `projects/Juvantis/_config/WEBSITE_FAHRPLAN.md` | Juvantis-Seitenplan für Cross-Referenz |

---

**Nächster Chat-Schritt:** Dr. Stracke beantwortet F1–F6 (auch stichpunkthaft). Claude erstellt dann die passende Detail-Spec und den angepassten Sprint-Plan.
