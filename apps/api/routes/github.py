from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from models.user import Repo, Account
from models.github import PullRequest, CodeReview
from services.github_service import GitHubService
from services.code_review_service import CodeReviewService
from services.ai_agents import AgentOrchestrator
from routes.auth import get_current_user
from utils.logger import logger

router = APIRouter()

class ReviewRequest(BaseModel):
    repo_id: int
    pr_number: int

class IssueAnalysisRequest(BaseModel):
    repo_id: int
    issue_number: int
    title: str
    body: str

@router.get("/pull-requests/{repo_id}")
async def get_pull_requests(
    repo_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch PRs for a repo from GitHub and sync with DB"""
    repo = db.query(Repo).filter(Repo.id == repo_id, Repo.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repo not found")
    
    account = db.query(Account).filter(Account.user_id == current_user.id, Account.provider == "github").first()
    gh = GitHubService(account.access_token)
    
    owner = repo.repo_url.split("/")[-2]
    gh_prs = await gh.fetch_pull_requests(owner, repo.repo_name)
    
    # Sync with DB
    for pr_data in gh_prs:
        existing = db.query(PullRequest).filter(
            PullRequest.repo_id == repo_id, 
            PullRequest.pr_number == pr_data["number"]
        ).first()
        
        if not existing:
            new_pr = PullRequest(
                repo_id=repo_id,
                pr_number=pr_data["number"],
                title=pr_data["title"],
                description=pr_data["body"] or "",
                status=pr_data["state"]
            )
            db.add(new_pr)
    
    db.commit()
    return {"success": True, "pull_requests": gh_prs}

@router.post("/review-pr")
async def review_pull_request(
    request: ReviewRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Conduct an AI review on a PR"""
    repo = db.query(Repo).filter(Repo.id == request.repo_id, Repo.user_id == current_user.id).first()
    account = db.query(Account).filter(Account.user_id == current_user.id, Account.provider == "github").first()
    
    gh = GitHubService(account.access_token)
    owner = repo.repo_url.split("/")[-2]
    diff = await gh.get_pr_diff(owner, repo.repo_name, request.pr_number)
    
    if not diff:
        raise HTTPException(status_code=404, detail="Could not fetch PR diff")
    
    orchestrator = AgentOrchestrator()
    reviewer = CodeReviewService(orchestrator)
    review_content = await reviewer.conduct_ai_review(diff)
    
    # Save review in DB
    pr = db.query(PullRequest).filter(
        PullRequest.repo_id == request.repo_id, 
        PullRequest.pr_number == request.pr_number
    ).first()
    
    if pr:
        new_review = CodeReview(pr_id=pr.id, review_comment=review_content)
        db.add(new_review)
        db.commit()

    # Optional: Comment on GitHub
    await gh.comment_on_pull_request(owner, repo.repo_name, request.pr_number, f"### AI Code Review\n\n{review_content}")
    
    return {"success": True, "review": review_content}

@router.post("/analyze-issue")
async def analyze_github_issue(
    request: IssueAnalysisRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a GitHub issue and suggest fixes"""
    try:
        orchestrator = AgentOrchestrator()
        task = f"Analyze this GitHub issue for repo {request.repo_id}. Title: {request.title}. Body: {request.body}. Suggest possible causes and fixes."
        result = await orchestrator.orchestrate_agents(task, {"repo_id": request.repo_id})
        return {"success": True, "analysis": result.get("result", "")}
    except Exception as e:
        logger.error(f"Issue analysis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze issue")
