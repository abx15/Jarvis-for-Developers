"""
AI Editor Service for real-time code suggestions and analysis
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import re
import ast

logger = logging.getLogger(__name__)

class SuggestionType(Enum):
    REFACTOR = "refactor"
    OPTIMIZATION = "optimization"
    ERROR_FIX = "error_fix"
    STYLE_IMPROVEMENT = "style_improvement"
    TYPE_HINT = "type_hint"
    SECURITY = "security"

@dataclass
class CodeContext:
    file_path: str
    language: str
    line_number: int
    column_number: int
    surrounding_code: str
    full_content: str

@dataclass
class AISuggestion:
    text: str
    suggestion_type: SuggestionType
    confidence: float
    context: Dict[str, Any]
    priority: str  # 'high', 'medium', 'low'

class AIEditorService:
    def __init__(self):
        self.patterns = {
            'python': {
                'long_function': re.compile(r'def\s+\w+\([^)]*\):\s*(?:.*\n){10,}'),
                'duplicate_code': re.compile(r'(\w+\s*=\s*[^#\n]+)\n.*\1'),
                'missing_type_hints': re.compile(r'def\s+(\w+)\([^)]*\):'),
                'long_variable': re.compile(r'(\w{20,})\s*='),
                'magic_numbers': re.compile(r'\b(10|100|1000|3600|86400)\b'),
                'bare_except': re.compile(r'except:\s*$'),
                'unused_import': re.compile(r'import\s+(\w+)\s*$'),
            },
            'javascript': {
                'var_usage': re.compile(r'\bvar\s+(\w+)'),
                'missing_semicolons': re.compile(r'[^\s;]\n'),
                'console_log': re.compile(r'console\.log'),
                'long_function': re.compile(r'function\s+\w+\([^)]*\)\s*{(?:[^}]*\n){10,}'),
            },
            'typescript': {
                'any_type': re.compile(r':\s*any\b'),
                'missing_type': re.compile(r'function\s+\w+\([^)]*)\s*{'),
                'interface_missing': re.compile(r'type\s+\w+\s*='),
            }
        }
        
        self.suggestion_templates = {
            SuggestionType.REFACTOR: [
                "Consider refactoring this {element} into smaller functions",
                "This {element} is too long and could be broken down",
                "Extract this logic into a separate {element}",
            ],
            SuggestionType.OPTIMIZATION: [
                "This loop could be optimized using {method}",
                "Consider using {alternative} for better performance",
                "This operation can be simplified with {pattern}",
            ],
            SuggestionType.ERROR_FIX: [
                "Add error handling here with try-except block",
                "This might raise an exception, consider validation",
                "Add null/undefined check before accessing {property}",
            ],
            SuggestionType.STYLE_IMPROVEMENT: [
                "Use {style} instead for better readability",
                "Consider renaming {element} to {suggestion}",
                "Add proper documentation for this {element}",
            ],
            SuggestionType.TYPE_HINT: [
                "Add type hints for better code clarity",
                "Specify return type for this function",
                "Add parameter types to improve IDE support",
            ],
            SuggestionType.SECURITY: [
                "This could be a security vulnerability",
                "Consider sanitizing input here",
                "Use secure alternative to {method}",
            ]
        }

    async def analyze_code(self, context: CodeContext) -> List[AISuggestion]:
        """Analyze code and generate AI suggestions"""
        suggestions = []
        
        try:
            # Language-specific analysis
            if context.language == 'python':
                suggestions.extend(await self._analyze_python(context))
            elif context.language in ['javascript', 'typescript']:
                suggestions.extend(await self._analyze_javascript(context))
            
            # General analysis
            suggestions.extend(await self._analyze_general(context))
            
            # Sort by priority and confidence
            suggestions.sort(key=lambda x: (
                {'high': 0, 'medium': 1, 'low': 2}[x.priority],
                -x.confidence
            ))
            
        except Exception as e:
            logger.error(f"Error analyzing code: {e}")
            
        return suggestions[:5]  # Return top 5 suggestions

    async def _analyze_python(self, context: CodeContext) -> List[AISuggestion]:
        """Python-specific code analysis"""
        suggestions = []
        patterns = self.patterns['python']
        
        try:
            # Parse AST for deeper analysis
            tree = ast.parse(context.surrounding_code)
            
            # Check for long functions
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    if len(node.body) > 20:
                        suggestions.append(AISuggestion(
                            text=f"Function '{node.name}' is too long ({len(node.body)} lines). Consider breaking it down.",
                            suggestion_type=SuggestionType.REFACTOR,
                            confidence=0.8,
                            context={'function': node.name, 'lines': len(node.body)},
                            priority='medium'
                        ))
                    
                    # Check for missing type hints
                    if not node.returns:
                        suggestions.append(AISuggestion(
                            text=f"Add return type hint for function '{node.name}'",
                            suggestion_type=SuggestionType.TYPE_HINT,
                            confidence=0.7,
                            context={'function': node.name},
                            priority='low'
                        ))
        
        except SyntaxError:
            # If AST parsing fails, fall back to regex patterns
            pass
        
        # Regex-based pattern matching
        for pattern_name, pattern in patterns.items():
            matches = pattern.findall(context.surrounding_code)
            if matches:
                suggestion = self._create_suggestion_from_pattern(
                    pattern_name, matches, context
                )
                if suggestion:
                    suggestions.append(suggestion)
        
        return suggestions

    async def _analyze_javascript(self, context: CodeContext) -> List[AISuggestion]:
        """JavaScript/TypeScript-specific code analysis"""
        suggestions = []
        patterns = self.patterns.get(context.language, {})
        
        for pattern_name, pattern in patterns.items():
            matches = pattern.findall(context.surrounding_code)
            if matches:
                suggestion = self._create_suggestion_from_pattern(
                    pattern_name, matches, context
                )
                if suggestion:
                    suggestions.append(suggestion)
        
        return suggestions

    async def _analyze_general(self, context: CodeContext) -> List[AISuggestion]:
        """General code analysis applicable to all languages"""
        suggestions = []
        
        # Check for TODO/FIXME comments
        todo_pattern = re.compile(r'#\s*(TODO|FIXME|XXX|HACK)\s*:\s*(.+)', re.IGNORECASE)
        matches = todo_pattern.findall(context.surrounding_code)
        for match_type, comment in matches:
            suggestions.append(AISuggestion(
                text=f"Address {match_type.upper()}: {comment}",
                suggestion_type=SuggestionType.STYLE_IMPROVEMENT,
                confidence=0.9,
                context={'type': match_type, 'comment': comment},
                priority='high' if match_type == 'FIXME' else 'medium'
            ))
        
        # Check for long lines
        lines = context.surrounding_code.split('\n')
        for i, line in enumerate(lines):
            if len(line) > 120:
                suggestions.append(AISuggestion(
                    text=f"Line {i + 1} is too long ({len(line)} chars). Consider breaking it.",
                    suggestion_type=SuggestionType.STYLE_IMPROVEMENT,
                    confidence=0.6,
                    context={'line': i + 1, 'length': len(line)},
                    priority='low'
                ))
        
        return suggestions

    def _create_suggestion_from_pattern(self, pattern_name: str, matches: List[str], context: CodeContext) -> Optional[AISuggestion]:
        """Create suggestion from pattern match"""
        suggestion_map = {
            'long_function': (SuggestionType.REFACTOR, 'high', 0.8),
            'duplicate_code': (SuggestionType.REFACTOR, 'medium', 0.7),
            'missing_type_hints': (SuggestionType.TYPE_HINT, 'low', 0.6),
            'long_variable': (SuggestionType.STYLE_IMPROVEMENT, 'low', 0.5),
            'magic_numbers': (SuggestionType.STYLE_IMPROVEMENT, 'medium', 0.6),
            'bare_except': (SuggestionType.ERROR_FIX, 'high', 0.9),
            'unused_import': (SuggestionType.STYLE_IMPROVEMENT, 'medium', 0.7),
            'var_usage': (SuggestionType.STYLE_IMPROVEMENT, 'medium', 0.6),
            'missing_semicolons': (SuggestionType.STYLE_IMPROVEMENT, 'low', 0.5),
            'console_log': (SuggestionType.STYLE_IMPROVEMENT, 'low', 0.4),
            'any_type': (SuggestionType.TYPE_HINT, 'medium', 0.7),
            'missing_type': (SuggestionType.TYPE_HINT, 'medium', 0.6),
            'interface_missing': (SuggestionType.TYPE_HINT, 'low', 0.5),
        }
        
        if pattern_name not in suggestion_map:
            return None
            
        suggestion_type, priority, confidence = suggestion_map[pattern_name]
        
        # Generate specific suggestion text
        text_templates = self.suggestion_templates.get(suggestion_type, ["Consider {suggestion}"])
        template = text_templates[0]  # Use first template
        
        # Customize text based on pattern
        if pattern_name == 'long_function':
            text = f"Function is too long. Consider breaking it into smaller functions."
        elif pattern_name == 'duplicate_code':
            text = "Duplicate code detected. Consider extracting into a function."
        elif pattern_name == 'missing_type_hints':
            text = "Add type hints for better code documentation and IDE support."
        elif pattern_name == 'long_variable':
            text = f"Variable name '{matches[0]}' is too long. Consider a shorter name."
        elif pattern_name == 'magic_numbers':
            text = f"Magic number {matches[0]} found. Consider using a named constant."
        elif pattern_name == 'bare_except':
            text = "Bare except clause. Catch specific exceptions for better error handling."
        elif pattern_name == 'unused_import':
            text = f"Unused import '{matches[0]}' detected. Remove it."
        elif pattern_name == 'var_usage':
            text = "Use 'let' or 'const' instead of 'var' for better scoping."
        elif pattern_name == 'any_type':
            text = "Avoid using 'any' type. Use specific types for better type safety."
        else:
            text = template.format(suggestion=pattern_name.replace('_', ' '))
        
        return AISuggestion(
            text=text,
            suggestion_type=suggestion_type,
            confidence=confidence,
            context={'pattern': pattern_name, 'matches': matches},
            priority=priority
        )

    async def generate_inline_suggestion(self, context: CodeContext) -> Optional[str]:
        """Generate inline code completion suggestion"""
        # Simple inline suggestions based on context
        lines = context.surrounding_code.split('\n')
        current_line = lines[context.line_number - 1] if context.line_number <= len(lines) else ""
        
        # Check for common patterns
        if context.language == 'python':
            if 'def ' in current_line and ':' not in current_line:
                return ":"
            elif 'import ' in current_line and current_line.strip().endswith('import'):
                return " os"
            elif 'if ' in current_line and ':' not in current_line:
                return ":"
        
        elif context.language in ['javascript', 'typescript']:
            if 'function ' in current_line and '{' not in current_line:
                return " {"
            elif 'if ' in current_line and '{' not in current_line:
                return " {"
            elif current_line.strip().endswith('console.log'):
                return "('')"
        
        return None

    async def explain_code(self, code: str, language: str) -> str:
        """Generate explanation for code snippet"""
        # Simple code explanation (can be enhanced with actual AI)
        if language == 'python':
            if 'def ' in code:
                return "This defines a function. Functions help organize code and promote reuse."
            elif 'class ' in code:
                return "This defines a class. Classes are blueprints for creating objects."
            elif 'import ' in code:
                return "This imports modules. Modules contain code you can reuse."
        
        return "This code performs specific operations to achieve its intended functionality."

# Global AI editor service instance
ai_editor_service = AIEditorService()
