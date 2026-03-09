'use client'

import React, { useState } from 'react'
import { Sparkles, Send, Zap } from 'lucide-react'

type Props = {
  onDispatch: (task: string) => void
  loading: boolean
}

export function AgentTaskInput({ onDispatch, loading }: Props) {
  const [task, setTask] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!task.trim() || loading) return
    onDispatch(task)
    setTask('')
  }

  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl shadow-blue-500/5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
          Mission Command
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="e.g. 'Fix login bug in auth.py and generate unit tests'..."
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-5 pr-14 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
        />
        <button
          disabled={!task.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:bg-neutral-800 text-white rounded-lg transition-all"
        >
          {loading ? (
            <Sparkles className="w-4 h-4 animate-pulse" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
        <span className="text-neutral-600 uppercase font-bold mr-2">
          Quick Chaining:
        </span>
        {['Fix Auth Bug', 'Audit Repository', 'Generate API Docs'].map(chip => (
          <button
            key={chip}
            onClick={() => setTask(chip)}
            className="px-2 py-1 rounded bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all border border-neutral-700/30"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
