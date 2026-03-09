'use client'

import React from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Hand,
  PlayCircle,
  PauseCircle,
  MinusCircle,
} from 'lucide-react'
import { GestureType } from './GestureDetector'

type Props = {
  gesture: GestureType
  confidence: number
}

const GESTURE_MAP: Record<
  GestureType,
  { label: string; icon: React.ReactNode; color: string; action: string }
> = {
  ThumbsUp: {
    label: 'Approve',
    icon: <ThumbsUp className="w-8 h-8" />,
    color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
    action: 'ACCEPT_SUGGESTION',
  },
  ThumbsDown: {
    label: 'Reject',
    icon: <ThumbsDown className="w-8 h-8" />,
    color: 'text-red-400 border-red-500/50 bg-red-500/10',
    action: 'REJECT_SUGGESTION',
  },
  OpenPalm: {
    label: 'Stop',
    icon: <PauseCircle className="w-8 h-8" />,
    color: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    action: 'STOP_EXECUTION',
  },
  TwoFingers: {
    label: 'Execute',
    icon: <PlayCircle className="w-8 h-8" />,
    color: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    action: 'RUN_TASK',
  },
  None: {
    label: 'No Gesture',
    icon: <Hand className="w-8 h-8 opacity-20" />,
    color: 'text-neutral-500 border-neutral-800 bg-neutral-900/50',
    action: 'NONE',
  },
}

export function GestureIndicator({ gesture, confidence }: Props) {
  const config = GESTURE_MAP[gesture]

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${config.color}`}
    >
      <div className="mb-4 animate-in zoom-in fade-in duration-300">
        {config.icon}
      </div>
      <div className="text-xl font-bold tracking-tight">{config.label}</div>
      <div className="text-xs font-mono mt-1 opacity-70">
        {gesture !== 'None'
          ? `${Math.round(confidence * 100)}% Confidence`
          : 'Awaiting input...'}
      </div>
      {gesture !== 'None' && (
        <div className="mt-4 px-3 py-1 rounded-full bg-black/20 text-[10px] uppercase tracking-widest font-bold">
          {config.action}
        </div>
      )}
    </div>
  )
}
