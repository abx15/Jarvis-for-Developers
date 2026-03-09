'use client'

import React from 'react'
import { Clock, CheckCircle2, XCircle, AlertCircle, Play } from 'lucide-react'

export type LogEntry = {
  id: string
  timestamp: string
  gesture: string
  action: string
  status: 'pending' | 'success' | 'error'
  message?: string | undefined
}

type Props = {
  logs: LogEntry[]
}

export function GestureActionLog({ logs }: Props) {
  return (
    <div className="flex flex-col h-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400" />
          Recent Actions
        </h3>
        <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 uppercase font-mono">
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-600 text-sm italic py-10">
            No actions recorded yet...
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="mt-0.5">
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : log.status === 'error' ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Play className="w-4 h-4 text-blue-500 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-neutral-200">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {log.timestamp}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  Gesture:{' '}
                  <span className="text-neutral-300">{log.gesture}</span>
                </div>
                {log.message && (
                  <div className="text-[10px] text-neutral-500 mt-1 italic border-t border-neutral-700/30 pt-1">
                    {log.message}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
