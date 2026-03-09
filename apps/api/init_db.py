"""
Database initialization script for AI Developer OS
"""
from sqlalchemy import create_engine, text
from database.connection import engine, Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create all database tables"""
    try:
        # Enable pgvector extension first
        logger.info("Enabling pgvector extension...")
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
        
        logger.info("pgvector extension enabled!")
        
        # Import all models
        from models.user import User
        from models.repo_memory import File, CodeChunk
        
        logger.info("Creating database tables...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        logger.info("Tables created successfully!")
        
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise

if __name__ == "__main__":
    create_tables()
