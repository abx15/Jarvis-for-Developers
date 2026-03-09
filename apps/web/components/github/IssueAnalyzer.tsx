'use client'

import React, { useState } from 'react'
import { Search, Lightbulb, FileText, Send } from 'lucide-react'

type Props = {
  onAnalyze: (data: any) => void
  loading: boolean
  result: string | null
}

export function IssueAnalyzer({ onAnalyze, loading, result }: Props) {
  const [issue, setIssue] = useState('')

  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-neutral-800">
        <h3 className="text-sm font-semibold text-white">
          Smart Issue Analyzer
        </h3>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
          Repo Context based Fixes
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="relative">
          <textarea
            value={issue}
            onChange={e => setIssue(e.target.value)}
            placeholder="Describe the issue or paste issue text here..."
            className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-300 focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={() => onAnalyze({ title: 'Manual Issue', body: issue })}
            disabled={loading || !issue}
            className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pt-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-neutral-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-neutral-800 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-neutral-800 rounded animate-pulse w-4/6" />
            </div>
          ) : (
            result && (
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">
                    AI Generated Solution
                  </span>
                </div>
                <p className="text-sm text-neutral-300 italic leading-relaxed whitespace-pre-wrap">
                  "{result}"
                </p>
                <div className="pt-4 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-neutral-500" />
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Suggested Files: 01_auth.py, 04_login.tsx
                  </span>
                </div>
              </div>
            )
          )}

          {!loading && !result && (
            <div className="py-20 text-center text-neutral-600 space-y-2">
              <Search className="w-8 h-8 mx-auto" />
              <p className="text-xs">
                Paste an issue body to find root causes and fixes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
