'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  ArrowRight,
  Book,
  Folder,
  MessageSquare,
  Play,
  RefreshCw,
  Plus,
  GitBranch,
  Search,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import api from '@/lib/api'

type Repo = {
  id: number
  repo_name: string
  repo_url: string
  description: string
  last_indexed?: string
  status?: 'connected' | 'indexing' | 'ready' | 'error'
  file_count?: number
}

type ChatMessage = {
  role: 'user' | 'ai'
  content: string
}

export default function ReposDashboard() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Connect Repo Form
  const [isConnecting, setIsConnecting] = useState(false)
  const [owner, setOwner] = useState('')
  const [repoName, setRepoName] = useState('')

  // Chat
  const [query, setQuery] = useState('')
  const [isChatting, setIsChatting] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  useEffect(() => {
    fetchRepos()
  }, [])

  const fetchRepos = async () => {
    try {
      const response = await api.listRepos()
      setRepos(response.repositories)
    } catch (error) {
      console.error('Failed to fetch repos', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectRepo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    try {
      const res = await api.connectRepo(
        owner,
        repoName,
        `GitHub repository ${owner}/${repoName}`
      )
      setRepos((prev: Repo[]) => [...prev, res.repo])
      setOwner('')
      setRepoName('')
    } catch (error) {
      console.error('Failed to connect', error)
      alert('Error connecting repo. Have you linked GitHub via settings?')
    } finally {
      setIsConnecting(false)
    }
  }

  const startIndexing = async (repoId: number) => {
    try {
      await api.indexRepo(repoId)
      alert('Indexing started in the background!')
    } catch (error) {
      console.error('Failed to index', error)
      alert('Error starting index job.')
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || !selectedRepo) return

    const userQuery = query
    setChatHistory((prev: ChatMessage[]) => [
      ...prev,
      { role: 'user', content: userQuery },
    ])
    setQuery('')
    setIsChatting(true)

    try {
      const response = await api.searchRepo(selectedRepo.id, userQuery)

      setChatHistory((prev: ChatMessage[]) => [
        ...prev,
        { role: 'ai', content: response.answer },
      ])
    } catch (error) {
      console.error('Search failed', error)
      setChatHistory((prev: ChatMessage[]) => [
        ...prev,
        {
          role: 'ai',
          content: 'Sorry, I encountered an error searching the repository.',
        },
      ])
    } finally {
      setIsChatting(false)
    }
  }

  if (isLoading)
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </DashboardLayout>
    )

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Repositories</h1>
          <p className="text-gray-600 mt-2">Connect and analyze your code repositories with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connect New Repository */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Connect Repository
              </h2>
              <form onSubmit={connectRepo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository Owner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., vercel"
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., next.js"
                    value={repoName}
                    onChange={e => setRepoName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <GitBranch className="w-4 h-4" />
                  )}
                  {isConnecting ? 'Connecting...' : 'Connect Repository'}
                </button>
              </form>
            </div>

            {/* Repository List */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5 text-purple-600" />
                Connected Repositories
              </h2>

              {repos.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No repositories connected yet</p>
                  <p className="text-sm text-gray-400 mt-2">Connect your first repository to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {repos.map(repo => (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRepo?.id === repo.id 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{repo.repo_name}</h3>
                          <p className="text-sm text-gray-500 truncate mt-1">{repo.repo_url}</p>
                          {repo.status && (
                            <div className="flex items-center gap-2 mt-2">
                              {repo.status === 'ready' && (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-xs text-green-700">Ready for analysis</span>
                                </>
                              )}
                              {repo.status === 'indexing' && (
                                <>
                                  <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                                  <span className="text-xs text-yellow-700">Indexing...</span>
                                </>
                              )}
                              {repo.status === 'error' && (
                                <>
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-xs text-red-700">Error</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            window.open(repo.repo_url, '_blank')
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>

                      {selectedRepo?.id === repo.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              startIndexing(repo.id)
                            }}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                          >
                            <Play className="w-3 h-3" />
                            Start Indexing
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
              {selectedRepo ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      Ask questions about{' '}
                      <span className="text-blue-600">{selectedRepo.repo_name}</span>
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
                        <Search className="w-16 h-16 text-gray-300" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-700">Start analyzing your code</h3>
                          <p className="text-sm text-gray-500 mt-2 max-w-md">
                            Try asking questions like "Where is the authentication logic?" or 
                            "How does the payment system work?"
                          </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
                          <p className="text-xs text-blue-700">
                            💡 Make sure to run the indexing job first so the AI can analyze your codebase
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-4 rounded-lg ${
                                msg.role === 'user' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900 border border-gray-200'
                              }`}
                            >
                              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          </div>
                        ))}
                        {isChatting && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg text-gray-500 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Analyzing codebase...
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t bg-gray-50">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask a question about your code..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isChatting}
                      />
                      <button
                        type="submit"
                        disabled={isChatting || !query.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isChatting ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-4">
                  <Folder className="w-16 h-16 text-gray-300" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Select a repository</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-md">
                      Choose a repository from the left to start analyzing your code with AI
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
