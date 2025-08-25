'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRespostasRapidas } from '@/hooks/useRespostasRapidas'
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
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// Badge component inline
const Badge = ({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary' | 'outline'; 
  className?: string 
}) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
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
}

interface QuickActionsSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSelectAction: (action: QuickAction) => void
  selectedContact?: any
  activeChatId?: string // Chat ativo atual
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
  activeChatId
}: QuickActionsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))
  
  const { respostas, categorias, fetchRespostas, fetchCategorias, togglePauseResposta, executeResposta } = useRespostasRapidas()

  useEffect(() => {
    if (isOpen) {
      fetchRespostas()
      fetchCategorias()
    }
  }, [isOpen, fetchRespostas, fetchCategorias])
  // Converter respostas da API para formato QuickAction
  const quickActions = respostas.map(resposta => {
   
    // trigger_tipo !== 'manual' significa que é automático
    const isAutomatic = resposta.trigger_tipo !== 'manual' && resposta.ativo && !resposta.pausado
    
    return {
      id: resposta.id,
      title: resposta.titulo,
      content: resposta.acoes.find(a => a.tipo === 'texto')?.conteudo?.texto || resposta.descricao || '',
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

  const handleToggleAutomatic = async (action: QuickAction, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await togglePauseResposta(action.id, !action.isPaused)
      // Recarregar dados
      fetchRespostas()
    } catch (error) {
      console.error('Erro ao alterar status da resposta:', error)
    }
  }

  const handleCreateWithAI = () => {
    // TODO: Implementar modal de criação com IA
    console.log('Criar resposta com IA')
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
      case 'text': return 'bg-blue-100 text-blue-700'
      case 'pix': return 'bg-green-100 text-green-700'
      case 'image': return 'bg-purple-100 text-purple-700'
      case 'audio': return 'bg-orange-100 text-orange-700'
      case 'video': return 'bg-red-100 text-red-700'
      case 'document': return 'bg-gray-100 text-gray-700'
      default: return 'bg-blue-100 text-blue-700'
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
          className={`fixed top-0 left-0 h-full w-[520px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-gray-200 z-50 pt-20`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Respostas Rápidas</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
         

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar ações rápidas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-1 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="whitespace-nowrap text-xs"
              >
                Todas
              </Button>
              {categorias.map(categoria => (
                <Button
                  key={categoria.id}
                  variant={selectedCategory === categoria.nome ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(categoria.nome)}
                  className="whitespace-nowrap text-xs"
                >
                  {categoria.nome}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions List */}
          <div className="flex-1 overflow-y-auto p-4">
            {Object.entries(groupedActions).map(([category, actions]) => (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-700">{category}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {actions.length}
                  </Badge>
                </button>

                <AnimatePresence>
                  {expandedCategories.has(category) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-6 space-y-2 mt-2">
                        {actions.map(action => (
                          <motion.div
                            key={action.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActionSelect(action)}
                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${getTypeColor(action.type)}`}>
                                  {getTypeIcon(action.type)}
                                </div>
                                <span className="font-medium text-gray-900 text-sm">
                                  {action.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {/* Status da auto-resposta */}
                                <button
                                  onClick={(e) => handleToggleAutomatic(action, e)}
                                  className={`p-1 rounded-full transition-colors ${
                                    action.isAutomatic 
                                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                      : action.isPaused 
                                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                                  title={action.isAutomatic ? 'Auto-resposta ativa' : action.isPaused ? 'Pausada' : 'Inativa'}
                                >
                                  {action.isAutomatic ? (
                                    <Zap className="w-3 h-3" />
                                  ) : action.isPaused ? (
                                    <Clock className="w-3 h-3" />
                                  ) : (
                                    <Zap className="w-3 h-3" />
                                  )}
                                </button>
                                <span className="text-xs text-gray-500">
                                  {action.usageCount}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {action.content}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex gap-1 flex-wrap">
                                {/* Status Badge */}
                                {action.isAutomatic && (
                                  <Badge className="text-xs px-1 py-0 bg-green-100 text-green-700">
                                    Auto
                                  </Badge>
                                )}
                                {action.isPaused && (
                                  <Badge className="text-xs px-1 py-0 bg-yellow-100 text-yellow-700">
                                    Pausada
                                  </Badge>
                                )}
                                {/* Keywords/Tags */}
                                {(action.tags || []).slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {(action.tags || []).length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    +{(action.tags || []).length - 2}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Enviar agora"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Button className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Ação Rápida
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
