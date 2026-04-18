// REST-client for WordPress REST API with Application-Password Basic-Auth.
// Thin wrapper around fetch with credential masking in error output.

function maskPassword(str, password) {
  if (!password) return str;
  return str.split(password).join("***");
}

export function createClient({ baseUrl, user, password }) {
  if (!baseUrl) throw new Error("rest-client: baseUrl missing");
  if (!user) throw new Error("rest-client: user missing");
  if (!password) throw new Error("rest-client: password missing");

  const normalized = baseUrl.replace(/\/$/, "");
  const authHeader = "Basic " + Buffer.from(`${user}:${password}`).toString("base64");

  async function request(method, path, body) {
    const url = `${normalized}${path.startsWith("/") ? path : "/" + path}`;
    const init = {
      method,
      headers: {
        "Authorization": authHeader,
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
      throw new Error(`rest-client: network error on ${method} ${url}: ${maskPassword(err.message, password)}`);
    }

    const text = await res.text();
    let json = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // non-JSON response is an error condition for the endpoints we hit
      }
    }

    if (!res.ok) {
      const preview = maskPassword(text.slice(0, 400), password);
      throw new Error(`rest-client: HTTP ${res.status} on ${method} ${url}: ${preview}`);
    }

    return json;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body)
  };
}
