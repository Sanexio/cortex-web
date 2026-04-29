// drift-sync / lib / shopify-collection.mjs
// Wrapper für Shopify Admin API: Collection-Listing + Product-Details.
// Nutzt bestehenden adapters/shopify/lib/shopify-rest-client.mjs.

/**
 * Liste alle Produkte in einer Collection (paginiert).
 * Nutzt /collections/{collection_id}/products.json oder /products.json mit collection_id.
 *
 * Returns: Array von Produkten (Vollständige Detail-Objekte mit images, variants, etc.)
 */
export async function listProductsInCollection(client, collectionHandle) {
  // Schritt 1: Collection-ID via Handle resolven
  let collectionResult;
  try {
    collectionResult = await client.get(
      `/custom_collections.json?handle=${encodeURIComponent(collectionHandle)}`
    );
  } catch (err) {
    throw new Error(`Collection-Lookup für handle="${collectionHandle}" fehlgeschlagen: ${err.message}`);
  }

  let collection = collectionResult?.custom_collections?.[0];

  // Fallback: smart_collections (automatische Collections)
  if (!collection) {
    try {
      const smart = await client.get(
        `/smart_collections.json?handle=${encodeURIComponent(collectionHandle)}`
      );
      collection = smart?.smart_collections?.[0];
    } catch (err) {
      // Ignorieren — wir versuchen jetzt direkt /products.json mit Tag-Filter (siehe unten)
    }
  }

  if (!collection) {
    throw new Error(`Collection "${collectionHandle}" nicht gefunden (weder custom noch smart).`);
  }

  // Schritt 2: Produkte der Collection abrufen
  const products = [];
  let sinceId = 0;
  const PAGE_SIZE = 250;

  while (true) {
    let chunk;
    try {
      chunk = await client.get(
        `/products.json?collection_id=${collection.id}&limit=${PAGE_SIZE}&since_id=${sinceId}`
      );
    } catch (err) {
      throw new Error(`Product-Listing fehlgeschlagen (collection_id=${collection.id}): ${err.message}`);
    }

    const batch = chunk?.products || [];
    if (batch.length === 0) break;

    products.push(...batch);
    sinceId = batch[batch.length - 1].id;

    if (batch.length < PAGE_SIZE) break;
  }

  return products;
}

/**
 * Holt Detail-Daten eines einzelnen Produkts (per ID).
 * Wird genutzt wenn nur die ID bekannt ist (z.B. aus Provenance-Block).
 */
export async function getProductById(client, productId) {
  try {
    const result = await client.get(`/products/${productId}.json`);
    return result?.product || null;
  } catch (err) {
    if (String(err.message).includes("404")) return null;
    throw new Error(`Product-Detail-Lookup ID=${productId} fehlgeschlagen: ${err.message}`);
  }
}

/**
 * Holt Detail-Daten eines Produkts via Handle.
 */
export async function getProductByHandle(client, handle) {
  try {
    const result = await client.get(`/products.json?handle=${encodeURIComponent(handle)}`);
    return result?.products?.[0] || null;
  } catch (err) {
    if (String(err.message).includes("404")) return null;
    throw new Error(`Product-Lookup handle="${handle}" fehlgeschlagen: ${err.message}`);
  }
}
