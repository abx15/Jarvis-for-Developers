'use client'

import React, { useState, useEffect } from 'react'
import { BugList } from '@/components/bugs/BugList'
import { BugDetails } from '@/components/bugs/BugDetails'
import { FixSuggestionPanel } from '@/components/bugs/FixSuggestionPanel'
import apiClient from '@/lib/api'
import {
  ShieldCheck,
  Crosshair,
  Radar,
  Activity,
  RefreshCw,
} from 'lucide-react'

export default function BugDashboard() {
  const [repoId, setRepoId] = useState<number | null>(null)
  const [bugs, setBugs] = useState<any[]>([])
  const [selectedBugId, setSelectedBugId] = useState<number | null>(null)
  const [selectedBug, setSelectedBug] = useState<any>(null)
  const [fixSuggestion, setFixSuggestion] = useState<any>(null)

  const [loadingBugs, setLoadingBugs] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [loadingFix, setLoadingFix] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const reposRes = await apiClient.listRepositories()
        if (reposRes.success && reposRes.repositories.length > 0) {
          const firstRepoId = reposRes.repositories[0].id
          setRepoId(firstRepoId)
          const bugsRes = await apiClient.getBugs(firstRepoId)
          if (bugsRes.success) setBugs(bugsRes.bugs)
        }
      } catch (err) {
        console.error('Failed to init bugs:', err)
      } finally {
        setLoadingBugs(false)
      }
    }
    fetchBugs()
  }, [])

  useEffect(() => {
    if (selectedBugId) {
      const fetchBugDetails = async () => {
        setLoadingDetails(true)
        setFixSuggestion(null)
        try {
          const res = await apiClient.getBugDetails(selectedBugId)
          if (res.success) {
            setSelectedBug(res.bug)
            if (res.fixes && res.fixes.length > 0)
              setFixSuggestion(res.fixes[0])
          }
        } catch (err) {
          console.error('Failed to fetch bug details:', err)
        } finally {
          setLoadingDetails(false)
        }
      }
      fetchBugDetails()
    }
  }, [selectedBugId])

  const handleScan = async () => {
    if (!repoId) return
    setIsScanning(true)
    try {
      const res = await apiClient.scanRepo(repoId)
      if (res.success) {
        const bugsRes = await apiClient.getBugs(repoId)
        if (bugsRes.success) setBugs(bugsRes.bugs)
      }
    } catch (err) {
      console.error('Scan failed:', err)
    } finally {
      setIsScanning(false)
    }
  }

  const handleGenerateFix = async () => {
    if (!selectedBugId) return
    setLoadingFix(true)
    try {
      const res = await apiClient.autoFix(selectedBugId)
      if (res.success) setFixSuggestion(res.fix)
    } catch (err) {
      console.error('Fix generation failed:', err)
    } finally {
      setLoadingFix(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-500 shadow-xl">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              AI Bug Hunter
            </h1>
          </div>
          <p className="text-neutral-400 text-sm max-w-xl">
            Real-time vulnerability scanning and automated remediation. Secure
            your codebase with AST-based logic and AI agents.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning || !repoId}
          className="flex items-center gap-2 px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 border border-neutral-700 text-white rounded-xl text-sm font-bold transition-all"
        >
          <RefreshCw
            className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`}
          />
          {isScanning ? 'Scanning Codebase...' : 'Run Audit Scan'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Security Score
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">84%</div>
          <div className="mt-2 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[84%]" />
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Active Bugs
            </span>
            <Crosshair className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {
              bugs.filter(
                b => b.severity === 'high' || b.severity === 'critical'
              ).length
            }{' '}
            <span className="text-sm font-normal text-neutral-500">
              Critical
            </span>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-2xl md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Scan History
            </span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-end gap-1.5 h-12">
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm bg-blue-500/20`}
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        {/* Left: Bug List */}
        <div className="lg:col-span-3">
          <BugList
            bugs={bugs}
            selectedBugId={selectedBugId}
            onSelect={setSelectedBugId}
            loading={loadingBugs}
          />
        </div>

        {/* Center: Bug Details */}
        <div className="lg:col-span-4 max-h-[700px]">
          <BugDetails bug={selectedBug} loading={loadingDetails} />
        </div>

        {/* Right: AI Fix Panel */}
        <div className="lg:col-span-5 max-h-[700px]">
          <FixSuggestionPanel
            fix={fixSuggestion}
            loading={loadingFix}
            onGenerate={handleGenerateFix}
            onApply={() => console.log('Apply fix')}
            bugSelected={!!selectedBugId}
          />
        </div>
      </div>
    </div>
  )
}
