'use client'

import React, { useState } from 'react'
import {
  Brain,
  Bug,
  AlertTriangle,
  CheckCircle,
  Code,
  FileText,
  Eye,
  Loader2,
  Copy,
  ExternalLink,
  Clock,
  Target,
  Zap
} from 'lucide-react'

interface VisionAnalysis {
  detected_elements: Array<{
    type: string
    content?: string
    text?: string
    position?: number[]
    confidence: number
    issues?: Array<{
      type: string
      message: string
      severity: string
    }>
  }>
  text_content: string[]
  layout_info: {
    screen_size?: number[]
    main_areas?: string[]
    color_scheme?: string[]
    layout_type?: string
    alignment_issues?: string[]
    color_contrast?: any
  }
  code_blocks: Array<{
    language: string
    code: string
    start_line: number
    end_line: number
    confidence: number
    issues?: Array<{
      type: string
      line: number
      message: string
      severity: string
    }>
  }>
  error_messages: Array<{
    type: string
    message: string
    file_path?: string
    line_number?: number
    stack_trace?: string[]
    confidence: number
  }>
  confidence: number
  analysis_type: string
}

interface VisionInsight {
  problem_type: string
  description: string
  suggested_fix: string
  relevant_files: string[]
  confidence: number
  priority: 'low' | 'medium' | 'high'
}

interface VisionAnalysisPanelProps {
  analysis: VisionAnalysis
  insight: VisionInsight
  isLoading?: boolean
  onCopyToClipboard?: (text: string) => void
}

export function VisionAnalysisPanel({
  analysis,
  insight,
  isLoading = false,
  onCopyToClipboard
}: VisionAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'insight' | 'elements' | 'code' | 'errors' | 'layout'>('insight')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-green-400 bg-green-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getProblemIcon = (problemType: string) => {
    switch (problemType) {
      case 'missing_dependency': return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'server_configuration': return <Bug className="w-5 h-5 text-yellow-400" />
      case 'ui_alignment': return <Eye className="w-5 h-5 text-blue-400" />
      case 'syntax_error': return <Code className="w-5 h-5 text-red-400" />
      default: return <Brain className="w-5 h-5 text-purple-400" />
    }
  }

  const copyToClipboard = (text: string) => {
    if (onCopyToClipboard) {
      onCopyToClipboard(text)
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center space-x-3 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <div className="text-center">
            <p className="text-lg font-medium mb-1">Analyzing screenshot...</p>
            <p className="text-sm text-muted-foreground">AI is processing your image</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold">Vision Analysis Results</h3>
            <p className="text-sm text-muted-foreground">
              Confidence: {(analysis.confidence * 100).toFixed(1)}% • Type: {analysis.analysis_type}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(insight.priority)}`}>
          {insight.priority.toUpperCase()} PRIORITY
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 mb-6 bg-black/20 rounded-lg p-1">
        {[
          { id: 'insight', label: 'AI Insight', icon: Brain },
          { id: 'elements', label: 'Elements', icon: Target },
          { id: 'code', label: 'Code', icon: Code, count: analysis.code_blocks.length },
          { id: 'errors', label: 'Errors', icon: AlertTriangle, count: analysis.error_messages.length },
          { id: 'layout', label: 'Layout', icon: Eye }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'insight' && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              {getProblemIcon(insight.problem_type)}
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">{insight.problem_type.replace('_', ' ').toUpperCase()}</h4>
                <p className="text-white/80 mb-4">{insight.description}</p>
                
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-white mb-2 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Suggested Fix</span>
                  </h5>
                  <p className="text-white/80 font-mono text-sm bg-black/30 p-3 rounded">
                    {insight.suggested_fix}
                  </p>
                  <button
                    onClick={() => copyToClipboard(insight.suggested_fix)}
                    className="mt-2 flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy to clipboard</span>
                  </button>
                </div>
                
                {insight.relevant_files.length > 0 && (
                  <div>
                    <h5 className="font-medium text-white mb-2">Relevant Files</h5>
                    <div className="flex flex-wrap gap-2">
                      {insight.relevant_files.map((file, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{file}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="space-y-4">
            {analysis.detected_elements.length > 0 ? (
              analysis.detected_elements.map((element, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-white capitalize">{element.type.replace('_', ' ')}</h5>
                    <span className="text-xs text-muted-foreground">
                      {(element.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  
                  {(element.content || element.text) && (
                    <p className="text-white/80 text-sm mb-2">
                      {element.content || element.text}
                    </p>
                  )}
                  
                  {element.position && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Position: [{element.position.join(', ')}]
                    </p>
                  )}
                  
                  {element.issues && element.issues.length > 0 && (
                    <div className="space-y-1">
                      {element.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="text-sm">
                          <span className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}:
                          </span>
                          <span className="text-white/70 ml-2">{issue.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No elements detected</p>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            {analysis.code_blocks.length > 0 ? (
              analysis.code_blocks.map((block, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-white">{block.language}</span>
                      <span className="text-xs text-muted-foreground">
                        Lines {block.start_line}-{block.end_line}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(block.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  
                  <pre className="bg-black/30 p-3 rounded text-sm text-white/80 overflow-x-auto mb-3">
                    <code>{block.code}</code>
                  </pre>
                  
                  {block.issues && block.issues.length > 0 && (
                    <div className="space-y-2">
                      <h6 className="text-sm font-medium text-red-400">Issues:</h6>
                      {block.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="text-sm bg-red-500/10 border border-red-500/20 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <span className={getSeverityColor(issue.severity)}>
                              {issue.severity.toUpperCase()}
                            </span>
                            <span className="text-white/70">Line {issue.line}:</span>
                          </div>
                          <p className="text-white/80 mt-1">{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No code blocks detected</p>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-4">
            {analysis.error_messages.length > 0 ? (
              analysis.error_messages.map((error, index) => (
                <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-red-400 capitalize">{error.type.replace('_', ' ')}</h5>
                    <span className="text-xs text-muted-foreground">
                      {(error.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  
                  <p className="text-white/80 font-mono text-sm mb-2">{error.message}</p>
                  
                  {error.file_path && (
                    <p className="text-xs text-muted-foreground mb-1">
                      File: {error.file_path}
                      {error.line_number && `:${error.line_number}`}
                    </p>
                  )}
                  
                  {error.stack_trace && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                        View stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-white/60 bg-black/30 p-2 rounded overflow-x-auto">
                        {error.stack_trace.join('\n')}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-muted-foreground">No errors detected</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.layout_info.screen_size && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">Screen Size</h5>
                  <p className="text-white/80">
                    {analysis.layout_info.screen_size[0]} × {analysis.layout_info.screen_size[1]}
                  </p>
                </div>
              )}
              
              {analysis.layout_info.main_areas && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">Main Areas</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.layout_info.main_areas.map((area, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.layout_info.layout_type && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">Layout Type</h5>
                  <p className="text-white/80 capitalize">{analysis.layout_info.layout_type}</p>
                </div>
              )}
              
              {analysis.layout_info.color_scheme && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-2">Color Scheme</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.layout_info.color_scheme.map((color, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-white/60">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {analysis.layout_info.alignment_issues && analysis.layout_info.alignment_issues.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h5 className="font-medium text-yellow-400 mb-2">Alignment Issues</h5>
                <ul className="space-y-1">
                  {analysis.layout_info.alignment_issues.map((issue, index) => (
                    <li key={index} className="text-sm text-white/80">
                      • {issue.replace('_', ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.layout_info.color_contrast && (
              <div className="bg-white/5 rounded-lg p-4">
                <h5 className="font-medium text-white mb-2">Color Contrast</h5>
                <p className="text-white/80">Score: {analysis.layout_info.color_contrast.score}</p>
                {analysis.layout_info.color_contrast.issues && (
                  <ul className="mt-2 space-y-1">
                    {analysis.layout_info.color_contrast.issues.map((issue: string, index: number) => (
                      <li key={index} className="text-sm text-yellow-400">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
