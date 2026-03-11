import os
import json
import redis
import asyncio
from typing import Callable, Any
from utils.logger import logger

class MessageQueue:
    """
    Redis-based message queue for inter-service communication.
    Supports basic push/pull (producer/consumer) patterns.
    """
    def __init__(self, host: str = None, port: int = 6379, db: int = 0):
        redis_host = host or os.getenv("REDIS_HOST", "localhost")
        redis_port = port or int(os.getenv("REDIS_PORT", 6379))
        self.redis = redis.Redis(host=redis_host, port=redis_port, db=db, decode_responses=True)
        logger.info(f"Connected to Redis at {redis_host}:{redis_port}")

    async def publish(self, queue_name: str, data: Any):
        """Push a message onto the queue."""
        try:
            message = json.dumps(data)
            self.redis.lpush(queue_name, message)
            logger.info(f"Published message to {queue_name}")
        except Exception as e:
            logger.error(f"Failed to publish message: {str(e)}")

    async def subscribe(self, queue_name: str, handler: Callable[[Any], Any]):
        """
        Listen for messages on a queue and process them with handler.
        This is a non-blocking consumer loop.
        """
        logger.info(f"Started subscribing to {queue_name}")
        while True:
            try:
                # BLPOP blocks until an item is available
                # 0 means block forever
                result = self.redis.brpop(queue_name, timeout=1)
                if result:
                    _, message = result
                    data = json.loads(message)
                    await handler(data)
            except Exception as e:
                logger.error(f"Error in consumer loop for {queue_name}: {str(e)}")
            
            await asyncio.sleep(0.1)
