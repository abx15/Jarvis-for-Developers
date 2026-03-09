import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export interface UserAwareness {
  name: string
  color: string
  cursor?: {
    line: number
    column: number
  }
}

export class CollaborationProvider {
  private doc: Y.Doc
  private provider: WebsocketProvider
  private yText: Y.Text
  private onUsersChange?: (users: string[]) => void
  private onSyncChange?: (synced: boolean) => void

  constructor(
    sessionId: string,
    userId: string,
    onUsersChange?: (users: string[]) => void,
    onSyncChange?: (synced: boolean) => void
  ) {
    this.doc = new Y.Doc()
    this.yText = this.doc.getText('monaco')
    
    const wsUrl = `ws://localhost:8000/ws/editor/${sessionId}`
    this.provider = new WebsocketProvider(wsUrl, sessionId, this.doc)
    
    this.onUsersChange = onUsersChange || (() => {})
    this.onSyncChange = onSyncChange || (() => {})

    this.setupEventListeners(userId)
  }

  private setupEventListeners(userId: string) {
    // Listen for awareness changes (other users)
    this.provider.awareness.on('change', () => {
      const states = this.provider.awareness.getStates()
      const users = Array.from(states.keys())
        .filter(id => id.toString() !== userId.toString())
        .map(id => id.toString())
      
      if (this.onUsersChange) {
        this.onUsersChange(users)
      }
    })

    // Set user awareness
    this.provider.awareness.setLocalStateField('user', {
      name: userId,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    } as UserAwareness)

    // Handle connection events
    this.provider.on('status', (event: any) => {
      console.log('WebSocket status:', event.status)
    })

    this.provider.on('sync', (isSynced: boolean) => {
      console.log('Document synced:', isSynced)
      if (this.onSyncChange) {
        this.onSyncChange(isSynced)
      }
    })
  }

  // Get the Yjs text type for binding with Monaco
  getYText(): Y.Text {
    return this.yText
  }

  // Get awareness for cursor tracking
  getAwareness() {
    return this.provider.awareness
  }

  // Update cursor position
  updateCursor(line: number, column: number) {
    this.provider.awareness.setLocalStateField('user', {
      ...this.provider.awareness.getLocalState()?.user,
      cursor: { line, column }
    } as UserAwareness)
  }

  // Get current document content
  getContent(): string {
    return this.yText.toString()
  }

  // Set document content
  setContent(content: string) {
    this.yText.delete(0, this.yText.length)
    this.yText.insert(0, content)
  }

  // Cleanup
  destroy() {
    this.provider.destroy()
    this.doc.destroy()
  }

  // Check if connected
  isConnected(): boolean {
    return this.provider.wsconnected
  }
}
