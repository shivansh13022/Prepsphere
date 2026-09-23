import api from "../api";

export interface JobCreate {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  source_url: string | null;
}

export interface Job {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  description: string;
  source_url: string | null;
  status: string;
  created_at: string;
}

export interface JobAnalysis {
  role_summary: string | null;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  required_experience: string | null;
  education_requirements: string[];
  keywords: string[];
}

export interface JobMatch {
  match_score: number;
  relevance: string;

  matched_required_skills: string[];
  missing_required_skills: string[];

  matched_preferred_skills: string[];
  missing_preferred_skills: string[];

  candidate_skills: string[];
  job_required_skills: string[];
}

export async function createJob(
  data: JobCreate
): Promise<Job> {
  const response = await api.post<Job>("/jobs", data);
  return response.data;
}

export async function getJobs(): Promise<Job[]> {
  const response = await api.get<Job[]>("/jobs");
  return response.data;
}

export async function getJob(
  jobId: number
): Promise<Job> {
  const response = await api.get<Job>(`/jobs/${jobId}`);
  return response.data;
}

export async function analyzeJob(
  jobId: number
): Promise<JobAnalysis> {
  const response = await api.post<JobAnalysis>(
    `/jobs/${jobId}/analyze`
  );

  return response.data;
}

export async function getJobMatch(
  jobId: number
): Promise<JobMatch> {
  const response = await api.get<JobMatch>(
    `/jobs/${jobId}/match`
  );

  return response.data;
}