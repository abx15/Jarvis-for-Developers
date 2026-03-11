from fastapi import FastAPI
from typing import Dict, Any
from utils.logger import logger
# Import existing billing logic
from apps.api.services.billing_service import BillingService

app = FastAPI(title="Jarvis Billing Service")

@app.get("/health")
async def health_check():
    return {"status": "billing_service_healthy"}

@app.get("/subscription/{user_id}")
async def get_subscription(user_id: int):
    return {"user_id": user_id, "plan": "pro", "status": "active"}

@app.post("/track-usage")
async def track_usage(user_id: int, tokens: int):
    return {"status": "success", "tokens": tokens}
