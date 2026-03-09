'use client'

import React, { useState } from 'react'
import { WebcamStream } from './WebcamStream'
import { GestureDetector, GestureDetection } from './GestureDetector'
import { Camera, CameraOff } from 'lucide-react'

type Props = {
  onGesture: (detection: GestureDetection) => void
  onStatusChange?: (status: boolean) => void
}

export function GestureCamera({ onGesture, onStatusChange }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  )

  const toggleCamera = () => {
    const newState = !enabled
    setEnabled(newState)
    onStatusChange?.(newState)
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 aspect-video relative">
        {!enabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10 bg-neutral-950/80">
            <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500">
              <CameraOff className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-neutral-300">
                Camera is disabled
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enable to start gesture control
              </p>
            </div>
            <button
              onClick={toggleCamera}
              className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors"
            >
              Enable Webcam
            </button>
          </div>
        )}

        <WebcamStream
          enabled={enabled}
          className="w-full h-full object-cover"
          onVideoReady={setVideoElement}
          onError={err => console.error('Webcam Error:', err)}
        />

        {enabled && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleCamera}
              className="p-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all backdrop-blur-md"
              title="Stop Camera"
            >
              <CameraOff className="w-4 h-4" />
            </button>
          </div>
        )}

        {enabled && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full z-20">
            <GestureDetector
              enabled={enabled}
              video={videoElement}
              onGesture={onGesture}
            />
          </div>
        )}
      </div>

      {enabled && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-tighter">
            Live Hand Tracking
          </span>
        </div>
      )}
    </div>
  )
}
