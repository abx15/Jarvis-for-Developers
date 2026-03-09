'use client'

import React from 'react'
import {
  Activity,
  Radio,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'

type Step = {
  agent: string
  output: string
  timestamp?: string
}

type Props = {
  steps: Step[]
  loading: boolean
}

export function AgentExecutionLog({ steps, loading }: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Collaboration Flux
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
              Real-time Agent Pipes
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">
              Live Stream
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 font-mono">
        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800/50">
          {steps.map((step, i) => (
            <div key={i} className="relative pl-8 group">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center z-10 group-hover:border-neutral-600 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>

              <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-xl p-4 hover:border-neutral-700/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    {step.agent}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                  "{step.output}"
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="relative pl-8 animate-pulse">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-neutral-900 border border-rose-500/20 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              </div>
              <div className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800 border-dashed">
                <p className="text-[10px] text-neutral-600 font-mono tracking-tighter">
                  Awaiting next agent feedback...
                </p>
              </div>
            </div>
          )}

          {steps.length === 0 && !loading && (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-600 space-y-3 opacity-40">
              <Clock className="w-8 h-8" />
              <p className="text-xs">Task history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
