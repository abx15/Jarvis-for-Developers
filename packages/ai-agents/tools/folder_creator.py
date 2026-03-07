import os
from utils.logger import logger

class FolderCreatorTool:
    """Tool to create directories within the repository"""
    
    def __init__(self, base_path: str):
        self.base_path = os.path.abspath(base_path)

    def run(self, relative_path: str) -> str:
        """Create a new folder at the given relative path"""
        try:
            full_path = os.path.abspath(os.path.join(self.base_path, relative_path))
            
            # Security check
            if not full_path.startswith(self.base_path):
                return "Error: Access denied. Cannot create folders outside of repo."
            
            if os.path.exists(full_path):
                return f"Info: Folder already exists at {relative_path}"
                
            os.makedirs(full_path, exist_ok=True)
            return f"Successfully created folder at {relative_path}"
        except Exception as e:
            logger.error(f"FolderCreatorTool error: {str(e)}")
            return f"Error creating folder: {str(e)}"
