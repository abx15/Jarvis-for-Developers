from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
import os

class BaseAgent(ABC):
    """Abstract base class for all specialized AI agents"""
    
    async def run(self, task: str, repo_id: Optional[int] = None) -> str:
        """Execute the agent on a specific task with autonomous tool use"""
        messages = [{"role": "user", "content": task}]
        
        # Tools definition for OpenAI
        tool_defs = [
            {
                "type": "function",
                "function": {
                    "name": "file_reader",
                    "description": "Read content of a file",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "relative_path": {"type": "string", "description": "Path relative to repo root"}
                        },
                        "required": ["relative_path"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "file_writer",
                    "description": "Create or modify a file",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "relative_path": {"type": "string", "description": "Path relative to repo root"},
                            "content": {"type": "string", "description": "Content to write"}
                        },
                        "required": ["relative_path", "content"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "repo_search",
                    "description": "Search code using semantic embeddings",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query"}
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "shell_executor",
                    "description": "Run shell commands in the repo",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "command": {"type": "string", "description": "Shell command"}
                        },
                        "required": ["command"]
                    }
                }
            }
        ]

        for _ in range(5):  # Max 5 iterations
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": self.system_prompt}] + messages,
                tools=tool_defs,
                tool_choice="auto"
            )
            
            msg = response.choices[0].message
            messages.append(msg)
            
            if not msg.tool_calls:
                return msg.content

            for tool_call in msg.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.body if hasattr(tool_call.function, 'body') else tool_call.function.arguments)
                
                # Execute tool
                if fn_name == "file_reader":
                    result = self.tools["file_reader"].run(**fn_args)
                elif fn_name == "file_writer":
                    result = self.tools["file_writer"].run(**fn_args)
                elif fn_name == "shell_executor":
                    result = self.tools["shell_executor"].run(**fn_args)
                elif fn_name == "repo_search" and repo_id:
                    result = await self.tools["repo_search"].run(repo_id=repo_id, **fn_args)
                else:
                    result = f"Error: Tool {fn_name} not found or missing repo_id"
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": fn_name,
                    "content": str(result)
                })
        
        return "Task exceeded maximum iterations."

    async def chat(self, messages: List[Dict[str, str]]) -> str:
        # Chat functionality is now integrated into run() for tool use
        pass
