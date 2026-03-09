'use client'

import React from 'react'
import { Sparkles, MessageSquare, Check, X, Copy } from 'lucide-react'

type Suggestion = {
  type: 'refactor' | 'explain' | 'suggest'
  content: string
  title: string
}

type Props = {
  suggestion: Suggestion | null
  onAccept: (content: string) => void
  onReject: () => void
  loading: boolean
}

export function AISuggestionsPanel({
  suggestion,
  onAccept,
  onReject,
  loading,
}: Props) {
  if (!suggestion && !loading) return null

  return (
    <div className="w-80 h-full bg-neutral-900 border-l border-neutral-800 flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-widest">
          AI Context
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-3 py-10">
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
            <div className="h-32 bg-neutral-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-1/2" />
            <p className="text-[10px] text-neutral-600 font-mono text-center uppercase tracking-tighter">
              Jarvis is analyzing...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-tight">
                {suggestion?.type === 'refactor' ? (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                ) : (
                  <MessageSquare className="w-3 h-3 text-blue-400" />
                )}
                {suggestion?.type} Results
              </div>
              <h4 className="text-sm font-semibold text-white">
                {suggestion?.title}
              </h4>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
              <pre className="text-[11px] text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                {suggestion?.content}
              </pre>
            </div>

            {suggestion?.type === 'refactor' && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onAccept(suggestion.content)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-bold transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept Changes
                </button>
                <button
                  onClick={onReject}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-md transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {suggestion?.type === 'explain' && (
              <button
                onClick={() =>
                  navigator.clipboard.writeText(suggestion.content)
                }
                className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md text-[11px] font-bold transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy to Clipboard
              </button>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-neutral-950/50 border-t border-neutral-800">
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] text-blue-400/80 leading-relaxed italic">
            "I've optimized the spatial complexity of this function while
            maintaining idiomatic patterns."
          </p>
        </div>
      </div>
    </div>
  )
}
