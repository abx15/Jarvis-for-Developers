from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from database.connection import Base
from models.user import Repo


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    language = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    repo = relationship("Repo", backref="files")
    chunks = relationship("CodeChunk", back_populates="file", cascade="all, delete-orphan")


class CodeChunk(Base):
    __tablename__ = "code_chunks"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    start_line = Column(Integer, nullable=True)
    end_line = Column(Integer, nullable=True)
    
    # Relationships
    file = relationship("File", back_populates="chunks")
    embeddings = relationship("Embedding", back_populates="chunk", cascade="all, delete-orphan")


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(Integer, ForeignKey("code_chunks.id", ondelete="CASCADE"), nullable=False)
    embedding_vector = Column(Vector(1536), nullable=False)  # OpenAI's embedding dimensionality
    
    # Relationships
    chunk = relationship("CodeChunk", back_populates="embeddings")
