import { apiRequest } from "@/lib/api/client";
import type { SubmissionPayload } from "@/lib/types";

/**
 * The single form endpoint, served by the route handler in
 * `src/app/api/submissions`. Both callers are client components, so the
 * relative base URL resolves.
 */
export function sendSubmission(
  payload: SubmissionPayload,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/submissions", {
    method: "POST",
    body: payload,
  });
}
