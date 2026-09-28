import api from "../api";

// ======================================================
// TYPES
// ======================================================
export interface InterviewSession {
  id: number;
  user_id: number;
  job_id: number | null;
  focus: string | null;
  difficulty: string;
  duration_minutes: number;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface CreateInterviewData {
  job_id?: number | null;
  focus?: string | null;
  difficulty: string;
  duration_minutes: 15 | 30 | 45 | 60;
}

export interface InterviewStartResponse {
  interview_id: number;
  status: string;
  current_topic: string | null;
  question: string;
  questions_asked: number;
}

export interface InterviewAnswerResponse {
  interview_id: number;
  status: string;
  current_topic: string | null;
  question: string | null;
  questions_asked: number;
}
export interface TopicPerformance {
  topic: string;
  overall_score: number;
  technical_knowledge: number;
  completeness: number;
  depth: number;
  communication: number;
  questions_answered: number;
}

export interface InterviewReport {
  overall_score: number;
  technical_knowledge: number;
  completeness: number;
  depth: number;
  communication: number;

  topic_performance: TopicPerformance[];

  strengths: string[];
  weaknesses: string[];
  topics_to_improve: string[];
  recommendations: string[];
  summary: string;
}
export interface OverallPerformance {
  average_score: number;
  latest_score: number;
  technical_knowledge: number;
  completeness: number;
  depth: number;
  communication: number;
}

export interface InterviewTrendPoint {
  interview_id: number;
  score: number;
  completed_at: string;
}

export interface TopicAnalytics {
  topic: string;
  average_score: number;
  latest_score: number;

  previous_score: number | null;
  change: number | null;

  trend:
    | "improving"
    | "stable"
    | "declining"
    | "insufficient_data";

  priority: "high" | "medium" | "low";

  interviews: number;
  technical_knowledge: number;
  completeness: number;
  depth: number;
  communication: number;
}

export interface InterviewAnalytics {
  total_interviews: number;
  overall: OverallPerformance | null;
  interview_trend: InterviewTrendPoint[];
  topic_performance: TopicAnalytics[];
}
// ======================================================
// CREATE INTERVIEW
// ======================================================

export async function createInterview(
  data: CreateInterviewData
): Promise<InterviewSession> {
  const response = await api.post<InterviewSession>(
    "/interviews",
    data
  );

  return response.data;
}
// ======================================================
// GET INTERVIEW HISTORY
// ======================================================

export async function getInterviews(): Promise<InterviewSession[]> {
  const response = await api.get<InterviewSession[]>(
    "/interviews"
  );

  return response.data;
}
// ======================================================
// START INTERVIEW
// ======================================================

export async function startInterview(
  interviewId: number
): Promise<InterviewStartResponse> {
  const response = await api.post<InterviewStartResponse>(
    `/interviews/${interviewId}/start`
  );

  return response.data;
}

// ======================================================
// SUBMIT ANSWER
// ======================================================

export async function submitInterviewAnswer(
  interviewId: number,
  answer: string
): Promise<InterviewAnswerResponse> {
  const response = await api.post<InterviewAnswerResponse>(
    `/interviews/${interviewId}/answer`,
    {
      answer,
    }
  );

  return response.data;
}
// ======================================================
// END INTERVIEW
// ======================================================

export async function endInterview(
  interviewId: number
): Promise<InterviewAnswerResponse> {
  const response = await api.post<InterviewAnswerResponse>(
    `/interviews/${interviewId}/end`
  );

  return response.data;
}

// ======================================================
// GET FINAL REPORT
// ======================================================

export async function getInterviewReport(
  interviewId: number
): Promise<InterviewReport> {
  const response = await api.get<InterviewReport>(
    `/interviews/${interviewId}/report`
  );

  return response.data;
}

export async function getInterviewAnalytics(): Promise<InterviewAnalytics> {
  const response = await api.get<InterviewAnalytics>(
    "/interviews/analytics"
  );

  return response.data;
}