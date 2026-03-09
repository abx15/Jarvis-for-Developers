from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, Optional

from routes.auth import get_current_user
from services.gesture_service import GestureService
from utils.logger import logger


router = APIRouter()

gesture_service = GestureService()


class GestureDetectRequest(BaseModel):
    gesture: str
    confidence: float = 0.0
    meta: Optional[Dict[str, Any]] = None


class GestureActionRequest(BaseModel):
    action: str
    payload: Optional[Dict[str, Any]] = None


@router.post("/detect")
async def detect_gesture(
    request: GestureDetectRequest,
    current_user=Depends(get_current_user),
):
    try:
        return await gesture_service.receive_gesture_signal(
            gesture=request.gesture,
            confidence=request.confidence,
            meta=request.meta,
        )
    except Exception as e:
        logger.error(f"Gesture detect error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/action")
async def trigger_action(
    request: GestureActionRequest,
    current_user=Depends(get_current_user),
):
    try:
        return await gesture_service.execute_action(action=request.action, payload=request.payload)
    except Exception as e:
        logger.error(f"Gesture action error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
