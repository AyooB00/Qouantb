import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    stocks?: string[]
    charts?: Array<{ type: string; data: unknown }>
    sources?: string[]
    error?: boolean
  }
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

interface ChatStore {
  // Current conversation
  currentConversationId: string | null
  messages: ChatMessage[]
  
  // All conversations
  conversations: ChatConversation[]
  
  // UI state
  isLoading: boolean
  streamingMessageId: string | null
  error: string | null
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (id: string) => void
  
  // Conversation management
  createConversation: (title?: string) => string
  loadConversation: (id: string) => void
  deleteConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void
  
  // UI actions
  setLoading: (loading: boolean) => void
  setStreamingMessageId: (id: string | null) => void
  setError: (error: string | null) => void
  clearCurrentChat: () => void
  clearAllData: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentConversationId: null,
      messages: [],
      conversations: [],
      isLoading: false,
      streamingMessageId: null,
      error: null,

      // Message actions
      addMessage: (message) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date().toISOString()
        
        const newMessage: ChatMessage = {
          ...message,
          id,
          timestamp
        }
        
        set((state) => {
          const messages = [...state.messages, newMessage]
          
          // Update current conversation if exists
          if (state.currentConversationId) {
            const conversations = state.conversations.map(conv => 
              conv.id === state.currentConversationId
                ? { 
                    ...conv, 
                    messages,
                    updatedAt: timestamp,
                    title: conv.title === 'New Chat' && message.role === 'user' 
                      ? (() => {
                          const maxLength = 20
                          const cleaned = message.content.trim()
                          
                          if (cleaned.length <= maxLength) return cleaned
                          
                          // Find the last space before the limit
                          const truncated = cleaned.slice(0, maxLength - 3) // Reserve space for ...
                          const lastSpace = truncated.lastIndexOf(' ')
                          
                          if (lastSpace > 10) {
                            return truncated.slice(0, lastSpace) + '...'
                          }
                          
                          // If no good space found, just cut at character limit
                          return truncated + '...'
                        })()
                      : conv.title
                  }
                : conv
            )
            
            return { messages, conversations }
          }
          
          return { messages }
        })
        
        return id
      },

      updateMessage: (id, updates) => {
        set((state) => {
          const messages = state.messages.map(msg => 
            msg.id === id ? { ...msg, ...updates } : msg
          )
          
          // Update in conversations too
          if (state.currentConversationId) {
            const conversations = state.conversations.map(conv => 
              conv.id === state.currentConversationId
                ? { ...conv, messages, updatedAt: new Date().toISOString() }
                : conv
            )
            
            return { messages, conversations }
          }
          
          return { messages }
        })
      },

      deleteMessage: (id) => {
        set((state) => {
          const messages = state.messages.filter(msg => msg.id !== id)
          
          // Update in conversations too
          if (state.currentConversationId) {
            const conversations = state.conversations.map(conv => 
              conv.id === state.currentConversationId
                ? { ...conv, messages, updatedAt: new Date().toISOString() }
                : conv
            )
            
            return { messages, conversations }
          }
          
          return { messages }
        })
      },

      // Conversation management
      createConversation: (title = 'New Chat') => {
        const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date().toISOString()
        
        const newConversation: ChatConversation = {
          id,
          title,
          messages: [],
          createdAt: timestamp,
          updatedAt: timestamp
        }
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
          messages: []
        }))
        
        return id
      },

      loadConversation: (id) => {
        const conversation = get().conversations.find(conv => conv.id === id)
        if (conversation) {
          set({
            currentConversationId: id,
            messages: conversation.messages
          })
        }
      },

      deleteConversation: (id) => {
        set((state) => {
          const conversations = state.conversations.filter(conv => conv.id !== id)
          const isCurrentConversation = state.currentConversationId === id
          
          return {
            conversations,
            currentConversationId: isCurrentConversation ? null : state.currentConversationId,
            messages: isCurrentConversation ? [] : state.messages
          }
        })
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map(conv => 
            conv.id === id ? { ...conv, title } : conv
          )
        }))
      },

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setStreamingMessageId: (id) => set({ streamingMessageId: id }),
      setError: (error) => set({ error }),
      
      clearCurrentChat: () => {
        set((state) => {
          if (state.currentConversationId) {
            // Clear messages from current conversation
            const conversations = state.conversations.map(conv => 
              conv.id === state.currentConversationId
                ? { ...conv, messages: [], updatedAt: new Date().toISOString() }
                : conv
            )
            
            return { messages: [], conversations }
          }
          
          return { messages: [] }
        })
      },
      
      clearAllData: () => {
        set({
          currentConversationId: null,
          messages: [],
          conversations: [],
          isLoading: false,
          streamingMessageId: null,
          error: null
        })
      }
    }),
    {
      name: 'finchat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        messages: state.messages
      })
    }
  )
)