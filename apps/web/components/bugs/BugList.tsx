'use client'

import React from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Cpu,
  ChevronRight,
  FileCode,
} from 'lucide-react'

type Bug = {
  id: number
  file_path: string
  bug_type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

type Props = {
  bugs: Bug[]
  selectedBugId: number | null
  onSelect: (id: number) => void
  loading: boolean
}

const severityColors = {
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  critical: 'text-red-500 bg-red-500/20 border-red-500/30 font-bold',
}

export function BugList({ bugs, selectedBugId, onSelect, loading }: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Detected Issues</h3>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
            Repo Health Audit
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-neutral-800/50 rounded-xl animate-pulse"
                />
              ))
          : bugs.map(bug => (
              <button
                key={bug.id}
                onClick={() => onSelect(bug.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all
                ${
                  selectedBugId === bug.id
                    ? 'bg-neutral-800 border-neutral-600'
                    : 'bg-neutral-800/30 border-neutral-700/30 hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {bug.bug_type.includes('Security') ? (
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xs font-bold text-white uppercase tracking-tight">
                      {bug.bug_type}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter border ${severityColors[bug.severity]}`}
                  >
                    {bug.severity}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <FileCode className="w-3.5 h-3.5 opacity-50" />
                    <span className="truncate max-w-[150px]">
                      {bug.file_path}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                </div>
              </button>
            ))}

        {!loading && bugs.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <Cpu className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
            <p className="text-xs text-neutral-500">
              No issues detected in current scan.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
