from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from database.connection import get_db
from apps.api.models.user import User
from services.billing_service import get_billing_service, SUBSCRIPTION_PLANS
from services.usage_tracker import UsageTracker
from routes.auth import get_current_user

router = APIRouter()


# Pydantic models
class CreateSubscriptionRequest(BaseModel):
    plan_type: str = Field(..., regex="^(free|pro|team)$")


class UpdateSubscriptionRequest(BaseModel):
    plan_type: str = Field(..., regex="^(free|pro|team)$")


class CancelSubscriptionRequest(BaseModel):
    at_period_end: bool = True


class UsageResponse(BaseModel):
    plan: str
    plan_name: str
    features: List[str]
    usage: Dict[str, int]
    limits: Dict[str, Any]
    percentages: Dict[str, float]
    subscription: Dict[str, Any]


class PlanInfo(BaseModel):
    plan_type: str
    name: str
    description: str
    features: List[str]
    limits: Dict[str, Any]
    price_id: str | None


# Routes
@router.post("/create-customer", response_model=Dict[str, Any])
async def create_stripe_customer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe customer for the current user"""
    try:
        billing_service = get_billing_service(db)
        customer_id = await billing_service.get_or_create_customer(current_user)
        
        if not customer_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create Stripe customer"
            )
        
        return {"customer_id": customer_id}
    except Exception as e:
        logger.error(f"Error creating Stripe customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/create-subscription", response_model=Dict[str, Any])
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription"""
    try:
        billing_service = get_billing_service(db)
        result = await billing_service.create_subscription(current_user, request.plan_type)
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/update-subscription", response_model=Dict[str, Any])
async def update_subscription(
    request: UpdateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing subscription"""
    try:
        billing_service = get_billing_service(db)
        result = await billing_service.update_subscription(current_user, request.plan_type)
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/cancel-subscription", response_model=Dict[str, Any])
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a subscription"""
    try:
        billing_service = get_billing_service(db)
        result = await billing_service.cancel_subscription(
            current_user, 
            request.at_period_end
        )
        
        return result
    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/subscription", response_model=Dict[str, Any])
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current subscription information"""
    try:
        billing_service = get_billing_service(db)
        subscription = await billing_service.get_subscription(current_user)
        
        if not subscription:
            # Create free subscription if none exists
            subscription = await billing_service.create_subscription(current_user, "free")
        
        return {
            "subscription": subscription,
            "plan_config": SUBSCRIPTION_PLANS.get(subscription.plan_type, {})
        }
    except Exception as e:
        logger.error(f"Error getting subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/usage", response_model=UsageResponse)
async def get_usage_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current usage statistics"""
    try:
        billing_service = get_billing_service(db)
        usage_stats = await billing_service.get_usage_stats(current_user)
        
        # Get detailed usage summary
        usage_tracker = UsageTracker(db)
        usage_summary = await usage_tracker.get_usage_summary(current_user.id)
        
        return UsageResponse(**usage_summary)
    except Exception as e:
        logger.error(f"Error getting usage stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/usage-history", response_model=List[Dict[str, Any]])
async def get_usage_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage history for the last N days"""
    try:
        usage_tracker = UsageTracker(db)
        history = await usage_tracker.get_usage_history(current_user.id, days)
        
        return history
    except Exception as e:
        logger.error(f"Error getting usage history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/plans", response_model=List[PlanInfo])
async def get_available_plans():
    """Get all available subscription plans"""
    try:
        plans = []
        for plan_type, config in SUBSCRIPTION_PLANS.items():
            plans.append(PlanInfo(
                plan_type=plan_type,
                name=config["name"],
                description=config["description"],
                features=config["features"],
                limits=config["limits"],
                price_id=config["price_id"]
            ))
        
        return plans
    except Exception as e:
        logger.error(f"Error getting plans: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/billing-portal", response_model=Dict[str, str])
async def create_billing_portal_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe Billing Portal session"""
    try:
        billing_service = get_billing_service(db)
        portal_url = await billing_service.create_billing_portal_session(current_user)
        
        return {"portal_url": portal_url}
    except Exception as e:
        logger.error(f"Error creating billing portal session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/check-usage", response_model=Dict[str, Any])
async def check_feature_usage(
    feature: str,
    count: int = 1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user can use a feature based on their plan limits"""
    try:
        usage_tracker = UsageTracker(db)
        check_result = await usage_tracker.check_usage_limits(
            current_user.id, 
            feature, 
            count
        )
        
        return check_result
    except Exception as e:
        logger.error(f"Error checking usage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/invoices", response_model=List[Dict[str, Any]])
async def get_billing_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get billing invoices for the current user"""
    try:
        from apps.api.models.billing import BillingInvoice
        
        invoices = db.query(BillingInvoice).filter(
            BillingInvoice.user_id == current_user.id
        ).order_by(BillingInvoice.created_at.desc()).all()
        
        return [
            {
                "id": invoice.id,
                "stripe_invoice_id": invoice.stripe_invoice_id,
                "amount": float(invoice.amount),
                "currency": invoice.currency,
                "status": invoice.status,
                "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
                "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
                "hosted_invoice_url": invoice.hosted_invoice_url,
                "invoice_pdf": invoice.invoice_pdf,
                "created_at": invoice.created_at.isoformat()
            }
            for invoice in invoices
        ]
    except Exception as e:
        logger.error(f"Error getting invoices: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/track-usage", response_model=Dict[str, str])
async def track_usage(
    feature: str,
    count: int = 1,
    metadata: Dict[str, Any] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track usage for a feature (internal API)"""
    try:
        usage_tracker = UsageTracker(db)
        success = await usage_tracker.track_usage(
            current_user.id, 
            feature, 
            count, 
            metadata
        )
        
        if success:
            return {"status": "success", "message": "Usage tracked successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to track usage"
            )
    except Exception as e:
        logger.error(f"Error tracking usage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
