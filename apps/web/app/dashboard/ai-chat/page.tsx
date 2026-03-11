'use client'

import React from 'react'
import { AIChatWindow } from '@/components/chat/AIChatWindow'
import { Sparkles, History, MessageSquare, Plus } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AIChatPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / History Side */}
        <div className="w-full md:w-80 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-500" />
              Chat
            </h1>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full bg-gray-900/50 border-gray-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-blue-900/20 to-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-blue-400">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Jarvis can stream responses for real-time coding help, bug
                analysis, and documentation.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center px-2">
              <History className="w-3 h-3 mr-2" />
              Recent History
            </h3>
            <div className="space-y-1">
              {[
                'Bug analysis in core/engine.py',
                'Refactor Organization API',
                'Database migration help',
              ].map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 h-auto py-3"
                >
                  <MessageSquare className="w-4 h-4 mr-3 opacity-50" />
                  <span className="truncate">{item}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1">
          <AIChatWindow />
        </div>
      </div>
    </div>
  )
}
