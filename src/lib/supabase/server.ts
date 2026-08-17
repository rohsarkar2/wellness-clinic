import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the secret key, which bypasses RLS — every table in this project has RLS
 * enabled with no policies, so this is the only way in. The env var is
 * deliberately not NEXT_PUBLIC_ prefixed: it must never reach the browser.
 * Only import this from route handlers and other server-only modules.
 */

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin() must only be called on the server.");
  }

  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  // No sessions here: every request is an anonymous patient submitting a form.
  cached = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
