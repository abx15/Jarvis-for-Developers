from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.connection import Base
from datetime import datetime

class Bug(Base):
    __tablename__ = "bugs"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(1000), nullable=False)
    bug_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    repo = relationship("Repo", back_populates="bugs")
    fixes = relationship("BugFix", back_populates="bug", cascade="all, delete-orphan")

class BugFix(Base):
    __tablename__ = "bug_fixes"

    id = Column(Integer, primary_key=True, index=True)
    bug_id = Column(Integer, ForeignKey("bugs.id", ondelete="CASCADE"), nullable=False)
    suggested_fix = Column(Text, nullable=False)
    ai_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bug = relationship("Bug", back_populates="fixes")
