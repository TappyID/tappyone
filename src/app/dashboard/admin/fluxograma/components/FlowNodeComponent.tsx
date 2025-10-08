'use client'

import { motion } from 'framer-motion'
import { Settings, Trash2 } from 'lucide-react'
import { NODE_TYPES } from './FluxoNodes'
import { FlowNode } from './types'

const DEFAULT_NODE_DIMENSIONS = { width: 136, height: 54 }
const MINI_NODE_DIMENSIONS = { width: 104, height: 34 }

export const isMiniNode = (node: { type: string; config?: Record<string, any> }) =>
  node.config?.isMiniNode || node.type === 'menu-option'

export const getNodeDimensions = (
  node: { type: string; config?: Record<string, any> },
  portCountOverride?: number
) => {
  if (isMiniNode(node)) {
    return MINI_NODE_DIMENSIONS
  }

  let width = DEFAULT_NODE_DIMENSIONS.width
  let height = DEFAULT_NODE_DIMENSIONS.height

  if (node.type === 'action-whatsapp-list') {
    const optionsLength = Array.isArray(node.config?.listOptions) ? node.config.listOptions.length : 0
    const portCount = portCountOverride ?? optionsLength
    if (portCount > 1) {
      const extraPorts = portCount - 1
      height += Math.min(extraPorts * 10, 70)
    }
  }

  return { width, height }
}

export const getMenuOptionAnchorRatio = (
  node: { config?: Record<string, any> },
  optionIndex: number,
  portCountOverride?: number
) => {
  const options = Array.isArray(node.config?.listOptions) ? node.config?.listOptions : []
  const explicitCount = typeof portCountOverride === 'number' ? portCountOverride : options.length
  const count = explicitCount || options.length || 1
  if (!count) {
    return 0.5
  }
  const clampedIndex = Math.max(0, Math.min(optionIndex, count - 1))
  return ((clampedIndex + 1) / (count + 1))
}

interface FlowNodeComponentProps {
  node: FlowNode
  isSelected: boolean
  isDark: boolean
  onDragStart: (nodeId: string, e: React.MouseEvent) => void
  onConfigOpen: (nodeId: string, nodeType: string) => void
  onConnectionStart: (nodeId: string, e: React.MouseEvent, portInfo?: { optionIndex?: number }) => void
  onConnectionEnd?: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  menuPortCount?: number
}

export default function FlowNodeComponent({
  node,
  isSelected,
  isDark,
  onDragStart,
  onConfigOpen,
  onConnectionStart,
  onConnectionEnd,
  onDelete,
  menuPortCount
}: FlowNodeComponentProps) {
  const nodeInfo = NODE_TYPES[node.type]
  
  if (!nodeInfo) return null
  const mini = isMiniNode(node)
  const menuOptions = Array.isArray(node.config?.listOptions) ? node.config.listOptions : []
  const portCount = node.type === 'action-whatsapp-list'
    ? Math.max(menuOptions.length, menuPortCount ?? 0)
    : menuOptions.length
  const { width: nodeWidth, height: nodeHeight } = getNodeDimensions(node, portCount)

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-300 bg-blue-50/70 dark:bg-blue-900/30',
      green: 'border-green-300 bg-green-50/70 dark:bg-green-900/30',
      purple: 'border-purple-300 bg-purple-50/70 dark:bg-purple-900/30',
      red: 'border-red-300 bg-red-50/70 dark:bg-red-900/30',
      yellow: 'border-yellow-300 bg-yellow-50/70 dark:bg-yellow-900/30',
      indigo: 'border-indigo-300 bg-indigo-50/70 dark:bg-indigo-900/30',
      pink: 'border-pink-300 bg-pink-50/70 dark:bg-pink-900/30',
      cyan: 'border-cyan-300 bg-cyan-50/70 dark:bg-cyan-900/30',
      teal: 'border-teal-300 bg-teal-50/70 dark:bg-teal-900/30',
      orange: 'border-orange-300 bg-orange-50/70 dark:bg-orange-900/30',
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
      orange: 'text-orange-600 dark:text-orange-400',
    }
    return colorMap[color] || 'text-gray-600 dark:text-gray-400'
  }

  return (
    <motion.div
      className={`absolute select-none cursor-move group ${getColorClass(nodeInfo.color)}
        border rounded-md shadow-sm transition-all duration-150 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: nodeWidth,
        height: nodeHeight,
      }}
      onMouseDown={(e) => onDragStart(node.id, e)}
      onMouseUp={() => onConnectionEnd && onConnectionEnd(node.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Node Content */}
      <div className={`${mini ? 'px-1.5 py-1' : 'px-2 py-1.5'} h-full flex flex-col ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${mini ? 'mb-0.5' : 'mb-0.5'}`}>
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {/* ✅ Ocultar ícone em mini-nodes */}
            {!mini && <nodeInfo.icon className="w-3 h-3 flex-shrink-0" />}
            <span className={`${mini ? 'text-[8px]' : 'text-[9px]'} font-semibold truncate leading-tight ${getIconColorClass(nodeInfo.color)}`}>
              {mini && node.config?.optionTitle ? node.config.optionTitle : nodeInfo.label}
            </span>
          </div>
          
          {/* Action Buttons - Menores */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onConfigOpen(node.id, node.type)
              }}
              className={`p-0.5 rounded ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <Settings className={`${mini ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(node.id)
              }}
              className={`p-0.5 rounded text-red-500 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <Trash2 className={`${mini ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} />
            </button>
          </div>
        </div>

        {/* Description - Texto menor e mais compacto */}
        {!mini && (
          <p
            className={`text-[8px] leading-tight line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            title={nodeInfo.description}
          >
            {nodeInfo.description}
          </p>
        )}
        
        {/* ✅ REMOVIDO: Descrição dos mini-nodes para economizar espaço */}

        {/* Indicador de opções do menu - Mostrar pontos */}
        {node.type === 'action-whatsapp-list' && portCount > 0 && (
          <div className="flex items-center justify-center gap-0.5 mt-auto">
            {Array.from({ length: Math.min(portCount, 5) }).map((_, idx: number) => (
              <div 
                key={idx}
                className={`w-1 h-1 rounded-full ${
                  isDark ? 'bg-purple-400' : 'bg-purple-500'
                }`}
              />
            ))}
            {portCount > 5 && (
              <span className={`text-[8px] ml-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                +{portCount - 5}
              </span>
            )}
            <span className={`text-[8px] ml-0.5 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              ({portCount})
            </span>
          </div>
        )}

        {/* Configuration Preview */}
        {node.config && Object.keys(node.config).length > 0 && node.type !== 'action-whatsapp-list' && !mini && (
          <div className={`text-[8px] mt-0.5 px-1 py-0.5 rounded truncate leading-tight ${
            isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {getConfigPreview(node.type, node.config)}
          </div>
        )}
      </div>

      {/* Connection Points - Menores */}
      {/* Input (left side) */}
      {nodeInfo.category !== 'trigger' && (
        <div
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2
            ${mini ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full border ${
            isDark ? 'bg-purple-500 border-purple-300' : 'bg-purple-500 border-purple-300'
          }`}
          onMouseUp={() => onConnectionEnd && onConnectionEnd(node.id)}
        />
      )}

      {/* Output (right side) */}
      {node.type === 'action-whatsapp-list' && portCount ? (
        Array.from({ length: portCount }).map((_, index: number) => {
          const ratio = getMenuOptionAnchorRatio(node, index, portCount)
          return (
            <div
              key={index}
              className="absolute right-0 transform translate-x-1/2 -translate-y-1/2"
              style={{ top: `${ratio * 100}%` }}
            >
              <div
                data-option-index={index}
                className={`w-2 h-2 ${mini ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full border cursor-crosshair bg-green-500 border-green-300 hover:border-green-600 transition-transform hover:scale-110`}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  onConnectionStart(node.id, e, { optionIndex: index })
                }}
              />
            </div>
          )
        })
      ) : (
        <div
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2
            ${mini ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full border cursor-crosshair bg-green-500 border-green-300 hover:border-green-600`}
          onMouseDown={(e) => {
            e.stopPropagation()
            onConnectionStart(node.id, e)
          }}
        />
      )}
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
    
    case 'menu-option':
      return config.optionTitle 
        ? `Opção: ${config.optionTitle}` 
        : 'Opção do menu'
    
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
