from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from apps.api.models.billing import UsageLogs, Subscription
from apps.api.models.user import User
from database.connection import get_db
from services.billing_service import SUBSCRIPTION_PLANS
from utils.logger import logger


class UsageTracker:
    """Service for tracking and managing feature usage"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def track_usage(self, user_id: int, feature: str, count: int = 1, metadata: Optional[Dict] = None) -> bool:
        """Track usage for a specific feature"""
        try:
            usage_log = UsageLogs(
                user_id=user_id,
                feature=feature,
                usage_count=count,
                metadata=metadata or {},
                timestamp=datetime.now(timezone.utc)
            )
            self.db.add(usage_log)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to track usage for user {user_id}, feature {feature}: {str(e)}")
            self.db.rollback()
            return False
    
    async def get_current_usage(self, user_id: int) -> Dict[str, Any]:
        """Get current usage for a user in the current billing period"""
        # Get user's subscription
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
        
        plan_type = subscription.plan_type if subscription else "free"
        
        # Calculate billing period start
        if subscription and subscription.current_period_start:
            period_start = subscription.current_period_start
        else:
            # Default to current month start for free plans
            now = datetime.now(timezone.utc)
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get usage for the current period
        usage_data = self.db.query(
            UsageLogs.feature,
            func.sum(UsageLogs.usage_count).label('total_usage')
        ).filter(
            and_(
                UsageLogs.user_id == user_id,
                UsageLogs.timestamp >= period_start
            )
        ).group_by(UsageLogs.feature).all()
        
        # Format usage data
        current_usage = {"plan": plan_type}
        for feature, total in usage_data:
            current_usage[feature] = int(total)
        
        # Add default values for features not used
        all_features = ["ai_requests", "ai_tokens", "repo_scans", "agent_executions"]
        for feature in all_features:
            if feature not in current_usage:
                current_usage[feature] = 0
        
        return current_usage
    
    async def get_usage_history(self, user_id: int, days: int = 30) -> List[Dict[str, Any]]:
        """Get usage history for the last N days"""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        usage_data = self.db.query(
            func.date(UsageLogs.timestamp).label('date'),
            UsageLogs.feature,
            func.sum(UsageLogs.usage_count).label('total_usage')
        ).filter(
            and_(
                UsageLogs.user_id == user_id,
                UsageLogs.timestamp >= start_date
            )
        ).group_by(
            func.date(UsageLogs.timestamp),
            UsageLogs.feature
        ).order_by('date').all()
        
        # Format into daily usage
        daily_usage = {}
        for date, feature, total in usage_data:
            date_str = date.isoformat()
            if date_str not in daily_usage:
                daily_usage[date_str] = {}
            daily_usage[date_str][feature] = int(total)
        
        # Convert to list format
        history = []
        for date, features in daily_usage.items():
            history.append({
                "date": date,
                "usage": features
            })
        
        return history
    
    async def check_usage_limits(self, user_id: int, feature: str, requested_count: int = 1) -> Dict[str, Any]:
        """Check if user has available usage for a feature"""
        # Get user's subscription
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
        
        plan_type = subscription.plan_type if subscription else "free"
        plan_config = SUBSCRIPTION_PLANS.get(plan_type, {})
        plan_limits = plan_config.get("limits", {})
        
        # Get current usage
        current_usage = await self.get_current_usage(user_id)
        current_count = current_usage.get(feature, 0)
        
        # Check limit
        limit = plan_limits.get(feature, float('inf'))
        
        if limit == float('inf'):
            return {
                "allowed": True,
                "remaining": float('inf'),
                "current": current_count,
                "limit": limit,
                "plan": plan_type
            }
        
        remaining = max(0, limit - current_count)
        allowed = remaining >= requested_count
        
        return {
            "allowed": allowed,
            "remaining": remaining,
            "current": current_count,
            "limit": limit,
            "plan": plan_type,
            "requested": requested_count
        }
    
    async def can_use_feature(self, user_id: int, feature: str, count: int = 1) -> bool:
        """Simple check if user can use a feature"""
        check_result = await self.check_usage_limits(user_id, feature, count)
        return check_result["allowed"]
    
    async def get_usage_summary(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive usage summary"""
        current_usage = await self.get_current_usage(user_id)
        plan_type = current_usage["plan"]
        plan_config = SUBSCRIPTION_PLANS.get(plan_type, {})
        plan_limits = plan_config.get("limits", {})
        
        # Calculate usage percentages
        usage_summary = {
            "plan": plan_type,
            "plan_name": plan_config.get("name", "Free Plan"),
            "features": plan_config.get("features", []),
            "usage": {},
            "limits": {},
            "percentages": {}
        }
        
        for feature, limit in plan_limits.items():
            current = current_usage.get(feature, 0)
            
            if limit == float('inf'):
                percentage = 0
                remaining = float('inf')
            else:
                percentage = min((current / limit) * 100, 100) if limit > 0 else 100
                remaining = max(0, limit - current)
            
            usage_summary["usage"][feature] = current
            usage_summary["limits"][feature] = limit
            usage_summary["percentages"][feature] = percentage
        
        # Add subscription info
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()
        
        if subscription:
            usage_summary["subscription"] = {
                "status": subscription.status,
                "current_period_start": subscription.current_period_start.isoformat() if subscription.current_period_start else None,
                "current_period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None,
                "cancel_at_period_end": subscription.cancel_at_period_end
            }
        
        return usage_summary
    
    async def get_team_usage(self, team_owner_id: int) -> Dict[str, Any]:
        """Get usage statistics for a team (team plan only)"""
        # This would require a team members table - for now, just return owner's usage
        return await self.get_usage_summary(team_owner_id)
    
    async def reset_usage(self, user_id: int, feature: Optional[str] = None) -> bool:
        """Reset usage tracking (for testing or admin purposes)"""
        try:
            query = self.db.query(UsageLogs).filter(UsageLogs.user_id == user_id)
            
            if feature:
                query = query.filter(UsageLogs.feature == feature)
            
            query.delete()
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to reset usage for user {user_id}: {str(e)}")
            self.db.rollback()
            return False
    
    async def get_feature_usage_stats(self, feature: str, days: int = 30) -> Dict[str, Any]:
        """Get usage statistics for a specific feature across all users"""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Total usage
        total_usage = self.db.query(
            func.sum(UsageLogs.usage_count)
        ).filter(
            and_(
                UsageLogs.feature == feature,
                UsageLogs.timestamp >= start_date
            )
        ).scalar() or 0
        
        # Unique users
        unique_users = self.db.query(
            func.count(func.distinct(UsageLogs.user_id))
        ).filter(
            and_(
                UsageLogs.feature == feature,
                UsageLogs.timestamp >= start_date
            )
        ).scalar() or 0
        
        # Daily breakdown
        daily_stats = self.db.query(
            func.date(UsageLogs.timestamp).label('date'),
            func.sum(UsageLogs.usage_count).label('total'),
            func.count(func.distinct(UsageLogs.user_id)).label('unique_users')
        ).filter(
            and_(
                UsageLogs.feature == feature,
                UsageLogs.timestamp >= start_date
            )
        ).group_by(func.date(UsageLogs.timestamp)).order_by('date').all()
        
        return {
            "feature": feature,
            "period_days": days,
            "total_usage": int(total_usage),
            "unique_users": int(unique_users),
            "daily_breakdown": [
                {
                    "date": date.isoformat(),
                    "total_usage": int(total),
                    "unique_users": int(unique_users)
                }
                for date, total, unique_users in daily_stats
            ]
        }


# Usage tracking middleware functions
async def track_ai_request(user_id: int, tokens_used: int = 0, metadata: Optional[Dict] = None):
    """Track an AI request"""
    db = next(get_db())
    try:
        tracker = UsageTracker(db)
        await tracker.track_usage(user_id, "ai_requests", 1, metadata)
        if tokens_used > 0:
            await tracker.track_usage(user_id, "ai_tokens", tokens_used, metadata)
    finally:
        db.close()


async def track_repo_scan(user_id: int, repo_url: str, metadata: Optional[Dict] = None):
    """Track a repository scan"""
    db = next(get_db())
    try:
        tracker = UsageTracker(db)
        scan_metadata = metadata or {}
        scan_metadata["repo_url"] = repo_url
        await tracker.track_usage(user_id, "repo_scans", 1, scan_metadata)
    finally:
        db.close()


async def track_agent_execution(user_id: int, agent_type: str, metadata: Optional[Dict] = None):
    """Track an agent execution"""
    db = next(get_db())
    try:
        tracker = UsageTracker(db)
        exec_metadata = metadata or {}
        exec_metadata["agent_type"] = agent_type
        await tracker.track_usage(user_id, "agent_executions", 1, exec_metadata)
    finally:
        db.close()
