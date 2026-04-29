// drift-sync / lib / shopify-page.mjs
// Wrapper für Shopify Admin API: Page-Get + List.

/**
 * Holt eine einzelne Page via Handle.
 */
export async function getPageByHandle(client, handle) {
  try {
    const result = await client.get(`/pages.json?handle=${encodeURIComponent(handle)}`);
    return result?.pages?.[0] || null;
  } catch (err) {
    if (String(err.message).includes("404")) return null;
    throw new Error(`Page-Lookup handle="${handle}" fehlgeschlagen: ${err.message}`);
  }
}

/**
 * Holt alle Pages mit den angegebenen Handles.
 */
export async function getPagesByHandles(client, handles) {
  const results = [];
  for (const handle of handles) {
    const page = await getPageByHandle(client, handle);
    if (page) results.push(page);
  }
  return results;
}

/**
 * Liste ALLE Pages (für Discovery — z.B. wenn neue Pages auf Sanexio dazukommen).
 */
export async function listAllPages(client) {
  const pages = [];
  let sinceId = 0;
  const PAGE_SIZE = 250;

  while (true) {
    let chunk;
    try {
      chunk = await client.get(`/pages.json?limit=${PAGE_SIZE}&since_id=${sinceId}`);
    } catch (err) {
      throw new Error(`Page-Listing fehlgeschlagen: ${err.message}`);
    }
    const batch = chunk?.pages || [];
    if (batch.length === 0) break;
    pages.push(...batch);
    sinceId = batch[batch.length - 1].id;
    if (batch.length < PAGE_SIZE) break;
  }
  return pages;
}
