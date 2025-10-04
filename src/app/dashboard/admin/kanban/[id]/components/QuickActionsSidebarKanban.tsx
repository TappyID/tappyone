'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  MessageSquare,
  Zap,
  Tag,
  Send,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  User,
  Hash,
  Type,
  CreditCard,
  Image as ImageIcon,
  Mic,
  Video,
  FileText,
  Settings,
  Edit,
  Bot,
  Calendar,
  Play,
  Pause,
  Workflow,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  Upload,
  Music,
  File,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/contexts/ThemeContext'
import CriarRespostaModal from '../../../respostas-rapidas/components/CriarRespostaModal'
import CriarFluxoIAModal from '../../../atendimentos/components/CriarFluxoIAModal'
import EditTextModal from '../../../atendimentos/components/EditTextModal'
import { useRespostasRapidas } from '@/hooks/useRespostasRapidas'
import { AudioRecorder } from '@/components/shared/AudioRecorder'
import MediaUpload from '@/components/shared/MediaUpload'
// Badge component inline
const Badge = ({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary' | 'outline'; 
  className?: string 
}) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-muted text-muted-foreground',
    outline: 'border border-border text-muted-foreground'
  }
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

interface QuickAction {
  id: string
  title: string
  content: string
  type: 'text' | 'pix' | 'image' | 'audio' | 'video' | 'document'
  category: string
  tags: string[]
  isAutomatic: boolean
  keywords: string[]
  createdAt: string
  usageCount: number
  isPaused?: boolean
  isActive?: boolean
  originalData?: any
  editedActions?: any[]
}

interface QuickActionsSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelectAction: (action: QuickAction) => void
  selectedContact?: any
  activeChatId?: string // Chat ativo atual
  onEditAction?: (action: QuickAction) => void
  onScheduleAction?: (action: QuickAction) => void
  onCreateWithAI?: () => void
  onCreateFlowWithAI?: () => void
  onCreateNow?: () => void
}

// Mock data - depois vamos buscar da API
const mockQuickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Bom dia',
    content: 'Olá, bom dia [cliente]! Tudo bem com você?',
    type: 'text',
    category: 'Saudações',
    tags: ['cumprimento', 'manhã'],
    isAutomatic: true,
    keywords: ['bom dia', 'oi', 'olá'],
    createdAt: '2024-01-15',
    usageCount: 45
  },
  {
    id: '2',
    title: 'Nossos Serviços',
    content: 'Oferecemos desenvolvimento de sistemas, consultoria em TI, automação de processos e muito mais. Qual área te interessa?',
    type: 'text',
    category: 'Vendas',
    tags: ['serviços', 'vendas'],
    isAutomatic: false,
    keywords: ['serviços', 'o que vocês fazem', 'produtos'],
    createdAt: '2024-01-10',
    usageCount: 23
  },
  {
    id: '3',
    title: 'PIX Empresarial',
    content: 'CNPJ: 12.345.678/0001-90',
    type: 'pix',
    category: 'Pagamento',
    tags: ['pix', 'pagamento', 'cnpj'],
    isAutomatic: true,
    keywords: ['pix', 'pagamento', 'como pagar'],
    createdAt: '2024-01-12',
    usageCount: 67
  }
]

const categories = ['Todas', 'Saudações', 'Vendas', 'Pagamento', 'Suporte', 'Despedida']

export default function QuickActionsSidebar({ 
  isOpen, 
  onClose, 
  onSelectAction, 
  selectedContact,
  activeChatId,
  onEditAction,
  onScheduleAction,
  onCreateWithAI,
  onCreateFlowWithAI,
  onCreateNow
}: QuickActionsSidebarProps) {
  const { actualTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createModalWithAI, setCreateModalWithAI] = useState(false) // Flag para indicar que deve abrir com IA
  const [showFluxoIAModal, setShowFluxoIAModal] = useState(false)
  const [showEditTextModal, setShowEditTextModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedActionToSchedule, setSelectedActionToSchedule] = useState<QuickAction | null>(null)
  const [editingActions, setEditingActions] = useState<{[key: string]: any[]}>({})
  const [textareaHeights, setTextareaHeights] = useState<{[key: string]: number}>({}) // Controla altura das textareas
  const [isGeneratingAI, setIsGeneratingAI] = useState<{[key: string]: boolean}>({}) // Controla loading da IA
  
  const { respostas, categorias, fetchRespostas, fetchCategorias, togglePauseResposta, executeResposta } = useRespostasRapidas()

  // Debug do estado do modal
  useEffect(() => {
    console.log('📋 [DEBUG] showFluxoIAModal estado:', showFluxoIAModal)
  }, [showFluxoIAModal])

  useEffect(() => {
    if (isOpen) {
      fetchRespostas()
      fetchCategorias()
    }
  }, [isOpen, fetchRespostas, fetchCategorias])
  
  // Mapear respostas rápidas para o formato do componente
  const quickActions: QuickAction[] = (respostas || []).map(resposta => {
    // Verificar se é automática
    const isAutomatic = resposta.trigger_tipo !== 'manual' && resposta.ativo && !resposta.pausado
    
    // Debug das ações
  
    
    return {
      id: resposta.id,
      title: resposta.titulo,
      content: resposta.acoes?.find(a => a.tipo === 'texto')?.conteudo?.texto || resposta.descricao || '',
      type: 'text' as const,
      category: resposta.categoria?.nome || 'Geral',
      tags: resposta.triggers || [],
      isAutomatic,
      keywords: resposta.triggers || [],
      usageCount: 0,
      createdAt: resposta.created_at,
      isPaused: resposta.pausado || false,
      isActive: resposta.ativo || false,
      originalData: resposta // Para acessar dados completos
    }
  })

  // Filtrar ações rápidas (agora mostra TODAS)
  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (action.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || selectedCategory === 'Todas' || action.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Agrupar por categoria
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = []
    }
    acc[action.category].push(action)
    return acc
  }, {} as Record<string, QuickAction[]>)

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const handleActionSelect = async (action: QuickAction) => {
    console.log('=== DEBUG handleActionSelect ===')
    console.log('Action clicada:', action)
    console.log('activeChatId:', activeChatId)
    console.log('selectedContact:', selectedContact)
    console.log('🔍 editedActions exist?', !!action.editedActions)
    console.log('🔍 editedActions:', action.editedActions)
    
    // Usar chat ativo prioritariamente, depois contato selecionado como fallback
    const chatId = activeChatId || selectedContact?.jid
    console.log('chatId determinado:', chatId)

    if (!chatId) {
      console.log('ERRO: chatId não encontrado, mostrando alert')
      alert('Abra uma conversa primeiro para executar a resposta rápida')
      return
    }

    // PARA TESTE: Perguntar ao usuário se quer forçar modo automático
    const forcarAutomatico = confirm(
      `TESTE: Deseja enviar "${action.title}" automaticamente?\n\n` +
      `👆 OK = MODO AUTOMÁTICO (envia direto)\n` +
      `❌ Cancelar = MODO MANUAL (coloca no input)`
    )

    console.log('forcarAutomatico (escolha do usuário):', forcarAutomatico)
    console.log('action.isAutomatic (do banco):', action.isAutomatic)
    
    // Usar a escolha do usuário ou a configuração original
    const isAutomatic = forcarAutomatico || action.isAutomatic
    console.log('isAutomatic final:', isAutomatic)

    if (isAutomatic) {
      console.log('=== MODO AUTOMÁTICO ===')
      console.log('Executando resposta automaticamente...')
      
      // Se há ações editadas, usar o fluxo customizado
      if (action.editedActions && action.editedActions.length > 0) {
        console.log('🎯 Usando ações editadas no modo automático:', action.editedActions)
        try {
          const response = await fetch(`/api/respostas-rapidas/${action.id}/executar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              chat_id: chatId,
              acoes_customizadas: action.editedActions
            })
          })
          
          if (response.ok) {
            console.log('✅ Resposta rápida com ações editadas executada!')
            alert('✅ Resposta com ações editadas enviada!')
          } else {
            console.error('❌ Erro:', await response.text())
            alert('❌ Erro ao enviar resposta editada')
          }
        } catch (error) {
          console.error('❌ Erro ao executar ações editadas:', error)
          alert('❌ Erro ao executar ações editadas')
        }
      } else {
        console.log('📝 Usando ações originais (sem edições)')
        // Abordagem 1: AUTOMÁTICO - Envia direto via API
        try {
          console.log('Chamando executeResposta com:', { actionId: action.id, chatId })
          await executeResposta(action.id, chatId)
          console.log('✅ Resposta rápida executada automaticamente:', action.title)
          alert('✅ Resposta enviada automaticamente!')
        } catch (error) {
          console.error('❌ Erro ao executar resposta rápida:', error)
          alert('Erro ao executar resposta rápida: ' + (error instanceof Error ? error.message : String(error)))
        }
      }
    } else {
      console.log('=== MODO MANUAL ===')
      console.log('Preparando conteúdo para input...')
      // Abordagem 2: MANUAL - Vai pro input para edição
      // Montar o conteúdo das ações de texto para edição
      const respostaCompleta = action.originalData
      console.log('respostaCompleta:', respostaCompleta)
      const acoesTexto = respostaCompleta?.acoes?.filter(a => a.tipo === 'texto') || []
      console.log('acoesTexto:', acoesTexto)
      
      let conteudoCompleto = ''
      if (acoesTexto.length > 0) {
        conteudoCompleto = acoesTexto
          .map(a => a.conteudo?.texto || a.conteudo?.mensagem || '')
          .join('\n')
      } else {
        conteudoCompleto = action.title
      }
      console.log('conteudoCompleto preparado:', conteudoCompleto)

      // Chamar callback com conteúdo para colocar no input
      console.log('Chamando onSelectAction callback...')
      onSelectAction?.({
        ...action,
        content: conteudoCompleto
      })
    }
    console.log('=== FIM DEBUG handleActionSelect ===')
  }

  const handleToggleAutomatic = useCallback(async (action: QuickAction, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      console.log('🤖 Alterando status automático:', action.title)
      
      // Se está ativo (automático), pausar. Se pausado, ativar
      const novoPausado = action.isAutomatic ? true : false
      await togglePauseResposta(action.id, novoPausado)
      
      console.log(`✅ Resposta ${novoPausado ? 'pausada' : 'ativada'} com sucesso`)
      
      // Recarregar dados
      fetchRespostas()
    } catch (error) {
      console.error('❌ Erro ao alterar status da resposta:', error)
      alert('Erro ao alterar status da resposta rápida')
    }
  }, [togglePauseResposta, fetchRespostas])

  const handleScheduleAction = useCallback((action: QuickAction, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('📅 Abrindo modal de agendamento para:', action.title)
    setSelectedActionToSchedule(action)
    setShowScheduleModal(true)
  }, [])

  const handleConfirmSchedule = useCallback(async (data: {
    chatId: string
    date: string
    time: string
  }) => {
    if (!selectedActionToSchedule) return
    
    try {
      console.log('📅 Confirmando agendamento:', data)
      
      // Combinar data e hora
      const dateTime = new Date(`${data.date}T${data.time}`)
      const token = localStorage.getItem('token')
      
      // Criar agendamento via API
      const response = await fetch('/api/respostas-rapidas/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resposta_rapida_id: selectedActionToSchedule.id,
          chat_id: data.chatId,
          proxima_execucao: dateTime.toISOString(),
          trigger_tipo: 'horario',
          max_execucoes: 1,
          ativo: true
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Agendamento criado:', result)
        alert(`📅 Resposta "${selectedActionToSchedule.title}" agendada para:\n🗓️ ${dateTime.toLocaleString()}\n💬 Chat: ${data.chatId}`)
        setShowScheduleModal(false)
        setSelectedActionToSchedule(null)
      } else {
        throw new Error('Erro na API de agendamento')
      }
      
    } catch (error) {
      console.error('❌ Erro ao agendar resposta:', error)
      alert('❌ Erro ao agendar resposta. Verifique se a API está implementada.')
    }
  }, [selectedActionToSchedule])

  const handleCreateWithAI = () => {
    console.log('🤖 Botão "Criar com IA" clicado!')
    console.log('onCreateWithAI disponível:', !!onCreateWithAI)
    
    // CORRETO: Abrir EditTextModal para criar com IA
    console.log('⚡ Abrindo EditTextModal para criação com IA...')
    setShowEditTextModal(true)
    
    // Opcional: também chama a prop se existir
    if (onCreateWithAI) {
      onCreateWithAI()
    }
  }

  const handleCreateFlowWithAI = () => {
    setShowFluxoIAModal(true)
  }

  const handleCreateFluxo = async (fluxoData: any) => {
    try {
      console.log('🤖 Criando fluxo com IA:', fluxoData)
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/respostas-rapidas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fluxoData)
      })

      if (response.ok) {
        const novaResposta = await response.json()
        console.log('✅ Fluxo criado com sucesso:', novaResposta)
        
        // Recarregar lista com delay para garantir que o backend processou
        setTimeout(async () => {
          await fetchRespostas()
          console.log('📋 Lista recarregada após criação do fluxo IA')
          
          // Debug específico para o fluxo recém-criado
          const fluxoCriado = quickActions.find(action => action.title.includes('Gerado por IA'))
          if (fluxoCriado) {
            console.log('🔍 Fluxo IA encontrado na lista:', {
              id: fluxoCriado.id,
              title: fluxoCriado.title,
              originalData: fluxoCriado.originalData,
              acoes: fluxoCriado.originalData?.acoes,
              acoesLength: fluxoCriado.originalData?.acoes?.length
            })
          } else {
            console.log('❌ Fluxo IA NÃO encontrado na lista recarregada')
          }
        }, 1000)
        
        alert('🤖 Fluxo criado com IA com sucesso!')
      } else {
        throw new Error('Erro ao criar fluxo')
      }
    } catch (error) {
      console.error('Erro ao criar fluxo:', error)
      alert('❌ Erro ao criar fluxo. Tente novamente.')
    }
  }

  const handleCreateNow = () => {
    console.log('➕ Botão "Criar Agora" clicado!')
    setCreateModalWithAI(false) // ← SEM IA
    setShowCreateModal(true)     // ← Abre o modal normal
  }

  const toggleActionExpansion = (actionId: string) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(actionId)) {
        newSet.delete(actionId)
        // Limpar ações editadas quando fechar
        setEditingActions(prev => {
          const newState = { ...prev }
          delete newState[actionId]
          return newState
        })
      } else {
        newSet.add(actionId)
        // Inicializar ações editadas
        const action = quickActions.find(a => a.id === actionId)
        if (action?.originalData?.acoes) {
          setEditingActions(prev => ({
            ...prev,
            [actionId]: [...action.originalData.acoes]
          }))
        }
      }
      return newSet
    })
  }

  const updateEditingAction = (actionId: string, actionIndex: number, field: string, value: any) => {
    setEditingActions(prev => {
      const newState = { ...prev }
      if (!newState[actionId]) return prev
      
      const newActions = [...newState[actionId]]
      let conteudo
      try {
        conteudo = typeof newActions[actionIndex].conteudo === 'string' 
          ? JSON.parse(newActions[actionIndex].conteudo) 
          : newActions[actionIndex].conteudo
      } catch {
        conteudo = {}
      }
      
      if (field === 'texto') {
        conteudo = { texto: value }
      } else {
        conteudo[field] = value
      }
      
      newActions[actionIndex] = {
        ...newActions[actionIndex],
        conteudo: conteudo
      }
      
      return {
        ...prev,
        [actionId]: newActions
      }
    })
  }

  const addNewAction = (actionId: string, tipo: string) => {
    setEditingActions(prev => {
      const newState = { ...prev }
      if (!newState[actionId]) return prev
      
      const getDefaultContent = (tipo: string) => {
        switch (tipo) {
          case 'texto': return { texto: '' }
          case 'imagem': return { url: '', caption: '' }
          case 'audio': return { url: '' }
          case 'video': return { url: '', caption: '' }
          case 'arquivo': return { url: '', filename: '', caption: '' }
          case 'pix': return { chave: '', valor: '', descricao: '' }
          case 'delay': return { segundos: 5 }
          default: return {}
        }
      }
      
      const newAction = {
        tipo,
        ordem: newState[actionId].length,
        conteudo: getDefaultContent(tipo),
        ativo: true
      }
      
      return {
        ...prev,
        [actionId]: [...newState[actionId], newAction]
      }
    })
  }

  const removeAction = (actionId: string, actionIndex: number) => {
    setEditingActions(prev => {
      const newState = { ...prev }
      if (!newState[actionId]) return prev
      
      const newActions = newState[actionId].filter((_, i) => i !== actionIndex)
        .map((action, i) => ({ ...action, ordem: i }))
      
      return {
        ...prev,
        [actionId]: newActions
      }
    })
  }

  const moveAction = (actionId: string, fromIndex: number, toIndex: number) => {
    setEditingActions(prev => {
      const newState = { ...prev }
      if (!newState[actionId]) return prev
      
      const newActions = [...newState[actionId]]
      const [movedItem] = newActions.splice(fromIndex, 1)
      newActions.splice(toIndex, 0, movedItem)
      
      return {
        ...prev,
        [actionId]: newActions.map((action, i) => ({ ...action, ordem: i }))
      }
    })
  }

  const getTypeIcon = (type: QuickAction['type']) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />
      case 'pix': return <CreditCard className="w-4 h-4" />
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'audio': return <Mic className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: QuickAction['type']) => {
    switch (type) {
      case 'text': return 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400'
      case 'pix': return 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400'
      case 'image': return 'bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-400'
      case 'audio': return 'bg-orange-500/20 text-orange-600 dark:bg-orange-500/30 dark:text-orange-400'
      case 'video': return 'bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-400'
      case 'document': return 'bg-slate-500/20 text-slate-600 dark:bg-slate-500/30 dark:text-slate-400'
      default: return 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -520, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`w-[520px] h-full shadow-2xl border-r overflow-y-auto rounded-l-2xl ${
            actualTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Respostas Rápidas</h3>
                  <p className="text-xs text-muted-foreground">Envie mensagens instantâneas</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
              >
                <X className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
              </motion.button>
            </div>
            
         

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
              <Input
                placeholder="Buscar respostas rápidas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm bg-background/50 border-purple-200/50 dark:border-purple-500/20 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl shadow-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory('all')}
                className={`whitespace-nowrap text-xs h-8 px-4 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-background/50 text-muted-foreground hover:bg-purple-500/10 border border-border/50'
                }`}
              >
                ✨ Todas
              </motion.button>
              {categorias.map(categoria => (
                <motion.button
                  key={categoria.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(categoria.nome)}
                  className={`whitespace-nowrap text-xs h-8 px-4 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === categoria.nome
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-background/50 text-muted-foreground hover:bg-purple-500/10 border border-border/50'
                  }`}
                >
                  {categoria.nome}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions List */}
          <div className="flex-1 overflow-y-auto p-4">
            {Object.entries(groupedActions).map(([category, actions]) => (
              <div key={category} className="mb-4">
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 w-full text-left p-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 rounded-xl transition-all duration-300 group border border-transparent hover:border-purple-500/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4 text-purple-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <span className="font-semibold text-sm text-foreground flex-1">{category}</span>
                  <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs font-bold shadow-sm">
                    {actions.length}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {expandedCategories.has(category) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 space-y-2 mt-2">
                        {actions.map(action => {
                          const isExpanded = expandedActions.has(action.id)
                          return (
                          <motion.div
                            key={action.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-3 border border-border/50 rounded-xl hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer transition-all duration-300 group bg-gradient-to-br from-background to-background/50 backdrop-blur-sm"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className={`p-2 rounded-xl shadow-sm ${getTypeColor(action.type)}`}>
                                  {getTypeIcon(action.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground text-sm block truncate">
                                      {action.title}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleActionExpansion(action.id)
                                      }}
                                      className="p-0.5 hover:bg-accent rounded transition-colors"
                                      title={isExpanded ? 'Recolher' : 'Expandir para editar'}
                                    >
                                      {isExpanded ? <EyeOff className="w-3 h-3 text-muted-foreground" /> : <Eye className="w-3 h-3 text-muted-foreground" />}
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {/* Status Badge */}
                                    {action.isAutomatic && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                                        <Zap className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Auto</span>
                                      </div>
                                    )}
                                    {action.isPaused && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                                        <Clock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pausada</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                                      <Star className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{action.usageCount}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleActionExpansion(action.id)
                                  }}
                                  className="p-1.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 hover:from-blue-500/30 hover:to-cyan-500/30 dark:text-blue-400 rounded-lg transition-all shadow-sm"
                                  title={isExpanded ? 'Recolher edição' : 'Expandir para editar'}
                                >
                                  <Edit className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleScheduleAction(action, e)}
                                  className="p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 hover:from-purple-500/30 hover:to-pink-500/30 dark:text-purple-400 rounded-lg transition-all shadow-sm"
                                  title="Agendar resposta"
                                >
                                  <Calendar className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    if (window.confirm(`Tem certeza que deseja excluir "${action.title}"?`)) {
                                      try {
                                        const token = localStorage.getItem('token')
                                        const response = await fetch(`/api/respostas-rapidas/${action.id}`, {
                                          method: 'DELETE',
                                          headers: {
                                            'Authorization': `Bearer ${token}`
                                          }
                                        })
                                        
                                        if (response.ok) {
                                          fetchRespostas() // Recarregar lista
                                          alert('✅ Resposta rápida excluída com sucesso!')
                                        } else {
                                          throw new Error('Erro ao excluir resposta rápida')
                                        }
                                      } catch (error) {
                                        console.error('Erro ao excluir:', error)
                                        alert('❌ Erro ao excluir resposta rápida')
                                      }
                                    }
                                  }}
                                  className="p-1.5 bg-gradient-to-br from-red-500/20 to-rose-500/20 text-red-600 hover:from-red-500/30 hover:to-rose-500/30 dark:text-red-400 rounded-lg transition-all shadow-sm"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => handleToggleAutomatic(action, e)}
                                  className={`p-1.5 rounded-lg transition-all shadow-sm ${
                                    action.isAutomatic 
                                      ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 text-yellow-600 hover:from-yellow-500/40 hover:to-orange-500/40 dark:text-yellow-400' 
                                      : action.isPaused 
                                      ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20 text-red-600 hover:from-red-500/30 hover:to-rose-500/30 dark:text-red-400'
                                      : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 text-muted-foreground hover:from-gray-500/20 hover:to-slate-500/20 hover:text-foreground'
                                  }`}
                                  title={action.isAutomatic ? 'Automático ATIVO (clique para desativar)' : action.isPaused ? 'Pausado' : 'Ativar automático'}
                                >
                                  <Zap className={`w-3 h-3 ${action.isAutomatic ? 'text-yellow-600' : ''}`} />
                                </motion.button>
                              </div>
                            </div>

                            {/* Content Preview */}
                            <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
                              {action.content}
                            </p>

                            {/* Expanded Edit Section */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden border-t border-border pt-2 mt-2"
                                >
                                  <div className="space-y-3">
                                    <label className="text-xs font-medium text-muted-foreground">Editar ações antes de enviar:</label>
                                    
                                    {/* Mostrar todas as ações da resposta rápida */}
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                      {(() => {
                                        const actionsToShow = (editingActions[action.id]?.length > 0) ? editingActions[action.id] : (action.originalData?.acoes || [])
                                      
                                        return actionsToShow
                                      })().map((acao: any, index: number) => {
                                        const tipoIcon = {
                                          'texto': <MessageSquare className="w-3 h-3" />,
                                          'imagem': <ImageIcon className="w-3 h-3" />,
                                          'audio': <Mic className="w-3 h-3" />,
                                          'video': <Video className="w-3 h-3" />,
                                          'arquivo': <FileText className="w-3 h-3" />,
                                          'pix': <CreditCard className="w-3 h-3" />,
                                          'delay': <Clock className="w-3 h-3" />
                                        }[acao.tipo] || <MessageSquare className="w-3 h-3" />
                                        
                                        const tipoColor = {
                                          'texto': 'bg-blue-500/10 text-blue-600 border-blue-200',
                                          'imagem': 'bg-green-500/10 text-green-600 border-green-200',
                                          'audio': 'bg-purple-500/10 text-purple-600 border-purple-200',
                                          'video': 'bg-red-500/10 text-red-600 border-red-200',
                                          'arquivo': 'bg-orange-500/10 text-orange-600 border-orange-200',
                                          'pix': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
                                          'delay': 'bg-gray-500/10 text-gray-600 border-gray-200'
                                        }[acao.tipo] || 'bg-blue-500/10 text-blue-600 border-blue-200'
                                        
                                        let conteudoAcao
                                        try {
                                          conteudoAcao = typeof acao.conteudo === 'string' ? JSON.parse(acao.conteudo) : acao.conteudo
                                        } catch {
                                          conteudoAcao = acao.conteudo
                                        }
                                        
                                        const currentActions = editingActions[action.id] || []
                                        
                                        return (
                                          <div
                                            key={index}
                                            className={`p-2 border rounded-md ${tipoColor}`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded ${tipoColor.replace('border-', 'bg-').replace('/10', '/20')}`}>
                                                  {tipoIcon}
                                                </div>
                                                <span className="text-xs font-medium capitalize">
                                                  {acao.tipo} {index + 1}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                {index > 0 && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      moveAction(action.id, index, index - 1)
                                                    }}
                                                    className="p-0.5 hover:bg-accent rounded transition-colors"
                                                    title="Mover para cima"
                                                  >
                                                    <ChevronUp className="w-3 h-3 text-muted-foreground" />
                                                  </button>
                                                )}
                                                {index < currentActions.length - 1 && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      moveAction(action.id, index, index + 1)
                                                    }}
                                                    className="p-0.5 hover:bg-accent rounded transition-colors"
                                                    title="Mover para baixo"
                                                  >
                                                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                                  </button>
                                                )}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeAction(action.id, index)
                                                  }}
                                                  className="p-0.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                                                  title="Remover ação"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                            
                                            {acao.tipo === 'texto' && (
                                              <div className="space-y-2">
                                                {/* Header com controles */}
                                                <div className="flex items-center justify-between">
                                                  <span className="text-xs text-muted-foreground">Texto da mensagem</span>
                                                  <div className="flex items-center gap-1">
                                                    {/* Botão AI - Geração Real */}
                                                    <button
                                                      onClick={async (e) => {
                                                        e.stopPropagation()
                                                        const textareaKey = `${action.id}-${index}`
                                                        setIsGeneratingAI(prev => ({ ...prev, [textareaKey]: true }))
                                                        
                                                        try {
                                                          console.log('🤖 Gerando texto com IA para resposta rápida...')
                                                          
                                                          // Gerar prompt baseado no título da ação
                                                          const prompt = `Crie uma resposta rápida profissional para "${action.title}". 
                                                          Deve ser: amigável, clara, útil e adequada para atendimento ao cliente via WhatsApp.
                                                          Máximo 200 palavras.`
                                                          
                                                          const response = await fetch('/api/ai/generate', {
                                                            method: 'POST',
                                                            headers: {
                                                              'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                              prompt,
                                                              context: `Resposta Rápida: ${action.title}`,
                                                              type: 'response'
                                                            })
                                                          })

                                                          if (response.ok) {
                                                            const data = await response.json()
                                                            const generatedText = data.text || 'Texto gerado com IA'
                                                            updateEditingAction(action.id, index, 'texto', generatedText)
                                                            console.log('✅ Texto gerado com sucesso!')
                                                          } else {
                                                            console.error('❌ Erro na API de IA:', response.status)
                                                            alert('Erro ao gerar conteúdo com IA. Tente novamente.')
                                                          }
                                                        } catch (error) {
                                                          console.error('❌ Erro ao gerar conteúdo:', error)
                                                          alert('Erro de conexão com a IA. Verifique sua internet.')
                                                        } finally {
                                                          setIsGeneratingAI(prev => ({ ...prev, [textareaKey]: false }))
                                                        }
                                                      }}
                                                      className="p-1 hover:bg-accent rounded transition-colors"
                                                      title="Gerar texto automaticamente com IA"
                                                      disabled={isGeneratingAI[`${action.id}-${index}`]}
                                                    >
                                                      {isGeneratingAI[`${action.id}-${index}`] ? (
                                                        <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                      ) : (
                                                        <Sparkles className="w-3 h-3 text-blue-500" />
                                                      )}
                                                    </button>
                                                    
                                                  </div>
                                                </div>
                                                
                                                {/* Textarea com auto-resize */}
                                                <textarea
                                                  ref={(textarea) => {
                                                    if (textarea) {
                                                      // Auto-resize baseado no conteúdo
                                                      const autoResize = () => {
                                                        textarea.style.height = 'auto'
                                                        const scrollHeight = textarea.scrollHeight
                                                        const lineHeight = 16 // Aproximadamente para text-xs
                                                        const minHeight = lineHeight * 4 // Mínimo 4 linhas
                                                        const maxHeight = lineHeight * 12 // Máximo 12 linhas
                                                        const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight))
                                                        textarea.style.height = `${newHeight}px`
                                                      }
                                                      
                                                      // Auto-resize imediato
                                                      setTimeout(autoResize, 0)
                                                      
                                                      // Auto-resize no input
                                                      textarea.addEventListener('input', autoResize)
                                                    }
                                                  }}
                                                  className="w-full p-2 text-xs border border-border rounded bg-background text-foreground resize-none focus:ring-1 focus:ring-primary transition-all overflow-hidden"
                                                  style={{ minHeight: '64px' }} // 4 linhas mínimo
                                                  value={conteudoAcao?.texto || conteudoAcao?.mensagem || ''}
                                                  onChange={(e) => updateEditingAction(action.id, index, 'texto', e.target.value)}
                                                  placeholder="Digite o texto da mensagem ou use a IA para gerar..."
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                              </div>
                                            )}
                                            
                                            {acao.tipo === 'imagem' && (
                                              <div className="space-y-2">
                                                {/* 🎨 Seção de Gerar Imagem com IA */}
                                                <div className={`p-3 rounded-lg border ${
                                                  actualTheme === 'dark' ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
                                                }`}>
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                                    <span className="text-xs font-medium">Gerar com IA</span>
                                                  </div>
                                                  <div className="space-y-2">
                                                    <input
                                                      type="text"
                                                      className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                                      placeholder="Descreva a imagem que deseja gerar..."
                                                      value={conteudoAcao?.aiPrompt || ''}
                                                      onChange={(e) => updateEditingAction(action.id, index, 'aiPrompt', e.target.value)}
                                                    />
                                                    <Button
                                                      size="sm"
                                                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                                                      onClick={async () => {
                                                        const prompt = conteudoAcao?.aiPrompt || 'Uma imagem profissional e criativa'
                                                        try {
                                                          const response = await fetch('/api/ai/generate', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                              prompt,
                                                              type: 'image',
                                                              imageModel: 'dall-e-3'
                                                            })
                                                          })
                                                          
                                                          if (response.ok) {
                                                            const data = await response.json()
                                                            if (data.imageUrl) {
                                                              updateEditingAction(action.id, index, 'url', data.imageUrl)
                                                              updateEditingAction(action.id, index, 'filename', 'imagem-ia.png')
                                                              updateEditingAction(action.id, index, 'caption', data.revised_prompt || prompt)
                                                            }
                                                          }
                                                        } catch (error) {
                                                          console.error('Erro ao gerar imagem:', error)
                                                        }
                                                      }}
                                                    >
                                                      <Sparkles className="w-3 h-3 mr-1" />
                                                      Gerar Imagem com IA
                                                    </Button>
                                                  </div>
                                                </div>

                                                {/* 📤 Seção de Upload Manual */}
                                                <div className={`p-3 rounded-lg border ${
                                                  actualTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Upload className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-medium">Fazer Upload</span>
                                                  </div>
                                                  <MediaUpload
                                                    type="image"
                                                    onUpload={(file, url) => {
                                                      updateEditingAction(action.id, index, 'url', url)
                                                      updateEditingAction(action.id, index, 'filename', file.name)
                                                    }}
                                                    onRemove={() => {
                                                      updateEditingAction(action.id, index, 'url', '')
                                                      updateEditingAction(action.id, index, 'filename', '')
                                                    }}
                                                    currentFile={conteudoAcao?.url}
                                                    currentFileName={conteudoAcao?.filename}
                                                    maxSizeMB={10}
                                                  />
                                                </div>

                                                <input
                                                  className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                                  value={conteudoAcao?.caption || ''}
                                                  onChange={(e) => updateEditingAction(action.id, index, 'caption', e.target.value)}
                                                  placeholder="Descrição da imagem (opcional)..."
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                              </div>
                                            )}
                                            
                                            {acao.tipo === 'audio' && (
                                              <div className="space-y-3">
                                                {/* 🎙️ Seção de Gravação Manual */}
                                                <div className={`p-3 rounded-lg border ${
                                                  actualTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Mic className="w-4 h-4 text-red-500" />
                                                    <span className="text-xs font-medium">Gravar Áudio</span>
                                                  </div>
                                                  <AudioRecorder
                                                    onAudioReady={async (file, url) => {
                                                      try {
                                                        const formData = new FormData()
                                                        formData.append('file', file)
                                                        
                                                        const response = await fetch('/api/upload/blob', {
                                                          method: 'POST',
                                                          body: formData
                                                        })
                                                        
                                                        if (response.ok) {
                                                          const { url: blobUrl } = await response.json()
                                                          const novoConteudo = {
                                                            ...conteudoAcao,
                                                            url: blobUrl,
                                                            arquivo_nome: file.name,
                                                            arquivo_tamanho: file.size,
                                                            tipo: 'audio'
                                                          }
                                                          setEditingActions(prev => {
                                                            const newState = { ...prev }
                                                            if (!newState[action.id]) return prev
                                                            const newActions = [...newState[action.id]]
                                                            newActions[index] = {
                                                              ...newActions[index],
                                                              conteudo: novoConteudo
                                                            }
                                                            return {
                                                              ...prev,
                                                              [action.id]: newActions
                                                            }
                                                          })
                                                        }
                                                      } catch (error) {
                                                        console.error('Erro ao fazer upload do áudio:', error)
                                                      }
                                                    }}
                                                    onRemove={() => {
                                                      updateEditingAction(action.id, index, 'url', '')
                                                      updateEditingAction(action.id, index, 'arquivo_nome', '')
                                                      updateEditingAction(action.id, index, 'arquivo_tamanho', 0)
                                                    }}
                                                    currentAudioUrl={conteudoAcao?.url}
                                                  />
                                                </div>

                                                {/* 🤖 Seção de Geração com IA */}
                                                <div className={`p-3 rounded-lg border ${
                                                  actualTheme === 'dark' ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
                                                }`}>
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                                    <span className="text-xs font-medium">Gerar com IA</span>
                                                  </div>
                                                  
                                                  {/* Texto para gerar áudio */}
                                                  <textarea
                                                    value={conteudoAcao?.texto_ia || ''}
                                                    onChange={(e) => updateEditingAction(action.id, index, 'texto_ia', e.target.value)}
                                                    placeholder="Digite o texto para gerar áudio com IA..."
                                                    className={`w-full px-2 py-1.5 text-xs border rounded-lg mb-2 ${
                                                      actualTheme === 'dark' 
                                                        ? 'bg-slate-800 border-slate-600 text-white' 
                                                        : 'bg-white border-gray-300'
                                                    }`}
                                                    rows={2}
                                                    onClick={(e) => e.stopPropagation()}
                                                  />

                                                  {/* Seleção de Voz */}
                                                  <div className="mb-2">
                                                    <label className="text-xs text-muted-foreground mb-1 block">Voz:</label>
                                                    <select
                                                      value={conteudoAcao?.voz_ia || 'nova'}
                                                      onChange={(e) => updateEditingAction(action.id, index, 'voz_ia', e.target.value)}
                                                      className={`w-full px-2 py-1 text-xs border rounded-lg ${
                                                        actualTheme === 'dark' 
                                                          ? 'bg-slate-800 border-slate-600 text-white' 
                                                          : 'bg-white border-gray-300'
                                                      }`}
                                                      onClick={(e) => e.stopPropagation()}
                                                    >
                                                      <option value="alloy">Alloy (Neutro)</option>
                                                      <option value="echo">Echo (Masculino)</option>
                                                      <option value="fable">Fable (Britânico)</option>
                                                      <option value="onyx">Onyx (Profundo)</option>
                                                      <option value="nova">Nova (Feminino)</option>
                                                      <option value="shimmer">Shimmer (Suave)</option>
                                                    </select>
                                                  </div>

                                                  {/* Botão Gerar */}
                                                  <Button
                                                    onClick={async (e) => {
                                                      e.stopPropagation()
                                                      const texto = conteudoAcao?.texto_ia
                                                      if (!texto?.trim()) {
                                                        alert('Digite um texto para gerar o áudio')
                                                        return
                                                      }

                                                      try {
                                                        const response = await fetch('/api/ai/generate', {
                                                          method: 'POST',
                                                          headers: { 'Content-Type': 'application/json' },
                                                          body: JSON.stringify({
                                                            prompt: texto,
                                                            type: 'audio',
                                                            voice: conteudoAcao?.voz_ia || 'nova'
                                                          })
                                                        })

                                                        if (response.ok) {
                                                          const data = await response.json()
                                                          if (data.audioUrl) {
                                                            updateEditingAction(action.id, index, 'url', data.audioUrl)
                                                            updateEditingAction(action.id, index, 'arquivo_nome', 'audio-ia.mp3')
                                                            updateEditingAction(action.id, index, 'tipo', 'audio')
                                                          }
                                                        } else {
                                                          alert('Erro ao gerar áudio com IA')
                                                        }
                                                      } catch (error) {
                                                        console.error('Erro:', error)
                                                        alert('Erro ao gerar áudio com IA')
                                                      }
                                                    }}
                                                    size="sm"
                                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                                                  >
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    Gerar Áudio com IA
                                                  </Button>
                                                </div>

                                                {/* 📁 Upload de Arquivo */}
                                                <div className={`p-3 rounded-lg border ${
                                                  actualTheme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <Upload className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-medium">Fazer Upload</span>
                                                  </div>
                                                  <input
                                                    type="file"
                                                    accept="audio/*"
                                                    onChange={async (e) => {
                                                      const file = e.target.files?.[0]
                                                      if (file) {
                                                        try {
                                                          const formData = new FormData()
                                                          formData.append('file', file)
                                                          
                                                          const response = await fetch('/api/upload/blob', {
                                                            method: 'POST',
                                                            body: formData
                                                          })
                                                          
                                                          if (response.ok) {
                                                            const { url: blobUrl } = await response.json()
                                                            updateEditingAction(action.id, index, 'url', blobUrl)
                                                            updateEditingAction(action.id, index, 'arquivo_nome', file.name)
                                                            updateEditingAction(action.id, index, 'arquivo_tamanho', file.size)
                                                          }
                                                        } catch (error) {
                                                          console.error('Erro ao fazer upload:', error)
                                                        }
                                                      }
                                                    }}
                                                    className="text-xs w-full"
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                  {conteudoAcao?.arquivo_nome && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground p-2 bg-green-500/10 rounded border border-green-500/20">
                                                      <Music className="w-3 h-3 text-green-500" />
                                                      <span className="flex-1">{conteudoAcao.arquivo_nome}</span>
                                                      {conteudoAcao?.url && (
                                                        <audio src={conteudoAcao.url} controls className="h-6" />
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            
                                            {acao.tipo === 'video' && (
                                              <div className="space-y-2">
                                                <MediaUpload
                                                  type="video"
                                                  onUpload={(file, url) => {
                                                    updateEditingAction(action.id, index, 'url', url)
                                                    updateEditingAction(action.id, index, 'filename', file.name)
                                                  }}
                                                  onRemove={() => {
                                                    updateEditingAction(action.id, index, 'url', '')
                                                    updateEditingAction(action.id, index, 'filename', '')
                                                  }}
                                                  currentFile={conteudoAcao?.url}
                                                  currentFileName={conteudoAcao?.filename}
                                                  maxSizeMB={50}
                                                />
                                                <input
                                                  className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                                  value={conteudoAcao?.caption || ''}
                                                  onChange={(e) => updateEditingAction(action.id, index, 'caption', e.target.value)}
                                                  placeholder="Descrição do vídeo (opcional)..."
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                              </div>
                                            )}
                                            
                                            {acao.tipo === 'arquivo' && (
                                              <div className="space-y-2">
                                                <div className="border-2 border-dashed border-border rounded-lg p-3">
                                                  <input
                                                    type="file"
                                                    accept="*/*"
                                                    onChange={async (e) => {
                                                      const file = e.target.files?.[0]
                                                      if (file) {
                                                        try {
                                                          const formData = new FormData()
                                                          formData.append('file', file)
                                                          
                                                          const response = await fetch('/api/upload/blob', {
                                                            method: 'POST',
                                                            body: formData
                                                          })
                                                          
                                                          if (response.ok) {
                                                            const { url: blobUrl } = await response.json()
                                                            updateEditingAction(action.id, index, 'url', blobUrl)
                                                            updateEditingAction(action.id, index, 'arquivo_nome', file.name)
                                                            updateEditingAction(action.id, index, 'arquivo_tamanho', file.size)
                                                          }
                                                        } catch (error) {
                                                          console.error('Erro ao fazer upload:', error)
                                                        }
                                                      }
                                                    }}
                                                    className="text-xs w-full"
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                  {conteudoAcao?.arquivo_nome && (
                                                    <div className="mt-2 flex items-center justify-between">
                                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <File className="w-3 h-3" />
                                                        <span>{conteudoAcao.arquivo_nome}</span>
                                                      </div>
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          updateEditingAction(action.id, index, 'url', '')
                                                          updateEditingAction(action.id, index, 'arquivo_nome', '')
                                                          updateEditingAction(action.id, index, 'arquivo_tamanho', 0)
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                      >
                                                        <X className="w-3 h-3" />
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                                <input
                                                  className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                                  value={conteudoAcao?.caption || ''}
                                                  onChange={(e) => updateEditingAction(action.id, index, 'caption', e.target.value)}
                                                  placeholder="Descrição do arquivo (opcional)..."
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                              </div>
                                            )}
                                            
                                            {acao.tipo === 'pix' && (
                                              <div className="space-y-2">
                                                <input
                                                  className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                                  value={conteudoAcao?.chave || ''}
                                                  onChange={(e) => updateEditingAction(action.id, index, 'chave', e.target.value)}
                                                  placeholder="Chave PIX..."
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                  <input
                                                    className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                                    type="number"
                                                    step="0.01"
                                                    value={conteudoAcao?.valor || ''}
                                                    onChange={(e) => updateEditingAction(action.id, index, 'valor', parseFloat(e.target.value) || 0)}
                                                    placeholder="Valor (R$)..."
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                  <input
                                                    className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                                    value={conteudoAcao?.descricao || ''}
                                                    onChange={(e) => updateEditingAction(action.id, index, 'descricao', e.target.value)}
                                                    placeholder="Descrição..."
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                            
                                            {acao.tipo === 'delay' && (
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs">Aguardar:</span>
                                                <input
                                                  className="w-16 p-1 text-xs border border-border rounded bg-background text-foreground text-center"
                                                  type="number"
                                                  min="1"
                                                  max="300"
                                                  value={conteudoAcao?.segundos || 5}
                                                  onChange={(e) => updateEditingAction(action.id, index, 'segundos', parseInt(e.target.value) || 5)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <span className="text-xs">segundos</span>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      }) || (
                                        <div className="text-xs text-muted-foreground p-2 border border-dashed rounded">
                                          Nenhuma ação encontrada para esta resposta
                                        </div>
                                      )}
                                      
                                      {/* Seletor de Categoria */}
                                      <div className="space-y-2 border-t border-border pt-3 mt-2">
                                        <label className="text-xs font-medium text-muted-foreground">Categoria:</label>
                                        <select
                                          className="w-full p-2 text-xs border border-border rounded bg-background text-foreground"
                                          value={action.originalData?.categoria_id || ''}
                                          onChange={async (e) => {
                                            const novaCategoria = e.target.value
                                            try {
                                              const token = localStorage.getItem('token')
                                              const response = await fetch(`/api/respostas-rapidas/${action.id}`, {
                                                method: 'PUT',
                                                headers: {
                                                  'Content-Type': 'application/json',
                                                  'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({
                                                  ...action.originalData,
                                                  categoria_id: novaCategoria
                                                })
                                              })
                                              
                                              if (response.ok) {
                                                fetchRespostas() // Recarregar lista
                                                alert('✅ Categoria alterada com sucesso!')
                                              } else {
                                                throw new Error('Erro ao alterar categoria')
                                              }
                                            } catch (error) {
                                              console.error('Erro ao alterar categoria:', error)
                                              alert('❌ Erro ao alterar categoria')
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {categorias?.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>
                                              {cat.nome}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Adicionar Nova Ação */}
                                      <div className="border-t pt-2">
                                        <div className="grid grid-cols-3 gap-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              addNewAction(action.id, 'texto')
                                            }}
                                            className="flex items-center justify-center gap-1 p-1 text-xs bg-blue-500/10 text-blue-600 border border-blue-200 rounded hover:bg-blue-500/20 transition-colors"
                                          >
                                            <MessageSquare className="w-3 h-3" />
                                            Texto
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              addNewAction(action.id, 'imagem')
                                            }}
                                            className="flex items-center justify-center gap-1 p-1 text-xs bg-green-500/10 text-green-600 border border-green-200 rounded hover:bg-green-500/20 transition-colors"
                                          >
                                            <ImageIcon className="w-3 h-3" />
                                            Imagem
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              addNewAction(action.id, 'audio')
                                            }}
                                            className="flex items-center justify-center gap-1 p-1 text-xs bg-purple-500/10 text-purple-600 border border-purple-200 rounded hover:bg-purple-500/20 transition-colors"
                                          >
                                            <Mic className="w-3 h-3" />
                                            Áudio
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              addNewAction(action.id, 'video')
                                            }}
                                            className="flex items-center justify-center gap-1 p-1 text-xs bg-red-500/10 text-red-600 border border-red-200 rounded hover:bg-red-500/20 transition-colors"
                                          >
                                            <Video className="w-3 h-3" />
                                            Vídeo
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              addNewAction(action.id, 'arquivo')
                                            }}
                                            className="flex items-center justify-center gap-1 p-1 text-xs bg-orange-500/10 text-orange-600 border border-orange-200 rounded hover:bg-orange-500/20 transition-colors"
                                          >
                                            <FileText className="w-3 h-3" />
                                            Arquivo
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              addNewAction(action.id, 'pix')
                                            }}
                                            className="flex items-center justify-center gap-1 p-1 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-500/20 transition-colors"
                                          >
                                            <CreditCard className="w-3 h-3" />
                                            PIX
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              addNewAction(action.id, 'delay')
                                            }}
                                            className="flex items-center justify-center gap-1 p-1 text-xs bg-gray-500/10 text-gray-600 border border-gray-200 rounded hover:bg-gray-500/20 transition-colors col-span-2"
                                          >
                                            <Clock className="w-3 h-3" />
                                            Delay
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          
                                          // Coletar dados editados
                                          const container = e.currentTarget.closest('.space-y-3')
                                          const editedActions: any[] = []
                                          
                                          container?.querySelectorAll('[data-action-index]').forEach((input: any) => {
                                            const actionIndex = parseInt(input.dataset.actionIndex)
                                            const field = input.dataset.field || 'texto'
                                            const value = input.value
                                            
                                            if (!editedActions[actionIndex]) {
                                              editedActions[actionIndex] = {
                                                ...action.originalData?.acoes[actionIndex],
                                                conteudo: {}
                                              }
                                            }
                                            
                                            if (field === 'texto') {
                                              editedActions[actionIndex].conteudo = { texto: value }
                                            } else {
                                              if (!editedActions[actionIndex].conteudo) {
                                                try {
                                                  editedActions[actionIndex].conteudo = JSON.parse(action.originalData?.acoes[actionIndex].conteudo)
                                                } catch {
                                                  editedActions[actionIndex].conteudo = {}
                                                }
                                              }
                                              editedActions[actionIndex].conteudo[field] = value
                                            }
                                          })
                                          
                                          // Usar ações editadas ou originais
                                          const finalActions = editingActions[action.id] || action.originalData?.acoes || []
                                          console.log('Executando resposta editada:', finalActions)
                                          
                                          // Preparar conteúdo completo (TODAS as ações, não só texto)
                                          console.log('🚀 Enviando FLUXO COMPLETO:', finalActions)
                                          
                                          // Extrair apenas textos para o content (compatibilidade)
                                          const textosConcatenados = finalActions
                                            .filter(a => a?.tipo === 'texto')
                                            .map(a => {
                                              const conteudo = typeof a.conteudo === 'string' ? JSON.parse(a.conteudo) : a.conteudo
                                              return conteudo?.texto || conteudo?.mensagem || ''
                                            })
                                            .join('\n')
                                          
                                          onSelectAction?.({ 
                                            ...action, 
                                            content: textosConcatenados || action.content,
                                            editedActions: finalActions // 🎯 TODAS as ações (texto + mídia)
                                          })
                                          toggleActionExpansion(action.id)
                                        }}
                                        className="h-6 px-2 text-xs bg-primary hover:bg-primary/90"
                                      >
                                        <Send className="w-2.5 h-2.5 mr-1" />
                                        Executar Resposta
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={async (e) => {
                                          e.stopPropagation()
                                          
                                          // Coletar dados editados
                                          const container = e.currentTarget.closest('.space-y-3')
                                          const editedActions: any[] = []
                                          
                                          container?.querySelectorAll('[data-action-index]').forEach((input: any) => {
                                            const actionIndex = parseInt(input.dataset.actionIndex)
                                            const field = input.dataset.field || 'texto'
                                            const value = input.value
                                            
                                            if (!editedActions[actionIndex]) {
                                              editedActions[actionIndex] = {
                                                ...action.originalData?.acoes[actionIndex],
                                                conteudo: {}
                                              }
                                            }
                                            
                                            if (field === 'texto') {
                                              editedActions[actionIndex].conteudo = { texto: value }
                                            } else {
                                              if (!editedActions[actionIndex].conteudo) {
                                                try {
                                                  editedActions[actionIndex].conteudo = JSON.parse(action.originalData?.acoes[actionIndex].conteudo)
                                                } catch {
                                                  editedActions[actionIndex].conteudo = {}
                                                }
                                              }
                                              editedActions[actionIndex].conteudo[field] = value
                                            }
                                          })
                                          
                                          try {
                                            const token = localStorage.getItem('token')
                                            
                                            console.log('🔧 Dados editados coletados:', editedActions)
                                            
                                            // Atualizar a resposta rápida existente
                                            const requestBody = {
                                              titulo: action.title, // Manter o título original
                                              categoria_id: action.originalData?.categoria_id,
                                              triggers: action.originalData?.triggers || [], // Campo obrigatório
                                              ativo: action.originalData?.ativo ?? true,
                                              automatico: action.originalData?.automatico ?? false,
                                              fallback: action.originalData?.fallback ?? false,
                                              trigger_tipo: action.originalData?.trigger_tipo || 'manual',
                                              trigger_condicao: action.originalData?.trigger_condicao,
                                              agendamento_ativo: action.originalData?.agendamento_ativo || false,
                                              delay_segundos: action.originalData?.delay_segundos || 0,
                                              repetir: action.originalData?.repetir || false,
                                              acoes: (() => {
                                                // Usar ações em edição ou as originais preservando todas
                                                const currentActions = editingActions[action.id] || action.originalData?.acoes || []
                                                console.log('🔍 Ações a serem enviadas no PUT:', currentActions)
                                                
                                                // Se houve edições via input, aplicar apenas nos campos texto
                                                if (editedActions.length > 0) {
                                                  return currentActions.map((originalAction, index) => {
                                                    const editedAction = editedActions[index]
                                                    if (editedAction && originalAction.tipo === 'texto') {
                                                      return {
                                                        ...originalAction,
                                                        conteudo: editedAction.conteudo
                                                      }
                                                    }
                                                    return originalAction
                                                  })
                                                }
                                                
                                                // Senão, retornar todas as ações atuais
                                                return currentActions.length > 0 ? currentActions : [{
                                                  tipo: 'texto',
                                                  conteudo: { texto: action.content },
                                                  delay_segundos: 0
                                                }]
                                              })()
                                            }
                                            
                                            console.log('📤 Atualizando resposta:', requestBody)
                                            
                                            const response = await fetch(`/api/respostas-rapidas/${action.id}`, {
                                              method: 'PUT',
                                              headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                              },
                                              body: JSON.stringify(requestBody)
                                            })
                                            
                                            if (response.ok) {
                                              const updatedResponse = await response.json()
                                              console.log('🔄 Resposta atualizada retornada:', updatedResponse)
                                              
                                              fetchRespostas() // Recarregar lista
                                              
                                              // Limpar ações editadas para recarregar do servidor
                                              setEditingActions(prev => {
                                                const newActions = {...prev}
                                                delete newActions[action.id]
                                                return newActions
                                              })
                                              
                                              toggleActionExpansion(action.id)
                                              
                                              // Reabrir após 500ms para garantir que dados foram recarregados
                                              setTimeout(() => {
                                                toggleActionExpansion(action.id)
                                              }, 500)
                                              
                                              alert('✅ Resposta rápida atualizada com sucesso!')
                                            } else {
                                              throw new Error('Erro ao atualizar resposta rápida')
                                            }
                                          } catch (error) {
                                            console.error('Erro ao atualizar:', error)
                                            alert('❌ Erro ao atualizar resposta rápida')
                                          }
                                        }}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Settings className="w-2.5 h-2.5 mr-1" />
                                        Atualizar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleActionExpansion(action.id)
                                        }}
                                        className="h-6 px-2 text-xs"
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Bottom Actions */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex gap-0.5 flex-wrap">
                                {/* Keywords/Tags */}
                                {(action.tags || []).slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {(action.tags || []).length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    +{(action.tags || []).length - 2}
                                  </Badge>
                                )}
                              </div>
                              {!isExpanded && (
                                <Button
                                  size="sm"   
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleActionSelect(action)
                                  }}
                                  className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90 text-xs"
                                  title="Enviar"
                                >
                                  <Send className="w-2.5 h-2.5 mr-1" />
                                  Enviar
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )})}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                className="" 
                size="sm"
                variant="outline"
                onClick={handleCreateFlowWithAI}
              >
                <Workflow className="w-3.5 h-3.5 mr-1.5" />
                Fluxo com IA
              </Button>
              <Button 
                className="" 
                size="sm"
                variant="secondary"
                onClick={handleCreateNow}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Criar Agora
              </Button>
            </div>
          </div>

          {/* Modal Criar Resposta */}
          {showCreateModal && (
            <CriarRespostaModal
              isOpen={showCreateModal}
              onClose={() => {
                setShowCreateModal(false)
                setCreateModalWithAI(false) // Reset flag IA
              }}
              categorias={categorias}
              // TODO: Adicionar funcionalidade IA ao CriarRespostaModal
              onSave={async (data) => {
                try {
                  const token = localStorage.getItem('token')
                  
                  const response = await fetch('/api/respostas-rapidas', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                  })
                  
                  if (response.ok) {
                    console.log('✅ Resposta criada com sucesso - recarregando lista...')
                    await fetchRespostas() // Recarregar lista
                    
                    // Forçar re-render aguardando um pouco
                    setTimeout(() => {
                      fetchRespostas()
                      console.log('🔄 Lista recarregada após criação')
                    }, 500)
                    
                    alert('Resposta rápida criada com sucesso!')
                    setShowCreateModal(false)
                  } else {
                    throw new Error('Erro ao criar resposta rápida')
                  }
                } catch (error) {
                  console.error('Erro ao salvar:', error)
                  alert('Erro ao criar resposta rápida')
                }
              }}
            />
          )}

          {/* Modal Criar Fluxo com IA */}
          <CriarFluxoIAModal
            isOpen={showFluxoIAModal}
            onClose={() => {
              console.log('🔒 Fechando modal CriarFluxoIAModal')
              setShowFluxoIAModal(false)
            }}
            onCreateFluxo={handleCreateFluxo}
          />

          {/* Modal EditText com IA */}
          <EditTextModal
            isOpen={showEditTextModal}
            onClose={() => {
              console.log('🔒 Fechando EditTextModal')
              setShowEditTextModal(false)
            }}
            onSend={(text) => {
              console.log('✅ Texto criado com IA:', text)
              // TODO: Salvar como resposta rápida
              setShowEditTextModal(false)
            }}
            initialText=""
            contactName="IA Assistant"
            actionTitle="Criar Resposta com IA"
          />

          {/* Modal de Agendamento */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background rounded-xl p-6 w-96 mx-4">
                <h3 className="font-bold mb-4">📅 Agendar: {selectedActionToSchedule?.title}</h3>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const form = new FormData(e.target as HTMLFormElement)
                  handleConfirmSchedule({
                    chatId: activeChatId || form.get('chatId') as string,
                    date: form.get('date') as string,
                    time: form.get('time') as string,
                  })
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Chat</label>
                    <Input 
                      name="chatId" 
                      value={activeChatId || ''}
                      placeholder="Chat ID (ex: 5519999999999@c.us)" 
                      required 
                      disabled={!!activeChatId}
                      className={activeChatId ? 'bg-gray-100 dark:bg-gray-800' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data</label>
                    <Input name="date" type="date" required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Horário</label>
                    <Input name="time" type="time" required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)} className="flex-1">Cancelar</Button>
                    <Button type="submit" className="flex-1">Agendar</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
