'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  Code2,
  Bug,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  FileText,
  GitBranch,
  Zap
} from 'lucide-react'

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

  const stats = [
    {
      title: 'AI Tasks Completed',
      value: '247',
      change: '+12%',
      changeType: 'positive',
      icon: Bot,
      color: 'blue'
    },
    {
      title: 'Bugs Fixed',
      value: '89',
      change: '+23%',
      changeType: 'positive',
      icon: Bug,
      color: 'green'
    },
    {
      title: 'Code Generated',
      value: '12.5K',
      change: '+8%',
      changeType: 'positive',
      icon: Code2,
      color: 'purple'
    },
    {
      title: 'Team Members',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Users,
      color: 'orange'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'task',
      title: 'Generated unit tests for auth module',
      description: 'AI Agent completed code generation task',
      time: '2 hours ago',
      status: 'completed',
      icon: Bot
    },
    {
      id: 2,
      type: 'bug',
      title: 'Fixed memory leak in data processor',
      description: 'Critical bug resolved in production',
      time: '4 hours ago',
      status: 'resolved',
      icon: Bug
    },
    {
      id: 3,
      type: 'code',
      title: 'Refactored API endpoints',
      description: 'Improved performance by 40%',
      time: '6 hours ago',
      status: 'completed',
      icon: Code2
    },
    {
      id: 4,
      type: 'alert',
      title: 'Security vulnerability detected',
      description: 'JWT validation issue in middleware',
      time: '8 hours ago',
      status: 'warning',
      icon: AlertCircle
    }
  ]

  const activeProjects = [
    {
      id: 1,
      name: 'AI Developer OS',
      description: 'Core platform development',
      progress: 78,
      status: 'active',
      lastUpdated: '2 hours ago'
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'React Native companion app',
      progress: 45,
      status: 'active',
      lastUpdated: '1 day ago'
    },
    {
      id: 3,
      name: 'CLI Tool',
      description: 'Command-line interface',
      progress: 92,
      status: 'review',
      lastUpdated: '3 hours ago'
    }
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

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-600 bg-green-100',
      resolved: 'text-blue-600 bg-blue-100',
      warning: 'text-yellow-600 bg-yellow-100',
      active: 'text-green-600 bg-green-100',
      review: 'text-purple-600 bg-purple-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
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
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'resolved' ? 'bg-blue-100' :
                      activity.status === 'warning' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <activity.icon className={`w-4 h-4 ${
                        activity.status === 'completed' ? 'text-green-600' :
                        activity.status === 'resolved' ? 'text-blue-600' :
                        activity.status === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-gray-400">{activity.time}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{project.description}</p>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Updated {project.lastUpdated}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Bot className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm font-medium">New AI Task</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Bug className="w-5 h-5 mr-2 text-green-600" />
              <span className="text-sm font-medium">Report Bug</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Code2 className="w-5 h-5 mr-2 text-purple-600" />
              <span className="text-sm font-medium">Code Review</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <FileText className="w-5 h-5 mr-2 text-orange-600" />
              <span className="text-sm font-medium">Generate Docs</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
