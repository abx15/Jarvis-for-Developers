'use client'

import React from 'react'
import { Zap, ShieldCheck, Activity, Code2 } from 'lucide-react'

type Props = {
  health: {
    complexity_score: string
    maintainability_index: number
    bug_frequency: string
    active_development: boolean
  }
}

export function RepoHealthPanel({ health }: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Repository Health
          </h3>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
            Code quality metrics
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
            Healthy
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/30">
          <div className="flex items-start justify-between mb-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-lg font-bold text-white">
              {health.complexity_score}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono">
            Complexity
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/30">
          <div className="flex items-start justify-between mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-lg font-bold text-white">
              {health.maintainability_index}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono">
            Maintainability
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/30">
          <div className="flex items-start justify-between mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase">
              {health.bug_frequency}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono">
            Bug Freq
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/30">
          <div className="flex items-start justify-between mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase">
              {health.active_development ? 'Active' : 'Stale'}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 uppercase font-mono">
            Status
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">Security Audit</span>
          <span className="text-xs text-emerald-400 font-medium">Passed</span>
        </div>
      </div>
    </div>
  )
}
