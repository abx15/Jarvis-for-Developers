from agents.base_agent import BaseAgent
from typing import Optional

class RefactorAgent(BaseAgent):
    """Agent specialized in improving code structure and readability"""
    
    def __init__(self, tools):
        prompt = """You are a Refactoring Agent for the AI Developer OS.
Your goal is to improve code maintainability, performance, and readability without changing behavior.
You have access to:
- FileReader: Read code to be refactored.
- FileWriter: Apply refactored changes.
- Shell: Verify that changes don't break existing functionality (by running tests).

Suggest clean, idiomatic patterns."""
        super().__init__("RefactorAgent", tools, prompt)

    async def run(self, task: str, repo_id: Optional[int] = None) -> str:
        context = ""
        if repo_id:
            context = await self.tools["repo_search"].run(repo_id, task)
            
        messages = [
            {"role": "user", "content": f"Context:\n{context}\n\nRefactoring Request: {task}"}
        ]
        
        return await self.chat(messages)
