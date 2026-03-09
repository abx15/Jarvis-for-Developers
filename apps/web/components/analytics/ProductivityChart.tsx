'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

type Props = {
  data: { date: string; count: number }[]
}

export function ProductivityChart({ data }: Props) {
  return (
    <div className="h-[300px] w-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Coding Activity</h3>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
            Commits per day
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-neutral-400">Commits</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#262626"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#525252"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={str =>
              new Date(str).toLocaleDateString(undefined, { weekday: 'short' })
            }
          />
          <YAxis
            stroke="#525252"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#171717',
              border: '1px solid #262626',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            itemStyle={{ color: '#ffffff' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCommits)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
