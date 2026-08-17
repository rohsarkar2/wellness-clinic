import { ApiError } from "@/lib/api/client";

/**
 * Response helpers for the route handlers.
 *
 * The body shape matters: `apiRequest` in src/lib/api/client.ts reads `message`
 * off a failed response and shows it to the patient, so every error here must
 * carry a sentence that is safe to display.
 */

export function jsonError(message: string, status: number): Response {
  return Response.json({ message }, { status });
}

/** Keeps an ApiError's status and message; anything else becomes a logged 500. */
export function errorResponse(error: unknown, fallback: string): Response {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status || 500);
  }
  console.error(fallback, error);
  return jsonError(fallback, 500);
}

/** Trims a value from an untrusted JSON body into a string. */
export function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
