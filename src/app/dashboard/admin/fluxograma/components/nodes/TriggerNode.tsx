'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { MessageSquare, Zap, Clock, Settings } from 'lucide-react'

const TriggerNode = ({ data, selected }: NodeProps) => {
  const getIcon = () => {
    switch (data.config?.trigger) {
      case 'message_received':
        return MessageSquare
      case 'keyword':
        return Zap
      case 'schedule':
        return Clock
      default:
        return Zap
    }
  }

  const Icon = getIcon()

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
        selected 
          ? 'border-[#305e73] shadow-xl' 
          : 'border-green-300 hover:border-green-400'
      }`}
      style={{ minWidth: '200px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">GATILHO</div>
            <div className="text-xs opacity-90">{data.label}</div>
          </div>
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-sm text-gray-700 mb-2">
          {data.description || 'Inicia o fluxo de automação'}
        </div>
        
        {/* Config Preview */}
        {data.config && (
          <div className="bg-gray-50 rounded-lg p-2 text-xs">
            {data.config.trigger === 'keyword' && data.config.keywords?.length > 0 && (
              <div>
                <span className="text-gray-600">Palavras-chave: </span>
                <span className="font-medium">{data.config.keywords.join(', ')}</span>
              </div>
            )}
            {data.config.trigger === 'schedule' && data.config.time && (
              <div>
                <span className="text-gray-600">Horário: </span>
                <span className="font-medium">{data.config.time}</span>
              </div>
            )}
            {data.config.trigger === 'message_received' && (
              <div className="text-gray-600">Qualquer nova mensagem</div>
            )}
          </div>
        )}
      </div>

      {/* Settings Button */}
      <button className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
        <Settings className="w-3 h-3 text-white" />
      </button>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white shadow-lg"
      />
    </motion.div>
  )
}

export default TriggerNode
