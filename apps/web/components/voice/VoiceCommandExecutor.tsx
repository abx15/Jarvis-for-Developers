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

interface VoiceCommandExecutorProps {
  command: string
  onComplete: (status: 'success' | 'error') => void
}

export function VoiceCommandExecutor({
  command,
  onComplete,
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
          body: JSON.stringify({ command }),
        })

        const data = await response.json()
        setResult(data.analysis)
        onComplete('success')
      } catch (error) {
        console.error('Command execution failed:', error)
        onComplete('error')
      } finally {
        setIsProcessing(false)
      }
    }

    executeCommand()
  }, [command])

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
                Intent: {result.intent.replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-white/90 leading-relaxed">
              Target for {result.action_route}...
            </p>
          </div>
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
