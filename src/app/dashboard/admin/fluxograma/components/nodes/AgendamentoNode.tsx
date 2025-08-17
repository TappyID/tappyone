'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { Calendar, Settings } from 'lucide-react'

const AgendamentoNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
        selected 
          ? 'border-[#305e73] shadow-xl' 
          : 'border-cyan-300 hover:border-cyan-400'
      }`}
      style={{ minWidth: '200px' }}
    >
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-3 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">AGENDAMENTO</div>
            <div className="text-xs opacity-90">{data.label}</div>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="text-sm text-gray-700">
          {data.description || 'Cria agendamento'}
        </div>
      </div>

      <button className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
        <Settings className="w-3 h-3 text-white" />
      </button>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500 border-2 border-white shadow-lg" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-500 border-2 border-white shadow-lg" />
    </motion.div>
  )
}

export default AgendamentoNode
