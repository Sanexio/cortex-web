// drift-sync / lib / hwg-curate.mjs
// HWG-Auto-Curation für Sanexio-Source → Praxis-Trunk-YAML.
// Spec: specs/drift-sync/SPEC.md §E5.
//
// 5 Schritte (C1–C5):
//   C1 Preise raus (views.praxis.show_prices=false)
//   C2 Sie-Form (Du→Sie via auto_replace aus hwg-vocab.json)
//   C3 CTA-Override (/service/terminanfrage/)
//   C4 HWG-Filter (halt_words → throw, review_words → warn)
//   C5 Bilder spiegeln (Stub — separate Pipeline mirror-shopify-images.sh)

import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const LIB_DIR = dirname(fileURLToPath(import.meta.url));

let _vocab = null;

async function loadVocab() {
  if (_vocab) return _vocab;
  const path = resolve(LIB_DIR, "hwg-vocab.json");
  const content = await readFile(path, "utf8");
  _vocab = JSON.parse(content);
  return _vocab;
}

/**
 * C2 Sie-Form: mechanisches Du→Sie Replace.
 * Returns { text, applied: [{from, to, count}] }
 */
export async function applySieForm(text) {
  if (!text || typeof text !== "string") return { text, applied: [] };
  const vocab = await loadVocab();
  const applied = [];
  let result = text;

  for (const [from, to] of Object.entries(vocab.auto_replace || {})) {
    const count = (result.split(from).length - 1);
    if (count > 0) {
      result = result.split(from).join(to);
      applied.push({ from, to, count });
    }
  }

  return { text: result, applied };
}

/**
 * C4 HWG-Filter: Erkennt Halt-Words (kritische Heilversprechen) und Review-Words.
 * Returns { halts: [...], warnings: [...] }
 *
 * Halt-Words führen zum STOPP der Curation. Review-Words erzeugen Warning, aber
 * der Lauf geht weiter (Page wird draft, manuelle Review).
 */
export async function checkHwgVocab(text) {
  if (!text || typeof text !== "string") return { halts: [], warnings: [] };
  const vocab = await loadVocab();
  const halts = [];
  const warnings = [];

  const lowerText = text.toLowerCase();

  for (const word of vocab.halt_words || []) {
    if (lowerText.includes(word.toLowerCase())) {
      halts.push(word);
    }
  }

  for (const word of vocab.review_words || []) {
    if (lowerText.includes(word.toLowerCase())) {
      warnings.push(word);
    }
  }

  return { halts, warnings };
}

/**
 * Erzeuge ein Praxis-Trunk-YAML-Objekt aus einem Sanexio-Product.
 * Spec: §3.2 (Labor-Page) — Bento-Grid-Karte pro Bluttest, kein Preis.
 *
 * Returns { trunkObject, halts, warnings, ciStats }
 */
export async function curateProductForPraxis({ product, scope, scopeConfig }) {
  const halts = [];
  const warnings = [];
  const ciStats = { sieReplacements: 0 };

  const sourceText = [
    product.title || "",
    product.body_html || "",
    Array.isArray(product.tags) ? product.tags.join(" ") : (product.tags || "")
  ].join("\n");

  // C4: HWG-Halt-Check (zuerst!)
  const hwgCheck = await checkHwgVocab(sourceText);
  halts.push(...hwgCheck.halts);
  warnings.push(...hwgCheck.warnings);

  if (halts.length > 0) {
    return {
      trunkObject: null,
      halts,
      warnings,
      ciStats,
      reason: "HWG_HALT"
    };
  }

  // C2: Sie-Form
  const titleSie = await applySieForm(product.title || "");
  const bodySie = await applySieForm(product.body_html || "");
  ciStats.sieReplacements = titleSie.applied.length + bodySie.applied.length;

  // Erzeuge Product-Trunk-YAML (gemäß product.schema.json)
  const trunkObject = {
    id: product.handle,
    sku: product.variants?.[0]?.sku || `JVT-${product.id}`,
    category: scope === "labor" ? "bluttests" : "untersuchungen",
    status: "active",
    parameters: [
      // Stub — manuelle Pflege erforderlich (Schema-konform mit Platzhalter "—")
      { code: "TBD", einheit: "—" }
    ],
    title: {
      de: titleSie.text
    },
    views: {
      // C1: Preise raus für Praxis-View
      juvantis: {
        show_price: true,
        cta_label: { de: "Jetzt buchen" },
        cta_url: `https://sanexio.eu/products/${product.handle}`
      },
      praxis: {
        show_price: false,
        cta_label: { de: "Termin vereinbaren" },
        cta_url: "/service/terminanfrage/"  // C3: CTA-Override
      }
    }
  };

  // Bilder (C5 Stub — Pfade werden gesetzt, Mirror-Pipeline später)
  if (product.image?.src) {
    trunkObject.images = {
      hero: `media://shopify-mirror/${scope}/${product.handle}-hero`
    };
  }

  return { trunkObject, halts, warnings, ciStats, reason: null };
}

/**
 * Erzeuge ein Praxis-Trunk-YAML-Objekt aus einer Sanexio-Page.
 * Spec: §3.1/§3.2 (Hub-Pages mit Hero + Body).
 */
export async function curatePageForPraxis({ page, scope, scopeConfig }) {
  const halts = [];
  const warnings = [];
  const ciStats = { sieReplacements: 0 };

  const sourceText = [page.title || "", page.body_html || ""].join("\n");

  // C4: HWG-Halt-Check
  const hwgCheck = await checkHwgVocab(sourceText);
  halts.push(...hwgCheck.halts);
  warnings.push(...hwgCheck.warnings);

  if (halts.length > 0) {
    return { trunkObject: null, halts, warnings, ciStats, reason: "HWG_HALT" };
  }

  // C2: Sie-Form
  const titleSie = await applySieForm(page.title || "");
  const bodySie = await applySieForm(page.body_html || "");
  ciStats.sieReplacements = titleSie.applied.length + bodySie.applied.length;

  // Erzeuge Page-Trunk-YAML (gemäß page.schema.json)
  const trunkObject = {
    id: page.handle,
    site: "shared",
    slugs: {
      praxis: page.handle,
      juvantis: page.handle
    },
    title: {
      de: titleSie.text
    },
    views: {
      praxis: {
        show_prices: false,
        cta_url: "/service/terminanfrage/",
        cta_label: { de: "Termin vereinbaren" }
      },
      juvantis: {
        show_prices: true
      }
    },
    wp: {
      page_template: scopeConfig.praxis_target.page_template
    },
    sections: [
      {
        type: "hero",
        eyebrow: { de: "Übernommen aus Sanexio" },
        heading: { de: titleSie.text }
      },
      {
        type: "body",
        body_html: { de: bodySie.text }
      }
    ]
  };

  return { trunkObject, halts, warnings, ciStats, reason: null };
}
