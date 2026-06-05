// T-005c — Mail-Benachrichtigungen für Korrektur-Workflow (claude-chat, 2026-06-05).
// Nutzt die SMTP-Schicht aus auth.js (sendSmtpMail + mailFrom). Wird aus api.js
// fire-and-forget aufgerufen, Fehler in der Mail-Bridge dürfen den HTTP-Erfolg
// des eigentlichen Vorgangs nicht blockieren.

import { sendSmtpMail, mailFrom } from "./auth.js";
import { listAdminEmails, getEmailForEmployeeId } from "./db.js";

function safeSend(to, subject, text) {
  if (!to) return Promise.resolve({ delivered: false, skipped: "no_recipient" });
  return sendSmtpMail({ from: mailFrom(), to, subject, text }).catch((err) => ({
    delivered: false,
    error: err?.message ?? String(err)
  }));
}

function formatChanges(requestedChanges) {
  if (!requestedChanges || typeof requestedChanges !== "object") return "—";
  return Object.entries(requestedChanges)
    .map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`)
    .join("\n");
}

export async function notifyCorrectionRequested(correction) {
  if (!correction) return [];
  const admins = listAdminEmails();
  if (admins.length === 0) return [];
  const subject = `Neuer Korrekturantrag (${correction.id})`;
  const text = [
    `Es liegt ein neuer Korrekturantrag zur Freigabe vor.`,
    ``,
    `ID: ${correction.id}`,
    `Time-Entry: ${correction.timeEntryId}`,
    `Antragsteller (Mitarbeiter-ID): ${correction.employeeId}`,
    `Eingereicht: ${correction.createdAt}`,
    `Grund: ${correction.reason || "—"}`,
    ``,
    `Beantragte Änderungen:`,
    formatChanges(correction.requestedChanges),
    ``,
    `Bitte im Freigabe-Bereich der Workforce-Time-Oberfläche prüfen.`
  ].join("\n");
  return Promise.all(admins.map((to) => safeSend(to, subject, text)));
}

export async function notifyCorrectionDecided(correction, decision) {
  if (!correction) return null;
  const to = getEmailForEmployeeId(correction.employeeId);
  if (!to) return { delivered: false, skipped: "no_applicant_email" };
  const verb = decision === "approve" ? "genehmigt" : "abgelehnt";
  const subject = `Korrekturantrag ${verb} (${correction.id})`;
  const lines = [
    `Dein Korrekturantrag wurde ${verb}.`,
    ``,
    `ID: ${correction.id}`,
    `Time-Entry: ${correction.timeEntryId}`,
    `Status: ${correction.status}`,
    `Geprüft am: ${correction.reviewedAt ?? "—"}`,
    `Reviewer: ${correction.reviewerId ?? "—"}`
  ];
  if (correction.reviewNote) {
    lines.push("", `Notiz: ${correction.reviewNote}`);
  }
  return safeSend(to, subject, lines.join("\n"));
}
