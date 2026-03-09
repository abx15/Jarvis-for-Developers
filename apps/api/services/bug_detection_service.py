from sqlalchemy.orm import Session
from models.user import Repo
from models.repo_memory import File
from models.bugs import Bug
from utils.static_analysis import StaticAnalyzer
from services.ai_agents import AgentOrchestrator
from utils.logger import logger
from typing import List, Dict, Any

class BugDetectionService:
    def __init__(self, db: Session):
        self.db = db
        self.analyzer = StaticAnalyzer()
        self.orchestrator = AgentOrchestrator()

    async def scan_repository(self, repo_id: int):
        """Full scan of all files in a repository for bugs"""
        files = self.db.query(File).filter(File.repo_id == repo_id).all()
        logger.info(f"Scanning {len(files)} files in repo {repo_id}")
        
        # Clear previous bugs for this repo to avoid duplicates on rescan
        self.db.query(Bug).filter(Bug.repo_id == repo_id).delete()
        self.db.commit()

        total_bugs = 0
        for file_record in files:
            # 1. Static Analysis
            static_issues = await self.analyzer.analyze_file(file_record.content, file_record.language)
            
            # 2. Secret Scan
            secret_issues = await self.analyzer.scan_for_secrets(file_record.content)
            
            all_issues = static_issues + secret_issues
            
            for issue in all_issues:
                new_bug = Bug(
                    repo_id=repo_id,
                    file_path=file_record.file_path,
                    bug_type=issue["type"],
                    description=issue["description"],
                    severity=issue.get("severity", "medium")
                )
                self.db.add(new_bug)
                total_bugs += 1
            
            # 3. AI Scan (Limited to critical files or on-demand to save tokens)
            # In a full impelmentation, we might use AI for more complex logic
            
        self.db.commit()
        return {"success": True, "bugs_found": total_bugs}

    async def ai_deep_scan(self, repo_id: int, file_path: str):
        """Optional AI-powered deep scan of a specific file"""
        file_record = self.db.query(File).filter(File.repo_id == repo_id, File.file_path == file_path).first()
        if not file_record:
            return None
            
        task = f"Perform a deep bug analysis on this {file_record.language} code: \n\n{file_record.content}"
        result = await self.orchestrator.execute_task(task)
        # Process AI result and save as bugs...
        return result.get("output", "")
