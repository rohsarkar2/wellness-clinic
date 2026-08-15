/**
 * Thin fetch wrapper shared by every API service module.
 *
 * While NEXT_PUBLIC_API_URL is unset the service modules serve data from
 * `src/lib/mock`. Set it to the Node.js + Supabase backend (e.g.
 * `http://localhost:5000/api`) and every request below goes over the wire
 * instead — no component or page needs to change.
 */

/** True once a backend URL is configured; otherwise the mock layer is used. */
export function hasBackend(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

function resolveBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Passed through to Next's extended fetch for server-side caching. */
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const url = `${resolveBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please check your connection and try again.", 408);
    }
    throw new ApiError("Unable to reach the server. Please try again in a moment.", 0);
  } finally {
    clearTimeout(timeout);
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const message =
      (isRecord(payload) && typeof payload.message === "string" && payload.message) ||
      (isRecord(payload) && typeof payload.error === "string" && payload.error) ||
      `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  // Backends commonly wrap payloads as { data: ... } — unwrap when present.
  if (isRecord(payload) && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Normalises anything thrown into a message safe to show a patient. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
