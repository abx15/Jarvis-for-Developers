import subprocess
import os
from utils.logger import logger

class CodeFormatter:
    """Tool to format code using black (Python) and prettier (general)"""
    
    def __init__(self, base_path: str):
        self.base_path = os.path.abspath(base_path)

    def format(self, relative_path: str) -> str:
        """Run standard formatters on a file"""
        full_path = os.path.abspath(os.path.join(self.base_path, relative_path))
        
        if not os.path.exists(full_path):
            return "Error: File to format does not exist."

        try:
            if full_path.endswith(".py"):
                # Run black for Python
                subprocess.run(["black", full_path], check=True, capture_output=True)
                return f"Formatted {relative_path} with black."
            elif any(full_path.endswith(ext) for ext in [".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".md"]):
                # Run prettier for web files (assuming prettier is globally available or in project)
                # We'll stick to a safe command attempt
                try:
                    subprocess.run(["npx", "prettier", "--write", full_path], check=True, capture_output=True)
                    return f"Formatted {relative_path} with prettier."
                except Exception:
                    return f"Warning: Prettier not found. {relative_path} saved but not formatted."
            
            return f"{relative_path} does not support automatic formatting."
        except subprocess.CalledProcessError as e:
            logger.error(f"Formatting failed for {relative_path}: {e.stderr.decode()}")
            return f"Error: Formatting failed. {e.stderr.decode()}"
        except Exception as e:
            return f"Error: {str(e)}"
