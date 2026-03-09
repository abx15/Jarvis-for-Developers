"""
Routes for collaborative editor sessions
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import uuid
import json
import logging

from database.connection import get_db
from models.user import User
from models.repo import Repo
from ws.editor_ws import handle_websocket_connection
from services.ai_editor_service import ai_editor_service, CodeContext, SuggestionType

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class CreateSessionRequest(BaseModel):
    repo_id: int
    file_path: str
    user_id: int

class SessionResponse(BaseModel):
    session_id: str
    repo_id: int
    file_path: str
    created_by: int
    active_users: List[str]
    created_at: str

class AISuggestionRequest(BaseModel):
    session_id: str
    user_id: int
    code: str
    language: str
    line_number: int
    column_number: int

class AISuggestionResponse(BaseModel):
    suggestions: List[Dict[str, Any]]
    inline_suggestion: Optional[str] = None

class SessionUpdateRequest(BaseModel):
    active_users: List[str]

@router.post("/create-session", response_model=SessionResponse)
async def create_editor_session(
    request: CreateSessionRequest,
    db: Session = Depends(get_db)
):
    """Create a new collaborative editing session"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify repo exists and user has access
        repo = db.query(Repo).filter(
            Repo.id == request.repo_id,
            Repo.user_id == request.user_id
        ).first()
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found or access denied")
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Create session record in database
        from models.editor_session import EditorSession
        
        editor_session = EditorSession(
            session_id=session_id,
            repo_id=request.repo_id,
            file_path=request.file_path,
            created_by=request.user_id,
            active_users=[str(request.user_id)]
        )
        
        db.add(editor_session)
        db.commit()
        db.refresh(editor_session)
        
        return SessionResponse(
            session_id=editor_session.session_id,
            repo_id=editor_session.repo_id,
            file_path=editor_session.file_path,
            created_by=editor_session.created_by,
            active_users=editor_session.active_users,
            created_at=editor_session.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating editor session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_editor_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get editor session details"""
    try:
        from models.editor_session import EditorSession
        
        session = db.query(EditorSession).filter(
            EditorSession.session_id == session_id,
            EditorSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionResponse(
            session_id=session.session_id,
            repo_id=session.repo_id,
            file_path=session.file_path,
            created_by=session.created_by,
            active_users=session.active_users,
            created_at=session.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting editor session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/session/{session_id}/users")
async def update_session_users(
    session_id: str,
    request: SessionUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update active users in a session"""
    try:
        from models.editor_session import EditorSession
        
        session = db.query(EditorSession).filter(
            EditorSession.session_id == session_id,
            EditorSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session.active_users = request.active_users
        db.commit()
        
        return {"message": "Session users updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating session users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/ai-suggestions", response_model=AISuggestionResponse)
async def get_ai_suggestions(
    request: AISuggestionRequest,
    db: Session = Depends(get_db)
):
    """Get AI suggestions for code"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create code context
        context = CodeContext(
            file_path="",  # Could be enhanced to get from session
            language=request.language,
            line_number=request.line_number,
            column_number=request.column_number,
            surrounding_code=request.code,
            full_content=request.code
        )
        
        # Get AI suggestions
        suggestions = await ai_editor_service.analyze_code(context)
        
        # Get inline suggestion
        inline_suggestion = await ai_editor_service.generate_inline_suggestion(context)
        
        # Convert suggestions to dict format
        suggestion_dicts = []
        for suggestion in suggestions:
            suggestion_dicts.append({
                "text": suggestion.text,
                "type": suggestion.suggestion_type.value,
                "confidence": suggestion.confidence,
                "context": suggestion.context,
                "priority": suggestion.priority
            })
        
        # Save suggestions to database
        from models.ai_suggestion import AISuggestion
        
        for suggestion in suggestions:
            ai_suggestion = AISuggestion(
                session_id=request.session_id,
                user_id=request.user_id,
                suggestion_text=suggestion.text,
                suggestion_type=suggestion.suggestion_type.value,
                context=suggestion.context
            )
            db.add(ai_suggestion)
        
        db.commit()
        
        return AISuggestionResponse(
            suggestions=suggestion_dicts,
            inline_suggestion=inline_suggestion
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI suggestions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/sessions/user/{user_id}")
async def get_user_sessions(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all sessions for a user"""
    try:
        from models.editor_session import EditorSession
        
        sessions = db.query(EditorSession).filter(
            EditorSession.created_by == user_id,
            EditorSession.is_active == True
        ).all()
        
        session_list = []
        for session in sessions:
            session_list.append({
                "session_id": session.session_id,
                "repo_id": session.repo_id,
                "file_path": session.file_path,
                "created_at": session.created_at.isoformat(),
                "active_users": session.active_users
            })
        
        return {"sessions": session_list}
        
    except Exception as e:
        logger.error(f"Error getting user sessions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/session/{session_id}")
async def delete_editor_session(
    session_id: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Delete an editor session"""
    try:
        from models.editor_session import EditorSession
        
        session = db.query(EditorSession).filter(
            EditorSession.session_id == session_id,
            EditorSession.created_by == user_id,
            EditorSession.is_active == True
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session.is_active = False
        db.commit()
        
        return {"message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/explain-code")
async def explain_code(
    code: str,
    language: str
):
    """Get explanation for code snippet"""
    try:
        explanation = await ai_editor_service.explain_code(code, language)
        return {"explanation": explanation}
        
    except Exception as e:
        logger.error(f"Error explaining code: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# WebSocket endpoint for collaborative editing
@router.websocket("/ws/editor/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    user_id: str = "anonymous"
):
    """WebSocket endpoint for real-time collaborative editing"""
    await handle_websocket_connection(websocket, session_id, user_id)
