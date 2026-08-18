/**
 * The clinic's brand mark, embedded in the notification emails.
 *
 * Inlined as base64 rather than read from `public/` at send time: the mail
 * goes out from a route handler, and on serverless hosts `public/` is served
 * by the CDN without being bundled into the function, so a runtime `readFile`
 * would work locally and then fail once deployed. The mark is 96x96 and under
 * 2 kB, so carrying it in the bundle costs nothing worth measuring.
 *
 * Keyed onto transparency from the clinic's poster artwork, so it sits
 * straight on the masthead's navy with no plate behind it. To regenerate,
 * scale `public/images/logo-mark.png` down to 96x96 and re-encode.
 */

/** Referenced from the HTML as `cid:` — see `shell()` in email.ts. */
export const LOGO_CID = "wellness-mark";

export const LOGO_FILENAME = "wellness-health-point.png";

export const LOGO_PNG: Buffer = Buffer.from(
  "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" +
  "Uh2QMpkAAAAASUVORK5CYII=",
  "base64",
);
