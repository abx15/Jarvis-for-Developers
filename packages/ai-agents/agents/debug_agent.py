from agents.base_agent import BaseAgent
from typing import Optional

class DebugAgent(BaseAgent):
    """Agent specialized in analyzing errors and fixing bugs"""
    
    def __init__(self, tools):
        prompt = """You are a Debugging Agent for the AI Developer OS.
Your goal is to identify the root cause of issues and provide precise fixes.
You have access to:
- FileReader: Read problematic files.
- RepoSearch: Find related code that might be causing the bug.
- Shell: Execute tests or check logs to reproduce the bug.

Always analyze the error or description provided by the user carefully."""
        super().__init__("DebugAgent", tools, prompt)

    async def run(self, task: str, repo_id: Optional[int] = None) -> str:
        context = ""
        if repo_id:
            context = await self.tools["repo_search"].run(repo_id, task)
            
        messages = [
            {"role": "user", "content": f"Repository Context:\n{context}\n\nProblem Description: {task}"}
        ]
        
        return await self.chat(messages)
