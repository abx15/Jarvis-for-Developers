'use client'

import React, { useEffect, useState } from 'react'
import { ProductivityChart } from '@/components/analytics/ProductivityChart'
import { AIUsageChart } from '@/components/analytics/AIUsageChart'
import { RepoHealthPanel } from '@/components/analytics/RepoHealthPanel'
import apiClient from '@/lib/api'
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const overview = await apiClient.getAnalyticsOverview()
        setData(overview)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-mono text-neutral-500 uppercase tracking-widest">
            Aggregating Intelligence...
          </p>
        </div>
      </div>
    )
  }

  const productivityScore = data?.productivity_score || 0
  const commitHistory = data?.commit_stats?.history || []
  const aiPercentage = data?.ai_stats?.ai_generated_code_percentage || 0
  const insights = data?.insights || []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Developer Analytics
            </h1>
          </div>
          <p className="text-neutral-400 max-w-2xl">
            Intelligence driven productivity tracking. Monitor your coding
            trends, AI efficiency, and repository health in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-300 font-medium">
            Last 30 Days
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <Target className="w-5 h-5 text-blue-400" />
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <ArrowUpRight className="w-3 h-3" />
              12%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {productivityScore}/100
            </div>
            <div className="text-[10px] text-neutral-500 uppercase font-mono">
              Productivity Score
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <ArrowUpRight className="w-3 h-3" />
              8%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {data?.commit_stats?.total || 0}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase font-mono">
              Total Commits
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-purple-400" />
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <ArrowUpRight className="w-3 h-3" />
              25%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{aiPercentage}%</div>
            <div className="text-[10px] text-neutral-500 uppercase font-mono">
              AI Efficiency
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
              <ArrowDownRight className="w-3 h-3" />
              2%
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">4.2h</div>
            <div className="text-[10px] text-neutral-500 uppercase font-mono">
              Avg Session
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Charts */}
        <div className="lg:col-span-8 space-y-8">
          <ProductivityChart data={commitHistory} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AIUsageChart aiPercentage={aiPercentage} />
            <RepoHealthPanel
              health={{
                complexity_score: 'A',
                maintainability_index: 84,
                bug_frequency: 'Low',
                active_development: true,
              }}
            />
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="h-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl flex flex-col">
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Intelligent Insights
              </h3>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-1 h-auto bg-blue-500/20 group-hover:bg-blue-500 rounded-full transition-all shrink-0" />
                  <p className="text-sm text-neutral-300 leading-relaxed italic">
                    "{insight}"
                  </p>
                </div>
              ))}

              {insights.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-sm text-neutral-600 italic">
                    No insights available for this period.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 pt-0 mt-auto">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] text-blue-400 leading-relaxed font-medium">
                  Jarvis has analyzed your coding patterns and identified that
                  your productivity peaks between 2PM and 5PM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
