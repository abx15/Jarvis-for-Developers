'use client'

import React, { useState, useEffect } from 'react'
import { RepoList } from '@/components/github/RepoList'
import { PullRequestViewer } from '@/components/github/PullRequestViewer'
import { CodeReviewPanel } from '@/components/github/CodeReviewPanel'
import { IssueAnalyzer } from '@/components/github/IssueAnalyzer'
import apiClient from '@/lib/api'
import { Github, Zap, Shield, Workflow } from 'lucide-react'

export default function GitHubDashboard() {
  const [repos, setRepos] = useState<any[]>([])
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null)
  const [prs, setPrs] = useState<any[]>([])
  const [selectedPr, setSelectedPr] = useState<number | null>(null)
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loadingPrs, setLoadingPrs] = useState(false)
  const [loadingReview, setLoadingReview] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await apiClient.listRepositories()
        if (res.success) setRepos(res.repositories)
      } catch (err) {
        console.error('Failed to fetch repos:', err)
      } finally {
        setLoadingRepos(false)
      }
    }
    fetchRepos()
  }, [])

  useEffect(() => {
    if (selectedRepoId) {
      const fetchPrs = async () => {
        setLoadingPrs(true)
        setSelectedPr(null)
        setReviewResult(null)
        try {
          const res = await apiClient.getPullRequests(selectedRepoId)
          if (res.success) setPrs(res.pull_requests)
        } catch (err) {
          console.error('Failed to fetch PRs:', err)
        } finally {
          setLoadingPrs(false)
        }
      }
      fetchPrs()
    }
  }, [selectedRepoId])

  const handleRunReview = async () => {
    if (!selectedRepoId || !selectedPr) return
    setLoadingReview(true)
    try {
      const res = await apiClient.reviewPR(selectedRepoId, selectedPr)
      if (res.success) setReviewResult(res.review)
    } catch (err) {
      console.error('Review failed:', err)
    } finally {
      setLoadingReview(false)
    }
  }

  const handleAnalyzeIssue = async (issueData: any) => {
    if (!selectedRepoId) return
    setLoadingAnalysis(true)
    try {
      const res = await apiClient.analyzeIssue(selectedRepoId, issueData)
      if (res.success) setAnalysisResult(res.analysis)
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-xl">
              <Github className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              GitHub Automation
            </h1>
          </div>
          <p className="text-neutral-400 max-w-2xl">
            AI-driven workflows for your repositories. Automate code reviews,
            generate PR summaries, and analyze issues with full repository
            context.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 border border-neutral-800 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-tight">
              OAuth Secure
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Repos & PRs */}
        <div className="lg:col-span-4 space-y-8">
          <RepoList
            repos={repos}
            selectedRepoId={selectedRepoId}
            onSelect={setSelectedRepoId}
          />

          <PullRequestViewer
            prs={prs}
            selectedPr={selectedPr}
            onSelect={setSelectedPr}
            loading={loadingPrs}
          />
        </div>

        {/* Right Column: AI Action Panels */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
            <CodeReviewPanel
              review={reviewResult}
              loading={loadingReview}
              onTrigger={handleRunReview}
              activePr={selectedPr}
            />

            <IssueAnalyzer
              onAnalyze={handleAnalyzeIssue}
              loading={loadingAnalysis}
              result={analysisResult}
            />
          </div>

          {/* Quick Automation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">14</div>
                <div className="text-[10px] text-neutral-500 uppercase font-mono">
                  Workflows Active
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">8.5h</div>
                <div className="text-[10px] text-neutral-500 uppercase font-mono">
                  Dev Time Saved
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">A+</div>
                <div className="text-[10px] text-neutral-500 uppercase font-mono">
                  Compliance Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
