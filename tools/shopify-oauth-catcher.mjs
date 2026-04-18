#!/usr/bin/env node
// Cortex-Web · Shopify OAuth Catcher
//
// Listens on http://localhost:53682/callback, receives the OAuth `code`
// Shopify sends after the user approves the app install, exchanges it
// for a permanent Admin-API access token, and writes the token plus the
// shop domain into `.env.local` (the token never touches stdout).
//
// Usage:
//   1. Ensure .env.local contains SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET
//   2. bun tools/shopify-oauth-catcher.mjs
//   3. In Dev Dashboard: set App-URL to http://localhost:53682/callback,
//      publish, click "App installieren" on the overview page
//   4. Shopify redirects here; the catcher writes the token and exits.

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 53682;
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = resolve(PROJECT_ROOT, '.env.local');

function parseEnv(content) {
  const out = {};
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function upsertEnvVars(content, updates) {
  const lines = content.split('\n');
  const remaining = new Map(Object.entries(updates));
  const out = [];
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=/);
    if (match && remaining.has(match[1])) {
      out.push(`${match[1]}=${remaining.get(match[1])}`);
      remaining.delete(match[1]);
    } else {
      out.push(line);
    }
  }
  for (const [k, v] of remaining) out.push(`${k}=${v}`);
  return out.join('\n').replace(/\n+$/, '') + '\n';
}

if (!existsSync(ENV_PATH)) {
  console.error(`.env.local not found at ${ENV_PATH}`);
  process.exit(1);
}
const envRaw = readFileSync(ENV_PATH, 'utf8');
const env = parseEnv(envRaw);

const CLIENT_ID = env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = env.SHOPIFY_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be set in .env.local');
  process.exit(1);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/callback') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found\n');
    return;
  }

  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop');
  if (!code || !shop || !/^[a-z0-9-]+\.myshopify\.com$/i.test(shop)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('missing or invalid code/shop\n');
    return;
  }

  console.log(`Callback received — shop=${shop}, code=${code.slice(0, 6)}…`);
  console.log('Exchanging authorization code for access token…');

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      throw new Error(`Token exchange failed: HTTP ${tokenRes.status} — ${body}`);
    }

    const json = await tokenRes.json();
    const accessToken = json.access_token;
    const scope = json.scope ?? '';

    if (!accessToken || !accessToken.startsWith('shpat_')) {
      throw new Error(`Unexpected token format (expected shpat_…): ${JSON.stringify(json)}`);
    }

    const updated = upsertEnvVars(envRaw, {
      SHOPIFY_STORE: shop,
      SHOPIFY_ADMIN_TOKEN: accessToken,
    });
    writeFileSync(ENV_PATH, updated, { mode: 0o600 });

    console.log(`✓ Token saved to .env.local`);
    console.log(`✓ Store : ${shop}`);
    console.log(`✓ Scopes: ${scope}`);
    console.log(`✓ Token : shpat_…${accessToken.slice(-4)} (last 4 chars only)`);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Cortex-Web · Token gespeichert</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;max-width:40em;margin:3em auto;padding:0 1.5em;color:#1a1a1a;line-height:1.5}h1{color:#028090}code{background:#eef;padding:.15em .4em;border-radius:3px}</style>
</head><body>
<h1>✓ Token gespeichert</h1>
<p><strong>Store:</strong> <code>${shop}</code></p>
<p><strong>Gewährte Scopes:</strong> <code>${scope}</code></p>
<p>Der Admin-API-Access-Token wurde in <code>.env.local</code> geschrieben.</p>
<p>Sie können dieses Fenster schließen.</p>
</body></html>`);

    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 300);
  } catch (err) {
    console.error('Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`error: ${err.message}\n`);
    setTimeout(() => process.exit(1), 300);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Shopify OAuth catcher listening on http://localhost:${PORT}/callback`);
  console.log(`Waiting for Shopify redirect…  (Ctrl-C to abort)`);
});
