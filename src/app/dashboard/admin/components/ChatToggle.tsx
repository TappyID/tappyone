'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

interface ChatToggleProps {
  sidebarCollapsed?: boolean
}

export function ChatToggle({ sidebarCollapsed = true }: ChatToggleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(true)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
    if (!isChatOpen) {
      setHasNewMessages(false)
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={toggleChat}
        className={`relative p-2 rounded-xl transition-colors duration-200 group ${
          sidebarCollapsed 
            ? 'hover:bg-gray-100 text-gray-600'
            : 'hover:bg-white/10 text-white'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className={`w-5 h-5 transition-colors duration-200 ${
          sidebarCollapsed 
            ? 'text-gray-600 group-hover:text-[#273155]'
            : 'text-white group-hover:text-blue-200'
        }`} />
        
        {/* New Messages Badge */}
        {hasNewMessages && !isChatOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div
              className="w-full h-full bg-green-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ opacity: 0.6 }}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Chat Panel */}
      {isChatOpen && (
        <motion.div
          className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#273155]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Chat Interno</h3>
                <p className="text-xs text-white/70">3 pessoas online</p>
              </div>
            </div>
            <motion.button
              onClick={toggleChat}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <motion.div
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                A
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-2">
                  <p className="text-sm text-gray-900">Olá! Como posso ajudar?</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Admin • agora</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-2 justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex-1 text-right">
                <div className="bg-[#273155] rounded-lg p-2 inline-block">
                  <p className="text-sm text-white">Preciso de ajuda com um relatório</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Você • agora</p>
              </div>
            </motion.div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273155]/20 focus:border-[#273155]"
              />
              <motion.button
                className="px-4 py-2 bg-[#273155] text-white rounded-lg text-sm font-medium hover:bg-[#1e2442] transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enviar
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
