from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional
from functools import wraps

from database.connection import get_db
from apps.api.models.user import User
from services.usage_tracker import UsageTracker
from services.billing_service import SUBSCRIPTION_PLANS
from utils.logger import logger


def require_subscription(required_plan: str = "free", feature: Optional[str] = None):
    """
    Decorator to require a specific subscription plan or feature access
    
    Args:
        required_plan: Minimum plan required ('free', 'pro', 'team')
        feature: Specific feature to check access for
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user and db from kwargs
            user = kwargs.get('current_user')
            db = kwargs.get('db')
            
            if not user or not db:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check subscription
            try:
                usage_tracker = UsageTracker(db)
                
                # Get user's subscription
                subscription = db.query(Subscription).filter(
                    Subscription.user_id == user.id
                ).first()
                
                if not subscription:
                    # Create free subscription if none exists
                    from services.billing_service import get_billing_service
                    billing_service = get_billing_service(db)
                    subscription = await billing_service.create_subscription(user, "free")
                
                user_plan = subscription.plan_type
                
                # Check plan hierarchy
                plan_hierarchy = {"free": 0, "pro": 1, "team": 2}
                user_level = plan_hierarchy.get(user_plan, 0)
                required_level = plan_hierarchy.get(required_plan, 0)
                
                if user_level < required_level:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"This feature requires a {required_plan} plan or higher. Current plan: {user_plan}"
                    )
                
                # Check specific feature usage if specified
                if feature:
                    can_use = await usage_tracker.can_use_feature(user.id, feature)
                    if not can_use:
                        # Get usage details for error message
                        usage_check = await usage_tracker.check_usage_limits(user.id, feature)
                        raise HTTPException(
                            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail=f"Feature limit exceeded. Current usage: {usage_check['current']}, Limit: {usage_check['limit']}"
                        )
                
                return await func(*args, **kwargs)
                
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error in subscription middleware: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error checking subscription"
                )
        
        return wrapper
    return decorator


def check_feature_access(feature: str, count: int = 1):
    """
    Dependency function to check if user can access a feature
    
    Args:
        feature: Feature name to check
        count: Number of usage units required
    """
    async def check_access(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        try:
            usage_tracker = UsageTracker(db)
            can_use = await usage_tracker.can_use_feature(current_user.id, feature, count)
            
            if not can_use:
                # Get usage details for error message
                usage_check = await usage_tracker.check_usage_limits(current_user.id, feature, count)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Feature limit exceeded",
                        "feature": feature,
                        "current_usage": usage_check['current'],
                        "limit": usage_check['limit'],
                        "remaining": usage_check['remaining'],
                        "plan": usage_check['plan']
                    }
                )
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error checking feature access: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error checking feature access"
            )
    
    return check_access


def require_pro_plan():
    """Require Pro plan or higher"""
    return Depends(check_feature_access("pro_features", 1))


def require_team_plan():
    """Require Team plan"""
    return Depends(check_feature_access("team_features", 1))


def track_api_usage(feature: str, count: int = 1):
    """
    Dependency function to track API usage
    
    Args:
        feature: Feature name to track
        count: Number of usage units to track
    """
    async def track_usage(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        try:
            usage_tracker = UsageTracker(db)
            await usage_tracker.track_usage(current_user.id, feature, count)
            return True
            
        except Exception as e:
            logger.error(f"Error tracking API usage: {str(e)}")
            # Don't fail the request if tracking fails
            return True
    
    return track_usage


# Feature-specific dependencies
def check_ai_requests(count: int = 1):
    """Check AI request limits"""
    return check_feature_access("ai_requests", count)


def check_ai_tokens(count: int = 1):
    """Check AI token limits"""
    return check_feature_access("ai_tokens", count)


def check_repo_scans(count: int = 1):
    """Check repository scan limits"""
    return check_feature_access("repo_scans", count)


def check_agent_executions(count: int = 1):
    """Check agent execution limits"""
    return check_feature_access("agent_executions", count)


# Usage tracking dependencies
def track_ai_request():
    """Track an AI request"""
    return track_api_usage("ai_requests", 1)


def track_ai_tokens(count: int = 1):
    """Track AI token usage"""
    return track_api_usage("ai_tokens", count)


def track_repo_scan():
    """Track a repository scan"""
    return track_api_usage("repo_scans", 1)


def track_agent_execution():
    """Track an agent execution"""
    return track_api_usage("agent_executions", 1)


# Middleware function for automatic usage tracking
async def auto_track_usage(user_id: int, feature: str, count: int = 1, metadata: dict = None):
    """Automatically track usage (called from API endpoints)"""
    from database.connection import get_db
    
    db = next(get_db())
    try:
        usage_tracker = UsageTracker(db)
        await usage_tracker.track_usage(user_id, feature, count, metadata)
    except Exception as e:
        logger.error(f"Error in auto usage tracking: {str(e)}")
    finally:
        db.close()


# Plan validation utilities
def is_plan_valid(plan_type: str) -> bool:
    """Check if plan type is valid"""
    return plan_type in SUBSCRIPTION_PLANS


def get_plan_limits(plan_type: str) -> dict:
    """Get limits for a specific plan"""
    return SUBSCRIPTION_PLANS.get(plan_type, {}).get("limits", {})


def can_upgrade_plan(current_plan: str, target_plan: str) -> bool:
    """Check if user can upgrade to target plan"""
    plan_hierarchy = {"free": 0, "pro": 1, "team": 2}
    current_level = plan_hierarchy.get(current_plan, 0)
    target_level = plan_hierarchy.get(target_plan, 0)
    
    return target_level > current_level


def can_downgrade_plan(current_plan: str, target_plan: str) -> bool:
    """Check if user can downgrade to target plan"""
    plan_hierarchy = {"free": 0, "pro": 1, "team": 2}
    current_level = plan_hierarchy.get(current_plan, 0)
    target_level = plan_hierarchy.get(target_plan, 0)
    
    return target_level < current_level


# Import Subscription model
from apps.api.models.billing import Subscription
