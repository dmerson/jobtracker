export type JobStatus =
  | "applied"
  | "contacted"
  | "interview"
  | "offer"
  | "rejected"
  | "closed";

export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "contacted", label: "Contacted / Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
];

export interface Profile {
  user_id: string;
  full_name: string;
  summary: string;
  skills: string;
  base_resume_content: string;
  created_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  title: string;
  job_description: string;
  application_url: string;
  status: JobStatus;
  next_step: string;
  applied_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  job_application_id: string;
  user_id: string;
  interview_date: string | null;
  round_type: string;
  interviewers: string;
  notes: string;
  created_at: string;
}

export interface CoverLetter {
  id: string;
  job_application_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Resume {
  id: string;
  job_application_id: string | null;
  user_id: string;
  title: string;
  content: string;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
}
