'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { CollaborationProvider } from '@/lib/collaboration/yjs-provider'

type Props = {
  content: string
  language: string
  onChange: (value: string | undefined) => void
  onMount?: (editor: any, monaco: Monaco) => void
  theme?: 'vs-dark' | 'light'
  sessionId?: string
  userId?: string
  filePath?: string
  enableCollaboration?: boolean
  onAISuggestion?: (suggestion: string) => void
}

export function CodeEditor({
  content,
  language,
  onChange,
  onMount,
  theme = 'vs-dark',
  sessionId,
  userId = 'anonymous',
  filePath = 'untitled',
  enableCollaboration = false,
  onAISuggestion,
}: Props) {
  const editorRef = useRef<any>(null)
  const collaborationProviderRef = useRef<CollaborationProvider | null>(null)
  const [connectedUsers, setConnectedUsers] = useState<string[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const setupCollaboration = useCallback((editor: any, monaco: Monaco) => {
    if (!enableCollaboration || !sessionId) return

    // Initialize collaboration provider
    const provider = new CollaborationProvider(
      sessionId,
      userId,
      (users: string[]) => setConnectedUsers(users),
      (synced: boolean) => console.log('Document synced:', synced)
    )
    collaborationProviderRef.current = provider

    // Get the Yjs text type
    const yText = provider.getYText()

    // Simple binding between Yjs and Monaco
    const model = editor.getModel()
    
    // Sync initial content
    if (content) {
      provider.setContent(content)
    }

    // Listen for Yjs changes and update Monaco
    yText.observe(() => {
      const newValue = yText.toString()
      if (model.getValue() !== newValue) {
        model.setValue(newValue)
        onChange?.(newValue)
      }
    })

    // Listen for Monaco changes and update Yjs
    const disposable = model.onDidChangeContent(() => {
      const newValue = model.getValue()
      if (yText.toString() !== newValue) {
        provider.setContent(newValue)
      }
    })

    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      const position = e.position
      provider.updateCursor(position.lineNumber, position.column)
    })

    // Cleanup on unmount
    return () => {
      disposable.dispose()
    }
  }, [enableCollaboration, sessionId, userId, content, onChange])

  const generateAISuggestion = useCallback(() => {
    if (!editorRef.current || !onAISuggestion) return

    const editor = editorRef.current
    const model = editor.getModel()
    const position = editor.getPosition()
    const lineContent = model.getLineContent(position.lineNumber)
    
    // Simple AI suggestion logic (can be enhanced with actual AI service)
    const suggestions = [
      'Consider using a more descriptive variable name',
      'This could be refactored into a separate function',
      'Add error handling here',
      'Consider adding TypeScript types',
      'This loop could be optimized',
    ]
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    onAISuggestion?.(randomSuggestion)
  }, [onAISuggestion])

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor
    if (onMount) onMount(editor, monaco)

    // Configure Monaco
    monaco.editor.defineTheme('jarvis-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#171717',
      },
    })
    monaco.editor.setTheme('jarvis-dark')

    // Setup collaboration if enabled
    setupCollaboration(editor, monaco)

    // Add keyboard shortcut for AI suggestions
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      generateAISuggestion()
    })

    // Add inline suggestions provider
    monaco.languages.registerInlineCompletionsProvider(language, {
      provideInlineCompletions: async (model: any, position: any) => {
        // This would integrate with AI service
        return {
          items: [
            {
              insertText: '// AI-generated suggestion',
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
              command: {
                id: 'ai.suggestion',
                title: 'AI Suggestion',
              },
            },
          ],
        }
      },
    })
  }

  useEffect(() => {
    return () => {
      // Cleanup collaboration
      if (collaborationProviderRef.current) {
        collaborationProviderRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="flex-1 h-full relative group">
      {/* Collaboration indicator */}
      {enableCollaboration && connectedUsers.length > 0 && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-white">
            {connectedUsers.length + 1} active user{connectedUsers.length !== 0 ? 's' : ''}
          </span>
        </div>
      )}

      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={content}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          minimap: { enabled: true },
          fontSize: 13,
          fontFamily: "'Fira Code', 'Monaco', 'Cascadia Code', monospace",
          fontLigatures: true,
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 20 },
          lineNumbersMinChars: 3,
          glyphMargin: true,
          folding: true,
          fixedOverflowWidgets: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          inlineSuggest: {
            enabled: true,
            showToolbar: 'always',
          },
        }}
      />

      {!content && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-neutral-600 text-sm font-mono animate-pulse">
            Select a file from the explorer to begin...
          </p>
        </div>
      )}

      {/* AI Suggestions Panel */}
      {aiSuggestions.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-400 font-semibold">AI Suggestions</span>
            <button
              onClick={() => setAiSuggestions([])}
              className="text-xs text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="space-y-1">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="text-xs text-gray-300">
                • {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
