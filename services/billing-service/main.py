from fastapi import FastAPI
from typing import Dict, Any
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Jarvis Billing Service")

@app.get("/")
async def root():
    return {"message": "Billing Service", "status": "running", "timestamp": datetime.now().isoformat()}

@app.get("/health")
async def health_check():
    return {"status": "billing_service_healthy", "service": "billing-service", "timestamp": datetime.now().isoformat()}

@app.get("/subscription/{user_id}")
async def get_subscription(user_id: int):
    logger.info(f"Fetching subscription for user: {user_id}")
    return {
        "user_id": user_id, 
        "plan": "pro", 
        "status": "active",
        "features": ["unlimited_ai_tasks", "priority_support", "advanced_analytics"],
        "service": "billing-service"
    }

@app.post("/track-usage")
async def track_usage(user_id: int, tokens: int):
    logger.info(f"Tracking usage for user {user_id}: {tokens} tokens")
    return {
        "status": "success", 
        "tokens": tokens,
        "total_usage": 15000,
        "remaining_quota": 5000,
        "service": "billing-service"
    }

@app.get("/usage/{user_id}")
async def get_usage(user_id: int):
    return {
        "user_id": user_id,
        "current_month": {
            "ai_tasks": 247,
            "tokens_used": 15000,
            "api_calls": 892,
            "storage_used": "2.3GB"
        },
        "billing_cycle": {
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "days_remaining": 15
        },
        "service": "billing-service"
    }

@app.get("/plans")
async def get_plans():
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free",
                "price": 0,
                "features": ["100 AI tasks/month", "Basic support"],
                "popular": False
            },
            {
                "id": "pro",
                "name": "Pro",
                "price": 29,
                "features": ["Unlimited AI tasks", "Priority support", "Advanced analytics"],
                "popular": True
            },
            {
                "id": "team",
                "name": "Team",
                "price": 99,
                "features": ["Everything in Pro", "Team collaboration", "Custom integrations"],
                "popular": False
            }
        ],
        "service": "billing-service"
    }

@app.post("/subscribe")
async def create_subscription(user_id: int, plan_id: str):
    logger.info(f"Creating subscription for user {user_id} with plan {plan_id}")
    return {
        "user_id": user_id,
        "plan_id": plan_id,
        "subscription_id": f"sub_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "status": "active",
        "service": "billing-service"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Billing Service on port 8005")
    uvicorn.run(app, host="0.0.0.0", port=8005, reload=True)
