from agents.base_agent import BaseAgent
from typing import Optional

class TestAgent(BaseAgent):
    """Agent specialized in generating unit tests"""
    
    def __init__(self, tools):
        prompt = """You are a Testing Agent for the AI Developer OS.
Your goal is to ensure high code coverage and reliability.
You have access to:
- FileReader: Read code to test.
- FileWriter: Write test files.
- Shell: Run the tests to verify they pass.

Focus on edge cases and follow the project's testing framework (Pytest for backend, Vitest/Jest for frontend)."""
        super().__init__("TestAgent", tools, prompt)

    async def run(self, task: str, repo_id: Optional[int] = None) -> str:
        context = ""
        if repo_id:
            context = await self.tools["repo_search"].run(repo_id, task)
            
        messages = [
            {"role": "user", "content": f"Code Context:\n{context}\n\nTesting Task: {task}"}
        ]
        
        return await self.chat(messages)
