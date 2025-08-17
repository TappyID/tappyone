'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { AdminLayout } from '../components/AdminLayout'
import { UserPlus } from 'lucide-react'
import ContatosTopBar from './components/ContatosTopBar'
import ContatosList from './components/ContatosList'
import ContatosStats from './components/ContatosStats'

export default function ContatosPage() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#273155]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Contatos
            </h1>
            <p className="text-gray-600">
              Gerencie todos os seus contatos e conversas
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Novo Contato
          </motion.button>
        </motion.div>

        {/* Stats */}
        <ContatosStats />

        {/* Top Bar with Search and Filters */}
        <ContatosTopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Contacts List */}
        <ContatosList searchQuery={searchQuery} />
      </div>
    </AdminLayout>
  )
}
