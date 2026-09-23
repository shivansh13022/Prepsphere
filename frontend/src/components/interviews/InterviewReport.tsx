import { Target, Trophy } from "lucide-react";

import type { InterviewReport as InterviewReportType } from "../../services/interviews/interviewService";

interface InterviewReportProps {
  report: InterviewReportType;
  onNewInterview: () => void;
}

function InterviewReport({ report, onNewInterview }: InterviewReportProps) {
  return (
    <section className="mt-10">
      <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-blue-400">
            <Trophy size={15} />
            Interview complete
          </div>

          <h2 className="mt-4 font-serif text-4xl text-white">
            How did you perform?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
            {report.summary}
          </p>
        </div>

        <div className="min-w-[180px] rounded-xl border border-blue-400/15 bg-blue-500/[0.05] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">
            Overall score
          </p>

          <p className="mt-2 font-serif text-5xl text-blue-400">
            {Math.round(report.overall_score)}
          </p>
        </div>
      </div>

      {/* Scores */}

      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard label="Technical" score={report.technical_knowledge} />

        <ScoreCard label="Completeness" score={report.completeness} />

        <ScoreCard label="Depth" score={report.depth} />

        <ScoreCard label="Communication" score={report.communication} />
      </div>

      {/* Strengths / weaknesses */}

      <div className="grid gap-8 border-t border-white/10 py-8 md:grid-cols-2">
        <ReportList title="Strengths" items={report.strengths} />

        <ReportList title="Areas to improve" items={report.weaknesses} />
      </div>

      {/* Topics */}

      <div className="border-t border-white/10 py-8">
        <div className="flex items-center gap-2">
          <Target size={17} className="text-blue-400" />

          <h3 className="text-sm font-medium text-white/70">
            Topics to improve
          </h3>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {report.topics_to_improve.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-blue-400/15 bg-blue-500/[0.05] px-3 py-1.5 text-xs text-blue-200"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}

      <div className="border-t border-white/10 py-8">
        <h3 className="text-sm font-medium text-white/70">Recommendations</h3>

        <div className="mt-4 space-y-3">
          {report.recommendations.map((recommendation, index) => (
            <div
              key={`${recommendation}-${index}`}
              className="flex gap-3 text-sm leading-6 text-white/50"
            >
              <span className="text-blue-400">{index + 1}.</span>

              <span>{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-8">
        <button
          type="button"
          onClick={onNewInterview}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Start another interview
        </button>
      </div>
    </section>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <p className="text-xs text-white/35">{label}</p>

      <p className="mt-2 font-serif text-3xl text-white">{Math.round(score)}</p>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-white/70">{title}</h3>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-6 text-white/50"
            >
              <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-blue-400" />

              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-white/30">Nothing listed.</p>
      )}
    </div>
  );
}

export default InterviewReport;
