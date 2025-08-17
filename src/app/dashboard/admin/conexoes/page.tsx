'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AdminLayout } from '../components/AdminLayout'
import { ConnectionsGrid } from './components/ConnectionsGrid'
import { ConnectionStats } from './components/ConnectionStats'
import { ApiTest } from './components/ApiTest'
import { Plus, Zap, Link as LinkIcon } from 'lucide-react'

export default function ConexoesPage() {
  const [activeConnections, setActiveConnections] = useState(1)
  const [totalConnections, setTotalConnections] = useState(4)

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/20">
        <div className="p-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#273155] rounded-xl">
                    <LinkIcon className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Conexões
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Gerencie suas integrações com redes sociais e plataformas de comunicação
                </p>
              </div>

              <motion.button
                className="flex items-center gap-2 px-6 py-3 bg-[#273155] text-white rounded-xl hover:bg-[#1e2442] transition-colors shadow-lg"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                Nova Conexão
              </motion.button>
            </div>
          </motion.div>

          {/* API Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ApiTest />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <ConnectionStats 
              activeConnections={activeConnections}
              totalConnections={totalConnections}
            />
          </motion.div>

          {/* Connections Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ConnectionsGrid 
              onConnectionChange={(active, total) => {
                setActiveConnections(active)
                setTotalConnections(total)
              }}
            />
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}
