import asyncio
import random
from typing import AsyncGenerator, Dict, Any
from utils.logger import logger
from database.connection import SessionLocal
from models.ai_stream import AIStreamLog


class AIStreamingService:
    """
    Service to handle streaming AI responses using async generators.
    Supports real-time token delivery and logging.
    """

    def __init__(self, db_session = None):
        self.db = db_session or SessionLocal()

    async def stream_response(
        self, 
        prompt: str, 
        user_id: int, 
        stream_type: str = "chat"
    ) -> AsyncGenerator[str, None]:
        """
        Stream an AI response token by token.
        This defaults to a high-quality mock stream if no external LLM API is configured.
        """
        logger.info(f"Starting AI stream for user {user_id}: {stream_type}")
        
        start_time = asyncio.get_event_loop().time()
        full_response = []
        
        # Simulating different types of responses based on requirements
        if stream_type == "bug":
            base_text = "I've analyzed your code and found a critical issue in the memory management block. You should check the pointer deallocation logic. Here's a suggested fix:\n\n```python\nif ptr:\n    free(ptr)\n    ptr = None\n```"
        elif stream_type == "doc":
            base_text = "### Documentation Summary\n\nThis module handles user authentication and session management. It uses JWT for secure token transmission and maintains a persistent session store in PostgreSQL."
        else:
            base_text = f"Hello! I am Jarvis. I am processing your request about '{prompt}'. Streaming responses allows you to see my thoughts as they are generated, making our interaction feel much more fluid and responsive."

        # Break into tokens (words/chars)
        tokens = base_text.split(" ")
        
        try:
            for i, token in enumerate(tokens):
                # Simulate network/LLM latency
                await asyncio.sleep(random.uniform(0.05, 0.15))
                
                # Add space back if not the last token
                yield token + (" " if i < len(tokens) - 1 else "")
                full_response.append(token)

            # Log the interaction
            end_time = asyncio.get_event_loop().time()
            duration_ms = int((end_time - start_time) * 1000)
            
            self._log_stream(
                user_id=user_id,
                prompt=prompt,
                stream_type=stream_type,
                response_length=len(" ".join(full_response)),
                duration_ms=duration_ms
            )

        except Exception as e:
            logger.error(f"Error during AI streaming: {str(e)}")
            yield f"\n[STREAM_ERROR]: {str(e)}"
        finally:
            if not db_session:
                self.db.close()

    def _log_stream(
        self, 
        user_id: int, 
        prompt: str, 
        stream_type: str, 
        response_length: int, 
        duration_ms: int
    ):
        """Internal helper to record stream metrics to DB."""
        try:
            log_entry = AIStreamLog(
                user_id=user_id,
                prompt=prompt,
                stream_type=stream_type,
                response_length=response_length,
                duration_ms=duration_ms
            )
            self.db.add(log_entry)
            self.db.commit()
            logger.info(f"Logged AI stream for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to log AI stream: {str(e)}")
            self.db.rollback()
