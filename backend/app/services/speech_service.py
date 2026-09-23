from groq import Groq

from app.core.config import settings


client = Groq(
    api_key=settings.groq_api_key,
)


def transcribe_audio(
    audio_bytes: bytes,
    filename: str,
) -> str:
    transcription = client.audio.transcriptions.create(
        file=(filename, audio_bytes),
        model="whisper-large-v3-turbo",
        response_format="json",
        language="en",
        temperature=0.0,
    )

    return transcription.text.strip()