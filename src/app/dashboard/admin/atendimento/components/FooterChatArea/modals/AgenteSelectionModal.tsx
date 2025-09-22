'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot, Sparkles, Check, AlertCircle } from 'lucide-react'

interface Agente {
  id: string
  nome: string
  descricao: string
  modelo: string
  prompt: string
  ativo: boolean
  cor: string
}

interface AgenteSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (agente: Agente | null) => void
  agenteAtual?: Agente | null
  chatId?: string
}

export default function AgenteSelectionModal({ 
  isOpen, 
  onClose, 
  onSelect,
  agenteAtual,
  chatId 
}: AgenteSelectionModalProps) {
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAgente, setSelectedAgente] = useState<string | null>(agenteAtual?.id || null)
  
  // Buscar agentes disponíveis
  useEffect(() => {
    if (!isOpen) return
    
    const fetchAgentes = async () => {
      try {
        setLoading(true)
        console.log('🤖 [AgenteSelectionModal] Buscando agentes...')
        
        const response = await fetch('/api/agentes', {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDE9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })
        
        console.log('🤖 [AgenteSelectionModal] Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🤖 [AgenteSelectionModal] Dados recebidos:', data)
          
          // Tentar diferentes formatos de resposta
          let agentesData = []
          if (Array.isArray(data)) {
            agentesData = data
          } else if (data.data && Array.isArray(data.data)) {
            agentesData = data.data
          } else if (data.agentes && Array.isArray(data.agentes)) {
            agentesData = data.agentes
          }
          
          console.log('🤖 [AgenteSelectionModal] Agentes processados:', agentesData)
          setAgentes(agentesData)
        } else {
          console.error('🤖 [AgenteSelectionModal] Erro na resposta:', response.status)
        }
      } catch (error) {
        console.error('🤖 [AgenteSelectionModal] Erro ao buscar agentes:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAgentes()
  }, [isOpen])
  
  const handleSelectAgente = () => {
    const agente = agentes.find(a => a.id === selectedAgente)
    onSelect(agente || null)
    onClose()
  }
  
  const handleDesativarAgente = () => {
    onSelect(null)
    setSelectedAgente(null)
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Selecionar Agente IA
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Escolha um agente para auxiliar no atendimento
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Opção para desativar agente */}
                {agenteAtual && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedAgente(null)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedAgente === null
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Desativar Agente
                          </h3>
                          <p className="text-sm text-gray-500">
                            Atendimento manual sem assistência de IA
                          </p>
                        </div>
                      </div>
                      {selectedAgente === null && (
                        <Check className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </motion.button>
                )}
                
                {/* Lista de agentes */}
                {agentes.map((agente) => (
                  <motion.button
                    key={agente.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedAgente(agente.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedAgente === agente.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${agente.cor}20` }}
                        >
                          <Sparkles 
                            className="w-5 h-5" 
                            style={{ color: agente.cor }}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {agente.nome}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {agente.descricao}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                              {agente.modelo}
                            </span>
                            {agente.ativo && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded">
                                Ativo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedAgente === agente.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
                
                {agentes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum agente disponível</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              {selectedAgente === null ? (
                <button
                  onClick={handleDesativarAgente}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Desativar Agente
                </button>
              ) : (
                <button
                  onClick={handleSelectAgente}
                  disabled={!selectedAgente}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  Ativar Agente
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
