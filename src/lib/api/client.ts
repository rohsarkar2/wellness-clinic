/**
 * Thin fetch wrapper for this app's own route handlers in `src/app/api`.
 *
 * The base URL is relative, so callers must run in the browser — true of the
 * two forms that use it. The handlers always answer with JSON, and put a
 * patient-safe sentence in `message` when something goes wrong.
 */

const BASE_URL = "/api";
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "Content-Type": "application/json", ...headers },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new ApiError("The request timed out. Please check your connection and try again.", 408);
    }
    throw new ApiError("Unable to reach the server. Please try again in a moment.", 0);
  }

  // Null when the body isn't JSON at all — a crash serving Next's error page, say.
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return payload as T;
}

/** Normalises anything thrown into a message safe to show a patient. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
