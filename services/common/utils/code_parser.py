import ast
from typing import List, Dict, Any

class CodeParser:
    """Utility to parse code and identify patterns using AST"""
    
    @staticmethod
    def analyze_python(code: str) -> List[Dict[str, Any]]:
        """Identify common bugs in Python code using AST"""
        issues = []
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                # 1. Detect infinite loops (simple check for while True)
                if isinstance(node, ast.While):
                    if isinstance(node.test, ast.Constant) and node.test.value is True:
                        # Check for break statement in body
                        has_break = any(isinstance(n, ast.Break) for n in ast.walk(node))
                        if not has_break:
                            issues.append({
                                "type": "Infinite Loop",
                                "description": "While True loop detected without a clear break statement.",
                                "severity": "high",
                                "line": node.lineno
                            })
                
                # 2. Detect unused variables in function scope
                if isinstance(node, ast.FunctionDef):
                    all_ids = {n.id for n in ast.walk(node) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)}
                    used_ids = {n.id for n in ast.walk(node) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load)}
                    unused = all_ids - used_ids
                    for var in unused:
                        issues.append({
                            "type": "Unused Variable",
                            "description": f"Variable '{var}' is assigned but never used.",
                            "severity": "low",
                            "line": node.lineno # Approximate
                        })

                # 3. Detect potentially unsafe eval() usage
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name) and node.func.id == 'eval':
                        issues.append({
                            "type": "Security Risk",
                            "description": "Potentially unsafe use of eval() detected.",
                            "severity": "critical",
                            "line": node.lineno
                        })
            
            return issues
        except Exception as e:
            # If parsing fails, it's a syntax error
            return [{
                "type": "Syntax Error",
                "description": str(e),
                "severity": "high",
                "line": 1
            }]

    @staticmethod
    def analyze_javascript(code: str) -> List[Dict[str, Any]]:
        """Simplified pattern matching for JS bugs since we don't have a JS parser in python easily"""
        issues = []
        # Check for console.log in production (low severity)
        if "console.log(" in code:
             issues.append({
                "type": "Log Issue",
                "description": "console.log found in production code.",
                "severity": "low"
            })
        
        # Check for innerHTML (XSS risk)
        if ".innerHTML =" in code:
            issues.append({
                "type": "Security Risk",
                "description": "Use of innerHTML detected, potential XSS risk.",
                "severity": "high"
            })
            
        return issues
