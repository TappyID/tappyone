'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { Layers, Settings, Plus, ArrowRight } from 'lucide-react'

const KanbanNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
        selected 
          ? 'border-[#305e73] shadow-xl' 
          : 'border-orange-300 hover:border-orange-400'
      }`}
      style={{ minWidth: '220px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">KANBAN</div>
            <div className="text-xs opacity-90">{data.label}</div>
          </div>
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-sm text-gray-700 mb-3">
          {data.description || 'Cria um card no quadro Kanban'}
        </div>
        
        {/* Config Preview */}
        {data.config && (
          <div className="bg-gray-50 rounded-lg p-2 text-xs mb-3">
            {data.config.kanban_id && (
              <div className="mb-1">
                <span className="text-gray-600">Quadro: </span>
                <span className="font-medium">#{data.config.kanban_id}</span>
              </div>
            )}
            {data.config.coluna && (
              <div className="mb-1">
                <span className="text-gray-600">Coluna: </span>
                <span className="font-medium capitalize">{data.config.coluna}</span>
              </div>
            )}
            {data.config.titulo && (
              <div className="mb-1">
                <span className="text-gray-600">Título: </span>
                <span className="font-medium">
                  {data.config.titulo.length > 20 
                    ? `${data.config.titulo.substring(0, 20)}...` 
                    : data.config.titulo
                  }
                </span>
              </div>
            )}
            {!data.config.kanban_id && (
              <div className="text-gray-500 italic">Quadro não selecionado</div>
            )}
          </div>
        )}

        {/* Card Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="w-3 h-3 text-orange-500" />
            <span className="font-medium text-gray-700">Novo Card</span>
          </div>
          <div className="text-gray-500 text-xs">
            Será criado automaticamente
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <button className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
        <Settings className="w-3 h-3 text-white" />
      </button>

      {/* Action Indicator */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
        <ArrowRight className="w-2 h-2 text-white" />
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500 border-2 border-white shadow-lg"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-500 border-2 border-white shadow-lg"
      />
    </motion.div>
  )
}

export default KanbanNode
