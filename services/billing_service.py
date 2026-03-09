import stripe
import os
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from database.connection import get_db
from apps.api.models.billing import Subscription, BillingInvoice
from apps.api.models.user import User
from utils.logger import logger

# Initialize Stripe with secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Subscription plans configuration
SUBSCRIPTION_PLANS = {
    "free": {
        "price_id": None,  # Free plan doesn't have a Stripe price
        "name": "Free Plan",
        "description": "Limited AI usage, 1 repository",
        "features": [
            "100 AI requests per month",
            "1 repository",
            "Basic AI agents",
            "Community support"
        ],
        "limits": {
            "ai_requests": 100,
            "repositories": 1,
            "ai_tokens": 10000,
            "agent_executions": 50
        }
    },
    "pro": {
        "price_id": os.getenv("STRIPE_PRO_PRICE_ID"),
        "name": "Pro Plan",
        "description": "Unlimited repositories, advanced AI agents",
        "features": [
            "Unlimited AI requests",
            "Unlimited repositories",
            "Advanced AI agents",
            "Priority processing",
            "Email support"
        ],
        "limits": {
            "ai_requests": float('inf'),
            "repositories": float('inf'),
            "ai_tokens": float('inf'),
            "agent_executions": float('inf')
        }
    },
    "team": {
        "price_id": os.getenv("STRIPE_TEAM_PRICE_ID"),
        "name": "Team Plan",
        "description": "Multiple users, team collaboration",
        "features": [
            "Everything in Pro",
            "Up to 10 team members",
            "Team collaboration",
            "Enterprise features",
            "Priority support"
        ],
        "limits": {
            "ai_requests": float('inf'),
            "repositories": float('inf'),
            "ai_tokens": float('inf'),
            "agent_executions": float('inf'),
            "team_members": 10
        }
    }
}


class BillingService:
    """Service for handling Stripe billing operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_stripe_customer(self, user: User) -> Optional[str]:
        """Create a Stripe customer for a user"""
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={"user_id": str(user.id)}
            )
            logger.info(f"Created Stripe customer {customer.id} for user {user.id}")
            return customer.id
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create Stripe customer for user {user.id}: {str(e)}")
            return None
    
    async def get_or_create_customer(self, user: User) -> Optional[str]:
        """Get existing Stripe customer or create new one"""
        # Check if user already has a Stripe customer ID
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()
        
        if subscription and subscription.stripe_customer_id:
            return subscription.stripe_customer_id
        
        # Create new customer
        customer_id = await self.create_stripe_customer(user)
        if customer_id:
            # Update subscription with customer ID
            if not subscription:
                subscription = Subscription(
                    user_id=user.id,
                    plan_type="free",
                    stripe_customer_id=customer_id
                )
                self.db.add(subscription)
            else:
                subscription.stripe_customer_id = customer_id
            self.db.commit()
        
        return customer_id
    
    async def create_subscription(self, user: User, plan_type: str) -> Dict[str, Any]:
        """Create a Stripe subscription for a user"""
        if plan_type not in SUBSCRIPTION_PLANS:
            raise ValueError(f"Invalid plan type: {plan_type}")
        
        if plan_type == "free":
            # For free plan, just update the subscription
            subscription = self.db.query(Subscription).filter(
                Subscription.user_id == user.id
            ).first()
            
            if not subscription:
                subscription = Subscription(
                    user_id=user.id,
                    plan_type="free",
                    status="active"
                )
                self.db.add(subscription)
            else:
                subscription.plan_type = "free"
                subscription.status = "active"
                subscription.stripe_subscription_id = None
                subscription.current_period_start = None
                subscription.current_period_end = None
            
            self.db.commit()
            return {"success": True, "subscription": subscription}
        
        # Get price ID for the plan
        plan_config = SUBSCRIPTION_PLANS[plan_type]
        price_id = plan_config["price_id"]
        
        if not price_id:
            raise ValueError(f"No price ID configured for plan: {plan_type}")
        
        # Get or create Stripe customer
        customer_id = await self.get_or_create_customer(user)
        if not customer_id:
            raise Exception("Failed to create or get Stripe customer")
        
        try:
            # Create Stripe subscription
            stripe_subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": price_id}],
                payment_behavior="default_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"]
            )
            
            # Update database subscription
            subscription = self.db.query(Subscription).filter(
                Subscription.user_id == user.id
            ).first()
            
            if not subscription:
                subscription = Subscription(
                    user_id=user.id,
                    plan_type=plan_type,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=stripe_subscription.id,
                    status=stripe_subscription.status,
                    current_period_start=datetime.fromtimestamp(
                        stripe_subscription.current_period_start, tz=timezone.utc
                    ),
                    current_period_end=datetime.fromtimestamp(
                        stripe_subscription.current_period_end, tz=timezone.utc
                    )
                )
                self.db.add(subscription)
            else:
                subscription.plan_type = plan_type
                subscription.stripe_subscription_id = stripe_subscription.id
                subscription.status = stripe_subscription.status
                subscription.current_period_start = datetime.fromtimestamp(
                    stripe_subscription.current_period_start, tz=timezone.utc
                )
                subscription.current_period_end = datetime.fromtimestamp(
                    stripe_subscription.current_period_end, tz=timezone.utc
                )
            
            self.db.commit()
            
            return {
                "success": True,
                "subscription": subscription,
                "client_secret": stripe_subscription.latest_invoice.payment_intent.client_secret
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create Stripe subscription for user {user.id}: {str(e)}")
            raise Exception(f"Failed to create subscription: {str(e)}")
    
    async def cancel_subscription(self, user: User, at_period_end: bool = True) -> Dict[str, Any]:
        """Cancel a user's subscription"""
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()
        
        if not subscription or not subscription.stripe_subscription_id:
            raise Exception("No active subscription found")
        
        try:
            # Cancel in Stripe
            stripe_subscription = stripe.Subscription.retrieve(
                subscription.stripe_subscription_id
            )
            
            if at_period_end:
                stripe_subscription.delete(at_period_end=True)
                subscription.cancel_at_period_end = True
            else:
                stripe_subscription.delete()
                subscription.status = "canceled"
                subscription.plan_type = "free"
                subscription.cancel_at_period_end = False
            
            self.db.commit()
            
            return {
                "success": True,
                "subscription": subscription,
                "canceled_at_period_end": at_period_end
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to cancel Stripe subscription for user {user.id}: {str(e)}")
            raise Exception(f"Failed to cancel subscription: {str(e)}")
    
    async def update_subscription(self, user: User, new_plan: str) -> Dict[str, Any]:
        """Update a user's subscription to a new plan"""
        if new_plan not in SUBSCRIPTION_PLANS:
            raise ValueError(f"Invalid plan type: {new_plan}")
        
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()
        
        if new_plan == "free":
            return await self.cancel_subscription(user, at_period_end=False)
        
        if not subscription or not subscription.stripe_subscription_id:
            # Create new subscription
            return await self.create_subscription(user, new_plan)
        
        try:
            # Get price ID for new plan
            price_id = SUBSCRIPTION_PLANS[new_plan]["price_id"]
            if not price_id:
                raise ValueError(f"No price ID configured for plan: {new_plan}")
            
            # Update in Stripe
            stripe_subscription = stripe.Subscription.retrieve(
                subscription.stripe_subscription_id
            )
            
            # Update subscription item
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{"id": stripe_subscription["items"]["data"][0].id, "price": price_id}]
            )
            
            # Update database
            subscription.plan_type = new_plan
            subscription.cancel_at_period_end = False
            self.db.commit()
            
            return {
                "success": True,
                "subscription": subscription
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to update Stripe subscription for user {user.id}: {str(e)}")
            raise Exception(f"Failed to update subscription: {str(e)}")
    
    async def get_subscription(self, user: User) -> Optional[Subscription]:
        """Get a user's subscription"""
        return self.db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).first()
    
    async def sync_subscription_from_stripe(self, stripe_subscription_id: str) -> Optional[Subscription]:
        """Sync subscription data from Stripe"""
        try:
            stripe_subscription = stripe.Subscription.retrieve(stripe_subscription_id)
            
            # Find subscription in database
            subscription = self.db.query(Subscription).filter(
                Subscription.stripe_subscription_id == stripe_subscription_id
            ).first()
            
            if subscription:
                subscription.status = stripe_subscription.status
                subscription.current_period_start = datetime.fromtimestamp(
                    stripe_subscription.current_period_start, tz=timezone.utc
                )
                subscription.current_period_end = datetime.fromtimestamp(
                    stripe_subscription.current_period_end, tz=timezone.utc
                )
                subscription.cancel_at_period_end = stripe_subscription.cancel_at_period_end
                self.db.commit()
            
            return subscription
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to sync subscription {stripe_subscription_id}: {str(e)}")
            return None
    
    async def create_billing_portal_session(self, user: User) -> str:
        """Create a Stripe Billing Portal session"""
        subscription = await self.get_subscription(user)
        if not subscription or not subscription.stripe_customer_id:
            raise Exception("No active subscription found")
        
        try:
            session = stripe.billing_portal.Session.create(
                customer=subscription.stripe_customer_id,
                return_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + "/dashboard/billing"
            )
            return session.url
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create billing portal session: {str(e)}")
            raise Exception(f"Failed to create billing portal session: {str(e)}")
    
    async def get_usage_stats(self, user: User) -> Dict[str, Any]:
        """Get usage statistics for a user"""
        from services.usage_tracker import UsageTracker
        
        usage_tracker = UsageTracker(self.db)
        current_usage = await usage_tracker.get_current_usage(user.id)
        plan_limits = SUBSCRIPTION_PLANS.get(current_usage.get("plan", "free"), {}).get("limits", {})
        
        return {
            "current_usage": current_usage,
            "plan_limits": plan_limits,
            "usage_percentages": {
                feature: min(
                    (current_usage.get(feature, 0) / limit * 100) if limit != float('inf') else 0,
                    100
                )
                for feature, limit in plan_limits.items()
            }
        }


def get_billing_service(db: Session) -> BillingService:
    """Get billing service instance"""
    return BillingService(db)
