import React, { useState, useEffect } from 'react'
import {
  ArrowRight,
  Book,
  Folder,
  MessageSquare,
  Play,
  RefreshCw,
  Plus,
} from 'lucide-react'
import api from '@/lib/api'

type Repo = {
  id: number
  repo_name: string
  repo_url: string
  description: string
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
    return <div className="p-8 text-neutral-400">Loading repositories...</div>

  return (
    <div className="h-full flex flex-col md:flex-row bg-black text-white p-6 gap-6">
      {/* LEFT PANE: Repository List */}
      <div className="md:w-1/3 flex flex-col gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-500" />
            Connect GitHub Repo
          </h2>
          <form onSubmit={connectRepo} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Owner (e.g. vercel)"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded outline-none focus:border-blue-500 transition-colors"
              required
            />
            <input
              type="text"
              placeholder="Repo Name (e.g. next.js)"
              value={repoName}
              onChange={e => setRepoName(e.target.value)}
              className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded outline-none focus:border-blue-500 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={isConnecting}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors flex justify-center items-center gap-2"
            >
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Connect
            </button>
          </form>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex-1 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-500" />
            Your Repositories
          </h2>

          {repos.length === 0 ? (
            <p className="text-neutral-500 text-sm">
              No repositories connected yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {repos.map(repo => (
                <div
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedRepo?.id === repo.id ? 'bg-neutral-800 border-blue-500' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'}`}
                >
                  <div className="font-medium">{repo.repo_name}</div>
                  <div className="text-xs text-neutral-500 truncate mt-1">
                    {repo.repo_url}
                  </div>

                  {selectedRepo?.id === repo.id && (
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        startIndexing(repo.id)
                      }}
                      className="mt-3 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3" /> Execute Indexing Job
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: AI Chat */}
      <div className="md:w-2/3 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden">
        {selectedRepo ? (
          <>
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Ask questions about{' '}
                <span className="text-blue-400">{selectedRepo.repo_name}</span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
                  <Book className="w-12 h-12 opacity-20" />
                  <p>Try asking "Where is the authentication logic?"</p>
                  <p className="text-xs max-w-sm text-center">
                    Make sure you have run the Indexing Job first so the AI
                    memory is populated with pgvector chunks.
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-800 border border-neutral-700 text-neutral-200'}`}
                    >
                      <div className="text-sm format-markdown whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isChatting && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-xl text-neutral-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing
                    codebase...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-950/50 border-t border-neutral-800">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg outline-none focus:border-blue-500 transition-colors"
                  disabled={isChatting}
                />
                <button
                  type="submit"
                  disabled={isChatting || !query.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 text-center space-y-4">
            <Folder className="w-16 h-16 opacity-20" />
            <p className="text-lg">Select a repository to start analyzing</p>
            <p className="text-sm max-w-sm">
              Connect your GitHub and upload repositories on the left pane to
              ask the AI questions based on your codebase.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
