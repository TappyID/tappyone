'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { GitBranch, Settings, CheckCircle, XCircle } from 'lucide-react'

const ConditionNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
        selected 
          ? 'border-[#305e73] shadow-xl' 
          : 'border-yellow-300 hover:border-yellow-400'
      }`}
      style={{ minWidth: '220px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">CONDIÇÃO</div>
            <div className="text-xs opacity-90">{data.label}</div>
          </div>
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-sm text-gray-700 mb-3">
          {data.description || 'Avalia condições e direciona o fluxo'}
        </div>
        
        {/* Condition Preview */}
        {data.config && (
          <div className="bg-gray-50 rounded-lg p-2 text-xs mb-3">
            {data.config.condition === 'needs_human' && (
              <div className="text-gray-600">
                Verifica se precisa de atendimento humano
              </div>
            )}
            {data.config.condition === 'custom' && data.config.rules?.length > 0 && (
              <div>
                <span className="text-gray-600">Regras: </span>
                <span className="font-medium">{data.config.rules.length} configuradas</span>
              </div>
            )}
            {(!data.config.condition || data.config.condition === 'custom') && !data.config.rules?.length && (
              <div className="text-gray-500 italic">Condição não configurada</div>
            )}
          </div>
        )}

        {/* Output Labels */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Verdadeiro</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <XCircle className="w-3 h-3" />
            <span>Falso</span>
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <button className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
        <Settings className="w-3 h-3 text-white" />
      </button>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-500 border-2 border-white shadow-lg"
      />

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '60%' }}
        className="w-3 h-3 bg-green-500 border-2 border-white shadow-lg"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '80%' }}
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-lg"
      />
    </motion.div>
  )
}

export default ConditionNode
