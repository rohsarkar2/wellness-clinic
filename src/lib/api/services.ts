import { services } from "@/lib/data/services";
import type { Service } from "@/lib/types";

/** Seed data, like doctors — see the note in `src/lib/api/doctors.ts`. */
export async function getServices(): Promise<Service[]> {
  return services;
}
