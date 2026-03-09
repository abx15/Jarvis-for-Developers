"""
Editor session model for collaborative editing
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from database.connection import Base

class EditorSession(Base):
    __tablename__ = "editor_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), unique=True, nullable=False, index=True)
    repo_id = Column(Integer, nullable=False, index=True)
    file_path = Column(Text, nullable=False)
    created_by = Column(Integer, nullable=False, index=True)
    active_users = Column(JSON, default=list)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Relationships
    repo = relationship("Repo", back_populates="editor_sessions")
    creator = relationship("User", back_populates="editor_sessions")
    ai_suggestions = relationship("AISuggestion", back_populates="session", cascade="all, delete-orphan")
