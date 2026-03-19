from fastapi import FastAPI
from typing import Dict, Any, List
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Jarvis Bug Detection Service")

@app.get("/")
async def root():
    return {"message": "Bug Detection Service", "status": "running", "timestamp": datetime.now().isoformat()}

@app.get("/health")
async def health_check():
    return {"status": "bug_service_healthy", "service": "bug-service", "timestamp": datetime.now().isoformat()}

@app.post("/scan")
async def scan_repository(repo_path: str):
    logger.info(f"Starting bug scan for repository: {repo_path}")
    # Mock bug detection
    return {
        "status": "scan_completed", 
        "repo_path": repo_path,
        "scan_id": f"scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "bugs_found": 2,
        "bugs": [
            {
                "id": 1,
                "severity": "high",
                "title": "Potential memory leak",
                "file": "src/main.py",
                "line": 42,
                "description": "Unclosed file handle detected"
            },
            {
                "id": 2,
                "severity": "medium",
                "title": "Unused import",
                "file": "src/utils.py",
                "line": 15,
                "description": "Import statement not used in code"
            }
        ],
        "service": "bug-service"
    }

@app.get("/bugs")
async def get_bugs():
    return {
        "bugs": [
            {
                "id": 1,
                "severity": "high",
                "title": "Potential memory leak",
                "file": "src/main.py",
                "line": 42,
                "status": "open",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": 2,
                "severity": "medium",
                "title": "Unused import",
                "file": "src/utils.py",
                "line": 15,
                "status": "resolved",
                "created_at": datetime.now().isoformat()
            }
        ],
        "service": "bug-service"
    }

@app.post("/fix")
async def fix_bug(bug_id: int):
    logger.info(f"Attempting to fix bug with ID: {bug_id}")
    return {
        "bug_id": bug_id,
        "status": "fix_applied",
        "message": "Bug fix successfully applied",
        "service": "bug-service"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Bug Detection Service on port 8003")
    uvicorn.run(app, host="0.0.0.0", port=8003, reload=True)
