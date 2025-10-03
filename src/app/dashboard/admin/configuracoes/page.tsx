'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import { 
  Settings,
  Palette,
  Type,
  Bell,
  Mail,
  Shield,
  Clock,
  Database,
  Globe,
  Zap,
  Users,
  Key,
  Monitor,
  Smartphone,
  Save,
  RotateCcw,
  Download,
  Upload,
  Search,
  Filter,
  ChevronRight,
  Sparkles
} from 'lucide-react'

// Importar componentes das seções
import GeralSection from './components/GeralSection'
import TemaSection from './components/TemaSection'
import NotificacoesSection from './components/NotificacoesSection'
import EmailSection from './components/EmailSection'
import PermissoesSection from './components/PermissoesSection'
import TarefasSection from './components/TarefasSection'
import BackupSection from './components/BackupSection'
import IntegracoesSection from './components/IntegracoesSection'
import PerformanceSection from './components/PerformanceSection'
import SegurancaSection from './components/SegurancaSection'

interface ConfigSection {
  id: string
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  component: React.ComponentType
  badge?: string
}

const configSections: ConfigSection[] = [
  {
    id: 'geral',
    title: 'Configurações Gerais',
    description: 'Configurações básicas da plataforma e empresa',
    icon: Settings,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    component: GeralSection
  },
  {
    id: 'tema',
    title: 'Tema e Aparência',
    description: 'Cores, fontes, logos e personalização visual',
    icon: Palette,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    component: TemaSection,
    badge: 'Popular'
  },
  {
    id: 'notificacoes',
    title: 'Notificações',
    description: 'Configurar alertas, sons e notificações push',
    icon: Bell,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    component: NotificacoesSection
  },
  {
    id: 'email',
    title: 'Email e SMTP',
    description: 'Configurações de email, templates e automações',
    icon: Mail,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    component: EmailSection
  },
  {
    id: 'permissoes',
    title: 'Permissões e Roles',
    description: 'Gerenciar roles, permissões e controle de acesso',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    component: PermissoesSection
  },
  {
    id: 'tarefas',
    title: 'Tarefas Agendadas',
    description: 'Cron jobs, automações e tarefas programadas',
    icon: Clock,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    component: TarefasSection,
    badge: 'Avançado'
  },
  {
    id: 'backup',
    title: 'Backup e Restauração',
    description: 'Configurar backups automáticos e restauração',
    icon: Database,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    component: BackupSection
  },
  {
    id: 'integracao',
    title: 'Integrações',
    description: 'APIs, webhooks e integrações externas',
    icon: Globe,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    component: IntegracoesSection
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Cache, otimizações e monitoramento',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    component: PerformanceSection
  },
  {
    id: 'seguranca',
    title: 'Segurança',
    description: 'Autenticação, criptografia e logs de auditoria',
    icon: Key,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    component: SegurancaSection,
    badge: 'Crítico'
  }
]

export default function ConfiguracoesPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const { colorTheme } = useColorTheme()
  const isDark = theme === 'dark'
  
  const [activeSection, setActiveSection] = useState('geral')
  const [searchQuery, setSearchQuery] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#273155]"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Filtrar seções baseado na busca
  const filteredSections = configSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConfig = configSections.find(section => section.id === activeSection)
  const ActiveComponent = activeConfig?.component

  const handleSectionChange = (sectionId: string) => {
    if (hasUnsavedChanges) {
      setShowSaveDialog(true)
      return
    }
    setActiveSection(sectionId)
  }

  const handleSaveAll = () => {
    // Implementar lógica de salvar todas as configurações
    setHasUnsavedChanges(false)
    setShowSaveDialog(false)
  }

  const handleDiscardChanges = () => {
    // Implementar lógica de descartar alterações
    setHasUnsavedChanges(false)
    setShowSaveDialog(false)
  }

  const exportConfigurations = () => {
    // Implementar exportação de configurações
    const config = {
      timestamp: new Date().toISOString(),
      sections: configSections.map(section => section.id),
      // Adicionar dados das configurações aqui
    }
    
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `configuracoes-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="w-full px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div 
            className="rounded-2xl p-8 text-white relative overflow-hidden backdrop-blur-xl"
            style={{
              background: isDark
                ? `linear-gradient(135deg, ${colorTheme.primary}CC, ${colorTheme.secondary}CC)`
                : `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`,
              border: isDark ? `1px solid ${colorTheme.secondary}80` : 'none'
            }}
          >
            {/* Glass effect layers for dark mode */}
            {isDark && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
              </>
            )}
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold mb-2 flex items-center gap-3"
                >
                  <Settings className="w-8 h-8" />
                  Configurações Avançadas
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-lg"
                >
                  Configure todos os aspectos da sua plataforma de forma inteligente e intuitiva
                </motion.p>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportConfigurations}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Importar
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Seções */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className={`rounded-2xl shadow-lg border overflow-hidden sticky top-6 relative ${
              isDark 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-600/50'
                : 'bg-white border-gray-200'
            }`}>
              {/* Glass effect for dark mode */}
              {isDark && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 rounded-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl" />
                </>
              )}
              {/* Search */}
              <div className={`p-4 border-b relative z-10 ${
                isDark ? 'border-slate-600/50' : 'border-gray-200'
              }`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar configurações..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark 
                        ? 'border-slate-600 bg-slate-700/50 text-white placeholder:text-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Seções */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto relative z-10">
                <div className="p-2">
                  {filteredSections.map((section, index) => {
                    const isActive = activeSection === section.id
                    const Icon = section.icon

                    return (
                      <motion.button
                        key={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (index * 0.05) }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 mb-2 group relative overflow-hidden ${
                          isActive
                            ? isDark
                              ? 'border-2 border-blue-400/50 shadow-md'
                              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                            : isDark
                              ? 'hover:bg-slate-700/30 border-2 border-transparent'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                        style={isActive && isDark ? {
                          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(55, 65, 81, 0.9) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '2px solid rgba(59, 130, 246, 0.3)',
                          boxShadow: '0 20px 40px -12px rgba(31, 41, 55, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        } : {}}
                      >
                        {/* Glass effect layers for active tab in dark mode */}
                        {isActive && isDark && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 rounded-xl" />
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 rounded-xl" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl" />
                            <div className="absolute inset-0 rounded-xl border border-white/10" />
                          </>
                        )}
                        <div className="flex items-center gap-3 relative z-10">
                          <div className={`p-2 rounded-lg ${section.bgColor} ${isActive ? 'shadow-sm' : ''}`}>
                            <Icon className={`w-4 h-4 ${section.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold text-sm ${
                              isActive 
                                ? isDark ? 'text-blue-300' : 'text-blue-900'
                                : isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                                {section.title}
                              </h3>
                              {section.badge && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  section.badge === 'Popular' ? 'bg-green-100 text-green-700' :
                                  section.badge === 'Avançado' ? 'bg-orange-100 text-orange-700' :
                                  section.badge === 'Crítico' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {section.badge}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-1 ${
                              isActive 
                                ? isDark ? 'text-blue-200' : 'text-blue-700'
                                : isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {section.description}
                            </p>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            isActive 
                              ? isDark ? 'rotate-90 text-blue-400' : 'rotate-90 text-blue-600'
                              : isDark ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600'
                          }`} />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Conteúdo Principal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-3"
          >
            <div className={`rounded-2xl shadow-lg border min-h-[600px] relative ${
              isDark 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-600/50'
                : 'bg-white border-gray-200'
            }`}>
              {/* Glass effect for dark mode */}
              {isDark && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 rounded-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl" />
                </>
              )}
              {/* Header da Seção */}
              {activeConfig && (
                <div className={`p-6 border-b relative z-10 ${
                  isDark ? 'border-slate-600/50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${activeConfig.bgColor}`}>
                        <activeConfig.icon className={`w-6 h-6 ${activeConfig.color}`} />
                      </div>
                      <div>
                        <h2 className={`text-2xl font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{activeConfig.title}</h2>
                        <p className={`mt-1 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>{activeConfig.description}</p>
                      </div>
                    </div>

                    {hasUnsavedChanges && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                      >
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-orange-400' : 'text-orange-600'
                        }`}>Alterações não salvas</span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveAll}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Salvar
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Conteúdo da Seção */}
              <div className="p-6 relative z-10">
                <AnimatePresence mode="wait">
                  {ActiveComponent && (
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ActiveComponent />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dialog de Confirmação */}
        <AnimatePresence>
          {showSaveDialog && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowSaveDialog(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className={`rounded-2xl shadow-2xl border p-6 max-w-md w-full relative ${
                  isDark 
                    ? 'bg-slate-800/90 backdrop-blur-xl border-slate-600/50'
                    : 'bg-white border-gray-200'
                }`}>
                  {/* Glass effect for dark mode */}
                  {isDark && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-900/20 to-slate-800/40 rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
                    </>
                  )}
                  <h3 className={`text-lg font-bold mb-2 relative z-10 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Alterações não salvas</h3>
                  <p className={`mb-6 relative z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Você tem alterações não salvas. O que deseja fazer?
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleSaveAll}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleDiscardChanges}
                      className={`flex-1 px-4 py-2 border rounded-lg font-medium flex items-center justify-center gap-2 ${
                        isDark 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-700/30'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Descartar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}
