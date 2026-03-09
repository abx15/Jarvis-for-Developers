from sqlalchemy import Column, Integer, String, DateTime, Text
from database.connection import Base
from datetime import datetime

class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100), nullable=False)
    task_input = Column(Text, nullable=False)
    task_output = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
