'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  GitBranch, 
  Zap, 
  MessageSquare, 
  Download, 
  Users, 
  ArrowRight, 
  Clock, 
  Target, 
  Webhook, 
  BarChart3, 
  Filter, 
  Settings, 
  Calendar, 
  PlusCircle, 
  DollarSign, 
  Timer, 
  CheckCircle, 
  Copy, 
  AlertCircle, 
  FileText, 
  MessageCircle, 
  Brain, 
  Eye, 
  Shield,
  Tag,
  UserCheck,
  Building,
  Hash,
  Shuffle, 
  Volume2, 
  Phone, 
  MapPin, 
  ChevronDown, 
  ChevronRight, 
  Upload, 
  Plus, 
  Bot, 
  Bell, 
  Send, 
  Database, 
  X, 
  Info,
  Edit,
  UserPlus,
  Grid3X3
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'

// Types for Flow Nodes - TappyOne Específico
export type NodeType = 
  // ========== TRIGGERS (11) ==========
  | 'trigger-whatsapp-message'    // Mensagem WhatsApp recebida
  | 'trigger-whatsapp-media'      // Mídia WhatsApp recebida  
  | 'trigger-keyword'             // Palavra-chave específica
  | 'trigger-menu-list'           // Menu com múltiplas opções
  | 'trigger-time-schedule'       // Agendamento de tempo
  | 'trigger-webhook'             // Webhook externo
  | 'trigger-user-action'         // Ação do usuário
  | 'trigger-system-event'        // Evento do sistema
  | 'trigger-login-system'        // Login no sistema
  | 'trigger-flow-start'          // Início do fluxo
  | 'trigger-conexao-created'      // Conexão criada
  // ========== GATILHOS SISTEMA (10) ==========
  | 'trigger-contato-created'      // Contato criado no sistema
  | 'trigger-agendamento-created'  // Agendamento criado
  | 'trigger-quadro-created'       // Quadro Kanban criado
  | 'trigger-coluna-created'       // Coluna Kanban criada
  | 'trigger-agendamento-created'  // Agendamento criado
  | 'trigger-schedule'             // Data/hora específica
  
  // ========== GATILHOS KANBAN (2) ==========
  | 'trigger-kanban-move'          // Card movido no Kanban
  | 'trigger-kanban-created'       // Card criado no Kanban
  
  // ========== CONDIÇÕES (12) ==========
  | 'condition-if'                 // Condição Se/Então geral
  | 'condition-text-contains'      // Texto contém palavra
  | 'condition-time-range'         // Horário/dia específico
  | 'condition-contact-field'      // Campo do contato
  | 'condition-message-type'       // Tipo de mensagem (texto, áudio, imagem)
  | 'condition-contact-tag'        // Se contato tem tag específica
  | 'condition-contact-status'     // Status do contato (ativo, inativo)
  | 'condition-queue-assignment'   // Se contato está em fila específica
  | 'condition-business-hours'     // Horário comercial
  | 'condition-last-message-time'  // Tempo desde última mensagem
  | 'condition-conversation-count' // Número de conversas do contato
  | 'condition-random'             // Condição aleatória (A/B testing)
  
  // ========== AÇÕES WHATSAPP (7) ==========
  | 'action-whatsapp-text'         // Enviar texto
  | 'action-whatsapp-media'        // Enviar mídia
  | 'action-whatsapp-template'     // Template aprovado
  | 'action-whatsapp-location'     // Enviar localização
  | 'action-whatsapp-contact'      // Cartão de contato
  | 'action-whatsapp-list'         // Enviar menu de lista
  | 'action-whatsapp-event'        // Enviar evento/agendamento
  
  // ========== AÇÕES KANBAN (3) ==========
  | 'action-kanban-create'         // Criar card
  | 'action-kanban-move'           // Mover card
  | 'action-kanban-update'         // Atualizar card
  
  // ========== AÇÕES CONTATOS (5) ==========
  | 'action-contact-create'        // Criar contato
  | 'action-contact-update'        // Atualizar contato
  | 'action-contact-add-tag'       // Adicionar tag ao contato
  | 'action-contact-merge'         // Unir contatos duplicados
  | 'action-multi'                 // Múltiplas ações em sequência
  
  // ========== AÇÕES CRM (4) ==========
  | 'action-agendamento-create'    // Criar agendamento
  | 'action-orcamento-create'      // Gerar orçamento
  | 'action-assinatura-create'     // Criar assinatura
  | 'action-business-update'       // Atualizar dados empresa
  
  // ========== AÇÕES FILAS (3) ==========
  | 'action-fila-assign'           // Atribuir à fila
  | 'action-fila-transfer'         // Transferir fila
  | 'action-fila-close'            // Fechar atendimento
  
  // ========== AÇÕES IA & AUTOMAÇÃO (4) ==========
  | 'action-ia-process'            // Processar com IA
  | 'action-resposta-rapida'       // Resposta rápida
  | 'action-ia-classify'           // Classificar automaticamente
  | 'action-ia-sentiment'          // Análise de sentimento
  
  // ========== AÇÕES SISTEMA ADMIN (8) ==========
  | 'action-conexao-create'        // Criar conexão WhatsApp
  | 'action-fila-create'           // Criar fila de atendimento
  | 'action-atendente-assign'      // Atribuir atendente à fila
  | 'action-quadro-create'         // Criar quadro Kanban
  | 'action-coluna-create'         // Criar coluna Kanban
  | 'action-tag-create'            // Criar tag no sistema
  | 'action-ticket-assign'         // Atribuir ticket a atendente
  | 'action-contato-assign'        // Atribuir contato à fila/atendente
  
  // ========== AÇÕES SISTEMA (3) ==========
  | 'action-delay-wait'            // Aguardar tempo
  | 'action-webhook-call'          // Chamar webhook
  | 'action-notification-send'     // Enviar notificação
  
  // ========== ENCERRAMENTO (6) ==========
  | 'end-success'                  // Encerrar com sucesso
  | 'end-error'                    // Encerrar com erro
  | 'end-timeout'                  // Encerrar por timeout
  | 'end-user-cancel'              // Usuário cancelou
  | 'end-condition-met'            // Condição de parada atingida
  | 'end-manual-stop'              // Parada manual

export interface FluxoNodeData {
  id: string
  type: NodeType
  label: string
  description?: string
  config?: Record<string, any>
  position: { x: number, y: number }
}

// Node configurations
export const NODE_TYPES: Record<NodeType, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  color: string
  category: 'trigger' | 'condition' | 'action' | 'end'
}> = {
  // ============= TRIGGERS =============
  'trigger-whatsapp-message': {
    icon: MessageCircle,
    label: 'Nova Mensagem WhatsApp',
    description: 'Quando receber mensagem no WhatsApp',
    color: 'green',
    category: 'trigger'
  },
  
  'trigger-whatsapp-media': {
    icon: Download,
    label: 'Mídia WhatsApp',
    description: 'Quando receber foto/vídeo/áudio',
    color: 'green',
    category: 'trigger'
  },
  
  'trigger-menu-list': {
    icon: Grid3X3,
    label: 'Menu Lista',
    description: 'Menu interativo com múltiplas opções e ações',
    color: 'orange',
    category: 'trigger'
  },
  
  'trigger-login-system': {
    icon: UserCheck,
    label: 'Login no Sistema',
    description: 'Quando usuário fizer login no sistema',
    color: 'purple',
    category: 'trigger'
  },
  
  'trigger-flow-start': {
    icon: Play,
    label: 'Início do Fluxo',
    description: 'Quando o fluxo for iniciado manualmente',
    color: 'blue',
    category: 'trigger'
  },
  
  'trigger-contato-created': {
    icon: Users,
    label: 'Contato Criado',
    description: 'Quando criar novo contato no sistema',
    color: 'blue',
    category: 'trigger'
  },
  
  'trigger-conexao-created': {
    icon: Zap,
    label: 'Conexão Criada',
    description: 'Quando criar nova conexão WhatsApp',
    color: 'green',
    category: 'trigger'
  },
  
  'trigger-fila-created': {
    icon: Users,
    label: 'Fila Criada',
    description: 'Quando criar nova fila de atendimento',
    color: 'cyan',
    category: 'trigger'
  },
  
  'trigger-atendente-created': {
    icon: UserPlus,
    label: 'Atendente Criado',
    description: 'Quando adicionar novo atendente',
    color: 'indigo',
    category: 'trigger'
  },
  
  'trigger-ticket-created': {
    icon: AlertCircle,
    label: 'Ticket Criado',
    description: 'Quando abrir novo ticket',
    color: 'red',
    category: 'trigger'
  },
  
  'trigger-tag-created': {
    icon: Target,
    label: 'Tag Criada',
    description: 'Quando criar nova tag',
    color: 'purple',
    category: 'trigger'
  },
  
  'trigger-quadro-created': {
    icon: Grid3X3,
    label: 'Quadro Criado',
    description: 'Quando criar novo quadro Kanban',
    color: 'blue',
    category: 'trigger'
  },
  
  'trigger-coluna-created': {
    icon: Plus,
    label: 'Coluna Criada',
    description: 'Quando criar nova coluna no Kanban',
    color: 'blue',
    category: 'trigger'
  },
  
  'trigger-agendamento-created': {
    icon: Calendar,
    label: 'Agendamento Criado',
    description: 'Quando criar novo agendamento',
    color: 'teal',
    category: 'trigger'
  },
  
  'trigger-kanban-created': {
    icon: PlusCircle,
    label: 'Card Criado',
    description: 'Quando criar novo card no Kanban',
    color: 'blue',
    category: 'trigger'
  },
  
  'trigger-kanban-move': {
    icon: ArrowRight,
    label: 'Card Movido',
    description: 'Quando mover card no Kanban',
    color: 'purple',
    category: 'trigger'
  },
  
  'trigger-schedule': {
    icon: Clock,
    label: 'Agendamento',
    description: 'Em data/hora específica',
    color: 'orange',
    category: 'trigger'
  },
  
  'trigger-keyword': {
    icon: Target,
    label: 'Palavra-chave',
    description: 'Quando detectar palavra específica',
    color: 'red',
    category: 'trigger'
  },
  
  'trigger-webhook': {
    icon: Zap,
    label: 'Webhook Recebido',
    description: 'Quando receber chamada externa',
    color: 'yellow',
    category: 'trigger'
  },

  // ============= CONDITIONS =============
  'condition-if': {
    icon: GitBranch,
    label: 'Se/Então',
    description: 'Avalia condição verdadeiro/falso',
    color: 'yellow',
    category: 'condition'
  },
  
  'condition-text-contains': {
    icon: Filter,
    label: 'Contém Texto',
    description: 'Se mensagem contém texto específico',
    color: 'yellow',
    category: 'condition'
  },
  
  'condition-time-range': {
    icon: Clock,
    label: 'Horário',
    description: 'Baseado em hora/dia da semana',
    color: 'yellow',
    category: 'condition'
  },
  
  'condition-contact-field': {
    icon: Users,
    label: 'Campo do Contato',
    description: 'Baseado em dados do contato',
    color: 'yellow',
    category: 'condition'
  },

  'condition-message-type': {
    icon: MessageSquare,
    label: 'Tipo de Mensagem',
    description: 'Verifica se é texto, áudio, imagem, etc.',
    color: 'yellow',
    category: 'condition'
  },

  'condition-contact-tag': {
    icon: Tag,
    label: 'Tag do Contato',
    description: 'Se contato possui tag específica',
    color: 'yellow',
    category: 'condition'
  },

  'condition-contact-status': {
    icon: UserCheck,
    label: 'Status do Contato',
    description: 'Verifica se contato está ativo/inativo',
    color: 'yellow',
    category: 'condition'
  },

  'condition-queue-assignment': {
    icon: Users,
    label: 'Fila de Atendimento',
    description: 'Se contato está em fila específica',
    color: 'yellow',
    category: 'condition'
  },

  'condition-business-hours': {
    icon: Building,
    label: 'Horário Comercial',
    description: 'Verifica se está em horário comercial',
    color: 'yellow',
    category: 'condition'
  },

  'condition-last-message-time': {
    icon: Clock,
    label: 'Tempo da Última Mensagem',
    description: 'Baseado no tempo desde última mensagem',
    color: 'yellow',
    category: 'condition'
  },

  'condition-conversation-count': {
    icon: Hash,
    label: 'Número de Conversas',
    description: 'Quantidade de conversas do contato',
    color: 'yellow',
    category: 'condition'
  },

  'condition-random': {
    icon: Shuffle,
    label: 'Condição Aleatória',
    description: 'Para testes A/B e distribuição aleatória',
    color: 'yellow',
    category: 'condition'
  },

  // ============= ACTIONS - WhatsApp =============
  'action-whatsapp-text': {
    icon: MessageCircle,
    label: 'Enviar Texto WhatsApp',
    description: 'Envia mensagem de texto',
    color: 'green',
    category: 'action'
  },
  
  'action-whatsapp-media': {
    icon: Upload,
    label: 'Enviar Mídia WhatsApp',
    description: 'Envia foto, vídeo ou áudio',
    color: 'green',
    category: 'action'
  },
  
  'action-whatsapp-template': {
    icon: FileText,
    label: 'Template WhatsApp',
    description: 'Envia template pré-aprovado',
    color: 'green',
    category: 'action'
  },
  
  'action-whatsapp-location': {
    icon: MapPin,
    label: 'Enviar Localização',
    description: 'Envia localização via WhatsApp',
    color: 'green',
    category: 'action'
  },
  
  'action-whatsapp-contact': {
    icon: Users,
    label: 'Cartão de Contato',
    description: 'Envia cartão de contato',
    color: 'green',
    category: 'action'
  },
  
  'action-whatsapp-list': {
    icon: Grid3X3,
    label: 'Enviar Menu Lista',
    description: 'Envia menu interativo com opções',
    color: 'green',
    category: 'action'
  },
  
  'action-whatsapp-event': {
    icon: Calendar,
    label: 'Enviar Evento',
    description: 'Envia convite de evento/agendamento',
    color: 'green',
    category: 'action'
  },

  // ============= ACTIONS - Kanban =============
  'action-kanban-create': {
    icon: Plus,
    label: 'Criar Card Kanban',
    description: 'Cria novo card no quadro',
    color: 'blue',
    category: 'action'
  },
  
  'action-kanban-move': {
    icon: ArrowRight,
    label: 'Mover Card Kanban',
    description: 'Move card para outra coluna',
    color: 'blue',
    category: 'action'
  },
  
  'action-kanban-update': {
    icon: Edit,
    label: 'Atualizar Card',
    description: 'Atualiza dados do card',
    color: 'blue',
    category: 'action'
  },

  // ============= ACTIONS - Contatos =============
  'action-contact-create': {
    icon: UserPlus,
    label: 'Criar Contato',
    description: 'Cria novo contato no sistema',
    color: 'indigo',
    category: 'action'
  },
  
  'action-contact-update': {
    icon: Users,
    label: 'Atualizar Contato',
    description: 'Modifica dados do contato',
    color: 'indigo',
    category: 'action'
  },
  
  'action-contact-add-tag': {
    label: 'Adicionar Tag ao Contato',
    icon: Tag,
    category: 'action',
    color: 'bg-green-500',
    description: 'Adiciona uma tag específica ao contato'
  },
  
  'action-multi': {
    label: 'Múltiplas Ações',
    icon: Plus,
    category: 'action',
    color: 'bg-purple-500',
    description: 'Executa múltiplas ações em sequência'
  },
  
  'action-contact-merge': {
    icon: Copy,
    label: 'Unir Contatos',
    description: 'Une contatos duplicados',
    color: 'indigo',
    category: 'action'
  },

  // ============= ACTIONS - IA e Automação =============
  'action-ia-process': {
    icon: Bot,
    label: 'Processar com IA',
    description: 'Analisa com agente de IA',
    color: 'purple',
    category: 'action'
  },
  
  'action-resposta-rapida': {
    icon: Zap,
    label: 'Resposta Rápida',
    description: 'Executa resposta pré-definida',
    color: 'orange',
    category: 'action'
  },

  // ============= ACTIONS - Agendamentos e Vendas =============
  'action-agendamento-create': {
    icon: Calendar,
    label: 'Criar Agendamento',
    description: 'Agenda compromisso automaticamente',
    color: 'cyan',
    category: 'action'
  },
  
  'action-orcamento-create': {
    icon: FileText,
    label: 'Gerar Orçamento',
    description: 'Cria proposta comercial',
    color: 'teal',
    category: 'action'
  },
  
  'action-assinatura-create': {
    icon: FileText,
    label: 'Criar Assinatura',
    description: 'Cria nova assinatura/contrato',
    color: 'purple',
    category: 'action'
  },
  
  'action-business-update': {
    icon: Settings,
    label: 'Atualizar Empresa',
    description: 'Atualiza dados da empresa',
    color: 'gray',
    category: 'action'
  },

  // ============= ACTIONS - Filas =============
  'action-fila-assign': {
    icon: Users,
    label: 'Atribuir à Fila',
    description: 'Direciona para fila específica',
    color: 'cyan',
    category: 'action'
  },
  
  'action-fila-transfer': {
    icon: ArrowRight,
    label: 'Transferir Fila',
    description: 'Move entre filas de atendimento',
    color: 'cyan',
    category: 'action'
  },
  
  'action-fila-close': {
    icon: CheckCircle,
    label: 'Fechar Atendimento',
    description: 'Finaliza o atendimento',
    color: 'cyan',
    category: 'action'
  },

  // ============= ACTIONS - IA & Automação =============
  'action-ia-classify': {
    icon: Brain,
    label: 'Classificar com IA',
    description: 'Classifica automaticamente',
    color: 'purple',
    category: 'action'
  },
  
  'action-ia-sentiment': {
    icon: Eye,
    label: 'Análise de Sentimento',
    description: 'Analisa humor da mensagem',
    color: 'purple',
    category: 'action'
  },

  // ============= ACTIONS - Sistema =============
  'action-delay-wait': {
    icon: Clock,
    label: 'Aguardar',
    description: 'Pausa por tempo determinado',
    color: 'gray',
    category: 'action'
  },
  
  'action-webhook-call': {
    icon: Send,
    label: 'Chamar Webhook',
    description: 'Faz requisição para API externa',
    color: 'yellow',
    category: 'action'
  },
  
  'action-notification-send': {
    icon: Bell,
    label: 'Enviar Notificação',
    description: 'Notifica usuários do sistema',
    color: 'pink',
    category: 'action'
  },

  // ============= ACTIONS - Sistema Admin =============
  'action-conexao-create': {
    icon: Zap,
    label: 'Criar Conexão',
    description: 'Cria nova conexão WhatsApp',
    color: 'green',
    category: 'action'
  },
  
  'action-fila-create': {
    icon: Users,
    label: 'Criar Fila',
    description: 'Cria nova fila de atendimento',
    color: 'cyan',
    category: 'action'
  },
  
  'action-atendente-assign': {
    icon: UserPlus,
    label: 'Atribuir Atendente',
    description: 'Adiciona atendente à fila',
    color: 'indigo',
    category: 'action'
  },
  
  'action-quadro-create': {
    icon: Grid3X3,
    label: 'Criar Quadro',
    description: 'Cria novo quadro Kanban',
    color: 'blue',
    category: 'action'
  },
  
  'action-coluna-create': {
    icon: Plus,
    label: 'Criar Coluna',
    description: 'Adiciona coluna ao Kanban',
    color: 'blue',
    category: 'action'
  },
  
  'action-tag-create': {
    icon: Target,
    label: 'Criar Tag',
    description: 'Cria nova tag no sistema',
    color: 'purple',
    category: 'action'
  },
  
  'action-ticket-assign': {
    icon: AlertCircle,
    label: 'Atribuir Ticket',
    description: 'Atribui ticket a atendente',
    color: 'red',
    category: 'action'
  },
  
  'action-contato-assign': {
    icon: Users,
    label: 'Atribuir Contato',
    description: 'Atribui contato à fila/atendente',
    color: 'indigo',
    category: 'action'
  },

  // ============= ENCERRAMENTO =============
  'end-success': {
    icon: CheckCircle,
    label: 'Encerrar com Sucesso',
    description: 'Finaliza fluxo com sucesso',
    color: 'green',
    category: 'end'
  },
  
  'end-error': {
    icon: AlertCircle,
    label: 'Encerrar com Erro',
    description: 'Finaliza fluxo por erro',
    color: 'red',
    category: 'end'
  },
  
  'end-timeout': {
    icon: Timer,
    label: 'Encerrar por Timeout',
    description: 'Finaliza fluxo por tempo limite',
    color: 'orange',
    category: 'end'
  },
  
  'end-user-cancel': {
    icon: X,
    label: 'Usuário Cancelou',
    description: 'Finaliza porque usuário cancelou',
    color: 'gray',
    category: 'end'
  },
  
  'end-condition-met': {
    icon: Target,
    label: 'Condição de Parada',
    description: 'Finaliza ao atingir condição',
    color: 'blue',
    category: 'end'
  },
  
  'end-manual-stop': {
    icon: Shield,
    label: 'Parada Manual',
    description: 'Finaliza por intervenção manual',
    color: 'purple',
    category: 'end'
  }
}

// Node Palette Component
export function NodePalette({ onNodeSelect }: { onNodeSelect: (nodeType: NodeType) => void }) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  
  // Estado para controlar categorias expandidas
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    trigger: false,
    condition: false, 
    action: false,
    end: false
  })
  
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  const categories = {
    trigger: { label: 'Gatilhos', icon: Play },
    condition: { label: 'Condições', icon: GitBranch },
    action: { label: 'Ações', icon: Zap },
    end: { label: 'Encerramento', icon: Shield }
  }

  return (
    <div className={`w-80 flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Fixed Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Componentes
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Arraste para adicionar ao fluxo
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const nodeTypes = Object.entries(NODE_TYPES).filter(([_, config]) => 
            config.category === categoryKey
          )

          return (
            <div key={categoryKey} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleCategory(categoryKey)}
              >
                <div className="flex items-center space-x-2">
                  <categoryInfo.icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h4 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {categoryInfo.label} ({nodeTypes.length})
                  </h4>
                </div>
                
                <motion.div
                  animate={{ rotate: expandedCategories[categoryKey] ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedCategories[categoryKey] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {nodeTypes.map(([nodeType, config]) => (
                        <NodePaletteItem
                          key={nodeType}
                          nodeType={nodeType as NodeType}
                          config={config}
                          onSelect={onNodeSelect}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Node Palette Item
function NodePaletteItem({ 
  nodeType, 
  config, 
  onSelect 
}: { 
  nodeType: NodeType
  config: typeof NODE_TYPES[NodeType]
  onSelect: (nodeType: NodeType) => void
}) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(nodeType)}
      className={`p-3 rounded-lg border transition-all group cursor-pointer min-h-[70px] ${
        isDark 
          ? 'border-gray-600 hover:border-blue-500 bg-gray-800/80 hover:bg-gray-700' 
          : 'border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50'
      } shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center space-x-3 h-full">
        <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
          config.color === 'green' ? 'bg-green-100 text-green-600' :
          config.color === 'blue' ? 'bg-blue-100 text-blue-600' :
          config.color === 'purple' ? 'bg-purple-100 text-purple-600' :
          config.color === 'orange' ? 'bg-orange-100 text-orange-600' :
          config.color === 'red' ? 'bg-red-100 text-red-600' :
          config.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
          config.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
          config.color === 'pink' ? 'bg-pink-100 text-pink-600' :
          config.color === 'gray' ? 'bg-gray-100 text-gray-600' :
          config.color === 'teal' ? 'bg-teal-100 text-teal-600' :
          config.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
          'bg-slate-100 text-slate-600'
        }`}>
          <config.icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h5 className={`text-sm font-medium mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {config.label}
          </h5>
          <p className={`text-xs leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {config.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Flow Node Component
export function FlowNode({ 
  data, 
  selected = false, 
  onSelect, 
  onEdit, 
  onDelete,
  onDragStart,
  onConnectionStart,
  onConnectionEnd,
  isDragging = false
}: {
  data: FluxoNodeData
  selected?: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDragStart?: (nodeId: string, e: React.MouseEvent) => void
  onConnectionStart?: (nodeId: string, e: React.MouseEvent) => void
  onConnectionEnd?: (targetNodeId: string) => void
  isDragging?: boolean
}) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const config = NODE_TYPES[data.type]

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      onDragStart?.(data.id, e)
    }
  }

  const handleConnectionStart = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onConnectionStart(nodeId, e)
  }

  const handleConnectionEnd = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onConnectionEnd(nodeId, e)
  }

  return (
    <motion.div
      key={data.id}
      drag
      dragMomentum={false}
      onDragStart={(e, info) => onDragStart?.(data.id, e, info)}
      className={`
        absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 cursor-move
        transition-all duration-200 hover:shadow-xl
        ${data.config?.isMiniNode 
          ? 'min-w-[180px] max-w-[180px]' 
          : 'min-w-[200px]'
        }
        ${isSelected 
          ? 'border-blue-500 shadow-blue-200 dark:shadow-blue-900' 
          : isDark 
            ? 'border-gray-600 hover:border-gray-500' 
            : 'border-gray-200 hover:border-gray-300'
        }
      `}
      style={{ 
        left: data.position.x, 
        top: data.position.y,
        zIndex: isSelected ? 50 : data.config?.isMiniNode ? 5 : 10 
      }}
      whileHover={{ scale: data.config?.isMiniNode ? 1.01 : 1.02 }}
      whileDrag={{ scale: data.config?.isMiniNode ? 1.03 : 1.05, zIndex: 100 }}
    >
      {/* Bordinha colorida para mini-nodes */}
      {data.config?.isMiniNode && data.config?.borderColor && (
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-${data.config.borderColor}-500`}
        />
      )}
      
      <div className={`${data.config?.isMiniNode ? 'p-3' : 'p-4'} rounded-xl shadow-lg ${
        data.config?.isMiniNode 
          ? 'min-w-[180px] max-w-[180px]'
          : 'min-w-[200px]'
      } ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {data.config?.isMiniNode ? (
              <div className={`p-1.5 rounded-md bg-${data.config.borderColor}-100 text-${data.config.borderColor}-600`}>
                <config.icon className="w-3 h-3" />
              </div>
            ) : (
              <div className={`p-2 rounded-lg bg-${config.color}-100 text-${config.color}-600`}>
                <config.icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h4 className={`${data.config?.isMiniNode ? 'text-xs' : 'text-sm'} font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data.config?.isMiniNode && data.config?.optionTitle 
                  ? data.config.optionTitle 
                  : data.label}
              </h4>
              {data.config?.isMiniNode && (
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Opção {(data.config?.optionIndex || 0) + 1}
                </p>
              )}
            </div>
          </div>
          
          {selected && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(data.id) }}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <Settings className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(data.id) }}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          )}
        </div>

        {/* Node Description */}
        {data.description && (
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {data.description}
          </p>
        )}

        {/* Node Status/Config Indicators */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {data.config && Object.keys(data.config).length > 0 && (
              <span className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Settings className="w-3 h-3" />
                <span>Configurado</span>
              </span>
            )}
          </div>
          
          <div className={`px-2 py-1 rounded text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
            {config.category}
          </div>
        </div>

        {/* Connection Points */}
        {/* Input connection point (left) - Only show if node can receive connections */}
        {config.category !== 'trigger' && (
          <div 
            className={`absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center group ${
              isDark ? 'border-blue-400 bg-blue-900 hover:border-blue-300 hover:bg-blue-800' : 'border-blue-500 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
            }`}
            onMouseUp={handleDropTarget}
            title="Ponto de entrada - Recebe conexões"
          >
            <div className={`w-2 h-2 rounded-full transition-all ${
              isDark ? 'bg-blue-400 group-hover:bg-blue-300' : 'bg-blue-500 group-hover:bg-blue-600'
            }`}></div>
          </div>
        )}
        
        {/* Output connection point (right) - Only show if node can send connections */}
        {config.category !== 'action' || data.type.includes('action') ? (
          <div 
            className={`absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center group ${
              isDark ? 'border-green-400 bg-green-900 hover:border-green-300 hover:bg-green-800 hover:scale-110' : 'border-green-500 bg-green-50 hover:border-green-400 hover:bg-green-100 hover:scale-110'
            }`}
            onClick={handleConnectionClick}
            title="Clique para conectar a outro nó"
          >
            <ArrowRight className={`w-3 h-3 transition-all ${
              isDark ? 'text-green-400 group-hover:text-green-300' : 'text-green-500 group-hover:text-green-600'
            }`} />
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

// Node Configuration Modal
export function NodeConfigModal({ 
  nodeType, 
  config, 
  onSave, 
  onClose 
}: {
  nodeType: NodeType
  config?: Record<string, any>
  onSave: (config: Record<string, any>) => void
  onClose: () => void
}) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const nodeConfig = NODE_TYPES[nodeType]
  const [formData, setFormData] = React.useState(config || {})

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderConfigForm = () => {
    switch (nodeType) {
      // ============= TRIGGERS =============
      case 'trigger-whatsapp-message':
        return (
          <div className="space-y-4">
            {/* Filtros de Origem */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🎯 Filtros de Origem (Onde o fluxo deve ser ativado)
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Filtro por Conexão */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Conexão WhatsApp específica
                  </label>
                  <select
                    value={formData.connectionId || ''}
                    onChange={(e) => updateField('connectionId', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Qualquer conexão</option>
                    <option value="main">Conexão Principal</option>
                    <option value="vendas">WhatsApp Vendas</option>
                    <option value="suporte">WhatsApp Suporte</option>
                  </select>
                </div>

                {/* Filtro por Fila */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fila de atendimento específica
                  </label>
                  <select
                    value={formData.queueId || ''}
                    onChange={(e) => updateField('queueId', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Qualquer fila</option>
                    <option value="vendas">Fila Vendas</option>
                    <option value="suporte">Fila Suporte</option>
                    <option value="financeiro">Fila Financeiro</option>
                  </select>
                </div>

                {/* Filtro por Chat Específico */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Chat específico (ChatID)
                  </label>
                  <input
                    type="text"
                    value={formData.specificChatId || ''}
                    onChange={(e) => updateField('specificChatId', e.target.value)}
                    placeholder="Ex: 5519999999999@c.us"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                {/* Filtro por Telefone */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Telefone específico do cliente
                  </label>
                  <input
                    type="text"
                    value={formData.specificPhone || ''}
                    onChange={(e) => updateField('specificPhone', e.target.value)}
                    placeholder="Ex: 5519999999999 (apenas números)"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>
            </div>

            {/* Filtros de Conteúdo */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                💬 Filtros de Conteúdo (O que a mensagem deve conter)
              </h4>
              
              <div className="space-y-3">
                {/* Palavra-chave */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Filtrar por palavra-chave (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.keyword || ''}
                    onChange={(e) => updateField('keyword', e.target.value)}
                    placeholder="Ex: orçamento, contrato, dúvida"
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                {/* Tipo de chat */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de chat
                  </label>
                  <select
                    value={formData.chatType || 'all'}
                    onChange={(e) => updateField('chatType', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="all">Todos (Individual + Grupos)</option>
                    <option value="individual">Apenas Chats Individuais</option>
                    <option value="group">Apenas Grupos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Opções Avançadas */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ⚙️ Opções Avançadas
              </h4>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.ignoreBots || false}
                    onChange={(e) => updateField('ignoreBots', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ignorar mensagens de bots
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.onlyFirstMessage || false}
                    onChange={(e) => updateField('onlyFirstMessage', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Apenas primeira mensagem do contato
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.ignoreForwarded || false}
                    onChange={(e) => updateField('ignoreForwarded', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ignorar mensagens encaminhadas
                  </span>
                </label>
              </div>
            </div>

            {/* Resumo das Configurações */}
            {(formData.connectionId || formData.queueId || formData.specificChatId || formData.specificPhone || formData.keyword) && (
              <div className={`p-3 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <h5 className={`text-xs font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  📋 Resumo: Este fluxo será ativado quando:
                </h5>
                <ul className={`text-xs space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
                  {formData.connectionId && <li>• Conexão: {formData.connectionId}</li>}
                  {formData.queueId && <li>• Fila: {formData.queueId}</li>}
                  {formData.specificChatId && <li>• Chat específico: {formData.specificChatId}</li>}
                  {formData.specificPhone && <li>• Telefone específico: {formData.specificPhone}</li>}
                  {formData.keyword && <li>• Mensagem contém: "{formData.keyword}"</li>}
                  <li>• Tipo de chat: {formData.chatType === 'individual' ? 'Individual' : formData.chatType === 'group' ? 'Grupos' : 'Todos'}</li>
                </ul>
              </div>
            )}
          </div>
        )
        
      case 'trigger-keyword':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Palavras-chave *
              </label>
              <input
                type="text"
                value={formData.keywords || ''}
                onChange={(e) => updateField('keywords', e.target.value)}
                placeholder="orçamento, contrato, preço (separar por vírgula)"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.caseSensitive || false}
                  onChange={(e) => updateField('caseSensitive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Diferenciar maiúsculas/minúsculas
                </span>
              </label>
            </div>
          </div>
        )

      case 'trigger-schedule':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Tipo de agendamento *
              </label>
              <select
                value={formData.scheduleType || 'once'}
                onChange={(e) => updateField('scheduleType', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="once">Uma vez</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>
            {formData.scheduleType === 'once' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.datetime || ''}
                  onChange={(e) => updateField('datetime', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>
            )}
          </div>
        )

      // ============= CONDITIONS =============
      case 'condition-text-contains':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Texto a procurar *
              </label>
              <input
                type="text"
                value={formData.searchText || ''}
                onChange={(e) => updateField('searchText', e.target.value)}
                placeholder="Texto que deve estar presente na mensagem"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.exactMatch || false}
                  onChange={(e) => updateField('exactMatch', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Correspondência exata
                </span>
              </label>
            </div>
          </div>
        )

      case 'condition-time-range':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Horário de funcionamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={formData.startTime || '09:00'}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <input
                  type="time"
                  value={formData.endTime || '18:00'}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Dias da semana
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, idx) => (
                  <label key={day} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={(formData.weekDays || []).includes(idx)}
                      onChange={(e) => {
                        const days = formData.weekDays || []
                        if (e.target.checked) {
                          updateField('weekDays', [...days, idx])
                        } else {
                          updateField('weekDays', days.filter((d: number) => d !== idx))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {day}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      // ============= ACTIONS =============
      case 'action-whatsapp-text':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Mensagem *
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder="Digite a mensagem que será enviada..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.useTemplate || false}
                  onChange={(e) => updateField('useTemplate', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Usar variáveis ({'{{nome}}, {{telefone}}'}, etc.)
                </span>
              </label>
            </div>
          </div>
        )

      case 'action-kanban-move':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Quadro de destino
              </label>
              <select
                value={formData.boardId || ''}
                onChange={(e) => updateField('boardId', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Selecionar quadro...</option>
                <option value="vendas">Vendas</option>
                <option value="suporte">Suporte</option>
                <option value="projetos">Projetos</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Coluna de destino
              </label>
              <select
                value={formData.columnId || ''}
                onChange={(e) => updateField('columnId', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Selecionar coluna...</option>
                <option value="leads">Leads</option>
                <option value="contato">Primeiro Contato</option>
                <option value="proposta">Proposta</option>
                <option value="negociacao">Negociação</option>
                <option value="fechado">Fechado</option>
              </select>
            </div>
          </div>
        )

      case 'action-whatsapp-list':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Título do Menu *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ex: Menu de Atendimento"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Descrição
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Ex: Escolha uma opção abaixo"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Texto do Botão
              </label>
              <input
                type="text"
                value={formData.buttonText || 'Escolher'}
                onChange={(e) => updateField('buttonText', e.target.value)}
                placeholder="Ex: Escolher, Selecionar"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Opções do Menu *
              </label>
              <textarea
                value={formData.options || ''}
                onChange={(e) => updateField('options', e.target.value)}
                placeholder="Uma opção por linha:\nSuporte\nVendas\nAgendamento"
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Digite uma opção por linha
              </p>
            </div>
          </div>
        )

      case 'action-whatsapp-event':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Nome do Evento *
              </label>
              <input
                type="text"
                value={formData.eventName || ''}
                onChange={(e) => updateField('eventName', e.target.value)}
                placeholder="Ex: Reunião de Apresentação"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Descrição do Evento
              </label>
              <textarea
                value={formData.eventDescription || ''}
                onChange={(e) => updateField('eventDescription', e.target.value)}
                placeholder="Descreva o evento..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Local
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Ex: Online - Google Meet"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Data/Hora Início *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime || ''}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Data/Hora Fim
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime || ''}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        )

      case 'action-delay-wait':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Tempo de espera
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={formData.delayValue || 1}
                  onChange={(e) => updateField('delayValue', parseInt(e.target.value))}
                  min="1"
                  className={`px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <select
                  value={formData.delayUnit || 'minutes'}
                  onChange={(e) => updateField('delayUnit', e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="seconds">Segundos</option>
                  <option value="minutes">Minutos</option>
                  <option value="hours">Horas</option>
                  <option value="days">Dias</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'trigger-whatsapp-media':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Tipos de mídia aceitos
              </label>
              <div className="space-y-2">
                {['imagem', 'video', 'audio', 'documento'].map(tipo => (
                  <label key={tipo} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.mediaTypes || []).includes(tipo)}
                      onChange={(e) => {
                        const types = formData.mediaTypes || []
                        if (e.target.checked) {
                          updateField('mediaTypes', [...types, tipo])
                        } else {
                          updateField('mediaTypes', types.filter((t: string) => t !== tipo))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'action-whatsapp-media':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Tipo de mídia *
              </label>
              <select
                value={formData.mediaType || ''}
                onChange={(e) => updateField('mediaType', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              >
                <option value="">Selecionar tipo...</option>
                <option value="image">Imagem</option>
                <option value="video">Vídeo</option>
                <option value="audio">Áudio</option>
                <option value="document">Documento</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                URL do arquivo ou nome do arquivo local
              </label>
              <input
                type="text"
                value={formData.mediaUrl || ''}
                onChange={(e) => updateField('mediaUrl', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg ou arquivo.jpg"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Legenda (opcional)
              </label>
              <textarea
                value={formData.caption || ''}
                onChange={(e) => updateField('caption', e.target.value)}
                placeholder="Legenda para acompanhar a mídia..."
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        )
        
      case 'action-ia-process':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Agente de IA *
              </label>
              <select
                value={formData.agentId || ''}
                onChange={(e) => updateField('agentId', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              >
                <option value="">Selecionar agente...</option>
                <option value="atendimento">Agente de Atendimento</option>
                <option value="vendas">Agente de Vendas</option>
                <option value="suporte">Agente de Suporte</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Prompt personalizado (opcional)
              </label>
              <textarea
                value={formData.customPrompt || ''}
                onChange={(e) => updateField('customPrompt', e.target.value)}
                placeholder="Instrução específica para esta situação..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        )
        
      case 'action-resposta-rapida':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Resposta rápida *
              </label>
              <select
                value={formData.quickReplyId || ''}
                onChange={(e) => updateField('quickReplyId', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              >
                <option value="">Selecionar resposta...</option>
                <option value="boas-vindas">Boas-vindas</option>
                <option value="horario-funcionamento">Horário de Funcionamento</option>
                <option value="solicitar-orcamento">Solicitar Orçamento</option>
                <option value="agendar-reuniao">Agendar Reunião</option>
              </select>
            </div>
          </div>
        )

      // Default form para outros tipos
      default:
        return (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
            <Info className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Configurações básicas para <strong>{nodeConfig.label}</strong>
            </p>
            <div className="text-left space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Nome personalizado (opcional)
                </label>
                <input
                  type="text"
                  value={formData.customName || ''}
                  onChange={(e) => updateField('customName', e.target.value)}
                  placeholder={`Ex: ${nodeConfig.label} Principal`}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Observações
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Notas sobre esta etapa do fluxo..."
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`p-6 rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-3 rounded-lg bg-${nodeConfig.color}-100 text-${nodeConfig.color}-600`}>
            <nodeConfig.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Configurar {nodeConfig.label}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {nodeConfig.description}
            </p>
          </div>
        </div>

        {/* Node Content */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <config.icon className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
            <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {config.label}
            </h3>
          </div>
          
          {/* Renderização especial para Menu Lista */}
          {data.type === 'trigger-menu-list' && data.config?.menuOptions?.length > 0 ? (
            <div className="space-y-2">
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {data.config.menuTitle || 'Menu Interativo'}
              </p>
              <div className="space-y-1">
                {data.config.menuOptions.map((option: any, index: number) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-orange-700 text-orange-100' : 'bg-orange-200 text-orange-800'
                      }`}>
                        {option.key || (index + 1)}
                      </span>
                      <span className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {option.text || 'Opção sem nome'}
                      </span>
                    </div>
                    
                    {/* Mini output connection point para cada opção */}
                    <div
                      className={`w-3 h-3 rounded-full border-2 cursor-pointer transition-colors ${
                        isDark 
                          ? 'bg-gray-600 border-gray-500 hover:bg-orange-500 hover:border-orange-400' 
                          : 'bg-white border-orange-300 hover:bg-orange-500 hover:border-orange-600'
                      }`}
                      onMouseDown={(e) => handleConnectionStart(data.id, e)}
                      title={`Conectar opção: ${option.text}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : data.type === 'action-whatsapp-list' && data.config?.listOptions?.length > 0 ? (
            <div className="space-y-2">
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {data.config.listTitle || 'Menu WhatsApp'}
              </p>
              <div className="space-y-1">
                {data.config.listOptions.map((option: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-2 rounded border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {option.title || 'Opção sem título'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {config.description}
            </p>
          )}
        </div>

        {renderConfigForm()}

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Salvar Configurações
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
