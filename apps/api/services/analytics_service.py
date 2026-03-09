from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import redis
import json
from models.analytics import AnalyticsEvent, AIUsage, CommitStat
from models.user import Repo
from utils.logger import logger


class AnalyticsService:
    def __init__(self, db: Session, redis_client: Optional[redis.Redis] = None):
        self.db = db
        self.redis = redis_client
    
    async def track_event(self, user_id: int, event_type: str, event_data: Optional[Dict[str, Any]] = None) -> bool:
        """Track a developer activity event"""
        try:
            event = AnalyticsEvent(
                user_id=user_id,
                event_type=event_type,
                event_data=event_data
            )
            self.db.add(event)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error tracking event: {e}")
            self.db.rollback()
            return False

    async def log_ai_usage(self, user_id: int, action: str, tokens_used: int) -> bool:
        """Log AI usage (tokens, action type)"""
        try:
            usage = AIUsage(
                user_id=user_id,
                action=action,
                tokens_used=tokens_used
            )
            self.db.add(usage)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error logging AI usage: {e}")
            self.db.rollback()
            return False

    async def get_productivity_overview(self, user_id: int, days: int = 7) -> Dict[str, Any]:
        """Get productivity metrics overview for dashboard"""
        try:
            since = datetime.utcnow() - timedelta(days=days)
            
            # 1. Commit metrics
            repos = self.db.query(Repo).filter(Repo.user_id == user_id).all()
            repo_ids = [r.id for r in repos]
            
            commits = self.db.query(CommitStat).filter(
                CommitStat.repo_id.in_(repo_ids),
                CommitStat.date >= since.date()
            ).all()
            
            total_commits = sum(c.commit_count for c in commits)
            avg_commits = total_commits / days if days > 0 else 0

            # 2. AI usage stats
            ai_usage = self.db.query(AIUsage).filter(
                AIUsage.user_id == user_id,
                AIUsage.created_at >= since
            ).all()
            
            total_ai_actions = len(ai_usage)
            total_tokens = sum(u.tokens_used for u in ai_usage)

            # 3. Events / Productivity Score (heuristic)
            events = self.db.query(AnalyticsEvent).filter(
                AnalyticsEvent.user_id == user_id,
                AnalyticsEvent.created_at >= since
            ).all()

            # Mock trends and insights for now
            return {
                "productivity_score": 85, # 0-100
                "commit_stats": {
                    "total": total_commits,
                    "average_per_day": round(avg_commits, 1),
                    "history": [{"date": str(c.date), "count": c.commit_count} for c in commits]
                },
                "ai_stats": {
                    "actions": total_ai_actions,
                    "tokens": total_tokens,
                    "ai_generated_code_percentage": 35
                },
                "insights": [
                    f"You fixed 12 bugs this week.",
                    f"Your coding productivity increased by 20%.",
                    f"You used AI for 35% of code generation."
                ]
            }
        except Exception as e:
            logger.error(f"Error calculating productivity: {e}")
            return {"error": str(e)}

    async def get_repo_health(self, repo_id: int) -> Dict[str, Any]:
        """Calculate repo complexity and health metrics"""
        # Placeholder for complex analysis
        return {
            "complexity_score": "B+",
            "maintainability_index": 78,
            "bug_frequency": "Low",
            "active_development": True
        }
