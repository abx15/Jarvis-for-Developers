import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.ai_streaming_service import AIStreamingService
from utils.logger import logger
from database.connection import SessionLocal

router = APIRouter()

class AIStreamManager:
    """Manages active AI streaming WebSocket connections."""
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"AI Stream WS connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"AI Stream WS disconnected. Active: {len(self.active_connections)}")

manager = AIStreamManager()

@router.websocket("/ws/ai-stream")
async def ai_stream_endpoint(websocket: WebSocket, user_id: int = 1):
    """
    WebSocket endpoint for real-time AI streaming.
    Receives JSON with 'prompt' and 'type', yields tokens.
    """
    await manager.connect(websocket)
    db = SessionLocal()
    ai_service = AIStreamingService(db)
    
    try:
        while True:
            # Wait for request from client
            data = await websocket.receive_text()
            request = json.loads(data)
            
            prompt = request.get("prompt", "")
            stream_type = request.get("type", "chat")
            
            if not prompt:
                await websocket.send_json({"error": "Prompt is required"})
                continue

            # Start streaming from service
            await websocket.send_json({"status": "started", "type": stream_type})
            
            async for token in ai_service.stream_response(prompt, user_id, stream_type):
                await websocket.send_json({
                    "token": token,
                    "type": stream_type
                })
            
            # Send completion signal
            await websocket.send_json({"status": "completed"})
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
        manager.disconnect(websocket)
    finally:
        db.close()
