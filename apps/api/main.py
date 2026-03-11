from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database.connection import engine, Base
from routes import agents, repo, autocode, analytics, voice, vision, auth, gesture, editor, github, ai_bugs, agents_orchestrator, editor_collab, devops, billing, stripe_webhook, org, project
from ws import ai_stream_ws
import os
from utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AI Developer OS API")
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    logger.info("Shutting down AI Developer OS API")


app = FastAPI(
    title="AI Developer OS API",
    description="Backend API for AI-powered development platform",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(repo.router, prefix="/api/v1/repo", tags=["repository"])
app.include_router(autocode.router, prefix="/api/v1/autocode", tags=["autocode"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(vision.router, prefix="/api/v1/vision", tags=["vision"])
app.include_router(gesture.router, prefix="/api/v1/gesture", tags=["gesture"])
app.include_router(editor.router, prefix="/api/v1/editor", tags=["editor"])
app.include_router(github.router, prefix="/api/v1/github", tags=["github"])
app.include_router(ai_bugs.router, prefix="/api/v1/ai", tags=["bugs"])
app.include_router(agents_orchestrator.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(editor_collab.router, prefix="/api/v1/editor", tags=["editor_collaboration"])
app.include_router(devops.router, prefix="/api/v1/devops", tags=["devops"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(stripe_webhook.router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(org.router, prefix="/api/v1/org", tags=["organization"])
app.include_router(project.router, prefix="/api/v1/project", tags=["project"])
app.include_router(ai_stream_ws.router, tags=["AI Streaming"])


@app.get("/")
async def root():
    return {"message": "AI Developer OS API", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
