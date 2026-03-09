'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Hands, Results } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

export type GestureType = 'ThumbsUp' | 'ThumbsDown' | 'OpenPalm' | 'TwoFingers' | 'None'

export type GestureDetection = {
  gesture: GestureType
  confidence: number
  handedness?: 'Left' | 'Right'
}

type Props = {
  enabled: boolean
  video?: HTMLVideoElement | null
  onGesture?: (detection: GestureDetection) => void
}

type Landmark = { x: number; y: number; z?: number }

const tipIdx = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
} as const

const pipIdx = {
  index: 6,
  middle: 10,
  ring: 14,
  pinky: 18,
} as const

function isFingerExtended(landmarks: Landmark[], tip: number, pip: number) {
  return landmarks[tip].y < landmarks[pip].y
}

function getHandedness(results: Results): 'Left' | 'Right' | undefined {
  const h = results.multiHandedness?.[0]
  const label = h?.label
  if (label === 'Left' || label === 'Right') return label
  return undefined
}

function classifyGesture(results: Results): GestureDetection {
  const landmarks = results.multiHandLandmarks?.[0] as Landmark[] | undefined
  if (!landmarks) return { gesture: 'None', confidence: 0 }

  const handedness = getHandedness(results)

  const indexUp = isFingerExtended(landmarks, tipIdx.index, pipIdx.index)
  const middleUp = isFingerExtended(landmarks, tipIdx.middle, pipIdx.middle)
  const ringUp = isFingerExtended(landmarks, tipIdx.ring, pipIdx.ring)
  const pinkyUp = isFingerExtended(landmarks, tipIdx.pinky, pipIdx.pinky)

  const thumbTip = landmarks[tipIdx.thumb]
  const thumbMcp = landmarks[2]

  const thumbExtended = Math.abs(thumbTip.x - thumbMcp.x) > 0.08

  const allUp = indexUp && middleUp && ringUp && pinkyUp
  const twoUp = indexUp && middleUp && !ringUp && !pinkyUp
  const othersDown = !indexUp && !middleUp && !ringUp && !pinkyUp

  if (allUp && thumbExtended) {
    return { gesture: 'OpenPalm', confidence: 0.9, handedness }
  }

  if (twoUp) {
    return { gesture: 'TwoFingers', confidence: 0.85, handedness }
  }

  if (thumbExtended && othersDown) {
    const wrist = landmarks[0]
    const isUp = thumbTip.y < wrist.y
    const isDown = thumbTip.y > wrist.y

    if (isUp) return { gesture: 'ThumbsUp', confidence: 0.8, handedness }
    if (isDown) return { gesture: 'ThumbsDown', confidence: 0.8, handedness }
  }

  return { gesture: 'None', confidence: 0.2, handedness }
}

export function GestureDetector({ enabled, video, onGesture }: Props) {
  const [last, setLast] = useState<GestureDetection>({ gesture: 'None', confidence: 0 })
  const cameraRef = useRef<Camera | null>(null)

  const hands = useMemo(() => {
    const h = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    h.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    })

    return h
  }, [])

  useEffect(() => {
    return () => {
      try {
        hands.close()
      } catch {
        // ignore
      }
    }
  }, [hands])

  useEffect(() => {
    if (!enabled || !video) return

    hands.onResults((results: Results) => {
      const detection = classifyGesture(results)
      setLast(detection)
      onGesture?.(detection)
    })

    const cam = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video })
      },
      width: 640,
      height: 480,
    })

    cameraRef.current = cam
    cam.start()

    return () => {
      cameraRef.current?.stop()
      cameraRef.current = null
    }
  }, [enabled, hands, onGesture, video])

  return (
    <div className="text-xs text-muted-foreground">
      Detected: <span className="text-foreground">{last.gesture}</span> ({Math.round(last.confidence * 100)}%)
    </div>
  )
}
