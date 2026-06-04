import { createServer } from "node:http";
import {
  createAbsenceRequest,
  createEmployee,
  createShift,
  createTimeEntry,
  databasePath,
  getBootstrap,
  getHealth,
  runDemoImport,
  runExternalSnapshotImport,
  deleteShift,
  updateAbsenceStatus,
  updateShift,
  updateTimeEntryBreaks,
  updateTimeEntryStatus
} from "./db.js";
import { handleAuthRoute, requireWorkforceApiSession } from "./auth.js";

const host = process.env.ARBEITSZEITEN_API_HOST ?? "127.0.0.1";
const port = Number(process.env.ARBEITSZEITEN_API_PORT ?? 5175);

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "http://127.0.0.1:5174",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Payload zu gross"));
      }
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Ungueltiges JSON"));
      }
    });
    request.on("error", reject);
  });
}

function notFound(response) {
  sendJson(response, 404, { error: "Nicht gefunden" });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (await handleAuthRoute({ request, response, url, readJson, sendJson })) {
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, getHealth());
      return;
    }

    const authGate = requireWorkforceApiSession(request);
    if (!authGate.ok) {
      sendJson(response, authGate.status, { ok: false, error: authGate.error });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/bootstrap") {
      sendJson(response, 200, getBootstrap());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/time-entries") {
      const payload = await readJson(request);
      sendJson(response, 201, createTimeEntry(payload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/employees") {
      const payload = await readJson(request);
      sendJson(response, 201, createEmployee(payload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/shifts") {
      const payload = await readJson(request);
      sendJson(response, 201, createShift(payload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/absences") {
      const payload = await readJson(request);
      sendJson(response, 201, createAbsenceRequest(payload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/imports/demo") {
      sendJson(response, 201, runDemoImport());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/imports/delta-snapshot") {
      const payload = await readJson(request);
      sendJson(
        response,
        201,
        runExternalSnapshotImport(typeof payload.path === "string" && payload.path.trim() ? payload.path.trim() : undefined)
      );
      return;
    }

    const shiftMatch = url.pathname.match(/^\/api\/shifts\/([^/]+)$/);
    if (request.method === "DELETE" && shiftMatch) {
      sendJson(response, 200, deleteShift(decodeURIComponent(shiftMatch[1])));
      return;
    }

    if (request.method === "PATCH" && shiftMatch) {
      const payload = await readJson(request);
      sendJson(response, 200, updateShift(decodeURIComponent(shiftMatch[1]), payload));
      return;
    }

    const statusMatch = url.pathname.match(/^\/api\/time-entries\/([^/]+)\/status$/);
    if (request.method === "PATCH" && statusMatch) {
      const payload = await readJson(request);
      sendJson(response, 200, updateTimeEntryStatus(decodeURIComponent(statusMatch[1]), payload.status));
      return;
    }

    const breaksMatch = url.pathname.match(/^\/api\/time-entries\/([^/]+)\/breaks$/);
    if (request.method === "PATCH" && breaksMatch) {
      const payload = await readJson(request);
      sendJson(response, 200, updateTimeEntryBreaks(decodeURIComponent(breaksMatch[1]), payload));
      return;
    }

    const absenceStatusMatch = url.pathname.match(/^\/api\/absences\/([^/]+)\/status$/);
    if (request.method === "PATCH" && absenceStatusMatch) {
      const payload = await readJson(request);
      sendJson(
        response,
        200,
        updateAbsenceStatus(decodeURIComponent(absenceStatusMatch[1]), payload.status)
      );
      return;
    }

    notFound(response);
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : "Unbekannter Fehler"
    });
  }
});

server.listen(port, host, () => {
  console.log(`Arbeitszeiten API laeuft auf http://${host}:${port}`);
  console.log(`SQLite-Datenbank: ${databasePath}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
