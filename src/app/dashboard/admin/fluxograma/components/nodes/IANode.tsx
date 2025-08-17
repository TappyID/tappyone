'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { Bot, Settings, Zap, Brain } from 'lucide-react'

const IANode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
        selected 
          ? 'border-[#305e73] shadow-xl' 
          : 'border-purple-300 hover:border-purple-400'
      }`}
      style={{ minWidth: '200px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">INTELIGÊNCIA ARTIFICIAL</div>
            <div className="text-xs opacity-90">{data.label}</div>
          </div>
          <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-sm text-gray-700 mb-2">
          {data.description || 'Gera resposta usando IA'}
        </div>
        
        {/* Config Preview */}
        {data.config && (
          <div className="bg-gray-50 rounded-lg p-2 text-xs mb-2">
            {data.config.agente_id && (
              <div className="mb-1">
                <span className="text-gray-600">Agente: </span>
                <span className="font-medium">#{data.config.agente_id}</span>
              </div>
            )}
            {data.config.prompt && (
              <div>
                <span className="text-gray-600">Prompt: </span>
                <span className="font-medium">
                  {data.config.prompt.length > 30 
                    ? `${data.config.prompt.substring(0, 30)}...` 
                    : data.config.prompt
                  }
                </span>
              </div>
            )}
            {!data.config.agente_id && !data.config.prompt && (
              <div className="text-gray-500 italic">IA não configurada</div>
            )}
          </div>
        )}

        {/* AI Status */}
        <div className="flex items-center gap-2 text-xs">
          <Brain className="w-3 h-3 text-purple-500" />
          <span className="text-gray-600">Processamento inteligente</span>
        </div>
      </div>

      {/* Settings Button */}
      <button className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
        <Settings className="w-3 h-3 text-white" />
      </button>

      {/* Processing Indicator */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
        <Zap className="w-2 h-2 text-white" />
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white shadow-lg"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white shadow-lg"
      />
    </motion.div>
  )
}

export default IANode
