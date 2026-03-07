'use client'

import React from 'react'
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'

interface HistoryItem {
  command: string
  time: string
  status: string
}

export function CommandHistory({ history }: { history: HistoryItem[] }) {
  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
        <Clock className="w-8 h-8" />
        <p className="text-sm italic">No command history yet</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
      {history.map((item, index) => (
        <div
          key={index}
          className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted-foreground font-mono">
              {item.time}
            </span>
            {item.status === 'processing' ? (
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
            ) : item.status === 'success' ? (
              <CheckCircle2 className="w-3 h-3 text-green-400" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
          </div>
          <p className="text-sm text-white/80 line-clamp-2 italic">
            "{item.command}"
          </p>
        </div>
      ))}
    </div>
  )
}
