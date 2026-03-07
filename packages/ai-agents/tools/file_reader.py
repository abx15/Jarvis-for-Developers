import os
from typing import Optional
from utils.logger import logger

class FileReaderTool:
    """Tool to read repository files with safety guards"""
    
    def __init__(self, base_path: str):
        self.base_path = os.path.abspath(base_path)

    def run(self, relative_path: str) -> str:
        """Read content of a file given its relative path from repo root"""
        try:
            full_path = os.path.abspath(os.path.join(self.base_path, relative_path))
            
            # Security check: Ensure path is within repo
            if not full_path.startswith(self.base_path):
                return "Error: Access denied. Path is outside of repository bounds."
            
            if not os.path.exists(full_path):
                return f"Error: File not found at {relative_path}"
            
            if os.path.isdir(full_path):
                return f"Error: {relative_path} is a directory, not a file."

            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            return content
        except Exception as e:
            logger.error(f"FileReaderTool error: {str(e)}")
            return f"Error reading file: {str(e)}"
