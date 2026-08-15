import type { MetadataRoute } from "next";

import { getDoctors } from "@/lib/api/doctors";
import { site } from "@/lib/site";

/** Static routes, most important first. `/appointment/success` is noindex. */
const ROUTES = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/doctors", changeFrequency: "weekly", priority: 0.9 },
  { path: "/appointment", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // A failed fetch shouldn't take the whole sitemap down with it.
  let doctorIds: string[] = [];
  try {
    doctorIds = (await getDoctors()).map((doctor) => doctor.id);
  } catch {
    doctorIds = [];
  }

  return [
    ...ROUTES.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...doctorIds.map((id) => ({
      url: `${site.url}/doctors/${id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
