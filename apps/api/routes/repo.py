from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
from database.connection import get_db
from models.user import Repo, Account
from services.repo_indexer import RepoIndexer
from services.embedding_service import EmbeddingService
from services.search_service import SearchService
from routes.auth import get_current_user
from utils.logger import logger

router = APIRouter()

# Pydantic schemas
class ConnectRepoRequest(BaseModel):
    owner: str
    repo_name: str
    description: str = ""

class SearchRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    query: str
    results: list
    answer: str

class UpdateFileRequest(BaseModel):
    file_path: str
    content: str

# Endpoints
@router.post("/connect")
async def connect_repository(
    request: ConnectRepoRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link a GitHub repository to the user's account"""
    try:
        # Check if user has linked GitHub
        account = db.query(Account).filter(Account.user_id == current_user.id, Account.provider == "github").first()
        if not account or not account.access_token:
            raise HTTPException(status_code=400, detail="Please connect your GitHub account first")

        # Create basic Repo record
        new_repo = Repo(
            user_id=current_user.id,
            repo_name=request.repo_name,
            repo_url=f"https://github.com/{request.owner}/{request.repo_name}",
            description=request.description
        )
        
        db.add(new_repo)
        db.commit()
        db.refresh(new_repo)
        
        return {"success": True, "repo": new_repo}
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Repository already connected")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Connect repo error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{repo_id}/index")
async def index_repository(
    repo_id: int,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start an async indexing job for the repository"""
    repo = db.query(Repo).filter(Repo.id == repo_id, Repo.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    account = db.query(Account).filter(Account.user_id == current_user.id, Account.provider == "github").first()
    if not account or not account.access_token:
        raise HTTPException(status_code=400, detail="Please connect your GitHub account first")

    # Parse owner from repo_url roughly
    owner = repo.repo_url.replace("https://github.com/", "").split("/")[0]
    
    # We would normally use Celery, but BackgroundTasks works well enough for smaller repos right now
    background_tasks.add_task(run_indexing_job, db, account.access_token, owner, repo.repo_name, repo_id)
    
    return {"success": True, "message": "Indexing job started in the background"}


async def run_indexing_job(db: Session, github_token: str, owner: str, repo_name: str, repo_id: int):
    """Background task to fetch files, chunk, and embed"""
    try:
        # 1. Chunk and add to DB
        indexer = RepoIndexer(db, github_token)
        await indexer.index_repository(owner, repo_name, repo_id)
        
        # 2. Add embeddings
        embedder = EmbeddingService(db)
        await embedder.generate_embeddings_for_repo(repo_id)
        
        logger.info(f"Successfully completed indexing job for repo {repo_id}")
    except Exception as e:
        logger.error(f"Failed indexing job for repo {repo_id}: {e}")


@router.get("/list")
async def list_repositories(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all repositories for the current user"""
    repos = db.query(Repo).filter(Repo.user_id == current_user.id).all()
    return {"success": True, "repositories": repos}


@router.get("/{repo_id}/files")
async def get_repository_files(
    repo_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all indexed files for a repository"""
    from models.repo_memory import File
    repo = db.query(Repo).filter(Repo.id == repo_id, Repo.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    files = db.query(File.id, File.file_path, File.language).filter(File.repo_id == repo_id).all()
    return {"success": True, "files": [{"id": f.id, "path": f.file_path, "language": f.language} for f in files]}


@router.post("/{repo_id}/search", response_model=ChatResponse)
async def search_repository(
    repo_id: int,
    request: SearchRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Semantic code search and AI logic explanation"""
    repo = db.query(Repo).filter(Repo.id == repo_id, Repo.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    try:
        searcher = SearchService(db)
        result = await searcher.search_repository(repo_id, request.query)
        return result
    except Exception as e:
        logger.error(f"Repository search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


@router.post("/{repo_id}/update-file")
async def update_repository_file(
    repo_id: int,
    request: UpdateFileRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save changes to a file in the repository (local DB update for now)"""
    from models.repo_memory import File
    repo = db.query(Repo).filter(Repo.id == repo_id, Repo.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    file_record = db.query(File).filter(File.repo_id == repo_id, File.file_path == request.file_path).first()
    if not file_record:
        # Create new file if it doesn't exist
        file_record = File(
            repo_id=repo_id,
            file_path=request.file_path,
            content=request.content,
            language=request.file_path.split('.')[-1] if '.' in request.file_path else "text"
        )
        db.add(file_record)
    else:
        file_record.content = request.content
        
    try:
        db.commit()
        return {"success": True, "message": f"File {request.file_path} saved successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Save file error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file")
