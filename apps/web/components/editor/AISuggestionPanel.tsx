'use client'

import React, { useState } from 'react'
import { Lightbulb, X, Check, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react'

type Suggestion = {
  id: string
  text: string
  type: 'refactor' | 'optimization' | 'error_fix' | 'style_improvement' | 'type_hint' | 'security'
  confidence: number
  priority: 'high' | 'medium' | 'low'
  context?: any
}

type Props = {
  suggestions: Suggestion[]
  onAcceptSuggestion?: (suggestionId: string) => void
  onDismissSuggestion?: (suggestionId: string) => void
  onRequestNewSuggestions?: () => void
  isLoading?: boolean
}

export function AISuggestionPanel({
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  onRequestNewSuggestions,
  isLoading = false,
}: Props) {
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'refactor':
        return <RefreshCw className="w-4 h-4" />
      case 'optimization':
        return <Sparkles className="w-4 h-4" />
      case 'error_fix':
        return <AlertTriangle className="w-4 h-4" />
      case 'style_improvement':
        return <Lightbulb className="w-4 h-4" />
      case 'type_hint':
        return <Lightbulb className="w-4 h-4" />
      case 'security':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'refactor':
        return 'text-blue-400'
      case 'optimization':
        return 'text-green-400'
      case 'error_fix':
        return 'text-red-400'
      case 'style_improvement':
        return 'text-yellow-400'
      case 'type_hint':
        return 'text-purple-400'
      case 'security':
        return 'text-orange-400'
      default:
        return 'text-neutral-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
    }
  }

  if (suggestions.length === 0 && !isLoading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <div className="text-center py-6">
          <Lightbulb className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-400 mb-2">
            No AI suggestions available
          </p>
          <p className="text-xs text-neutral-500 mb-4">
            Press Ctrl+Space to get suggestions
          </p>
          <button
            onClick={onRequestNewSuggestions}
            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs hover:bg-blue-500/20 transition-colors"
          >
            Generate Suggestions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
      <div className="flex items-center justify-between p-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-medium text-white">AI Suggestions</h4>
          <span className="text-xs text-neutral-400">({suggestions.length})</span>
        </div>
        
        <button
          onClick={onRequestNewSuggestions}
          disabled={isLoading}
          className="p-1.5 rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-neutral-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className={`p-3 border-b border-neutral-800 last:border-b-0 ${
              expandedSuggestion === suggestion.id ? 'bg-neutral-800/50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${getTypeColor(suggestion.type)}`}>
                {getTypeIcon(suggestion.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
                
                <p className="text-sm text-white mb-2">
                  {suggestion.text}
                </p>
                
                {suggestion.context && expandedSuggestion === suggestion.id && (
                  <div className="mt-2 p-2 bg-neutral-800 rounded-md">
                    <pre className="text-xs text-neutral-400 overflow-x-auto">
                      {JSON.stringify(suggestion.context, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => onAcceptSuggestion?.(suggestion.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs hover:bg-green-500/20 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Accept
                  </button>
                  
                  <button
                    onClick={() => setExpandedSuggestion(
                      expandedSuggestion === suggestion.id ? null : suggestion.id
                    )}
                    className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded text-xs hover:bg-neutral-700 transition-colors"
                  >
                    {expandedSuggestion === suggestion.id ? 'Hide' : 'Details'}
                  </button>
                  
                  <button
                    onClick={() => onDismissSuggestion?.(suggestion.id)}
                    className="p-1 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="p-4 text-center">
            <RefreshCw className="w-6 h-6 text-blue-400 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-neutral-400">
              Generating AI suggestions...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
