import os
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.repo_memory import CodeChunk, Embedding, File
from openai import AsyncOpenAI
from config import settings
from utils.logger import logger


class EmbeddingService:
    def __init__(self, db: Session):
        self.db = db
        # Ensure OpenAI API key is set
        api_key = os.environ.get("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        self.client = AsyncOpenAI(api_key=api_key)
        self.embedding_model = "text-embedding-3-small"

    async def get_embedding(self, text: str) -> List[float]:
        """Generate a single embedding via OpenAI"""
        try:
            # Clean text
            text = text.replace("\n", " ").strip()
            if not text:
                return []
                
            response = await self.client.embeddings.create(
                input=[text],
                model=self.embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise

    async def generate_embeddings_for_repo(self, repo_id: int) -> Dict[str, Any]:
        """Find all code chunks for a given repo and generate embeddings for them"""
        logger.info(f"Generating embeddings for repo_id: {repo_id}")
        
        try:
            # 1. Fetch chunks that belong to this repo and don't have embeddings yet
            stmt = (
                select(CodeChunk, File)
                .join(File, CodeChunk.file_id == File.id)
                .outerjoin(Embedding, CodeChunk.id == Embedding.chunk_id)
                .where(File.repo_id == repo_id)
                .where(Embedding.id == None)
            )
            
            result = self.db.execute(stmt)
            chunks_to_embed = result.fetchall()
            
            logger.info(f"Found {len(chunks_to_embed)} chunks without embeddings")
            
            embeddings_created = 0
            
            # 2. Process each chunk
            # In a production app, we would batch these requests using client.embeddings.create(input=[...])
            # For simplicity, we process one by one here, but limit API calls
            
            for chunk_obj, file_obj in chunks_to_embed:
                text_to_embed = f"File: {file_obj.file_path}\nLanguage: {file_obj.language}\nContent:\n{chunk_obj.chunk_text}"
                vector = await self.get_embedding(text_to_embed)
                
                if vector:
                    db_embedding = Embedding(
                        chunk_id=chunk_obj.id,
                        embedding_vector=vector
                    )
                    self.db.add(db_embedding)
                    embeddings_created += 1
                    
                    # Commit every 50 to avoid huge transactions
                    if embeddings_created % 50 == 0:
                        self.db.commit()
                        logger.info(f"Created {embeddings_created} embeddings...")
            
            # Final commit
            self.db.commit()
            logger.info(f"Embedding generation complete. Created {embeddings_created} embeddings.")
            
            return {
                "status": "success",
                "embeddings_created": embeddings_created
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error during embedding generation: {e}")
            raise
