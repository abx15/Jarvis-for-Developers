import os
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.repo_memory import CodeChunk, File
from services.embedding_service import EmbeddingService
from openai import AsyncOpenAI
from config import settings
from utils.logger import logger


class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = EmbeddingService(db)
        
        # Ensure OpenAI API key is set
        api_key = os.environ.get("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        self.client = AsyncOpenAI(api_key=api_key)
        self.chat_model = "gpt-4o"  # Use gpt-4o or gpt-4-turbo for complex reasoning

    async def search_repository(self, repo_id: int, query: str, limit: int = 5) -> Dict[str, Any]:
        """Perform semantic search on a repository's codebase using pgvector's cosine distance"""
        logger.info(f"Searching repo {repo_id} for query: {query}")
        
        try:
            # 1. Generate embedding for query
            query_vector = await self.embedding_service.get_embedding(query)
            if not query_vector:
                return {"results": [], "answer": "Could not generate query embedding."}
                
            # 2. Perform vector similarity search (cosine distance <->)
            # We use raw SQL because pgvector ops can be tricky with SQLAlchemy ORM directly sometimes
            # The operator <=> is cosine distance
            query_sql = """
                SELECT 
                    cc.id, 
                    cc.chunk_text, 
                    cc.start_line, 
                    cc.end_line,
                    f.file_path,
                    f.language,
                    1 - (e.embedding_vector <=> :query_embedding::vector) as similarity
                FROM code_chunks cc
                JOIN files f ON cc.file_id = f.id
                JOIN embeddings e ON cc.id = e.chunk_id
                WHERE f.repo_id = :repo_id
                ORDER BY e.embedding_vector <=> :query_embedding::vector
                LIMIT :limit
            """
            
            # Format the vector as a string for pgvector '[1.2, 3.4, ...]'
            vector_str = "[" + ",".join(map(str, query_vector)) + "]"
            
            result = self.db.execute(text(query_sql), {
                "query_embedding": vector_str,
                "repo_id": repo_id,
                "limit": limit
            })
            
            search_results = []
            for row in result:
                search_results.append({
                    "chunk_id": row[0],
                    "content": row[1],
                    "start_line": row[2],
                    "end_line": row[3],
                    "file_path": row[4],
                    "language": row[5],
                    "similarity": float(row[6])
                })
                
            logger.info(f"Found {len(search_results)} relevant chunks")
            
            # 3. Generate answer using LLM
            answer = await self.generate_answer(query, search_results)
            
            return {
                "query": query,
                "results": search_results,
                "answer": answer
            }
            
        except Exception as e:
            logger.error(f"Error during repository search: {e}")
            raise

    async def generate_answer(self, query: str, search_results: List[Dict[str, Any]]) -> str:
        """Use an LLM to generate an answer based on the retrieved code chunks"""
        if not search_results:
            return "I couldn't find any relevant code in the repository to answer your question."
            
        # Construct context from chunks
        context_parts = []
        for i, res in enumerate(search_results):
            context_parts.append(f"--- Code Snippet {i+1} ---\nFile: {res['file_path']}\n```{res['language']}\n{res['content']}\n```\n")
            
        context = "\n".join(context_parts)
        
        system_prompt = """You are a senior AI engineering assistant named Jarvis.
Your task is to answer questions about a user's GitHub repository based *only* on the provided code snippets.
If the snippets don't contain the answer, say so politely. Do not make up code that isn't in the snippets.
When referring to code, use the exact file paths and line numbers if appropriate.
Be concise but extremely technical and precise."""

        user_prompt = f"User Question: {query}\n\nRepository Context:\n{context}\n\nAnswer:"
        
        try:
            response = await self.client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2, # Low temperature for factual accuracy
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating LLM answer: {e}")
            return "Error: Could not communicate with the LLM to generate an answer."
