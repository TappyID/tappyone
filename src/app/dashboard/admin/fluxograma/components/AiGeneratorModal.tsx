'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain, Wand2, MessageSquare, Send, Loader2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AiGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (flowData: any) => void
}

const PRESET_FLOWS = [
  {
    id: 'vendas-lead',
    title: 'Qualificação de Lead',
    description: 'Fluxo para qualificar leads automaticamente via WhatsApp',
    prompt: 'Criar um fluxo para qualificar leads que chegam via WhatsApp. Deve detectar palavra-chave "orçamento", enviar formulário de qualificação, processar com IA e mover para Kanban de vendas.'
  },
  {
    id: 'suporte-ticket',
    title: 'Ticket de Suporte',
    description: 'Sistema de atendimento automático para suporte',
    prompt: 'Criar fluxo de suporte que detecta problemas, categoriza por palavras-chave, oferece soluções rápidas e escalona para atendente humano se necessário.'
  },
  {
    id: 'cobranca-automatica',
    title: 'Cobrança Automática',
    description: 'Fluxo para cobranças e lembretes de pagamento',
    prompt: 'Criar sistema de cobrança que verifica vencimentos, envia lembretes personalizados, oferece PIX para pagamento e agenda follow-ups automáticos.'
  },
  {
    id: 'onboarding-cliente',
    title: 'Onboarding de Cliente',
    description: 'Processo de boas-vindas para novos clientes',
    prompt: 'Criar fluxo de onboarding que recebe novos clientes, coleta informações, envia materiais de boas-vindas e agenda primeira reunião.'
  }
]

export function AiGeneratorModal({ isOpen, onClose, onGenerate }: AiGeneratorModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      let prompt = ''
      
      if (mode === 'preset' && selectedPreset) {
        const preset = PRESET_FLOWS.find(p => p.id === selectedPreset)
        prompt = preset?.prompt || ''
      } else if (mode === 'custom') {
        prompt = customPrompt
      }

      // TODO: Integrar com DeepSeek API
      const response = await fetch('/api/ai/generate-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })

      if (response.ok) {
        const flowData = await response.json()
        onGenerate(flowData)
        onClose()
      } else {
        throw new Error('Erro ao gerar fluxo')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao gerar fluxo. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-2xl mx-4 rounded-xl shadow-2xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Gerar Fluxo com IA
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Crie fluxos automaticamente usando DeepSeek AI
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Mode Toggle */}
            <div className={`flex rounded-lg p-1 mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <button
                onClick={() => setMode('preset')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'preset'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wand2 className="w-4 h-4 inline mr-2" />
                Modelos Prontos
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'custom'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Prompt Personalizado
              </button>
            </div>

            {/* Preset Mode */}
            {mode === 'preset' && (
              <div className="space-y-3">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Escolha um modelo:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {PRESET_FLOWS.map((preset) => (
                    <motion.div
                      key={preset.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPreset === preset.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : isDark 
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                    >
                      <h4 className={`font-medium mb-1 ${
                        selectedPreset === preset.id ? 'text-purple-600' : isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {preset.title}
                      </h4>
                      <p className={`text-sm ${
                        selectedPreset === preset.id ? 'text-purple-600/80' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {preset.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Mode */}
            {mode === 'custom' && (
              <div className="space-y-3">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descreva o fluxo que deseja:
                </h3>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ex: Criar um fluxo que detecta quando o cliente menciona 'problema' e automaticamente abre um ticket de suporte..."
                  rows={4}
                  className={`w-full rounded-lg border p-3 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Seja específico sobre triggers, condições e ações que deseja no fluxo.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Powered by DeepSeek AI
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cancelar
              </button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                disabled={isGenerating || (mode === 'preset' && !selectedPreset) || (mode === 'custom' && !customPrompt.trim())}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isGenerating ? 'Gerando...' : 'Gerar Fluxo'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
