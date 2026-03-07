from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.connection import get_db
from services.repo_indexer import RepoIndexer
from services.embedding_service import EmbeddingService
from utils.logger import logger

router = APIRouter()

# Initialize services
repo_indexer = RepoIndexer()
embedding_service = EmbeddingService()


@router.post("/upload")
async def upload_repository(
    file: UploadFile = File(...),
    repo_name: str = "",
    db: Session = Depends(get_db)
):
    """Upload and analyze a repository"""
    try:
        # Save uploaded file
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Index repository
        result = await repo_indexer.index_repository(file_path, repo_name)
        
        # Generate embeddings
        await embedding_service.process_repository(result["repo_id"])
        
        return {"success": True, "repository": result}
    except Exception as e:
        logger.error(f"Repository upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_repositories(db: Session = Depends(get_db)):
    """List all repositories"""
    try:
        repos = await repo_indexer.list_repositories()
        return {"success": True, "repositories": repos}
    except Exception as e:
        logger.error(f"List repositories error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{repo_id}")
async def get_repository(
    repo_id: int,
    db: Session = Depends(get_db)
):
    """Get repository details"""
    try:
        repo = await repo_indexer.get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
        return {"success": True, "repository": repo}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get repository error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{repo_id}/search")
async def search_repository(
    repo_id: int,
    query: str,
    db: Session = Depends(get_db)
):
    """Search within repository using semantic search"""
    try:
        results = await embedding_service.search_repository(repo_id, query)
        return {"success": True, "results": results}
    except Exception as e:
        logger.error(f"Repository search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
