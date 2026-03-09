"""
WebSocket server for real-time collaborative editing
"""

import asyncio
import json
import logging
from typing import Dict, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import uuid

logger = logging.getLogger(__name__)

class EditorSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.connections: Dict[str, WebSocket] = {}
        self.document_content = ""
        self.user_cursors: Dict[str, Dict[str, Any]] = {}
        self.user_colors: Dict[str, str] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """Add a new connection to the session"""
        await websocket.accept()
        self.connections[user_id] = websocket
        self.user_colors[user_id] = f"#{uuid.uuid4().hex[:6]}"
        
        # Send current document state to new user
        await websocket.send_text(json.dumps({
            "type": "init",
            "content": self.document_content,
            "sessionId": self.session_id
        }))
        
        # Notify other users about new connection
        await self.broadcast_to_others(user_id, {
            "type": "user_joined",
            "userId": user_id,
            "color": self.user_colors[user_id]
        })
        
        logger.info(f"User {user_id} connected to session {self.session_id}")
        
    async def disconnect(self, user_id: str):
        """Remove a connection from the session"""
        if user_id in self.connections:
            del self.connections[user_id]
            
        if user_id in self.user_cursors:
            del self.user_cursors[user_id]
            
        # Notify other users about disconnection
        await self.broadcast({
            "type": "user_left",
            "userId": user_id
        })
        
        logger.info(f"User {user_id} disconnected from session {self.session_id}")
        
    async def broadcast(self, message: Dict[str, Any]):
        """Send message to all connected users"""
        if not self.connections:
            return
            
        message_str = json.dumps(message)
        disconnected_users = []
        
        for user_id, websocket in self.connections.items():
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                disconnected_users.append(user_id)
                
        # Remove disconnected users
        for user_id in disconnected_users:
            await self.disconnect(user_id)
            
    async def broadcast_to_others(self, sender_id: str, message: Dict[str, Any]):
        """Send message to all users except sender"""
        if not self.connections:
            return
            
        message_str = json.dumps(message)
        disconnected_users = []
        
        for user_id, websocket in self.connections.items():
            if user_id == sender_id:
                continue
                
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                disconnected_users.append(user_id)
                
        # Remove disconnected users
        for user_id in disconnected_users:
            await self.disconnect(user_id)
            
    async def handle_message(self, user_id: str, message: Dict[str, Any]):
        """Handle incoming message from user"""
        message_type = message.get("type")
        
        if message_type == "content_change":
            # Handle document content change
            content = message.get("content", "")
            self.document_content = content
            
            # Broadcast to other users
            await self.broadcast_to_others(user_id, {
                "type": "content_change",
                "content": content,
                "userId": user_id,
                "timestamp": message.get("timestamp")
            })
            
        elif message_type == "cursor_move":
            # Handle cursor position change
            cursor_data = message.get("cursor", {})
            self.user_cursors[user_id] = cursor_data
            
            # Broadcast cursor position to other users
            await self.broadcast_to_others(user_id, {
                "type": "cursor_move",
                "userId": user_id,
                "cursor": cursor_data,
                "color": self.user_colors.get(user_id, "#000000")
            })
            
        elif message_type == "selection_change":
            # Handle text selection change
            selection_data = message.get("selection", {})
            
            # Broadcast selection to other users
            await self.broadcast_to_others(user_id, {
                "type": "selection_change",
                "userId": user_id,
                "selection": selection_data,
                "color": self.user_colors.get(user_id, "#000000")
            })
            
        elif message_type == "ai_suggestion":
            # Handle AI suggestion request
            suggestion = message.get("suggestion", "")
            
            # Broadcast AI suggestion to all users
            await self.broadcast({
                "type": "ai_suggestion",
                "suggestion": suggestion,
                "userId": user_id,
                "timestamp": message.get("timestamp")
            })

# Global session manager
class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, EditorSession] = {}
        
    def get_session(self, session_id: str) -> EditorSession:
        """Get or create a session"""
        if session_id not in self.sessions:
            self.sessions[session_id] = EditorSession(session_id)
        return self.sessions[session_id]
        
    def remove_session(self, session_id: str):
        """Remove a session if empty"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            if not session.connections:
                del self.sessions[session_id]
                logger.info(f"Removed empty session {session_id}")

# Global session manager instance
session_manager = SessionManager()

async def handle_websocket_connection(websocket: WebSocket, session_id: str, user_id: str):
    """Handle WebSocket connection for collaborative editing"""
    session = session_manager.get_session(session_id)
    
    try:
        await session.connect(websocket, user_id)
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                await session.handle_message(user_id, message)
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from user {user_id}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
                
            except Exception as e:
                logger.error(f"Error handling message from user {user_id}: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "Internal server error"
                }))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id}")
        await session.disconnect(user_id)
        
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        await session.disconnect(user_id)
        
    finally:
        # Clean up empty session
        session_manager.remove_session(session_id)
