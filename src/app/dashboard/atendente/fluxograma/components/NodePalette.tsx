'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  GitBranch, 
  Send, 
  Filter,
  Play,
  MessageSquare
} from 'lucide-react'
import { NODE_TYPES, NodeType } from './FluxoNodes'

interface NodePaletteProps {
  onNodeSelect: (nodeType: NodeType) => void
  isDark: boolean
}

type Category = 'trigger' | 'condition' | 'action'

const CATEGORIES = {
  trigger: {
    label: 'Gatilhos',
    icon: Zap,
    color: 'green'
  },
  condition: {
    label: 'Condições', 
    icon: GitBranch,
    color: 'blue'
  },
  action: {
    label: 'Ações',
    icon: Send,
    color: 'purple'
  }
}

export default function NodePalette({ onNodeSelect, isDark }: NodePaletteProps) {
  const [activeTab, setActiveTab] = useState<Category>('trigger')

  // Agrupar nodes por categoria
  const nodesByCategory = Object.entries(NODE_TYPES).reduce((acc, [key, nodeType]) => {
    const category = nodeType.category as Category
    if (!acc[category]) acc[category] = []
    acc[category].push({ key: key as NodeType, ...nodeType })
    return acc
  }, {} as Record<Category, Array<{ key: NodeType } & typeof NODE_TYPES[NodeType]>>)

  return (
    <div className={`w-72 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Componentes</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Clique para adicionar</p>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {Object.entries(CATEGORIES).map(([key, category]) => {
          const Icon = category.icon
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key as Category)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? `text-${category.color}-600 border-b-2 border-${category.color}-500`
                  : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Node List */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {nodesByCategory[activeTab]?.map((node) => (
          <motion.button
            key={node.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNodeSelect(node.key)}
            className={`w-full p-3 rounded-lg border-2 border-dashed transition-all text-left ${
              isDark 
                ? 'border-gray-600 hover:border-blue-500 bg-gray-700 hover:bg-gray-600 text-white'
                : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-gray-100 text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <node.icon className={`w-4 h-4 text-${node.color}-500 flex-shrink-0`} />
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{node.label}</div>
                <div className="text-xs opacity-75 truncate">{node.description}</div>
              </div>
            </div>
          </motion.button>
        )) || (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum componente nesta categoria</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`p-3 border-t text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
        {nodesByCategory[activeTab]?.length || 0} componente(s)
      </div>
    </div>
  )
}
