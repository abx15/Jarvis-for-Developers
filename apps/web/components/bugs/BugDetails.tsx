'use client'

import React from 'react'
import { FileSearch, Bug, Layers, ExternalLink } from 'lucide-react'

type BugType = {
  id: number
  file_path: string
  bug_type: string
  description: string
  severity: string
}

type Props = {
  bug: BugType | null
  loading: boolean
}

export function BugDetails({ bug, loading }: Props) {
  if (!bug && !loading)
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950/50 border border-neutral-800 border-dashed rounded-2xl opacity-40">
        <p className="text-sm">Select an issue to view clinical details.</p>
      </div>
    )

  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Diagnostic Insights
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
              Structural Analysis Report
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
          View Source <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-neutral-800 rounded animate-pulse w-1/4" />
            <div className="h-20 bg-neutral-800 rounded animate-pulse w-full" />
            <div className="h-32 bg-neutral-800 rounded animate-pulse w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-2 block">
                  Origin
                </span>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <FileSearch className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-neutral-300 font-mono truncate">
                    {bug?.file_path}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-2 block">
                  Detection Logic
                </span>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">
                    {bug?.bug_type} Identification
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mb-2 block">
                  Technical Description
                </span>
                <p className="text-sm text-neutral-400 leading-relaxed bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/50">
                  {bug?.description}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
