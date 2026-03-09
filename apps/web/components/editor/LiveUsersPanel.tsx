'use client'

import React from 'react'
import { Users, Circle } from 'lucide-react'

type User = {
  id: string
  name: string
  color: string
  cursor?: {
    line: number
    column: number
  }
}

type Props = {
  users: User[]
  currentUser?: string
}

export function LiveUsersPanel({ users, currentUser }: Props) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-green-400" />
        <h4 className="text-sm font-medium text-white">Active Users</h4>
        <span className="text-xs text-neutral-400">({users.length})</span>
      </div>

      <div className="space-y-2">
        {users.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-2 p-2 rounded-md bg-neutral-800/50"
          >
            <div className="relative">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-neutral-900"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm text-white truncate">
                  {user.name}
                </span>
                {user.id === currentUser && (
                  <span className="text-xs text-neutral-400">(you)</span>
                )}
              </div>
              
              {user.cursor && (
                <div className="text-xs text-neutral-400">
                  Line {user.cursor.line}, Col {user.cursor.column}
                </div>
              )}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-4">
            <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">
              No active users
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-800">
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 text-green-500 fill-current" />
          <span className="text-xs text-neutral-400">
            Real-time collaboration enabled
          </span>
        </div>
      </div>
    </div>
  )
}
