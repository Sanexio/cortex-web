import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { buildGraph, VAULT } from "./scripts/build-graph-data.mjs";
import { promises as fs } from "node:fs";
import path from "node:path";

// Cache the most recent build. Re-runs only when the vault has changed
// (latest mtime under VAULT moves) or when 30 seconds passed since last build.
let cache: { payload: unknown; mtime: number; generatedAt: number } | null = null;
const HARD_TTL_MS = 30_000;

async function latestVaultMtime(dir: string): Promise<number> {
  let max = 0;
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return max;
  }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const sub = await latestVaultMtime(full);
      if (sub > max) max = sub;
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
      try {
        const st = await fs.stat(full);
        if (st.mtimeMs > max) max = st.mtimeMs;
      } catch {
        /* ignore */
      }
    }
  }
  return max;
}

function graphApiPlugin(): Plugin {
  return {
    name: "sanexio-portal-graph-api",
    configureServer(server) {
      server.middlewares.use("/api/graph", async (_req, res) => {
        try {
          const now = Date.now();
          const mtime = await latestVaultMtime(VAULT);
          const stale =
            !cache ||
            cache.mtime !== mtime ||
            now - cache.generatedAt > HARD_TTL_MS;
          if (stale) {
            const payload = await buildGraph({ quiet: true });
            cache = { payload, mtime, generatedAt: now };
          }
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(cache!.payload));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(
            JSON.stringify({
              error: (err as Error).message ?? "graph build failed"
            })
          );
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), graphApiPlugin()],
  server: {
    port: 5176,
    strictPort: true,
    host: "127.0.0.1",
    allowedHosts: [
      "127.0.0.1",
      "localhost",
      "cluster-mini-04",
      "cluster-mini-04.piranha-marlin.ts.net",
    ],
  },
  preview: {
    port: 5176,
    host: "127.0.0.1",
  },
});
