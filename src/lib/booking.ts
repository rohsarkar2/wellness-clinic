/**
 * The clinic's booking rules.
 *
 * Plain config with no imports, so both the server (src/lib/server/availability.ts,
 * which enforces these) and the appointment form (which uses them to shape the
 * inputs) can read the same numbers. The form's limits are a convenience —
 * the server is what decides.
 */

/** Consulting hours, 24h. Slots run up to but not including the closing hour. */
export const CLINIC_OPEN_HOUR = 9;
export const CLINIC_CLOSE_HOUR = 20;

/** Length of one consultation slot, in minutes. */
export const SLOT_MINUTES = 30;

/** How far ahead a patient may book. */
export const BOOKING_WINDOW_DAYS = 60;

/**
 * The clinic's wall clock. The server's own clock is not usable for "is this
 * slot in the past" — Vercel runs in UTC, a different calendar day from IST for
 * 5.5 hours of every day, which would retire this evening's slots too early.
 */
export const CLINIC_TIME_ZONE = "Asia/Kolkata";
