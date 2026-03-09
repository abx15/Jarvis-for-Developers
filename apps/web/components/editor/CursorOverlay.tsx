'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Cursor = {
  userId: string
  name: string
  color: string
  position: {
    line: number
    column: number
  }
  selection?: {
    start: {
      line: number
      column: number
    }
    end: {
      line: number
      column: number
    }
  }
}

type Props = {
  cursors: Cursor[]
  editorRef?: any
  currentUserId?: string
}

export function CursorOverlay({ cursors, editorRef, currentUserId }: Props) {
  const [cursorElements, setCursorElements] = useState<Array<{
    userId: string
    element: JSX.Element
  }>>([])

  useEffect(() => {
    if (!editorRef?.current) return

    const editor = editorRef.current
    const elements: Array<{ userId: string; element: JSX.Element }> = []

    cursors.forEach(cursor => {
      if (cursor.userId === currentUserId) return

      // Calculate cursor position in pixels
      const position = editor.getScrolledEditorPosition()
      const lineTop = editor.getTopForLineNumber(cursor.position.line)
      const columnLeft = editor.getOffsetForColumn(cursor.position.line, cursor.position.column)

      const cursorStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${lineTop - position.top}px`,
        left: `${columnLeft - position.left}px`,
        width: '2px',
        height: '18px',
        backgroundColor: cursor.color,
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'all 0.1s ease-out',
      }

      // Create cursor element
      const cursorElement = (
        <div key={cursor.userId} style={cursorStyle}>
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              backgroundColor: cursor.color,
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              transform: 'translateX(-50%)',
            }}
          >
            {cursor.name}
          </div>
        </div>
      )

      elements.push({ userId: cursor.userId, element: cursorElement })

      // Add selection if present
      if (cursor.selection) {
        const startTop = editor.getTopForLineNumber(cursor.selection.start.line)
        const startLeft = editor.getOffsetForColumn(cursor.selection.start.line, cursor.selection.start.column)
        const endTop = editor.getTopForLineNumber(cursor.selection.end.line)
        const endLeft = editor.getOffsetForColumn(cursor.selection.end.line, cursor.selection.end.column)

        const selectionStyle: React.CSSProperties = {
          position: 'absolute',
          top: `${Math.min(startTop, endTop) - position.top}px`,
          left: `${Math.min(startLeft, endLeft) - position.left}px`,
          width: `${Math.abs(endLeft - startLeft)}px`,
          height: `${Math.abs(endTop - startTop) + 18}px`,
          backgroundColor: cursor.color,
          opacity: 0.2,
          pointerEvents: 'none',
          zIndex: 999,
        }

        const selectionElement = (
          <div key={`${cursor.userId}-selection`} style={selectionStyle} />
        )

        elements.push({ userId: `${cursor.userId}-selection`, element: selectionElement })
      }
    })

    setCursorElements(elements)
  }, [cursors, editorRef, currentUserId])

  if (typeof window === 'undefined' || !editorRef?.current) {
    return null
  }

  // Find the editor's overlay container or create one
  let overlayContainer = document.querySelector('.cursor-overlay-container') as HTMLElement
  if (!overlayContainer) {
    overlayContainer = document.createElement('div') as HTMLElement
    overlayContainer.className = 'cursor-overlay-container'
    overlayContainer.style.position = 'absolute'
    overlayContainer.style.top = '0'
    overlayContainer.style.left = '0'
    overlayContainer.style.right = '0'
    overlayContainer.style.bottom = '0'
    overlayContainer.style.pointerEvents = 'none'
    overlayContainer.style.zIndex = '999'
    
    const editorContainer = editorRef.current.getContainerDomNode()
    if (editorContainer) {
      editorContainer.appendChild(overlayContainer)
    }
  }

  return createPortal(
    <>
      {cursorElements.map(({ element }) => element)}
    </>,
    overlayContainer
  )
}

// Hook to manage cursor positions
export function useCursorTracking(
  editorRef: any,
  collaborationProvider: any,
  userId: string
) {
  const [cursors, setCursors] = useState<Array<{
    userId: string
    name: string
    color: string
    position: { line: number; column: number }
    selection?: {
      start: { line: number; column: number }
      end: { line: number; column: number }
    }
  }>>([])

  useEffect(() => {
    if (!editorRef?.current || !collaborationProvider) return

    const editor = editorRef.current

    // Handle cursor position changes
    const handleCursorPositionChange = () => {
      const position = editor.getPosition()
      if (position) {
        collaborationProvider.updateCursor(position.lineNumber, position.column)
      }
    }

    // Handle selection changes
    const handleSelectionChange = () => {
      const selection = editor.getSelection()
      if (selection) {
        const range = {
          start: {
            line: selection.startLineNumber,
            column: selection.startColumn,
          },
          end: {
            line: selection.endLineNumber,
            column: selection.endColumn,
          },
        }
        collaborationProvider.updateSelection(range)
      }
    }

    // Register event listeners
    const cursorDisposable = editor.onDidChangeCursorPosition(handleCursorPositionChange)
    const selectionDisposable = editor.onDidChangeCursorSelection(handleSelectionChange)

    // Listen for other users' cursor updates
    const handleAwarenessChange = () => {
      const states = collaborationProvider.getAwareness().getStates()
      const otherCursors: typeof cursors = []

      states.forEach((state: any, id: string) => {
        if (id.toString() !== userId) {
          const user = state.user
          if (user) {
            otherCursors.push({
              userId: id.toString(),
              name: user.name || 'Anonymous',
              color: user.color || '#666',
              position: user.cursor || { line: 1, column: 1 },
              selection: user.selection,
            })
          }
        }
      })

      setCursors(otherCursors)
    }

    collaborationProvider.getAwareness().on('change', handleAwarenessChange)

    return () => {
      cursorDisposable.dispose()
      selectionDisposable.dispose()
      collaborationProvider.getAwareness().off('change', handleAwarenessChange)
    }
  }, [editorRef, collaborationProvider, userId])

  return cursors
}
