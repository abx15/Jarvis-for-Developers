import stripe
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import os

from apps.api.models.billing import Subscription, BillingInvoice
from apps.api.models.user import User
from config import settings
from utils.logger import logger

# Stripe API Key
stripe.api_key = settings.STRIPE_SECRET_KEY

# Subscription Plans Configuration
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free Plan",
        "description": "Essential features for individuals",
        "price_id": None,
        "features": [
            "1 Repository",
            "50 AI Requests/mo",
            "100k AI Tokens/mo",
            "5 Repo Scans/mo",
            "Community Support"
        ],
        "limits": {
            "repositories": 1,
            "ai_requests": 50,
            "ai_tokens": 100000,
            "repo_scans": 5,
            "agent_executions": 20
        }
    },
    "pro": {
        "name": "Pro Plan",
        "description": "Advanced tools for professional developers",
        "price_id": os.getenv("STRIPE_PRO_PRICE_ID", "price_pro_temp"),
        "features": [
            "Unlimited Repositories",
            "1,000 AI Requests/mo",
            "5M AI Tokens/mo",
            "100 Repo Scans/mo",
            "Priority AI Processing",
            "Advanced AI Agents"
        ],
        "limits": {
            "repositories": 100,
            "ai_requests": 1000,
            "ai_tokens": 5000000,
            "repo_scans": 100,
            "agent_executions": 500
        }
    },
    "team": {
        "name": "Team Plan",
        "description": "Collaboration and enterprise-grade features",
        "price_id": os.getenv("STRIPE_TEAM_PRICE_ID", "price_team_temp"),
        "features": [
            "Everything in Pro",
            "Multiple Team Members",
            "Team Collaboration Tools",
            "Enterprise-Grade Security",
            "Dedicated Support",
            "Custom AI Model Training"
        ],
        "limits": {
            "repositories": 1000,
            "ai_requests": 10000,
            "ai_tokens": 50000000,
            "repo_scans": 1000,
            "agent_executions": 5000
        }
    }
}

class BillingService:
    def __init__(self, db: Session):
        self.db = db

    async def get_or_create_customer(self, user: User) -> str:
        """
        Get existing Stripe customer ID or create a new one.
        """
        subscription = self.db.query(Subscription).filter(Subscription.user_id == user.id).first()
        
        if subscription and subscription.stripe_customer_id:
            return subscription.stripe_customer_id
        
        # Create new customer in Stripe
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={"user_id": user.id}
            )
            
            if not subscription:
                subscription = Subscription(
                    user_id=user.id,
                    stripe_customer_id=customer.id,
                    plan_type="free",
                    status="active"
                )
                self.db.add(subscription)
            else:
                subscription.stripe_customer_id = customer.id
            
            self.db.commit()
            return customer.id
        except Exception as e:
            logger.error(f"Error creating Stripe customer for user {user.id}: {str(e)}")
            self.db.rollback()
            return None

    async def create_subscription(self, user: User, plan_type: str) -> Dict[str, Any]:
        """
        Create a new subscription for a user.
        """
        if plan_type == "free":
            # Just ensure they have a free subscription record
            subscription = self.db.query(Subscription).filter(Subscription.user_id == user.id).first()
            if not subscription:
                subscription = Subscription(
                    user_id=user.id,
                    plan_type="free",
                    status="active"
                )
                self.db.add(subscription)
                self.db.commit()
            return {"status": "success", "plan": "free"}

        customer_id = await self.get_or_create_customer(user)
        plan_config = SUBSCRIPTION_PLANS.get(plan_type)
        
        if not plan_config or not plan_config["price_id"]:
            raise ValueError(f"Invalid plan type or missing price ID for {plan_type}")

        try:
            # Create Stripe Checkout Session
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": plan_config["price_id"],
                    "quantity": 1,
                }],
                mode="subscription",
                success_url=f"{settings.ALLOWED_HOSTS[0]}/dashboard/billing?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.ALLOWED_HOSTS[0]}/dashboard/billing",
                metadata={"user_id": user.id, "plan_type": plan_type}
            )
            
            return {
                "status": "success",
                "checkout_url": session.url,
                "session_id": session.id
            }
        except Exception as e:
            logger.error(f"Error creating subscription for user {user.id}: {str(e)}")
            raise

    async def update_subscription(self, user: User, new_plan_type: str) -> Dict[str, Any]:
        """
        Update an existing subscription.
        """
        subscription = self.db.query(Subscription).filter(Subscription.user_id == user.id).first()
        
        if not subscription or not subscription.stripe_subscription_id:
            # If no active Stripe subscription, treat as creating a new one
            return await self.create_subscription(user, new_plan_type)

        if new_plan_type == "free":
            return await self.cancel_subscription(user, at_period_end=True)

        plan_config = SUBSCRIPTION_PLANS.get(new_plan_type)
        if not plan_config or not plan_config["price_id"]:
            raise ValueError(f"Invalid plan type or missing price ID for {new_plan_type}")

        try:
            stripe_sub = stripe.Subscription.retrieve(subscription.stripe_subscription_id)
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=False,
                proration_behavior="always_invoice",
                items=[{
                    "id": stripe_sub["items"]["data"][0].id,
                    "price": plan_config["price_id"],
                }]
            )
            
            subscription.plan_type = new_plan_type
            self.db.commit()
            
            return {"status": "success", "plan": new_plan_type}
        except Exception as e:
            logger.error(f"Error updating subscription for user {user.id}: {str(e)}")
            raise

    async def cancel_subscription(self, user: User, at_period_end: bool = True) -> Dict[str, Any]:
        """
        Cancel a user's subscription.
        """
        subscription = self.db.query(Subscription).filter(Subscription.user_id == user.id).first()
        
        if not subscription or not subscription.stripe_subscription_id:
            return {"status": "error", "message": "No active subscription found"}

        try:
            if at_period_end:
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    cancel_at_period_end=True
                )
                subscription.cancel_at_period_end = True
            else:
                stripe.Subscription.delete(subscription.stripe_subscription_id)
                subscription.status = "canceled"
                subscription.plan_type = "free"
                subscription.stripe_subscription_id = None
                subscription.cancel_at_period_end = False
            
            self.db.commit()
            return {"status": "success", "canceled_at_period_end": at_period_end}
        except Exception as e:
            logger.error(f"Error canceling subscription for user {user.id}: {str(e)}")
            raise

    async def create_billing_portal_session(self, user: User) -> str:
        """
        Create a Stripe Billing Portal session.
        """
        customer_id = await self.get_or_create_customer(user)
        
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=f"{settings.ALLOWED_HOSTS[0]}/dashboard/billing"
            )
            return session.url
        except Exception as e:
            logger.error(f"Error creating billing portal session for user {user.id}: {str(e)}")
            raise

    async def sync_subscription_from_stripe(self, stripe_id: str) -> Optional[Subscription]:
        """
        Sync local subscription data with Stripe.
        """
        try:
            stripe_sub = stripe.Subscription.retrieve(stripe_id)
            subscription = self.db.query(Subscription).filter(
                Subscription.stripe_subscription_id == stripe_id
            ).first()
            
            if not subscription:
                # Try to find by customer ID if subscription ID is new
                subscription = self.db.query(Subscription).filter(
                    Subscription.stripe_customer_id == stripe_sub.customer
                ).first()
            
            if subscription:
                subscription.status = stripe_sub.status
                subscription.stripe_subscription_id = stripe_sub.id
                subscription.current_period_start = datetime.fromtimestamp(
                    stripe_sub.current_period_start, tz=timezone.utc
                )
                subscription.current_period_end = datetime.fromtimestamp(
                    stripe_sub.current_period_end, tz=timezone.utc
                )
                subscription.cancel_at_period_end = stripe_sub.cancel_at_period_end
                
                # Determine plan type from price ID
                price_id = stripe_sub["items"]["data"][0]["price"]["id"]
                for plan_type, config in SUBSCRIPTION_PLANS.items():
                    if config.get("price_id") == price_id:
                        subscription.plan_type = plan_type
                        break
                
                self.db.commit()
                return subscription
        except Exception as e:
            logger.error(f"Error syncing subscription {stripe_id}: {str(e)}")
        return None

    async def get_subscription(self, user: User) -> Optional[Subscription]:
        """
        Get current subscription for a user.
        """
        return self.db.query(Subscription).filter(Subscription.user_id == user.id).first()

    async def get_usage_stats(self, user: User) -> Dict[str, Any]:
        """
        Wrapper around UsageTracker to get user usage stats.
        """
        from apps.api.services.usage_tracker import UsageTracker
        tracker = UsageTracker(self.db)
        return await tracker.get_usage_summary(user.id)

def get_billing_service(db: Session) -> BillingService:
    return BillingService(db)
