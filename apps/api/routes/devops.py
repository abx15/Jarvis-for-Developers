from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import os
import tempfile
import shutil
from datetime import datetime

from database.connection import get_db
from models.deploy_config import DeployConfig, DevOpsRecommendation, DevOpsDeployment
from services.docker_generator import DockerfileGenerator
from services.cicd_generator import CICDGenerator
from services.infra_analyzer import InfrastructureAnalyzer
from utils.logger import logger
from utils.auth import get_current_user
from models.user import User

router = APIRouter()

# Initialize services
docker_generator = DockerfileGenerator()
cicd_generator = CICDGenerator()
infra_analyzer = InfrastructureAnalyzer()

# Pydantic models
class DockerfileRequest(BaseModel):
    project_path: str = Field(..., description="Path to the project directory")
    custom_options: Optional[Dict[str, Any]] = Field(None, description="Custom Dockerfile options")

class DockerfileResponse(BaseModel):
    dockerfile: str
    docker_compose: Optional[str] = None
    project_info: Dict[str, Any]
    optimizations: List[str]

class CICDRequest(BaseModel):
    project_path: str = Field(..., description="Path to the project directory")
    platform: str = Field(..., description="CI/CD platform (github, gitlab, azure, jenkins, circleci)")
    options: Optional[Dict[str, Any]] = Field(None, description="Custom CI/CD options")

class CICDResponse(BaseModel):
    pipeline_content: str
    platform: str
    project_info: Dict[str, Any]
    deployment_manifests: Optional[Dict[str, str]] = None

class InfraAnalysisRequest(BaseModel):
    project_path: str = Field(..., description="Path to the project directory")
    include_recommendations: bool = Field(True, description="Include AI recommendations")

class InfraAnalysisResponse(BaseModel):
    analysis: Dict[str, Any]
    recommendations: Dict[str, Any]
    architecture: Dict[str, Any]
    cost_estimates: Dict[str, Any]

class ConfigSaveRequest(BaseModel):
    repo_id: int = Field(..., description="Repository ID")
    config_type: str = Field(..., description="Configuration type")
    config_name: str = Field(..., description="Configuration name")
    config_content: str = Field(..., description="Configuration content")
    config_metadata: Optional[Dict[str, Any]] = Field(None, description="Configuration metadata")

class ConfigResponse(BaseModel):
    id: int
    config_type: str
    config_name: str
    config_content: str
    config_metadata: Optional[Dict[str, Any]]
    is_active: bool
    created_at: datetime

class DeploymentRequest(BaseModel):
    config_id: int = Field(..., description="Configuration ID")
    deployment_type: str = Field(..., description="Deployment type")
    deployment_target: str = Field(..., description="Deployment target")
    deployment_metadata: Optional[Dict[str, Any]] = Field(None, description="Deployment metadata")

class DeploymentResponse(BaseModel):
    id: int
    deployment_type: str
    deployment_target: str
    deployment_status: str
    started_at: datetime
    completed_at: Optional[datetime]

# Routes

@router.post("/generate-dockerfile", response_model=DockerfileResponse)
async def generate_dockerfile(
    request: DockerfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate Dockerfile for a project."""
    try:
        logger.info(f"Generating Dockerfile for project: {request.project_path}")
        
        # Analyze project
        project_info = docker_generator.analyze_project(request.project_path)
        
        if not project_info.get('framework'):
            raise HTTPException(
                status_code=400,
                detail="Could not determine project framework. Please check the project path."
            )
        
        # Generate Dockerfile
        dockerfile_content = docker_generator.generate_dockerfile(
            project_info, 
            request.custom_options
        )
        
        # Generate docker-compose if needed
        docker_compose_content = None
        if request.custom_options and request.custom_options.get('include_docker_compose'):
            docker_compose_content = docker_generator.generate_docker_compose(project_info)
        
        # Optimize Dockerfile
        optimizations = []
        if 'multi-stage' in dockerfile_content.lower():
            optimizations.append("Multi-stage build implemented for smaller image size")
        if 'non-root' in dockerfile_content.lower():
            optimizations.append("Non-root user configured for security")
        if 'healthcheck' in dockerfile_content.lower():
            optimizations.append("Health check configured for monitoring")
        
        return DockerfileResponse(
            dockerfile=dockerfile_content,
            docker_compose=docker_compose_content,
            project_info=project_info,
            optimizations=optimizations
        )
        
    except Exception as e:
        logger.error(f"Error generating Dockerfile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Dockerfile: {str(e)}")

@router.post("/generate-cicd", response_model=CICDResponse)
async def generate_cicd_pipeline(
    request: CICDRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate CI/CD pipeline configuration."""
    try:
        logger.info(f"Generating CI/CD pipeline for platform: {request.platform}")
        
        # Analyze project
        project_info = docker_generator.analyze_project(request.project_path)
        
        if not project_info.get('framework'):
            raise HTTPException(
                status_code=400,
                detail="Could not determine project framework. Please check the project path."
            )
        
        # Generate CI/CD pipeline based on platform
        if request.platform == 'github':
            pipeline_content = cicd_generator.generate_github_actions(project_info, request.options)
        elif request.platform == 'gitlab':
            pipeline_content = cicd_generator.generate_gitlab_ci(project_info, request.options)
        elif request.platform == 'azure':
            pipeline_content = cicd_generator.generate_azure_devops(project_info, request.options)
        elif request.platform == 'jenkins':
            pipeline_content = cicd_generator.generate_jenkins_pipeline(project_info, request.options)
        elif request.platform == 'circleci':
            pipeline_content = cicd_generator.generate_circleci_config(project_info, request.options)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported CI/CD platform: {request.platform}"
            )
        
        # Generate Kubernetes manifests if requested
        deployment_manifests = None
        if request.options and request.options.get('include_kubernetes'):
            deployment_manifests = cicd_generator.generate_deployment_manifests(project_info, request.options)
        
        return CICDResponse(
            pipeline_content=pipeline_content,
            platform=request.platform,
            project_info=project_info,
            deployment_manifests=deployment_manifests
        )
        
    except Exception as e:
        logger.error(f"Error generating CI/CD pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate CI/CD pipeline: {str(e)}")

@router.post("/analyze-infra", response_model=InfraAnalysisResponse)
async def analyze_infrastructure(
    request: InfraAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze project infrastructure and provide recommendations."""
    try:
        logger.info(f"Analyzing infrastructure for project: {request.project_path}")
        
        # Analyze project infrastructure
        analysis = infra_analyzer.analyze_project_infrastructure(request.project_path)
        
        # Generate comprehensive report
        report = infra_analyzer.generate_infrastructure_report(analysis)
        
        # Save recommendations to database if requested
        if request.include_recommendations:
            await _save_recommendations(db, current_user.id, analysis, report)
        
        return InfraAnalysisResponse(
            analysis=analysis,
            recommendations=report['recommendations'],
            architecture=report['architecture'],
            cost_estimates=report['cost_estimates']
        )
        
    except Exception as e:
        logger.error(f"Error analyzing infrastructure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze infrastructure: {str(e)}")

@router.post("/save-config", response_model=ConfigResponse)
async def save_config(
    request: ConfigSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save generated configuration to database."""
    try:
        logger.info(f"Saving configuration: {request.config_name}")
        
        # Create new configuration
        config = DeployConfig(
            repo_id=request.repo_id,
            config_type=request.config_type,
            config_name=request.config_name,
            config_content=request.config_content,
            config_metadata=request.config_metadata or {},
            created_by=current_user.id
        )
        
        db.add(config)
        db.commit()
        db.refresh(config)
        
        return ConfigResponse(
            id=config.id,
            config_type=config.config_type,
            config_name=config.config_name,
            config_content=config.config_content,
            config_metadata=config.config_metadata,
            is_active=config.is_active,
            created_at=config.created_at
        )
        
    except Exception as e:
        logger.error(f"Error saving configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save configuration: {str(e)}")

@router.get("/configs", response_model=List[ConfigResponse])
async def get_configs(
    repo_id: Optional[int] = None,
    config_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get saved configurations."""
    try:
        query = db.query(DeployConfig).filter(
            DeployConfig.created_by == current_user.id,
            DeployConfig.is_active == True
        )
        
        if repo_id:
            query = query.filter(DeployConfig.repo_id == repo_id)
        
        if config_type:
            query = query.filter(DeployConfig.config_type == config_type)
        
        configs = query.order_by(DeployConfig.created_at.desc()).all()
        
        return [
            ConfigResponse(
                id=config.id,
                config_type=config.config_type,
                config_name=config.config_name,
                config_content=config.config_content,
                config_metadata=config.config_metadata,
                is_active=config.is_active,
                created_at=config.created_at
            )
            for config in configs
        ]
        
    except Exception as e:
        logger.error(f"Error getting configurations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get configurations: {str(e)}")

@router.get("/configs/{config_id}", response_model=ConfigResponse)
async def get_config(
    config_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific configuration by ID."""
    try:
        config = db.query(DeployConfig).filter(
            DeployConfig.id == config_id,
            DeployConfig.created_by == current_user.id,
            DeployConfig.is_active == True
        ).first()
        
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        return ConfigResponse(
            id=config.id,
            config_type=config.config_type,
            config_name=config.config_name,
            config_content=config.config_content,
            config_metadata=config.config_metadata,
            is_active=config.is_active,
            created_at=config.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get configuration: {str(e)}")

@router.delete("/configs/{config_id}")
async def delete_config(
    config_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete configuration."""
    try:
        config = db.query(DeployConfig).filter(
            DeployConfig.id == config_id,
            DeployConfig.created_by == current_user.id
        ).first()
        
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        # Soft delete
        config.is_active = False
        db.commit()
        
        return {"message": "Configuration deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete configuration: {str(e)}")

@router.post("/deploy", response_model=DeploymentResponse)
async def create_deployment(
    request: DeploymentRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create and start deployment."""
    try:
        logger.info(f"Creating deployment: {request.deployment_type} to {request.deployment_target}")
        
        # Get configuration
        config = db.query(DeployConfig).filter(
            DeployConfig.id == request.config_id,
            DeployConfig.created_by == current_user.id,
            DeployConfig.is_active == True
        ).first()
        
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        # Create deployment record
        deployment = DevOpsDeployment(
            repo_id=config.repo_id,
            config_id=request.config_id,
            deployment_type=request.deployment_type,
            deployment_target=request.deployment_target,
            deployment_metadata=request.deployment_metadata or {},
            created_by=current_user.id
        )
        
        db.add(deployment)
        db.commit()
        db.refresh(deployment)
        
        # Start background deployment process
        background_tasks.add_task(
            _execute_deployment,
            deployment.id,
            config.config_content,
            request.deployment_target
        )
        
        return DeploymentResponse(
            id=deployment.id,
            deployment_type=deployment.deployment_type,
            deployment_target=deployment.deployment_target,
            deployment_status=deployment.deployment_status,
            started_at=deployment.started_at,
            completed_at=deployment.completed_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating deployment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create deployment: {str(e)}")

@router.get("/deployments", response_model=List[DeploymentResponse])
async def get_deployments(
    repo_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get deployment history."""
    try:
        query = db.query(DevOpsDeployment).filter(
            DevOpsDeployment.created_by == current_user.id
        )
        
        if repo_id:
            query = query.filter(DevOpsDeployment.repo_id == repo_id)
        
        deployments = query.order_by(DevOpsDeployment.started_at.desc()).all()
        
        return [
            DeploymentResponse(
                id=deployment.id,
                deployment_type=deployment.deployment_type,
                deployment_target=deployment.deployment_target,
                deployment_status=deployment.deployment_status,
                started_at=deployment.started_at,
                completed_at=deployment.completed_at
            )
            for deployment in deployments
        ]
        
    except Exception as e:
        logger.error(f"Error getting deployments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get deployments: {str(e)}")

@router.get("/deployments/{deployment_id}")
async def get_deployment(
    deployment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific deployment details."""
    try:
        deployment = db.query(DevOpsDeployment).filter(
            DevOpsDeployment.id == deployment_id,
            DevOpsDeployment.created_by == current_user.id
        ).first()
        
        if not deployment:
            raise HTTPException(status_code=404, detail="Deployment not found")
        
        return {
            "id": deployment.id,
            "deployment_type": deployment.deployment_type,
            "deployment_target": deployment.deployment_target,
            "deployment_status": deployment.deployment_status,
            "deployment_log": deployment.deployment_log,
            "deployment_metadata": deployment.deployment_metadata,
            "started_at": deployment.started_at,
            "completed_at": deployment.completed_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting deployment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get deployment: {str(e)}")

@router.get("/recommendations")
async def get_recommendations(
    repo_id: Optional[int] = None,
    recommendation_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get DevOps recommendations."""
    try:
        query = db.query(DevOpsRecommendation).filter(
            DevOpsRecommendation.created_by == current_user.id
        )
        
        if repo_id:
            query = query.filter(DevOpsRecommendation.repo_id == repo_id)
        
        if recommendation_type:
            query = query.filter(DevOpsRecommendation.recommendation_type == recommendation_type)
        
        recommendations = query.order_by(DevOpsRecommendation.created_at.desc()).all()
        
        return [
            {
                "id": rec.id,
                "recommendation_type": rec.recommendation_type,
                "recommendation_data": rec.recommendation_data,
                "confidence_score": rec.confidence_score,
                "is_accepted": rec.is_accepted,
                "accepted_at": rec.accepted_at,
                "created_at": rec.created_at
            }
            for rec in recommendations
        ]
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

# Helper functions

async def _save_recommendations(
    db: Session, 
    user_id: int, 
    analysis: Dict, 
    report: Dict
):
    """Save recommendations to database."""
    try:
        # Save hosting recommendation
        hosting_rec = report['recommendations']['hosting']
        hosting_recommendation = DevOpsRecommendation(
            repo_id=analysis.get('repo_id', 1),  # Default repo_id
            recommendation_type='hosting',
            recommendation_data=hosting_rec,
            confidence_score=0.85,  # Default confidence
            created_by=user_id
        )
        db.add(hosting_recommendation)
        
        # Save database recommendation
        db_rec = report['recommendations']['database']
        db_recommendation = DevOpsRecommendation(
            repo_id=analysis.get('repo_id', 1),
            recommendation_type='database',
            recommendation_data=db_rec,
            confidence_score=0.80,
            created_by=user_id
        )
        db.add(db_recommendation)
        
        # Save caching recommendation
        cache_rec = report['recommendations']['caching']
        cache_recommendation = DevOpsRecommendation(
            repo_id=analysis.get('repo_id', 1),
            recommendation_type='caching',
            recommendation_data=cache_rec,
            confidence_score=0.75,
            created_by=user_id
        )
        db.add(cache_recommendation)
        
        # Save monitoring recommendation
        monitoring_rec = report['recommendations']['monitoring']
        monitoring_recommendation = DevOpsRecommendation(
            repo_id=analysis.get('repo_id', 1),
            recommendation_type='monitoring',
            recommendation_data=monitoring_rec,
            confidence_score=0.90,
            created_by=user_id
        )
        db.add(monitoring_recommendation)
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error saving recommendations: {str(e)}")
        db.rollback()

async def _execute_deployment(
    deployment_id: int,
    config_content: str,
    deployment_target: str
):
    """Execute deployment in background."""
    from database.connection import SessionLocal
    
    db = SessionLocal()
    try:
        # Get deployment record
        deployment = db.query(DevOpsDeployment).filter(
            DevOpsDeployment.id == deployment_id
        ).first()
        
        if not deployment:
            return
        
        # Update status to running
        deployment.deployment_status = 'running'
        db.commit()
        
        # Simulate deployment process
        # In a real implementation, this would execute the actual deployment
        import time
        import random
        
        time.sleep(5)  # Simulate deployment time
        
        # Randomly succeed or fail for demonstration
        if random.random() > 0.2:  # 80% success rate
            deployment.deployment_status = 'success'
            deployment.deployment_log = "Deployment completed successfully"
        else:
            deployment.deployment_status = 'failed'
            deployment.deployment_log = "Deployment failed: Configuration error"
        
        deployment.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        logger.error(f"Error executing deployment: {str(e)}")
        if deployment:
            deployment.deployment_status = 'failed'
            deployment.deployment_log = f"Deployment error: {str(e)}"
            deployment.completed_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()
