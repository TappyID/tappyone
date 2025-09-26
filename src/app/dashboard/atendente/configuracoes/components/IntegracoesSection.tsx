'use client'

import { motion } from 'framer-motion'
import { Puzzle, Webhook, Zap } from 'lucide-react'

interface IntegracoesSectionProps {
  onConfigChange: () => void
}

export default function IntegracoesSection({ onConfigChange }: IntegracoesSectionProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Puzzle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Integrações</h3>
            <p className="text-gray-600">APIs, webhooks e integrações com terceiros</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Webhook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Seção em Desenvolvimento</h4>
          <p className="text-gray-600">Esta seção será implementada em breve com integrações avançadas.</p>
        </div>
      </motion.div>
    </div>
  )
}
