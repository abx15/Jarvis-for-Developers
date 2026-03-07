from typing import Dict, Any, Optional
from openai import AsyncOpenAI
import os
import json

from agents.code_agent import CodeAgent
from agents.debug_agent import DebugAgent
from agents.refactor_agent import RefactorAgent
from agents.test_agent import TestAgent
from agents.doc_agent import DocAgent

class AgentRouter:
    """Intelligent router that selects the best agent for a given task"""
    
    def __init__(self, tools: Dict[str, Any]):
        self.tools = tools
        self.client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.model = "gpt-4o"
        
        # Initialize agents
        self.agents = {
            "code": CodeAgent(tools),
            "debug": DebugAgent(tools),
            "refactor": RefactorAgent(tools),
            "test": TestAgent(tools),
            "doc": DocAgent(tools)
        }

    async def route(self, task: str, repo_id: Optional[int] = None) -> str:
        """Route the task to the correct agent and return the response"""
        
        # 1. Decide which agent to use
        category = await self._classify_task(task)
        
        agent = self.agents.get(category, self.agents["code"])
        
        # 2. Run the selected agent
        return await agent.run(task, repo_id)

    async def _classify_task(self, task: str) -> str:
        """Categorize the task into one of the agent types"""
        prompt = """Classify this developer task into one of these categories:
- 'code': Generating new code, features, or boilerplate.
- 'debug': Fixing bugs, analyzing errors, troubleshooting.
- 'refactor': Improving existing code structure/quality.
- 'test': Writing unit tests, integration tests.
- 'doc': Writing READMEs, API docs, code comments.

Return ONLY the category name as a single word."""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": task}
                ],
                temperature=0,
                max_tokens=10
            )
            category = response.choices[0].message.content.strip().lower()
            return category if category in self.agents else "code"
        except Exception:
            return "code"
