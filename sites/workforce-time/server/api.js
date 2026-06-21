import { createServer } from "node:http";
import {
  acceptSwapRequest,
  approveCorrection,
  assignStampContext,
  autoEndExpiredStamps,
  buildEmployeeMonthlySollIst,
  buildEmployeeShiftHours,
  getAuditEmployeeHours,
  renderAuditCsv,
  buildPayrollExport,
  buildTeamSollIstSummary,
  calculateAbsenceQuota,
  calculateAbsenceQuotasForAll,
  cancelSwapRequest,
  createAbsenceRequest,
  createEmployee,
  createShift,
  createSwapRequest,
  createTimeEntry,
  databasePath,
  declineSwapRequest,
  deleteEmployee,
  detectShiftConflicts,
  getBootstrap,
  getCorrection,
  getHealth,
  getStampState,
  getSwapRequest,
  listActiveStampSessions,
  listAllPendingApprovals,
  listAuthUsersWithRoles,
  listOpenSwapRequests,
  listPendingCorrections,
  rejectCorrection,
  renderPayrollExportCsv,
  renderPayrollExportDatevLodas,
  renderTeamSollIstCsv,
  requestTimeEntryCorrection,
  runExternalSnapshotImport,
  deleteShift,
  setPayrollPersonnelNumber,
  stampBreakEnd,
  stampBreakStart,
  stampEnd,
  stampStart,
  updateAbsenceStatus,
  updateAuthUserRole,
  updateEmployee,
  updateShift,
  updateTimeEntryBreaks,
  updateTimeEntryStatus
} from "./db.js";
import { handleAuthRoute, requireWorkforceApiSession } from "./auth.js";
import { notifyCorrectionRequested, notifyCorrectionDecided } from "./notify-correction.mjs";

const host = process.env.ARBEITSZEITEN_API_HOST ?? "127.0.0.1";
const port = Number(process.env.ARBEITSZEITEN_API_PORT ?? 5175);

// P.1 (2026-06-13): CORS-Allowlist. Default ist das Workforce-Frontend (5174).
// Sanexio-Portal (5176) wird mitakzeptiert, damit Embed-Patterns ohne weitere
// API-Aenderung greifen. Tenant-spezifische Hosts (z.B. Praxis-Local-Flywheel)
// kommen ueber ARBEITSZEITEN_EXTRA_ORIGINS (CSV), damit das Framework-Repo
// tenant-frei bleibt.
const CORS_DEFAULT_ORIGIN = "http://127.0.0.1:5174";
const CORS_ALLOWED_ORIGINS = new Set([
  CORS_DEFAULT_ORIGIN,
  "http://127.0.0.1:5176",
  "http://localhost:5176",
  ...(process.env.ARBEITSZEITEN_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
]);

function pickCorsOrigin(request) {
  const origin = request?.headers?.origin;
  if (origin && CORS_ALLOWED_ORIGINS.has(origin)) return origin;
  return CORS_DEFAULT_ORIGIN;
}

function sendJson(response, statusCode, payload, extraHeaders = {}, request) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": pickCorsOrigin(request),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Vary": "Origin",
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

// C1: enforce the admin role server-side. Returns true if the caller may
// proceed; otherwise writes a 403 and returns false. When the gate is not
// enforced (local dev, no role system) everything is allowed.
function requireAdmin(authGate, response) {
  if (authGate.enforced === false) return true;
  if (authGate.session?.role === "admin") return true;
  sendJson(response, 403, {
    ok: false,
    error: { code: "ADMIN_REQUIRED", message: "Diese Aktion erfordert Admin-Rechte." }
  });
  return false;
}

// H1: identity for actor-scoped writes must come from the authenticated
// session, never the client-supplied body. In enforced mode the body value is
// ignored entirely; in local dev (gate off) we fall back to the body so the
// existing dev/test workflow keeps working.
function actorEmployeeId(authGate, bodyFallback) {
  if (authGate.enforced === false) return bodyFallback ?? null;
  return authGate.session?.employee_id ?? null;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {}, {}, request);
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
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      sendJson(response, 201, createEmployee(payload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/shifts") {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      sendJson(response, 201, createShift(payload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/absences") {
      const payload = await readJson(request);
      sendJson(response, 201, createAbsenceRequest(payload));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/imports/delta-snapshot") {
      if (!requireAdmin(authGate, response)) return;
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
      if (!requireAdmin(authGate, response)) return;
      sendJson(response, 200, deleteShift(decodeURIComponent(shiftMatch[1])));
      return;
    }

    if (request.method === "PATCH" && shiftMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      sendJson(response, 200, updateShift(decodeURIComponent(shiftMatch[1]), payload));
      return;
    }

    const statusMatch = url.pathname.match(/^\/api\/time-entries\/([^/]+)\/status$/);
    if (request.method === "PATCH" && statusMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      sendJson(response, 200, updateTimeEntryStatus(decodeURIComponent(statusMatch[1]), payload.status));
      return;
    }

    const breaksMatch = url.pathname.match(/^\/api\/time-entries\/([^/]+)\/breaks$/);
    if (request.method === "PATCH" && breaksMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      sendJson(response, 200, updateTimeEntryBreaks(decodeURIComponent(breaksMatch[1]), payload));
      return;
    }

    // T-LIVE-001 — Admin-View aller aktiven Sessions (claude-chat, 2026-06-20).
    if (request.method === "GET" && url.pathname === "/api/stamp/state/all") {
      if (!requireAdmin(authGate, response)) return;
      try {
        sendJson(response, 200, { ok: true, sessions: listActiveStampSessions() }, {}, request);
      } catch (err) {
        sendJson(response, 500, { ok: false, error: { code: "server_error", message: err.message } }, {}, request);
      }
      return;
    }

    // T-LIVE-001 — Per-Schicht-Stundenliste eines Mitarbeiters.
    // Mitarbeiter darf nur eigene Daten lesen; Admin darf jeden abfragen.
    if (request.method === "GET" && url.pathname === "/api/stamp/shift-hours") {
      const requestedEmployeeId = url.searchParams.get("employeeId");
      const isAdminActor = authGate.enforced === false || authGate.session?.role === "admin";
      const targetEmployeeId = isAdminActor
        ? (requestedEmployeeId ?? actorEmployeeId(authGate, requestedEmployeeId))
        : actorEmployeeId(authGate, requestedEmployeeId);
      if (!targetEmployeeId) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: "employeeId fehlt" } }, {}, request);
        return;
      }
      try {
        const rows = buildEmployeeShiftHours(
          targetEmployeeId,
          url.searchParams.get("from"),
          url.searchParams.get("to")
        );
        sendJson(response, 200, { ok: true, employeeId: targetEmployeeId, shifts: rows }, {}, request);
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } }, {}, request);
      }
      return;
    }

    // T-LIVE-002 — Schicht/Praxis nachtraeglich an Stempel-Session zuordnen.
    if (request.method === "POST" && url.pathname === "/api/stamp/assign-context") {
      const payload = await readJson(request);
      const isAdminActor = authGate.enforced === false || authGate.session?.role === "admin";
      const targetEmployeeId = isAdminActor
        ? (payload?.employeeId ?? actorEmployeeId(authGate, payload?.employeeId))
        : actorEmployeeId(authGate, payload?.employeeId);
      try {
        const result = assignStampContext(targetEmployeeId, payload || {});
        sendJson(response, 200, result, {}, request);
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } }, {}, request);
      }
      return;
    }

    // T-004a Stempeluhr.
    const stampOpMatch = url.pathname.match(/^\/api\/stamp\/(start|end|break-start|break-end|state)$/);
    if (stampOpMatch) {
      const op = stampOpMatch[1];
      if (request.method === "GET" && op === "state") {
        const employeeId = url.searchParams.get("employeeId");
        if (!employeeId) {
          sendJson(response, 400, { ok: false, error: { code: "bad_request", message: "employeeId fehlt" } });
          return;
        }
        sendJson(response, 200, { ok: true, ...getStampState(employeeId) });
        return;
      }
      if (request.method === "POST") {
        const payload = await readJson(request);
        // H1: stamp for the authenticated employee, not a body-claimed id.
        // Admins may stamp on behalf of someone (Kiosk) via the body value.
        const isAdminActor = authGate.enforced === false || authGate.session?.role === "admin";
        const stampEmployeeId = isAdminActor
          ? (payload?.employeeId ?? actorEmployeeId(authGate, payload?.employeeId))
          : actorEmployeeId(authGate, payload?.employeeId);
        try {
          let result;
          if (op === "start") result = stampStart(stampEmployeeId, payload || {});
          else if (op === "end") result = stampEnd(stampEmployeeId, payload || {});
          else if (op === "break-start") result = stampBreakStart(stampEmployeeId, payload || {});
          else if (op === "break-end") result = stampBreakEnd(stampEmployeeId, payload || {});
          sendJson(response, 200, result);
        } catch (err) {
          sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
        }
        return;
      }
    }

    // T-007a Freigabe-Aggregator.
    if (request.method === "GET" && url.pathname === "/api/approvals") {
      if (!requireAdmin(authGate, response)) return;
      sendJson(response, 200, { ok: true, ...listAllPendingApprovals() });
      return;
    }

    // T-010a Rollen-Admin.
    if (request.method === "GET" && url.pathname === "/api/admin/users") {
      if (!requireAdmin(authGate, response)) return;
      sendJson(response, 200, { ok: true, users: listAuthUsersWithRoles() });
      return;
    }
    const roleMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/role$/);
    if (request.method === "PATCH" && roleMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      try {
        const result = updateAuthUserRole(
          decodeURIComponent(roleMatch[1]),
          payload?.role,
          actorEmployeeId(authGate, payload?.actorId),
          payload?.note
        );
        sendJson(response, 200, { ok: true, ...result });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }

    // T-003a Schichttausch.
    if (request.method === "POST" && url.pathname === "/api/swap-requests") {
      const payload = await readJson(request);
      try {
        const result = createSwapRequest(payload);
        sendJson(response, 201, { ok: true, swapRequest: result });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/swap-requests") {
      const targetEmployeeId = url.searchParams.get("targetEmployeeId") || undefined;
      sendJson(response, 200, { ok: true, swapRequests: listOpenSwapRequests({ targetEmployeeId }) });
      return;
    }
    const swapAcceptMatch = url.pathname.match(/^\/api\/swap-requests\/([^/]+)\/accept$/);
    if (request.method === "PATCH" && swapAcceptMatch) {
      const payload = await readJson(request);
      try {
        const result = acceptSwapRequest(decodeURIComponent(swapAcceptMatch[1]), actorEmployeeId(authGate, payload?.accepterEmployeeId), payload?.note);
        sendJson(response, 200, { ok: true, swapRequest: result });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }
    const swapDeclineMatch = url.pathname.match(/^\/api\/swap-requests\/([^/]+)\/decline$/);
    if (request.method === "PATCH" && swapDeclineMatch) {
      const payload = await readJson(request);
      try {
        const result = declineSwapRequest(decodeURIComponent(swapDeclineMatch[1]), actorEmployeeId(authGate, payload?.declinerEmployeeId), payload?.note);
        sendJson(response, 200, { ok: true, swapRequest: result });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }
    const swapCancelMatch = url.pathname.match(/^\/api\/swap-requests\/([^/]+)\/cancel$/);
    if (request.method === "PATCH" && swapCancelMatch) {
      const payload = await readJson(request);
      try {
        const result = cancelSwapRequest(decodeURIComponent(swapCancelMatch[1]), actorEmployeeId(authGate, payload?.cancellerEmployeeId), payload?.note);
        sendJson(response, 200, { ok: true, swapRequest: result });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }

    // T-009a Reporting.
    const reportEmployeeMatch = url.pathname.match(/^\/api\/reports\/employee\/([^/]+)\/monthly$/);
    if (request.method === "GET" && reportEmployeeMatch) {
      if (!requireAdmin(authGate, response)) return;
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const month = Number(url.searchParams.get("month") || (new Date().getMonth() + 1));
      try {
        const result = buildEmployeeMonthlySollIst(decodeURIComponent(reportEmployeeMatch[1]), year, month);
        sendJson(response, 200, { ok: true, report: result });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }
    // T-LIVE-009 — Stunden-Audit.
    if (request.method === "GET" && url.pathname === "/api/audit/employee-hours") {
      if (!requireAdmin(authGate, response)) return;
      const employeeId = url.searchParams.get("employeeId");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const format = (url.searchParams.get("format") || "json").toLowerCase();
      try {
        const audit = getAuditEmployeeHours(employeeId, from, to);
        if (format === "csv") {
          const body = renderAuditCsv(audit);
          response.writeHead(200, {
            "Content-Type": "text/csv; charset=utf-8",
            "Cache-Control": "no-store",
            "Content-Disposition": `attachment; filename="audit-${employeeId}-${from}-${to}.csv"`,
            "Access-Control-Allow-Origin": pickCorsOrigin(request),
            "Access-Control-Allow-Credentials": "true"
          });
          response.end(body);
        } else {
          sendJson(response, 200, { ok: true, audit }, {}, request);
        }
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } }, {}, request);
      }
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/reports/team/monthly") {
      if (!requireAdmin(authGate, response)) return;
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const month = Number(url.searchParams.get("month") || (new Date().getMonth() + 1));
      const format = (url.searchParams.get("format") || "json").toLowerCase();
      const locationId = url.searchParams.get("locationId") || null;
      try {
        const result = buildTeamSollIstSummary(year, month, { locationId });
        if (format === "csv") {
          const body = renderTeamSollIstCsv(result);
          response.writeHead(200, {
            "Content-Type": "text/csv; charset=utf-8",
            "Cache-Control": "no-store",
            "Content-Disposition": `attachment; filename="team-soll-ist-${year}-${String(month).padStart(2, "0")}.csv"`,
            "Access-Control-Allow-Origin": "http://127.0.0.1:5174",
            "Access-Control-Allow-Credentials": "true"
          });
          response.end(body);
        } else {
          sendJson(response, 200, { ok: true, report: result, year, month });
        }
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }

    // T-002 Shift-Konflikt-Preview.
    if (request.method === "POST" && url.pathname === "/api/shifts/check-conflicts") {
      const payload = await readJson(request);
      try {
        sendJson(response, 200, { ok: true, ...detectShiftConflicts(payload) });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }

    // T-005a Time-Entry-Korrektur-Workflow.
    const correctionRequestMatch = url.pathname.match(/^\/api\/time-entries\/([^/]+)\/corrections$/);
    if (request.method === "POST" && correctionRequestMatch) {
      const payload = await readJson(request);
      try {
        const result = requestTimeEntryCorrection(decodeURIComponent(correctionRequestMatch[1]), payload);
        sendJson(response, 201, { ok: true, correction: result });
        notifyCorrectionRequested(result).catch((err) => {
          console.warn(`[notify-correction] requested mail failed: ${err?.message ?? err}`);
        });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/corrections") {
      if (!requireAdmin(authGate, response)) return;
      const status = (url.searchParams.get("status") || "open").toLowerCase();
      if (status === "open") {
        sendJson(response, 200, { ok: true, corrections: listPendingCorrections() });
      } else {
        sendJson(response, 400, { ok: false, error: { code: "unsupported_status", message: `nur 'open' aktuell verfügbar, war: ${status}` } });
      }
      return;
    }
    const correctionApproveMatch = url.pathname.match(/^\/api\/corrections\/([^/]+)\/approve$/);
    if (request.method === "PATCH" && correctionApproveMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      try {
        const result = approveCorrection(
          decodeURIComponent(correctionApproveMatch[1]),
          actorEmployeeId(authGate, payload?.reviewerId),
          payload?.note
        );
        sendJson(response, 200, { ok: true, correction: result });
        notifyCorrectionDecided(result, "approve").catch((err) => {
          console.warn(`[notify-correction] approve mail failed: ${err?.message ?? err}`);
        });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }
    const correctionRejectMatch = url.pathname.match(/^\/api\/corrections\/([^/]+)\/reject$/);
    if (request.method === "PATCH" && correctionRejectMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      try {
        const result = rejectCorrection(
          decodeURIComponent(correctionRejectMatch[1]),
          actorEmployeeId(authGate, payload?.reviewerId),
          payload?.note
        );
        sendJson(response, 200, { ok: true, correction: result });
        notifyCorrectionDecided(result, "reject").catch((err) => {
          console.warn(`[notify-correction] reject mail failed: ${err?.message ?? err}`);
        });
      } catch (err) {
        sendJson(response, 400, { ok: false, error: { code: "bad_request", message: err.message } });
      }
      return;
    }

    // T-006 Urlaubsrest-Kontingent.
    if (request.method === "GET" && url.pathname === "/api/absences/quota") {
      if (!requireAdmin(authGate, response)) return;
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      sendJson(response, 200, { ok: true, quotas: calculateAbsenceQuotasForAll(year), year });
      return;
    }
    const quotaMatch = url.pathname.match(/^\/api\/employees\/([^/]+)\/quota$/);
    if (request.method === "GET" && quotaMatch) {
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      try {
        const result = calculateAbsenceQuota(decodeURIComponent(quotaMatch[1]), year);
        sendJson(response, 200, { ok: true, quota: result });
      } catch (err) {
        sendJson(response, 404, { ok: false, error: { code: "quota_not_available", message: err.message } });
      }
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/payroll/export") {
      if (!requireAdmin(authGate, response)) return;
      const year = Number(url.searchParams.get("year"));
      const month = Number(url.searchParams.get("month"));
      const format = (url.searchParams.get("format") ?? "json").toLowerCase();
      const report = buildPayrollExport({ year, month });

      if (format === "csv") {
        const body = renderPayrollExportCsv(report);
        const filename = `payroll-${report.period.year}-${String(report.period.month).padStart(2, "0")}.csv`;
        response.writeHead(200, {
          "Content-Type": "text/csv; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:5174",
          "Access-Control-Allow-Credentials": "true"
        });
        response.end(body);
        return;
      }

      if (format === "datev_lodas" || format === "datev") {
        let body;
        try {
          body = renderPayrollExportDatevLodas(report);
        } catch (err) {
          // C3: missing personnel numbers must block the export, not pass silently.
          sendJson(response, 409, {
            ok: false,
            error: { code: err?.code || "export_failed", message: err.message }
          });
          return;
        }
        const filename = `payroll-datev-lodas-${report.period.year}-${String(report.period.month).padStart(2, "0")}.csv`;
        response.writeHead(200, {
          "Content-Type": "text/csv; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:5174",
          "Access-Control-Allow-Credentials": "true"
        });
        response.end(body);
        return;
      }

      sendJson(response, 200, report);
      return;
    }

    const payrollNumberMatch = url.pathname.match(/^\/api\/employees\/([^/]+)\/payroll-number$/);
    if (request.method === "PATCH" && payrollNumberMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      sendJson(
        response,
        200,
        setPayrollPersonnelNumber(decodeURIComponent(payrollNumberMatch[1]), payload.personnelNumber ?? "")
      );
      return;
    }

    const employeeMatch = url.pathname.match(/^\/api\/employees\/([^/]+)$/);
    if (request.method === "PATCH" && employeeMatch) {
      if (!requireAdmin(authGate, response)) return;
      const payload = await readJson(request);
      sendJson(response, 200, updateEmployee(decodeURIComponent(employeeMatch[1]), payload));
      return;
    }
    if (request.method === "DELETE" && employeeMatch) {
      if (!requireAdmin(authGate, response)) return;
      sendJson(response, 200, deleteEmployee(decodeURIComponent(employeeMatch[1])));
      return;
    }

    const absenceStatusMatch = url.pathname.match(/^\/api\/absences\/([^/]+)\/status$/);
    if (request.method === "PATCH" && absenceStatusMatch) {
      if (!requireAdmin(authGate, response)) return;
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

// T-LIVE-001 — Serverseitiges Auto-End. Tickt alle 60 s, schliesst laufende
// Stempelungen, deren geplante Schicht-Endzeit verstrichen ist (oder die ein
// 12 h-Hartlimit ueberschreiten). Robuster als der clientseitige Effect, der
// nur bei offenem Kiosk-Tab feuert. Deaktivierbar via WORKFORCE_AUTO_END=0.
const autoEndDisabled = String(process.env.WORKFORCE_AUTO_END ?? "1") === "0";
if (!autoEndDisabled) {
  const intervalMs = Number(process.env.WORKFORCE_AUTO_END_INTERVAL_MS ?? 60_000);
  const autoEndTimer = setInterval(() => {
    try {
      const closed = autoEndExpiredStamps();
      if (closed > 0) console.log(`[auto-end] ${closed} Session(s) geschlossen`);
    } catch (err) {
      console.warn(`[auto-end] tick failed: ${err?.message ?? err}`);
    }
  }, intervalMs);
  autoEndTimer.unref?.();
}

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
