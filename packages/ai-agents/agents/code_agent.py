from agents.base_agent import BaseAgent
from typing import Optional

class CodeAgent(BaseAgent):
    """Agent specialized in generating new code and features"""
    
    def __init__(self, tools):
        prompt = """You are a Code Generation Agent for the AI Developer OS.
Your goal is to write high-quality, production-ready code.
You have access to:
- FileReader: Read existing code for context.
- FileWriter: Write new code to files.
- RepoSearch: Find relevant code in the repo.
- Shell: Run build/test commands.

Always explain your logic briefly before providing the solution. 
Follow the project's monorepo structure and coding standards."""
        super().__init__("CodeAgent", tools, prompt)

    async def run(self, task: str, repo_id: Optional[int] = None) -> str:
        # Initial logic: use RepoSearch for context, then generate code
        context = ""
        if repo_id:
            context = await self.tools["repo_search"].run(repo_id, task)
        
        messages = [
            {"role": "user", "content": f"Context from repo:\n{context}\n\nTask: {task}"}
        ]
        
        return await self.chat(messages)
