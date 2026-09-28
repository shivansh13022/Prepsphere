import { useEffect, useState } from "react";

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Brain,
  MessageSquare,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getInterviewAnalytics,
  type InterviewAnalytics,
} from "../services/interviews/interviewService";

function scoreWidth(score: number) {
  return `${Math.min(Math.max(score * 10, 0), 100)}%`;
}

function getTrendDetails(
  trend: "improving" | "stable" | "declining" | "insufficient_data",
) {
  switch (trend) {
    case "improving":
      return {
        label: "Improving",
        icon: ArrowUpRight,
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      };

    case "declining":
      return {
        label: "Declining",
        icon: ArrowDownRight,
        className: "border-red-500/20 bg-red-500/10 text-red-400",
      };

    case "stable":
      return {
        label: "Stable",
        icon: ArrowRight,
        className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
      };

    default:
      return {
        label: "Need more data",
        icon: Activity,
        className: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
      };
  }
}

function getPriorityDetails(priority: "high" | "medium" | "low") {
  switch (priority) {
    case "high":
      return {
        label: "High priority",
        className: "border-red-500/20 bg-red-500/10 text-red-400",
      };

    case "medium":
      return {
        label: "Medium priority",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      };

    default:
      return {
        label: "Low priority",
        className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      };
  }
}

function ProgressPage() {
  const [analytics, setAnalytics] = useState<InterviewAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);

        const data = await getInterviewAnalytics();

        setAnalytics(data);
      } catch (err) {
        console.error(err);

        setError("Unable to load performance analytics.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="p-8 text-sm text-zinc-400">
        Loading your performance...
      </div>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // No interview data
  // ---------------------------------------------------------

  if (!analytics || analytics.total_interviews === 0 || !analytics.overall) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-blue-400">
            Performance Intelligence
          </p>

          <h1 className="max-w-3xl font-serif text-4xl text-white">
            Your progress will appear here.
          </h1>

          <p className="mt-4 max-w-xl text-zinc-400">
            Complete your first interview to start tracking performance across
            skills, topics, and interviews.
          </p>
        </div>
      </div>
    );
  }

  const { overall } = analytics;

  // ---------------------------------------------------------
  // Chart data
  // ---------------------------------------------------------

  const chartData = analytics.interview_trend.map((interview, index) => ({
    interview: `#${index + 1}`,
    score: interview.score,
    date: new Date(interview.completed_at).toLocaleDateString(),
  }));

  // ---------------------------------------------------------
  // Overall metrics
  // ---------------------------------------------------------

  const metrics = [
    {
      label: "Technical",
      value: overall.technical_knowledge,
      icon: Brain,
    },
    {
      label: "Completeness",
      value: overall.completeness,
      icon: Target,
    },
    {
      label: "Depth",
      value: overall.depth,
      icon: Activity,
    },
    {
      label: "Communication",
      value: overall.communication,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-12">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
            Performance Intelligence
          </p>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="font-serif text-4xl tracking-tight text-white lg:text-5xl">
                Your progress,
                <br />
                across every interview.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                Understand where you're improving, where you're struggling, and
                which skills deserve your attention.
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Interviews analyzed
              </p>

              <p className="mt-1 text-3xl font-medium text-white">
                {analytics.total_interviews}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* OVERALL PERFORMANCE */}
        {/* ================================================= */}

        <section className="mb-10">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_2fr]">
            {/* Overall score */}

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-7">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Overall performance</p>

                <TrendingUp size={18} className="text-blue-400" />
              </div>

              <div className="mt-7 flex items-end gap-3">
                <span className="text-6xl font-medium tracking-tight text-white">
                  {overall.average_score.toFixed(1)}
                </span>

                <span className="mb-2 text-sm text-zinc-500">/ 10</span>
              </div>

              <div className="mt-8 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">
                    Latest interview
                  </span>

                  <span className="text-sm font-medium text-white">
                    {overall.latest_score.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric cards */}

            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        {metric.label}
                      </span>

                      <Icon size={16} className="text-zinc-500" />
                    </div>

                    <p className="mt-5 text-2xl font-medium text-white">
                      {metric.value.toFixed(1)}
                    </p>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: scoreWidth(metric.value),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* PERFORMANCE OVER TIME */}
        {/* ================================================= */}

        <section className="mb-10 rounded-xl border border-white/10 bg-white/[0.025] p-6">
          <div className="mb-7">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Interview History
            </p>

            <h2 className="mt-2 font-serif text-2xl text-white">
              Performance over time
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Your overall score across completed interviews.
            </p>
          </div>

          {chartData.length === 1 ? (
            <div className="flex h-[280px] items-center justify-center">
              <div className="text-center">
                <p className="text-5xl font-medium text-white">
                  {chartData[0].score.toFixed(1)}
                </p>

                <p className="mt-2 text-sm text-zinc-500">/ 10</p>

                <p className="mt-5 text-sm text-zinc-500">
                  Complete more interviews to see your performance trend.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: -10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="interview"
                    tick={{
                      fill: "#71717a",
                      fontSize: 12,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{
                      fill: "#71717a",
                      fontSize: 12,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "rgba(255,255,255,0.1)",
                    }}
                    contentStyle={{
                      backgroundColor: "#0c1018",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                    }}
                    labelStyle={{
                      color: "#a1a1aa",
                    }}
                    itemStyle={{
                      color: "#ffffff",
                    }}
                    formatter={(value) => [
                      `${Number(value).toFixed(1)} / 10`,
                      "Score",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: "#3b82f6",
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#60a5fa",
                      strokeWidth: 0,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* TOPIC PERFORMANCE */}
        {/* ================================================= */}

        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Skill Intelligence
            </p>

            <h2 className="mt-2 font-serif text-3xl text-white">
              Performance by topic
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Topics are prioritized using your latest performance, while trends
              compare your two most recent attempts.
            </p>
          </div>

          {analytics.topic_performance.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-6 text-sm text-zinc-500">
              No topic-level performance data is available yet.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {analytics.topic_performance.map((topic) => {
                const trendDetails = getTrendDetails(topic.trend);

                const priorityDetails = getPriorityDetails(topic.priority);

                const TrendIcon = trendDetails.icon;

                return (
                  <div
                    key={topic.topic}
                    className="rounded-xl border border-white/10 bg-white/[0.025] p-6"
                  >
                    {/* Header */}

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          {topic.topic}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {topic.interviews}{" "}
                          {topic.interviews === 1 ? "interview" : "interviews"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${trendDetails.className}`}
                        >
                          <TrendIcon size={13} />

                          {trendDetails.label}
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${priorityDetails.className}`}
                        >
                          {priorityDetails.label}
                        </span>
                      </div>
                    </div>

                    {/* Score summary */}

                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500">Average</p>

                        <p className="mt-1 text-xl font-medium text-white">
                          {topic.average_score.toFixed(1)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">Latest</p>

                        <p className="mt-1 text-xl font-medium text-white">
                          {topic.latest_score.toFixed(1)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">Previous</p>

                        <p className="mt-1 text-xl font-medium text-white">
                          {topic.previous_score !== null
                            ? topic.previous_score.toFixed(1)
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Latest score bar */}

                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: scoreWidth(topic.latest_score),
                        }}
                      />
                    </div>

                    {/* Change */}

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="text-xs text-zinc-500">
                        Change from previous attempt
                      </span>

                      {topic.change === null ? (
                        <span className="text-sm text-zinc-500">
                          Need more data
                        </span>
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            topic.change >= 0.5
                              ? "text-emerald-400"
                              : topic.change <= -0.5
                                ? "text-red-400"
                                : "text-zinc-300"
                          }`}
                        >
                          {topic.change > 0 ? "+" : ""}
                          {topic.change.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Detailed dimensions */}

                    <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 text-sm">
                      <div>
                        <p className="text-xs text-zinc-500">Technical</p>

                        <p className="mt-1 text-white">
                          {topic.technical_knowledge.toFixed(1)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">Completeness</p>

                        <p className="mt-1 text-white">
                          {topic.completeness.toFixed(1)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">Depth</p>

                        <p className="mt-1 text-white">
                          {topic.depth.toFixed(1)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">Communication</p>

                        <p className="mt-1 text-white">
                          {topic.communication.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProgressPage;
