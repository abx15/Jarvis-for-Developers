from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.connection import get_db
from services.voice_service import VoiceService
from utils.logger import logger

router = APIRouter()

# Initialize service
voice_service = VoiceService()


@router.post("/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Convert speech to text (Transcription)"""
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads/voice", exist_ok=True)
        
        file_path = f"uploads/voice/{audio_file.filename}"
        with open(file_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        # Convert speech to text
        text = await voice_service.speech_to_text(file_path)
        
        return {"success": True, "text": text}
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/command")
async def process_voice_command(
    command: str,
    context: dict = {},
    db: Session = Depends(get_db)
):
    """Process voice command transcript to detect intent and routing"""
    try:
        result = await voice_service.process_command(command, context)
        return {"success": True, "command": command, "analysis": result}
    except Exception as e:
        logger.error(f"Voice command processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
