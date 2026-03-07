from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
import os
import json
from utils.logger import logger

class TaskPlanner:
    """System to break down high-level coding requests into granular file-system steps"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.model = "gpt-4o"
        self.system_prompt = """You are a Senior Technical Architect and Task Planner.
Your goal is to take a high-level coding request and decompose it into a sequence of atomic file-system operations.

Available operations:
- 'create_folder': Create a new directory.
- 'create_file': Create a new file with initial content.
- 'modify_file': Update an existing file (partial or full rewrite).

Output format:
Return a JSON object with a 'plan' key containing a list of steps. 
Each step must have:
- 'id': integer
- 'action': 'create_folder' | 'create_file' | 'modify_file'
- 'path': relative path from repo root
- 'description': what this step does
- 'expected_content_summary': (for files) what should be in there

Example:
{
  "plan": [
    { "id": 1, "action": "create_folder", "path": "apps/api/routes/new_feature", "description": "Create folder for new feature" },
    { "id": 2, "action": "create_file", "path": "apps/api/routes/new_feature/api.py", "description": "Initialize API route", "expected_content_summary": "FastAPI router with placeholder endpoints" }
  ]
}

Be precise and follow monorepo patterns.
"""

    async def plan_task(self, request: str, repo_context: str = "") -> Dict[str, Any]:
        """Generate a multi-step plan for a coding request"""
        try:
            prompt = f"User Request: {request}\n\nExisting Repo Context:\n{repo_context}"
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            plan_data = json.loads(response.choices[0].message.content)
            return plan_data
        except Exception as e:
            logger.error(f"TaskPlanner error: {str(e)}")
            return {"error": str(e), "plan": []}
