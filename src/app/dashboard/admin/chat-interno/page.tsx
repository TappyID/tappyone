'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
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
  Shield
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import AtendentesLista from './components/AtendentesLista'
import ChatInternoArea from './components/ChatInternoArea'

// Mock data para atendentes
const mockAtendentes = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'maria@tappyone.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    status: 'online',
    cargo: 'Atendente Senior',
    ultimaMsg: 'Preciso de ajuda com um cliente...',
    ultimaAtividade: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    naoLidas: 2
  },
  {
    id: '2',
    nome: 'João Santos',
    email: 'joao@tappyone.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'ocupado',
    cargo: 'Atendente',
    ultimaMsg: 'Relatório enviado!',
    ultimaAtividade: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    naoLidas: 0
  },
  {
    id: '3',
    nome: 'Ana Costa',
    email: 'ana@tappyone.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'ausente',
    cargo: 'Supervisora',
    ultimaMsg: 'Vou almoçar, volto em 1h',
    ultimaAtividade: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    naoLidas: 1
  },
  {
    id: '4',
    nome: 'Carlos Oliveira',
    email: 'carlos@tappyone.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'offline',
    cargo: 'Atendente',
    ultimaMsg: 'Até amanhã!',
    ultimaAtividade: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    naoLidas: 0
  }
]

export default function ChatInternoPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { actualTheme } = useTheme()
  
  const [selectedAtendente, setSelectedAtendente] = useState<string | null>(null)
  const [atendentes, setAtendentes] = useState(mockAtendentes)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'online' | 'ocupado' | 'ausente' | 'offline'>('todos')

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

  // Filtrar atendentes baseado na busca e status
  const filteredAtendentes = atendentes.filter(atendente => {
    const matchesSearch = atendente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         atendente.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         atendente.cargo.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'todos' || atendente.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const selectedAtendenteData = atendentes.find(a => a.id === selectedAtendente)

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* TopBar Original com Melhorias */}
      <div className="relative">
        <AtendimentosTopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Barra de Estatísticas Adicional */}
        <motion.div 
          className="absolute top-0 right-6 h-full flex items-center gap-3 z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Estatísticas Rápidas */}
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <Activity className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">
              {atendentes.filter(a => a.status === 'online').length} Online
            </span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <Users className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">{atendentes.length} Total</span>
          </motion.div>
          
          {/* Botões de Ação */}
          <motion.button 
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-4 h-4 text-gray-600" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
          
          <motion.button 
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </motion.button>
        </motion.div>
      </div>
      
      {/* Layout Principal */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Melhorada */}
        <motion.div 
          className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#305e73]" />
                Equipe ({filteredAtendentes.length})
              </h3>
              <motion.button 
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <UserPlus className="w-4 h-4 text-[#305e73]" />
              </motion.button>
            </div>
            
            {/* Barra de Busca Melhorada */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar atendentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#305e73]/20 focus:border-[#305e73] transition-all"
              />
            </div>
            
            {/* Filtros de Status */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'todos', label: 'Todos', icon: Users, color: 'gray' },
                { key: 'online', label: 'Online', icon: Activity, color: 'emerald' },
                { key: 'ocupado', label: 'Ocupado', icon: Clock, color: 'yellow' },
                { key: 'ausente', label: 'Ausente', icon: Archive, color: 'orange' }
              ].map((filter) => {
                const Icon = filter.icon
                const isActive = statusFilter === filter.key
                return (
                  <motion.button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? `bg-${filter.color}-100 text-${filter.color}-700 border border-${filter.color}-200`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-3 h-3" />
                    {filter.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
          
          <AtendentesLista
            atendentes={filteredAtendentes}
            selectedAtendente={selectedAtendente}
            onSelectAtendente={setSelectedAtendente}
          />
        </motion.div>

        {/* Área de Chat Melhorada */}
        <motion.div 
          className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {selectedAtendenteData ? (
            <ChatInternoArea
              atendente={selectedAtendenteData}
              currentUser={user}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center justify-center p-8"
            >
              <div className="text-center max-w-md">
                {/* Ícone Principal Animado */}
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
                  Bem-vindo ao Chat Interno
                </motion.h3>
                
                <motion.p 
                  className="text-gray-600 mb-8 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Selecione um membro da equipe para iniciar uma conversa, 
                  compartilhar informações ou colaborar em tempo real.
                </motion.p>
                
                {/* Cards de Recursos */}
                <motion.div 
                  className="grid grid-cols-2 gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Tempo Real</h4>
                    <p className="text-xs text-gray-600">Mensagens instantâneas</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Seguro</h4>
                    <p className="text-xs text-gray-600">Comunicação privada</p>
                  </div>
                </motion.div>
                
                {/* Botão de Ação */}
                <motion.button 
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mx-auto"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Plus className="w-5 h-5" />
                  Iniciar Nova Conversa
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
