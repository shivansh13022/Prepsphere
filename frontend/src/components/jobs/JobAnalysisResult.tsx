import {
  BriefcaseBusiness,
  Building2,
  Check,
  FileSearch,
  MapPin,
  Target,
  X,
} from "lucide-react";

import type {
  Job,
  JobAnalysis,
  JobMatch,
} from "../../services/jobs/jobService";

interface JobAnalysisResultProps {
  job: Job;
  analysis: JobAnalysis;
  match: JobMatch;
  onBack: () => void;
  onStartInterview: () => void;
}

function JobAnalysisResult({
  job,
  analysis,
  match,
  onBack,
  onStartInterview,
}: JobAnalysisResultProps) {
  return (
    <div className="mt-10">
      {/* Header */}

      <section className="flex flex-col justify-between gap-8 border-b border-white/10 pb-9 lg:flex-row lg:items-start">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-xs text-white/35 transition hover:text-blue-400"
          >
            ← Back to jobs
          </button>

          <h2 className="font-serif text-4xl text-white">{job.title}</h2>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/40">
            {job.company && (
              <span className="flex items-center gap-1.5">
                <Building2 size={14} />
                {job.company}
              </span>
            )}

            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {job.location}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-[180px] rounded-xl border border-blue-400/15 bg-blue-500/[0.05] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">
            Job match
          </p>

          <p className="mt-2 font-serif text-5xl text-blue-400">
            {Math.round(match.match_score)}%
          </p>

          <p className="mt-2 text-xs text-white/35">{match.relevance}</p>
        </div>
      </section>

      {/* Role summary */}

      <ResultSection
        icon={<BriefcaseBusiness size={18} />}
        title="Role summary"
      >
        <p className="max-w-3xl text-sm leading-7 text-white/50">
          {analysis.role_summary || "No role summary was extracted."}
        </p>
      </ResultSection>

      {/* Skill match */}

      <ResultSection icon={<Target size={18} />} title="Skill match">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400/70">
              Matched required skills
            </p>

            <div className="mt-4 space-y-3">
              {match.matched_required_skills.length > 0 ? (
                match.matched_required_skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <Check size={15} className="text-emerald-400" />

                    {skill}
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/30">
                  No required skills matched yet.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-300/70">
              Missing required skills
            </p>

            <div className="mt-4 space-y-3">
              {match.missing_required_skills.length > 0 ? (
                match.missing_required_skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <X size={15} className="text-orange-300" />

                    {skill}
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/30">
                  No required skill gaps found.
                </p>
              )}
            </div>
          </div>
        </div>

        {(match.matched_preferred_skills.length > 0 ||
          match.missing_preferred_skills.length > 0) && (
          <div className="mt-8 border-t border-white/[0.07] pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
              Preferred skills
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {match.matched_preferred_skills.map((skill) => (
                <span
                  key={`matched-${skill}`}
                  className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-xs text-emerald-200"
                >
                  ✓ {skill}
                </span>
              ))}

              {match.missing_preferred_skills.map((skill) => (
                <span
                  key={`missing-${skill}`}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/35"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </ResultSection>

      {/* Requirements */}

      <ResultSection icon={<FileSearch size={18} />} title="Role requirements">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-white/40">Required skills</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-blue-400/15 bg-blue-400/[0.05] px-3 py-1.5 text-xs text-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-white/40">Experience</p>

            <p className="mt-3 text-sm leading-6 text-white/50">
              {analysis.required_experience || "Not explicitly specified."}
            </p>
          </div>
        </div>
      </ResultSection>

      {/* Responsibilities */}

      <ResultSection
        icon={<BriefcaseBusiness size={18} />}
        title="Responsibilities"
      >
        {analysis.responsibilities.length > 0 ? (
          <div className="space-y-3">
            {analysis.responsibilities.map((responsibility, index) => (
              <div
                key={`${responsibility}-${index}`}
                className="flex gap-3 text-sm leading-6 text-white/50"
              >
                <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-blue-400" />

                <span>{responsibility}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/30">
            No responsibilities extracted.
          </p>
        )}
      </ResultSection>

      {/* Next step */}

      <section className="my-10 rounded-2xl border border-blue-400/15 bg-blue-500/[0.04] p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
          Next step
        </p>

        <h3 className="mt-3 font-serif text-3xl text-white">
          Prepare specifically for this role.
        </h3>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
          Use the role requirements and your skill gaps to start a targeted,
          job-specific mock interview.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStartInterview}
            className="rounded-lg border border-blue-400/20 px-4 py-2.5 text-sm text-blue-300 transition hover:border-blue-400/40 hover:bg-blue-500/[0.06]"
          >
            Start mock interview
          </button>
        </div>
      </section>
    </div>
  );
}

function ResultSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-white/10 py-9 md:grid-cols-[220px_1fr]">
      <div className="flex items-center gap-3 self-start">
        <span className="text-blue-400">{icon}</span>

        <h2 className="text-sm font-medium text-white/70">{title}</h2>
      </div>

      <div>{children}</div>
    </section>
  );
}

export default JobAnalysisResult;
