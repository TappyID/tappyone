'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { Clock, Settings, Timer } from 'lucide-react'

const DelayNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
        selected 
          ? 'border-[#305e73] shadow-xl' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      style={{ minWidth: '200px' }}
    >
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-3 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">AGUARDAR</div>
            <div className="text-xs opacity-90">{data.label}</div>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="text-sm text-gray-700 mb-2">
          {data.description || 'Pausa o fluxo'}
        </div>
        
        {data.config && (
          <div className="bg-gray-50 rounded-lg p-2 text-xs flex items-center gap-2">
            <Timer className="w-3 h-3 text-gray-500" />
            <span className="font-medium">
              {data.config.delay} {data.config.unit === 'seconds' ? 'segundos' : 
                                   data.config.unit === 'minutes' ? 'minutos' : 
                                   data.config.unit === 'hours' ? 'horas' : 'dias'}
            </span>
          </div>
        )}
      </div>

      <button className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
        <Settings className="w-3 h-3 text-white" />
      </button>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-500 border-2 border-white shadow-lg" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-500 border-2 border-white shadow-lg" />
    </motion.div>
  )
}

export default DelayNode
