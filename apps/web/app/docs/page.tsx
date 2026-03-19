'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FileText, Search, Book, Code, Settings, ChevronRight, ExternalLink, Tag, Clock } from 'lucide-react'

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const categories = [
    { id: 'all', name: 'All Docs', icon: FileText },
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'api', name: 'API Reference', icon: Code },
    { id: 'guides', name: 'Guides', icon: Settings }
  ]

  const documentation = [
    {
      id: 1,
      title: 'Quick Start Guide',
      description: 'Get up and running with AI Developer OS in minutes',
      category: 'getting-started',
      content: 'This guide will help you set up your development environment...',
      lastUpdated: '2024-01-15',
      readTime: '5 min',
      tags: ['setup', 'beginner'],
      path: '/docs/quick-start'
    },
    {
      id: 2,
      title: 'API Authentication',
      description: 'Learn how to authenticate with our API endpoints',
      category: 'api',
      content: 'Authentication is required for most API endpoints...',
      lastUpdated: '2024-01-14',
      readTime: '3 min',
      tags: ['api', 'auth', 'security'],
      path: '/docs/api-authentication'
    },
    {
      id: 3,
      title: 'AI Agent Integration',
      description: 'Integrate AI agents into your workflow',
      category: 'guides',
      content: 'AI agents can automate many development tasks...',
      lastUpdated: '2024-01-13',
      readTime: '8 min',
      tags: ['ai', 'agents', 'automation'],
      path: '/docs/ai-agents'
    },
    {
      id: 4,
      title: 'Database Setup',
      description: 'Configure and connect to your database',
      category: 'getting-started',
      content: 'Proper database configuration is essential...',
      lastUpdated: '2024-01-12',
      readTime: '6 min',
      tags: ['database', 'setup', 'configuration'],
      path: '/docs/database-setup'
    },
    {
      id: 5,
      title: 'Code Editor Features',
      description: 'Master the AI-powered code editor',
      category: 'guides',
      content: 'The code editor includes AI assistance...',
      lastUpdated: '2024-01-11',
      readTime: '7 min',
      tags: ['editor', 'code', 'ai'],
      path: '/docs/code-editor'
    },
    {
      id: 6,
      title: 'REST API Reference',
      description: 'Complete reference for all API endpoints',
      category: 'api',
      content: 'Our REST API provides access to all platform features...',
      lastUpdated: '2024-01-10',
      readTime: '15 min',
      tags: ['api', 'rest', 'endpoints'],
      path: '/docs/rest-api'
    },
    {
      id: 7,
      title: 'Deployment Guide',
      description: 'Deploy your applications to production',
      category: 'guides',
      content: 'Learn how to deploy your applications...',
      lastUpdated: '2024-01-09',
      readTime: '10 min',
      tags: ['deployment', 'production', 'devops'],
      path: '/docs/deployment'
    },
    {
      id: 8,
      title: 'Environment Variables',
      description: 'Configure environment variables for your project',
      category: 'getting-started',
      content: 'Environment variables are used to configure...',
      lastUpdated: '2024-01-08',
      readTime: '4 min',
      tags: ['environment', 'config', 'variables'],
      path: '/docs/environment-variables'
    }
  ]

  const filteredDocs = documentation.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      'getting-started': 'text-green-600 bg-green-100',
      'api': 'text-blue-600 bg-blue-100',
      'guides': 'text-purple-600 bg-purple-100'
    }
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getTagColor = (tag: string) => {
    const colors = ['bg-red-100 text-red-600', 'bg-yellow-100 text-yellow-600', 'bg-indigo-100 text-indigo-600', 'bg-pink-100 text-pink-600']
    return colors[tag.length % colors.length]
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
              <p className="text-gray-600">Everything you need to know about AI Developer OS</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${selectedCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="#quick-start" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Book className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Quick Start</span>
            <ChevronRight className="w-4 h-4 text-blue-600 ml-auto" />
          </a>
          <a href="#api-reference" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Code className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-900">API Reference</span>
            <ChevronRight className="w-4 h-4 text-green-600 ml-auto" />
          </a>
          <a href="#examples" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Settings className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Examples</span>
            <ChevronRight className="w-4 h-4 text-purple-600 ml-auto" />
          </a>
          <a href="#support" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <FileText className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-900">Support</span>
            <ChevronRight className="w-4 h-4 text-orange-600 ml-auto" />
          </a>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(doc.category)}`}>
                    {doc.category.replace('-', ' ').charAt(0).toUpperCase() + doc.category.slice(1).replace('-', ' ')}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {doc.readTime}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.tags.map((tag, index) => (
                    <span key={index} className={`px-2 py-1 text-xs font-medium rounded-full ${getTagColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Updated {doc.lastUpdated}</span>
                  <a
                    href={doc.path}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Read More
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Topics */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ChevronRight className="w-4 h-4 mr-2" />
                Setting up your first project
              </a>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ChevronRight className="w-4 h-4 mr-2" />
                Using AI agents for code generation
              </a>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ChevronRight className="w-4 h-4 mr-2" />
                Debugging with AI assistance
              </a>
            </div>
            <div className="space-y-2">
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ChevronRight className="w-4 h-4 mr-2" />
                API authentication methods
              </a>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ChevronRight className="w-4 h-4 mr-2" />
                Deploying to production
              </a>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ChevronRight className="w-4 h-4 mr-2" />
                Team collaboration features
              </a>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Still need help?</h3>
              <p className="text-blue-700">Can't find what you're looking for? Our support team is here to help.</p>
            </div>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
