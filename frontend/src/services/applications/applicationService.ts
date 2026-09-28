import api from "../api";


export type ApplicationStatus =
  | "saved"
  | "applied"
  | "oa"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";


export type ApplicationSource =
  | "manual"
  | "adzuna";


export interface Application {
  id: number;

  job_title: string;
  company: string;

  location: string | null;
  job_url: string | null;

  external_job_id: string | null;

  source: ApplicationSource;
  status: ApplicationStatus;

  notes: string | null;

  applied_at: string | null;
  created_at: string;
  updated_at: string;
}


export interface CreateApplicationPayload {
  job_title: string;
  company: string;

  location?: string;
  job_url?: string;

  external_job_id?: string;

  source?: ApplicationSource;
  status?: ApplicationStatus;

  notes?: string;
}


export interface UpdateApplicationPayload {
  status?: ApplicationStatus;
  notes?: string;
}


export async function getApplications(): Promise<Application[]> {
  const response = await api.get<Application[]>(
    "/applications"
  );

  return response.data;
}


export async function createApplication(
  payload: CreateApplicationPayload
): Promise<Application> {
  const response = await api.post<Application>(
    "/applications",
    payload
  );

  return response.data;
}


export async function updateApplication(
  applicationId: number,
  payload: UpdateApplicationPayload
): Promise<Application> {
  const response = await api.patch<Application>(
    `/applications/${applicationId}`,
    payload
  );

  return response.data;
}


export async function deleteApplication(
  applicationId: number
): Promise<void> {
  await api.delete(
    `/applications/${applicationId}`
  );
}