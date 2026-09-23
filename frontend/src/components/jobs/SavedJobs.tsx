import { LoaderCircle } from "lucide-react";
import type { Job } from "../../services/jobs/jobService";

interface SavedJobsProps {
  jobs: Job[];
  loading: boolean;
  onOpenJob: (job: Job) => void;
}

function SavedJobs({ jobs, loading, onOpenJob }: SavedJobsProps) {
  return (
    <aside>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/30">
        Saved jobs
      </p>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-white/30">
          <LoaderCircle size={15} className="animate-spin" />
          Loading...
        </div>
      ) : jobs.length === 0 ? (
        <p className="mt-5 text-sm leading-6 text-white/30">
          Jobs you analyze will appear here.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {jobs.slice(0, 6).map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => onOpenJob(job)}
              className="group w-full rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-blue-400/25 hover:bg-blue-500/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white/80 transition group-hover:text-white">
                    {job.title}
                  </p>

                  {job.company && (
                    <p className="mt-1 text-xs text-white/35">{job.company}</p>
                  )}
                </div>

                <span className="text-sm text-white/20 transition group-hover:translate-x-0.5 group-hover:text-blue-400">
                  →
                </span>
              </div>

              <p className="mt-3 text-[11px] text-white/20">
                {new Date(job.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default SavedJobs;
