'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface TranscriptDisplayProps {
  transcript: string
  isListening: boolean
  error: string | null
}

export function TranscriptDisplay({
  transcript,
  isListening,
  error,
}: TranscriptDisplayProps) {
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    )
  }

  return (
    <div className="w-full text-center space-y-4">
      {transcript ? (
        <p
          className={`text-2xl font-light italic transition-all duration-300 ${isListening ? 'text-white/90' : 'text-white/60'}`}
        >
          "{transcript}"
        </p>
      ) : isListening ? (
        <div className="flex justify-center items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        </div>
      ) : (
        <p className="text-white/20 text-xl font-light italic">
          Try saying: "Create a login API"
        </p>
      )}
    </div>
  )
}
