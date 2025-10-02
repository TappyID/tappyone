'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  MessageSquare,
  ArrowLeft, 
  Users, 
  Clock,
  MoreHorizontal,
  Zap,
  Languages,
  Kanban,
  Globe,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Flag,
  GitBranch,
  MessageCircle,
  List,
  Sun,
  Moon,
  Bot,
  Expand,
  Palette,
  FileText,
  Ticket,
  Calendar,
  Receipt
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ReactCountryFlag from 'react-country-flag'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import { ColorThemeModal } from '../../components/ColorThemeModal'
import { useAtendentes } from '@/hooks/useAtendentes'
import { useTickets } from '@/hooks/useTickets'
// Removidos hooks do WhatsApp para evitar ERR_INSUFFICIENT_RESOURCES
// import { useWhatsAppData } from '@/hooks/useWhatsAppData'
// import { useContatoData } from '@/hooks/useContatoData'

interface AtendimentosTopBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

export default function AtendimentosTopBar({ 
  searchQuery, 
  onSearchChange,
  isCollapsed = false,
  onToggleCollapse
}: AtendimentosTopBarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { atendentes, loading: atendentesLoading } = useAtendentes({ tipo: 'atendente', status: 'ativo' })
  const { tickets, loading: ticketsLoading } = useTickets()
  // Hooks do WhatsApp removidos - usando apenas dados do banco
  // const { chats } = useWhatsAppData()
  // const chatIds = chats?.map(chat => {
  //   if (!chat?.id) return ''
  //   const chatId = chat.id as string | { _serialized?: string }
  //   return (typeof chatId === 'object' ? chatId._serialized : chatId) || ''
  // }).filter(id => id) || []
  // const { contatos, loading: contatosLoading } = useContatoData(chatIds)
  const contatosLoading = false // Placeholder
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR')
  const { actualTheme, setTheme } = useTheme()
  const { colorTheme } = useColorTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showColorModal, setShowColorModal] = useState(false)

  const handleLogout = () => {
    logout()
    setShowProfile(false)
  }

  const handleMenuClick = (action: string) => {
    setShowProfile(false)
    // Todos os links direcionam para configurações
    router.push('/dashboard/admin/configuracoes')
  }
  
  // Mapeamento de idiomas para bandeiras
  const getCountryCode = (langCode: string) => {
    const mapping: { [key: string]: string } = {
      'pt-BR': 'BR',
      'en-US': 'US', 
      'es-ES': 'ES',
      'hi-IN': 'IN',
      'fr-FR': 'FR'
    }
    return mapping[langCode] || 'BR'
  }

  // Função para alterar idioma
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode)
    
    console.log('🌍 Alterando idioma para:', langCode)
    
    // Disparar evento global para o ChatArea
    const event = new CustomEvent('languageChanged', {
      detail: { languageCode: langCode }
    })
    window.dispatchEvent(event)
    
    // Fechar dropdown após seleção
    setShowTranslation(false)
  }
  
  // Detectar se está na página do Kanban
  const isKanbanPage = pathname?.includes('/kanban')
  
  // Contadores baseados no banco de dados
  const totalTickets = tickets?.length || 0
  const totalLeads = 0 // Placeholder - dados vêm do Kanban otimizado agora
  const atendentesAtivos = atendentes?.filter(a => a.ativo)?.length || 0
  
  const loading = atendentesLoading || ticketsLoading
  
  // Função para toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <>
      {/* Botão flutuante quando TopBar está oculto */}
      {isCollapsed && (
        <motion.button
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          onClick={() => onToggleCollapse && onToggleCollapse(false)}
          className="fixed top-4 right-4 z-[10001] w-12 h-12 bg-gradient-to-r from-[#273155] to-[#2a3660] rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Mostrar TopBar"
        >
          <Expand className="w-5 h-5 text-white" />
        </motion.button>
      )}

      <AnimatePresence>
        {!isCollapsed && (
        <motion.div 
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-16 backdrop-blur-xl border-b border-white/10 shadow-2xl relative z-[10000]"
          style={{
            background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`
          }}
        >
      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-sm" />
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.1
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full px-6 flex items-center justify-between">
        {/* Left Section - Logo & Title */}
        <div className="flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Atendimentos</h1>
              <p className="text-xs text-white/70">Central de conversas</p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-3 ml-6">
            <motion.div 
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              title={`Total de tickets no sistema: ${totalTickets}`}
            >
              <FileText className="w-3.5 h-3.5 text-white/80" />
              <span className="text-sm text-white font-medium">
                {loading ? '...' : `${totalTickets} Tickets`}
              </span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2 px-2.5 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              title={`Leads sem tags: ${totalLeads}`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-white/80" />
              <span className="text-sm text-white font-medium">
                {loading ? '...' : `${totalLeads} Leads`}
              </span>
            </motion.div>
            
            {/* Fullscreen Button */}
            <motion.div 
              className="flex items-center gap-2 px-2.5 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 cursor-pointer"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
              onClick={() => {
                toggleFullscreen()
                if (onToggleCollapse) {
                  onToggleCollapse(!isCollapsed)
                }
              }}
              title={isCollapsed ? "Mostrar TopBar" : "Ocultar TopBar"}
            >
              <Expand className="w-3.5 h-3.5 text-white/80" />
              <span className="text-sm text-white font-medium">
                {isCollapsed ? "Mostrar" : "Ocultar"}
              </span>
            </motion.div>
            
          </div>
        </div>

        {/* Center Section - Search & Filters */}
        <div className="flex-1 max-w-3xl mx-8">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <motion.div 
              className="relative flex-1"
              whileFocus={{ scale: 1.02 }}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar conversas, contatos ou mensagens..."
                className="w-full pl-12 pr-4 h-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 backdrop-blur-sm transition-all duration-300"
              />
            </motion.div>

          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
          
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isKanbanPage) {
                    router.push('/dashboard/admin/atendimento')
                  } else {
                    router.push('/dashboard/admin/kanban')
                  }
                }}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title={isKanbanPage ? 'Ir para Atendimentos' : 'CRM Kanban'}
              >
                {isKanbanPage ? (
                  <MessageSquare className="w-4 h-4 text-white" />
                ) : (
                  <Kanban className="w-4 h-4 text-white" />
                )}
              </motion.button>
              
              {/* Badge Dinâmica */}
              {isKanbanPage ? (
                /* Badge de Leads - Verde */
                totalLeads > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-green-300/30">
                    <span className="text-[10px] font-bold text-white drop-shadow-sm">
                      {totalLeads > 99 ? '99+' : totalLeads}
                    </span>
                  </div>
                )
              ) : (
                /* Badge Kanban - Azul */
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-blue-300/30">
                  <Kanban className="w-3 h-3 text-white drop-shadow-sm" />
                </div>
              )}
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/fluxograma')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Fluxograma"
              >
                <GitBranch className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Fluxograma - Roxo */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-purple-300/30">
                <GitBranch className="w-3 h-3 text-white drop-shadow-sm" />
              </div>
            </motion.div>

            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/respostas-rapidas')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Respostas Rápidas"
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Respostas Rápidas - Amarelo */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-yellow-300/30">
                <Zap className="w-3 h-3 text-white drop-shadow-sm" />
              </div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/agentes')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Agentes de IA"
              >
                <Bot className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge IA - Ciano */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-cyan-300/30">
                <span className="text-[10px] font-bold text-white drop-shadow-sm">🤖</span>
              </div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/tags')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Tags"
              >
                <FileText className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Tags - Rosa */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-pink-300/30">
                <FileText className="w-3 h-3 text-white drop-shadow-sm" />
              </div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/tickets')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Tickets"
              >
                <Ticket className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Tickets - Violeta */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-purple-300/30">
                <Ticket className="w-3 h-3 text-white drop-shadow-sm" />
              </div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/agendamentos')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Agendamentos"
              >
                <Calendar className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Agendamentos - Verde */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-green-300/30">
                <Calendar className="w-3 h-3 text-white drop-shadow-sm" />
              </div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/orcamentos')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Orçamentos"
              >
                <Receipt className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Orçamentos - Azul */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-blue-300/30">
                <Receipt className="w-3 h-3 text-white drop-shadow-sm" />
              </div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/filas')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Filas"
              >
                <List className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Filas - Laranja */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-orange-300/30">
                <List className="w-3 h-3 text-white drop-shadow-sm" />
              </div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTranslation(!showTranslation)}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
                title="Tradução"
              >
                <Languages className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge com bandeira do idioma ativo */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border ${
                selectedLanguage !== 'pt-BR' 
                  ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300/30 animate-pulse' 
                  : 'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300/30'
              }`}>
                <ReactCountryFlag
                  countryCode={getCountryCode(selectedLanguage)}
                  svg
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px'
                  }}
                />
              </div>
              
              {/* Translation Dropdown */}
              <AnimatePresence>
                {showTranslation && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      backgroundColor: colorTheme.primary
                    }}
                    className="absolute top-full right-0 mt-2 w-80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[99999]"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-white">Tradução Automática</h3>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowTranslation(false)}
                          className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Languages List */}
                    <div className="p-3">
                      <div className="space-y-2">
                        {[
                          {
                            code: 'pt-BR',
                            name: 'Português',
                            country: 'Brasil',
                            countryCode: 'BR',
                            active: true
                          },
                          {
                            code: 'en-US',
                            name: 'English',
                            country: 'United States',
                            countryCode: 'US',
                            active: false
                          },
                          {
                            code: 'es-ES',
                            name: 'Español',
                            country: 'España',
                            countryCode: 'ES',
                            active: false
                          },
                          {
                            code: 'hi-IN',
                            name: 'हिन्दी Hindi',
                            country: 'भारत',
                            countryCode: 'IN',
                            active: false
                          },
                          {
                            code: 'fr-FR',
                            name: 'Français',
                            country: 'France',
                            countryCode: 'FR',
                            active: false
                          }
                        ].map((lang, index) => {
                          const isActive = selectedLanguage === lang.code
                          return (
                          <motion.button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                              isActive
                                ? 'bg-green-500/20 border-green-400/50 text-green-300 shadow-lg shadow-green-500/20' 
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <ReactCountryFlag 
                                countryCode={lang.countryCode}
                                svg
                                style={{
                                  width: '24px',
                                  height: '18px',
                                  borderRadius: '2px'
                                }}
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-sm">{lang.name}</div>
                              <div className="text-xs opacity-70">{lang.country}</div>
                            </div>
                            {isActive && (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            )}
                          </motion.button>
                          )})}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs text-white/80">Tradução ativa</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white font-medium hover:bg-white/20 transition-all"
                        >
                          Configurações
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Divisor */}
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/30 to-transparent mx-4" />

          {/* Notifications */}
          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300"
              title="Notificações"
            >
              <Bell className="w-4 h-4 text-white" />
            </motion.button>
            
            {/* Badge Notificações - Vermelho */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-red-300/30">
              <span className="text-[10px] font-bold text-white drop-shadow-sm">3</span>
            </div>
            
            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    backgroundColor: colorTheme.primary
                  }}
                  className="absolute top-full right-0 mt-2 w-96 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[99999]"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-lg flex items-center justify-center">
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Notificações</h3>
                          <p className="text-xs text-white/60">3 não lidas</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotifications(false)}
                        className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {[
                      {
                        id: 1,
                        type: 'message',
                        icon: MessageSquare,
                        title: 'Nova mensagem de João Silva',
                        description: 'Olá, gostaria de saber mais sobre...',
                        time: '2 min',
                        unread: true,
                        color: 'from-blue-500 to-blue-600'
                      },
                      {
                        id: 2,
                        type: 'alert',
                        icon: AlertCircle,
                        title: 'Atendimento pendente há 15 min',
                        description: 'Cliente Maria Santos aguardando',
                        time: '15 min',
                        unread: true,
                        color: 'from-orange-500 to-orange-600'
                      },
                      {
                        id: 3,
                        type: 'info',
                        icon: Info,
                        title: 'Sistema atualizado',
                        description: 'Nova versão 2.1.0 disponível',
                        time: '1 hora',
                        unread: false,
                        color: 'from-green-500 to-green-600'
                      },
                      {
                        id: 4,
                        type: 'file',
                        icon: Settings,
                        title: 'Maria Santos enviou arquivo',
                        description: 'documento_contrato.pdf',
                        time: '2 horas',
                        unread: true,
                        color: 'from-purple-500 to-purple-600'
                      },
                      {
                        id: 5,
                        type: 'success',
                        icon: CheckCircle,
                        title: 'Backup concluído',
                        description: 'Todos os dados foram salvos',
                        time: '3 horas',
                        unread: false,
                        color: 'from-green-500 to-green-600'
                      }
                    ].map((notification) => {
                      const IconComponent = notification.icon
                      return (
                        <motion.div
                          key={notification.id}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          className={`p-4 border-b border-white/5 cursor-pointer transition-all ${
                            notification.unread ? 'bg-white/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${notification.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-white truncate">{notification.title}</h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-white/60">{notification.time}</span>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-white/70 truncate">{notification.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white font-medium hover:bg-white/20 transition-all"
                      >
                        Marcar todas como lidas
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg text-xs text-blue-300 font-medium hover:bg-blue-500/30 transition-all"
                      >
                        Ver todas
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/20" />

          {/* Dark/Light Mode Toggle */}
          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.1, rotate: actualTheme === 'dark' ? 180 : 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300 group"
              title={actualTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              <AnimatePresence mode="wait">
                {actualTheme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="w-4 h-4 text-white group-hover:text-yellow-300 transition-colors" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-4 h-4 text-white group-hover:text-blue-300 transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            {/* Badge Theme */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border transition-all duration-300 ${
                actualTheme === 'dark' 
                  ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300/30' 
                  : 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300/30'
              }`}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-sm">
                {actualTheme === 'dark' ? '🌙' : '☀️'}
              </span>
            </motion.div>
          </motion.div>

          {/* Color Theme Button */}
          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowColorModal(true)}
              className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-sm hover:shadow-lg transition-all duration-300 group"
              title="Personalizar Cores"
            >
              <Palette className="w-4 h-4 text-white group-hover:text-pink-300 transition-colors" />
            </motion.button>
            
            {/* Badge */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-pink-300/30">
              <span className="text-[10px] font-bold text-white">🎨</span>
            </div>
          </motion.div>

          {/* Profile */}
          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 h-10 px-2.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-white/30 to-white/10 rounded-lg flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.nome || 'Admin'}</p>
                <p className="text-xs text-white/70">Online</p>
              </div>
              <MoreHorizontal className="w-3.5 h-3.5 text-white/60" />
            </motion.button>
            
            {/* Badge Online - Verde */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-green-300/30"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </motion.div>
            
            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    backgroundColor: colorTheme.primary
                  }}
                  className="absolute top-full right-0 mt-2 w-80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[99999]"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{user?.nome || 'Admin'}</h3>
                          <p className="text-sm text-white/70">{user?.email || 'admin@tappyone.com'}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowProfile(false)}
                        className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-white/80">Online agora</span>
                    </div>
                  </div>
                  
                  {/* Menu Options */}
                  <div className="p-4 space-y-2">
                    {[
                      {
                        icon: User,
                        label: 'Meu Perfil',
                        description: 'Gerenciar informações pessoais',
                        color: 'from-blue-500 to-blue-600',
                        action: 'profile'
                      },
                      {
                        icon: Settings,
                        label: 'Configurações',
                        description: 'Preferências do sistema',
                        color: 'from-gray-500 to-gray-600',
                        action: 'settings'
                      },
                      {
                        icon: Bell,
                        label: 'Notificações',
                        description: 'Gerenciar alertas',
                        color: 'from-yellow-500 to-yellow-600',
                        action: 'notifications'
                      },
                      {
                        icon: Languages,
                        label: 'Idioma',
                        description: 'Português (Brasil)',
                        color: 'from-green-500 to-green-600',
                        action: 'language'
                      },
                      {
                        icon: Info,
                        label: 'Ajuda & Suporte',
                        description: 'Central de ajuda',
                        color: 'from-purple-500 to-purple-600',
                        action: 'help'
                      }
                    ].map((item, index) => {
                      const IconComponent = item.icon
                      return (
                        <motion.button
                          key={index}
                          whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMenuClick(item.action)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 text-left"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">{item.label}</div>
                            <div className="text-xs text-white/60">{item.description}</div>
                          </div>
                          <MoreHorizontal className="w-4 h-4 text-white/40" />
                        </motion.button>
                      )
                    })}
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/60">
                        Versão 2.1.0
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 rounded-lg text-sm text-red-300 font-medium hover:from-red-500/30 hover:to-red-600/30 transition-all"
                      >
                        Sair
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

        {/* Bottom Glow Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
        )}
      </AnimatePresence>

      {/* Color Theme Modal */}
      <ColorThemeModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
      />
    </>
  )
}
