import {
  useEffect,
  useRef,
  useState,
} from "react";

function useAudioRecorder() {
  const [isRecording, setIsRecording] =
    useState(false);

  const [audioBlob, setAudioBlob] =
    useState<Blob | null>(null);

  const [recordingError, setRecordingError] =
    useState("");

  // Recording duration in seconds
  const [recordingSeconds, setRecordingSeconds] =
    useState(0);

  // Current microphone loudness: 0 → 100
  const [audioLevel, setAudioLevel] =
    useState(0);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);

  const streamRef =
    useRef<MediaStream | null>(null);

  // ======================================================
  // AUDIO ANALYSIS
  // ======================================================

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const analyserRef =
    useRef<AnalyserNode | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  // ======================================================
  // STOP AUDIO VISUALIZER
  // ======================================================

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();

      audioContextRef.current = null;
    }

    analyserRef.current = null;

    setAudioLevel(0);
  };

  // ======================================================
  // START AUDIO VISUALIZER
  // ======================================================

  const startAudioAnalysis = (
    stream: MediaStream
  ) => {
    const audioContext = new AudioContext();

    const analyser =
      audioContext.createAnalyser();

    const source =
      audioContext.createMediaStreamSource(
        stream
      );

    analyser.fftSize = 256;

    analyser.smoothingTimeConstant = 0.8;

    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(
      analyser.frequencyBinCount
    );

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      let total = 0;

      for (
        let i = 0;
        i < dataArray.length;
        i++
      ) {
        total += dataArray[i];
      }

      const average =
        total / dataArray.length;

      // Convert microphone intensity roughly
      // into a convenient 0 → 100 value.
      const normalizedLevel = Math.min(
        100,
        Math.round((average / 128) * 100)
      );

      setAudioLevel(normalizedLevel);

      animationFrameRef.current =
        requestAnimationFrame(
          updateAudioLevel
        );
    };

    updateAudioLevel();
  };

  // ======================================================
  // START TIMER
  // ======================================================

  const startTimer = () => {
    setRecordingSeconds(0);

    timerRef.current = setInterval(() => {
      setRecordingSeconds(
        (previous) => previous + 1
      );
    }, 1000);
  };

  // ======================================================
  // STOP TIMER
  // ======================================================

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }
  };

  // ======================================================
  // START RECORDING
  // ======================================================

  const startRecording = async () => {
    try {
      setRecordingError("");

      setAudioBlob(null);

      setRecordingSeconds(0);

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      streamRef.current = stream;

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      audioChunksRef.current = [];

      // ----------------------------------------------
      // Collect recorded audio chunks
      // ----------------------------------------------

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      // ----------------------------------------------
      // Recording finished
      // ----------------------------------------------

      mediaRecorder.onstop = () => {
        const blob = new Blob(
          audioChunksRef.current,
          {
            type:
              mediaRecorder.mimeType ||
              "audio/webm",
          }
        );

        setAudioBlob(blob);

        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;

        stopAudioAnalysis();

        stopTimer();
      };

      // ----------------------------------------------
      // Start everything
      // ----------------------------------------------

      mediaRecorder.start();

      startAudioAnalysis(stream);

      startTimer();

      setIsRecording(true);
    } catch (error) {
      console.error(
        "Unable to start microphone recording:",
        error
      );

      setRecordingError(
        "Unable to access your microphone. Please allow microphone permission and try again."
      );

      setIsRecording(false);

      stopAudioAnalysis();

      stopTimer();
    }
  };

  // ======================================================
  // STOP RECORDING
  // ======================================================

  const stopRecording = () => {
    const mediaRecorder =
      mediaRecorderRef.current;

    if (
      mediaRecorder &&
      mediaRecorder.state !== "inactive"
    ) {
      mediaRecorder.stop();
    }

    setIsRecording(false);

    stopTimer();
  };

  // ======================================================
  // CLEANUP
  // ======================================================

  useEffect(() => {
    return () => {
      stopTimer();

      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      if (
        audioContextRef.current &&
        audioContextRef.current.state !==
          "closed"
      ) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    audioBlob,
    recordingError,

    // NEW
    audioLevel,
    recordingSeconds,

    startRecording,
    stopRecording,
  };
}

export default useAudioRecorder;