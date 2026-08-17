export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  /** One-line summary shown on the card. */
  tagline: string;
  qualifications: string[];
  experienceYears: number;
  image: string;
  description: string;
  department: string;
  languages: string[];
  availableDays: string[];
  consultationFee: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  /** Font Awesome class, e.g. "fa-solid fa-heart-pulse". */
  icon: string;
}

export interface TimeSlot {
  /** 24h "HH:mm" — the value sent to the backend. */
  time: string;
  /** Human label, e.g. "09:30 AM". */
  label: string;
  available: boolean;
}

export interface AvailabilityResponse {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
  /** Explains an empty/closed day, e.g. "The clinic is closed on Sundays". */
  notice?: string;
}

export interface AppointmentPayload {
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  patientName: string;
  email: string;
  phone: string;
  reason: string;
}

export interface Appointment extends AppointmentPayload {
  id: string;
  reference: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  doctorName: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  department: string;
  message: string;
}

export interface Enquiry extends ContactPayload {
  id: string;
  createdAt: string;
}
