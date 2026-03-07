"""
Voice Service
Integrates voice commands with AI agents system for autonomous coding
"""

import asyncio
import json
import re
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from utils.logger import logger
import os
import sys

# Inject packages path
sys.path.append(os.path.join(os.path.dirname(__file__), "../packages/ai-agents"))

try:
    from router.agent_router import AgentRouter
    from tools.file_reader import FileReaderTool
    from tools.file_writer import FileWriterTool
    from tools.shell_executor import ShellTool
    from tools.repo_search import RepoSearchTool
    from services.search_service import SearchService
    AGENTS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"AI agents not available: {e}")
    AGENTS_AVAILABLE = False


class VoiceCommand:
    """Voice command data structure"""
    def __init__(self, text: str, context: Dict[str, Any] = None):
        self.text = text
        self.context = context or {}
        self.intent = None
        self.entities = {}
        self.action = None
        self.parameters = {}
        self.confidence = 0.0


class VoiceService:
    """Service for processing voice commands and integrating with AI agents"""
    
    def __init__(self):
        self.command_patterns = {
            "generate_code": [
                "create", "generate", "make", "write", "build", "implement", "develop"
            ],
            "fix_bug": [
                "fix", "debug", "solve", "resolve", "repair", "patch"
            ],
            "refactor": [
                "refactor", "improve", "optimize", "clean up", "reorganize"
            ],
            "explain": [
                "explain", "describe", "show me", "what is", "how does", "tell me about"
            ],
            "create_feature": [
                "add feature", "implement feature", "new feature", "add functionality"
            ],
            "test": [
                "test", "create tests", "write tests", "generate tests", "test coverage"
            ],
            "search": [
                "search", "find", "look for", "locate", "where is", "show me"
            ],
            "run": [
                "run", "execute", "start", "launch", "build and run"
            ]
        }
        
        # Agent mapping
        self.agent_mapping = {
            "generate_code": "code",
            "fix_bug": "debug", 
            "refactor": "refactor",
            "explain": "code",
            "create_feature": "code",
            "test": "test",
            "search": "code",
            "run": "code"
        }
    
    def get_agent_router(self, db: Session) -> Optional[AgentRouter]:
        """Initialize agent router with tools"""
        if not AGENTS_AVAILABLE:
            return None
            
        try:
            repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))
            
            tools = {
                "file_reader": FileReaderTool(repo_root),
                "file_writer": FileWriterTool(repo_root),
                "shell_executor": ShellTool(repo_root),
                "repo_search": RepoSearchTool(lambda: SearchService(db))
            }
            return AgentRouter(tools)
        except Exception as e:
            logger.error(f"Failed to initialize agent router: {e}")
            return None
    
    async def speech_to_text(self, audio_file_path: str) -> str:
        """Convert speech to text using voice engine service"""
        try:
            import requests
            
            # Call voice engine service
            with open(audio_file_path, "rb") as f:
                files = {"audio_file": f}
                response = requests.post(
                    "http://localhost:8002/speech-to-text",
                    files=files,
                    timeout=30
                )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("text", "")
            else:
                logger.error(f"Speech to text error: {response.status_code}")
                return ""
                
        except Exception as e:
            logger.error(f"Speech to text error: {e}")
            # Fallback to mock transcription for demo
            return "create a REST API for products"
    
    async def process_command(self, command_text: str, context: Dict[str, Any] = None, db: Session = None) -> Dict[str, Any]:
        """Process voice command and execute with AI agents"""
        try:
            # Parse voice command
            command = VoiceCommand(command_text, context)
            self._parse_command(command)
            
            if command.confidence < 0.3:
                return {
                    "success": False,
                    "error": "Could not understand command",
                    "confidence": command.confidence,
                    "suggestion": "Please speak clearly and try again"
                }
            
            # Get appropriate agent
            agent_type = self.agent_mapping.get(command.intent, "code")
            
            # Execute with agent
            result = await self._execute_with_agent(command, agent_type, db)
            
            return {
                "success": True,
                "command": command_text,
                "intent": command.intent,
                "action": command.action,
                "agent_type": agent_type,
                "entities": command.entities,
                "parameters": command.parameters,
                "confidence": command.confidence,
                "result": result
            }
            
        except Exception as e:
            logger.error(f"Voice command processing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "command": command_text
            }
    
    def _parse_command(self, command: VoiceCommand):
        """Parse voice command to extract intent, entities, and parameters"""
        text = command.text.lower()
        
        # Extract intent
        command.intent = self._extract_intent(text)
        
        # Extract entities
        command.entities = self._extract_entities(text)
        
        # Determine action
        command.action = self._determine_action(command.intent, command.entities)
        
        # Extract parameters
        command.parameters = self._extract_parameters(text, command.intent)
        
        # Calculate confidence
        command.confidence = self._calculate_confidence(text, command.intent)
    
    def _extract_intent(self, text: str) -> str:
        """Extract intent from command text"""
        for intent, keywords in self.command_patterns.items():
            if any(keyword in text for keyword in keywords):
                return intent
        return "unknown"
    
    def _extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract entities from command text"""
        entities = {}
        
        # Extract file names
        file_patterns = [
            r'file\s+["\']?(\w+\.\w+)["\']?',
            r'called\s+["\']?(\w+\.\w+)["\']?',
            r'named\s+["\']?(\w+\.\w+)["\']?',
            r'(\w+\.\w+)\s+file'
        ]
        
        for pattern in file_patterns:
            matches = re.findall(pattern, text)
            if matches:
                entities["file_name"] = matches[0]
                break
        
        # Extract programming languages
        languages = ["python", "javascript", "java", "cpp", "c++", "go", "rust", "php", "ruby", "typescript"]
        for lang in languages:
            if lang in text:
                entities["language"] = lang
                break
        
        # Extract API/endpoint information
        if "api" in text or "endpoint" in text:
            entities["api"] = True
            # Extract resource names
            resource_patterns = [
                r'api\s+(?:for|to)\s+(\w+)',
                r'(\w+)\s+api',
                r'endpoint\s+(?:for|to)\s+(\w+)'
            ]
            for pattern in resource_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    entities["resource"] = matches[0]
                    break
        
        # Extract bug/problem information
        if "bug" in text or "error" in text or "issue" in text:
            entities["bug"] = True
            # Extract bug description
            bug_patterns = [
                r'bug\s+(?:in|with)\s+(\w+)',
                r'error\s+(?:in|with)\s+(\w+)',
                r'issue\s+(?:in|with)\s+(\w+)'
            ]
            for pattern in bug_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    entities["bug_location"] = matches[0]
                    break
        
        return entities
    
    def _determine_action(self, intent: str, entities: Dict[str, Any]) -> str:
        """Determine action based on intent and entities"""
        action_map = {
            "generate_code": "create",
            "fix_bug": "debug",
            "refactor": "refactor",
            "explain": "explain",
            "create_feature": "create",
            "test": "test",
            "search": "search",
            "run": "run"
        }
        
        return action_map.get(intent, "unknown")
    
    def _extract_parameters(self, text: str, intent: str) -> Dict[str, Any]:
        """Extract parameters for the action"""
        parameters = {}
        
        if intent == "generate_code":
            # Extract template information
            if "template" in text:
                parameters["use_template"] = True
            if "empty" in text or "blank" in text:
                parameters["empty"] = True
            if "api" in text or "rest" in text:
                parameters["type"] = "api"
            if "component" in text:
                parameters["type"] = "component"
            if "function" in text or "method" in text:
                parameters["type"] = "function"
        
        elif intent == "fix_bug":
            # Extract debugging options
            if "test" in text:
                parameters["run_tests"] = True
            if "log" in text or "logs" in text:
                parameters["check_logs"] = True
        
        elif intent == "refactor":
            # Extract refactoring options
            if "performance" in text:
                parameters["focus"] = "performance"
            if "readability" in text:
                parameters["focus"] = "readability"
        
        elif intent == "test":
            # Extract testing options
            if "unit" in text:
                parameters["test_type"] = "unit"
            if "integration" in text:
                parameters["test_type"] = "integration"
            if "coverage" in text:
                parameters["coverage"] = True
        
        return parameters
    
    def _calculate_confidence(self, text: str, intent: str) -> float:
        """Calculate confidence score for intent recognition"""
        if intent == "unknown":
            return 0.1
        
        # Base confidence
        confidence = 0.7
        
        # Increase confidence if we found clear keywords
        if intent in self.command_patterns:
            keywords = self.command_patterns[intent]
            match_count = sum(1 for keyword in keywords if keyword in text)
            confidence += (match_count / len(keywords)) * 0.3
        
        # Boost confidence for longer commands (more context)
        if len(text.split()) > 5:
            confidence += 0.1
        
        return min(1.0, confidence)
    
    async def _execute_with_agent(self, command: VoiceCommand, agent_type: str, db: Session) -> Dict[str, Any]:
        """Execute command using appropriate AI agent"""
        try:
            if not db:
                raise ValueError("Database session required for agent execution")
            
            # Get agent router
            router = self.get_agent_router(db)
            
            if not router:
                # Fallback response when agents are not available
                return {
                    "agent_response": f"AI agents are not available. Command '{command.text}' was parsed with intent '{command.intent}' but could not be executed.",
                    "task": command.text,
                    "agent_type": agent_type,
                    "fallback": True
                }
            
            # Prepare task for agent
            task = self._prepare_agent_task(command)
            
            # Execute with appropriate agent
            if agent_type in router.agents:
                agent = router.agents[agent_type]
                response = await agent.run(task, repo_id=command.context.get("repo_id"))
                
                return {
                    "agent_response": response,
                    "task": task,
                    "agent_type": agent_type
                }
            else:
                # Fallback to code agent
                response = await router.agents["code"].run(task, command.context.get("repo_id"))
                
                return {
                    "agent_response": response,
                    "task": task,
                    "agent_type": "code"
                }
                
        except Exception as e:
            logger.error(f"Agent execution error: {e}")
            return {
                "agent_response": f"Error executing command: {str(e)}",
                "task": command.text,
                "agent_type": agent_type,
                "error": str(e)
            }
    
    def _prepare_agent_task(self, command: VoiceCommand) -> str:
        """Prepare task description for AI agent"""
        task = command.text
        
        # Add context from entities
        if command.entities:
            context_parts = []
            if "file_name" in command.entities:
                context_parts.append(f"Target file: {command.entities['file_name']}")
            if "language" in command.entities:
                context_parts.append(f"Language: {command.entities['language']}")
            if "api" in command.entities:
                context_parts.append("Type: API")
            if "resource" in command.entities:
                context_parts.append(f"Resource: {command.entities['resource']}")
            if "bug" in command.entities:
                context_parts.append("Type: Bug fix")
            if "bug_location" in command.entities:
                context_parts.append(f"Bug location: {command.entities['bug_location']}")
            
            if context_parts:
                task += f"\n\nContext: {', '.join(context_parts)}"
        
        # Add parameters
        if command.parameters:
            param_parts = []
            for key, value in command.parameters.items():
                param_parts.append(f"{key}: {value}")
            
            if param_parts:
                task += f"\n\nParameters: {', '.join(param_parts)}"
        
        return task
