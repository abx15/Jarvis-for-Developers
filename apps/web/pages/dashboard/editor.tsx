'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { FileExplorer } from '@/components/editor/FileExplorer'
import { LiveUsersPanel } from '@/components/editor/LiveUsersPanel'
import { AISuggestionPanel } from '@/components/editor/AISuggestionPanel'
import { Users, Share2, Settings, Download, Upload } from 'lucide-react'

type File = {
  id: number
  path: string
  language: string
  content: string
}

type User = {
  id: string
  name: string
  color: string
  cursor?: {
    line: number
    column: number
  }
}

type Suggestion = {
  id: string
  text: string
  type: 'refactor' | 'optimization' | 'error_fix' | 'style_improvement' | 'type_hint' | 'security'
  confidence: number
  priority: 'high' | 'medium' | 'low'
  context?: any
}

export default function CollaborativeEditor() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [files, setFiles] = useState<File[]>([
    { id: 1, path: 'src/main.py', language: 'python', content: 'def hello_world():\n    print("Hello, World!")\n' },
    { id: 2, path: 'src/utils.py', language: 'python', content: 'def helper_function():\n    return "helper"\n' },
    { id: 3, path: 'src/config.json', language: 'json', content: '{\n  "name": "project",\n  "version": "1.0.0"\n}' },
  ])
  
  const [selectedFile, setSelectedFile] = useState<File | null>(files[0] || null)
  const [connectedUsers, setConnectedUsers] = useState<User[]>([
    { id: 'user1', name: 'John Doe', color: '#3B82F6' },
    { id: 'user2', name: 'Jane Smith', color: '#10B981' },
  ])
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [enableCollaboration, setEnableCollaboration] = useState(true)
  const [currentUserId] = useState('user1')

  useEffect(() => {
    // Load session data
    if (sessionId) {
      // In a real app, fetch session data from API
      console.log('Loading session:', sessionId)
    }
  }, [sessionId])

  const handleFileSelect = (filePath: string) => {
    const file = files.find(f => f.path === filePath)
    if (file) {
      setSelectedFile(file)
    } else {
      setSelectedFile(null)
    }
  }

  const handleContentChange = (content: string | undefined) => {
    if (selectedFile && content !== undefined) {
      const updatedFiles = files.map(f =>
        f.id === selectedFile.id ? { ...f, content } : f
      )
      setFiles(updatedFiles)
      setSelectedFile({ ...selectedFile, content })
    }
  }

  const handleAISuggestion = (suggestion: string) => {
    const newSuggestion: Suggestion = {
      id: Date.now().toString(),
      text: suggestion,
      type: 'refactor',
      confidence: 0.8,
      priority: 'medium',
    }
    setAiSuggestions(prev => [newSuggestion, ...prev.slice(0, 4)]) // Keep top 5
  }

  const handleAcceptSuggestion = (suggestionId: string) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    // In a real app, apply the suggestion to the code
  }

  const handleDismissSuggestion = (suggestionId: string) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const handleRequestNewSuggestions = async () => {
    if (!selectedFile) return
    
    setIsLoading(true)
    try {
      // In a real app, call AI API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockSuggestions: Suggestion[] = [
        {
          id: Date.now().toString(),
          text: 'Consider adding type hints to improve code clarity',
          type: 'type_hint',
          confidence: 0.9,
          priority: 'medium',
        },
        {
          id: (Date.now() + 1).toString(),
          text: 'This function could be optimized using list comprehension',
          type: 'optimization',
          confidence: 0.7,
          priority: 'low',
        },
      ]
      
      setAiSuggestions(prev => [...mockSuggestions, ...prev].slice(0, 5))
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareSession = () => {
    const shareUrl = `${window.location.origin}/dashboard/editor/${sessionId}`
    navigator.clipboard.writeText(shareUrl)
    // In a real app, show toast notification
    console.log('Session URL copied to clipboard:', shareUrl)
  }

  const getFileLanguage = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'py': return 'python'
      case 'js': return 'javascript'
      case 'ts': return 'typescript'
      case 'json': return 'json'
      case 'html': return 'html'
      case 'css': return 'css'
      default: return 'plaintext'
    }
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-white">
              Collaborative Editor
            </h1>
            <p className="text-xs text-neutral-400">
              Session: {sessionId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white">
              {connectedUsers.length + 1} active
            </span>
          </div>
          
          <button
            onClick={() => setEnableCollaboration(!enableCollaboration)}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              enableCollaboration
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}
          >
            {enableCollaboration ? 'Collaboration ON' : 'Collaboration OFF'}
          </button>
          
          <button
            onClick={handleShareSession}
            className="p-1.5 rounded hover:bg-neutral-800 transition-colors"
          >
            <Share2 className="w-4 h-4 text-neutral-400" />
          </button>
          
          <button className="p-1.5 rounded hover:bg-neutral-800 transition-colors">
            <Settings className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <FileExplorer
          files={files}
          selectedFile={selectedFile?.path || null}
          onFileSelect={handleFileSelect}
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          {selectedFile && (
            <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white font-medium">
                  {selectedFile.path}
                </span>
                <span className="text-xs text-neutral-400">
                  {selectedFile.language}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-1 rounded hover:bg-neutral-800 transition-colors">
                  <Download className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                <button className="p-1 rounded hover:bg-neutral-800 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1">
            {selectedFile ? (
              <CodeEditor
                content={selectedFile.content}
                language={selectedFile.language}
                onChange={handleContentChange}
                sessionId={sessionId}
                userId={currentUserId}
                filePath={selectedFile.path}
                enableCollaboration={enableCollaboration}
                onAISuggestion={handleAISuggestion}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-neutral-500">
                  Select a file to start editing
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-neutral-800 flex flex-col">
          {/* Live Users */}
          <div className="p-4">
            <LiveUsersPanel
              users={connectedUsers}
              currentUser={currentUserId}
            />
          </div>

          {/* AI Suggestions */}
          <div className="flex-1 p-4 overflow-y-auto">
            <AISuggestionPanel
              suggestions={aiSuggestions}
              onAcceptSuggestion={handleAcceptSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
              onRequestNewSuggestions={handleRequestNewSuggestions}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
