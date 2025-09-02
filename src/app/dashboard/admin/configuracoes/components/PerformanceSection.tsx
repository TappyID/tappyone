'use client'

import { motion } from 'framer-motion'
import { Gauge, Cpu, Database } from 'lucide-react'

interface PerformanceSectionProps {
  onConfigChange: () => void
}

export default function PerformanceSection({ onConfigChange }: PerformanceSectionProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-100 rounded-xl">
            <Gauge className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Performance</h3>
            <p className="text-gray-600">Cache, otimizações e monitoramento de performance</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Cpu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Seção em Desenvolvimento</h4>
          <p className="text-gray-600">Esta seção será implementada em breve com métricas de performance.</p>
        </div>
      </motion.div>
    </div>
  )
}
