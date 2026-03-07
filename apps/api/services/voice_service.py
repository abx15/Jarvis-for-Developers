import os
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from config import settings
from utils.logger import logger
import json

class VoiceService:
    def __init__(self):
        # Initialize OpenAI client for transcription and intent detection
        api_key = os.environ.get("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        self.client = AsyncOpenAI(api_key=api_key)
        self.stt_model = "whisper-1"
        self.chat_model = settings.OPENAI_MODEL

    async def speech_to_text(self, file_path: str) -> str:
        """Convert speech to text using OpenAI Whisper"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Audio file not found: {file_path}")

            with open(file_path, "rb") as audio_file:
                transcript = await self.client.audio.transcriptions.create(
                    model=self.stt_model, 
                    file=audio_file
                )
            return transcript.text
        except Exception as e:
            logger.error(f"Error in speech_to_text: {e}")
            raise

    async def process_command(self, command: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Detect intent from voice transcript and determine next steps"""
        try:
            prompt = f"""
            You are the voice command processor for Jarvis for Developers.
            Given the user's voice command, detect the intent and extract relevant entities.
            
            Command: "{command}"
            
            Intents:
            1. generate_code: Creating new files, boilerplate, or specific functions.
            2. fix_bug: Debugging or fixing issues in existing code.
            3. refactor_file: Improving or changing existing code structure.
            4. explain_code: Asking for an explanation of a file or snippet.
            5. create_feature: Planning and implementing a multi-file feature.
            6. unknown: If the command doesn't fit any of the above.

            Return a JSON object with:
            {{
                "intent": "string",
                "confidence": float,
                "entities": {{
                    "language": "string",
                    "path": "string",
                    "description": "string"
                }},
                "action_route": "string" (e.g., /api/v1/agents/code, /api/v1/autocode/plan)
            }}
            """

            response = await self.client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {{"role": "system", "content": "You are a helpful assistant that parses voice commands into structured JSON."}},
                    {{"role": "user", "content": prompt}}
                ],
                response_format={{ "type": "json_object" }}
            )

            result = json.loads(response.choices[0].message.content)
            logger.info(f"Detected intent for voice command: {result['intent']}")
            return result
        except Exception as e:
            logger.error(f"Error in process_command: {e}")
            raise

    async def text_to_speech(self, text: str, voice: str = "alloy") -> str:
        """Convert text to speech (optional enhancement)"""
        # Placeholder for TTS if needed, otherwise returns the text
        return f"Audio generation for: {text[:20]}..."

    async def detect_wake_word(self, file_path: str) -> bool:
        """Placeholder for wake word detection"""
        return False
