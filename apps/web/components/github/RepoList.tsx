'use client'

import React from 'react'
import { Github, ExternalLink, RefreshCcw } from 'lucide-react'

type Repo = {
  id: number
  repo_name: string
  repo_url: string
  description: string
}

type Props = {
  repos: Repo[]
  selectedRepoId: number | null
  onSelect: (id: number) => void
}

export function RepoList({ repos, selectedRepoId, onSelect }: Props) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Active Repositories
          </h3>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
            Connected GitHub Repos
          </p>
        </div>
        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {repos.map(repo => (
          <button
            key={repo.id}
            onClick={() => onSelect(repo.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all
              ${
                selectedRepoId === repo.id
                  ? 'bg-blue-500/10 border-blue-500/40'
                  : 'bg-neutral-800/30 border-neutral-700/30 hover:bg-neutral-800/50'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Github
                  className={`w-4 h-4 ${selectedRepoId === repo.id ? 'text-blue-400' : 'text-neutral-400'}`}
                />
                <span className="text-sm font-bold text-white">
                  {repo.repo_name}
                </span>
              </div>
              <a
                href={repo.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1">
              {repo.description || 'No description provided.'}
            </p>
          </button>
        ))}

        {repos.length === 0 && (
          <div className="py-10 text-center border-2 border-dashed border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-600 italic">
              No repositories connected.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
