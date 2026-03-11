from fastapi import FastAPI, Depends
from typing import Dict, Any
from utils.logger import logger
# Import existing agent logic
from apps.api.services.ai_agents import AgentOrchestrator

app = FastAPI(title="Jarvis AI Agent Service")

@app.get("/health")
async def health_check():
    return {"status": "agent_service_healthy"}

@app.post("/orchestrate")
async def orchestrate(task: str, context: Dict[str, Any]):
    orchestrator = AgentOrchestrator()
    result = await orchestrator.orchestrate_agents(task, context)
    return result
