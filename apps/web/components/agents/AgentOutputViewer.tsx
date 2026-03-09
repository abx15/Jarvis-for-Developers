'use client'

import React from 'react'
import { Sparkles, Copy, Download, Maximize2, Cpu } from 'lucide-react'

type Props = {
  output: string | null
  loading: boolean
}

export function AgentOutputViewer({ output, loading }: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl shadow-purple-500/5">
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Consolidated Intelligence
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
              Agent Hive Synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-all">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
            <div className="h-20 bg-neutral-800 rounded animate-pulse w-full" />
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-1/2" />
            <div className="h-40 bg-neutral-800 rounded animate-pulse w-full" />
          </div>
        ) : output ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="bg-neutral-950/80 border border-neutral-800/50 rounded-xl p-6 font-mono text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4 py-20">
            <Sparkles className="w-16 h-16 text-neutral-700 mx-auto" />
            <div>
              <p className="text-sm text-white font-medium">
                Hive Mind Offline
              </p>
              <p className="text-xs text-neutral-500">
                Dispatch a task to see orchestrated results.
              </p>
            </div>
          </div>
        )}
      </div>

      {output && (
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/30 flex items-center justify-between">
          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-tighter">
            Latency: 1.2s | Tokens: 452
          </span>
          <button className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase hover:text-blue-300 transition-all">
            Full Analysis <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
