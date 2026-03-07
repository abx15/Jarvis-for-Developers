from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from database.connection import get_db
from services.vision_service import VisionService, VisionInsight, ScreenAnalysis
from services.vision_agent_service import VisionAgentService
from utils.logger import logger
import uuid
import json

router = APIRouter()

# Initialize services
vision_service = VisionService()
vision_agent_service = VisionAgentService()


@router.post("/analyze")
async def analyze_screenshot(
    image_file: UploadFile = File(...),
    analysis_type: str = Form("general"),
    context: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyze screenshot and provide AI insights
    
    Args:
        image_file: Screenshot image file
        analysis_type: Type of analysis (general, code, error, ui)
        context: JSON string with additional context
    
    Returns:
        Analysis results with AI insights
    """
    try:
        # Parse context if provided
        context_data = json.loads(context) if context else {}
        
        # Generate unique filename
        file_extension = image_file.filename.split('.')[-1].lower()
        if file_extension not in ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        
        unique_filename = f"screenshot_{uuid.uuid4().hex}.{file_extension}"
        
        # Save uploaded image
        image_data = await image_file.read()
        file_path = await vision_service.save_screenshot(image_data, unique_filename)
        
        # Analyze screenshot
        analysis = await vision_service.analyze_screenshot(
            file_path, 
            analysis_type, 
            context_data
        )
        
        # Generate AI insight
        insight = await vision_service.generate_ai_insight(analysis, context_data)
        
        return {
            "success": True,
            "analysis": {
                "detected_elements": analysis.detected_elements,
                "text_content": analysis.text_content,
                "layout_info": analysis.layout_info,
                "code_blocks": analysis.code_blocks,
                "error_messages": analysis.error_messages,
                "confidence": analysis.confidence,
                "analysis_type": analysis.analysis_type
            },
            "insight": {
                "problem_type": insight.problem_type,
                "description": insight.description,
                "suggested_fix": insight.suggested_fix,
                "relevant_files": insight.relevant_files,
                "confidence": insight.confidence,
                "priority": insight.priority
            },
            "file_path": file_path
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid context JSON format")
    except Exception as e:
        logger.error(f"Screenshot analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/screenshot")
async def upload_screenshot(
    image_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Simple screenshot upload for basic analysis
    
    Args:
        image_file: Screenshot image file
    
    Returns:
        Basic analysis results
    """
    try:
        # Validate image format
        file_extension = image_file.filename.split('.')[-1].lower()
        if file_extension not in ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        
        # Generate unique filename
        unique_filename = f"upload_{uuid.uuid4().hex}.{file_extension}"
        
        # Save uploaded image
        image_data = await image_file.read()
        file_path = await vision_service.save_screenshot(image_data, unique_filename)
        
        # Extract text using OCR
        text_result = await vision_service.extract_text_from_image(file_path)
        
        # Detect language if code-like content
        detected_language = await vision_service.detect_code_language(text_result["text"])
        
        return {
            "success": True,
            "file_path": file_path,
            "extracted_text": text_result["text"],
            "language": detected_language,
            "confidence": text_result["confidence"],
            "text_blocks": text_result["blocks"]
        }
        
    except Exception as e:
        logger.error(f"Screenshot upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/screen-capture")
async def analyze_screen_capture(
    image_file: UploadFile = File(...),
    analysis_type: str = "general",
    db: Session = Depends(get_db)
):
    """Analyze screen capture (legacy endpoint)"""
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


@router.post("/analyze-with-context")
async def analyze_screenshot_with_context(
    image_file: UploadFile = File(...),
    analysis_type: str = Form("general"),
    repo_context: Optional[str] = Form(None),
    user_context: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyze screenshot with full AI agent context and reasoning
    
    Args:
        image_file: Screenshot image file
        analysis_type: Type of analysis (general, code, error, ui)
        repo_context: JSON string with repository information
        user_context: JSON string with user preferences and history
    
    Returns:
        Enhanced analysis with agent insights and recommendations
    """
    try:
        # Parse contexts
        repo_data = json.loads(repo_context) if repo_context else {}
        user_data = json.loads(user_context) if user_context else {}
        
        # Generate unique filename
        file_extension = image_file.filename.split('.')[-1].lower()
        if file_extension not in ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        
        unique_filename = f"contextual_analysis_{uuid.uuid4().hex}.{file_extension}"
        
        # Save uploaded image
        image_data = await image_file.read()
        file_path = await vision_service.save_screenshot(image_data, unique_filename)
        
        # Perform enhanced analysis with agent context
        result = await vision_agent_service.analyze_with_context(
            file_path,
            analysis_type,
            repo_data,
            user_data
        )
        
        return {
            "success": True,
            "enhanced_analysis": result,
            "file_path": file_path
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid context JSON format")
    except Exception as e:
        logger.error(f"Contextual screenshot analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/error-patterns")
async def analyze_error_patterns(
    error_data: Dict[str, Any],
    repo_context: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyze error patterns from multiple screenshots
    
    Args:
        error_data: Dictionary containing error messages from multiple analyses
        repo_context: JSON string with repository information
    
    Returns:
        Pattern analysis and recommendations
    """
    try:
        repo_data = json.loads(repo_context) if repo_context else {}
        error_messages = error_data.get("error_messages", [])
        
        result = await vision_agent_service.analyze_error_pattern(
            error_messages,
            repo_data
        )
        
        return {
            "success": True,
            "pattern_analysis": result
        }
        
    except Exception as e:
        logger.error(f"Error pattern analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/learning-insights")
async def get_learning_insights(
    analysis_history: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Generate learning insights from analysis history
    
    Args:
        analysis_history: Dictionary containing historical analysis data
    
    Returns:
        Learning insights and progress tracking
    """
    try:
        history = analysis_history.get("analyses", [])
        
        result = await vision_agent_service.get_visual_learning_insights(history)
        
        return {
            "success": True,
            "learning_insights": result
        }
        
    except Exception as e:
        logger.error(f"Learning insights generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cleanup")
async def cleanup_screenshots(
    max_age_hours: int = 24,
    db: Session = Depends(get_db)
):
    """Clean up old screenshot files"""
    try:
        await vision_service.cleanup_old_screenshots(max_age_hours)
        return {"success": True, "message": f"Cleaned up screenshots older than {max_age_hours} hours"}
    except Exception as e:
        logger.error(f"Screenshot cleanup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
