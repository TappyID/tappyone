'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye } from 'lucide-react'

interface SegurancaSectionProps {
  onConfigChange: () => void
}

export default function SegurancaSection({ onConfigChange }: SegurancaSectionProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-xl">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Segurança</h3>
            <p className="text-gray-600">2FA, logs de auditoria, políticas de senha e segurança</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Seção em Desenvolvimento</h4>
          <p className="text-gray-600">Esta seção será implementada em breve com configurações avançadas de segurança.</p>
        </div>
      </motion.div>
    </div>
  )
}
