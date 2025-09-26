'use client'

import { motion } from 'framer-motion'
import { Settings, Trash2, Circle } from 'lucide-react'
interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  config?: Record<string, any>
}
import { NODE_TYPES } from './FluxoNodes'

interface FlowNodeComponentProps {
  node: FlowNode
  isSelected: boolean
  isDark: boolean
  onDragStart: (nodeId: string, e: React.MouseEvent) => void
  onConfigOpen: (nodeId: string, nodeType: string) => void
  onConnectionStart: (nodeId: string, e: React.MouseEvent) => void
  onConnectionEnd?: (nodeId: string) => void
  onDelete: (nodeId: string) => void
}

export default function FlowNodeComponent({
  node,
  isSelected,
  isDark,
  onDragStart,
  onConfigOpen,
  onConnectionStart,
  onConnectionEnd,
  onDelete
}: FlowNodeComponentProps) {
  const nodeInfo = NODE_TYPES[node.type]
  
  if (!nodeInfo) return null

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
      purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
      red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
      yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
      pink: 'border-pink-500 bg-pink-50 dark:bg-pink-900/20',
      cyan: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
      teal: 'border-teal-500 bg-teal-50 dark:bg-teal-900/20',
    }
    return colorMap[color] || 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
  }

  const getIconColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      purple: 'text-purple-600 dark:text-purple-400',
      red: 'text-red-600 dark:text-red-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      indigo: 'text-indigo-600 dark:text-indigo-400',
      pink: 'text-pink-600 dark:text-pink-400',
      cyan: 'text-cyan-600 dark:text-cyan-400',
      teal: 'text-teal-600 dark:text-teal-400',
    }
    return colorMap[color] || 'text-gray-600 dark:text-gray-400'
  }

  return (
    <motion.div
      className={`absolute select-none cursor-move group ${getColorClass(nodeInfo.color)} 
        border-2 rounded-lg shadow-lg transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: 200,
        height: 100,
      }}
      onMouseDown={(e) => onDragStart(node.id, e)}
      onMouseUp={() => onConnectionEnd && onConnectionEnd(node.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Node Content */}
      <div className={`p-3 h-full flex flex-col ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <nodeInfo.icon className={`w-3 h-3 flex-shrink-0 ${getIconColorClass(nodeInfo.color)}`} />
            <span className="text-xs font-medium truncate">{nodeInfo.label}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onConfigOpen(node.id, node.type)
              }}
              className={`p-1 rounded ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(node.id)
              }}
              className={`p-1 rounded text-red-500 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className={`text-xs leading-tight line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {nodeInfo.description}
        </p>

        {/* Configuration Preview */}
        {node.config && Object.keys(node.config).length > 0 && (
          <div className={`text-xs mt-1 p-1 rounded truncate ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {getConfigPreview(node.type, node.config)}
          </div>
        )}
      </div>

      {/* Connection Points */}
      {/* Input (left side) */}
      {nodeInfo.category !== 'trigger' && (
        <div
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2
            w-3 h-3 rounded-full border-2 ${
            isDark ? 'bg-blue-600 border-blue-400' : 'bg-blue-500 border-blue-400'
          }`}
          onMouseUp={() => onConnectionEnd && onConnectionEnd(node.id)}
        />
      )}

      {/* Output (right side) */}
      <div
        className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2
          w-3 h-3 rounded-full border-2 cursor-crosshair bg-green-500 border-green-400 hover:border-green-600`}
        onMouseDown={(e) => {
          e.stopPropagation()
          onConnectionStart(node.id, e)
        }}
      />
    </motion.div>
  )
}

function getConfigPreview(nodeType: string, config: Record<string, any>): string {
  switch (nodeType) {
    case 'trigger-keyword':
      return config.keywords ? `"${config.keywords}"` : 'Sem palavras-chave'
    
    case 'condition-text-contains':
      return config.searchText ? `Contém: "${config.searchText}"` : 'Sem texto'
    
    case 'condition-time-range':
      return config.startTime && config.endTime 
        ? `${config.startTime} - ${config.endTime}` 
        : 'Horário não definido'
    
    case 'action-whatsapp-text':
      return config.message 
        ? `"${config.message.substring(0, 20)}${config.message.length > 20 ? '...' : ''}"` 
        : 'Sem mensagem'
    
    case 'action-resposta-rapida':
      return config.respostaId ? 'Resposta selecionada' : 'Resposta não definida'
    
    case 'action-fila-assign':
      return config.filaId ? 'Fila selecionada' : 'Fila não definida'
    
    case 'action-tag-create':
      return config.tagName ? `Tag: "${config.tagName}"` : 'Tag não definida'
    
    case 'action-delay-wait':
      return config.delayValue && config.delayUnit 
        ? `${config.delayValue} ${config.delayUnit}` 
        : 'Delay não definido'
    
    default:
      return 'Configurado'
  }
}
