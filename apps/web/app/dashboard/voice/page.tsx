'use client'

import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Play, History, Send, Loader2 } from 'lucide-react'
import { useVoice } from '@/hooks/useVoice'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { TranscriptDisplay } from '@/components/voice/TranscriptDisplay'
import { CommandHistory } from '@/components/voice/CommandHistory'
import { VoiceCommandExecutor } from '@/components/voice/VoiceCommandExecutor'

export default function VoiceCodingPage() {
  const [lastCommand, setLastCommand] = useState<string>('')
  const [history, setHistory] = useState<
    Array<{ command: string; time: string; status: string }>
  >([])

  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoice({
    onFinalTranscript: text => {
      if (text.trim()) {
        setLastCommand(text)
      }
    },
  })

  const handleCommandExecute = (command: string) => {
    setHistory(prev =>
      [
        {
          command,
          time: new Date().toLocaleTimeString(),
          status: 'processing',
        },
        ...prev,
      ].slice(0, 10)
    )
    setLastCommand(command)
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Voice Coding System
        </h1>
        <p className="text-muted-foreground text-lg">
          Control the autonomous coding engine with your voice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recording & Current Transcript */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8 min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <VoiceRecorder
              isListening={isListening}
              onStart={startListening}
              onStop={stopListening}
            />

            <TranscriptDisplay
              transcript={transcript}
              isListening={isListening}
              error={error}
            />

            {lastCommand && !isListening && (
              <button
                onClick={() => handleCommandExecute(lastCommand)}
                className="group flex items-center space-x-2 bg-primary/20 cursor-pointer hover:bg-primary/30 text-primary px-6 py-3 rounded-full transition-all duration-300 border border-primary/20"
              >
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span>
                  Execute: "
                  {lastCommand.length > 30
                    ? lastCommand.substring(0, 30) + '...'
                    : lastCommand}
                  "
                </span>
              </button>
            )}
          </div>

          <VoiceCommandExecutor
            command={lastCommand}
            onComplete={status => {
              setHistory(prev =>
                prev.map((item, i) => (i === 0 ? { ...item, status } : item))
              )
            }}
          />
        </div>

        {/* Right Column: History & Stats */}
        <div className="space-y-6">
          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
              <History className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Command History</h2>
            </div>

            <CommandHistory history={history} />
          </div>
        </div>
      </div>
    </div>
  )
}
