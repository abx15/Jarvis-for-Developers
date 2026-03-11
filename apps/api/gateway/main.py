import httpx
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse
from services.common.service_registry import ServiceRegistry
from utils.logger import logger
from utils.auth import get_current_user # Assume we reuse auth logic

app = FastAPI(title="AI Developer OS - API Gateway")

@app.get("/health")
async def health_check():
    return {"status": "gateway_is_healthy"}

async def proxy_request(service_name: str, path: str, request: Request):
    """Generic proxy to forward requests to microservices."""
    service_url = ServiceRegistry.get_service_url(service_name)
    if not service_url:
        raise HTTPException(status_code=502, detail=f"Service {service_name} not found")

    url = f"{service_url}/{path}"
    
    async with httpx.AsyncClient() as client:
        # Extract headers and body
        headers = dict(request.headers)
        body = await request.body()
        
        try:
            # Forward the request
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            return StreamingResponse(
                response.aiter_bytes(),
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except Exception as e:
            logger.error(f"Error proxying request to {service_name}: {str(e)}")
            raise HTTPException(status_code=502, detail="Microservice communication failed")

# Route Definitions
@app.api_route("/agent/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def agent_proxy(path: str, request: Request):
    return await proxy_request("agent-service", path, request)

@app.api_route("/repo/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def repo_proxy(path: str, request: Request):
    return await proxy_request("repo-service", path, request)

@app.api_route("/bug/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def bug_proxy(path: str, request: Request):
    return await proxy_request("bug-service", path, request)

@app.api_route("/devops/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def devops_proxy(path: str, request: Request):
    return await proxy_request("devops-service", path, request)

@app.api_route("/billing/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def billing_proxy(path: str, request: Request):
    return await proxy_request("billing-service", path, request)
