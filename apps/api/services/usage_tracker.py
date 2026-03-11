from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional

from apps.api.models.billing import UsageLogs, Subscription
from apps.api.models.user import User
from utils.logger import logger

# Plan limits configuration
PLAN_LIMITS = {
    "free": {
        "ai_requests": 50,
        "ai_tokens": 100000,
        "repo_scans": 5,
        "agent_executions": 20,
        "repositories": 1
    },
    "pro": {
        "ai_requests": 1000,
        "ai_tokens": 5000000,
        "repo_scans": 100,
        "agent_executions": 500,
        "repositories": 100  # "Unlimted" is usually a high number or handled specially
    },
    "team": {
        "ai_requests": 10000,
        "ai_tokens": 50000000,
        "repo_scans": 1000,
        "agent_executions": 5000,
        "repositories": 1000
    }
}

class UsageTracker:
    def __init__(self, db: Session):
        self.db = db

    async def track_usage(self, user_id: int, feature: str, count: int = 1, metadata: Dict[str, Any] = None) -> bool:
        """
        Log usage of a feature by a user.
        """
        try:
            usage_log = UsageLogs(
                user_id=user_id,
                feature=feature,
                usage_count=count,
                metadata=metadata
            )
            self.db.add(usage_log)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error tracking usage for user {user_id}, feature {feature}: {str(e)}")
            self.db.rollback()
            return False

    async def check_usage_limits(self, user_id: int, feature: str, count: int = 1) -> Dict[str, Any]:
        """
        Check if a user has sufficient quota for a feature.
        """
        try:
            # Get user's current subscription
            subscription = self.db.query(Subscription).filter(Subscription.user_id == user_id).first()
            plan = subscription.plan_type if subscription else "free"
            
            # Special case for repositories count which might be checked differently
            if feature == "repositories":
                from apps.api.models.user import Repo
                current_usage = self.db.query(Repo).filter(Repo.user_id == user_id, Repo.is_active == True).count()
            else:
                # Calculate usage in the current billing cycle
                # For free users, we'll just check the last 30 days if no period is defined
                start_date = datetime.now(timezone.utc) - timedelta(days=30)
                if subscription and subscription.current_period_start:
                    start_date = subscription.current_period_start

                current_usage = self.db.query(func.sum(UsageLogs.usage_count)).filter(
                    and_(
                        UsageLogs.user_id == user_id,
                        UsageLogs.feature == feature,
                        UsageLogs.timestamp >= start_date
                    )
                ).scalar() or 0

            limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"]).get(feature, 0)
            
            # If limit is -1 or 0 (and not explicitly defined), assume unlimited or restricted
            allowed = (current_usage + count) <= limit if limit > 0 else (limit == -1)

            return {
                "allowed": allowed,
                "current_usage": current_usage,
                "limit": limit,
                "remaining": max(0, limit - current_usage) if limit > 0 else -1,
                "plan": plan
            }
        except Exception as e:
            logger.error(f"Error checking usage limits for user {user_id}, feature {feature}: {str(e)}")
            return {"allowed": False, "error": str(e)}

    async def get_usage_summary(self, user_id: int) -> Dict[str, Any]:
        """
        Get a summary of all usage metrics for the dashboard.
        """
        subscription = self.db.query(Subscription).filter(Subscription.user_id == user_id).first()
        plan = subscription.plan_type if subscription else "free"
        plan_limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        
        start_date = datetime.now(timezone.utc) - timedelta(days=30)
        if subscription and subscription.current_period_start:
            start_date = subscription.current_period_start

        # Features to track
        features = ["ai_requests", "ai_tokens", "repo_scans", "agent_executions"]
        usage_data = {}
        percentages = {}
        
        for feature in features:
            usage = self.db.query(func.sum(UsageLogs.usage_count)).filter(
                and_(
                    UsageLogs.user_id == user_id,
                    UsageLogs.feature == feature,
                    UsageLogs.timestamp >= start_date
                )
            ).scalar() or 0
            
            usage_data[feature] = usage
            limit = plan_limits.get(feature, 0)
            percentages[feature] = (usage / limit * 100) if limit > 0 else 0

        return {
            "plan": plan,
            "plan_name": plan.capitalize(),
            "features": features,
            "usage": usage_data,
            "limits": plan_limits,
            "percentages": percentages,
            "subscription": {
                "status": subscription.status if subscription else "active",
                "current_period_end": subscription.current_period_end.isoformat() if subscription and subscription.current_period_end else None,
                "cancel_at_period_end": subscription.cancel_at_period_end if subscription else False
            }
        }

    async def get_usage_history(self, user_id: int, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get daily usage history for the last N days.
        """
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Group by day and feature
        history_query = self.db.query(
            func.date(UsageLogs.timestamp).label("date"),
            UsageLogs.feature,
            func.sum(UsageLogs.usage_count).label("count")
        ).filter(
            and_(
                UsageLogs.user_id == user_id,
                UsageLogs.timestamp >= start_date
            )
        ).group_by("date", UsageLogs.feature).all()
        
        # Format history data
        history = []
        date_map = {}
        
        for row in history_query:
            date_str = str(row.date)
            if date_str not in date_map:
                date_map[date_str] = {"date": date_str}
            date_map[date_str][row.feature] = row.count
            
        return sorted(list(date_map.values()), key=lambda x: x["date"])
