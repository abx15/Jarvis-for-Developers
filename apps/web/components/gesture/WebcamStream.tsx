'use client'

import React, { useEffect, useRef, useState } from 'react'

export type WebcamStreamStatus = 'idle' | 'starting' | 'running' | 'error' | 'stopped'

type Props = {
  enabled: boolean
  onVideoReady?: (video: HTMLVideoElement) => void
  onError?: (message: string) => void
  className?: string
}

export function WebcamStream({ enabled, onVideoReady, onError, className }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<WebcamStreamStatus>('idle')

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      if (!enabled) return
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error')
        onError?.('Webcam not supported in this browser')
        return
      }

      setStatus('starting')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setStatus('running')
          onVideoReady?.(videoRef.current)
        }
      } catch (e) {
        setStatus('error')
        onError?.(e instanceof Error ? e.message : 'Failed to start webcam')
      }
    }

    const stop = () => {
      const stream = streamRef.current
      streamRef.current = null
      if (stream) stream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      setStatus('stopped')
    }

    if (enabled) start()
    else stop()

    return () => {
      cancelled = true
      stop()
    }
  }, [enabled, onError, onVideoReady])

  return (
    <div className={className}>
      <video
        ref={videoRef}
        className="w-full h-auto rounded-xl bg-black"
        playsInline
        muted
        autoPlay
      />
      <div className="mt-2 text-xs text-muted-foreground">Status: {status}</div>
    </div>
  )
}
