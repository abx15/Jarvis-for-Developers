'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Wrench, GitBranch, Package, Cloud, Play, Download, RefreshCw, Settings } from 'lucide-react'

export default function DevOpsPage() {
  const [activeTab, setActiveTab] = useState('pipelines')
  
  const pipelines = [
    {
      id: 1,
      name: 'Frontend CI/CD',
      status: 'running',
      lastRun: '10 minutes ago',
      duration: '3m 24s',
      branch: 'main',
      trigger: 'push'
    },
    {
      id: 2,
      name: 'Backend Tests',
      status: 'success',
      lastRun: '1 hour ago',
      duration: '5m 12s',
      branch: 'develop',
      trigger: 'pull_request'
    },
    {
      id: 3,
      name: 'Security Scan',
      status: 'failed',
      lastRun: '2 hours ago',
      duration: '2m 45s',
      branch: 'feature/auth',
      trigger: 'schedule'
    }
  ]

  const deployments = [
    {
      id: 1,
      name: 'Production',
      environment: 'prod',
      status: 'active',
      version: 'v2.1.0',
      deployedAt: '2024-01-15 14:30',
      url: 'https://app.aidev.os'
    },
    {
      id: 2,
      name: 'Staging',
      environment: 'staging',
      status: 'active',
      version: 'v2.1.1-beta',
      deployedAt: '2024-01-15 12:15',
      url: 'https://staging.aidev.os'
    },
    {
      id: 3,
      name: 'Development',
      environment: 'dev',
      status: 'deploying',
      version: 'v2.2.0-alpha',
      deployedAt: 'In progress...',
      url: 'https://dev.aidev.os'
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      active: 'text-green-600 bg-green-100',
      deploying: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const tabs = [
    { id: 'pipelines', name: 'Pipelines', icon: GitBranch },
    { id: 'deployments', name: 'Deployments', icon: Cloud },
    { id: 'docker', name: 'Docker', icon: Package },
    { id: 'infrastructure', name: 'Infrastructure', icon: Settings }
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Wrench className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DevOps Tools</h1>
              <p className="text-gray-600">Manage your CI/CD pipelines and deployments</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Pipelines Tab */}
        {activeTab === 'pipelines' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">CI/CD Pipelines</h2>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <GitBranch className="w-4 h-4 mr-2" />
                New Pipeline
              </button>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pipeline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Run
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pipelines.map((pipeline) => (
                      <tr key={pipeline.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{pipeline.name}</div>
                            <div className="text-sm text-gray-500">{pipeline.branch} • {pipeline.trigger}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pipeline.status)}`}>
                            {pipeline.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pipeline.lastRun}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pipeline.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Play className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deployments Tab */}
        {activeTab === 'deployments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Environments</h2>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Cloud className="w-4 h-4 mr-2" />
                Deploy New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{deployment.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deployment.status)}`}>
                      {deployment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Version:</span>
                      <span className="font-medium">{deployment.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deployed:</span>
                      <span className="font-medium">{deployment.deployedAt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">URL:</span>
                      <a href={deployment.url} className="font-medium text-blue-600 hover:text-blue-800">
                        {deployment.url}
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      Redeploy
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors">
                      Rollback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Docker Tab */}
        {activeTab === 'docker' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Docker Containers</h2>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Package className="w-4 h-4 mr-2" />
                Build Image
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">ai-dev-os-frontend</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                      running
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Image: aidev-os/frontend:latest</p>
                    <p>Port: 3001:3001</p>
                    <p>Created: 2 hours ago</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">ai-dev-os-api</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                      running
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Image: aidev-os/api:latest</p>
                    <p>Port: 8000:8000</p>
                    <p>Created: 2 hours ago</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">redis</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                      running
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Image: redis:alpine</p>
                    <p>Port: 6379:6379</p>
                    <p>Created: 2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infrastructure Tab */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Infrastructure Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-900 mb-4">Resource Usage</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disk Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-900 mb-4">Services Health</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Gateway</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                      healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                      healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Redis Cache</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                      healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CDN</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                      healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
