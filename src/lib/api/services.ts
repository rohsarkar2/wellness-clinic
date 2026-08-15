import { apiRequest, hasBackend } from "@/lib/api/client";
import { mockGetServices } from "@/lib/mock";
import type { Service } from "@/lib/types";

export function getServices(): Promise<Service[]> {
  if (!hasBackend()) return mockGetServices();
  return apiRequest<Service[]>("/services", { next: { revalidate: 3600 } });
}
