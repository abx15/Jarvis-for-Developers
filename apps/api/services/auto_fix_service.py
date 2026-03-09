from sqlalchemy.orm import Session
from models.bugs import Bug, BugFix
from services.ai_agents import AgentOrchestrator
from utils.logger import logger
from typing import Dict, Any, Optional

class AutoFixService:
    def __init__(self, db: Session):
        self.db = db
        self.orchestrator = AgentOrchestrator()

    async def generate_fix_for_bug(self, bug_id: int) -> Optional[Dict[str, Any]]:
        """Use AI to generate a fix for a specific detected bug"""
        bug = self.db.query(Bug).filter(Bug.id == bug_id).first()
        if not bug:
            return None
        
        # Check if fix already exists
        existing_fix = self.db.query(BugFix).filter(BugFix.bug_id == bug_id).first()
        if existing_fix:
            return {
                "bug_id": bug_id,
                "suggested_fix": existing_fix.suggested_fix,
                "ai_explanation": existing_fix.ai_explanation
            }

        try:
            # Construct task for the AI
            task = (
                f"You are a senior engineer fixing a bug. "
                f"Bug Type: {bug.bug_type}\n"
                f"Description: {bug.description}\n"
                f"Location: {bug.file_path}\n\n"
                "Please provide a corrected code snippet and a concise explanation."
            )
            
            result = await self.orchestrator.execute_task(task)
            output = result.get("output", "No fix generated.")
            
            # Simple parsing of AI output (ideally would be more structured)
            # For now, we'll store the whole block or try to extract 'Explanation' and 'Fix'
            explanation = "AI generated fix based on code context."
            if "Explanation:" in output:
                parts = output.split("Explanation:")
                explanation = parts[1].split("Fix:")[0].strip() if "Fix:" in parts[1] else parts[1].strip()
            
            new_fix = BugFix(
                bug_id=bug_id,
                suggested_fix=output,
                ai_explanation=explanation
            )
            self.db.add(new_fix)
            self.db.commit()
            self.db.refresh(new_fix)
            
            return {
                "bug_id": bug_id,
                "suggested_fix": new_fix.suggested_fix,
                "ai_explanation": new_fix.ai_explanation
            }
            
        except Exception as e:
            logger.error(f"Error generating AI fix for bug {bug_id}: {e}")
            return None
