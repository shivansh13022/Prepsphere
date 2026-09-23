import {
  CalendarDays,
  Clock3,
  History,
  LoaderCircle,
  Target,
} from "lucide-react";

import type { InterviewSession } from "../../services/interviews/interviewService";

interface InterviewHistoryProps {
  interviews: InterviewSession[];
  loading: boolean;
  openingInterviewId: number | null;
  onOpenInterview: (interview: InterviewSession) => void;
}

function InterviewHistory({
  interviews,
  loading,
  openingInterviewId,
  onOpenInterview,
}: InterviewHistoryProps) {
  const formatDate = (date?: string | null) => {
    if (!date) {
      return "Not started";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="mt-14">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/25">
            <History size={14} />
            History
          </div>

          <h2 className="mt-3 font-serif text-2xl text-white">
            Previous interviews
          </h2>

          <p className="mt-2 text-sm text-white/35">
            Review your completed interview sessions and reports.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-sm text-white/40">
          <LoaderCircle size={17} className="animate-spin" />
          Loading interviews...
        </div>
      )}

      {/* Empty State */}
      {!loading && interviews.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
          <p className="text-sm text-white/45">No previous interviews yet.</p>

          <p className="mt-1 text-xs text-white/25">
            Your completed interviews will appear here.
          </p>
        </div>
      )}

      {/* Interview List */}
      {!loading && interviews.length > 0 && (
        <div className="mt-6 space-y-3">
          {interviews.map((interview) => {
            const isCompleted = interview.status === "completed";

            const isOpening = openingInterviewId === interview.id;

            const title =
              interview.focus?.trim() ||
              (interview.job_id
                ? "Job-specific interview"
                : "General interview");

            return (
              <button
                key={interview.id}
                type="button"
                disabled={!isCompleted || isOpening}
                onClick={() => onOpenInterview(interview)}
                className="group flex w-full flex-col gap-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-left transition hover:border-blue-400/20 hover:bg-white/[0.035] disabled:cursor-default disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Left */}
                <div>
                  <div className="flex items-center gap-2">
                    <Target size={15} className="text-blue-400" />

                    <p className="text-sm font-medium text-white/80">{title}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} />

                      {formatDate(
                        interview.completed_at ?? interview.started_at,
                      )}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {interview.duration_minutes} min
                    </span>

                    <span className="capitalize">{interview.difficulty}</span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                      isCompleted
                        ? "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300/70"
                        : "border-white/10 text-white/30"
                    }`}
                  >
                    {interview.status.replace("_", " ")}
                  </span>

                  {isOpening && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin text-blue-400"
                    />
                  )}

                  {isCompleted && !isOpening && (
                    <span className="text-xs text-blue-400/60 transition group-hover:text-blue-300">
                      View report →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default InterviewHistory;
