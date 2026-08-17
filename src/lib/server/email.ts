import { format, parseISO } from "date-fns";
import nodemailer, { type Transporter } from "nodemailer";

import { site } from "@/lib/site";
import type { Appointment, Enquiry } from "@/lib/types";

/**
 * Clinic notification email.
 *
 * Nothing here is patient-facing — the only recipient is the clinic's own
 * inbox, which is the only place a booking or an enquiry would otherwise
 * surface.
 *
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
    console.warn(
      `SMTP is not configured — no clinic notification sent for ${label}.`,
    );
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
export function notifyClinicOfAppointment(
  appointment: Appointment,
): Promise<boolean> {
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
    enquiry.email || undefined,
    `enquiry ${enquiry.id}`,
  );
}

// ---------------------------------------------------------------------------
// Messages — exported so they can be previewed without sending.

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
      footnote:
        "Sent automatically when a patient books through the website. Replying to this email writes to the patient.",
      content:
        hero(
          formatDate(appointment.date, "EEEE, d MMMM yyyy"),
          `${displayTime(appointment.time)} &nbsp;·&nbsp; ${escapeHtml(appointment.doctorName)}`,
        ) +
        contact(
          "Patient",
          appointment.patientName,
          appointment.email,
          appointment.phone,
        ) +
        prose("Reason for visit", reason) +
        closing("Reference", appointment.reference, true),
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
        hero(
          enquiry.department,
          `Received ${escapeHtml(receivedAt(enquiry.createdAt))}`,
        ) +
        contact("Enquirer", enquiry.name, enquiry.email, enquiry.phone) +
        prose("Message", message) +
        closing("Callback requested", enquiry.phone, false),
    }),
  };
}

// ---------------------------------------------------------------------------
// Shared HTML
// ---------------------------------------------------------------------------

// Palette from src/app/globals.css. Navy frames the message — the page behind
// the card, the masthead, the footer strip — and the details sit on a soft
// tinted sheet between them. No white surfaces, no stacked panels.
const CANVAS = "#0a1a2f"; // page behind the card
const NAVY = "#10253f"; // masthead and footer strip
const PRIMARY = "#0a6ebd";
const SHEET = "#e4ecf6"; // the tinted body
const RULE = "#cbd8e8"; // hairline dividers on the sheet
const INK = "#1f2d3d";
const BODY = "#566573";
const MUTED = "#8794a3";
const ON_NAVY = "#f2f7fc"; // heading on the masthead
const ON_NAVY_SOFT = "#8fb6dc"; // brand line and footnote

// Inlined on every element: <style> blocks are unreliable across clients, and
// Outlook ignores flex and grid entirely — hence the nested tables below.
const FONT =
  "'Segoe UI',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Courier New',monospace";

interface Shell {
  /** Browser/window title — never rendered in the message body. */
  title: string;
  /** Headline in the navy masthead. */
  heading: string;
  /** Hidden line the inbox list shows instead of the first words of the body. */
  preheader: string;
  /** Small note in the navy strip at the foot of the card. */
  footnote: string;
  /** Body rows, each produced by one of the builders below. */
  content: string;
}

function shell({
  title,
  heading,
  preheader,
  footnote,
  content,
}: Shell): string {
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
<body style="margin:0;padding:0;background:${CANVAS};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CANVAS};">
<tr><td align="center" style="padding:28px 14px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${SHEET};border-radius:16px;overflow:hidden;">

  <tr><td style="background:${NAVY};padding:26px 28px 24px;font-family:${FONT};">
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${ON_NAVY_SOFT};">${escapeHtml(site.name)}</p>
    <h1 style="margin:0;font-size:21px;line-height:1.3;font-weight:600;color:${ON_NAVY};">${escapeHtml(heading)}</h1>
  </td></tr>

  <tr><td style="background:${SHEET};padding:24px 28px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${content}
    </table>
  </td></tr>

  <tr><td style="background:${NAVY};padding:16px 28px;">
    <p style="margin:0;font-family:${FONT};font-size:11.5px;line-height:1.6;color:${ON_NAVY_SOFT};">${escapeHtml(footnote)}</p>
  </td></tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}

/** Opening line — what the clinic reads first. `sub` carries markup. */
function hero(main: string, sub: string): string {
  return `<tr><td style="padding:0 0 20px;font-family:${FONT};">
    <p style="margin:0 0 4px;font-size:19px;line-height:1.3;font-weight:600;color:${INK};">${escapeHtml(main)}</p>
    <p style="margin:0;font-size:14.5px;color:${BODY};">${sub}</p>
  </td></tr>`;
}

/** Who to contact, as a label/value grid so the number is easy to scan to. */
function contact(
  label: string,
  name: string,
  email: string,
  phone: string,
): string {
  return block(
    label,
    `<p style="margin:0 0 12px;font-family:${FONT};font-size:17px;font-weight:600;color:${INK};">${escapeHtml(name)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${detailRow("Phone", phoneLink(phone))}
      ${detailRow("Email", email ? mailLink(email) : notGiven())}
    </table>`,
  );
}

/** Free text the patient typed — may be empty, and is never trusted as markup. */
function prose(label: string, text: string): string {
  return block(
    label,
    `<p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${text ? BODY : MUTED};">${text ? escapeHtml(text) : "Not given"}</p>`,
  );
}

/**
 * Closing line — the single value the clinic acts on. `mono` sets a booking
 * reference in monospace so its characters can't be misread.
 */
function closing(label: string, value: string, mono: boolean): string {
  return block(
    label,
    `<p style="margin:0;font-family:${mono ? MONO : FONT};font-size:17px;font-weight:600;letter-spacing:${mono ? "1.5px" : "0.3px"};color:${INK};">${escapeHtml(value)}</p>`,
  );
}

/** A labelled section, divided from the one above it by a hairline. */
function block(label: string, inner: string): string {
  return `<tr><td style="padding:0 0 20px;">
    <div style="border-top:1px solid ${RULE};padding-top:18px;">
      ${sectionLabel(label)}
      ${inner}
    </div>
  </td></tr>`;
}

/**
 * One label/value line. Both cells share a fixed 22px line box and identical
 * padding — the label is far smaller than the value, so anything relative
 * leaves the two sitting at different heights.
 *
 * `value` is pre-escaped — it carries a link.
 */
function detailRow(label: string, value: string): string {
  const cell = `padding:3px 0;font-family:${FONT};line-height:22px;`;

  return `<tr>
    <td width="70" valign="top" style="width:70px;${cell}font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};">${escapeHtml(label)}</td>
    <td valign="top" style="${cell}font-size:14.5px;color:${BODY};">${value}</td>
  </tr>`;
}

function notGiven(): string {
  return `<span style="color:${MUTED};">Not given</span>`;
}

function sectionLabel(label: string): string {
  return `<p style="margin:0 0 8px;font-family:${FONT};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">${escapeHtml(label)}</p>`;
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
