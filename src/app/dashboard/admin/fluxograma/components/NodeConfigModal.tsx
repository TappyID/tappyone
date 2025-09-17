'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { NodeType, NODE_TYPES } from './FluxoNodes'

interface NodeConfigModalProps {
  nodeId: string
  nodeType: NodeType
  initialConfig: Record<string, any>
  isOpen: boolean
  onSave: (config: Record<string, any>) => void
  onClose: () => void
}

export default function NodeConfigModal({
  nodeId,
  nodeType,
  initialConfig,
  isOpen,
  onSave,
  onClose
}: NodeConfigModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [config, setConfig] = useState<Record<string, any>>(initialConfig)

  useEffect(() => {
    setConfig(initialConfig)
  }, [initialConfig, nodeId])

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const nodeInfo = NODE_TYPES[nodeType]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg rounded-xl shadow-2xl ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${nodeInfo.color}-100 dark:bg-${nodeInfo.color}-900`}>
                <nodeInfo.icon className={`w-5 h-5 text-${nodeInfo.color}-600 dark:text-${nodeInfo.color}-400`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Configurar {nodeInfo.label}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {nodeInfo.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {renderNodeConfig(nodeType, config, updateConfig, isDark)}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function renderNodeConfig(
  nodeType: NodeType,
  config: Record<string, any>,
  updateConfig: (field: string, value: any) => void,
  isDark: boolean
): React.ReactNode {
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    isDark 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`

  switch (nodeType) {
    // ============= TRIGGERS =============
    case 'trigger-whatsapp-message':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Filtrar por conexão</label>
            <select 
              value={config.conexaoId || ''} 
              onChange={(e) => updateConfig('conexaoId', e.target.value)}
              className={inputClass}
            >
              <option value="">Todas as conexões</option>
              <option value="conn1">Conexão Vendas</option>
              <option value="conn2">Conexão Suporte</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Filtrar por fila</label>
            <select 
              value={config.filaId || ''} 
              onChange={(e) => updateConfig('filaId', e.target.value)}
              className={inputClass}
            >
              <option value="">Todas as filas</option>
              <option value="fila1">Vendas</option>
              <option value="fila2">Suporte</option>
            </select>
          </div>
        </div>
      )

    case 'trigger-keyword':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Palavras-chave *</label>
            <input
              type="text"
              value={config.keywords || ''}
              onChange={(e) => updateConfig('keywords', e.target.value)}
              placeholder="Ex: oi, olá, bom dia"
              className={inputClass}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Separe múltiplas palavras com vírgula
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.caseSensitive || false}
              onChange={(e) => updateConfig('caseSensitive', e.target.checked)}
              className="rounded"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Diferenciar maiúsculas/minúsculas
            </span>
          </div>
        </div>
      )

    // ============= CONDITIONS =============
    case 'condition-text-contains':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Texto a procurar *</label>
            <input
              type="text"
              value={config.searchText || ''}
              onChange={(e) => updateConfig('searchText', e.target.value)}
              placeholder="Ex: agendamento"
              className={inputClass}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.exactMatch || false}
              onChange={(e) => updateConfig('exactMatch', e.target.checked)}
              className="rounded"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Correspondência exata
            </span>
          </div>
        </div>
      )

    case 'condition-time-range':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Horário de funcionamento</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                value={config.startTime || '09:00'}
                onChange={(e) => updateConfig('startTime', e.target.value)}
                className={inputClass}
              />
              <input
                type="time"
                value={config.endTime || '18:00'}
                onChange={(e) => updateConfig('endTime', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Dias da semana</label>
            <div className="flex flex-wrap gap-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const days = config.weekDays || []
                    const newDays = days.includes(index) 
                      ? days.filter((d: number) => d !== index)
                      : [...days, index]
                    updateConfig('weekDays', newDays)
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    (config.weekDays || []).includes(index)
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>
        </div>
      )

    // ============= ACTIONS =============
    case 'action-whatsapp-text':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Mensagem *</label>
            <textarea
              value={config.message || ''}
              onChange={(e) => updateConfig('message', e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Delay (segundos)</label>
            <input
              type="number"
              value={config.delay || 0}
              onChange={(e) => updateConfig('delay', parseInt(e.target.value))}
              min="0"
              max="300"
              className={inputClass}
            />
          </div>
        </div>
      )

    case 'action-resposta-rapida':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Resposta Rápida *</label>
            <select 
              value={config.respostaId || ''} 
              onChange={(e) => updateConfig('respostaId', e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione uma resposta</option>
              <option value="resp1">Bom dia! Como posso ajudar?</option>
              <option value="resp2">Obrigado pelo contato!</option>
            </select>
          </div>
        </div>
      )

    case 'action-fila-assign':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Fila *</label>
            <select 
              value={config.filaId || ''} 
              onChange={(e) => updateConfig('filaId', e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione uma fila</option>
              <option value="fila1">Vendas</option>
              <option value="fila2">Suporte</option>
            </select>
          </div>
        </div>
      )

    case 'action-tag-create':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nome da Tag *</label>
            <input
              type="text"
              value={config.tagName || ''}
              onChange={(e) => updateConfig('tagName', e.target.value)}
              placeholder="Ex: lead-quente"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Cor</label>
            <input
              type="color"
              value={config.tagColor || '#3B82F6'}
              onChange={(e) => updateConfig('tagColor', e.target.value)}
              className="w-full h-10 rounded-lg border"
            />
          </div>
        </div>
      )

    case 'action-delay-wait':
      return (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tempo de espera *</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={config.delayValue || 1}
                onChange={(e) => updateConfig('delayValue', parseInt(e.target.value))}
                min="1"
                className={inputClass}
              />
              <select 
                value={config.delayUnit || 'seconds'} 
                onChange={(e) => updateConfig('delayUnit', e.target.value)}
                className={inputClass}
              >
                <option value="seconds">Segundos</option>
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
                <option value="days">Dias</option>
              </select>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="text-center py-8">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Configuração não implementada para este tipo de node
          </p>
        </div>
      )
  }
}
