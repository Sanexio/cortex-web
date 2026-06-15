// Sanexio Portal · ARCHIV → iCloud Sync API
// Lokaler Trigger-Endpunkt für den manuellen ARCHIV-iCloud-Sync.
// Mac-lokal (Loopback-Bind), spawnt das bestehende Skript
// ~/Cortex/Desk/ARCHIV/_AI_META/tools/archiv-icloud-sync.sh.

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const HOST = process.env.ARCHIV_SYNC_HOST ?? "127.0.0.1";
const PORT = Number(process.env.ARCHIV_SYNC_PORT ?? 5177);

const HOME = homedir();
const SCRIPT = join(HOME, "Cortex/Desk/ARCHIV/_AI_META/tools/archiv-icloud-sync.sh");
const LOG = join(HOME, "Cortex/Desk/ARCHIV/_AI_META/BASELINE_SYNC/_auto_sync/archiv-icloud-sync.log");
const LOCK = join(HOME, "Cortex/Desk/ARCHIV/_AI_META/BASELINE_SYNC/_auto_sync/.lock.d");

const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:5176",
  "http://localhost:5176",
]);
const extraOrigins = (process.env.ARCHIV_SYNC_EXTRA_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
for (const o of extraOrigins) ALLOWED_ORIGINS.add(o);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

// Letzten Sync-Summary aus dem Log destillieren.
// Sucht von hinten nach "=== sync end" und nimmt die rsync-Zeilen davor.
async function readStatus() {
  const running = existsSync(LOCK);
  let lastSyncEndedAt = null;
  let lastRc = null;
  const folders = [];
  const tail = [];

  if (!existsSync(LOG)) {
    return { running, lastSyncEndedAt, lastRc, folders, tail };
  }

  const raw = await readFile(LOG, "utf-8");
  const lines = raw.split("\n");
  // Letztes 'sync end' lokalisieren.
  let endIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes("=== sync end")) {
      endIdx = i;
      break;
    }
  }
  if (endIdx >= 0) {
    const endLine = lines[endIdx];
    const tsMatch = endLine.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
    const rcMatch = endLine.match(/rc=(-?\d+)/);
    if (tsMatch) lastSyncEndedAt = tsMatch[1];
    if (rcMatch) lastRc = Number(rcMatch[1]);
    // rsync-Folder-Zeilen seit letztem "sync start" davor.
    let startIdx = endIdx;
    for (let i = endIdx - 1; i >= 0; i--) {
      if (lines[i].includes("=== sync start")) {
        startIdx = i;
        break;
      }
    }
    for (let i = startIdx; i <= endIdx; i++) {
      const m = lines[i].match(
        /rsync (\S+) rc=(-?\d+) added=(\d+) modified=(\d+) deleted=(\d+) new_dirs=(\d+)/
      );
      if (m) {
        folders.push({
          folder: m[1],
          rc: Number(m[2]),
          added: Number(m[3]),
          modified: Number(m[4]),
          deleted: Number(m[5]),
          new_dirs: Number(m[6]),
        });
      }
    }
  }

  // Tail der letzten 40 Zeilen für UI-Log-View.
  tail.push(...lines.slice(-40).filter((l) => l.length > 0));

  return { running, lastSyncEndedAt, lastRc, folders, tail };
}

async function triggerSync() {
  if (!existsSync(SCRIPT)) {
    return { started: false, error: `Script fehlt: ${SCRIPT}` };
  }
  if (existsSync(LOCK)) {
    return { started: false, error: "Sync läuft bereits (Lock aktiv)" };
  }
  // Detached spawn — Sync läuft weiter, auch wenn die HTTP-Connection schliesst.
  const child = spawn("/bin/bash", [SCRIPT], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  return { started: true, pid: child.pid };
}

const server = createServer(async (req, res) => {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, { ok: true, script: SCRIPT, log: LOG });
    }

    if (req.method === "GET" && url.pathname === "/status") {
      const status = await readStatus();
      return json(res, 200, status);
    }

    if (req.method === "POST" && url.pathname === "/trigger") {
      const result = await triggerSync();
      return json(res, result.started ? 202 : 409, result);
    }

    return json(res, 404, { error: "not_found", path: url.pathname });
  } catch (err) {
    return json(res, 500, { error: "internal", message: String(err) });
  }
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`archiv-sync-api up on http://${HOST}:${PORT}`);
});
