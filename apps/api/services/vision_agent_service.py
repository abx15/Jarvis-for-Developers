"""
Vision Agent Service
Integrates vision analysis with AI agents for contextual understanding
"""

import json
from typing import Dict, Any, List, Optional
from services.vision_service import VisionService, ScreenAnalysis, VisionInsight
from services.ai_agents import AgentOrchestrator
from utils.logger import logger
from config import settings


class VisionAgentService:
    def __init__(self):
        self.vision_service = VisionService()
        self.agent_orchestrator = AgentOrchestrator()
        
    async def analyze_with_context(
        self,
        image_path: str,
        analysis_type: str = "general",
        repo_context: Optional[Dict[str, Any]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze screenshot with full AI agent context
        
        Args:
            image_path: Path to screenshot
            analysis_type: Type of analysis
            repo_context: Repository information (files, structure, etc.)
            user_context: User preferences and history
        
        Returns:
            Enhanced analysis with agent insights
        """
        try:
            # Perform basic vision analysis
            vision_analysis = await self.vision_service.analyze_screenshot(
                image_path, analysis_type, repo_context
            )
            
            # Generate AI insight
            vision_insight = await self.vision_service.generate_ai_insight(
                vision_analysis, repo_context
            )
            
            # Enhance with agent reasoning
            agent_analysis = await self._get_agent_analysis(
                vision_analysis, vision_insight, repo_context, user_context
            )
            
            # Generate actionable recommendations
            recommendations = await self._generate_recommendations(
                vision_analysis, vision_insight, agent_analysis, repo_context
            )
            
            return {
                "vision_analysis": {
                    "detected_elements": vision_analysis.detected_elements,
                    "text_content": vision_analysis.text_content,
                    "layout_info": vision_analysis.layout_info,
                    "code_blocks": vision_analysis.code_blocks,
                    "error_messages": vision_analysis.error_messages,
                    "confidence": vision_analysis.confidence,
                    "analysis_type": vision_analysis.analysis_type
                },
                "vision_insight": {
                    "problem_type": vision_insight.problem_type,
                    "description": vision_insight.description,
                    "suggested_fix": vision_insight.suggested_fix,
                    "relevant_files": vision_insight.relevant_files,
                    "confidence": vision_insight.confidence,
                    "priority": vision_insight.priority
                },
                "agent_analysis": agent_analysis,
                "recommendations": recommendations,
                "context_used": {
                    "repo_available": repo_context is not None,
                    "user_context_available": user_context is not None,
                    "enhanced_reasoning": True
                }
            }
            
        except Exception as e:
            logger.error(f"Vision agent analysis failed: {e}")
            raise

    async def _get_agent_analysis(
        self,
        vision_analysis: ScreenAnalysis,
        vision_insight: VisionInsight,
        repo_context: Optional[Dict[str, Any]],
        user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Get AI agent analysis of the vision results"""
        
        # Prepare context for agent
        agent_context = {
            "vision_analysis": {
                "type": vision_analysis.analysis_type,
                "confidence": vision_analysis.confidence,
                "elements_detected": len(vision_analysis.detected_elements),
                "errors_found": len(vision_analysis.error_messages),
                "code_blocks": len(vision_analysis.code_blocks)
            },
            "primary_issue": {
                "type": vision_insight.problem_type,
                "description": vision_insight.description,
                "priority": vision_insight.priority
            }
        }
        
        # Add repo context if available
        if repo_context:
            agent_context["repository"] = {
                "files": repo_context.get("files", [])[:10],  # Limit to prevent token overflow
                "language": repo_context.get("primary_language"),
                "framework": repo_context.get("framework"),
                "recent_changes": repo_context.get("recent_commits", [])[:5]
            }
        
        # Add user context if available
        if user_context:
            agent_context["user"] = {
                "skill_level": user_context.get("skill_level"),
                "preferences": user_context.get("preferences", {}),
                "recent_activity": user_context.get("recent_activity", [])
            }
        
        # Create agent prompt
        prompt = self._create_agent_prompt(agent_context)
        
        try:
            # Get agent response
            agent_response = await self.agent_orchestrator.process_request({
                "type": "vision_analysis",
                "prompt": prompt,
                "context": agent_context,
                "agent_type": "code_analyst" if vision_analysis.analysis_type == "code" else "general_assistant"
            })
            
            return {
                "reasoning": agent_response.get("reasoning", ""),
                "confidence": agent_response.get("confidence", 0.8),
                "agent_used": agent_response.get("agent_type", "general_assistant"),
                "additional_insights": agent_response.get("insights", []),
                "related_patterns": agent_response.get("patterns", [])
            }
            
        except Exception as e:
            logger.error(f"Agent analysis failed: {e}")
            return {
                "reasoning": "Agent analysis unavailable",
                "confidence": 0.5,
                "agent_used": "fallback",
                "additional_insights": [],
                "related_patterns": []
            }

    def _create_agent_prompt(self, context: Dict[str, Any]) -> str:
        """Create prompt for AI agent based on vision analysis context"""
        
        prompt = """You are an AI assistant analyzing a screenshot for a developer. 

Based on the vision analysis:
- Analysis type: {vision_analysis[type]}
- Confidence: {vision_analysis[confidence]}%
- Elements detected: {vision_analysis[elements_detected]}
- Errors found: {vision_analysis[errors_found]}
- Code blocks: {vision_analysis[code_blocks]}

Primary issue identified: {primary_issue[type]} - {primary_issue[description]}
Priority: {primary_issue[priority]}""".format(**context)
        
        if "repository" in context:
            repo = context["repository"]
            prompt += f"""

Repository context:
- Primary language: {repo.get('language', 'Unknown')}
- Framework: {repo.get('framework', 'Unknown')}
- Recent files: {', '.join(repo.get('files', [])[:5])}"""
        
        prompt += """

Provide:
1. Detailed reasoning about the issue
2. Potential root causes
3. Best practices related to this issue
4. Common patterns or anti-patterns
5. Additional context that might help the developer

Be specific, actionable, and consider the developer's workflow."""
        
        return prompt

    async def _generate_recommendations(
        self,
        vision_analysis: ScreenAnalysis,
        vision_insight: VisionInsight,
        agent_analysis: Dict[str, Any],
        repo_context: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        # Basic fix recommendation
        recommendations.append({
            "type": "immediate_fix",
            "title": "Immediate Fix",
            "description": vision_insight.suggested_fix,
            "priority": "high",
            "estimated_time": "5-10 minutes",
            "steps": [vision_insight.suggested_fix]
        })
        
        # Code-related recommendations
        if vision_analysis.code_blocks:
            for block in vision_analysis.code_blocks:
                if block.get("issues"):
                    recommendations.append({
                        "type": "code_improvement",
                        "title": f"Code Issues in {block['language']}",
                        "description": f"Found {len(block['issues'])} issues in detected code",
                        "priority": "medium",
                        "estimated_time": "15-30 minutes",
                        "steps": [issue["message"] for issue in block["issues"]]
                    })
        
        # Error-specific recommendations
        if vision_analysis.error_messages:
            error = vision_analysis.error_messages[0]
            if error["type"] == "module_not_found":
                module_name = error["message"].split("'")[1] if "'" in error["message"] else "unknown"
                recommendations.append({
                    "type": "dependency_fix",
                    "title": "Install Missing Dependency",
                    "description": f"Install the {module_name} package",
                    "priority": "high",
                    "estimated_time": "2-5 minutes",
                    "steps": [
                        f"npm install {module_name}" if repo_context and repo_context.get("package_manager") == "npm" else f"pip install {module_name}",
                        "Verify installation",
                        "Restart development server if needed"
                    ]
                })
        
        # Agent-enhanced recommendations
        if agent_analysis.get("additional_insights"):
            for insight in agent_analysis["additional_insights"]:
                recommendations.append({
                    "type": "best_practice",
                    "title": "Best Practice Recommendation",
                    "description": insight,
                    "priority": "medium",
                    "estimated_time": "10-20 minutes",
                    "steps": ["Review current implementation", "Apply suggested improvement", "Test changes"]
                })
        
        # Learning resources
        if vision_analysis.analysis_type == "code":
            recommendations.append({
                "type": "learning",
                "title": "Learning Resources",
                "description": "Improve your understanding of related concepts",
                "priority": "low",
                "estimated_time": "30-60 minutes",
                "steps": [
                    "Review documentation for detected language/framework",
                    "Explore related tutorials",
                    "Check for similar issues in community forums"
                ]
            })
        
        return recommendations

    async def analyze_error_pattern(
        self,
        error_messages: List[Dict[str, Any]],
        repo_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze error patterns across multiple screenshots"""
        
        if not error_messages:
            return {"patterns": [], "recommendations": []}
        
        # Group errors by type
        error_types = {}
        for error in error_messages:
            error_type = error.get("type", "unknown")
            if error_type not in error_types:
                error_types[error_type] = []
            error_types[error_type].append(error)
        
        # Identify patterns
        patterns = []
        for error_type, errors in error_types.items():
            if len(errors) > 1:
                patterns.append({
                    "type": error_type,
                    "frequency": len(errors),
                    "description": f"Repeated {error_type.replace('_', ' ')} errors",
                    "severity": "high" if error_type == "module_not_found" else "medium"
                })
        
        # Generate pattern-based recommendations
        recommendations = []
        for pattern in patterns:
            if pattern["type"] == "module_not_found":
                recommendations.append({
                    "type": "dependency_management",
                    "title": "Improve Dependency Management",
                    "description": "Multiple missing dependency errors detected",
                    "priority": "high",
                    "steps": [
                        "Review package.json/requirements.txt",
                        "Install all missing dependencies",
                        "Consider using package manager scripts",
                        "Set up dependency checking in CI/CD"
                    ]
                })
        
        return {
            "patterns": patterns,
            "recommendations": recommendations,
            "total_errors": len(error_messages),
            "unique_error_types": len(error_types)
        }

    async def get_visual_learning_insights(
        self,
        analysis_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate learning insights from analysis history"""
        
        if not analysis_history:
            return {"insights": [], "progress": {}}
        
        # Analyze common issues
        issue_counts = {}
        language_counts = {}
        
        for analysis in analysis_history:
            problem_type = analysis.get("problem_type", "unknown")
            issue_counts[problem_type] = issue_counts.get(problem_type, 0) + 1
            
            # Extract language info if available
            if analysis.get("language"):
                language = analysis["language"]
                language_counts[language] = language_counts.get(language, 0) + 1
        
        # Generate insights
        insights = []
        
        # Most common issues
        if issue_counts:
            most_common = max(issue_counts, key=issue_counts.get)
            insights.append({
                "type": "common_pattern",
                "title": f"Most Common Issue: {most_common.replace('_', ' ')}",
                "description": f"This issue appeared {issue_counts[most_common]} times",
                "recommendation": "Focus on understanding this concept better"
            })
        
        # Language diversity
        if len(language_counts) > 1:
            insights.append({
                "type": "language_diversity",
                "title": "Multi-Language Development",
                "description": f"Working with {len(language_counts)} different languages",
                "recommendation": "Consider specializing or improving cross-language knowledge"
            })
        
        # Progress tracking
        progress = {
            "total_analyses": len(analysis_history),
            "issues_resolved": sum(1 for a in analysis_history if a.get("resolved", False)),
            "confidence_improvement": self._calculate_confidence_trend(analysis_history)
        }
        
        return {
            "insights": insights,
            "progress": progress,
            "skill_areas": list(issue_counts.keys()),
            "languages_used": list(language_counts.keys())
        }

    def _calculate_confidence_trend(self, history: List[Dict[str, Any]]) -> str:
        """Calculate confidence trend over time"""
        if len(history) < 2:
            return "insufficient_data"
        
        recent_confidence = history[-1].get("confidence", 0)
        earlier_confidence = history[0].get("confidence", 0)
        
        if recent_confidence > earlier_confidence + 0.1:
            return "improving"
        elif recent_confidence < earlier_confidence - 0.1:
            return "declining"
        else:
            return "stable"
