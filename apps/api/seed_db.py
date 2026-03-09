"""
Database seeding script for AI Developer OS
"""
import asyncio
from sqlalchemy.orm import Session
from database.connection import engine, Base, get_db
from models.user import User, Repo
from models.repo_memory import File, CodeChunk
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_sample_data():
    """Seed the database with sample data"""
    try:
        # Create database session
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        logger.info("Starting database seeding...")
        
        # Create sample user
        sample_user = User(
            email="demo@aidevos.com",
            password_hash="$2b$12$demo_hashed_password_here",  # Mock hash
            name="Demo User",
            is_active=True
        )
        db.add(sample_user)
        db.commit()
        db.refresh(sample_user)
        logger.info(f"Created sample user: {sample_user.email}")
        
        # Create sample repository
        sample_repo = Repo(
            user_id=sample_user.id,
            repo_name="demo-project",
            repo_url="https://github.com/demo/demo-project",
            description="A sample project for demonstration",
            is_active=True
        )
        db.add(sample_repo)
        db.commit()
        db.refresh(sample_repo)
        logger.info(f"Created sample repository: {sample_repo.repo_name}")
        
        # Create sample files
        sample_files = [
            {
                "file_path": "src/main.py",
                "content": """# Main application entry point
import os
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
""",
                "language": "python"
            },
            {
                "file_path": "src/components/Button.tsx",
                "content": """import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variantClasses = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
""",
                "language": "typescript"
            },
            {
                "file_path": "README.md",
                "content": """# Demo Project

This is a sample project demonstrating the AI Developer OS capabilities.

## Features

- FastAPI backend
- React frontend
- Type-safe development

## Getting Started

1. Clone the repository
2. Install dependencies
3. Run the development server

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## License

MIT License
""",
                "language": "markdown"
            }
        ]
        
        created_files = []
        for file_data in sample_files:
            file = File(
                repo_id=sample_repo.id,
                file_path=file_data["file_path"],
                content=file_data["content"],
                language=file_data["language"]
            )
            db.add(file)
            db.commit()
            db.refresh(file)
            created_files.append(file)
            logger.info(f"Created file: {file.file_path}")
        
        # Create sample code chunks
        chunk_id = 1
        for file in created_files:
            # Split content into chunks
            content_lines = file.content.split('\n')
            chunk_size = 10
            
            for i in range(0, len(content_lines), chunk_size):
                chunk_text = '\n'.join(content_lines[i:i+chunk_size])
                
                code_chunk = CodeChunk(
                    file_id=file.id,
                    chunk_text=chunk_text,
                    start_line=i + 1,
                    end_line=min(i + chunk_size, len(content_lines))
                )
                db.add(code_chunk)
                chunk_id += 1
            
            db.commit()
            logger.info(f"Created chunks for file: {file.file_path}")
        
        # Create additional sample users
        additional_users = [
            {"email": "alice@example.com", "name": "Alice Johnson"},
            {"email": "bob@example.com", "name": "Bob Smith"},
            {"email": "charlie@example.com", "name": "Charlie Davis"}
        ]
        
        for user_data in additional_users:
            user = User(
                email=user_data["email"],
                name=user_data["name"],
                password_hash="$2b$12$demo_hashed_password_here",
                is_active=True
            )
            db.add(user)
        
        db.commit()
        logger.info(f"Created {len(additional_users)} additional users")
        
        logger.info("Database seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_sample_data())
