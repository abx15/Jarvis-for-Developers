'use client'

import React from 'react'
import { Sparkles, Wand2, Check, RefreshCcw, Info } from 'lucide-react'

type Fix = {
  suggested_fix: string
  ai_explanation: string
}

type Props = {
  fix: Fix | null
  loading: boolean
  onGenerate: () => void
  onApply: () => void
  bugSelected: boolean
}

export function FixSuggestionPanel({
  fix,
  loading,
  onGenerate,
  onApply,
  bugSelected,
}: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Fix Engine</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
              Automated Remediation
            </p>
          </div>
        </div>

        {!fix && (
          <button
            onClick={onGenerate}
            disabled={!bugSelected || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-all"
          >
            {loading ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            Generate Fix
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <p className="text-xs text-neutral-500 font-mono animate-pulse uppercase tracking-tighter">
              Synthesizing patch...
            </p>
          </div>
        ) : fix ? (
          <div className="space-y-6">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-400/90 leading-relaxed italic">
                {fix.ai_explanation}
              </p>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">
                  FIXED_CODE_SNIPPET
                </span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                  Patch Ready
                </span>
              </div>
              <pre className="p-4 text-xs text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-64">
                {fix.suggested_fix}
              </pre>
            </div>

            <button
              onClick={onApply}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              Apply Fix to Repository
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
            <Wand2 className="w-12 h-12 text-neutral-600" />
            <div>
              <p className="text-sm text-white font-medium">Auto Fix Logic</p>
              <p className="text-xs text-neutral-500">
                Run the diagnostic tool to identify bugs first.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
