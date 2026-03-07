# Screen Understanding System - Vision AI

## Overview

The Screen Understanding System allows developers to share their screen or upload screenshots so the AI system can understand what is happening and provide intelligent assistance.

## Features

### 🎯 Core Capabilities
- **Screen Capture**: Direct screen sharing using browser APIs
- **Screenshot Upload**: Drag-and-drop image upload
- **Visual Analysis**: AI-powered image understanding
- **Error Detection**: Automatic error message identification
- **Code Analysis**: Extract and analyze code from screenshots
- **UI/UX Insights**: Interface analysis and recommendations

### 🧠 AI Integration
- **Context-Aware Analysis**: Integration with repository context
- **Agent Reasoning**: Multi-agent collaborative analysis
- **Pattern Recognition**: Learning from historical analysis
- **Smart Recommendations**: Actionable fix suggestions

## Architecture

```
Frontend (Next.js)
├── ScreenCapture.tsx     # Screen sharing component
├── ScreenshotUploader.tsx # File upload component
└── VisionAnalysisPanel.tsx # Results display

Backend (FastAPI)
├── vision_service.py     # Core vision processing
├── vision_agent_service.py # AI agent integration
└── routes/vision.py      # API endpoints

Vision Engine Service
├── OCR Processing        # Text extraction
├── Object Detection      # UI element identification
└── Image Analysis        # Visual understanding
```

## API Endpoints

### Basic Analysis
```http
POST /api/v1/vision/analyze
Content-Type: multipart/form-data

image_file: [image]
analysis_type: general|code|error|ui
context: [optional JSON]
```

### Enhanced Analysis with Context
```http
POST /api/v1/vision/analyze-with-context
Content-Type: multipart/form-data

image_file: [image]
analysis_type: general|code|error|ui
repo_context: [repository information JSON]
user_context: [user preferences JSON]
```

### Simple Upload
```http
POST /api/v1/vision/screenshot
Content-Type: multipart/form-data

image_file: [image]
```

### Pattern Analysis
```http
POST /api/v1/vision/error-patterns
Content-Type: application/json

{
  "error_messages": [...],
  "repo_context": {...}
}
```

## Usage Examples

### 1. Error Message Analysis

**Scenario**: User uploads a screenshot of a terminal error

**Input**: Screenshot showing "Module not found: 'lodash'"

**AI Response**:
```json
{
  "vision_insight": {
    "problem_type": "missing_dependency",
    "description": "Missing module 'lodash' detected in node_modules",
    "suggested_fix": "Run: npm install lodash",
    "relevant_files": ["package.json"],
    "confidence": 0.96,
    "priority": "high"
  },
  "recommendations": [
    {
      "type": "immediate_fix",
      "title": "Install Missing Dependency",
      "description": "Install the lodash package",
      "steps": ["npm install lodash", "Verify installation", "Restart server"]
    }
  ]
}
```

### 2. Code Analysis

**Scenario**: Screenshot of JavaScript code with syntax issues

**AI Response**:
```json
{
  "vision_analysis": {
    "code_blocks": [
      {
        "language": "javascript",
        "code": "const express = require('express');\nconst app = express();",
        "issues": [
          {
            "type": "missing_port",
            "message": "Server not listening on any port",
            "severity": "error"
          }
        ]
      }
    ]
  },
  "agent_analysis": {
    "reasoning": "The Express server is configured but missing the listening port configuration",
    "additional_insights": ["Consider using environment variables for port configuration"]
  }
}
```

### 3. UI/UX Analysis

**Scenario**: Screenshot of a web form

**AI Response**:
```json
{
  "vision_analysis": {
    "detected_elements": [
      {
        "type": "button",
        "text": "Submit",
        "issues": [
          {
            "type": "accessibility",
            "message": "Button missing aria-label",
            "severity": "warning"
          }
        ]
      }
    ],
    "layout_info": {
      "alignment_issues": ["misaligned_labels"],
      "color_contrast": {"score": 0.73, "issues": ["low_contrast_text"]}
    }
  },
  "recommendations": [
    {
      "type": "accessibility_improvement",
      "title": "Add Accessibility Labels",
      "steps": ["Add aria-label to buttons", "Improve color contrast", "Fix label alignment"]
    }
  ]
}
```

## Frontend Integration

### Screen Capture Component

```tsx
import { ScreenCapture } from '@/components/screen/ScreenCapture'

function MyComponent() {
  const handleCapture = async (imageData: string, filename: string) => {
    // Send to API for analysis
    const formData = new FormData()
    formData.append('image_file', dataUrlToBlob(imageData), filename)
    formData.append('analysis_type', 'error')
    
    const response = await fetch('/api/v1/vision/analyze', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    // Handle results
  }

  return (
    <ScreenCapture
      onCapture={handleCapture}
      onError={(error) => console.error(error)}
    />
  )
}
```

### Vision Analysis Panel

```tsx
import { VisionAnalysisPanel } from '@/components/screen/VisionAnalysisPanel'

function ResultsDisplay({ analysis, insight }) {
  return (
    <VisionAnalysisPanel
      analysis={analysis}
      insight={insight}
      onCopyToClipboard={(text) => navigator.clipboard.writeText(text)}
    />
  )
}
```

## Advanced Features

### Context-Aware Analysis

Provide repository context for enhanced analysis:

```javascript
const repoContext = {
  files: ['src/index.js', 'package.json', 'README.md'],
  primary_language: 'javascript',
  framework: 'express',
  recent_commits: ['Added new endpoint', 'Fixed authentication']
}

const userContext = {
  skill_level: 'intermediate',
  preferences: { code_style: 'eslint' },
  recent_activity: ['working on authentication', 'learning testing']
}
```

### Pattern Recognition

Analyze recurring issues across multiple screenshots:

```javascript
const errorHistory = [
  { type: 'module_not_found', message: "Cannot find module 'axios'" },
  { type: 'module_not_found', message: "Cannot find module 'lodash'" },
  { type: 'syntax_error', message: 'Unexpected token' }
]

// Detect patterns
const patterns = await analyzeErrorPatterns(errorHistory)
// Returns: dependency_management issues, common syntax problems
```

### Learning Insights

Track progress and identify learning opportunities:

```javascript
const analysisHistory = [
  { problem_type: 'missing_dependency', confidence: 0.8, resolved: true },
  { problem_type: 'syntax_error', confidence: 0.9, resolved: true },
  { problem_type: 'ui_alignment', confidence: 0.7, resolved: false }
]

const insights = await getLearningInsights(analysisHistory)
// Returns: skill gaps, improvement areas, progress tracking
```

## Configuration

### Environment Variables

```bash
# Vision API Configuration
OPENAI_API_KEY=your_openai_api_key
VISION_MODEL=gpt-4-vision-preview

# File Upload Settings
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=uploads/vision

# Analysis Settings
DEFAULT_ANALYSIS_TYPE=general
ENABLE_AGENT_CONTEXT=true
```

### Service Configuration

```python
# config.py
VISION_CONFIG = {
    "max_image_size": (1920, 1080),
    "supported_formats": ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'],
    "ocr_confidence_threshold": 0.8,
    "analysis_timeout": 30,
    "enable_agent_reasoning": True
}
```

## Best Practices

### For Developers

1. **Provide Context**: Include repository information when available
2. **Choose Analysis Type**: Select appropriate analysis type for better results
3. **Handle Errors**: Implement proper error handling for API failures
4. **Optimize Images**: Resize large images before upload for faster processing

### For Users

1. **Clear Screenshots**: Ensure text is readable and errors are visible
2. **Complete Context**: Include relevant code and error messages
3. **Follow Recommendations**: Apply AI suggestions systematically
4. **Track Progress**: Use history to monitor improvement over time

## Troubleshooting

### Common Issues

**Screen capture not working**
- Ensure browser permissions are granted
- Check if using HTTPS (required for screen sharing)
- Verify browser compatibility (Chrome, Firefox, Edge)

**Analysis fails**
- Check image format and size limits
- Verify API key configuration
- Review server logs for detailed errors

**Poor OCR results**
- Ensure image resolution is adequate
- Check text contrast and clarity
- Try different image formats (PNG recommended)

### Debug Mode

Enable debug logging:

```python
import logging
logging.getLogger('vision_service').setLevel(logging.DEBUG)
```

## Future Enhancements

### Planned Features

- **Real-time Video Analysis**: Live screen sharing with continuous analysis
- **Multi-language Support**: Enhanced OCR for international languages
- **Custom Training**: Fine-tune models for specific codebases
- **Integration IDE**: Direct IDE plugin for seamless workflow
- **Voice Integration**: Combine voice commands with visual analysis

### Technical Improvements

- **Model Optimization**: Faster processing with smaller models
- **Caching**: Store analysis results for similar images
- **Batch Processing**: Analyze multiple screenshots simultaneously
- **Edge Computing**: On-device processing for privacy

## Support

For issues and questions:
- Check the [troubleshooting guide](#troubleshooting)
- Review API documentation
- Contact development team
- Check system logs for detailed error information

---

**Note**: This system is designed to assist developers but should not replace human judgment. Always verify AI suggestions before applying to production code.
