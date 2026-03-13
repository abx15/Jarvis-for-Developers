'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Bug, Search, AlertTriangle, CheckCircle, Clock, Zap, Shield, Target } from 'lucide-react'

interface BugReport {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'fixed' | 'closed'
  file: string
  line: number
  reportedAt: Date
  fixedAt?: Date
}

export default function BugsPage() {
  const [bugs, setBugs] = useState<BugReport[]>([
    {
      id: '1',
      title: 'Memory leak in data processor',
      description: 'Potential memory leak detected in the data processing module when handling large datasets.',
      severity: 'high',
      status: 'investigating',
      file: 'src/processors/data.js',
      line: 142,
      reportedAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      title: 'Null reference exception',
      description: 'Null reference error when user profile is not properly initialized.',
      severity: 'medium',
      status: 'open',
      file: 'src/components/UserProfile.tsx',
      line: 67,
      reportedAt: new Date('2024-01-15T09:15:00')
    },
    {
      id: '3',
      title: 'SQL injection vulnerability',
      description: 'Potential SQL injection vulnerability in user input validation.',
      severity: 'critical',
      status: 'fixed',
      file: 'src/api/users.js',
      line: 89,
      reportedAt: new Date('2024-01-14T16:45:00'),
      fixedAt: new Date('2024-01-15T11:20:00')
    },
    {
      id: '4',
      title: 'Performance issue in loop',
      description: 'Inefficient nested loop causing performance degradation.',
      severity: 'low',
      status: 'open',
      file: 'src/utils/parser.js',
      line: 234,
      reportedAt: new Date('2024-01-15T08:30:00')
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      case 'fixed': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />
      case 'investigating': return <Clock className="w-4 h-4" />
      case 'fixed': return <CheckCircle className="w-4 h-4" />
      case 'closed': return <Shield className="w-4 h-4" />
      default: return <Bug className="w-4 h-4" />
    }
  }

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || bug.severity === filterSeverity
    const matchesStatus = filterStatus === 'all' || bug.status === filterStatus
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const handleAutoFix = (bugId: string) => {
    setBugs(prev => prev.map(bug => 
      bug.id === bugId 
        ? { ...bug, status: 'fixed' as const, fixedAt: new Date() }
        : bug
    ))
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Bug className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bug Analyzer</h1>
              <p className="text-gray-600">Detect, analyze, and fix bugs with AI assistance</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bugs</p>
                <p className="text-2xl font-bold text-gray-900">{bugs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Bug className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {bugs.filter(b => b.severity === 'critical').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fixed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bugs.filter(b => b.status === 'fixed').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bugs.filter(b => b.status === 'investigating').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="fixed">Fixed</option>
              <option value="closed">Closed</option>
            </select>
            
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Zap className="w-4 h-4 mr-2" />
              Scan for Bugs
            </button>
          </div>
        </div>

        {/* Bugs List */}
        <div className="space-y-4">
          {filteredBugs.map((bug) => (
            <div key={bug.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{bug.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(bug.severity)}`}>
                      {bug.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(bug.status)}`}>
                      {getStatusIcon(bug.status)}
                      <span className="ml-1">{bug.status.toUpperCase()}</span>
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{bug.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {bug.file}:{bug.line}
                    </span>
                    <span>Reported: {bug.reportedAt.toLocaleString()}</span>
                    {bug.fixedAt && (
                      <span>Fixed: {bug.fixedAt.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {bug.status !== 'fixed' && (
                    <button
                      onClick={() => handleAutoFix(bug.id)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Auto Fix
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
