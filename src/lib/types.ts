export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  tagline: string;
  qualifications: string[];
  experienceYears: number;
  image: string;
  description: string;
  department: string;
  languages: string[];
  availableDays: string[];
  // consultationFee: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;

  icon: string;
}

export interface SubmissionPayload {
  name: string;
  email: string;
  phone: string;
  department: string;
  /** Only the appointment form sends this — an enquiry leaves it empty. */
  doctorId: string;
  reason: string;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  /** The doctor's name, or null when the submission came from the enquiry form. */
  doctor: string | null;
  reason: string;
  createdAt: string;
}
