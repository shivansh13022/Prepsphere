from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.api.dependencies import get_current_user

from app.models.user import User
from app.services.speech_service import transcribe_audio


router = APIRouter()


@router.post("/speech/transcribe")
async def transcribe_speech(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not audio.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is required.",
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is empty.",
        )

    try:
        transcript = transcribe_audio(
            audio_bytes=audio_bytes,
            filename=audio.filename,
        )
    except Exception as exc:
        print("Speech transcription error:", exc)

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to transcribe audio.",
        ) from exc

    return {
        "transcript": transcript,
    }