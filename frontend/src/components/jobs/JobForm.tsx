import { FileSearch, LoaderCircle, Sparkles } from "lucide-react";

interface JobFormProps {
  title: string;
  company: string;
  location: string;
  description: string;
  analyzing: boolean;

  setTitle: (value: string) => void;
  setCompany: (value: string) => void;
  setLocation: (value: string) => void;
  setDescription: (value: string) => void;

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

function JobForm({
  title,
  company,
  location,
  description,
  analyzing,
  setTitle,
  setCompany,
  setLocation,
  setDescription,
  onSubmit,
}: JobFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 lg:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
          <FileSearch size={19} className="text-blue-400" />
        </div>

        <div>
          <h2 className="text-base font-medium text-white">Analyze a job</h2>

          <p className="mt-1 text-xs text-white/35">
            Paste the role you're considering.
          </p>
        </div>
      </div>

      {/* Job title */}

      <div className="mt-8">
        <label className="text-xs font-medium text-white/50">Job title *</label>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. AI Engineer"
          className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/40"
        />
      </div>

      {/* Company + Location */}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-white/50">Company</label>

          <input
            type="text"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="e.g. OpenAI"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/40"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/50">Location</label>

          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Bengaluru"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/40"
          />
        </div>
      </div>

      {/* JD */}

      <div className="mt-5">
        <label className="text-xs font-medium text-white/50">
          Job description *
        </label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Paste the complete job description here..."
          rows={12}
          className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/40"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {analyzing ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={17} />
              Analyze job
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default JobForm;
