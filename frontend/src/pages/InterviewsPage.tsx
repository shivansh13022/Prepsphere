import { useEffect, useState } from "react";
import axios from "axios";
import { LoaderCircle, Square } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  createInterview,
  startInterview,
  submitInterviewAnswer,
  endInterview,
  getInterviewReport,
  getInterviews,
  type InterviewReport as InterviewReportType,
  type InterviewSession as InterviewSessionType,
} from "../services/interviews/interviewService";

import InterviewSetup from "../components/interviews/InterviewSetup";
import InterviewSession from "../components/interviews/InterviewSession";
import InterviewReport from "../components/interviews/InterviewReport";
import InterviewHistory from "../components/interviews/InterviewHistory";

type InterviewStage =
  | "setup"
  | "starting"
  | "interview"
  | "submitting"
  | "report";

type InterviewDuration = 15 | 30 | 45 | 60;

function InterviewsPage() {
  const [searchParams] = useSearchParams();

  const jobIdParam = searchParams.get("jobId");
  const jobId = jobIdParam ? Number(jobIdParam) : null;

  const isJobInterview = jobId !== null && !Number.isNaN(jobId);

  // ======================================================
  // INTERVIEW CONFIGURATION
  // ======================================================

  const [focus, setFocus] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const [durationMinutes, setDurationMinutes] = useState<InterviewDuration>(30);

  // ======================================================
  // INTERVIEW STATE
  // ======================================================

  const [stage, setStage] = useState<InterviewStage>("setup");

  const [interviewId, setInterviewId] = useState<number | null>(null);

  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const [question, setQuestion] = useState("");

  const [questionsAsked, setQuestionsAsked] = useState(0);

  const [answer, setAnswer] = useState("");

  // ======================================================
  // TIMER STATE
  // ======================================================

  const [startedAt, setStartedAt] = useState<number | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);

  // ======================================================
  // ENDING / REPORT STATE
  // ======================================================

  const [ending, setEnding] = useState(false);

  // Controls only the custom confirmation popup.
  const [endModalOpen, setEndModalOpen] = useState(false);

  const [report, setReport] = useState<InterviewReportType | null>(null);

  const [error, setError] = useState("");

  // ======================================================
  // INTERVIEW HISTORY STATE
  // ======================================================

  const [interviews, setInterviews] = useState<InterviewSessionType[]>([]);

  const [historyLoading, setHistoryLoading] = useState(true);

  const [openingInterviewId, setOpeningInterviewId] = useState<number | null>(
    null,
  );

  // ======================================================
  // API ERROR HANDLER
  //
  // Function declaration is intentionally used here.
  // It can safely be called by functions declared above
  // or below this point.
  // ======================================================

  function handleApiError(err: unknown, fallbackMessage: string) {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
        return;
      }
    }

    setError(fallbackMessage);
  }

  // ======================================================
  // INITIAL INTERVIEW HISTORY LOAD
  //
  // We do not call loadInterviewHistory() directly from
  // this effect because the React lint rule can flag
  // synchronous state updates reached through that call.
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    getInterviews()
      .then((data) => {
        if (!cancelled) {
          setInterviews(data);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }

        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail;

          if (typeof detail === "string") {
            setError(detail);
            return;
          }
        }

        setError("Unable to load interview history.");
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================
  // REFRESH INTERVIEW HISTORY
  //
  // Used after creating/completing interviews.
  // ======================================================

  const loadInterviewHistory = async () => {
    try {
      const data = await getInterviews();

      setInterviews(data);
    } catch (err: unknown) {
      handleApiError(err, "Unable to refresh interview history.");
    }
  };

  // ======================================================
  // COUNTDOWN TIMER
  // ======================================================

  useEffect(() => {
    if (
      startedAt === null ||
      (stage !== "interview" && stage !== "submitting")
    ) {
      return;
    }

    const updateTimer = () => {
      const currentTime = new Date().getTime();

      const elapsedSeconds = Math.floor((currentTime - startedAt) / 1000);

      const remaining = Math.max(durationMinutes * 60 - elapsedSeconds, 0);

      setRemainingSeconds(remaining);
    };

    // Run once immediately.
    updateTimer();

    // Then update every second.
    const interval = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [startedAt, durationMinutes, stage]);

  // ======================================================
  // START INTERVIEW
  // ======================================================

  const handleStartInterview = async () => {
    if (!isJobInterview && !focus.trim()) {
      setError("Please enter an interview focus.");
      return;
    }

    try {
      setError("");
      setStage("starting");

      // Create interview session in PostgreSQL.
      const interview = await createInterview({
        focus: isJobInterview ? null : focus.trim(),

        difficulty,

        duration_minutes: durationMinutes,

        job_id: isJobInterview ? jobId : null,
      });

      setInterviewId(interview.id);

      // Start LangGraph interview.
      const result = await startInterview(interview.id);

      // Start frontend display timer after
      // the backend successfully starts the interview.
      const interviewStartedAt = new Date().getTime();

      setStartedAt(interviewStartedAt);

      setRemainingSeconds(durationMinutes * 60);

      setCurrentTopic(result.current_topic);

      setQuestion(result.question);

      setQuestionsAsked(result.questions_asked);

      setStage("interview");
    } catch (err: unknown) {
      handleApiError(err, "Unable to start the interview.");

      setStage("setup");

      // If POST /interviews succeeded but /start failed,
      // the pending session may now exist in history.
      void loadInterviewHistory();
    }
  };

  // ======================================================
  // SUBMIT ANSWER
  // ======================================================

  const handleSubmitAnswer = async () => {
    if (!interviewId) {
      return;
    }

    if (!answer.trim()) {
      setError("Please enter an answer before continuing.");
      return;
    }

    try {
      setError("");
      setStage("submitting");

      const result = await submitInterviewAnswer(interviewId, answer.trim());

      setAnswer("");

      setQuestionsAsked(result.questions_asked);

      // --------------------------------------------------
      // INTERVIEW COMPLETED
      // --------------------------------------------------

      if (result.status === "completed") {
        const finalReport = await getInterviewReport(interviewId);

        setReport(finalReport);

        // Stop frontend countdown.
        setStartedAt(null);

        setStage("report");

        // Refresh history so this session now
        // appears as completed.
        void loadInterviewHistory();

        return;
      }

      // --------------------------------------------------
      // INTERVIEW CONTINUES
      // --------------------------------------------------

      setCurrentTopic(result.current_topic);

      setQuestion(result.question ?? "");

      setStage("interview");
    } catch (err: unknown) {
      handleApiError(err, "Unable to submit your answer.");

      setStage("interview");
    }
  };

  // ======================================================
  // MANUALLY END INTERVIEW
  // ======================================================

  const handleEndInterview = async () => {
    if (!interviewId || ending) {
      return;
    }

    try {
      setError("");
      setEnding(true);

      // Backend finalizes interview using only
      // answers already evaluated.
      await endInterview(interviewId);

      // Load the newly generated report.
      const finalReport = await getInterviewReport(interviewId);

      setReport(finalReport);

      // Stop timer.
      setStartedAt(null);

      setStage("report");

      // Close custom confirmation popup.
      setEndModalOpen(false);

      // Update history with completed status.
      await loadInterviewHistory();
    } catch (err: unknown) {
      handleApiError(err, "Unable to end the interview.");
    } finally {
      setEnding(false);
    }
  };

  // ======================================================
  // OPEN OLD INTERVIEW REPORT
  // ======================================================

  const handleOpenInterview = async (interview: InterviewSessionType) => {
    if (interview.status !== "completed") {
      return;
    }

    try {
      setError("");

      setOpeningInterviewId(interview.id);

      // Reports are already stored in PostgreSQL.
      // This does NOT regenerate the report or call the LLM.
      const existingReport = await getInterviewReport(interview.id);

      setInterviewId(interview.id);

      setFocus(interview.focus ?? "");

      setDifficulty(interview.difficulty);

      const storedDuration = interview.duration_minutes;

      if (
        storedDuration === 15 ||
        storedDuration === 30 ||
        storedDuration === 45 ||
        storedDuration === 60
      ) {
        setDurationMinutes(storedDuration);
      }

      setReport(existingReport);

      setStage("report");
    } catch (err: unknown) {
      handleApiError(err, "Unable to load the interview report.");
    } finally {
      setOpeningInterviewId(null);
    }
  };

  // ======================================================
  // NEW INTERVIEW
  // ======================================================

  const handleNewInterview = () => {
    setFocus("");

    setDifficulty("medium");

    setDurationMinutes(30);

    setInterviewId(null);

    setCurrentTopic(null);

    setQuestion("");

    setQuestionsAsked(0);

    setAnswer("");

    setStartedAt(null);

    setRemainingSeconds(30 * 60);

    setEnding(false);

    setEndModalOpen(false);

    setReport(null);

    setError("");

    setStage("setup");

    void loadInterviewHistory();
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen px-8 py-10 lg:px-14">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <section className="border-b border-white/10 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
            AI Interview
          </p>

          <h1 className="mt-3 font-serif text-4xl text-white lg:text-5xl">
            Practice like it's the real interview.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
            PrepSphere adapts the interview based on your answers, explores weak
            areas and gives you a detailed performance report when you're done.
          </p>
        </section>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* SETUP + HISTORY */}
        {/* ================================================== */}

        {stage === "setup" && (
          <>
            <InterviewSetup
              focus={focus}
              difficulty={difficulty}
              durationMinutes={durationMinutes}
              isJobInterview={isJobInterview}
              setFocus={setFocus}
              setDifficulty={setDifficulty}
              setDurationMinutes={setDurationMinutes}
              onStart={handleStartInterview}
            />

            <InterviewHistory
              interviews={interviews}
              loading={historyLoading}
              openingInterviewId={openingInterviewId}
              onOpenInterview={handleOpenInterview}
            />
          </>
        )}

        {/* ================================================== */}
        {/* STARTING */}
        {/* ================================================== */}

        {stage === "starting" && (
          <LoadingState
            title="Preparing your interview"
            description="Building topics and generating your first question..."
          />
        )}

        {/* ================================================== */}
        {/* ACTIVE INTERVIEW */}
        {/* ================================================== */}

        {(stage === "interview" || stage === "submitting") && (
          <InterviewSession
            currentTopic={currentTopic}
            question={question}
            questionsAsked={questionsAsked}
            difficulty={difficulty}
            answer={answer}
            setAnswer={setAnswer}
            submitting={stage === "submitting"}
            ending={ending}
            remainingSeconds={remainingSeconds}
            onSubmit={handleSubmitAnswer}
            onEnd={() => setEndModalOpen(true)}
          />
        )}

        {/* ================================================== */}
        {/* REPORT */}
        {/* ================================================== */}

        {stage === "report" && report && (
          <InterviewReport
            report={report}
            onNewInterview={handleNewInterview}
          />
        )}

        {/* ================================================== */}
        {/* END INTERVIEW CONFIRMATION */}
        {/* ================================================== */}

        {endModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !ending) {
                setEndModalOpen(false);
              }
            }}
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1118] p-6 shadow-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <Square size={20} className="text-red-400" />
              </div>

              <h2 className="mt-5 font-serif text-2xl text-white">
                End this interview?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/45">
                Your interview will end now and your report will be generated
                from the answers you have completed so far.
              </p>

              <p className="mt-2 text-xs text-white/30">
                You won't be able to continue this interview after ending it.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={ending}
                  onClick={() => setEndModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={ending}
                  onClick={handleEndInterview}
                  className="flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ending ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Ending...
                    </>
                  ) : (
                    <>
                      <Square size={14} />
                      End interview
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// LOADING STATE
// ======================================================

function LoadingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <LoaderCircle size={32} className="animate-spin text-blue-400" />

      <h2 className="mt-6 font-serif text-3xl text-white">{title}</h2>

      <p className="mt-3 text-sm text-white/35">{description}</p>
    </section>
  );
}

export default InterviewsPage;
