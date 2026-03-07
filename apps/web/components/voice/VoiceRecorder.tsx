'use client'

import React from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceRecorderProps {
  isListening: boolean
  onStart: () => void
  onStop: () => void
}

export function VoiceRecorder({
  isListening,
  onStart,
  onStop,
}: VoiceRecorderProps) {
  return (
    <div className="relative group">
      {/* Animated Rings */}
      {isListening && (
        <>
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping duration-[2000ms]" />
          <div className="absolute inset-x-[-20px] inset-y-[-20px] bg-purple-500/10 rounded-full animate-pulse duration-[3000ms]" />
        </>
      )}

      <button
        onClick={isListening ? onStop : onStart}
        className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 scale-110'
            : 'bg-gradient-to-tr from-blue-600 to-purple-600 hover:scale-105 active:scale-95'
        }`}
      >
        {isListening ? (
          <MicOff className="w-12 h-12 text-white animate-bounce-subtle" />
        ) : (
          <Mic className="w-12 h-12 text-white" />
        )}
      </button>

      {/* Label */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span
          className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${isListening ? 'text-red-400' : 'text-blue-400 opacity-60 group-hover:opacity-100'}`}
        >
          {isListening ? 'Listening...' : 'Click to Speak'}
        </span>
      </div>
    </div>
  )
}
