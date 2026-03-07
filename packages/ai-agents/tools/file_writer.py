import os
from utils.logger import logger

class FileWriterTool:
    """Tool to create or modify repository files with safety guards"""
    
    def __init__(self, base_path: str):
        self.base_path = os.path.abspath(base_path)

    def run(self, relative_path: str, content: str) -> str:
        """Create or overwrite a file with the provided content"""
        try:
            full_path = os.path.abspath(os.path.join(self.base_path, relative_path))
            
            # Security check: Ensure path is within repo
            if not full_path.startswith(self.base_path):
                return "Error: Access denied. Cannot write outside of repository bounds."
            
            # Create directories if they don't exist
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            return f"Successfully wrote to {relative_path}"
        except Exception as e:
            logger.error(f"FileWriterTool error: {str(e)}")
            return f"Error writing file: {str(e)}"
