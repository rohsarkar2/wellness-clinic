import type { Service } from "@/lib/types";

/** Departments/services offered, carried over from the original static site. */
export const services: Service[] = [
  {
    id: "general-medicine",
    title: "General Medicine",
    description: "Primary healthcare, routine consultations and long-term condition management.",
    icon: "fa-solid fa-stethoscope",
  },
  {
    id: "cardiology",
    title: "Cardiology",
    description: "Heart health screening, diagnosis and ongoing treatment.",
    icon: "fa-solid fa-heart-pulse",
  },
  {
    id: "gynecology",
    title: "Gynecology",
    description: "Women's healthcare, antenatal care and family planning services.",
    icon: "fa-solid fa-person-pregnant",
  },
  {
    id: "orthopedics",
    title: "Orthopedics",
    description: "Bone, joint and musculoskeletal care including post-injury rehabilitation.",
    icon: "fa-solid fa-bone",
  },
  {
    id: "diagnostics",
    title: "Diagnostics",
    description: "Modern pathology and laboratory testing with accurate, timely reports.",
    icon: "fa-solid fa-microscope",
  },
  {
    id: "health-checkups",
    title: "Health Checkups",
    description: "Preventive wellness packages tailored to age and risk profile.",
    icon: "fa-solid fa-user-doctor",
  },
];

/** Department names used by the appointment and contact forms. */
export const departments = services.map((service) => service.title);
