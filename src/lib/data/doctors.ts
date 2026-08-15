import type { Doctor } from "@/lib/types";

/**
 * Seed data for the clinic's doctors, taken from the original static site.
 * This is what the placeholder API routes serve until the Node.js backend
 * takes over (see NEXT_PUBLIC_API_URL in .env.example).
 */
export const doctors: Doctor[] = [
  {
    id: "sayan-bose",
    name: "Dr. Sayan Bose",
    speciality: "Consultant Paediatrician",
    tagline: "Child Healthcare & Growth Monitoring",
    qualifications: ["MBBS", "MD (Paediatrics)"],
    experienceYears: 12,
    image: "/images/dr.sayan.jpeg",
    department: "General Medicine",
    description:
      "Dr. Sayan Bose is a consultant paediatrician with over a decade of experience caring for newborns, infants and adolescents. He focuses on growth monitoring, immunisation schedules, nutritional guidance and the early detection of developmental concerns, and is known for putting anxious parents at ease.",
    languages: ["English", "Hindi", "Bengali"],
    availableDays: ["Monday", "Thursday", "Saturday"],
    consultationFee: 600,
  },
  {
    id: "sayantani-bhanja",
    name: "Dr. Sayantani Bhanja",
    speciality: "Consultant Gynaecologist",
    tagline: "Women's Health & Pregnancy Care",
    qualifications: ["MBBS", "MS (Obstetrics & Gynaecology)"],
    experienceYears: 10,
    image: "/images/dr.sayantani.jpeg",
    department: "Gynecology",
    description:
      "Dr. Sayantani Bhanja provides comprehensive women's healthcare across every life stage — from adolescent health and family planning to antenatal care, high-risk pregnancy management and menopause support. She believes in shared decision making and evidence-based, respectful care.",
    languages: ["English", "Hindi", "Bengali"],
    availableDays: ["Tuesday", "Wednesday", "Friday", "Saturday"],
    consultationFee: 700,
  },
  {
    id: "riya-das",
    name: "Dr. Riya Das",
    speciality: "ENT Specialist",
    tagline: "Ear, Nose & Throat Care",
    qualifications: ["MBBS", "MS (ENT)"],
    experienceYears: 8,
    image: "/images/dr.riya.jpeg",
    department: "General Medicine",
    description:
      "Dr. Riya Das treats the full range of ear, nose and throat conditions, including chronic sinusitis, hearing loss, tonsillitis, vertigo and voice disorders. She combines careful diagnostic work-ups with conservative management wherever surgery can be avoided.",
    languages: ["English", "Hindi", "Bengali"],
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    consultationFee: 600,
  },
  {
    id: "manas-mukul-mondal",
    name: "Dr. Manas Mukul Mondal",
    speciality: "General & Laparoscopic Surgeon",
    tagline: "Advanced Surgical Care",
    qualifications: ["MBBS", "MS (General Surgery)", "FMAS"],
    experienceYears: 18,
    image: "/images/dr-manas.jpeg",
    department: "Orthopedics",
    description:
      "Dr. Manas Mukul Mondal is a senior general and laparoscopic surgeon with 18 years of operative experience. He specialises in minimally invasive procedures for hernia, gallbladder and appendix conditions, offering shorter hospital stays and faster recovery for his patients.",
    languages: ["English", "Hindi", "Bengali"],
    availableDays: [],
    consultationFee: 800,
  },
  {
    id: "ayan-dey",
    name: "Dr. Ayan Dey",
    speciality: "Physician & Diabetologist",
    tagline: "Diabetes & Lifestyle Management",
    qualifications: ["MBBS", "MD (General Medicine)", "PGDip (Diabetology)"],
    experienceYears: 14,
    image: "/images/dr.ayan.jpeg",
    department: "General Medicine",
    description:
      "Dr. Ayan Dey manages diabetes, hypertension, thyroid disorders and other long-term conditions. His approach pairs medication with practical, sustainable lifestyle changes, and he runs structured follow-up plans so patients can see their numbers improve over time.",
    languages: ["English", "Hindi", "Bengali"],
    availableDays: ["Monday", "Tuesday"],
    consultationFee: 650,
  },
];

export function findDoctor(id: string): Doctor | undefined {
  return doctors.find((doctor) => doctor.id === id);
}
