from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.connection import get_db
from services.vision_service import VisionService
from utils.logger import logger

router = APIRouter()

# Initialize service
vision_service = VisionService()


@router.post("/screen-capture")
async def analyze_screen_capture(
    image_file: UploadFile = File(...),
    analysis_type: str = "general",
    db: Session = Depends(get_db)
):
    """Analyze screen capture"""
    try:
        # Save uploaded image
        file_path = f"uploads/vision/{image_file.filename}"
        with open(file_path, "wb") as buffer:
            content = await image_file.read()
            buffer.write(content)
        
        # Analyze screen capture
        result = await vision_service.analyze_screen(file_path, analysis_type)
        
        return {"success": True, "analysis": result}
    except Exception as e:
        logger.error(f"Screen capture analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gesture-recognition")
async def recognize_gesture(
    image_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Recognize hand gestures"""
    try:
        file_path = f"uploads/vision/{image_file.filename}"
        with open(file_path, "wb") as buffer:
            content = await image_file.read()
            buffer.write(content)
        
        result = await vision_service.recognize_gesture(file_path)
        return {"success": True, "gesture": result}
    except Exception as e:
        logger.error(f"Gesture recognition error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/code-ocr")
async def extract_code_from_image(
    image_file: UploadFile = File(...),
    language_hint: str = "",
    db: Session = Depends(get_db)
):
    """Extract code from image using OCR"""
    try:
        file_path = f"uploads/vision/{image_file.filename}"
        with open(file_path, "wb") as buffer:
            content = await image_file.read()
            buffer.write(content)
        
        result = await vision_service.extract_code(file_path, language_hint)
        return {"success": True, "code": result}
    except Exception as e:
        logger.error(f"Code extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webcam-stream")
async def process_webcam_stream(
    stream_data: dict,
    db: Session = Depends(get_db)
):
    """Process webcam stream for real-time analysis"""
    try:
        result = await vision_service.process_stream(stream_data)
        return {"success": True, "stream_analysis": result}
    except Exception as e:
        logger.error(f"Webcam stream processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
