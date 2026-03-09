from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAgent(ABC):
    def __init__(self, agent_name: str, description: str):
        self.agent_name = agent_name
        self.description = description

    @abstractmethod
    async def run(self, task_input: str, context: Dict[str, Any] = None) -> str:
        """Execute the agent's core responsibility"""
        pass

    def get_info(self) -> Dict[str, str]:
        return {
            "name": self.agent_name,
            "description": self.description
        }
