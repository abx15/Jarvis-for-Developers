'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import apiClient from '@/lib/api'
import { WebcamStream } from './WebcamStream'
import { GestureDetection, GestureDetector, GestureType } from './GestureDetector'
import { CheckCircle2, Hand, PauseCircle, ThumbsDown, ThumbsUp, PlayCircle } from 'lucide-react'

type LogItem = {
  id: string
  time: string
  gesture: GestureType
  action?: string
  status: 'detected' | 'sent' | 'error'
  detail?: string
}

function mapGestureToAction(gesture: GestureType): string | null {
  switch (gesture) {
    case 'ThumbsUp':
      return 'ACCEPT_SUGGESTION'
    case 'ThumbsDown':
      return 'REJECT_SUGGESTION'
    case 'OpenPalm':
      return 'STOP_EXECUTION'
    case 'TwoFingers':
      return 'RUN_TASK'
    default:
      return null
  }
}

function iconForGesture(gesture: GestureType) {
  switch (gesture) {
    case 'ThumbsUp':
      return <ThumbsUp className="w-4 h-4 text-emerald-400" />
    case 'ThumbsDown':
      return <ThumbsDown className="w-4 h-4 text-red-400" />
    case 'OpenPalm':
      return <PauseCircle className="w-4 h-4 text-yellow-400" />
    case 'TwoFingers':
      return <PlayCircle className="w-4 h-4 text-blue-400" />
    default:
      return <Hand className="w-4 h-4 text-neutral-400" />
  }
}

export function GestureControlPanel() {
  const [enabled, setEnabled] = useState(false)
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)
  const [lastGesture, setLastGesture] = useState<GestureDetection>({ gesture: 'None', confidence: 0 })
  const [autoTrigger, setAutoTrigger] = useState(true)
  const [logs, setLogs] = useState<LogItem[]>([])
  const lastSentRef = useRef<{ gesture: GestureType; at: number } | null>(null)

  const addLog = useCallback((item: Omit<LogItem, 'id' | 'time'>) => {
    setLogs((prev: LogItem[]) => [
      {
        id: Math.random().toString(36).slice(2, 9),
        time: new Date().toLocaleTimeString(),
        ...item,
      },
      ...prev,
    ].slice(0, 50))
  }, [])

  const trigger = useCallback(async (gesture: GestureType, confidence: number) => {
    const action = mapGestureToAction(gesture)
    if (!action) return

    try {
      addLog({ gesture, action, status: 'sent' })
      await apiClient.gestureDetect({ gesture, confidence, meta: { source: 'webcam' } })
      await apiClient.gestureAction({ action, payload: { source: 'webcam' } })
    } catch (e) {
      addLog({
        gesture,
        action: action || undefined,
        status: 'error',
        detail: e instanceof Error ? e.message : 'Request failed',
      })
    }
  }, [addLog])

  const onGesture = useCallback((d: GestureDetection) => {
    setLastGesture(d)

    if (!autoTrigger) {
      addLog({ gesture: d.gesture, status: 'detected' })
      return
    }

    if (d.gesture === 'None' || d.confidence < 0.75) return

    const now = Date.now()
    const lastSent = lastSentRef.current
    if (lastSent && lastSent.gesture === d.gesture && now - lastSent.at < 1500) return

    lastSentRef.current = { gesture: d.gesture, at: now }
    trigger(d.gesture, d.confidence)
  }, [addLog, autoTrigger, trigger])

  const actionLabel = useMemo(() => {
    const action = mapGestureToAction(lastGesture.gesture)
    return action || '—'
  }, [lastGesture.gesture])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Gesture Control</div>
          <div className="text-sm text-muted-foreground">Control AI features using webcam hand gestures.</div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoTrigger}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoTrigger(e.target.checked)}
            />
            Auto-trigger
          </label>

          <button
            onClick={() => setEnabled((v: boolean) => !v)}
            className={`px-4 py-2 rounded-lg border ${enabled ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300' : 'bg-neutral-900 border-neutral-800 text-neutral-200'}`}
          >
            {enabled ? 'Disable Webcam' : 'Enable Webcam'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <WebcamStream
            enabled={enabled}
            onVideoReady={v => setVideo(v)}
            onError={msg => addLog({ gesture: 'None', status: 'error', detail: msg })}
          />
          <div className="mt-3">
            <GestureDetector enabled={enabled} video={video} onGesture={onGesture} />
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Current</div>
            <div className="flex items-center gap-2">
              {iconForGesture(lastGesture.gesture)}
              <span className="font-medium">{lastGesture.gesture}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Mapped Action</div>
            <div className="text-sm font-mono">{actionLabel}</div>
          </div>

          <button
            disabled={lastGesture.gesture === 'None'}
            onClick={() => trigger(lastGesture.gesture, lastGesture.confidence)}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Trigger Action
          </button>

          <div className="text-xs text-muted-foreground">
            Tip: Hold the gesture steady for ~1s.
          </div>
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
        <div className="text-sm font-semibold mb-3">Action Log</div>
        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-neutral-600">No events yet.</div>
          ) : (
            logs.map((l: LogItem) => (
              <div key={l.id} className="flex items-center justify-between gap-4">
                <div className="text-neutral-500">[{l.time}]</div>
                <div className="flex-1 text-neutral-200">{l.gesture}</div>
                <div className="text-neutral-400">{l.action || ''}</div>
                <div className={l.status === 'error' ? 'text-red-400' : l.status === 'sent' ? 'text-emerald-400' : 'text-blue-400'}>
                  {l.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
