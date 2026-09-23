import api from "../api";

export interface ResumeListItem {
  id: number;
  original_filename: string;
  status: string;
  uploaded_at: string;
}

export interface Education {
  id: number;
  degree: string | null;
  field_of_study: string | null;
  institution: string | null;
  grade: string | null;
  start_year: number | null;
  end_year: number | null;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  project_url: string | null;
  github_url: string | null;
}

export interface Skill {
  id: number;
  name: string;
  source: string | null;
}

export interface Course {
  id: number;
  name: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string | null;
  issue_date: string | null;
}

export interface Achievement {
  id: number;
  description: string;
}

export interface ResumeDetail {
  id: number;
  original_filename: string;
  status: string;
  uploaded_at: string;

  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  courses: Course[];
  certifications: Certification[];
  achievements: Achievement[];
}

export interface ResumeUploadResponse {
  message: string;
  resume_id: number;
  original_filename: string;
}

export async function getResumes(): Promise<ResumeListItem[]> {
  const response = await api.get<ResumeListItem[]>("/resumes");
  return response.data;
}

export async function getResume(
  resumeId: number
): Promise<ResumeDetail> {
  const response = await api.get<ResumeDetail>(
    `/resumes/${resumeId}`
  );

  return response.data;
}

export async function uploadResume(
  file: File
): Promise<ResumeUploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<ResumeUploadResponse>(
    "/resumes/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function deleteResume(
  resumeId: number
): Promise<void> {
  await api.delete(`/resumes/${resumeId}`);
}