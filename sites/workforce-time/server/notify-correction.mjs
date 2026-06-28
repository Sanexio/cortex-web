// T-005c — In-App-Benachrichtigungen fuer Korrektur-Workflow.
// Wird aus api.js fire-and-forget aufgerufen; Notify-Fehler duerfen den
// HTTP-Erfolg des eigentlichen Vorgangs nicht blockieren.

// TODO(notifications): Re-enable SMTP fallback when notification channels are configurable.
// import { sendSmtpMail, mailFrom } from "./auth.js";
import {
  createNotification,
  createNotificationsForUsers,
  getAuthUserIdForEmployeeId,
  listAdminNotificationUserIds
} from "./db.js";

function formatChanges(requestedChanges) {
  if (!requestedChanges || typeof requestedChanges !== "object") return "—";
  return Object.entries(requestedChanges)
    .map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`)
    .join("\n");
}

export async function notifyCorrectionRequested(correction) {
  if (!correction) return [];
  const adminUserIds = listAdminNotificationUserIds();
  if (adminUserIds.length === 0) return [];
  return createNotificationsForUsers(adminUserIds, "correction_requested", {
    id: correction.id,
    timeEntryId: correction.timeEntryId,
    employeeId: correction.employeeId,
    createdAt: correction.createdAt,
    reason: correction.reason || null,
    requestedChanges: correction.requestedChanges,
    requestedChangesText: formatChanges(correction.requestedChanges)
  });
}

export async function notifyCorrectionDecided(correction, decision) {
  if (!correction) return null;
  const verb = decision === "approve" ? "genehmigt" : "abgelehnt";
  const userId = getAuthUserIdForEmployeeId(correction.employeeId);
  if (!userId) return { delivered: false, skipped: "no_applicant_user" };
  return createNotification(userId, "correction_decided", {
    id: correction.id,
    timeEntryId: correction.timeEntryId,
    employeeId: correction.employeeId,
    status: correction.status,
    decision,
    label: `Korrekturantrag ${verb}`,
    reviewedAt: correction.reviewedAt ?? null,
    reviewerId: correction.reviewerId ?? null,
    reviewNote: correction.reviewNote ?? null
  });
}
