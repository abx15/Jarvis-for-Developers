from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.connection import get_db
from services.voice_service import VoiceService
from utils.logger import logger

router = APIRouter()

# Initialize service
voice_service = VoiceService()


@router.post("/speech-to-text")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Convert speech to text"""
    try:
        # Save uploaded audio file
        file_path = f"uploads/voice/{audio_file.filename}"
        with open(file_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        # Convert speech to text
        result = await voice_service.speech_to_text(file_path)
        
        return {"success": True, "text": result}
    except Exception as e:
        logger.error(f"Speech to text error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text-to-speech")
async def text_to_speech(
    text: str,
    voice: str = "default",
    db: Session = Depends(get_db)
):
    """Convert text to speech"""
    try:
        result = await voice_service.text_to_speech(text, voice)
        return {"success": True, "audio_url": result}
    except Exception as e:
        logger.error(f"Text to speech error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/command")
async def process_voice_command(
    command: str,
    context: dict = {},
    db: Session = Depends(get_db)
):
    """Process voice command"""
    try:
        result = await voice_service.process_command(command, context)
        return {"success": True, "result": result}
    except Exception as e:
        logger.error(f"Voice command processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wake-word")
async def detect_wake_word(
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Detect wake word in audio"""
    try:
        file_path = f"uploads/voice/{audio_file.filename}"
        with open(file_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        result = await voice_service.detect_wake_word(file_path)
        return {"success": True, "detected": result}
    except Exception as e:
        logger.error(f"Wake word detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
