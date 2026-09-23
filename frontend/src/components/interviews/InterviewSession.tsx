import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  Mic,
  Sparkles,
  Square,
  SquareStop,
  Volume2,
  VolumeX,
} from "lucide-react";

import useAudioRecorder from "../../hooks/useAudioRecorder";
import useSpeechSynthesis from "../../hooks/useSpeechSynthesis";
import { transcribeAudio } from "../../services/speech/speechService";

interface InterviewSessionProps {
  currentTopic: string | null;
  question: string;
  questionsAsked: number;
  difficulty: string;
  answer: string;
  setAnswer: (value: string) => void;
  submitting: boolean;
  ending: boolean;
  remainingSeconds: number;
  onSubmit: () => void;
  onEnd: () => void;
}

function InterviewSession({
  currentTopic,
  question,
  questionsAsked,
  difficulty,
  answer,
  setAnswer,
  submitting,
  ending,
  remainingSeconds,
  onSubmit,
  onEnd,
}: InterviewSessionProps) {
  // ======================================================
  // AUDIO RECORDER
  // ======================================================

  const {
    isRecording,
    audioBlob,
    recordingError,
    audioLevel,
    recordingSeconds,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  // ======================================================
  // INTERVIEWER SPEECH
  // ======================================================

  const { isSpeaking, voicesReady, speak, stopSpeaking } = useSpeechSynthesis();
  const lastSpokenQuestionRef = useRef<string>("");

  /*
    Whenever LangGraph gives us a NEW question,
    automatically speak it once.
  */
  useEffect(() => {
    if (
      !voicesReady ||
      !question ||
      question === lastSpokenQuestionRef.current
    ) {
      return;
    }

    lastSpokenQuestionRef.current = question;

    speak(question);
  }, [question, voicesReady, speak]);

  // ======================================================
  // TRANSCRIPTION
  // ======================================================

  const [isTranscribing, setIsTranscribing] = useState(false);

  const [transcriptionError, setTranscriptionError] = useState("");

  const handleTranscribe = async () => {
    if (!audioBlob) {
      return;
    }

    try {
      setIsTranscribing(true);
      setTranscriptionError("");

      const transcript = await transcribeAudio(audioBlob);

      setAnswer(transcript);
    } catch (error) {
      console.error("Unable to transcribe recording:", error);

      setTranscriptionError(
        "Unable to transcribe your recording. Please try again.",
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  // ======================================================
  // START RECORDING
  // ======================================================

  const handleStartRecording = async () => {
    /*
      If the interviewer is still speaking,
      stop the voice before turning on the mic.
    */
    stopSpeaking();

    await startRecording();
  };

  // ======================================================
  // END INTERVIEW
  // ======================================================

  const handleEndInterview = () => {
    stopSpeaking();

    onEnd();
  };

  // ======================================================
  // INTERVIEW TIMER
  // ======================================================

  const minutes = Math.floor(remainingSeconds / 60);

  const seconds = remainingSeconds % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  // ======================================================
  // RECORDING TIMER
  // ======================================================

  const recordingMinutes = Math.floor(recordingSeconds / 60);

  const recordingRemainingSeconds = recordingSeconds % 60;

  const formattedRecordingTime = `${String(recordingMinutes).padStart(
    2,
    "0",
  )}:${String(recordingRemainingSeconds).padStart(2, "0")}`;

  // ======================================================
  // WAVEFORM
  // ======================================================

  const waveformBars = [
    0.35, 0.55, 0.75, 0.45, 0.9, 0.65, 1, 0.55, 0.8, 0.4, 0.7, 0.95, 0.6, 0.45,
    0.85, 0.65, 1, 0.5, 0.75, 0.4, 0.9, 0.6, 0.8, 0.45,
  ];

  return (
    <section className="mt-10">
      {/* ==================================================
          METADATA
      ================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/25">
            Question {questionsAsked}
          </p>

          {currentTopic && (
            <p className="mt-1 text-sm text-blue-400">{currentTopic}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* INTERVIEW TIMER */}

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              remainingSeconds === 0
                ? "border-amber-400/20 text-amber-300"
                : "border-white/10 text-white/40"
            }`}
          >
            <Clock3 size={14} />

            {remainingSeconds === 0 ? "Finishing" : formattedTime}
          </div>

          {/* DIFFICULTY */}

          <div className="rounded-full border border-white/10 px-3 py-1.5 text-xs capitalize text-white/40">
            {difficulty}
          </div>
        </div>
      </div>

      {/* ==================================================
          QUESTION
      ================================================== */}

      <div className="py-12">
        <div className="flex items-center justify-between gap-4">
          {/* INTERVIEWER LABEL */}

          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/25">
            <MessageSquareText size={15} />
            Interviewer
          </div>

          {/* SPEAKER CONTROL */}

          <button
            type="button"
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                speak(question);
              }
            }}
            disabled={isRecording}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-white/40 transition hover:border-blue-500/30 hover:bg-blue-500/[0.05] hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isSpeaking ? (
              <>
                <VolumeX size={15} />
                Stop audio
              </>
            ) : (
              <>
                <Volume2 size={15} />
                Replay question
              </>
            )}
          </button>
        </div>

        <h2 className="mt-5 max-w-4xl font-serif text-3xl leading-tight text-white md:text-4xl">
          {question}
        </h2>

        {/* SPEAKING INDICATOR */}

        {isSpeaking && (
          <div className="mt-4 flex items-center gap-2 text-xs text-blue-300/70">
            <span className="flex items-end gap-[2px]">
              <span className="h-2 w-[2px] animate-pulse rounded-full bg-blue-400" />
              <span className="h-3 w-[2px] animate-pulse rounded-full bg-blue-400" />
              <span className="h-2 w-[2px] animate-pulse rounded-full bg-blue-400" />
            </span>
            Interviewer speaking
          </div>
        )}
      </div>

      {/* ==================================================
          ANSWER
      ================================================== */}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <label className="text-xs font-medium text-white/40">Your answer</label>

        <textarea
          value={answer}
          disabled={submitting || ending || isTranscribing}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Type your answer or record your response..."
          rows={8}
          className="mt-3 w-full resize-none bg-transparent text-sm leading-7 text-white outline-none placeholder:text-white/20 disabled:opacity-50"
        />

        {/* ==================================================
            VOICE RECORDING
        ================================================== */}

        <div className="mt-4 border-t border-white/[0.07] pt-4">
          {/* ==================================================
              NOT RECORDING
          ================================================== */}

          {!isRecording && (
            <div className="flex flex-wrap items-center gap-3">
              {/* START RECORDING */}

              <button
                type="button"
                onClick={handleStartRecording}
                disabled={submitting || ending || isTranscribing}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mic size={16} />
                Start recording
              </button>

              {/* AUDIO CAPTURED */}

              {audioBlob && !isTranscribing && (
                <div className="text-xs text-white/30">
                  Audio captured ({(audioBlob.size / 1024).toFixed(1)} KB)
                </div>
              )}

              {/* TRANSCRIBE */}

              {audioBlob && !isTranscribing && (
                <button
                  type="button"
                  onClick={handleTranscribe}
                  disabled={submitting || ending}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-4 py-2 text-sm text-blue-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={15} />
                  Transcribe recording
                </button>
              )}

              {/* TRANSCRIBING */}

              {isTranscribing && (
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <LoaderCircle size={16} className="animate-spin" />
                  Transcribing...
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              RECORDING PANEL
          ================================================== */}

          {isRecording && (
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.025] px-4 py-4">
              <div className="flex items-center gap-4">
                {/* RECORDING STATUS */}

                <div className="flex shrink-0 items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                  </span>

                  <span className="text-xs font-medium text-white/50">
                    Recording
                  </span>
                </div>

                {/* ==========================================
                    LIVE WAVEFORM
                ========================================== */}

                <div className="flex h-9 flex-1 items-center justify-center gap-[3px] overflow-hidden">
                  {waveformBars.map((multiplier, index) => {
                    const height =
                      4 + Math.min(28, audioLevel * multiplier * 0.55);

                    return (
                      <span
                        key={index}
                        className="w-[3px] rounded-full bg-blue-400/80 transition-[height] duration-75"
                        style={{
                          height: `${height}px`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* RECORDING TIMER */}

                <div className="shrink-0 font-mono text-xs tabular-nums text-white/40">
                  {formattedRecordingTime}
                </div>

                {/* STOP RECORDING */}

                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-500/30 hover:bg-red-500/10"
                >
                  <SquareStop size={14} />
                  Stop
                </button>
              </div>

              <p className="mt-2 text-center text-[11px] text-white/20">
                Speak naturally. Your response will be transcribed after you
                stop recording.
              </p>
            </div>
          )}

          {/* ==================================================
              ERRORS
          ================================================== */}

          {recordingError && (
            <p className="mt-3 text-xs text-red-300">{recordingError}</p>
          )}

          {transcriptionError && (
            <p className="mt-3 text-xs text-red-300">{transcriptionError}</p>
          )}
        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
          {/* END INTERVIEW */}

          <button
            type="button"
            onClick={handleEndInterview}
            disabled={submitting || ending || isRecording || isTranscribing}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/35 transition hover:bg-white/[0.04] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ending ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                Ending...
              </>
            ) : (
              <>
                <Square size={13} />
                End interview
              </>
            )}
          </button>

          {/* SUBMIT ANSWER */}

          <button
            type="button"
            onClick={onSubmit}
            disabled={
              submitting ||
              ending ||
              isRecording ||
              isTranscribing ||
              !answer.trim()
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                Submit answer
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default InterviewSession;
