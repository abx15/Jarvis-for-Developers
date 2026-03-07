'use client'

import React, { useState, useCallback } from 'react'
import { ScreenCapture } from '@/components/screen/ScreenCapture'
import { ScreenshotUploader } from '@/components/screen/ScreenshotUploader'
import { VisionAnalysisPanel } from '@/components/screen/VisionAnalysisPanel'
import {
  Eye,
  Brain,
  Camera,
  Upload,
  History,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface Screenshot {
  id: string
  dataUrl: string
  filename: string
  size: number
  timestamp: Date
}

interface VisionAnalysis {
  detected_elements: any[]
  text_content: string[]
  layout_info: any
  code_blocks: any[]
  error_messages: any[]
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

interface AnalysisHistory {
  id: string
  timestamp: Date
  filename: string
  analysis_type: string
  problem_type: string
  confidence: number
  preview: string
}

export default function VisionPage() {
  const [currentScreenshot, setCurrentScreenshot] = useState<Screenshot | null>(null)
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null)
  const [insight, setInsight] = useState<VisionInsight | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<'general' | 'code' | 'error' | 'ui'>('general')
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleCapture = useCallback(async (imageData: string, filename: string) => {
    const screenshot: Screenshot = {
      id: Math.random().toString(36).substr(2, 9),
      dataUrl: imageData,
      filename,
      size: Math.round(imageData.length * 0.75 / 1024), // Approximate size in KB
      timestamp: new Date()
    }
    
    setCurrentScreenshot(screenshot)
    setError(null)
    
    // Automatically start analysis
    await analyzeScreenshot(imageData, filename)
  }, [])

  const handleUpload = useCallback(async (screenshot: Screenshot) => {
    setCurrentScreenshot(screenshot)
    setError(null)
    
    // Automatically start analysis
    await analyzeScreenshot(screenshot.dataUrl, screenshot.filename)
  }, [])

  const analyzeScreenshot = useCallback(async (imageData: string, filename: string) => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Convert data URL to blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      
      // Create form data
      const formData = new FormData()
      formData.append('image_file', blob, filename)
      formData.append('analysis_type', analysisType)
      formData.append('context', JSON.stringify({
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`
      }))
      
      // Send to API
      const apiResponse = await fetch('/api/v1/vision/analyze', {
        method: 'POST',
        body: formData
      })
      
      if (!apiResponse.ok) {
        throw new Error(`Analysis failed: ${apiResponse.statusText}`)
      }
      
      const result = await apiResponse.json()
      
      if (result.success) {
        setAnalysis(result.analysis)
        setInsight(result.insight)
        
        // Add to history
        const historyItem: AnalysisHistory = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          filename,
          analysis_type: result.analysis.analysis_type,
          problem_type: result.insight.problem_type,
          confidence: result.insight.confidence,
          preview: imageData
        }
        
        setHistory((prev: AnalysisHistory[]) => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 items
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
      
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze screenshot')
    } finally {
      setIsAnalyzing(false)
    }
  }, [analysisType])

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  const resetAnalysis = useCallback(() => {
    setCurrentScreenshot(null)
    setAnalysis(null)
    setInsight(null)
    setError(null)
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could show a toast notification here
        console.log('Copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy:', err)
      })
  }, [])

  const loadFromHistory = useCallback((historyItem: AnalysisHistory) => {
    setCurrentScreenshot({
      id: historyItem.id,
      dataUrl: historyItem.preview,
      filename: historyItem.filename,
      size: 0,
      timestamp: historyItem.timestamp
    })
    setShowHistory(false)
    
    // Re-analyze the historical image
    analyzeScreenshot(historyItem.preview, historyItem.filename)
  }, [analyzeScreenshot])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Vision Analysis</h1>
                <p className="text-purple-200">AI-powered screen understanding and visual insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Analysis Type Selector */}
              <select
                value={analysisType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAnalysisType(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="general">General Analysis</option>
                <option value="code">Code Analysis</option>
                <option value="error">Error Detection</option>
                <option value="ui">UI/UX Analysis</option>
              </select>
              
              {/* History Button */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>History</span>
                {history.length > 0 && (
                  <span className="bg-purple-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-medium">
                    {history.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Analysis Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Capture/Upload */}
          <div className="space-y-6">
            {!currentScreenshot ? (
              <>
                <ScreenCapture
                  onCapture={handleCapture}
                  onError={handleError}
                  disabled={isAnalyzing}
                />
                
                <div className="text-center">
                  <p className="text-white/60 text-sm">or</p>
                </div>
                
                <ScreenshotUploader
                  onUpload={handleUpload}
                  onError={handleError}
                />
              </>
            ) : (
              <div className="space-y-6">
                {/* Screenshot Preview */}
                <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-blue-400" />
                      <span>Screenshot</span>
                    </h3>
                    <button
                      onClick={resetAnalysis}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Upload Different
                    </button>
                  </div>
                  
                  <img
                    src={currentScreenshot.dataUrl}
                    alt="Screenshot"
                    className="w-full h-auto max-h-96 object-contain rounded-lg bg-black/20"
                  />
                  
                  <div className="mt-4 text-sm text-white/60">
                    <p>File: {currentScreenshot.filename}</p>
                    <p>Size: ~{currentScreenshot.size} KB</p>
                    <p>Analysis: {analysisType}</p>
                  </div>
                </div>
                
                {/* Re-analyze Button */}
                <button
                  onClick={() => analyzeScreenshot(currentScreenshot.dataUrl, currentScreenshot.filename)}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Re-analyze with {analysisType} mode</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div>
            {isAnalyzing ? (
              <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-center space-x-3 py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <div className="text-center">
                    <p className="text-lg font-medium mb-1">Analyzing screenshot...</p>
                    <p className="text-sm text-white/60">AI is processing your image</p>
                  </div>
                </div>
              </div>
            ) : analysis && insight ? (
              <VisionAnalysisPanel
                analysis={analysis}
                insight={insight}
                onCopyToClipboard={copyToClipboard}
              />
            ) : (
              <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Analysis Yet</h3>
                  <p className="text-white/60">
                    Capture or upload a screenshot to get AI-powered insights
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && history.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-purple-400" />
                  <span>Analysis History</span>
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.preview}
                        alt={item.filename}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.filename}</p>
                        <p className="text-white/60 text-sm">
                          {item.analysis_type} • {item.problem_type}
                        </p>
                        <p className="text-white/40 text-xs">
                          {item.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm">
                          {(item.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
