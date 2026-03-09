'use client'

import React from 'react'
import {
  Terminal,
  Shield,
  TestTube,
  FileText,
  Settings,
  Bot,
} from 'lucide-react'

const agents = [
  {
    name: 'Code Agent',
    icon: Terminal,
    color: 'text-blue-400',
    desc: 'Repo analysis & structure',
  },
  {
    name: 'Debug Agent',
    icon: Shield,
    color: 'text-rose-400',
    desc: 'Bug root cause analysis',
  },
  {
    name: 'Test Agent',
    icon: TestTube,
    color: 'text-amber-400',
    desc: 'Unit & integration tests',
  },
  {
    name: 'Docs Agent',
    icon: FileText,
    color: 'text-purple-400',
    desc: 'API & README documentation',
  },
  {
    name: 'DevOps Agent',
    icon: Settings,
    color: 'text-emerald-400',
    desc: 'CI/CD & PR management',
  },
]

export function AgentList() {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="text-sm font-semibold text-white">Agent Directory</h3>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
            Specialized AI Workers
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {agents.map((agent, i) => (
          <div
            key={i}
            className="group flex items-start gap-4 p-3 rounded-xl hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-700/50"
          >
            <div
              className={`p-2 rounded-lg bg-neutral-950 border border-neutral-800 ${agent.color}`}
            >
              <agent.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white mb-0.5">
                {agent.name}
              </p>
              <p className="text-[10px] text-neutral-500 leading-tight">
                {agent.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
