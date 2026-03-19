'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  Server,
  GitBranch,
  Rocket,
  Activity,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Package,
  Globe,
  Database
} from 'lucide-react'

export default function DevOpsPage() {
  const [activeDeployments, setActiveDeployments] = useState([
    {
      id: 1,
      name: 'Production API',
      status: 'running',
      environment: 'production',
      lastDeploy: '2 hours ago',
      health: 'healthy',
      cpu: 45,
      memory: 62
    },
    {
      id: 2,
      name: 'Staging Web',
      status: 'running',
      environment: 'staging',
      lastDeploy: '1 day ago',
      health: 'healthy',
      cpu: 23,
      memory: 34
    },
    {
      id: 3,
      name: 'Development',
      status: 'stopped',
      environment: 'development',
      lastDeploy: '3 days ago',
      health: 'offline',
      cpu: 0,
      memory: 0
    }
  ])

  const [pipelines, setPipelines] = useState([
    {
      id: 1,
      name: 'Frontend Build',
      status: 'success',
      duration: '3m 24s',
      triggered: 'Manual',
      lastRun: '30 minutes ago'
    },
    {
      id: 2,
      name: 'Backend Tests',
      status: 'running',
      duration: 'Running...',
      triggered: 'Push to main',
      lastRun: '5 minutes ago'
    },
    {
      id: 3,
      name: 'Deploy to Staging',
      status: 'failed',
      duration: '1m 12s',
      triggered: 'Scheduled',
      lastRun: '2 hours ago'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'success':
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'stopped':
      case 'offline':
        return 'text-gray-600 bg-gray-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'running':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'offline':
        return <Pause className="w-4 h-4 text-gray-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DevOps Tools</h1>
          <p className="text-gray-600 mt-2">Manage deployments, pipelines, and infrastructure</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+2.4%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">8</h3>
            <p className="text-sm text-gray-600">Active Servers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Rocket className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">24</h3>
            <p className="text-sm text-gray-600">Deployments Today</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GitBranch className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">98.2%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">156</h3>
            <p className="text-sm text-gray-600">Pipeline Runs</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-red-600 font-medium">-0.8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">99.9%</h3>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Deployments */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Active Deployments</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeDeployments.map((deployment) => (
                  <div key={deployment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getHealthIcon(deployment.health)}
                        <div>
                          <h3 className="font-medium text-gray-900">{deployment.name}</h3>
                          <p className="text-sm text-gray-500">{deployment.environment}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deployment.status)}`}>
                        {deployment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">CPU</span>
                          <span className="font-medium">{deployment.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${deployment.cpu}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Memory</span>
                          <span className="font-medium">{deployment.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${deployment.memory}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Last deploy: {deployment.lastDeploy}</span>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CI/CD Pipelines */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">CI/CD Pipelines</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pipelines.map((pipeline) => (
                  <div key={pipeline.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          pipeline.status === 'success' ? 'bg-green-100' :
                          pipeline.status === 'failed' ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          <GitBranch className={`w-4 h-4 ${
                            pipeline.status === 'success' ? 'text-green-600' :
                            pipeline.status === 'failed' ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{pipeline.name}</h3>
                          <p className="text-sm text-gray-500">{pipeline.triggered}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pipeline.status)}`}>
                        {pipeline.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{pipeline.duration}</span>
                        </div>
                        <span>{pipeline.lastRun}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Logs
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Run New Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Terminal className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">SSH Terminal</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Package Registry</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Database className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Database Backup</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">DNS Management</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
