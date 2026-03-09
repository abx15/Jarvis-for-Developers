'use client'

import React, { useState, useEffect } from 'react'
import { FileExplorer } from '@/components/editor/FileExplorer'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { AISuggestionsPanel } from '@/components/editor/AISuggestionsPanel'
import apiClient from '@/lib/api'
import { toast } from '@ai-dev-os/ui' // Assuming toast is available

export default function EditorDashboard() {
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [suggestion, setSuggestion] = useState<any>(null)
  const [repoId, setRepoId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const reposRes = await apiClient.listRepositories()
        if (reposRes.success && reposRes.repositories.length > 0) {
          const firstRepoId = reposRes.repositories[0].id
          setRepoId(firstRepoId)
          const filesRes = await apiClient.getRepositoryFiles(firstRepoId)
          if (filesRes.success) {
            setFiles(filesRes.files)
          }
        }
      } catch (err) {
        console.error('Failed to init editor:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path)
    setSuggestion(null)
    // Find the file content if possible or fetch it
    // For now, we'll assume content is simple or fetched via a new endpoint if needed
    // But since we already have 'getRepositoryFiles' returning basic info,
    // ideally we'd have a getFileContent endpoint.
    // Let's assume for this demo we just set some placeholder or try to fetch.
    setContent(
      `// Content for ${path}\n\nfunction example() {\n  console.log("Jarvis AI Editor active");\n}`
    )
  }

  const handleSave = async () => {
    if (!selectedFile || !repoId) return
    setIsSaving(true)
    try {
      const res = await apiClient.saveFile(repoId, selectedFile, content)
      if (res.success) {
        // toast.success('File saved successfully')
        console.log('File saved')
      }
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefactor = async () => {
    if (!selectedFile) return
    setIsThinking(true)
    setSuggestion({
      type: 'refactor',
      title: 'Refactoring...',
      content: '',
      loading: true,
    })
    try {
      const res = await apiClient.refactorCode({
        file_path: selectedFile,
        content,
        language: selectedFile.split('.').pop() || 'javascript',
        prompt: 'Optimize this code for performace and readability',
      })
      if (res.success) {
        setSuggestion({
          type: 'refactor',
          title: 'Optimized Implementation',
          content: res.refactored_code,
        })
      }
    } catch (err) {
      console.error('Refactor failed:', err)
      setSuggestion(null)
    } finally {
      setIsThinking(false)
    }
  }

  const handleExplain = async () => {
    if (!selectedFile) return
    setIsThinking(true)
    try {
      const res = await apiClient.explainCode({
        file_path: selectedFile,
        content,
        language: selectedFile.split('.').pop() || 'javascript',
      })
      if (res.success) {
        setSuggestion({
          type: 'explain',
          title: 'Code Analysis',
          content: res.explanation,
        })
      }
    } catch (err) {
      console.error('Explanation failed:', err)
    } finally {
      setIsThinking(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
            Initialising Workspace...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-neutral-950">
      <FileExplorer
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
      />

      <div className="flex-1 flex flex-col h-full bg-black">
        <EditorToolbar
          onSave={handleSave}
          onRefactor={handleRefactor}
          onExplain={handleExplain}
          isSaving={isSaving}
          isThinking={isThinking}
          fileName={selectedFile}
        />

        <CodeEditor
          content={content}
          language={selectedFile?.split('.').pop() || 'javascript'}
          onChange={val => setContent(val || '')}
        />
      </div>

      <AISuggestionsPanel
        suggestion={suggestion}
        onAccept={newContent => {
          setContent(newContent)
          setSuggestion(null)
        }}
        onReject={() => setSuggestion(null)}
        loading={isThinking}
      />
    </div>
  )
}
