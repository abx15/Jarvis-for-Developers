'use client'

import React from 'react'
import { GitPullRequest, GitBranch, MessageSquare, Clock } from 'lucide-react'

type PR = {
  number: number
  title: string
  state: string
  user: { login: string; avatar_url: string }
  created_at: string
}

type Props = {
  prs: PR[]
  selectedPr: number | null
  onSelect: (prNumber: number) => void
  loading: boolean
}

export function PullRequestViewer({
  prs,
  selectedPr,
  onSelect,
  loading,
}: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col h-[500px]">
      <div className="p-6 border-b border-neutral-800">
        <h3 className="text-sm font-semibold text-white">Pull Requests</h3>
        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
          Active Workflow items
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-neutral-800/50 rounded-xl animate-pulse"
                />
              ))
          : prs.map(pr => (
              <button
                key={pr.number}
                onClick={() => onSelect(pr.number)}
                className={`w-full text-left p-4 rounded-xl border transition-all
                ${
                  selectedPr === pr.number
                    ? 'bg-purple-500/10 border-purple-500/40'
                    : 'bg-neutral-800/30 border-neutral-700/30 hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitPullRequest
                      className={`w-4 h-4 ${pr.state === 'open' ? 'text-emerald-400' : 'text-purple-400'}`}
                    />
                    <span className="text-sm font-bold text-white line-clamp-1">
                      {pr.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    #{pr.number}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={pr.user.avatar_url}
                      className="w-4 h-4 rounded-full"
                      alt=""
                    />
                    <span className="text-[10px] text-neutral-400">
                      {pr.user.login}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(pr.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            ))}

        {!loading && prs.length === 0 && (
          <div className="py-20 text-center opacity-50">
            <GitBranch className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
            <p className="text-xs text-neutral-500">
              No open pull requests found.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
