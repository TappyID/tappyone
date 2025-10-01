'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useUsuariosChat } from '@/hooks/useUsuarios'
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
import AtendimentosTopBar from '../components/AtendimentosTopBar'
import AtendentesLista from './components/AtendentesLista'
import ChatInternoArea from './components/ChatInternoArea'

export default function ChatInternoPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { usuarios: atendentes, loading: usuariosLoading, error, refetch } = useUsuariosChat()
  const router = useRouter()
  const { actualTheme } = useTheme()
  
  const [selectedAtendente, setSelectedAtendente] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [showSearchFilter, setShowSearchFilter] = useState<boolean>(false)

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

  // Filtrar atendentes baseado na busca e status
  const filteredAtendentes = atendentes.filter(atendente => {
    const matchesSearch = atendente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         atendente.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         atendente.cargo.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'todos' || atendente.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const selectedAtendenteData = atendentes.find(a => a.id === selectedAtendente)

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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar usuários</h3>
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
        {/* Sidebar Ultra Melhorada - Mais Larga */}
        <motion.div 
          className={`w-96 ${actualTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col shadow-2xl backdrop-blur-xl`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Header da Sidebar */}
          <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div 
                  className={`p-2 rounded-xl ${actualTheme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'} shadow-lg`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Users className={`w-5 h-5 ${actualTheme === 'dark' ? 'text-blue-400' : 'text-[#305e73]'}`} />
                </motion.div>
                <div>
                  <h3 className={`font-bold text-lg ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Equipe
                  </h3>
                  <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {filteredAtendentes.length} membros
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Badge de Notificações */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${actualTheme === 'dark' ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700'} border ${actualTheme === 'dark' ? 'border-red-600/30' : 'border-red-200'}`}>
                    {atendentes.filter(a => a.naoLidas > 0).length} novas
                  </div>
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                {/* Botão de Busca/Filtro Unificado */}
                <motion.button 
                  onClick={() => setShowSearchFilter(!showSearchFilter)}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${actualTheme === 'dark' ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-white bg-white/50'} shadow-lg border ${actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Buscar e Filtrar"
                >
                  <Search className={`w-4 h-4 ${actualTheme === 'dark' ? 'text-blue-400' : 'text-[#305e73]'}`} />
                </motion.button>
                
                {/* Botão Adicionar */}
                <motion.button 
                  className={`p-2.5 rounded-xl transition-all duration-200 ${actualTheme === 'dark' ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-white bg-white/50'} shadow-lg border ${actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <UserPlus className={`w-4 h-4 ${actualTheme === 'dark' ? 'text-blue-400' : 'text-[#305e73]'}`} />
                </motion.button>
              </div>
            </div>

            {/* Modal de Busca e Filtros */}
            {showSearchFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowSearchFilter(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full max-w-lg rounded-3xl shadow-2xl backdrop-blur-xl border ${
                    actualTheme === 'dark'
                      ? 'bg-gray-900/95 border-gray-700/50'
                      : 'bg-white/95 border-gray-200/50'
                  }`}
                >
                  {/* Header */}
                  <div className={`p-6 border-b ${actualTheme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-bold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Buscar e Filtrar
                      </h3>
                      <motion.button
                        onClick={() => setShowSearchFilter(false)}
                        className={`p-2 rounded-xl ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className={`w-4 h-4 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6 space-y-6">
                    {/* Barra de Busca */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Buscar Atendentes
                      </label>
                      <div className="relative">
                        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'} transition-colors`} />
                        <input
                          type="text"
                          placeholder="Digite o nome, email ou cargo..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3.5 ${actualTheme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-[#305e73]'} border rounded-2xl focus:outline-none focus:ring-2 ${actualTheme === 'dark' ? 'focus:ring-blue-500/20' : 'focus:ring-[#305e73]/20'} transition-all duration-200 shadow-lg backdrop-blur-sm`}
                        />
                        {searchQuery && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSearchQuery('')}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${actualTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Filtros de Status */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Filtrar por Status
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'todos', label: 'Todos', icon: Users, color: 'gray', count: filteredAtendentes.length },
                          { key: 'online', label: 'Online', icon: Activity, color: 'emerald', count: atendentes.filter(a => a.status === 'online').length },
                          { key: 'ocupado', label: 'Ocupado', icon: Clock, color: 'yellow', count: atendentes.filter(a => a.status === 'ocupado').length },
                          { key: 'ausente', label: 'Ausente', icon: Archive, color: 'orange', count: atendentes.filter(a => a.status === 'ausente').length }
                        ].map((filter) => {
                          const Icon = filter.icon
                          const isActive = statusFilter === filter.key
                          return (
                            <motion.button
                              key={filter.key}
                              onClick={() => setStatusFilter(filter.key as any)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                isActive
                                  ? actualTheme === 'dark'
                                    ? `bg-${filter.color}-600/20 text-${filter.color}-400 border border-${filter.color}-500/30`
                                    : `bg-${filter.color}-100 text-${filter.color}-700 border border-${filter.color}-200`
                                  : actualTheme === 'dark'
                                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-transparent'
                                  : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100/50 border border-transparent'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="flex-1 text-left">{filter.label}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                isActive
                                  ? actualTheme === 'dark'
                                    ? `bg-${filter.color}-500/30 text-${filter.color}-300`
                                    : `bg-${filter.color}-200 text-${filter.color}-800`
                                  : actualTheme === 'dark'
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {filter.count}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`p-6 border-t ${actualTheme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {filteredAtendentes.length} atendentes encontrados
                      </span>
                      <motion.button
                        onClick={() => setShowSearchFilter(false)}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                          actualTheme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-[#305e73] hover:bg-[#244a5a] text-white'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Aplicar
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
          
          <AtendentesLista
            atendentes={filteredAtendentes}
            selectedAtendente={selectedAtendente}
            onSelectAtendente={setSelectedAtendente}
          />
        </motion.div>

        {/* Área de Chat Melhorada */}
        <motion.div 
          className={`flex-1 flex flex-col ${actualTheme === 'dark' ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50' : 'bg-gradient-to-br from-gray-50 to-blue-50/20'}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {selectedAtendente ? (
            <ChatInternoArea 
              atendente={atendentes.find(a => a.id === selectedAtendente)!}
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
