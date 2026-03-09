'use client'

import React from 'react'
import { Save, Sparkles, Wand2, Info, Play, RotateCcw } from 'lucide-react'

type Props = {
  onSave: () => void
  onRefactor: () => void
  onExplain: () => void
  isSaving: boolean
  isThinking: boolean
  fileName: string | null
}

export function EditorToolbar({
  onSave,
  onRefactor,
  onExplain,
  isSaving,
  isThinking,
  fileName,
}: Props) {
  return (
    <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800/80 rounded border border-neutral-700/50">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">
            File:
          </span>
          <span className="text-[11px] font-mono text-blue-400 font-bold">
            {fileName || 'None'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExplain}
          disabled={!fileName || isThinking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 transition-all"
        >
          <Info className="w-3.5 h-3.5" />
          Explain
        </button>

        <button
          onClick={onRefactor}
          disabled={!fileName || isThinking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-amber-400 hover:bg-amber-500/10 disabled:opacity-30 transition-all"
        >
          <Wand2 className="w-3.5 h-3.5" />
          AI Refactor
        </button>

        <div className="w-[1px] h-4 bg-neutral-800 mx-1" />

        <button
          onClick={onSave}
          disabled={!fileName || isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white rounded-md text-xs font-bold transition-all"
        >
          {isSaving ? (
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {isSaving ? 'Saving...' : 'Save File'}
        </button>
      </div>
    </div>
  )
}
