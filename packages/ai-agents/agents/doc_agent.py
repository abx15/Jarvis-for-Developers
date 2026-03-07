from agents.base_agent import BaseAgent
from typing import Optional

class DocAgent(BaseAgent):
    """Agent specialized in generating documentation and READMEs"""
    
    def __init__(self, tools):
        prompt = """You are a Documentation Agent for the AI Developer OS.
Your goal is to provide clear, concise, and helpful documentation.
You have access to:
- FileReader: Understand the code you are documenting.
- FileWriter: Write markdown files.
- RepoSearch: Find information across the repo.

Explain high-level architecture as well as API details."""
        super().__init__("DocAgent", tools, prompt)

    async def run(self, task: str, repo_id: Optional[int] = None) -> str:
        context = ""
        if repo_id:
            context = await self.tools["repo_search"].run(repo_id, task)
            
        messages = [
            {"role": "user", "content": f"Repo Context:\n{context}\n\nDocumentation Task: {task}"}
        ]
        
        return await self.chat(messages)
