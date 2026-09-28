import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileSearch,
  MessageSquareText,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, type User } from "../services/auth/authService";

import {
  getApplications,
  type Application,
} from "../services/applications/applicationService";

import {
  getInterviewAnalytics,
  getInterviews,
  type InterviewAnalytics,
  type InterviewSession,
  type TopicAnalytics,
} from "../services/interviews/interviewService";

// =========================================================
// QUICK ACTIONS
// =========================================================

const quickActions = [
  {
    title: "Discover Jobs",
    description: "Search current opportunities",
    icon: BriefcaseBusiness,
    path: "/jobs",
  },
  {
    title: "Analyze JD",
    description: "Compare a role with your profile",
    icon: FileSearch,
    path: "/jobs",
  },
  {
    title: "Mock Interview",
    description: "Practice with an adaptive AI interviewer",
    icon: MessageSquareText,
    path: "/interviews",
  },
  {
    title: "Upload Resume",
    description: "Update your candidate profile",
    icon: Upload,
    path: "/resume",
  },
];

// =========================================================
// HELPERS
// =========================================================

function formatStatus(status: string) {
  if (status === "oa") {
    return "OA";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date?: string | null) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

// =========================================================
// DASHBOARD
// =========================================================

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);

  const [interviews, setInterviews] = useState<InterviewSession[]>([]);

  const [analytics, setAnalytics] = useState<InterviewAnalytics | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ======================================================
  // LOAD DASHBOARD DATA
  // ======================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [currentUser, applicationData, interviewData, analyticsData] =
          await Promise.all([
            getCurrentUser(),
            getApplications(),
            getInterviews(),
            getInterviewAnalytics(),
          ]);

        setUser(currentUser);
        setApplications(applicationData);
        setInterviews(interviewData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        setError("Unable to load some dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ======================================================
  // APPLICATION METRICS
  // ======================================================

  const appliedCount = applications.filter(
    (application) => application.status === "applied",
  ).length;

  const oaCount = applications.filter(
    (application) => application.status === "oa",
  ).length;

  const interviewApplicationCount = applications.filter(
    (application) => application.status === "interview",
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "offer",
  ).length;

  const savedCount = applications.filter(
    (application) => application.status === "saved",
  ).length;

  // ======================================================
  // RECENT DATA
  // ======================================================

  const recentApplications = applications.slice(0, 4);

  const completedInterviews = interviews.filter(
    (interview) => interview.status === "completed",
  );

  const recentInterview = completedInterviews[0] ?? null;

  const topicPerformance = analytics?.topic_performance ?? [];

  const weakestTopics = [...topicPerformance]
    .sort((a, b) => a.latest_score - b.latest_score)
    .slice(0, 4);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-white/40">Loading your dashboard...</p>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#070A0F] px-4 py-8 sm:px-6 md:px-8 lg:px-14 lg:py-10">
      <div className="mx-auto max-w-6xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="border-b border-white/10 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
            {getGreeting()}
            {user ? `, ${user.name}` : ""}
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight tracking-tight text-white lg:text-5xl">
            Your career preparation,
            <br />
            <span className="italic text-blue-400">at a glance.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
            Track your applications, interview performance and skill development
            across PrepSphere.
          </p>
        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* TOP METRICS */}
        {/* ================================================= */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Applications"
            value={applications.length.toString()}
            description="Opportunities tracked"
          />

          <MetricCard
            label="Interviews"
            value={(
              analytics?.total_interviews ?? completedInterviews.length
            ).toString()}
            description="Completed practice sessions"
          />

          <MetricCard
            label="Average Score"
            value={
              analytics?.overall
                ? `${analytics.overall.average_score.toFixed(1)}/10`
                : "—"
            }
            description="Across completed interviews"
          />
        </section>

        {/* ================================================= */}
        {/* APPLICATION PIPELINE */}
        {/* ================================================= */}

        <section className="mt-12">
          <SectionHeader
            eyebrow="Career pipeline"
            title="Applications"
            action="View all"
            onAction={() => navigate("/applications")}
          />

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-5">
            <PipelineItem label="Saved" value={savedCount} />

            <PipelineItem label="Applied" value={appliedCount} />

            <PipelineItem label="OA" value={oaCount} />

            <PipelineItem label="Interview" value={interviewApplicationCount} />

            <PipelineItem label="Offer" value={offerCount} />
          </div>
        </section>

        {/* ================================================= */}
        {/* MAIN DASHBOARD GRID */}
        {/* ================================================= */}

        <section className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* ================================================= */}
          {/* RECENT APPLICATIONS */}
          {/* ================================================= */}

          <div>
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                Activity
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Recent applications
              </h2>
            </div>

            {recentApplications.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
                <BriefcaseBusiness size={25} className="text-white/20" />

                <p className="mt-4 text-sm text-white/55">
                  No applications tracked yet.
                </p>

                <button
                  onClick={() => navigate("/jobs")}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
                >
                  Discover jobs
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.07] border-y border-white/10">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between gap-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {application.job_title}
                      </p>

                      <p className="mt-1 truncate text-xs text-white/35">
                        {application.company}

                        {application.location
                          ? ` · ${application.location}`
                          : ""}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <StatusBadge status={application.status} />

                      <p className="mt-1.5 text-[11px] text-white/25">
                        {formatDate(
                          application.applied_at ?? application.created_at,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* RECENT INTERVIEW */}
          {/* ================================================= */}

          <div>
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                Practice
              </p>

              <h2 className="mt-2 font-serif text-2xl text-white">
                Recent interview
              </h2>
            </div>

            {recentInterview ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <MessageSquareText size={20} className="text-blue-400" />

                <h3 className="mt-5 text-lg font-medium text-white">
                  {recentInterview.focus || "General Interview"}
                </h3>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/35">
                  <span>{formatStatus(recentInterview.difficulty)}</span>

                  <span>·</span>

                  <span>{recentInterview.duration_minutes} min</span>
                </div>

                <p className="mt-5 text-xs text-white/30">
                  Completed {formatDate(recentInterview.completed_at)}
                </p>

                <button
                  onClick={() => navigate("/interviews")}
                  className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
                >
                  View interview history
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <MessageSquareText size={20} className="text-white/20" />

                <p className="mt-5 text-sm text-white/50">
                  No completed interviews yet.
                </p>

                <button
                  onClick={() => navigate("/interviews")}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400"
                >
                  Start an interview
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* SKILL INTELLIGENCE */}
        {/* ================================================= */}

        <section className="mt-14">
          <SectionHeader
            eyebrow="Interview intelligence"
            title="Skill performance"
            action="View progress"
            onAction={() => navigate("/progress")}
          />

          {weakestTopics.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
              <TrendingUp size={24} className="text-white/20" />

              <p className="mt-4 text-sm text-white/50">
                Complete interviews to start building topic-level performance
                intelligence.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {weakestTopics.map((topic) => (
                <TopicCard key={topic.topic} topic={topic} />
              ))}
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <section className="mt-14 pb-14">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Continue
            </p>

            <h2 className="mt-2 font-serif text-2xl text-white">
              Quick actions
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <Icon
                    size={19}
                    className="text-white/40 transition group-hover:text-blue-400"
                  />

                  <h3 className="mt-5 text-sm font-medium text-white">
                    {action.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-white/35">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// =========================================================
// METRIC CARD
// =========================================================

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
      <p className="text-xs uppercase tracking-[0.15em] text-white/30">
        {label}
      </p>

      <p className="mt-4 font-serif text-4xl text-white">{value}</p>

      <p className="mt-2 text-xs text-white/30">{description}</p>
    </div>
  );
}

// =========================================================
// PIPELINE ITEM
// =========================================================

function PipelineItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#0b0f16] px-5 py-5">
      <p className="text-xs text-white/35">{label}</p>

      <p className="mt-2 text-2xl font-medium text-white">{value}</p>
    </div>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/30">
          {eyebrow}
        </p>

        <h2 className="mt-2 font-serif text-2xl text-white">{title}</h2>
      </div>

      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
      >
        {action}

        <ArrowRight size={14} />
      </button>
    </div>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
      {formatStatus(status)}
    </span>
  );
}

// =========================================================
// TOPIC CARD
// =========================================================

function TopicCard({ topic }: { topic: TopicAnalytics }) {
  const trendSymbol =
    topic.trend === "improving"
      ? "↑"
      : topic.trend === "declining"
        ? "↓"
        : topic.trend === "stable"
          ? "→"
          : "—";

  const trendLabel =
    topic.trend === "insufficient_data" ? "New" : formatStatus(topic.trend);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate text-sm font-medium text-white">
          {topic.topic}
        </h3>

        <span className="text-xs text-white/35">{trendSymbol}</span>
      </div>

      <p className="mt-5 font-serif text-3xl text-white">
        {topic.latest_score.toFixed(1)}

        <span className="ml-1 text-sm text-white/25">/10</span>
      </p>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${Math.min(topic.latest_score * 10, 100)}%`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="text-white/35">{trendLabel}</span>

        <span
          className={
            topic.priority === "high"
              ? "text-red-400"
              : topic.priority === "medium"
                ? "text-amber-400"
                : "text-emerald-400"
          }
        >
          {formatStatus(topic.priority)} priority
        </span>
      </div>
    </div>
  );
}

export default DashboardPage;
