from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from database.connection import get_db
from services.voice_service import VoiceService
from utils.logger import logger
import os
from pydantic import BaseModel

router = APIRouter()

# Initialize service
voice_service = VoiceService()


class VoiceCommandRequest(BaseModel):
    command: str
    context: dict = {}
    repo_id: int = None


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
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return {"success": True, "text": text}
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/command")
async def process_voice_command(
    request: VoiceCommandRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Process voice command transcript to detect intent and route to AI agents"""
    try:
        # Add context from request
        context = request.context or {}
        if request.repo_id:
            context["repo_id"] = request.repo_id
        
        result = await voice_service.process_command(request.command, context, db)
        
        return result
    except Exception as e:
        logger.error(f"Voice command processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/execute")
async def execute_voice_command(
    request: VoiceCommandRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Execute voice command with AI agents (alias for /command)"""
    return await process_voice_command(request, background_tasks, db)
