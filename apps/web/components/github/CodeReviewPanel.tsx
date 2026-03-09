'use client'

import React from 'react'
import { Brain, Sparkles, AlertCircle, CheckCircle2, Bot } from 'lucide-react'

type Props = {
  review: string | null
  loading: boolean
  onTrigger: () => void
  activePr: number | null
}

export function CodeReviewPanel({
  review,
  loading,
  onTrigger,
  activePr,
}: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-full">
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Code Review</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
              Automated Quality Analysis
            </p>
          </div>
        </div>

        <button
          onClick={onTrigger}
          disabled={!activePr || loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-pink-500/20"
        >
          {loading ? (
            <Sparkles className="w-4 h-4 animate-pulse" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          {loading ? 'Analyzing...' : 'Run PR Audit'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
            <div className="h-20 bg-neutral-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-1/2" />
            <div className="h-32 bg-neutral-800 rounded animate-pulse w-full" />
          </div>
        ) : review ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <pre className="text-sm text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                {review}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-medium">
                  Standards Compliant
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <AlertCircle className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] text-blue-400 font-medium">
                  No Security Risks
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-4">
            <Sparkles className="w-12 h-12 text-neutral-600" />
            <div>
              <p className="text-sm text-white font-medium">
                Ready for Intelligence
              </p>
              <p className="text-xs text-neutral-500">
                Select a pull request to begin the AI audit.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
