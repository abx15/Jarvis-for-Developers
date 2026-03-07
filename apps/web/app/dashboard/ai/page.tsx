'use client'

import React, { useState, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  Code,
  Bug,
  Zap,
  ShieldCheck,
  FileText,
  Loader2,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import api from '@/lib/api'

type AgentCategory = 'code' | 'debug' | 'refactor' | 'test' | 'doc' | 'router'

interface Message {
  role: 'user' | 'assistant'
  content: string
  category?: AgentCategory
  timestamp: Date
}

interface Repo {
  id: number
  repo_name: string
}

export default function AIDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm Jarvis, your Multi-Agent Developer Assistant. How can I help you today? I can generate code, fix bugs, refactor existing files, or write documentation.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [activeAgent, setActiveAgent] = useState<AgentCategory>('router')

  useEffect(() => {
    fetchRepos()
  }, [])

  const fetchRepos = async () => {
    try {
      const response = await api.listRepos()
      setRepos(response.repositories)
    } catch (error) {
      console.error('Failed to fetch repos', error)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await api.runAgent(input, selectedRepo || undefined)

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        category: response.category as AgentCategory,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setActiveAgent(response.category as AgentCategory)
    } catch (error) {
      console.error('Agent execution failed', error)
      const errorMessage: Message = {
        role: 'assistant',
        content:
          "I'm sorry, I encountered an error while processing your request. Please check if the backend is running and you have connected a repository.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const getAgentIcon = (category?: AgentCategory) => {
    switch (category) {
      case 'code':
        return <Code className="w-4 h-4 text-blue-400" />
      case 'debug':
        return <Bug className="w-4 h-4 text-red-400" />
      case 'refactor':
        return <Zap className="w-4 h-4 text-yellow-400" />
      case 'test':
        return <ShieldCheck className="w-4 h-4 text-green-400" />
      case 'doc':
        return <FileText className="w-4 h-4 text-purple-400" />
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-black text-white rounded-2xl border border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <Bot className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Jarvis Multi-Agent System</h1>
            <p className="text-xs text-neutral-500">
              Active Agent:{' '}
              <span className="text-blue-400 capitalize">{activeAgent}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg">
            <Search className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedRepo || ''}
              onChange={e => setSelectedRepo(Number(e.target.value))}
              className="bg-transparent text-sm outline-none text-neutral-300 min-w-[150px]"
            >
              <option value="" className="bg-neutral-900">
                Select Context Repository
              </option>
              {repos.map(repo => (
                <option
                  key={repo.id}
                  value={repo.id}
                  className="bg-neutral-900"
                >
                  {repo.repo_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  msg.role === 'user'
                    ? 'bg-neutral-800 border-neutral-700'
                    : 'bg-blue-600/10 border-blue-500/30'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-neutral-400" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-400" />
                )}
              </div>

              <div className="space-y-1">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' && msg.category && (
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 w-fit rounded bg-neutral-950 border border-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {getAgentIcon(msg.category)}
                      {msg.category} Agent
                    </div>
                  )}
                  <div className="whitespace-pre-wrap format-markdown">
                    {msg.content}
                  </div>
                </div>
                <p className="text-[10px] text-neutral-600 px-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-sm text-neutral-400">
                  Jarvis is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-neutral-900/30 border-t border-neutral-800">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Jarvis to write code, fix bugs, or explain logic..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 pr-14 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-all flex items-center justify-center shadow-lg shadow-blue-900/20"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            'Fix login bug',
            'Generate Product API',
            'Write tests for auth',
            'Refactor vision service',
          ].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-[11px] px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:bg-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-1.5"
            >
              <ChevronRight className="w-3 h-3 text-blue-500" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
