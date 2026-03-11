'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Trash2,
  CornerDownLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAIStream } from '@/hooks/useAIStream'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'ai'
  content: string
  isStreaming?: boolean
}

export function AIChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content:
        "Hello! I'm Jarvis, your AI assistant. How can I help you build something amazing today?",
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { stream, isStreaming, currentResponse, reset } = useAIStream({
    onComplete: fullText => {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'ai' && last.isStreaming) {
          return [...prev.slice(0, -1), { role: 'ai', content: fullText }]
        }
        return [...prev, { role: 'ai', content: fullText }]
      })
    },
  })

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentResponse])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])

    // Start streaming
    stream(input)
    setInput('')

    // Add immediate placeholder for AI
    setMessages(prev => [
      ...prev,
      { role: 'ai', content: '', isStreaming: true },
    ])
  }

  const clearChat = () => {
    setMessages([{ role: 'ai', content: "Chat cleared. What's on your mind?" }])
    reset()
  }

  return (
    <Card className="flex flex-col h-[600px] bg-gray-900 border-gray-800 overflow-hidden">
      <CardHeader className="border-b border-gray-800 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg">Jarvis AI Chat</CardTitle>
          <Badge
            variant="secondary"
            className="bg-blue-900/40 text-blue-400 border-blue-800"
          >
            Streaming
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-gray-500 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex w-full mb-4',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'flex flex-col max-w-[80%] space-y-2',
                msg.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {msg.role === 'ai' ? (
                  <>
                    <Bot className="w-3 h-3" />
                    <span>Jarvis</span>
                  </>
                ) : (
                  <>
                    <span>You</span>
                    <User className="w-3 h-3" />
                  </>
                )}
              </div>
              <div
                className={cn(
                  'p-4 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700 shadow-lg'
                )}
              >
                {msg.isStreaming ? (
                  <div className="flex flex-col">
                    <span>{currentResponse || 'Thinking...'}</span>
                    {currentResponse && (
                      <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse" />
                    )}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="p-4 bg-gray-950 border-t border-gray-800">
        <form
          onSubmit={handleSend}
          className="flex w-full items-center space-x-2 bg-gray-900 rounded-xl p-2 border border-gray-800 shadow-inner"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message to Jarvis..."
            className="flex-1 bg-transparent border-none focus:ring-0 shadow-none text-gray-200"
            disabled={isStreaming}
          />
          <Button
            size="icon"
            type="submit"
            disabled={!input.trim() || isStreaming}
            className={cn(
              'rounded-lg transition-all',
              isStreaming
                ? 'bg-gray-800'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
            )}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CornerDownLeft className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
