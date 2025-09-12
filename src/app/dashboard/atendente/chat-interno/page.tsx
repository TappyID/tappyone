'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useUsuariosChat } from '@/hooks/useUsuarios'
import { useChatQueue } from '@/hooks/useChatQueue'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Zap,
  Star,
  Archive,
  UserPlus,
  Activity,
  Clock,
  Shield,
  X,
  ChevronDown,
  AlertTriangle,
  RefreshCcw
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import AtendentesLista from './components/AtendentesLista'
import ChatInternoArea from './components/ChatInternoArea'
import ChatPendingModal from './components/ChatPendingModal'

export default function ChatInternoPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { usuarios: admins, loading: usuariosLoading, error, refetch } = useUsuariosChat()
  const { pendingChat, isModalOpen, acceptChat, rejectChat, loading: queueLoading } = useChatQueue()
  const router = useRouter()
  const { actualTheme } = useTheme()
  
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [showSearchFilter, setShowSearchFilter] = useState<boolean>(false)

  // Quando aceitar um chat, selecionar o admin automaticamente
  const handleAcceptChat = async () => {
    await acceptChat()
    if (pendingChat) {
      setSelectedAdmin(pendingChat.adminId)
    }
  }

  const loading = authLoading || usuariosLoading

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#273155]"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Filtrar admins baseado na busca e status
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.cargo.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'todos' || admin.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Se houver erro de API, mostrar estado de erro
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md p-8">
          <motion.div 
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar administradores</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-[#305e73] text-white rounded-lg font-semibold hover:bg-[#244a5a] transition-colors mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCcw className="w-4 h-4" />
            Tentar novamente
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen w-screen overflow-hidden ${actualTheme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-blue-50/30'}`}>
      <div className="flex h-full">
        <motion.div 
          className={`w-96 ${actualTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col shadow-2xl`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className={`font-bold text-lg ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Administradores
            </h3>
            <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {filteredAdmins.length} disponíveis
            </p>
          </div>
          
          <AtendentesLista
            atendentes={filteredAdmins}
            selectedAtendente={selectedAdmin}
            onSelectAtendente={setSelectedAdmin}
          />
        </motion.div>

        <motion.div 
          className={`flex-1 flex flex-col ${actualTheme === 'dark' ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50' : 'bg-gradient-to-br from-gray-50 to-blue-50/20'}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {selectedAdmin ? (
            <ChatInternoArea 
              atendente={admins.find(a => a.id === selectedAdmin)!}
              currentUser={user}
              isDark={actualTheme === 'dark'}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center justify-center p-8"
            >
              <div className="text-center max-w-md">
                <motion.div 
                  className="w-32 h-32 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <MessageSquare className="w-16 h-16 text-white" />
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold text-gray-900 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Chat com Administradores
                </motion.h3>
                
                <motion.p 
                  className="text-gray-600 mb-8 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Selecione um administrador para iniciar uma conversa e tirar dúvidas.
                </motion.p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal de Chat Pendente */}
      <ChatPendingModal
        chatRequest={pendingChat}
        isOpen={isModalOpen}
        onAccept={handleAcceptChat}
        onReject={rejectChat}
        isDark={actualTheme === 'dark'}
      />
    </div>
  )
}
