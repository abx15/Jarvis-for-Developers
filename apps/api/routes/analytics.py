from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from services.analytics_service import AnalyticsService
from routes.auth import get_current_user
from utils.logger import logger
import redis

router = APIRouter()

# Redis connection
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)


@router.get("/overview")
async def get_analytics_overview(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall productivity and AI usage metrics"""
    try:
        analytics_service = AnalyticsService(db, redis_client)
        return await analytics_service.get_productivity_overview(current_user.id)
    except Exception as e:
        logger.error(f"Overview analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/repo-health/{repo_id}")
async def get_repo_health(
    repo_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get health and complexity metrics for a specific repo"""
    try:
        analytics_service = AnalyticsService(db, redis_client)
        return await analytics_service.get_repo_health(repo_id)
    except Exception as e:
        logger.error(f"Repo health error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/track")
async def track_event(
    event_data: dict,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track development events manually from frontend"""
    try:
        analytics_service = AnalyticsService(db, redis_client)
        event_type = event_data.get("event_type", "UI_INTERACTION")
        success = await analytics_service.track_event(current_user.id, event_type, event_data)
        return {"success": success}
    except Exception as e:
        logger.error(f"Event tracking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
