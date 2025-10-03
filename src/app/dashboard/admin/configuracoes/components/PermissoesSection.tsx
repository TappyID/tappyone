'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Shield, 
  Users, 
  Key, 
  Lock,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  Ticket,
  Tag,
  Bell,
  GitBranch,
  Bot,
  Zap,
  Settings,
  BarChart,
  UserCog,
  Layers,
  Filter,
  Send,
  Image,
  Paperclip,
  Mic,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  Eye,
  EyeOff,
  Copy,
  Save
} from 'lucide-react'

interface PermissoesSectionProps {
  onConfigChange: () => void
}

interface Permission {
  id: string
  nome: string
  descricao: string
  categoria: 'rotas' | 'topbar' | 'sidebar' | 'modulos' | 'chat' | 'kanban'
  icone: any
}

interface Role {
  id: string
  nome: string
  descricao: string
  cor: string
  permissoes: string[]
}

// Definir todas as permissões disponíveis
const todasPermissoes: Permission[] = [
  // ROTAS
  { id: 'rota_dashboard', nome: 'Dashboard', descricao: 'Acesso ao dashboard principal', categoria: 'rotas', icone: LayoutDashboard },
  { id: 'rota_atendimento', nome: 'Atendimento', descricao: 'Acesso à central de atendimento', categoria: 'rotas', icone: MessageSquare },
  { id: 'rota_kanban', nome: 'Kanban', descricao: 'Acesso aos quadros Kanban', categoria: 'rotas', icone: Layers },
  { id: 'rota_relatorios', nome: 'Relatórios', descricao: 'Acesso aos relatórios', categoria: 'rotas', icone: BarChart },
  { id: 'rota_configuracoes', nome: 'Configurações', descricao: 'Acesso às configurações', categoria: 'rotas', icone: Settings },
  { id: 'rota_usuarios', nome: 'Usuários', descricao: 'Gerenciar usuários', categoria: 'rotas', icone: Users },
  { id: 'rota_atendentes', nome: 'Atendentes', descricao: 'Gerenciar atendentes', categoria: 'rotas', icone: UserCog },
  { id: 'rota_filas', nome: 'Filas', descricao: 'Gerenciar filas', categoria: 'rotas', icone: Layers },
  { id: 'rota_fluxos', nome: 'Fluxos', descricao: 'Gerenciar fluxos', categoria: 'rotas', icone: GitBranch },
  { id: 'rota_agentes', nome: 'Agentes IA', descricao: 'Gerenciar agentes IA', categoria: 'rotas', icone: Bot },
  
  // TOPBAR
  { id: 'topbar_notificacoes', nome: 'Notificações', descricao: 'Ver notificações', categoria: 'topbar', icone: Bell },
  { id: 'topbar_idioma', nome: 'Seletor de Idioma', descricao: 'Trocar idioma', categoria: 'topbar', icone: LayoutDashboard },
  { id: 'topbar_tema', nome: 'Trocar Tema', descricao: 'Dark/Light mode', categoria: 'topbar', icone: Settings },
  { id: 'topbar_cores', nome: 'Personalizar Cores', descricao: 'Seletor de cores', categoria: 'topbar', icone: Settings },
  
  // SIDEBAR
  { id: 'sidebar_dashboard', nome: 'Dashboard', descricao: 'Menu Dashboard', categoria: 'sidebar', icone: LayoutDashboard },
  { id: 'sidebar_atendimento', nome: 'Atendimento', descricao: 'Menu Atendimento', categoria: 'sidebar', icone: MessageSquare },
  { id: 'sidebar_kanban', nome: 'Kanban', descricao: 'Menu Kanban', categoria: 'sidebar', icone: Layers },
  { id: 'sidebar_relatorios', nome: 'Relatórios', descricao: 'Menu Relatórios', categoria: 'sidebar', icone: BarChart },
  { id: 'sidebar_configuracoes', nome: 'Configurações', descricao: 'Menu Configurações', categoria: 'sidebar', icone: Settings },
  
  // MÓDULOS
  { id: 'modulo_agentes', nome: 'Agentes IA', descricao: 'Ativar/desativar agentes', categoria: 'modulos', icone: Bot },
  { id: 'modulo_respostas_rapidas', nome: 'Respostas Rápidas', descricao: 'Usar respostas rápidas', categoria: 'modulos', icone: Zap },
  { id: 'modulo_agendamentos', nome: 'Agendamentos', descricao: 'Criar/ver agendamentos', categoria: 'modulos', icone: Calendar },
  { id: 'modulo_orcamentos', nome: 'Orçamentos', descricao: 'Criar/ver orçamentos', categoria: 'modulos', icone: DollarSign },
  { id: 'modulo_assinaturas', nome: 'Assinaturas', descricao: 'Gerenciar assinaturas', categoria: 'modulos', icone: FileText },
  { id: 'modulo_tickets', nome: 'Tickets', descricao: 'Criar/ver tickets', categoria: 'modulos', icone: Ticket },
  { id: 'modulo_tags', nome: 'Tags', descricao: 'Adicionar/remover tags', categoria: 'modulos', icone: Tag },
  { id: 'modulo_alertas', nome: 'Alertas', descricao: 'Criar alertas', categoria: 'modulos', icone: Bell },
  { id: 'modulo_filas', nome: 'Filas', descricao: 'Transferir entre filas', categoria: 'modulos', icone: Layers },
  { id: 'modulo_fluxos', nome: 'Fluxos', descricao: 'Executar fluxos', categoria: 'modulos', icone: GitBranch },
  
  // CHAT (SideChat, ChatArea, FooterChat)
  { id: 'chat_ver_mensagens', nome: 'Ver Mensagens', descricao: 'Visualizar conversas', categoria: 'chat', icone: Eye },
  { id: 'chat_enviar_texto', nome: 'Enviar Texto', descricao: 'Enviar mensagens de texto', categoria: 'chat', icone: Send },
  { id: 'chat_enviar_imagem', nome: 'Enviar Imagem', descricao: 'Enviar imagens', categoria: 'chat', icone: Image },
  { id: 'chat_enviar_arquivo', nome: 'Enviar Arquivo', descricao: 'Enviar arquivos', categoria: 'chat', icone: Paperclip },
  { id: 'chat_enviar_audio', nome: 'Enviar Áudio', descricao: 'Enviar áudios', categoria: 'chat', icone: Mic },
  { id: 'chat_emojis', nome: 'Usar Emojis', descricao: 'Picker de emojis', categoria: 'chat', icone: Smile },
  { id: 'chat_chamada_voz', nome: 'Chamada de Voz', descricao: 'Iniciar chamadas', categoria: 'chat', icone: Phone },
  { id: 'chat_chamada_video', nome: 'Chamada de Vídeo', descricao: 'Iniciar videochamadas', categoria: 'chat', icone: Video },
  { id: 'chat_mais_opcoes', nome: 'Mais Opções', descricao: 'Menu de opções extras', categoria: 'chat', icone: MoreHorizontal },
  { id: 'chat_filtros', nome: 'Filtros Avançados', descricao: 'Usar filtros do SideChat', categoria: 'chat', icone: Filter },
  { id: 'chat_transferir', nome: 'Transferir Chat', descricao: 'Transferir para outro atendente', categoria: 'chat', icone: Users },
  
  // KANBAN
  { id: 'kanban_mover_cards', nome: 'Mover Cards', descricao: 'Arrastar cards entre colunas', categoria: 'kanban', icone: Layers },
  { id: 'kanban_editar_cards', nome: 'Editar Cards', descricao: 'Editar informações dos cards', categoria: 'kanban', icone: Edit },
  { id: 'kanban_criar_colunas', nome: 'Criar Colunas', descricao: 'Adicionar novas colunas', categoria: 'kanban', icone: Plus },
  { id: 'kanban_editar_colunas', nome: 'Editar Colunas', descricao: 'Editar colunas existentes', categoria: 'kanban', icone: Edit },
  { id: 'kanban_deletar_colunas', nome: 'Deletar Colunas', descricao: 'Remover colunas', categoria: 'kanban', icone: Trash2 },
  { id: 'kanban_filtros', nome: 'Filtros Kanban', descricao: 'Usar filtros avançados', categoria: 'kanban', icone: Filter },
  { id: 'kanban_metricas', nome: 'Ver Métricas', descricao: 'Visualizar métricas', categoria: 'kanban', icone: BarChart },
]

export default function PermissoesSection({ onConfigChange }: PermissoesSectionProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      cor: '#ef4444',
      permissoes: todasPermissoes.map(p => p.id) // Todas as permissões
    },
    {
      id: 'atendente',
      nome: 'Atendente',
      descricao: 'Atendimento e gestão de chats',
      cor: '#3b82f6',
      permissoes: [
        'rota_dashboard',
        'rota_atendimento',
        'rota_kanban',
        'sidebar_dashboard',
        'sidebar_atendimento',
        'sidebar_kanban',
        'modulo_respostas_rapidas',
        'modulo_agendamentos',
        'modulo_tags',
        'modulo_tickets',
        'chat_ver_mensagens',
        'chat_enviar_texto',
        'chat_enviar_imagem',
        'chat_enviar_arquivo',
        'chat_enviar_audio',
        'chat_emojis',
        'chat_filtros',
        'kanban_mover_cards',
        'kanban_filtros',
        'kanban_metricas',
      ]
    },
    {
      id: 'fila',
      nome: 'Atendente de Fila',
      descricao: 'Atendimento restrito à sua fila',
      cor: '#8b5cf6',
      permissoes: [
        'rota_atendimento',
        'sidebar_atendimento',
        'modulo_respostas_rapidas',
        'modulo_tags',
        'chat_ver_mensagens',
        'chat_enviar_texto',
        'chat_enviar_imagem',
        'chat_emojis',
        'chat_filtros',
      ]
    }
  ])
  
  const [selectedRole, setSelectedRole] = useState<string>('admin')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['rotas'])
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [newRoleName, setNewRoleName] = useState('')
  const [showCreateRole, setShowCreateRole] = useState(false)
  
  const roleAtual = roles.find(r => r.id === selectedRole)
  
  const toggleCategory = (categoria: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoria) 
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    )
  }
  
  const togglePermission = (permissionId: string) => {
    if (!roleAtual) return
    
    const hasPermission = roleAtual.permissoes.includes(permissionId)
    const newPermissoes = hasPermission
      ? roleAtual.permissoes.filter(p => p !== permissionId)
      : [...roleAtual.permissoes, permissionId]
    
    setRoles(prev => prev.map(role => 
      role.id === selectedRole 
        ? { ...role, permissoes: newPermissoes }
        : role
    ))
    onConfigChange()
  }
  
  const toggleAllInCategory = (categoria: string) => {
    if (!roleAtual) return
    
    const permissoesCategoria = todasPermissoes
      .filter(p => p.categoria === categoria)
      .map(p => p.id)
    
    const todasMarcadas = permissoesCategoria.every(id => 
      roleAtual.permissoes.includes(id)
    )
    
    const newPermissoes = todasMarcadas
      ? roleAtual.permissoes.filter(p => !permissoesCategoria.includes(p))
      : Array.from(new Set([...roleAtual.permissoes, ...permissoesCategoria]))
    
    setRoles(prev => prev.map(role => 
      role.id === selectedRole 
        ? { ...role, permissoes: newPermissoes }
        : role
    ))
    onConfigChange()
  }
  
  const createNewRole = () => {
    if (!newRoleName.trim()) return
    
    const newRole: Role = {
      id: `role_${Date.now()}`,
      nome: newRoleName,
      descricao: 'Nova role personalizada',
      cor: '#6366f1',
      permissoes: []
    }
    
    setRoles(prev => [...prev, newRole])
    setSelectedRole(newRole.id)
    setNewRoleName('')
    setShowCreateRole(false)
    onConfigChange()
  }
  
  const deleteRole = (roleId: string) => {
    if (['admin', 'atendente', 'fila'].includes(roleId)) {
      alert('Não é possível deletar roles padrão do sistema')
      return
    }
    
    setRoles(prev => prev.filter(r => r.id !== roleId))
    if (selectedRole === roleId) {
      setSelectedRole('admin')
    }
    onConfigChange()
  }
  
  const duplicateRole = (role: Role) => {
    const newRole: Role = {
      ...role,
      id: `role_${Date.now()}`,
      nome: `${role.nome} (Cópia)`,
    }
    setRoles(prev => [...prev, newRole])
    setSelectedRole(newRole.id)
    onConfigChange()
  }
  
  const categorias = [
    { id: 'rotas', nome: 'Rotas e Páginas', icone: LayoutDashboard, cor: 'blue' },
    { id: 'topbar', nome: 'TopBar (Ícones Superior)', icone: Settings, cor: 'purple' },
    { id: 'sidebar', nome: 'Sidebar (Menu Lateral)', icone: Layers, cor: 'green' },
    { id: 'modulos', nome: 'Módulos do Sistema', icone: Zap, cor: 'orange' },
    { id: 'chat', nome: 'Chat (SideChat, ChatArea, Footer)', icone: MessageSquare, cor: 'cyan' },
    { id: 'kanban', nome: 'Kanban (Cards, Colunas, Filtros)', icone: Layers, cor: 'pink' },
  ]
  
  const getPermissoesPorCategoria = (categoria: string) => {
    return todasPermissoes.filter(p => p.categoria === categoria)
  }
  
  const getCorCategoria = (cor: string) => {
    const cores: any = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200' },
      green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' },
      cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-200' },
    }
    return cores[cor] || cores.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <Shield className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Permissões e Roles
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Configure roles, permissões e controle de acesso por tipo de usuário
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowCreateRole(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDark
                ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Nova Role
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Lista de Roles */}
        <div className="col-span-3">
          <div className={`rounded-xl p-4 ${
            isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              ROLES DISPONÍVEIS
            </h4>
            
            <div className="space-y-2">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? isDark
                        ? 'bg-slate-700 border-2 border-blue-500'
                        : 'bg-blue-50 border-2 border-blue-500'
                      : isDark
                        ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.cor }}
                      />
                      <span className={`font-medium text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {role.nome}
                      </span>
                    </div>
                    
                    {!['admin', 'atendente', 'fila'].includes(role.id) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateRole(role)
                          }}
                          className={`p-1 rounded hover:bg-white/10`}
                          title="Duplicar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteRole(role.id)
                          }}
                          className={`p-1 rounded hover:bg-red-500/20 text-red-500`}
                          title="Deletar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {role.descricao}
                  </p>
                  
                  <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {role.permissoes.length} permissões
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Permissões */}
        <div className="col-span-9">
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-gray-200'
          }`}>
            {/* Header da Role */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${roleAtual?.cor}20` }}
                >
                  <Shield 
                    className="w-6 h-6"
                    style={{ color: roleAtual?.cor }}
                  />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {roleAtual?.nome}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {roleAtual?.descricao}
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={() => {
                  console.log('💾 Salvando permissões:', roleAtual)
                  alert('Permissões salvas! (Backend pendente)')
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                Salvar Permissões
              </motion.button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {roleAtual?.permissoes.length}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total de Permissões
                </div>
              </div>
              
              {categorias.slice(0, 3).map((cat) => {
                const permissoesCategoria = getPermissoesPorCategoria(cat.id)
                const permissoesAtivas = permissoesCategoria.filter(p => 
                  roleAtual?.permissoes.includes(p.id)
                ).length
                const cores = getCorCategoria(cat.cor)
                
                return (
                  <div 
                    key={cat.id}
                    className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : cores.light}`}
                  >
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : cores.text}`}>
                      {permissoesAtivas}/{permissoesCategoria.length}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {cat.nome}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Lista de Permissões por Categoria */}
            <div className="space-y-4">
              {categorias.map((categoria) => {
                const permissoes = getPermissoesPorCategoria(categoria.id)
                const isExpanded = expandedCategories.includes(categoria.id)
                const cores = getCorCategoria(categoria.cor)
                const permissoesAtivas = permissoes.filter(p => 
                  roleAtual?.permissoes.includes(p.id)
                ).length
                const todasMarcadas = permissoes.every(p => 
                  roleAtual?.permissoes.includes(p.id)
                )
                
                return (
                  <motion.div
                    key={categoria.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border ${
                      isDark 
                        ? 'bg-slate-700/30 border-slate-600' 
                        : `${cores.light} ${cores.border}`
                    }`}
                  >
                    {/* Header da Categoria */}
                    <div
                      onClick={() => toggleCategory(categoria.id)}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-xl`}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : cores.text}`} />
                        </motion.div>
                        
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
                          <categoria.icone className={`w-5 h-5 ${isDark ? 'text-gray-300' : cores.text}`} />
                        </div>
                        
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {categoria.nome}
                          </h4>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {permissoesAtivas} de {permissoes.length} ativas
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleAllInCategory(categoria.id)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            todasMarcadas
                              ? isDark
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                              : isDark
                                ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {todasMarcadas ? (
                            <>
                              <Check className="w-3 h-3 inline mr-1" />
                              Desmarcar Todas
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 inline mr-1" />
                              Marcar Todas
                            </>
                          )}
                        </motion.button>
                        
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          isDark ? 'bg-slate-600 text-gray-300' : `${cores.bg} text-white`
                        }`}>
                          {permissoesAtivas}/{permissoes.length}
                        </div>
                      </div>
                    </div>

                    {/* Lista de Permissões */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 dark:border-slate-600"
                      >
                        <div className="p-4 grid grid-cols-2 gap-3">
                          {permissoes.map((permissao) => {
                            const isActive = roleAtual?.permissoes.includes(permissao.id)
                            const Icone = permissao.icone
                            
                            return (
                              <motion.div
                                key={permissao.id}
                                onClick={() => togglePermission(permissao.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${
                                  isActive
                                    ? isDark
                                      ? 'bg-green-500/20 border-2 border-green-500'
                                      : 'bg-green-50 border-2 border-green-500'
                                    : isDark
                                      ? 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icone className={`w-4 h-4 ${
                                      isActive
                                        ? isDark ? 'text-green-400' : 'text-green-600'
                                        : isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                      isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {permissao.nome}
                                    </span>
                                  </div>
                                  
                                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                    isActive
                                      ? isDark ? 'bg-green-500' : 'bg-green-500'
                                      : isDark ? 'bg-slate-600' : 'bg-gray-300'
                                  }`}>
                                    {isActive && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                                
                                <p className={`text-xs ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {permissao.descricao}
                                </p>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Criar Nova Role */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-6 max-w-md w-full ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
          >
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Criar Nova Role
            </h3>
            
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Nome da role..."
              className={`w-full px-4 py-3 rounded-lg mb-4 ${
                isDark
                  ? 'bg-slate-700 border border-slate-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
              autoFocus
            />
            
            <div className="flex gap-3">
              <motion.button
                onClick={createNewRole}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } transition-colors`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Criar Role
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setShowCreateRole(false)
                  setNewRoleName('')
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } transition-colors`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
