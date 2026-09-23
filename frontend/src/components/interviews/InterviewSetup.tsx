import { ArrowRight, BrainCircuit, Sparkles, Target } from "lucide-react";

interface InterviewSetupProps {
  focus: string;
  difficulty: string;
  durationMinutes: 15 | 30 | 45 | 60;
  isJobInterview: boolean;

  setFocus: (value: string) => void;
  setDifficulty: (value: string) => void;
  setDurationMinutes: (value: 15 | 30 | 45 | 60) => void;

  onStart: () => void;
}

function InterviewSetup({
  focus,
  difficulty,
  durationMinutes,
  isJobInterview,
  setFocus,
  setDifficulty,
  setDurationMinutes,
  onStart,
}: InterviewSetupProps) {
  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <BrainCircuit size={19} className="text-blue-400" />
          </div>

          <div>
            <h2 className="text-base font-medium text-white">
              Configure your interview
            </h2>

            <p className="mt-1 text-xs text-white/35">
              Tell the interviewer what you want to practice.
            </p>
          </div>
        </div>

        {/* Focus */}
        {!isJobInterview ? (
          <div className="mt-8">
            <label className="text-xs font-medium text-white/50">
              Interview focus
            </label>

            <input
              type="text"
              value={focus}
              onChange={(event) => setFocus(event.target.value)}
              placeholder="e.g. Agentic AI, RAG, LangGraph, System Design"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/40"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {["Agentic AI", "System Design", "React", "Machine Learning"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFocus(item)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/40 transition hover:border-blue-400/30 hover:text-blue-300"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-blue-400/15 bg-blue-500/[0.05] p-5">
            <div className="flex items-start gap-3">
              <Target size={18} className="mt-0.5 text-blue-400" />

              <div>
                <p className="text-sm font-medium text-white">
                  Job-specific interview
                </p>

                <p className="mt-1 text-sm leading-6 text-white/40">
                  This interview will be tailored to the selected job, your
                  current skills and the gaps identified from the job
                  description.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div className="mt-8">
          <p className="text-xs font-medium text-white/50">Difficulty</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              {
                value: "easy",
                title: "Easy",
                description: "Fundamentals",
              },
              {
                value: "medium",
                title: "Medium",
                description: "Interview level",
              },
              {
                value: "hard",
                title: "Hard",
                description: "Deep technical",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  difficulty === option.value
                    ? "border-blue-400/40 bg-blue-500/[0.08]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    difficulty === option.value
                      ? "text-blue-300"
                      : "text-white/70"
                  }`}
                >
                  {option.title}
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mt-8">
          <p className="text-xs font-medium text-white/50">
            Interview duration
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([15, 30, 45, 60] as const).map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setDurationMinutes(minutes)}
                className={`rounded-xl border p-4 text-center transition ${
                  durationMinutes === minutes
                    ? "border-blue-400/40 bg-blue-500/[0.08]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    durationMinutes === minutes
                      ? "text-blue-300"
                      : "text-white/70"
                  }`}
                >
                  {minutes} min
                </p>
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-white/30">
            The interview adapts the number and depth of questions to the
            selected duration.
          </p>
        </div>

        {/* Start */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Sparkles size={17} />
            Start interview
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default InterviewSetup;
