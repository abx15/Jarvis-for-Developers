"""
AI suggestion model for editor
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base

class AISuggestion(Base):
    __tablename__ = "ai_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), ForeignKey("editor_sessions.session_id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    suggestion_text = Column(Text, nullable=False)
    suggestion_type = Column(String(50), default="refactor", nullable=False, index=True)
    context = Column(JSON, nullable=True)
    is_accepted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, nullable=False)
    
    # Relationships
    session = relationship("EditorSession", back_populates="ai_suggestions")
    user = relationship("User", back_populates="ai_suggestions")
