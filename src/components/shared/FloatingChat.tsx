'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Headphones, 
  CreditCard, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  Bot,
  User,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const chatCategories = [
  { id: 'suporte', label: 'Suporte Técnico', icon: Headphones, color: 'blue' },
  { id: 'atendimento', label: 'Atendimento Geral', icon: MessageSquare, color: 'indigo' },
  { id: 'planos', label: 'Planos e Pacotes', icon: CreditCard, color: 'purple' },
  { id: 'ouvidoria', label: 'Ouvidoria', icon: HelpCircle, color: 'gray' }
]

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'bot', timestamp: Date}>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    const category = chatCategories.find(c => c.id === categoryId)
    
    // Mensagem de boas-vindas personalizada
    const welcomeMessage = {
      id: Date.now().toString(),
      text: `Olá! Sou a IA da TappyOne 👋\n\nVocê selecionou: ${category?.label}\n\nEstou aqui 24/7 para te ajudar com tudo sobre nosso CRM inteligente. Como posso te ajudar hoje?`,
      sender: 'bot' as const,
      timestamp: new Date()
    }
    
    setMessages([welcomeMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simular resposta da IA (aqui você integrará com o backend)
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: `Entendi sua pergunta sobre "${inputMessage}". Como especialista da TappyOne, posso te ajudar com informações sobre nosso CRM, automação WhatsApp, IA integrada e muito mais. Precisa de mais detalhes sobre algum recurso específico?`,
        sender: 'bot' as const,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 10px 30px rgba(59, 130, 246, 0.3)",
              "0 10px 40px rgba(59, 130, 246, 0.5)",
              "0 10px 30px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          
          {/* Pulse indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg" />
          
          {/* Floating message preview */}
          <motion.div
            className="absolute -top-12 -left-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            Precisa de ajuda? 💬
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Container */}
            <motion.div
              className="relative w-full max-w-lg h-[90vh] max-h-[700px] sm:h-[600px] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              initial={{ y: "100%", scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">TappyOne AI</h3>
                      <p className="text-blue-100 text-sm">Assistente Virtual • Online 24/7</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              {!selectedCategory && (
                <div className="flex-1 flex flex-col p-6">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Como posso te ajudar?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Selecione o tipo de atendimento desejado
                    </p>
                  </div>

                  <div className="space-y-4 flex-1">
                    {chatCategories.map((category, index) => (
                      <motion.button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="w-full p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 text-left group shadow-sm hover:shadow-md"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                            <category.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 dark:text-white text-lg block">
                              {category.label}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
                              Atendimento especializado
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      💬 Atendimento 24/7 com IA especializada
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {selectedCategory && (
                <div className="flex flex-col h-full">
                  {/* Chat Header with Back Button */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedCategory('')
                          setMessages([])
                        }}
                        className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-300 rotate-180" />
                      </button>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          {React.createElement(chatCategories.find(c => c.id === selectedCategory)?.icon || MessageSquare, { 
                            className: "w-4 h-4 text-blue-600 dark:text-blue-400" 
                          })}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {chatCategories.find(c => c.id === selectedCategory)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className={`p-4 rounded-2xl shadow-sm ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-4'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mr-4'
                          }`}>
                            <div className="flex items-start space-x-3">
                              {message.sender === 'bot' && (
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Bot className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {message.text}
                                </div>
                                <div className={`text-xs mt-2 opacity-70 ${
                                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              {message.sender === 'user' && (
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm mr-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <Bot className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Digitando...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          placeholder="Digite sua mensagem..."
                          className="w-full px-4 py-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12 text-sm"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <motion.button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                              inputMessage.trim() 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl' 
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }`}
                            whileHover={inputMessage.trim() ? { scale: 1.1 } : {}}
                            whileTap={inputMessage.trim() ? { scale: 0.9 } : {}}
                          >
                            <Send className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Pressione Enter para enviar
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
