'use client'

import React, { useState, useEffect } from 'react'
import {
  Loader2,
  Code,
  Bug,
  FileEdit,
  HelpCircle,
  Sparkles,
} from 'lucide-react'

interface HistoryItem {
  command: string
  time: string
  status: string
  result?: any
}

interface VoiceCommandExecutorProps {
  command: string
  onComplete: (status: 'success' | 'error') => void
  repoId?: number
}

export function VoiceCommandExecutor({
  command,
  onComplete,
  repoId,
}: VoiceCommandExecutorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (!command) return

    const executeCommand = async () => {
      setIsProcessing(true)
      try {
        const response = await fetch('/api/v1/voice/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            command,
            context: {},
            repo_id: repoId 
          }),
        })

        const data = await response.json()
        setResult(data)
        onComplete('success')
      } catch (error) {
        console.error('Command execution failed:', error)
        onComplete('error')
      } finally {
        setIsProcessing(false)
      }
    }

    executeCommand()
  }, [command, repoId])

  if (!command && !isProcessing) return null

  return (
    <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6 transition-all animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span>Analyzing intent...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>AI Insight</span>
            </>
          )}
        </h3>
      </div>

      {result && !isProcessing && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              {getIntentIcon(result.intent)}
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
                Intent: {result.intent?.replace('_', ' ') || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}
              </p>
              {result.agent_type && (
                <p className="text-xs text-muted-foreground">
                  Agent: {result.agent_type}
                </p>
              )}
            </div>
          </div>

          {result.entities && Object.keys(result.entities).length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-sm font-medium text-white/90 mb-2">Entities:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(result.entities).map((key: string) => (
                  <span key={key} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                    {key}: {String(result.entities[key])}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.result && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-sm font-medium text-white/90 mb-2">AI Response:</p>
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
                {typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          )}

          {result.success === false && result.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-400">Error: {result.error}</p>
              {result.suggestion && (
                <p className="text-xs text-red-300 mt-1">Suggestion: {result.suggestion}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getIntentIcon(intent: string) {
  switch (intent) {
    case 'generate_code':
      return <Code className="w-6 h-6 text-blue-400" />
    case 'fix_bug':
      return <Bug className="w-6 h-6 text-red-400" />
    case 'refactor_file':
      return <FileEdit className="w-6 h-6 text-green-400" />
    case 'explain_code':
      return <HelpCircle className="w-6 h-6 text-purple-400" />
    default:
      return <Sparkles className="w-6 h-6 text-yellow-400" />
  }
}
