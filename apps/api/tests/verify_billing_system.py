import asyncio
import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.connection import SessionLocal
from models.user import User
from services.billing_service import BillingService
from services.usage_tracker import UsageTracker

async def verify_billing():
    db = SessionLocal()
    try:
        # Get a test user
        user = db.query(User).first()
        if not user:
            print("No users found in database. Please run seed_db.py first.")
            return

        print(f"Verifying for user: {user.email}")

        # 1. Test Usage Tracker
        tracker = UsageTracker(db)
        print("\n--- Testing Usage Tracker ---")
        
        # Track some usage
        await tracker.track_usage(user.id, "ai_requests", 5)
        await tracker.track_usage(user.id, "ai_tokens", 1000)
        print("Logged usage for ai_requests and ai_tokens.")

        # Check limits
        limit_check = await tracker.check_usage_limits(user.id, "ai_requests")
        print(f"Limit check for ai_requests: {limit_check}")

        # Usage summary
        summary = await tracker.get_usage_summary(user.id)
        print(f"Usage summary: {summary['usage']}")

        # 2. Test Billing Service (partial, as Stripe requires API keys)
        billing_service = BillingService(db)
        print("\n--- Testing Billing Service ---")
        
        subscription = await billing_service.get_subscription(user)
        if subscription:
            print(f"Found subscription: {subscription.plan_type} ({subscription.status})")
        else:
            print("No subscription found. Creating free plan...")
            await billing_service.create_subscription(user, "free")
            subscription = await billing_service.get_subscription(user)
            print(f"Created subscription: {subscription.plan_type}")

        print("\nVerification completed successfully (subset of features tested).")

    except Exception as e:
        print(f"Verification failed: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(verify_billing())
