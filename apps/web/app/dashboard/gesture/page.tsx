'use client'

import React, { useState, useCallback, useRef } from 'react'
import { GestureCamera } from '@/components/gesture/GestureCamera'
import { GestureIndicator } from '@/components/gesture/GestureIndicator'
import {
  GestureActionLog,
  LogEntry,
} from '@/components/gesture/GestureActionLog'
import {
  GestureDetection,
  GestureType,
} from '@/components/gesture/GestureDetector'
import apiClient from '@/lib/api'
import { Hand, Settings, Info, ShieldCheck } from 'lucide-react'

export default function GestureDashboardPage() {
  const [currentDetection, setCurrentDetection] = useState<GestureDetection>({
    gesture: 'None',
    confidence: 0,
  })
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isAutoTrigger, setIsAutoTrigger] = useState(true)

  // To avoid spamming actions
  const lastActionTimeRef = useRef<Record<string, number>>({})
  const ACTION_COOLDOWN = 1500 // 1.5s cooldown per action type

  const addLog = (
    gesture: string,
    action: string,
    status: 'pending' | 'success' | 'error',
    message?: string
  ) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      gesture,
      action,
      status,
      message: message || undefined,
    }
    setLogs(prev => [newLog, ...prev].slice(0, 50))
  }

  const triggerAction = useCallback(
    async (gesture: GestureType, confidence: number) => {
      if (gesture === 'None' || confidence < 0.75) return

      const now = Date.now()
      const lastTime = lastActionTimeRef.current[gesture]
      if (lastTime && now - lastTime < ACTION_COOLDOWN) {
        return
      }

      lastActionTimeRef.current[gesture] = now

      // Map gesture to action (client-side for UI logging)
      const actionMap: Record<string, string> = {
        ThumbsUp: 'ACCEPT_SUGGESTION',
        ThumbsDown: 'REJECT_SUGGESTION',
        OpenPalm: 'STOP_EXECUTION',
        TwoFingers: 'RUN_TASK',
      }
      const action = actionMap[gesture]
      if (!action) return

      addLog(gesture, action, 'pending')

      try {
        // 1. Notify backend of detection
        await apiClient.gestureDetect({
          gesture,
          confidence,
          meta: { source: 'dashboard', timestamp: now },
        })

        // 2. Trigger actual action
        const response = await apiClient.gestureAction({
          action,
          payload: { source: 'webcam_gesture' },
        })

        addLog(gesture, action, 'success', response.message)
      } catch (err) {
        addLog(
          gesture,
          action,
          'error',
          err instanceof Error ? err.message : 'Unknown error'
        )
      }
    },
    []
  )

  const handleGesture = (detection: GestureDetection) => {
    setCurrentDetection(detection)
    if (
      isAutoTrigger &&
      detection.gesture !== 'None' &&
      detection.confidence > 0.8
    ) {
      triggerAction(detection.gesture, detection.confidence)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Hand className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Gesture Control
            </h1>
          </div>
          <p className="text-neutral-400 max-w-2xl">
            Control Jarvis using real-time hand gestures. High-performance
            computer vision allows you to interact with AI agents and the coding
            engine without touching your keyboard.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
          <button
            onClick={() => setIsAutoTrigger(!isAutoTrigger)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isAutoTrigger ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-neutral-400 hover:text-white'}`}
          >
            Auto-Trigger: {isAutoTrigger ? 'ON' : 'OFF'}
          </button>
          <button className="p-2 text-neutral-500 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera & Tracked Gesture */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-200">
                Vision Stream
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                Processing Locally
              </div>
            </div>
            <GestureCamera onGesture={handleGesture} />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-200">
                System State
              </h2>
              <GestureIndicator
                gesture={currentDetection.gesture}
                confidence={currentDetection.confidence}
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-200">
                Interaction Guide
              </h2>
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Ensure your hand is clearly visible to the camera in good
                    lighting.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Hold the gesture steady for at least 1 second to trigger an
                    action.
                  </p>
                </div>
                <div className="flex items-start gap-3 border-t border-neutral-800 pt-4 mt-2">
                  <Info className="w-4 h-4 text-neutral-500 shrink-0" />
                  <p className="text-[10px] text-neutral-500 italic">
                    All processing happens in your browser using MediaPipe.
                    Video data never leaves your device.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Logs & Activity */}
        <div className="lg:col-span-4 space-y-8">
          <section className="h-full flex flex-col space-y-4">
            <h2 className="text-lg font-semibold text-neutral-200">
              Action History
            </h2>
            <div className="flex-1 min-h-[500px]">
              <GestureActionLog logs={logs} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
