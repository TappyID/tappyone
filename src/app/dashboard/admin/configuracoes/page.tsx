'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#273155] to-[#1e2442] rounded-2xl p-8 text-white">
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-6">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar configurações..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Seções */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
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
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 mb-2 group ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${section.bgColor} ${isActive ? 'shadow-sm' : ''}`}>
                            <Icon className={`w-4 h-4 ${section.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
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
                            <p className={`text-xs mt-1 ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                              {section.description}
                            </p>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            isActive ? 'rotate-90 text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[600px]">
              {/* Header da Seção */}
              {activeConfig && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${activeConfig.bgColor}`}>
                        <activeConfig.icon className={`w-6 h-6 ${activeConfig.color}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{activeConfig.title}</h2>
                        <p className="text-gray-600 mt-1">{activeConfig.description}</p>
                      </div>
                    </div>

                    {hasUnsavedChanges && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm text-orange-600 font-medium">Alterações não salvas</span>
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
              <div className="p-6">
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
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Alterações não salvas</h3>
                  <p className="text-gray-600 mb-6">
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
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
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
