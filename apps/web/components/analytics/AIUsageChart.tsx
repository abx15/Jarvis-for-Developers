'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

type Props = {
  aiPercentage: number
}

export function AIUsageChart({ aiPercentage }: Props) {
  const data = [
    { name: 'AI Generated', value: aiPercentage },
    { name: 'Manual Code', value: 100 - aiPercentage },
  ]

  const COLORS = ['#8b5cf6', '#3b82f6']

  return (
    <div className="h-[300px] w-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">AI Contributions</h3>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
            Code generation source
          </p>
        </div>
      </div>

      <div className="flex h-full items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length] || '#000000'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 space-y-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{aiPercentage}%</div>
            <div className="text-[10px] text-neutral-500 uppercase font-mono">
              AI Assisted
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-neutral-400">
              {100 - aiPercentage}%
            </div>
            <div className="text-[10px] text-neutral-500 uppercase font-mono">
              Manual Effort
            </div>
          </div>
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-xs text-neutral-300">LLM Efficiency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
