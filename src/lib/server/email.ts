import { format, parseISO } from "date-fns";
import nodemailer, { type Transporter } from "nodemailer";

import { site } from "@/lib/site";
import type { Appointment, Enquiry } from "@/lib/types";

/**
 * Clinic notification email.
 *
 * Nothing here is patient-facing — the only recipient is the clinic's own
 * inbox, which is the only place a booking or an enquiry would otherwise
 * surface (both tables have RLS on with no policies, so nobody is watching
 * them).
 *
 * Server-only: SMTP_PASSWORD grants send access to the clinic mailbox and must
 * never reach the browser. Import this from route handlers only.
 */

let cached: Transporter | null = null;

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  to: string[];
}

function readConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const to = process.env.CLINIC_NOTIFICATION_EMAIL;

  // Missing config is not an error: local development and preview builds should
  // still take bookings. The caller logs the skip.
  if (!host || !user || !password || !to) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    user,
    password,
    // Most providers reject a From that isn't the authenticated mailbox.
    from: process.env.SMTP_FROM || user,
    to: to
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean),
  };
}

function transporter(config: SmtpConfig): Transporter {
  if (cached) return cached;

  cached = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    // 465 is implicit TLS; 587 opens plaintext and upgrades via STARTTLS.
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
  });

  return cached;
}

interface Message {
  subject: string;
  text: string;
  html: string;
}

/**
 * Resolves either way — the row is already committed by the time this runs, and
 * an unreachable mail server must not turn a saved submission into a failure.
 * `label` identifies the row in the logs when a send is skipped or fails.
 */
async function sendToClinic(
  message: Message,
  replyTo: string | undefined,
  label: string,
): Promise<boolean> {
  const config = readConfig();
  if (!config) {
    console.warn(`SMTP is not configured — no clinic notification sent for ${label}.`);
    return false;
  }

  try {
    await transporter(config).sendMail({
      from: config.from,
      to: config.to,
      // Lets the clinic reply straight to the patient from the notification.
      replyTo,
      ...message,
    });
    return true;
  } catch (error) {
    console.error(`Failed to email the clinic about ${label}`, error);
    return false;
  }
}

/** Emails the clinic a new booking. */
export function notifyClinicOfAppointment(appointment: Appointment): Promise<boolean> {
  return sendToClinic(
    renderAppointmentEmail(appointment),
    appointment.email,
    appointment.reference,
  );
}

/** Emails the clinic a new callback enquiry. */
export function notifyClinicOfEnquiry(enquiry: Enquiry): Promise<boolean> {
  return sendToClinic(
    renderEnquiryEmail(enquiry),
    // The contact form makes email optional; with none given there is nothing
    // to reply to, and the clinic has to use the phone number in the body.
    enquiry.email || undefined,
    `enquiry ${enquiry.id}`,
  );
}

// ---------------------------------------------------------------------------
// Messages — exported so they can be previewed without sending.
// ---------------------------------------------------------------------------

export function renderAppointmentEmail(appointment: Appointment): Message {
  const reason = appointment.reason.trim();

  return {
    subject: `New booking ${appointment.reference} — ${appointment.patientName}, ${longDate(appointment.date)} ${displayTime(appointment.time)}`,
    text: [
      `New appointment booking — ${site.name}`,
      "",
      `${formatDate(appointment.date, "EEEE, d MMMM yyyy")} at ${displayTime(appointment.time)}`,
      `With ${appointment.doctorName}`,
      "",
      `Patient:   ${appointment.patientName}`,
      `Email:     ${appointment.email}`,
      `Phone:     ${appointment.phone}`,
      `Reason:    ${reason || "Not given"}`,
      "",
      `Reference: ${appointment.reference}`,
      "",
      "Reply to this email to write to the patient directly.",
    ].join("\n"),
    html: shell({
      heading: "New appointment booking",
      preheader: `${appointment.patientName} · ${longDate(appointment.date)} · ${displayTime(appointment.time)}`,
      title: appointment.reference,
      footnote: "Sent automatically when a patient books through the website. Replying to this email writes to the patient.",
      content:
        highlight(
          formatDate(appointment.date, "EEEE, d MMMM yyyy"),
          `${displayTime(appointment.time)} &nbsp;·&nbsp; ${escapeHtml(appointment.doctorName)}`,
        ) +
        contactSection("Patient", appointment.patientName, appointment.email, appointment.phone) +
        proseSection("Reason for visit", reason) +
        footerRow("Reference", appointment.reference),
    }),
  };
}

export function renderEnquiryEmail(enquiry: Enquiry): Message {
  const message = enquiry.message.trim();

  return {
    subject: `New enquiry — ${enquiry.name}, ${enquiry.department}`,
    text: [
      `New callback enquiry — ${site.name}`,
      "",
      `Department: ${enquiry.department}`,
      `Received:   ${receivedAt(enquiry.createdAt)}`,
      "",
      `Name:       ${enquiry.name}`,
      `Phone:      ${enquiry.phone}`,
      `Email:      ${enquiry.email || "Not given"}`,
      `Message:    ${message || "Not given"}`,
      "",
      enquiry.email
        ? "Reply to this email to write to them directly."
        : "No email address was given — call the number above.",
    ].join("\n"),
    html: shell({
      heading: "New callback enquiry",
      preheader: `${enquiry.name} · ${enquiry.department}`,
      title: `Enquiry — ${enquiry.name}`,
      footnote: enquiry.email
        ? "Sent automatically when the contact form is submitted. Replying to this email writes to the enquirer."
        : "Sent automatically when the contact form is submitted. No email address was given, so this message cannot be replied to — call the number above.",
      content:
        highlight(enquiry.department, `Received ${escapeHtml(receivedAt(enquiry.createdAt))}`) +
        contactSection("Enquirer", enquiry.name, enquiry.email, enquiry.phone) +
        proseSection("Message", message) +
        footerRow("Callback requested", enquiry.phone),
    }),
  };
}

// ---------------------------------------------------------------------------
// Shared HTML
// ---------------------------------------------------------------------------

// Palette from src/app/globals.css, so the notification looks like the site.
const NAVY = "#10253f";
const PRIMARY = "#0a6ebd";
const INK = "#1f2d3d";
const BODY = "#566573";
const MUTED = "#9aa5b1";
const MIST = "#f5faff";
const LINE = "#e4edf8";

// Inlined on every element: <style> blocks are unreliable across clients, and
// Outlook ignores flex and grid entirely — hence the nested tables below.
const FONT = "'Segoe UI',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

interface Shell {
  /** Browser/window title — never rendered in the message body. */
  title: string;
  /** Headline in the navy bar. */
  heading: string;
  /** Hidden line the inbox list shows instead of the first words of the body. */
  preheader: string;
  /** Grey note under the card. */
  footnote: string;
  content: string;
}

function shell({ title, heading, preheader, footnote, content }: Shell): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Stops iOS Mail and Outlook.com from auto-inverting the palette. -->
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${MIST};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MIST};">
<tr><td align="center" style="padding:24px 12px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(16,37,63,0.08);">

  <tr><td style="background:${NAVY};padding:28px 32px;">
    <p style="margin:0 0 6px;font-family:${FONT};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8fb6dc;">${escapeHtml(site.name)}</p>
    <h1 style="margin:0;font-family:${FONT};font-size:22px;line-height:1.3;font-weight:600;color:#ffffff;">${escapeHtml(heading)}</h1>
  </td></tr>

  ${content}

</table>

<p style="margin:20px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};max-width:600px;">
  ${escapeHtml(footnote)}
</p>

</td></tr>
</table>
</body>
</html>`;
}

/** The mist panel under the header. `sub` is pre-escaped — it carries markup. */
function highlight(main: string, sub: string): string {
  return `<tr><td style="padding:32px 32px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MIST};border-left:3px solid ${PRIMARY};border-radius:0 12px 12px 0;">
      <tr><td style="padding:20px 24px;font-family:${FONT};">
        <p style="margin:0 0 4px;font-size:19px;font-weight:600;color:${INK};">${escapeHtml(main)}</p>
        <p style="margin:0;font-size:15px;color:${BODY};">${sub}</p>
      </td></tr>
    </table>
  </td></tr>`;
}

function contactSection(label: string, name: string, email: string, phone: string): string {
  const rows = [phoneLink(phone), email ? mailLink(email) : null]
    .filter(Boolean)
    .map((cell) => `<tr><td style="padding:2px 0;">${cell}</td></tr>`)
    .join("");

  return `<tr><td style="padding:24px 32px 0;">
    ${sectionLabel(label)}
    <p style="margin:0 0 10px;font-family:${FONT};font-size:17px;font-weight:600;color:${INK};">${escapeHtml(name)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:${FONT};font-size:14px;">${rows}</table>
  </td></tr>`;
}

/** Free text the patient typed — may be empty, and is never trusted as markup. */
function proseSection(label: string, text: string): string {
  return `<tr><td style="padding:24px 32px 0;">
    <div style="border-top:1px solid ${LINE};padding-top:24px;">
      ${sectionLabel(label)}
      <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${text ? BODY : MUTED};">${text ? escapeHtml(text) : "Not given"}</p>
    </div>
  </td></tr>`;
}

function footerRow(label: string, value: string): string {
  return `<tr><td style="padding:28px 32px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};">
      <tr><td style="padding-top:20px;font-family:${FONT};font-size:13px;color:${MUTED};">
        ${escapeHtml(label)} <span style="color:${INK};font-weight:600;">${escapeHtml(value)}</span>
      </td></tr>
    </table>
  </td></tr>`;
}

function sectionLabel(label: string): string {
  return `<p style="margin:0 0 8px;font-family:${FONT};font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${MUTED};">${escapeHtml(label)}</p>`;
}

function mailLink(email: string): string {
  return `<a href="mailto:${encodeURIComponent(email)}" style="color:${PRIMARY};text-decoration:none;">${escapeHtml(email)}</a>`;
}

/** Strips spaces and punctuation so the tel: link dials on a phone. */
function phoneLink(phone: string): string {
  const dialable = phone.replace(/[^\d+]/g, "");
  if (!dialable) return escapeHtml(phone);
  return `<a href="tel:${encodeURIComponent(dialable)}" style="color:${PRIMARY};text-decoration:none;">${escapeHtml(phone)}</a>`;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** "Thu 20 Aug 2026"; falls back to the raw value if the date is unparseable. */
function longDate(date: string): string {
  return formatDate(date, "EEE d MMM yyyy");
}

function formatDate(date: string, pattern: string): string {
  try {
    return format(parseISO(date), pattern);
  } catch {
    return date;
  }
}

/** "09:00" → "9:00 AM". Slot times are stored 24h; the clinic reads 12h. */
function displayTime(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time;

  const hours = Number(match[1]);
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${match[2]} ${suffix}`;
}

/**
 * Postgres stamps created_at in UTC and the server runs in UTC too, so this is
 * pinned to the clinic's own timezone — otherwise a 9pm enquiry reads as 3:30pm.
 */
function receivedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Patient-supplied values reach the clinic's inbox — never inline them raw. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
