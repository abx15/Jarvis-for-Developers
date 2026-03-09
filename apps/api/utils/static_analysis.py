from typing import List, Dict, Any
from utils.code_parser import CodeParser
from utils.logger import logger

class StaticAnalyzer:
    """Wrapper service for various static analysis tools"""
    
    def __init__(self):
        self.parser = CodeParser()

    async def analyze_file(self, content: str, language: str) -> List[Dict[str, Any]]:
        """Run analysis on a specific file based on its language"""
        try:
            if language.lower() in ["python", "py"]:
                return self.parser.analyze_python(content)
            elif language.lower() in ["javascript", "js", "typescript", "ts", "tsx", "jsx"]:
                return self.parser.analyze_javascript(content)
            else:
                # Generic checks for other languages
                return []
        except Exception as e:
            logger.error(f"Analysis error for {language}: {e}")
            return []

    async def scan_for_secrets(self, content: str) -> List[Dict[str, Any]]:
        """Look for API keys or secrets in code"""
        secrets_patterns = ["API_KEY", "SECRET", "PASSWORD", "private_key"]
        issues = []
        for pattern in secrets_patterns:
            if pattern in content.upper():
                issues.append({
                    "type": "Security Risk",
                    "description": f"Potential sensitive information found: '{pattern}'",
                    "severity": "high"
                })
        return issues
