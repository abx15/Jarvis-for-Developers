"""
Embedding Engine Service
Handles vector embeddings for semantic search and similarity matching
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import numpy as np
import json
from datetime import datetime

app = FastAPI(title="Embedding Engine Service", version="0.1.0")


class EmbeddingRequest(BaseModel):
    text: str
    model: str = "text-embedding-ada-002"
    metadata: Optional[Dict[str, Any]] = None


class BatchEmbeddingRequest(BaseModel):
    texts: List[str]
    model: str = "text-embedding-ada-002"
    metadata: Optional[List[Dict[str, Any]]] = None


class SearchRequest(BaseModel):
    query: str
    top_k: int = 10
    threshold: float = 0.7
    filters: Optional[Dict[str, Any]] = None


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    dimensions: int
    model: str
    processing_time: float


class SearchResult(BaseModel):
    content: str
    similarity_score: float
    metadata: Dict[str, Any]
    content_id: str


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    processing_time: float


class EmbeddingEngine:
    def __init__(self):
        self.supported_models = [
            "text-embedding-ada-002",
            "text-embedding-3-small",
            "text-embedding-3-large"
        ]
        
        self.embedding_dimensions = {
            "text-embedding-ada-002": 1536,
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072
        }
        
        # Simulated vector database
        self.vector_store = {}
        self.metadata_store = {}

    async def create_embedding(self, request: EmbeddingRequest) -> EmbeddingResponse:
        """Create embedding for a single text"""
        start_time = datetime.now()
        
        # In a real implementation, this would use:
        # - OpenAI Embeddings API
        # - Sentence Transformers
        # - Hugging Face models
        # - Local embedding models
        
        # Simulated embedding generation
        dimensions = self.embedding_dimensions.get(request.model, 1536)
        embedding = np.random.rand(dimensions).tolist()
        
        # Store in simulated database
        embedding_id = f"emb_{len(self.vector_store)}"
        self.vector_store[embedding_id] = embedding
        self.metadata_store[embedding_id] = request.metadata or {}
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return EmbeddingResponse(
            embedding=embedding,
            dimensions=dimensions,
            model=request.model,
            processing_time=processing_time
        )

    async def create_batch_embeddings(self, request: BatchEmbeddingRequest) -> List[EmbeddingResponse]:
        """Create embeddings for multiple texts"""
        embeddings = []
        
        for i, text in enumerate(request.texts):
            metadata = None
            if request.metadata and i < len(request.metadata):
                metadata = request.metadata[i]
            
            embedding_request = EmbeddingRequest(
                text=text,
                model=request.model,
                metadata=metadata
            )
            
            embedding = await self.create_embedding(embedding_request)
            embeddings.append(embedding)
        
        return embeddings

    async def search_similar(self, request: SearchRequest) -> SearchResponse:
        """Search for similar content using semantic search"""
        start_time = datetime.now()
        
        # Create embedding for query
        query_embedding_request = EmbeddingRequest(text=request.query)
        query_response = await self.create_embedding(query_embedding_request)
        query_embedding = np.array(query_response.embedding)
        
        # Calculate similarities
        results = []
        for content_id, embedding in self.vector_store.items():
            stored_embedding = np.array(embedding)
            
            # Calculate cosine similarity
            similarity = np.dot(query_embedding, stored_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(stored_embedding)
            )
            
            if similarity >= request.threshold:
                # Apply filters if provided
                if request.filters:
                    metadata = self.metadata_store.get(content_id, {})
                    if not self._apply_filters(metadata, request.filters):
                        continue
                
                result = SearchResult(
                    content=f"Content for {content_id}",  # Simulated content
                    similarity_score=float(similarity),
                    metadata=self.metadata_store.get(content_id, {}),
                    content_id=content_id
                )
                results.append(result)
        
        # Sort by similarity score
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        
        # Return top_k results
        results = results[:request.top_k]
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return SearchResponse(
            query=request.query,
            results=results,
            total_results=len(results),
            processing_time=processing_time
        )

    def _apply_filters(self, metadata: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        """Apply filters to search results"""
        for key, value in filters.items():
            if key not in metadata:
                return False
            if isinstance(value, list):
                if metadata[key] not in value:
                    return False
            elif metadata[key] != value:
                return False
        return True

    async def index_repository(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Index a repository for semantic search"""
        # Simulated repository indexing
        files = repo_data.get("files", [])
        indexed_count = 0
        
        for file_data in files:
            content = file_data.get("content", "")
            file_path = file_data.get("path", "")
            
            if content.strip():
                # Create embedding for file content
                embedding_request = EmbeddingRequest(
                    text=content,
                    metadata={
                        "file_path": file_path,
                        "language": file_data.get("language", "unknown"),
                        "repo_id": repo_data.get("repo_id"),
                        "type": "file_content"
                    }
                )
                
                await self.create_embedding(embedding_request)
                indexed_count += 1
        
        return {
            "repo_id": repo_data.get("repo_id"),
            "indexed_files": indexed_count,
            "total_files": len(files)
        }

    async def update_embedding(self, content_id: str, text: str, metadata: Dict[str, Any] = None) -> bool:
        """Update an existing embedding"""
        if content_id not in self.vector_store:
            return False
        
        # Create new embedding
        embedding_request = EmbeddingRequest(text=text, metadata=metadata)
        response = await self.create_embedding(embedding_request)
        
        # Update stored embedding
        self.vector_store[content_id] = response.embedding
        if metadata:
            self.metadata_store[content_id] = metadata
        
        return True

    async def delete_embedding(self, content_id: str) -> bool:
        """Delete an embedding"""
        if content_id not in self.vector_store:
            return False
        
        del self.vector_store[content_id]
        if content_id in self.metadata_store:
            del self.metadata_store[content_id]
        
        return True

    async def get_embedding_stats(self) -> Dict[str, Any]:
        """Get statistics about the embedding store"""
        return {
            "total_embeddings": len(self.vector_store),
            "storage_size_mb": len(self.vector_store) * 1536 * 4 / (1024 * 1024),  # Rough estimate
            "models_used": list(self.embedding_dimensions.keys()),
            "last_updated": datetime.now().isoformat()
        }


embedding_engine = EmbeddingEngine()


@app.post("/create-embedding", response_model=EmbeddingResponse)
async def create_embedding(request: EmbeddingRequest):
    """Create embedding for text"""
    return await embedding_engine.create_embedding(request)


@app.post("/create-batch-embeddings", response_model=List[EmbeddingResponse])
async def create_batch_embeddings(request: BatchEmbeddingRequest):
    """Create embeddings for multiple texts"""
    return await embedding_engine.create_batch_embeddings(request)


@app.post("/search", response_model=SearchResponse)
async def search_similar(request: SearchRequest):
    """Search for similar content"""
    return await embedding_engine.search_similar(request)


@app.post("/index-repository")
async def index_repository(repo_data: Dict[str, Any]):
    """Index a repository"""
    return await embedding_engine.index_repository(repo_data)


@app.put("/update-embedding/{content_id}")
async def update_embedding(content_id: str, text: str, metadata: Dict[str, Any] = None):
    """Update an existing embedding"""
    success = await embedding_engine.update_embedding(content_id, text, metadata)
    return {"success": success, "content_id": content_id}


@app.delete("/delete-embedding/{content_id}")
async def delete_embedding(content_id: str):
    """Delete an embedding"""
    success = await embedding_engine.delete_embedding(content_id)
    return {"success": success, "content_id": content_id}


@app.get("/stats")
async def get_embedding_stats():
    """Get embedding statistics"""
    return await embedding_engine.get_embedding_stats()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
