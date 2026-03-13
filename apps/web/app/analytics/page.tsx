'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { BarChart3, TrendingUp, Code2, Bug, Users, Clock, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const stats = [
    {
      title: 'Code Generated',
      value: '45.2K',
      change: '+23%',
      icon: Code2,
      color: 'blue'
    },
    {
      title: 'Bugs Fixed',
      value: '127',
      change: '+15%',
      icon: Bug,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8%',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Avg. Response Time',
      value: '1.2s',
      change: '-12%',
      icon: Clock,
      color: 'orange'
    }
  ]

  const chartData = [
    { day: 'Mon', tasks: 12, bugs: 3, users: 45 },
    { day: 'Tue', tasks: 19, bugs: 5, users: 52 },
    { day: 'Wed', tasks: 15, bugs: 2, users: 48 },
    { day: 'Thu', tasks: 25, bugs: 8, users: 61 },
    { day: 'Fri', tasks: 22, bugs: 6, users: 55 },
    { day: 'Sat', tasks: 18, bugs: 4, users: 43 },
    { day: 'Sun', tasks: 14, bugs: 1, users: 38 }
  ]

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Monitor your development metrics and performance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">from last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${getStatColor(stat.color)} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${getStatColor(stat.color).replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            <div className="space-y-4">
              {chartData.map((data, index) => (
                <div key={data.day} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{data.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-xs text-white"
                          style={{ width: `${(data.tasks / 25) * 100}%` }}
                        >
                          {data.tasks}
                        </div>
                      </div>
                      <div className="w-16 bg-red-100 rounded-full h-6">
                        <div
                          className="bg-red-600 h-6 rounded-full flex items-center justify-center text-xs text-white"
                          style={{ width: `${(data.bugs / 8) * 100}%` }}
                        >
                          {data.bugs}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-600">Tasks</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <span className="text-gray-600">Bugs</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">API Response Time</span>
                  <span className="text-sm text-gray-600">1.2s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Code Quality Score</span>
                  <span className="text-sm text-gray-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Test Coverage</span>
                  <span className="text-sm text-gray-600">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Security Score</span>
                  <span className="text-sm text-gray-600">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Fixed critical bug', time: '2 hours ago', type: 'bug' },
              { action: 'Generated 50 lines of code', time: '4 hours ago', type: 'code' },
              { action: 'Completed code review', time: '6 hours ago', type: 'review' },
              { action: 'Deployed to production', time: '8 hours ago', type: 'deploy' },
              { action: 'Updated dependencies', time: '1 day ago', type: 'update' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'bug' ? 'bg-red-100' :
                  activity.type === 'code' ? 'bg-blue-100' :
                  activity.type === 'review' ? 'bg-purple-100' :
                  activity.type === 'deploy' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Activity className={`w-4 h-4 ${
                    activity.type === 'bug' ? 'text-red-600' :
                    activity.type === 'code' ? 'text-blue-600' :
                    activity.type === 'review' ? 'text-purple-600' :
                    activity.type === 'deploy' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
