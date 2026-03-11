from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.connection import Base

class AIStreamLog(Base):
    """
    Model to log streaming AI interactions for performance tracking and auditing.
    """
    __tablename__ = "ai_stream_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    stream_type = Column(String(50), nullable=False)  # chat, suggestion, doc, bug
    response_length = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Optional relationship if needed
    # user = relationship("User", back_populates="ai_stream_logs")
