'use client'

import React, { useState, useEffect } from 'react'
import { AgentList } from '@/components/agents/AgentList'
import { AgentTaskInput } from '@/components/agents/AgentTaskInput'
import { AgentExecutionLog } from '@/components/agents/AgentExecutionLog'
import { AgentOutputViewer } from '@/components/agents/AgentOutputViewer'
import apiClient from '@/lib/api'
import { Bot, Network, BrainCircuit, Workflow, Zap } from 'lucide-react'

export default function AgentsDashboard() {
  const [repoId, setRepoId] = useState<number | null>(null)
  const [executionSteps, setExecutionSteps] = useState<any[]>([])
  const [finalOutput, setFinalOutput] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const reposRes = await apiClient.listRepositories()
        if (reposRes.success && reposRes.repositories.length > 0) {
          setRepoId(reposRes.repositories[0].id)
        }

        const historyRes = await apiClient.getAgentHistory()
        if (historyRes.success) {
          setHistory(historyRes.history)
        }
      } catch (err) {
        console.error('Failed to init agents page:', err)
      }
    }
    init()
  }, [])

  const handleDispatch = async (task: string) => {
    if (!repoId) return
    setLoading(true)
    setExecutionSteps([])
    setFinalOutput(null)

    try {
      const res = await apiClient.runAgentTask(repoId, task)
      if (res.success) {
        setExecutionSteps(res.execution_log)
        setFinalOutput(res.final_response)

        // Refresh history
        const historyRes = await apiClient.getAgentHistory()
        if (historyRes.success) setHistory(historyRes.history)
      }
    } catch (err) {
      console.error('Agent task failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-blue-500 shadow-xl">
              <Network className="w-5 h-5 shadow-blue-500/20" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Agent Orchestration
            </h1>
          </div>
          <p className="text-neutral-400 text-sm max-w-xl">
            Command a hive of specialized AI agents. Jarvis orchestrates complex
            workflows across code analysis, debugging, testing, and DevOps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              Hive Sync Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Directory */}
        <div className="lg:col-span-4 space-y-8">
          <AgentTaskInput onDispatch={handleDispatch} loading={loading} />
          <AgentList />

          {/* Quick Stats */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Hive Metrics
              </span>
              <BrainCircuit className="w-4 h-4 text-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xl font-bold text-white">05</div>
                <div className="text-[9px] text-neutral-600 uppercase font-bold">
                  Active Agents
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-white">
                  {history.length}
                </div>
                <div className="text-[9px] text-neutral-600 uppercase font-bold">
                  Tasks Solved
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution & Output */}
        <div className="lg:col-span-8 flex flex-col gap-8 h-[800px]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1 min-h-0">
            <AgentExecutionLog steps={executionSteps} loading={loading} />
            <AgentOutputViewer output={finalOutput} loading={loading} />
          </div>

          {/* Recent Activity Mini-Panel */}
          <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-neutral-950 flex items-center justify-center"
                  >
                    <Bot className="w-3 h-3 text-neutral-500" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-neutral-500 font-medium truncate">
                Swarm processing activated. Parallel agent execution enabled.
              </span>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] text-neutral-400 hover:text-white transition-all whitespace-nowrap">
              <Workflow className="w-3 h-3" /> Agent Workflow Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
