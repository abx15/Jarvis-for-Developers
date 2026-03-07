from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from services.analytics_service import AnalyticsService
from utils.logger import logger

router = APIRouter()

# Initialize service
analytics_service = AnalyticsService()


@router.get("/dashboard")
async def get_dashboard_analytics(db: Session = Depends(get_db)):
    """Get dashboard analytics"""
    try:
        analytics = await analytics_service.get_dashboard_data()
        return {"success": True, "analytics": analytics}
    except Exception as e:
        logger.error(f"Dashboard analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/productivity")
async def get_productivity_metrics(
    user_id: int = None,
    timeframe: str = "week",
    db: Session = Depends(get_db)
):
    """Get productivity metrics"""
    try:
        metrics = await analytics_service.get_productivity_metrics(user_id, timeframe)
        return {"success": True, "metrics": metrics}
    except Exception as e:
        logger.error(f"Productivity metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/code-insights")
async def get_code_insights(
    repo_id: int = None,
    db: Session = Depends(get_db)
):
    """Get code insights and patterns"""
    try:
        insights = await analytics_service.get_code_insights(repo_id)
        return {"success": True, "insights": insights}
    except Exception as e:
        logger.error(f"Code insights error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/track")
async def track_event(
    event_data: dict,
    db: Session = Depends(get_db)
):
    """Track development events"""
    try:
        await analytics_service.track_event(event_data)
        return {"success": True, "message": "Event tracked"}
    except Exception as e:
        logger.error(f"Event tracking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
