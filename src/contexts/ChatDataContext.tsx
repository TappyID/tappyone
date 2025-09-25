'use client'

import React, { createContext, useContext, useCallback } from 'react'

interface ChatDataContextType {
  invalidateChat: (chatId: string) => void
  invalidateAllChats: () => void
}

const ChatDataContext = createContext<ChatDataContextType | undefined>(undefined)

// Cache de callbacks de invalidação por chatId
const invalidationCallbacks = new Map<string, Set<() => void>>()

export function ChatDataProvider({ children }: { children: React.ReactNode }) {
  const invalidateChat = useCallback((chatId: string) => {
    const callbacks = invalidationCallbacks.get(chatId)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }, [])

  const invalidateAllChats = useCallback(() => {
    invalidationCallbacks.forEach(callbacks => {
      callbacks.forEach(callback => callback())
    })
  }, [])

  return (
    <ChatDataContext.Provider value={{
      invalidateChat,
      invalidateAllChats
    }}>
      {children}
    </ChatDataContext.Provider>
  )
}

export function useChatDataContext() {
  const context = useContext(ChatDataContext)
  if (context === undefined) {
    throw new Error('useChatDataContext must be used within a ChatDataProvider')
  }
  return context
}

// Hook para registrar callback de invalidação
export function useInvalidationCallback(chatId: string, callback: () => void) {
  React.useEffect(() => {
    if (!invalidationCallbacks.has(chatId)) {
      invalidationCallbacks.set(chatId, new Set())
    }
    
    const callbacks = invalidationCallbacks.get(chatId)!
    callbacks.add(callback)
    
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        invalidationCallbacks.delete(chatId)
      }
    }
  }, [chatId, callback])
}
