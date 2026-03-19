'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
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
  Bug,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
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
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-600">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Bug Analyzer
                </h1>
                <p className="text-gray-600 text-sm">
                  AI-powered bug detection and automated fix suggestions
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning || !repoId}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <RefreshCw
              className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`}
            />
            {isScanning ? 'Scanning...' : 'Run Bug Scan'}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Security Score
              </span>
              <ShieldCheck className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">84%</div>
            <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[84%]" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Critical Bugs
              </span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {
                bugs.filter(
                  b => b.severity === 'high' || b.severity === 'critical'
                ).length
              }
            </div>
            <p className="text-sm text-gray-500 mt-1">Need immediate attention</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fixed Today
              </span>
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">12</div>
            <p className="text-sm text-gray-500 mt-1">Successfully resolved</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scan Activity
              </span>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-end gap-1 h-8">
              {Array(12)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm bg-blue-200`}
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
          <div className="lg:col-span-4">
            <BugDetails bug={selectedBug} loading={loadingDetails} />
          </div>

          {/* Right: AI Fix Panel */}
          <div className="lg:col-span-5">
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
    </DashboardLayout>
  )
}
