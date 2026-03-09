from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, DECIMAL, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from database.connection import Base

class DeployConfig(Base):
    __tablename__ = "deploy_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False)
    config_type = Column(String(50), nullable=False)  # 'dockerfile', 'cicd', 'infrastructure', 'kubernetes'
    config_name = Column(String(255), nullable=False)
    config_content = Column(Text, nullable=False)
    config_metadata = Column(JSONB)  # Additional metadata about the configuration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    repo = relationship("Repo", back_populates="deploy_configs")
    creator = relationship("User", back_populates="deploy_configs")
    deployments = relationship("DevOpsDeployment", back_populates="config")

class DevOpsRecommendation(Base):
    __tablename__ = "devops_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False)
    recommendation_type = Column(String(50), nullable=False)  # 'hosting', 'database', 'caching', 'monitoring'
    recommendation_data = Column(JSONB, nullable=False)  # Structured recommendation data
    confidence_score = Column(DECIMAL(3, 2), default=0.00)  # 0.00 to 1.00
    is_accepted = Column(Boolean, default=False)
    accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    repo = relationship("Repo", back_populates="devops_recommendations")
    creator = relationship("User", back_populates="devops_recommendations")

class DevOpsDeployment(Base):
    __tablename__ = "devops_deployments"
    
    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False)
    config_id = Column(Integer, ForeignKey("deploy_configs.id", ondelete="SET NULL"), nullable=True)
    deployment_type = Column(String(50), nullable=False)  # 'docker', 'kubernetes', 'serverless'
    deployment_target = Column(String(255), nullable=False)  # Target environment/platform
    deployment_status = Column(String(50), default='pending')  # 'pending', 'running', 'success', 'failed'
    deployment_log = Column(Text, nullable=True)
    deployment_metadata = Column(JSONB)  # Additional deployment information
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    repo = relationship("Repo", back_populates="devops_deployments")
    config = relationship("DeployConfig", back_populates="deployments")
    creator = relationship("User", back_populates="devops_deployments")
