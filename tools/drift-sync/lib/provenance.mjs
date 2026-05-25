// drift-sync / lib / provenance.mjs
// Hash-Berechnung + Drift-Compare für Trunk ↔ Sanexio.
// Spec: specs/drift-sync/SPEC.md §E2 + §E3.

import { createHash } from "node:crypto";

/**
 * Canonicalize ein Shopify-Product-Objekt für drift-stable Hashing.
 * Preise und volatile Felder (updated_at, etc.) werden NICHT in den Hash genommen.
 * → Preisänderungen lösen kein Drift aus (HWG-konform).
 */
export function canonicalizeProduct(product) {
  return {
    handle: product.handle,
    title: product.title,
    body_html: product.body_html || "",
    tags: typeof product.tags === "string"
      ? product.tags.split(",").map((t) => t.trim()).sort()
      : (Array.isArray(product.tags) ? [...product.tags].sort() : []),
    featured_image_src: product.image?.src || null,
    images: Array.isArray(product.images)
      ? product.images.map((img) => img.src).sort()
      : [],
    variant_titles: Array.isArray(product.variants)
      ? product.variants.map((v) => v.title).sort()
      : [],
    metafield_keys: Array.isArray(product.metafields)
      ? product.metafields.map((m) => `${m.namespace}.${m.key}`).sort()
      : []
  };
}

/**
 * Canonicalize ein Shopify-Page-Objekt für drift-stable Hashing.
 */
export function canonicalizePage(page) {
  return {
    handle: page.handle,
    title: page.title,
    body_html: page.body_html || "",
    template_suffix: page.template_suffix || null,
    published_at: page.published_at ? "published" : "unpublished"
  };
}

/**
 * SHA-256 Hash über JSON-stringifizierte Canonical-Form (mit alphabetisch sortierten Keys).
 */
export function computeHash(canonicalData) {
  const sorted = sortKeysDeep(canonicalData);
  const json = JSON.stringify(sorted);
  return createHash("sha256").update(json).digest("hex");
}

function sortKeysDeep(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj === null || typeof obj !== "object") return obj;
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortKeysDeep(obj[key]);
  }
  return sorted;
}

/**
 * Drift-Vergleich: Trunk-YAML vs. Sanexio-Source.
 * Returns { status, current_hash, last_synced_hash, drift_strategy, local_edits }
 *
 * Status-Konstanten (siehe Spec §E4):
 *   NEW          — Source existiert, kein Trunk
 *   CLEAN        — Hash gleich, kein Drift
 *   UPDATED      — Hash unterschiedlich, lokale Edits = false
 *   LOCAL_DRIFT  — Hash unterschiedlich, lokale Edits = true → STOPP
 *   REMOVED      — Trunk hat Provenance, Source nicht mehr da
 *   LOCAL_ONLY   — Trunk hat keine upstream_source (Praxis-eigene Page)
 *   FROZEN       — drift_strategy = "frozen", kein Drift-Check
 */
export function compareDrift({ trunkYaml, currentSource, sourceType }) {
  // Kein Trunk-YAML überhaupt → NEW (Source existiert, kein Trunk)
  if (!trunkYaml) {
    if (currentSource) return { status: "NEW" };
    return { status: "UNKNOWN" };
  }

  const prov = trunkYaml.upstream_source;

  // Trunk existiert aber hat keinen upstream_source-Block → LOCAL_ONLY (Praxis-eigene Page)
  if (!prov) {
    return { status: "LOCAL_ONLY" };
  }

  if (prov.drift_strategy === "frozen") {
    return { status: "FROZEN", drift_strategy: "frozen" };
  }

  if (!currentSource) {
    return {
      status: "REMOVED",
      last_synced_hash: prov.last_synced_hash,
      drift_strategy: prov.drift_strategy
    };
  }

  const canonical = sourceType === "product"
    ? canonicalizeProduct(currentSource)
    : canonicalizePage(currentSource);
  const current_hash = computeHash(canonical);

  if (current_hash === prov.last_synced_hash) {
    return { status: "CLEAN", current_hash, last_synced_hash: prov.last_synced_hash };
  }

  if (prov.local_edits === true) {
    return {
      status: "LOCAL_DRIFT",
      current_hash,
      last_synced_hash: prov.last_synced_hash,
      drift_strategy: prov.drift_strategy,
      local_edits: true
    };
  }

  return {
    status: "UPDATED",
    current_hash,
    last_synced_hash: prov.last_synced_hash,
    drift_strategy: prov.drift_strategy
  };
}

/**
 * Generiere einen frischen upstream_source-Block für eine neue oder aktualisierte Trunk-YAML.
 */
export function buildProvenanceBlock({ type, handle, resourceId, collection, scope, currentHash, driftStrategy = "auto-curate" }) {
  const block = {
    type,
    handle,
    resource_id: resourceId,
    last_synced_at: new Date().toISOString(),
    last_synced_hash: currentHash,
    drift_strategy: driftStrategy,
    local_edits: false
  };
  if (collection) block.collection = collection;
  if (scope) block.scope = scope;
  return block;
}
