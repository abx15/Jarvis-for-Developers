"""
Repository Analyzer Service
Analyzes code repositories for structure, dependencies, and patterns
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import asyncio
import os
import subprocess
from pathlib import Path
import ast
import json

app = FastAPI(title="Repository Analyzer Service", version="0.1.0")


class RepoAnalysisRequest(BaseModel):
    repo_path: str
    analysis_types: List[str] = ["structure", "dependencies", "patterns"]


class FileAnalysis(BaseModel):
    file_path: str
    language: str
    lines_of_code: int
    complexity_score: float
    dependencies: List[str]
    patterns: Dict[str, Any]


class RepoAnalysisResponse(BaseModel):
    repo_path: str
    total_files: int
    languages: Dict[str, int]
    structure: Dict[str, Any]
    files: List[FileAnalysis]
    summary: Dict[str, Any]


class RepoAnalyzer:
    def __init__(self):
        self.supported_extensions = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'react',
            '.tsx': 'react',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
        }

    async def analyze_repository(self, request: RepoAnalysisRequest) -> RepoAnalysisResponse:
        """Analyze a repository structure and content"""
        repo_path = Path(request.repo_path)
        
        if not repo_path.exists():
            raise ValueError(f"Repository path does not exist: {request.repo_path}")

        files = []
        languages = {}
        structure = await self._analyze_structure(repo_path)
        
        for file_path in self._get_code_files(repo_path):
            analysis = await self._analyze_file(file_path)
            files.append(analysis)
            
            # Count languages
            lang = analysis.language
            languages[lang] = languages.get(lang, 0) + 1

        summary = await self._generate_summary(files, languages)
        
        return RepoAnalysisResponse(
            repo_path=str(repo_path),
            total_files=len(files),
            languages=languages,
            structure=structure,
            files=files,
            summary=summary
        )

    def _get_code_files(self, repo_path: Path) -> List[Path]:
        """Get all code files in the repository"""
        code_files = []
        for file_path in repo_path.rglob('*'):
            if file_path.is_file() and file_path.suffix in self.supported_extensions:
                # Skip common directories
                if any(part.startswith('.') for part in file_path.parts):
                    continue
                if 'node_modules' in file_path.parts:
                    continue
                if '__pycache__' in file_path.parts:
                    continue
                code_files.append(file_path)
        return code_files

    async def _analyze_structure(self, repo_path: Path) -> Dict[str, Any]:
        """Analyze repository structure"""
        structure = {
            'directories': [],
            'config_files': [],
            'package_managers': []
        }
        
        for item in repo_path.iterdir():
            if item.is_dir():
                structure['directories'].append(item.name)
            elif item.is_file():
                name = item.name.lower()
                if name in ['package.json', 'requirements.txt', 'pyproject.toml', 'cargo.toml']:
                    structure['package_managers'].append(name)
                elif name.endswith(('.json', '.yaml', '.yml', '.toml', '.ini')):
                    structure['config_files'].append(name)
        
        return structure

    async def _analyze_file(self, file_path: Path) -> FileAnalysis:
        """Analyze a single file"""
        language = self.supported_extensions.get(file_path.suffix, 'unknown')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()

        lines_of_code = len([line for line in content.split('\n') if line.strip()])
        complexity_score = await self._calculate_complexity(content, language)
        dependencies = await self._extract_dependencies(content, language)
        patterns = await self._detect_patterns(content, language)

        return FileAnalysis(
            file_path=str(file_path),
            language=language,
            lines_of_code=lines_of_code,
            complexity_score=complexity_score,
            dependencies=dependencies,
            patterns=patterns
        )

    async def _calculate_complexity(self, content: str, language: str) -> float:
        """Calculate cyclomatic complexity"""
        if language == 'python':
            try:
                tree = ast.parse(content)
                complexity = 1
                for node in ast.walk(tree):
                    if isinstance(node, (ast.If, ast.While, ast.For, ast.Try, ast.With)):
                        complexity += 1
                    elif isinstance(node, ast.ExceptHandler):
                        complexity += 1
                return float(complexity)
            except:
                return 1.0
        else:
            # Simple heuristic for other languages
            control_structures = ['if', 'else', 'for', 'while', 'try', 'catch', 'switch']
            count = sum(content.count(struct) for struct in control_structures)
            return float(max(1, count))

    async def _extract_dependencies(self, content: str, language: str) -> List[str]:
        """Extract dependencies from file"""
        dependencies = []
        
        if language == 'python':
            try:
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            dependencies.append(alias.name)
                    elif isinstance(node, ast.ImportFrom):
                        if node.module:
                            dependencies.append(node.module)
            except:
                pass
        
        elif language in ['javascript', 'typescript']:
            # Simple regex for import statements
            import re
            patterns = [
                r'import.*from [\'"]([^\'"]+)[\'"]',
                r'require\([\'"]([^\'"]+)[\'"]\)'
            ]
            for pattern in patterns:
                matches = re.findall(pattern, content)
                dependencies.extend(matches)
        
        return list(set(dependencies))

    async def _detect_patterns(self, content: str, language: str) -> Dict[str, Any]:
        """Detect code patterns and anti-patterns"""
        patterns = {
            'functions': 0,
            'classes': 0,
            'comments_ratio': 0.0,
            'long_functions': 0,
            'duplicate_code': False
        }
        
        if language == 'python':
            try:
                tree = ast.parse(content)
                for node in ast.walk(tree):
                    if isinstance(node, ast.FunctionDef):
                        patterns['functions'] += 1
                        if len(node.body) > 20:  # Long function heuristic
                            patterns['long_functions'] += 1
                    elif isinstance(node, ast.ClassDef):
                        patterns['classes'] += 1
            except:
                pass
        
        # Calculate comment ratio
        lines = content.split('\n')
        comment_lines = sum(1 for line in lines if line.strip().startswith('#') or 
                          line.strip().startswith('//') or line.strip().startswith('/*'))
        patterns['comments_ratio'] = comment_lines / len(lines) if lines else 0
        
        return patterns

    async def _generate_summary(self, files: List[FileAnalysis], languages: Dict[str, int]) -> Dict[str, Any]:
        """Generate repository summary"""
        total_loc = sum(f.lines_of_code for f in files)
        avg_complexity = sum(f.complexity_score for f in files) / len(files) if files else 0
        
        return {
            'total_lines_of_code': total_loc,
            'average_complexity': avg_complexity,
            'primary_language': max(languages.items(), key=lambda x: x[1])[0] if languages else None,
            'file_count': len(files),
            'high_complexity_files': len([f for f in files if f.complexity_score > 10])
        }


analyzer = RepoAnalyzer()


@app.post("/analyze", response_model=RepoAnalysisResponse)
async def analyze_repository(request: RepoAnalysisRequest):
    """Analyze a repository"""
    return await analyzer.analyze_repository(request)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
