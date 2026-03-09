'use client'

import React from 'react'
import {
  FileCode,
  Folder,
  ChevronRight,
  ChevronDown,
  Search,
} from 'lucide-react'

type FileItem = {
  id: number
  path: string
  language: string
}

type Props = {
  files: FileItem[]
  selectedFile: string | null
  onFileSelect: (path: string) => void
}

export function FileExplorer({ files, selectedFile, onFileSelect }: Props) {
  // Simple flat view for now, could be improved with tree logic
  return (
    <div className="h-full bg-neutral-900 border-r border-neutral-800 flex flex-col w-64 shrink-0">
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            Explorer
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full bg-neutral-800 border-none rounded-md py-1.5 pl-8 text-xs text-neutral-300 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2">
          <div className="flex items-center gap-1.5 py-1 px-2 mb-1 text-sm text-neutral-400 font-medium">
            <ChevronDown className="w-4 h-4" />
            <Folder className="w-4 h-4 text-blue-400/80" />
            <span>Repository-Root</span>
          </div>

          <div className="pl-4 space-y-0.5">
            {files.map(file => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file.path)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors
                  ${
                    selectedFile === file.path
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
              >
                <FileCode className="w-4 h-4 shrink-0 opacity-80" />
                <span className="truncate">{file.path}</span>
              </button>
            ))}

            {files.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[10px] text-neutral-600 italic">
                  No files indexed yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
