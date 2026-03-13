from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database.connection import engine, Base
from routes import auth
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
    allow_origins=[host.strip() for host in settings.ALLOWED_HOSTS.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include basic routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])


@app.get("/")
async def root():
    return {"message": "AI Developer OS API", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    health_status = {"status": "healthy", "checks": {}}
    return health_status


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
