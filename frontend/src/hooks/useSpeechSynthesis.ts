import {
  useCallback,
  useEffect,
  useState,
} from "react";

function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [voicesReady, setVoicesReady] =
    useState(false);

  // ======================================================
  // LOAD BROWSER VOICES
  // ======================================================

  useEffect(() => {
    const loadVoices = () => {
      const voices =
        window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        setVoicesReady(true);
      }
    };

    // Some browsers already have voices loaded.
    loadVoices();

    // Chrome often loads them asynchronously.
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );

      window.speechSynthesis.cancel();
    };
  }, []);

  // ======================================================
  // STOP SPEAKING
  // ======================================================

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();

    setIsSpeaking(false);
  }, []);

  // ======================================================
  // SPEAK
  // ======================================================

  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(text);

      // Slightly slower sounds better for interviews.
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      // ----------------------------------------------
      // CHOOSE ENGLISH VOICE
      // ----------------------------------------------

      const voices =
        window.speechSynthesis.getVoices();

      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            voice.name
              .toLowerCase()
              .includes("natural")
        ) ||
        voices.find((voice) =>
          voice.lang.startsWith("en-US")
        ) ||
        voices.find((voice) =>
          voice.lang.startsWith("en")
        );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // ----------------------------------------------
      // EVENTS
      // ----------------------------------------------

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      // ----------------------------------------------
      // SPEAK
      // ----------------------------------------------

      window.speechSynthesis.speak(
        utterance
      );
    },
    []
  );

  return {
    isSpeaking,
    voicesReady,
    speak,
    stopSpeaking,
  };
}

export default useSpeechSynthesis;