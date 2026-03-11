import os
from typing import Dict, Optional

class ServiceRegistry:
    """
    Simple configuration-based service registry.
    Maps service names to their URLs.
    """
    SERVICES = {
        "gateway": os.getenv("GATEWAY_URL", "http://localhost:8000"),
        "agent-service": os.getenv("AGENT_SERVICE_URL", "http://localhost:8001"),
        "repo-service": os.getenv("REPO_SERVICE_URL", "http://localhost:8002"),
        "bug-service": os.getenv("BUG_SERVICE_URL", "http://localhost:8003"),
        "devops-service": os.getenv("DEVOPS_SERVICE_URL", "http://localhost:8004"),
        "billing-service": os.getenv("BILLING_SERVICE_URL", "http://localhost:8005"),
    }

    @classmethod
    def get_service_url(cls, service_name: str) -> Optional[str]:
        """Return the URL for a given service."""
        return cls.SERVICES.get(service_name)

    @classmethod
    def register_service(cls, name: str, url: str):
        """Dynamically register or update a service (useful for container orchestration)."""
        cls.SERVICES[name] = url
