import httpx
from typing import List, Dict, Any, Optional
import base64
from fastapi import HTTPException, status
from utils.logger import logger


class GitHubService:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"token {self.access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.base_url = "https://api.github.com"
        
        # Supported extensions to filter out binaries and non-code
        self.supported_extensions = {
            ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".scss",
            ".java", ".c", ".cpp", ".h", ".cs", ".go", ".rs", ".rb", ".php",
            ".sql", ".md", ".json", ".yml", ".yaml", ".toml", ".ini", ".sh"
        }

    async def get_repository_tree(self, owner: str, repo: str, branch: str = "main") -> List[Dict[str, Any]]:
        """Fetch the full recursive tree of a repository"""
        async with httpx.AsyncClient() as client:
            try:
                # Get the branch SHA to ensure we get a recursive tree
                ref_url = f"{self.base_url}/repos/{owner}/{repo}/git/ref/heads/{branch}"
                ref_response = await client.get(ref_url, headers=self.headers)
                ref_response.raise_for_status()
                sha = ref_response.json()["object"]["sha"]

                # Fetch recursive tree
                tree_url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{sha}?recursive=1"
                tree_response = await client.get(tree_url, headers=self.headers)
                tree_response.raise_for_status()
                
                return tree_response.json().get("tree", [])
                
            except httpx.HTTPError as e:
                logger.error(f"Error fetching repo tree from GitHub: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to fetch repository tree from GitHub"
                )

    def filter_code_files(self, tree: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter the tree to only contain supported code files"""
        filtered_files = []
        for item in tree:
            if item.get("type") == "blob":
                path = item.get("path", "")
                # Ignore common package/build directories
                if any(x in path for x in ["node_modules/", "venv/", ".git/", "dist/", "build/"]):
                    continue
                
                # Check extension
                import os
                _, ext = os.path.splitext(path)
                if ext.lower() in self.supported_extensions or path in ["Dockerfile", "Makefile"]:
                    filtered_files.append(item)
                    
        return filtered_files

    async def get_file_content(self, owner: str, repo: str, file_sha: str) -> Optional[str]:
        """Fetch and decode the base64 content of a file by its SHA"""
        async with httpx.AsyncClient() as client:
            try:
                blob_url = f"{self.base_url}/repos/{owner}/{repo}/git/blobs/{file_sha}"
                response = await client.get(blob_url, headers=self.headers)
                response.raise_for_status()
                
                content_base64 = response.json().get("content", "")
                if content_base64:
                    return base64.b64decode(content_base64).decode("utf-8")
                return None
                
            except UnicodeDecodeError:
                # Likely a binary file that slipped through
                logger.warning(f"Failed to decode blob {file_sha}. Skipping.")
                return None
            except httpx.HTTPError as e:
                logger.error(f"Error fetching blob from GitHub: {e}")
                return None

    async def fetch_pull_requests(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Fetch all pull requests for a repository"""
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.base_url}/repos/{owner}/{repo}/pulls"
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching PRs: {e}")
                return []

    async def get_pr_diff(self, owner: str, repo: str, pr_number: int) -> Optional[str]:
        """Fetch the diff content of a pull request"""
        diff_headers = {**self.headers, "Accept": "application/vnd.github.v3.diff"}
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
                response = await client.get(url, headers=diff_headers)
                response.raise_for_status()
                return response.text
            except httpx.HTTPError as e:
                logger.error(f"Error fetching PR diff: {e}")
                return None

    async def comment_on_pull_request(self, owner: str, repo: str, pr_number: int, body: str):
        """Post a comment on a pull request"""
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.base_url}/repos/{owner}/{repo}/issues/{pr_number}/comments"
                response = await client.post(url, headers=self.headers, json={"body": body})
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error commenting on PR: {e}")
                return None
