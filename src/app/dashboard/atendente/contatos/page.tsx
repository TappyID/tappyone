'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import { AdminLayout } from '../components/AdminLayout'
import { UserPlus } from 'lucide-react'
import ContatosList from './components/ContatosList'
import ContatosTopBar from './components/ContatosTopBar'
import ContatosStats from './components/ContatosStats'
import CreateContactModal from './components/CreateContactModal'
import ContactActionModal from './components/ContactActionModal'
import ExportModal from './components/ExportModal'
import ImportModal from './components/ImportModal'

export default function ContatosPage() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean
    contact: any
  }>({ isOpen: false, contact: null })
  const [refreshContacts, setRefreshContacts] = useState(0)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
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
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Contatos / Leads do CRM
            </h1>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Gerencie todos os seus contatos e conversas
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
              theme === 'dark'
                ? 'text-white'
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl'
            }`}
            style={theme === 'dark' ? {
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(21, 128, 61, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -12px rgba(34, 197, 94, 0.6), 0 0 0 1px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            } : {}}
          >
            {/* Glass effect layers for dark mode */}
            {theme === 'dark' && (
              <>
                {/* Base glass layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                
                {/* Green accent layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-emerald-500/20 rounded-2xl" />
                
                {/* Light reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-green-400/50 transition-all duration-500" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
              </>
            )}
            
            <UserPlus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Novo Contato</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <ContatosStats />

        {/* Top Bar with Search and Filters */}
        <ContatosTopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={() => setIsExportModalOpen(true)}
          onImport={() => setIsImportModalOpen(true)}
        />

        {/* Contacts List */}
        <ContatosList searchQuery={searchQuery} refreshKey={refreshContacts} />
        
        {/* Modal de Criação de Contato */}
        <CreateContactModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setRefreshContacts(prev => prev + 1) // Força refresh da lista
            setIsCreateModalOpen(false)
          }}
        />

        {/* Modal de Ação de Contato */}
        <ContactActionModal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ isOpen: false, contact: null })}
          contact={actionModal.contact}
          onEdit={(contact) => {
            // Implementar edição
            setActionModal({ isOpen: false, contact: null })
          }}
        />

        {/* Modal de Exportação */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />

        {/* Modal de Importação */}
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            setRefreshContacts(prev => prev + 1) // Força refresh da lista após importar
            setIsImportModalOpen(false)
          }}
        />
      </div>
    </AdminLayout>
  )
}
