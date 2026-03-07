"""
Vision Service
Handles screen understanding, image analysis, and visual context extraction
"""

import os
import io
import base64
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image
import numpy as np
import json
import requests
from dataclasses import dataclass

from utils.logger import logger
from config import settings


@dataclass
class ScreenAnalysis:
    """Screen analysis result"""
    detected_elements: List[Dict[str, Any]]
    text_content: List[str]
    layout_info: Dict[str, Any]
    code_blocks: List[Dict[str, Any]]
    error_messages: List[Dict[str, Any]]
    confidence: float
    analysis_type: str


@dataclass
class VisionInsight:
    """AI-generated insight from visual analysis"""
    problem_type: str
    description: str
    suggested_fix: str
    relevant_files: List[str]
    confidence: float
    priority: str


class VisionService:
    def __init__(self):
        self.vision_api_key = settings.OPENAI_API_KEY  # or other vision API
        self.supported_formats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
        self.upload_dir = "uploads/vision"
        os.makedirs(self.upload_dir, exist_ok=True)

    async def analyze_screenshot(
        self, 
        image_path: str, 
        analysis_type: str = "general",
        context: Optional[Dict[str, Any]] = None
    ) -> ScreenAnalysis:
        """
        Analyze screenshot for visual understanding
        
        Args:
            image_path: Path to screenshot file
            analysis_type: Type of analysis (general, code, ui, error, layout)
            context: Additional context (repo info, user preferences)
        
        Returns:
            ScreenAnalysis object with detected elements and insights
        """
        try:
            # Validate image
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Read and process image
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize for API limits if needed
                max_size = (1920, 1080)
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Convert to base64 for API calls
                buffered = io.BytesIO()
                img.save(buffered, format="PNG")
                image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            # Perform analysis based on type
            if analysis_type == "code":
                return await self._analyze_code_screenshot(image_base64, img.size, context)
            elif analysis_type == "error":
                return await self._analyze_error_screenshot(image_base64, img.size, context)
            elif analysis_type == "ui":
                return await self._analyze_ui_screenshot(image_base64, img.size, context)
            else:
                return await self._analyze_general_screenshot(image_base64, img.size, context)
                
        except Exception as e:
            logger.error(f"Screenshot analysis failed: {e}")
            raise

    async def _analyze_general_screenshot(
        self, 
        image_base64: str, 
        image_size: Tuple[int, int],
        context: Optional[Dict[str, Any]] = None
    ) -> ScreenAnalysis:
        """General screenshot analysis"""
        
        # Simulated vision API call
        detected_elements = [
            {
                "type": "text_area",
                "content": "Terminal output",
                "position": [50, 100, 600, 400],
                "confidence": 0.89
            },
            {
                "type": "button",
                "text": "Run",
                "position": [650, 350, 700, 380],
                "confidence": 0.94
            }
        ]
        
        text_content = [
            "npm install",
            "Error: Cannot find module 'axios'",
            "Package.json not found"
        ]
        
        layout_info = {
            "screen_size": image_size,
            "main_areas": ["terminal", "toolbar", "sidebar"],
            "color_scheme": ["#000000", "#ffffff", "#ff0000"]
        }
        
        return ScreenAnalysis(
            detected_elements=detected_elements,
            text_content=text_content,
            layout_info=layout_info,
            code_blocks=[],
            error_messages=[],
            confidence=0.87,
            analysis_type="general"
        )

    async def _analyze_code_screenshot(
        self, 
        image_base64: str, 
        image_size: Tuple[int, int],
        context: Optional[Dict[str, Any]] = None
    ) -> ScreenAnalysis:
        """Code-focused screenshot analysis"""
        
        # Simulated code analysis
        code_blocks = [
            {
                "language": "javascript",
                "start_line": 1,
                "end_line": 15,
                "code": "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => {\n  res.send('Hello World');\n});",
                "confidence": 0.93,
                "issues": [
                    {
                        "type": "missing_port",
                        "line": 5,
                        "message": "Server not listening on any port",
                        "severity": "error"
                    }
                ]
            }
        ]
        
        detected_elements = [
            {
                "type": "code_editor",
                "language": "javascript",
                "position": [20, 50, 800, 600],
                "confidence": 0.95
            }
        ]
        
        return ScreenAnalysis(
            detected_elements=detected_elements,
            text_content=[],
            layout_info={"screen_size": image_size},
            code_blocks=code_blocks,
            error_messages=[],
            confidence=0.93,
            analysis_type="code"
        )

    async def _analyze_error_screenshot(
        self, 
        image_base64: str, 
        image_size: Tuple[int, int],
        context: Optional[Dict[str, Any]] = None
    ) -> ScreenAnalysis:
        """Error message analysis from screenshots"""
        
        error_messages = [
            {
                "type": "module_not_found",
                "message": "Error: Cannot find module 'lodash'",
                "stack_trace": [
                    "at Object.<anonymous> (/app/src/index.js:5:15)",
                    "at Module._compile (internal/modules/cjs/loader.js:999:15)"
                ],
                "file_path": "/app/src/index.js",
                "line_number": 5,
                "confidence": 0.96
            }
        ]
        
        detected_elements = [
            {
                "type": "error_terminal",
                "position": [10, 30, 900, 500],
                "confidence": 0.98
            }
        ]
        
        return ScreenAnalysis(
            detected_elements=detected_elements,
            text_content=["Error: Cannot find module 'lodash'"],
            layout_info={"screen_size": image_size},
            code_blocks=[],
            error_messages=error_messages,
            confidence=0.96,
            analysis_type="error"
        )

    async def _analyze_ui_screenshot(
        self, 
        image_base64: str, 
        image_size: Tuple[int, int],
        context: Optional[Dict[str, Any]] = None
    ) -> ScreenAnalysis:
        """UI/UX analysis from screenshots"""
        
        detected_elements = [
            {
                "type": "button",
                "text": "Submit",
                "position": [300, 400, 400, 440],
                "confidence": 0.91,
                "issues": [
                    {
                        "type": "accessibility",
                        "message": "Button missing aria-label",
                        "severity": "warning"
                    }
                ]
            },
            {
                "type": "form_field",
                "label": "Email",
                "position": [200, 300, 500, 330],
                "confidence": 0.88
            }
        ]
        
        layout_info = {
            "screen_size": image_size,
            "layout_type": "form",
            "alignment_issues": ["misaligned_labels", "inconsistent_spacing"],
            "color_contrast": {"score": 0.73, "issues": ["low_contrast_text"]}
        }
        
        return ScreenAnalysis(
            detected_elements=detected_elements,
            text_content=["Submit", "Email", "Password"],
            layout_info=layout_info,
            code_blocks=[],
            error_messages=[],
            confidence=0.89,
            analysis_type="ui"
        )

    async def generate_ai_insight(
        self, 
        analysis: ScreenAnalysis, 
        context: Optional[Dict[str, Any]] = None
    ) -> VisionInsight:
        """
        Generate AI-powered insights from visual analysis
        
        Args:
            analysis: Screen analysis results
            context: Additional context (repo files, user preferences)
        
        Returns:
            VisionInsight with problem detection and suggestions
        """
        try:
            # Analyze detected issues and generate insights
            if analysis.error_messages:
                error = analysis.error_messages[0]
                if error["type"] == "module_not_found":
                    return VisionInsight(
                        problem_type="missing_dependency",
                        description=f"Missing module '{error['message'].split('\'')[1]}' detected in {error['file_path']}",
                        suggested_fix=f"Run: npm install {error['message'].split('\'')[1]}",
                        relevant_files=[error["file_path"], "package.json"],
                        confidence=error["confidence"],
                        priority="high"
                    )
            
            if analysis.code_blocks:
                code_block = analysis.code_blocks[0]
                if code_block["issues"]:
                    issue = code_block["issues"][0]
                    if issue["type"] == "missing_port":
                        return VisionInsight(
                            problem_type="server_configuration",
                            description="Express server is not configured to listen on any port",
                            suggested_fix="Add: app.listen(3000, () => console.log('Server running on port 3000'));",
                            relevant_files=[context.get("file_path", "server.js") if context else "server.js"],
                            confidence=0.92,
                            priority="medium"
                        )
            
            if analysis.analysis_type == "ui" and analysis.layout_info.get("alignment_issues"):
                return VisionInsight(
                    problem_type="ui_alignment",
                    description="UI alignment issues detected that may affect user experience",
                    suggested_fix="Review CSS flexbox/grid layouts and ensure consistent spacing",
                    relevant_files=["styles.css", "components/Layout.tsx"],
                    confidence=0.85,
                    priority="low"
                )
            
            # Default insight
            return VisionInsight(
                problem_type="general_analysis",
                description="Screenshot analyzed successfully. No critical issues detected.",
                suggested_fix="Continue with current implementation",
                relevant_files=[],
                confidence=analysis.confidence,
                priority="low"
            )
            
        except Exception as e:
            logger.error(f"AI insight generation failed: {e}")
            raise

    async def extract_text_from_image(self, image_path: str) -> Dict[str, Any]:
        """Extract text content from image using OCR"""
        try:
            # Simulated OCR extraction
            extracted_text = """
            npm run dev
            
            > my-app@1.0.0 dev
            > next dev
            
            ready - started server on http://localhost:3000
            Error: Cannot resolve module 'react-icons'
            """
            
            return {
                "text": extracted_text.strip(),
                "confidence": 0.94,
                "language": "en",
                "blocks": [
                    {
                        "text": "npm run dev",
                        "bbox": [10, 10, 150, 30],
                        "confidence": 0.98
                    },
                    {
                        "text": "Error: Cannot resolve module 'react-icons'",
                        "bbox": [10, 80, 400, 100],
                        "confidence": 0.96
                    }
                ]
            }
            
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            raise

    async def detect_code_language(self, text_content: str) -> str:
        """Detect programming language from text"""
        patterns = {
            "python": [r"def\s+\w+\(", r"import\s+\w+", r"class\s+\w+:", r"print\("],
            "javascript": [r"function\s+\w+\(", r"const\s+\w+\s*=", r"import\s+.*from", r"require\("],
            "typescript": [r"interface\s+\w+", r"type\s+\w+\s*=", r":\s*\w+\[\]", r"as\s+\w+"],
            "java": [r"public\s+class\s+\w+", r"public\s+void\s+\w+\(", r"System\.out\.println"],
            "cpp": [r"#include\s*<.*>", r"int\s+main\s*\(", r"std::", r"cout\s*<<" ],
            "html": [r"<\!DOCTYPE\s+html>", r"<html", r"<div", r"<script"],
            "css": [r"\.?\w+\s*\{", r"background-color:", r"margin:", r"padding:"]
        }
        
        import re
        scores = {}
        
        for lang, lang_patterns in patterns.items():
            score = 0
            for pattern in lang_patterns:
                if re.search(pattern, text_content, re.IGNORECASE):
                    score += 1
            scores[lang] = score
        
        return max(scores, key=scores.get) if any(scores.values()) else "unknown"

    async def save_screenshot(self, image_data: bytes, filename: str) -> str:
        """Save screenshot to storage"""
        try:
            file_path = os.path.join(self.upload_dir, filename)
            with open(file_path, "wb") as f:
                f.write(image_data)
            return file_path
        except Exception as e:
            logger.error(f"Failed to save screenshot: {e}")
            raise

    async def analyze_screen(
        self, 
        file_path: str, 
        analysis_type: str = "general"
    ) -> Dict[str, Any]:
        """Legacy method for backward compatibility"""
        analysis = await self.analyze_screenshot(file_path, analysis_type)
        return {
            "detected_elements": analysis.detected_elements,
            "text_content": analysis.text_content,
            "layout_info": analysis.layout_info,
            "code_blocks": analysis.code_blocks,
            "error_messages": analysis.error_messages,
            "confidence": analysis.confidence,
            "analysis_type": analysis.analysis_type
        }

    async def recognize_gesture(self, file_path: str) -> Dict[str, Any]:
        """Recognize gestures from image"""
        # Placeholder for gesture recognition
        return {
            "gestures": [],
            "confidence": 0.0,
            "message": "Gesture recognition not implemented yet"
        }

    async def extract_code(self, file_path: str, language_hint: str = "") -> Dict[str, Any]:
        """Extract code from image"""
        text_result = await self.extract_text_from_image(file_path)
        detected_language = await self.detect_code_language(text_result["text"])
        
        return {
            "text": text_result["text"],
            "language": detected_language,
            "confidence": text_result["confidence"],
            "blocks": text_result["blocks"]
        }

    async def process_stream(self, stream_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process webcam stream"""
        return {
            "frame_processed": True,
            "timestamp": stream_data.get("timestamp"),
            "analysis": "Stream processing not implemented yet"
        }

    async def cleanup_old_screenshots(self, max_age_hours: int = 24):
        try:
            import time
            current_time = time.time()
            
            for filename in os.listdir(self.upload_dir):
                file_path = os.path.join(self.upload_dir, filename)
                if os.path.isfile(file_path):
                    file_age = current_time - os.path.getctime(file_path)
                    if file_age > max_age_hours * 3600:
                        os.remove(file_path)
                        logger.info(f"Cleaned up old screenshot: {filename}")
                        
        except Exception as e:
            logger.error(f"Screenshot cleanup failed: {e}")
