'use client'

import React, { useState, useEffect } from 'react'
import {
  Play,
  ListChecks,
  FileCode,
  Save,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Code2,
  FolderPlus,
  FilePlus,
  RefreshCcw,
  Eye,
  Terminal,
  Eraser,
} from 'lucide-react'
import api from '@/lib/api'

interface PlanStep {
  id: number
  action: 'create_folder' | 'create_file' | 'modify_file'
  path: string
  description: string
  expected_content_summary?: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  generatedCode?: string
}

interface Repo {
  id: number
  repo_name: string
}

export default function AutoCodeDashboard() {
  const [prompt, setPrompt] = useState('')
  const [repoId, setRepoId] = useState<number | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [plan, setPlan] = useState<PlanStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStepIdx, setCurrentStepIdx] = useState<number | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [logs, setLogs] = useState<string[]>([
    'Autonomous Coding Engine ready.',
  ])

  useEffect(() => {
    fetchRepos()
  }, [])

  const fetchRepos = async () => {
    try {
      const response = await api.listRepos()
      setRepos(response.repositories)
    } catch (error) {
      addLog('Failed to fetch repositories.')
    }
  }

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  const generatePlan = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)
    addLog(`Generating plan for: ${prompt.substring(0, 50)}...`)
    try {
      const response = await api.getCodePlan(prompt, repoId || undefined)
      const steps = response.plan.map((s: any) => ({ ...s, status: 'pending' }))
      setPlan(steps)
      addLog(`Plan generated with ${steps.length} steps.`)
    } catch (error) {
      addLog('Failed to generate plan.')
    } finally {
      setIsLoading(false)
    }
  }

  const runExecute = async () => {
    if (plan.length === 0) return

    setIsLoading(true)
    addLog('Starting autonomous execution...')

    for (let i = 0; i < plan.length; i++) {
      const step = plan[i]
      setCurrentStepIdx(i)

      setPlan(prev =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'executing' } : s))
      )
      addLog(`Executing step ${i + 1}: ${step?.description || 'Unknown step'}`)

      try {
        const result = await api.executeCodeStep(step, repoId || undefined)

        setPlan(prev =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: 'completed',
                  generatedCode: result.generated_code,
                }
              : s
          )
        )
        addLog(`Step ${i + 1} completed.`)
      } catch (error) {
        setPlan(prev =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'failed' } : s))
        )
        addLog(`Step ${i + 1} failed.`)
        break
      }
    }

    setCurrentStepIdx(null)
    setIsLoading(false)
    addLog('Execution cycle finished.')
  }

  const applyChanges = async () => {
    const changes = plan
      .filter(s => s.status === 'completed' && s.generatedCode)
      .map(s => ({ path: s.path, content: s.generatedCode! }))

    if (changes.length === 0) return

    setIsApplying(true)
    addLog(`Applying ${changes.length} file changes to repository...`)

    try {
      await api.applyCodeChanges(changes)
      addLog('Changes successfully written to disk.')
      alert('Changes applied successfully!')
    } catch (error) {
      addLog('Failed to apply changes.')
    } finally {
      setIsApplying(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_folder':
        return <FolderPlus className="w-4 h-4 text-purple-400" />
      case 'create_file':
        return <FilePlus className="w-4 h-4 text-blue-400" />
      case 'modify_file':
        return <RefreshCcw className="w-4 h-4 text-yellow-400" />
      default:
        return <FileCode className="w-4 h-4" />
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-black text-white gap-6">
      <div className="flex gap-6 h-full">
        {/* Left: Prompt & Plan */}
        <div className="w-1/2 flex flex-col gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Code2 className="text-blue-500" /> Autonomous Instruction
            </h2>
            <textarea
              className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm outline-none focus:border-blue-500/50 transition-all resize-none"
              placeholder="Example: 'Create a user profile system with a FastAPI route and a Next.js frontend component...'"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <select
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-400 outline-none"
                value={repoId || ''}
                onChange={e => setRepoId(Number(e.target.value))}
              >
                <option value="">Global Context</option>
                {repos.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.repo_name}
                  </option>
                ))}
              </select>
              <button
                onClick={generatePlan}
                disabled={isLoading || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ListChecks className="w-4 h-4" />
                )}
                Plan Task
              </button>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-500" />{' '}
                Implementation Steps
              </h3>
              {plan.length > 0 && (
                <button
                  onClick={runExecute}
                  disabled={isLoading}
                  className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" /> Execute Autonomous
                  Work
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {plan.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600 italic">
                  <p>No plan generated yet.</p>
                </div>
              ) : (
                plan.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${
                      step.status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : step.status === 'executing'
                          ? 'bg-blue-500/5 border-blue-500/40 animate-pulse'
                          : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getActionIcon(step.action)}
                        <span className="text-xs font-mono text-neutral-500 uppercase">
                          {step.action}
                        </span>
                      </div>
                      {step.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {step.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {step.status === 'executing' && (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                    </div>
                    <div className="font-medium text-sm text-neutral-200">
                      {step.description}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                      {step.path}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview & Logs */}
        <div className="w-1/2 flex flex-col gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" /> Code Preview
              </h3>
              {plan.some(s => s.status === 'completed') && (
                <button
                  onClick={applyChanges}
                  disabled={isApplying}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all"
                >
                  {isApplying ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  Apply All Changes
                </button>
              )}
            </div>
            <div className="flex-1 bg-neutral-950 overflow-y-auto p-4 font-mono text-xs text-neutral-400">
              {plan.filter(s => s.status === 'completed' && s.generatedCode)
                .length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-700">
                  <p>Execute steps to see preview.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {plan
                    .filter(s => s.status === 'completed' && s.generatedCode)
                    .map(step => (
                      <div key={step.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-neutral-500 border-b border-neutral-800 pb-1">
                          <FileCode className="w-3 h-3" /> {step.path}
                        </div>
                        <pre className="p-3 bg-neutral-900/50 rounded-lg overflow-x-auto">
                          <code className="text-blue-300">
                            {step.generatedCode}
                          </code>
                        </pre>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl h-1/3 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono text-neutral-500 flex items-center gap-2 uppercase tracking-widest">
                <Terminal className="w-3 h-3" /> System Logs
              </h3>
              <button
                onClick={() => setLogs([])}
                className="text-neutral-600 hover:text-neutral-400"
              >
                <Eraser className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${log.includes('Error') ? 'text-red-400' : log.includes('Success') || log.includes('completed') ? 'text-emerald-400' : 'text-neutral-400'}`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
