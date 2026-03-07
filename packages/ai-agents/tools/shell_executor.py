import os
import subprocess
from utils.logger import logger

class ShellTool:
    """Tool to execute development commands safely"""
    
    def __init__(self, base_path: str):
        self.base_path = os.path.abspath(base_path)
        # List of disallowed commands for safety
        self.disallowed = ["rm -rf /", "mkfs", "dd", ":(){ :|:& };:"]

    def run(self, command: str) -> str:
        """Execute a shell command within the repository context"""
        try:
            # Basic safety check
            if any(evil in command for evil in self.disallowed):
                return "Error: Command contains restricted patterns."

            # Execute in repo root
            process = subprocess.Popen(
                command,
                shell=True,
                cwd=self.base_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(timeout=30)
            
            if process.returncode == 0:
                return stdout if stdout else "Command executed successfully (no output)."
            else:
                return f"Error (Exit Code {process.returncode}):\n{stderr}"
        except subprocess.TimeoutExpired:
            process.kill()
            return "Error: Command timed out after 30 seconds."
        except Exception as e:
            logger.error(f"ShellTool error: {str(e)}")
            return f"Error executing command: {str(e)}"
