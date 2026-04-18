// REST client for Shopify Admin API.
// Token in X-Shopify-Access-Token header. Token is masked in error output.
// API version pinned to 2026-04 (verified in Session 3 against /shop.json).

const API_VERSION = "2026-04";

function maskToken(str, token) {
  if (!token) return str;
  return str.split(token).join("***");
}

export function createClient({ store, token }) {
  if (!store) throw new Error("shopify-rest-client: store missing");
  if (!token) throw new Error("shopify-rest-client: token missing");
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(store)) {
    throw new Error(`shopify-rest-client: invalid store handle "${store}" — expected <handle>.myshopify.com`);
  }

  const baseUrl = `https://${store}/admin/api/${API_VERSION}`;

  async function request(method, path, body) {
    const url = `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
    const init = {
      method,
      headers: {
        "X-Shopify-Access-Token": token,
        "Accept": "application/json"
      }
    };
    if (body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(url, init);
    } catch (err) {
      throw new Error(`shopify-rest-client: network error on ${method} ${url}: ${maskToken(err.message, token)}`);
    }

    const text = await res.text();
    let json = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // Non-JSON is unexpected for the endpoints we hit.
      }
    }

    if (!res.ok) {
      const preview = maskToken(text.slice(0, 500), token);
      throw new Error(`shopify-rest-client: HTTP ${res.status} on ${method} ${url}: ${preview}`);
    }

    return json;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    apiVersion: API_VERSION,
    baseUrl
  };
}

export { API_VERSION };
