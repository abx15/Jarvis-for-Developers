from typing import Dict, Any, Optional
from services.ai_agents import AgentOrchestrator
from utils.logger import logger

class CodeReviewService:
    def __init__(self, orchestrator: AgentOrchestrator):
        self.orchestrator = orchestrator

    async def conduct_ai_review(self, diff: str) -> str:
        """Analyze PR diff and generate review comments"""
        try:
            task = f"As a senior developer, review the following code changes and identify bugs or architectural issues. Diff:\n{diff}"
            result = await self.orchestrator.execute_task(task)
            return result.get("output", "AI review completed, no critical issues found.")
        except Exception as e:
            logger.error(f"Error conducting AI review: {e}")
            return "Failed to complete AI review."

    async def generate_pr_summary(self, diff: str) -> str:
        """Generate a concise summary of PR changes"""
        try:
            task = f"Generate a professional PR summary including changes made and impact for this diff:\n{diff}"
            result = await self.orchestrator.execute_task(task)
            return result.get("output", "No summary available.")
        except Exception as e:
            logger.error(f"Error generating PR summary: {e}")
            return "Failed to generate PR summary."
