import api from "../api";

interface TranscriptionResponse {
  transcript: string;
}

export async function transcribeAudio(
  audioBlob: Blob
): Promise<string> {
  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    "interview-answer.webm"
  );

  const response =
    await api.post<TranscriptionResponse>(
      "/speech/transcribe",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

  return response.data.transcript;
}