'use client'

import React, { useRef, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'

type Props = {
  content: string
  language: string
  onChange: (value: string | undefined) => void
  onMount?: (editor: any, monaco: Monaco) => void
  theme?: 'vs-dark' | 'light'
}

export function CodeEditor({
  content,
  language,
  onChange,
  onMount,
  theme = 'vs-dark',
}: Props) {
  const editorRef = useRef<any>(null)

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
  }

  return (
    <div className="flex-1 h-full relative group">
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
        }}
      />

      {!content && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-neutral-600 text-sm font-mono animate-pulse">
            Select a file from the explorer to begin...
          </p>
        </div>
      )}
    </div>
  )
}
