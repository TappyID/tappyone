'use client'

import { motion } from 'framer-motion'
import { HardDrive, Cloud, Archive } from 'lucide-react'

interface BackupSectionProps {
  onConfigChange: () => void
}

export default function BackupSection({ onConfigChange }: BackupSectionProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <HardDrive className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Backup e Restauração</h3>
            <p className="text-gray-600">Configure backups automáticos e restauração de dados</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Seção em Desenvolvimento</h4>
          <p className="text-gray-600">Esta seção será implementada em breve com sistema completo de backup.</p>
        </div>
      </motion.div>
    </div>
  )
}
