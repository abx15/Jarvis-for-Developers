from typing import List, Dict, Any
from agents.specialized_agents import CodeAgent, DebugAgent, TestAgent, DocsAgent, DevOpsAgent
from utils.logger import logger
from database.connection import SessionLocal
from models.agents import AgentTask

class Orchestrator:
    def __init__(self):
        self.agents = {
            "code": CodeAgent(),
            "debug": DebugAgent(),
            "test": TestAgent(),
            "docs": DocsAgent(),
            "devops": DevOpsAgent()
        }
        logger.info("Multi-Agent Orchestrator initialized")

    async def run_complex_task(self, user_task: str, repo_id: int):
        """Coordinate multiple agents based on the user task"""
        execution_log = []
        context = {"repo_id": repo_id}
        
        # 1. Routing logic: Determine agents based on task keywords
        task_lower = user_task.lower()
        selected_agent_keys = []
        
        if any(w in task_lower for w in ["fix", "bug", "error", "issue"]):
            selected_agent_keys = ["code", "debug", "test", "docs", "devops"]
        elif any(w in task_lower for w in ["doc", "readme", "api", "document"]):
            selected_agent_keys = ["code", "docs"]
        elif any(w in task_lower for w in ["test", "unit", "verify"]):
            selected_agent_keys = ["code", "test"]
        else:
            selected_agent_keys = ["code"] # Default to code analysis

        final_response = f"### System Orchestration Results\n\nTask: *\"{user_task}\"*\n\n---\n\n"
        
        db = SessionLocal()
        try:
            for agent_key in selected_agent_keys:
                agent = self.agents[agent_key]
                logger.info(f"Orchestrator invoking: {agent.agent_name}")
                
                # Execute agent with context from previous agents
                output = await agent.run(user_task, context)
                
                # Update context for next agents
                context[f"{agent_key}_output"] = output
                
                execution_log.append({
                    "agent": agent.agent_name,
                    "status": "completed",
                    "output": output
                })
                
                final_response += f"### {agent.agent_name}\n{output}\n\n"
                
                # Log to DB
                task_log = AgentTask(
                    agent_name=agent.agent_name,
                    task_input=user_task,
                    task_output=output
                )
                db.add(task_log)
                db.commit()

            return {
                "success": True,
                "final_response": final_response,
                "execution_log": execution_log
            }
        except Exception as e:
            logger.error(f"Orchestration failure: {e}")
            return {"success": False, "error": str(e)}
        finally:
            db.close()
