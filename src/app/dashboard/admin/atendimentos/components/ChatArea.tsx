'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import MediaSendModal from '@/components/ui/MediaSendModal'
import SpecialMediaModal from '@/components/ui/SpecialMediaModal'
import AudioMessageComponent from '@/components/AudioMessageComponent'
import EditTextModal from './EditTextModal'
import {
  MessageCircle, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile, 
  Image, 
  FileText, 
  Mic,
  X,
  Calendar,
  DollarSign,
  Tag,
  User,
  FileVideo,
  Volume2,
  Download,
  Copy,
  Forward,
  Reply,
  Trash2,
  Edit,
  Star,
  Maximize2,
  Minimize2,
  MapPin,
  PhoneCall,
  Users,
  Share,
  Languages,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  ExternalLink,
  Info,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Bot,
  UserCheck,
  Eye,
  EyeOff,
  MessageSquare,
  Archive,
  ArrowRightLeft,
  Wifi,
  WifiOff,
  FileSignature,
  StickyNote,
  Hash,
  Monitor,
  AudioLines,
  Check,
  CheckCheck,
  Upload,
  ImageIcon,
  Contact,
  Square,
  Expand,
  Ticket,
  Users2
} from 'lucide-react'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { useAudioRecorder, formatDuration, blobToFile } from '@/hooks/useAudioRecorder'
import { usePresence } from '@/hooks/usePresence'
import EmojiPicker from '@/components/EmojiPicker'
import { MessageContextMenu } from '@/components/MessageContextMenu'
import { EditMessageModal } from '@/components/EditMessageModal'
import ForwardMessageModal from '@/components/ForwardMessageModal'
import MessageContent from '@/components/MessageContent'
import InputLinkPreview from '@/components/InputLinkPreview'
import { useMessageActions } from '@/hooks/useMessageActions'
import UniversalAgendamentoModal, { type AgendamentoData as UniversalAgendamentoData } from '@/components/shared/UniversalAgendamentoModal'
import CriarOrcamentoModal from '../../orcamentos/components/CriarOrcamentoModal'
import AssinaturaModal from './modals/AssinaturaModal'
import TagsModal from './modals/TagsModal'
import VideoChamadaModal from './modals/VideoChamadaModal'
import LigacaoModal from './modals/LigacaoModal'
import TransferirAtendimentoModal from './modals/TransferirAtendimentoModal'
import CompartilharTelaModal from './modals/CompartilharTelaModal'
import TicketModal from './modals/TicketModal'
import QuickActionsSidebar from './QuickActionsSidebar'
import AnotacoesSidebar from './AnotacoesSidebar'
import AgenteSelectionModal from './modals/AgenteSelectionModal'
import { useChatAgente } from '@/hooks/useChatAgente'
import { useDeepSeekAutoResponse } from '@/hooks/useDeepSeekAutoResponse'
import CreateContactModal from '../../contatos/components/CreateContactModal'

interface ChatAreaProps {
  conversation: any
  messages: any[]
  onSendMessage: (message: string) => void
  onTyping?: (chatId: string, isTyping: boolean) => void
  onMarkAsRead?: (chatId: string) => void
  isLoading?: boolean
  isTyping?: boolean
  isQuickActionsSidebarOpen?: boolean
  onToggleQuickActionsSidebar?: () => void
  isAnotacoesSidebarOpen?: boolean
  onToggleAnotacoesSidebar?: () => void
  // Contadores dos badges
  notesCount?: number,
  orcamentosCount?: number,
  agendamentosCount?: number,
  assinaturasCount?: number,
  contactStatus?: 'synced' | 'error'
  // Indicador de nova mensagem
  newMessageReceived?: boolean
  onNewMessageSeen?: () => void
}



// Função para transformar mensagens da WAHA API para o formato do componente
const transformMessages = (wahaMessages: any[]) => {
  return wahaMessages.map(msg => ({
    id: msg.id,
    content: msg.body || '',
    timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    sender: msg.fromMe ? 'agent' : 'user',
    status: msg.status || 'sent',
    type: msg.processedType || msg.type || 'text', // Usar processedType do backend primeiro
    mediaUrl: msg.mediaUrl || msg.url || null,
    filename: msg.filename || msg.name || null,
    mimetype: msg.mimetype || null
  }))
}

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  onTyping,
  onMarkAsRead,
  isLoading = false,
  isTyping = false,
  isQuickActionsSidebarOpen = false,
  onToggleQuickActionsSidebar,
  isAnotacoesSidebarOpen = false,
  onToggleAnotacoesSidebar,
  notesCount = 0,
  orcamentosCount = 0,
  agendamentosCount = 0,
  assinaturasCount = 0,
  contactStatus,
  newMessageReceived = false,
  onNewMessageSeen
}: ChatAreaProps) {
  const [message, setMessage] = useState('')
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [kanbanInfo, setKanbanInfo] = useState<{quadro: string, coluna: string, color: string} | null>(null)
  const [conexaoFilaInfo, setConexaoFilaInfo] = useState<any>(null)
  const [showAgenteModal, setShowAgenteModal] = useState(false)
  
  // Função para extrair chatId
  const extractChatId = (conversation: any): string | null => {
    if (typeof conversation?.id === 'string') {
      return conversation.id
    } else if (conversation?.id && (conversation.id as any)._serialized) {
      return (conversation.id as any)._serialized
    }
    return null
  }
  
  // Extrair chatId primeiro
  const chatId = useMemo(() => {
    const id = extractChatId(conversation)
    // Transformar chatId para o formato usado no sistema de tags
    if (id) {
      // Se contém @c.us, remove para usar como contato_id
      if (id.includes('@c.us')) {
        return id.replace('@c.us', '')
      }
      return id
    }
    return null
  }, [conversation])
  
  
  const { startTyping, stopTyping, isOnline, isTyping: isContactTyping, getChatPresence } = usePresence()
  const { ativo: agenteAtivo, agente: agenteAtual, refetch: refetchAgente } = useChatAgente(conversation?.id)
  
  // Sistema de tags igual ao ConversationSidebar
  const [contatoTags, setContatoTags] = useState<any[]>([])
  const [tagsLoading, setTagsLoading] = useState(false)
  
  // Função para buscar tags (igual aos tickets)
  const fetchContatoTags = useCallback(async () => {
    if (!chatId) return
    
    try {
      setTagsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      // Usar mesmo formato que os tickets: remover @c.us
      const numeroTelefone = chatId.replace('@c.us', '')
      
      // Buscar tags usando contato_id como parâmetro (igual aos tickets)
      const response = await fetch(`/api/contatos/${numeroTelefone}/tags`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const tags = data.data || data || []
        setContatoTags(Array.isArray(tags) ? tags : [])
      } else {
        // Se não encontrar, não é erro - apenas não tem tags ainda
        setContatoTags([])
      }
    } catch (error) {
      console.error('❌ [CHATAREA] Erro ao buscar tags:', error)
      setContatoTags([])
    } finally {
      setTagsLoading(false)
    }
  }, [chatId])
  
  // Função para atualizar tags (igual aos tickets)
  const updateContatoTags = useCallback(async (selectedTags: any[]) => {
    if (!chatId) return
    
    try {
      setTagsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')
      
      // Usar mesmo formato que os tickets: remover @c.us e usar contato_id como parâmetro
      const numeroTelefone = chatId.replace('@c.us', '')
      const tagIds = selectedTags.map(tag => tag.id)
      
      console.log('🏷️ [CHATAREA] Atualizando tags:', { numeroTelefone, tagIds })
      
      // Salvar tags usando contato_id como parâmetro (igual aos tickets)
      const response = await fetch(`/api/contatos/${numeroTelefone}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tagIds })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      console.log('✅ [CHATAREA] Tags atualizadas com sucesso')
      setContatoTags(selectedTags)
      return true
    } catch (error) {
      console.error('❌ [CHATAREA] Erro ao atualizar tags:', error)
      throw error
    } finally {
      setTagsLoading(false)
    }
  }, [chatId])
  
  // Carregar tags quando chatId mudar
  useEffect(() => {
    fetchContatoTags()
  }, [fetchContatoTags])
  
  
  // Hook para auto-resposta com DeepSeek
  const { isGenerating, processNewMessage } = useDeepSeekAutoResponse({
    agenteAtivo,
    agenteAtual,
    chatId,
    onSendMessage
  })
  
  // Função para buscar informações do quadro e coluna
  const getKanbanInfo = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      
      // Buscar todos os quadros do usuário
      const quadrosResponse = await fetch(`/api/kanban/quadros`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!quadrosResponse.ok) {
        return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
      }
      
      const quadros = await quadrosResponse.json()
      
      // Para cada quadro, buscar os metadados para encontrar o chat
      for (const quadro of quadros) {
        try {
          const metadataResponse = await fetch(`/api/kanban/${quadro.id}/metadata`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json()
            const cardMetadata = metadata.cards || {}
            
            // Verificar se o chat está neste quadro
            if (cardMetadata[chatId]) {
              const cardInfo = cardMetadata[chatId]
              
              // Buscar informações completas do quadro (incluindo colunas)
              const quadroResponse = await fetch(`/api/kanban/quadros/${quadro.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              
              if (quadroResponse.ok) {
                const quadroCompleto = await quadroResponse.json()
                const coluna = quadroCompleto.colunas?.find((col: any) => col.id === cardInfo.colunaId)
                
                return {
                  quadro: quadro.nome,
                  coluna: coluna?.nome || 'Coluna desconhecida',
                  color: coluna?.cor || '#d1d5db' // Usar a cor exata da coluna
                }
              }
            }
          }
        } catch (error) {
        }
      }
      
      return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
    } catch (error) {
      console.error('Erro ao buscar informações do Kanban:', error)
      return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
    }
  }
  
  
  // Carregar informações do Kanban quando a conversa mudar
  useEffect(() => {
    const loadKanbanInfo = async () => {
      if (conversation) {
        const chatId = extractChatId(conversation)
        if (chatId) {
          const info = await getKanbanInfo(chatId)
          setKanbanInfo(info)
        }
      }
    }
    
    loadKanbanInfo()
  }, [conversation])

  // Carregar informações de conexão/fila quando a conversa mudar
  useEffect(() => {
    const loadConexaoFilaInfo = async () => {
      if (conversation && chatId) {
        try {
          const token = localStorage.getItem('token')
          if (!token) return

          // Usar o número limpo para a busca (sem @c.us)
          const contatoId = chatId.replace('@c.us', '')
          
          const response = await fetch(`/api/conexoes/contato/${contatoId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          })
          
          if (response.ok) {
            const result = await response.json()
            setConexaoFilaInfo({
              hasConnection: !!result.conexao,
              isConnected: result.conexao?.status === 'connected',
              conexao: result.conexao ? {
                id: result.conexao.id,
                sessionName: result.conexao.session_name,
                status: result.conexao.status
              } : null,
              fila: result.fila ? {
                id: result.fila.id,
                nome: result.fila.nome,
                cor: result.fila.cor
              } : null,
              atendentes: result.atendentes || []
            })
          }
        } catch (error) {
          console.error('Erro ao carregar dados de conexão/fila:', error)
        }
      }
    }
    
    loadConexaoFilaInfo()
  }, [conversation, chatId])
  
  // Hook de tradução
  const { translateMessage, translateMessages, selectedLanguage, setSelectedLanguage, isTranslating } = useTranslation()
  
  // Hook de favoritos
  const { isStarred, toggleStar, loading: favoritesLoading } = useFavorites(chatId)

  // Estado para mensagens traduzidas
  const [translatedMessages, setTranslatedMessages] = useState<{[messageId: string]: string}>({})
  const [translatingMessages, setTranslatingMessages] = useState<Set<string>>(new Set())
  
  // Transformar mensagens da WAHA API para o formato do componente
  const transformedMessages = transformMessages(messages || [])
  
  // DEBUG: Limpar console após 20s e mostrar apenas dados relevantes
  useEffect(() => {
    const debugTimer = setTimeout(() => {
      console.clear()
      console.log('🔍 ANÁLISE APÓS 20s - DETECÇÃO DE TIPOS:')
      console.log('═══════════════════════════════════════════')
      
      if (messages && messages.length > 0) {
        messages.slice(0, 10).forEach((m, i) => {
          const hasMediaUrl = !!(m as any).mediaUrl
          const isDocument = hasMediaUrl && (
            (m as any).mediaUrl?.includes('.pdf') || 
            (m as any).mediaUrl?.includes('.doc') || 
            (m as any).mediaUrl?.includes('.docx') ||
            (m as any).mediaUrl?.includes('.txt') ||
            (m as any).mediaUrl?.includes('.xls')
          )
          const isLocation = !!(m.type === 'location' || (m as any).location)
          const isPoll = !!(m.type === 'poll' || (m as any).poll)
          const hasLocationKeywords = m.content && (
            m.content.toLowerCase().includes('latitude') || 
            m.content.toLowerCase().includes('localização') ||
            m.content.toLowerCase().includes('location')
          )
          const hasPollKeywords = m.content && m.content.toLowerCase().includes('enquete')
          
          // Só mostrar mensagens interessantes
          if (hasMediaUrl || isLocation || isPoll || hasLocationKeywords || hasPollKeywords) {
            console.log(`📝 MSG ${i + 1}:`, {
              type: m.type,
              mediaUrl: hasMediaUrl ? (m as any).mediaUrl.substring(0, 50) + '...' : null,
              content: m.content ? m.content.substring(0, 40) + '...' : null,
              location: (m as any).location,
              poll: (m as any).poll,
              filename: (m as any).filename || (m as any).fileName,
              isDocument,
              isLocation, 
              isPoll,
              hasLocationKeywords,
              hasPollKeywords,
              DEVERIA_RENDERIZAR_ESPECIAL: isDocument || isLocation || isPoll || hasLocationKeywords || hasPollKeywords
            })
          }
        })
      }
      console.log('═══════════════════════════════════════════')
    }, 20000)
    
    return () => clearTimeout(debugTimer)
  }, [messages])
  
  // Usar mensagens traduzidas se disponíveis, senão usar originais
  const displayMessages = translatedMessages.length > 0 ? translatedMessages : transformedMessages
  
  // Escutar mudanças de idioma
  useEffect(() => {
    const handleLanguageChange = async (event: CustomEvent) => {
      const { languageCode } = event.detail
      setSelectedLanguage(languageCode)
      
      if (languageCode === 'pt' || languageCode === 'pt-BR') {
        // Voltar ao português original
        setTranslatedMessages([])
      } else {
        // Traduzir mensagens para o novo idioma
        const translated = await translateMessages(transformedMessages, languageCode)
        setTranslatedMessages(translated)
      }
    }

    window.addEventListener('languageChanged', handleLanguageChange as EventListener)
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
    }
  }, [transformedMessages, translateMessages, setSelectedLanguage])
  
  // Traduzir mensagens apenas quando chat ativo mudar ou idioma mudar
  const lastTranslationRef = useRef<{ chatId: string | null, language: string, messageCount: number }>({ 
    chatId: null, 
    language: 'pt-BR', 
    messageCount: 0 
  })
  
  useEffect(() => {
    const shouldTranslate = (
      selectedLanguage !== 'pt' && 
      selectedLanguage !== 'pt-BR' && 
      transformedMessages.length > 0 &&
      (
        lastTranslationRef.current.chatId !== chatId ||
        lastTranslationRef.current.language !== selectedLanguage ||
        lastTranslationRef.current.messageCount !== transformedMessages.length
      )
    )
    
    if (shouldTranslate) {
      
      translateMessages(transformedMessages, selectedLanguage).then(translated => {
        setTranslatedMessages(translated)
        
        // Atualizar referência para evitar traduções desnecessárias
        lastTranslationRef.current = {
          chatId,
          language: selectedLanguage,
          messageCount: transformedMessages.length
        }
      }).catch(error => {
        console.error('❌ Erro na tradução:', error)
      })
    } else if (selectedLanguage === 'pt' || selectedLanguage === 'pt-BR') {
      // Limpar traduções quando voltar ao português
      setTranslatedMessages([])
      lastTranslationRef.current = {
        chatId,
        language: selectedLanguage,
        messageCount: transformedMessages.length
      }
    }
  }, [chatId, selectedLanguage, transformedMessages.length])
  const [showQuickActions, setShowQuickActions] = useState(false)
  
  // Estados para mídia
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null)
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | 'document' | null>(null)
  
  // Estados para modais
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false)
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false)
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showVideoChamadaModal, setShowVideoChamadaModal] = useState(false)
  const [showLigacaoModal, setShowLigacaoModal] = useState(false)
  const [showTransferirModal, setShowTransferirModal] = useState(false)
  const [showCompartilharTelaModal, setShowCompartilharTelaModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showCreateContactModal, setShowCreateContactModal] = useState(false)
  const [showLeadInfoModal, setShowLeadInfoModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
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
  
  // Estados para novas funcionalidades
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  
  // 🚀 LAZY LOADING DE MENSAGENS (igual WhatsApp Web)
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(5) // Começar com 5 mensagens
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false)
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false)
  
  // Filtrar mensagens baseado na busca
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    
    const filtered = messages.filter(message => {
      const body = message.body?.toLowerCase() || ''
      const text = message.text?.toLowerCase() || ''
      const content = message.content?.toLowerCase() || ''
      const searchTerm = searchQuery.toLowerCase()
      
      const matches = body.includes(searchTerm) || text.includes(searchTerm) || content.includes(searchTerm)
      
      if (matches) {
      }
      
      return matches
    }).map(message => ({
      ...message,
      matchText: message.body || message.text || message.content || ''
    }))
    
    return filtered
  }, [messages, searchQuery])
  
  // 🚀 LAZY LOADING: Mostrar apenas as últimas N mensagens (igual WhatsApp Web)
  const lazyDisplayMessages = useMemo(() => {
    if (!displayMessages || displayMessages.length === 0) return []
    
    // Pegar apenas as últimas visibleMessagesCount mensagens
    const messagesToShow = displayMessages.slice(-visibleMessagesCount)
    
    console.log(`📱 [LAZY LOADING] Mostrando ${messagesToShow.length} de ${displayMessages.length} mensagens`)
    
    return messagesToShow
  }, [displayMessages, visibleMessagesCount])
  
  // Reset visibleMessagesCount quando trocar de chat
  useEffect(() => {
    setVisibleMessagesCount(5) // Reset para 5 mensagens iniciais
    setShowNewMessageIndicator(false)
  }, [conversation?.id])
  
  // Função para carregar mais mensagens (scroll para cima)
  const loadMoreMessages = useCallback(() => {
    if (isLoadingMoreMessages || visibleMessagesCount >= messages.length) return
    
    setIsLoadingMoreMessages(true)
    
    // Simular loading (em produção, seria uma API call)
    setTimeout(() => {
      setVisibleMessagesCount(prev => Math.min(prev + 20, messages.length))
      setIsLoadingMoreMessages(false)
      console.log(`📱 [LAZY LOADING] Carregadas mais mensagens. Total visível: ${Math.min(visibleMessagesCount + 20, messages.length)}`)
    }, 300)
  }, [isLoadingMoreMessages, visibleMessagesCount, messages.length])
  
  // 🔄 AUTO-SCROLL para novas mensagens + Lazy Loading no scroll up
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      
      // Se scroll está no topo (carregamento de mensagens antigas)
      if (scrollTop === 0 && visibleMessagesCount < displayMessages.length) {
        console.log(`📱 [LAZY LOADING] Usuário no topo, carregando mais mensagens...`)
        loadMoreMessages()
      }
      
      // Se usuário não está no final, mostrar indicador de nova mensagem
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      if (!isAtBottom && showNewMessageIndicator) {
        setShowNewMessageIndicator(true)
      } else if (isAtBottom) {
        setShowNewMessageIndicator(false)
      }
    }
    
    chatContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [loadMoreMessages, visibleMessagesCount, displayMessages.length, showNewMessageIndicator])
  
  // 🔄 AUTO-SCROLL quando nova mensagem chega
  useEffect(() => {
    if (!messages || messages.length === 0) return
    
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return
    
    // Se está no final da conversa, fazer scroll automático
    const { scrollTop, scrollHeight, clientHeight } = chatContainer
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    
    if (isAtBottom) {
      // Auto-scroll suave para nova mensagem
      setTimeout(() => {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    } else {
      // Mostrar indicador de nova mensagem
      setShowNewMessageIndicator(true)
    }
  }, [messages.length]) // Trigger quando nova mensagem chega
  
  // Navegar entre resultados
  const navigateToMatch = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return
    
    let newIndex
    if (direction === 'next') {
      newIndex = (currentMatchIndex + 1) % searchResults.length
    } else {
      newIndex = currentMatchIndex === 0 ? searchResults.length - 1 : currentMatchIndex - 1
    }
    
    setCurrentMatchIndex(newIndex)
    
    // Scroll para a mensagem
    const targetMessage = searchResults[newIndex]
    if (targetMessage?.id) {
      const element = document.getElementById(`message-${targetMessage.id}`)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        })
        
        // Highlight temporário
        element.style.backgroundColor = '#fef3c7'
        setTimeout(() => {
          element.style.backgroundColor = ''
        }, 2000)
      }
    }
  }
  
  // Reset busca
  const resetSearch = () => {
    setShowSearch(false)
    setSearchQuery('')
    setCurrentMatchIndex(0)
  }
  const [isSearching, setIsSearching] = useState(false)
  const [showMediaModal, setShowMediaModal] = useState<'contact' | 'location' | 'poll' | null>(null)
  const [showSendMediaModal, setShowSendMediaModal] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const [messageToForward, setMessageToForward] = useState<any>(null)
  
  // Estados para envio de mídia com modal
  const [showMediaSendModal, setShowMediaSendModal] = useState(false)
  const [mediaSendType, setMediaSendType] = useState<'image' | 'video' | 'document'>('image')
  const [detectedLink, setDetectedLink] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<any>(null)

  // Função para buscar mensagens
  const handleSearchMessages = async (query: string) => {
    if (!query.trim() || !conversation) return
    
    setIsSearching(true)
    setSearchQuery(query)
    
    try {
      const chatId = extractChatId(conversation)
      if (!chatId) return
      
      // Buscar nas mensagens carregadas (usar displayMessages para incluir traduzidas)
      // Busca é feita via useMemo searchResults baseado em searchQuery
      // Não precisamos de setSearchResults aqui
      
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    } finally {
      setIsSearching(false)
    }
  }
  const [editingMessage, setEditingMessage] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditTextModal, setShowEditTextModal] = useState(false)
  const [editingText, setEditingText] = useState('')
  const [editingAction, setEditingAction] = useState<any>(null)
  const [starredMessages, setStarredMessages] = useState<Set<string>>(() => {
    // Carregar mensagens favoritadas do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`starredMessages_${conversation?.id}`)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
  
  // Hook para ações de mensagem
  const messageActions = useMessageActions({ 
    chatId, 
    onMessageUpdate: () => {
      // Forçar re-render das mensagens
      if (onMarkAsRead && chatId) {
        onMarkAsRead(chatId)
      }
    }
  })
  
  // Hooks para mídia
  const mediaUpload = useMediaUpload()
  const attachmentModalRef = useRef<HTMLDivElement>(null)
  const audioRecorder = useAudioRecorder()
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const isAtBottom = () => {
    if (!chatContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    return scrollHeight - scrollTop - clientHeight < 50 // 50px de tolerância
  }

  useEffect(() => {
    // Só faz auto-scroll se o usuário estiver no final do chat
    if (!isUserScrolling && isAtBottom()) {
      scrollToBottom()
    }
  }, [messages, isUserScrolling])

  // TEMPORARIAMENTE DESABILITADO - Marcar mensagens como vistas quando o chat é aberto ou mensagens mudam
  // useEffect(() => {
  //   if (messages && messages.length > 0 && conversation) {
  //     // Filtrar mensagens não vistas do contato (não do agente)
  //     const unseenMessages = messages
  //       .filter(msg => msg.sender !== 'agent' && !(msg as any).seen)
  //       .map(msg => msg.id || (msg as any)._data?.id?.id)
  //       .filter(Boolean)
      
  //     if (unseenMessages.length > 0) {
  //       // Aguardar um pouco antes de marcar como visto para simular leitura
  //       const timer = setTimeout(() => {
  //         markMessagesAsSeen(unseenMessages)
  //       }, 1000)
        
  //       return () => clearTimeout(timer)
  //     }
  //   }
  // }, [messages, conversation])

  // Scroll inicial para o final quando conversa carrega
  useEffect(() => {
    if (messages.length > 0) {
      // Pequeno delay para garantir que o DOM foi renderizado
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [conversation?.id])

  // Monitorar novas mensagens para auto-resposta com IA
  useEffect(() => {
    if (!agenteAtivo || !messages || messages.length === 0) return

    // Pegar a última mensagem
    const lastMessage = messages[messages.length - 1]
    
    // Se a última mensagem não é nossa (fromMe = false ou sender !== 'agent') e tem conteúdo
    if (lastMessage && lastMessage.sender !== 'agent' && lastMessage.content && lastMessage.content.trim().length > 0) {
      
      // Processar mensagem para auto-resposta (usando mensagens transformadas)
      const messageForProcessing = {
        fromMe: false,
        body: lastMessage.content,
        id: lastMessage.id,
        timestamp: new Date().getTime()
      }
      
      // Passar histórico de mensagens também
      processNewMessage(messageForProcessing, messages)
    }
  }, [messages, agenteAtivo, processNewMessage])

  // Detectar quando usuário está fazendo scroll manual
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      setIsUserScrolling(true)
      
      // Reset após 2 segundos de inatividade
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 2000)
    }

    chatContainer.addEventListener('scroll', handleScroll)
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAttachmentMenu && attachmentModalRef.current) {
        const target = event.target as HTMLElement
        if (!attachmentModalRef.current.contains(target) && !target.closest('[data-attachment-button]')) {
          setShowAttachmentMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAttachmentMenu])

  // Handler para seleção de arquivos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Resetar o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = ''

    // Definir tipo baseado no arquivo selecionado
    let fileType = type
    if (type === 'file') {
      // Detectar tipo específico baseado no MIME type
      if (file.type.startsWith('image/')) {
        fileType = 'image'
      } else if (file.type.startsWith('video/')) {
        fileType = 'video'
      }
    }

    // Abrir modal de mídia com o arquivo selecionado
    setSelectedMediaFile(file)
    setSelectedMediaType(fileType as any)
    setShowSendMediaModal(true)
  }

  // Handler para favoritar/desfavoritar mensagem
  const toggleStarred = async (messageId: string) => {
    if (!chatId) return
    
    const isCurrentlyStarred = starredMessages.has(messageId)
    const action = isCurrentlyStarred ? 'unstar' : 'star'
    
    console.log(`⭐ FAVORITOS - ${action} mensagem:`, messageId)
    
    try {
      // Atualizar estado local imediatamente para feedback visual
      setStarredMessages(prev => {
        const newStarred = new Set(prev)
        if (isCurrentlyStarred) {
          newStarred.delete(messageId)
        } else {
          newStarred.add(messageId)
        }
        
        // Salvar no localStorage
        if (conversation?.id) {
          localStorage.setItem(`starredMessages_${conversation.id}`, JSON.stringify(Array.from(newStarred)))
        }
        
        return newStarred
      })
      
      // Chamar API para persistir no servidor WAHA
      const response = await fetch(`/api/whatsapp/messages/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messageId,
          chatId,
          action // 'star' ou 'unstar'
        })
      })
      
      if (!response.ok) {
        console.error('❌ FAVORITOS - Erro na API:', response.status)
        // Reverter estado local se API falhar
        setStarredMessages(prev => {
          const revertStarred = new Set(prev)
          if (isCurrentlyStarred) {
            revertStarred.add(messageId) // Re-adicionar se estava removendo
          } else {
            revertStarred.delete(messageId) // Remover se estava adicionando
          }
          return revertStarred
        })
      } else {
        console.log(`✅ FAVORITOS - ${action} realizado com sucesso`)
      }
      
    } catch (error) {
      console.error('❌ FAVORITOS - Erro:', error)
      // Reverter estado local se houver erro
      setStarredMessages(prev => {
        const revertStarred = new Set(prev)
        if (isCurrentlyStarred) {
          revertStarred.add(messageId)
        } else {
          revertStarred.delete(messageId)
        }
        return revertStarred
      })
    }
  }

  // Handler para envio de mídia com legenda
  const handleMediaSend = async (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => {
    console.log('🚀 handleMediaSend chamado:', { file: file?.name, caption, mediaType, chatId })
    
    if (!file || !chatId) {
      console.log('❌ Arquivo ou chatId não encontrado:', { file: !!file, chatId })
      return
    }

    try {
      // Criar FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('chatId', chatId)
      // Fallback para sessão válida conhecida
    const sessionName = conversation?.userId ? `user_${conversation.userId}` : 'user_fb8da1d7_1758158816675'
    formData.append('session', sessionName)
    console.log('📱 Usando sessão:', sessionName)
      
      if (caption?.trim()) {
        formData.append('caption', caption.trim())
      }
      
      console.log('📦 FormData criado:', {
        file: file.name,
        chatId,
        caption: caption?.trim() || 'sem caption'
      })

      // Determinar endpoint baseado no tipo
      let endpoint = '/api/whatsapp/sendFile'
      if (mediaType === 'image') {
        endpoint = '/api/whatsapp/sendImage'
      } else if (mediaType === 'video') {
        endpoint = '/api/whatsapp/sendVideo'
      }

      const token = localStorage.getItem('token')
      console.log('🌐 Fazendo requisição:', { 
        endpoint, 
        url: endpoint,
        hasToken: !!token 
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('📡 Resposta da API:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      })

      if (response.ok) {
        console.log('✅ Mídia enviada com sucesso!')
        
        // Fechar modal e resetar estados
        setShowSendMediaModal(false)
        setSelectedMediaFile(null)
        setSelectedMediaType(null)
        
        // Não forçar reload - deixar WebSocket/polling atualizar naturalmente
      } else {
        const errorText = await response.text()
        console.error('❌ Erro da API:', errorText)
        throw new Error(`Erro ao enviar mídia: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('💥 Erro ao enviar mídia:', error)
      alert('Erro ao enviar mídia. Tente novamente.')
    }
  }

  // Handlers para modais
  const handleAgendamentoSave = async (agendamento: any) => {
    try {
      console.log('🚀 Criando agendamento:', agendamento)
      
      const token = localStorage.getItem('token')
      if (!token) return

      // Extrair número de telefone do chat ID para usar como contato_id
      const contatoId = conversation?.id || agendamento.contato.id
      const numeroTelefone = contatoId.replace('@c.us', '')
      
      // Converter formato UniversalAgendamentoData para formato backend
      const data = {
        titulo: agendamento.titulo,
        descricao: agendamento.descricao,
        inicio_em: `${agendamento.data}T${agendamento.hora_inicio}:00-03:00`,
        fim_em: `${agendamento.data}T${agendamento.hora_fim}:00-03:00`,
        link_meeting: agendamento.link_video,
        contato_id: numeroTelefone,  // Enviar só o número, sem @c.us
        contato: {
          id: agendamento.contato.id,
          nome: agendamento.contato.nome,
          telefone: agendamento.contato.telefone,
          email: agendamento.contato.email,
          empresa: agendamento.contato.empresa,
          cpf: agendamento.contato.cpf,
          cnpj: agendamento.contato.cnpj,
          cep: agendamento.contato.cep,
          rua: agendamento.contato.rua,
          numero: agendamento.contato.numero,
          bairro: agendamento.contato.bairro,
          cidade: agendamento.contato.cidade,
          estado: agendamento.contato.estado,
          pais: agendamento.contato.pais
        }
      }

      console.log('📡 Dados para backend:', data)

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Agendamento criado com sucesso:', result)
        setShowAgendamentoModal(false)
        // TODO: Atualizar badge de agendamentos se necessário
      } else {
        console.error('❌ Erro ao criar agendamento:', response.statusText)
        alert('Erro ao criar agendamento. Tente novamente.')
      }
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento. Verifique sua conexão.')
    }
  }

  const handleOrcamentoSave = async (orcamento: any) => {
    try {
      console.log('🚀 Criando orçamento:', orcamento)
      
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          titulo: orcamento.titulo,
          data: new Date(orcamento.data).toISOString(),
          tipo: orcamento.tipo,
          observacao: orcamento.observacao || null,
          contato_id: conversation?.id,
          itens: orcamento.itens.map((item: any) => ({
            nome: item.nome,
            valor: parseFloat(item.valor.toString()),
            quantidade: parseInt(item.quantidade.toString()),
            subtotal: parseFloat(item.valor.toString()) * parseInt(item.quantidade.toString())
          }))
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Orçamento criado com sucesso:', result)
      } else {
        console.error('❌ Erro ao criar orçamento:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao criar orçamento:', error)
    }
  }

  const handleAssinaturaSave = async (assinatura: any) => {
    try {
      console.log('🚀 Criando assinatura:', assinatura)
      
      // Modal já faz o POST para a API automaticamente
      console.log('✅ Assinatura salva via modal')
    } catch (error) {
      console.error('❌ Erro ao salvar assinatura:', error)
    }
  }

  const handleTransferirSave = async (transferencia: any) => {
    try {
      console.log('🔄 Transferindo atendimento:', transferencia)
      
      // TODO: Implementar API de transferência
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/atendimentos/transferir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: conversation?.id,
          filaId: transferencia.filaId,
          motivo: transferencia.motivo,
          notas: transferencia.notas,
          urgente: transferencia.urgente
        }),
      })
      
      if (response.ok) {
        console.log('✅ Atendimento transferido com sucesso')
        // Fechar modal será feito automaticamente pelo componente
      } else {
        console.error('❌ Erro ao transferir atendimento')
      }
    } catch (error) {
      console.error('❌ Erro ao transferir atendimento:', error)
    }
  }

  const handleTagsSave = async (tags: any[]) => {
    try {
      console.log('🏷️ [CHATAREA] Salvando tags:', tags)
      console.log('🔍 [CHATAREA] chatId usado:', chatId)
      
      await updateContatoTags(tags)
      console.log('✅ [CHATAREA] Tags salvas com sucesso!')
      setShowTagsModal(false)
      
    } catch (error) {
      console.error('❌ [CHATAREA] Erro ao salvar tags:', error)
      alert('Erro ao salvar tags. Tente novamente.')
    }
  }

  const handleVideoChamadaStart = (callData: any) => {
    console.log('Video chamada iniciada:', callData)
    // TODO: Implementar integração com plataforma de video
  }

  const handleLigacaoStart = (callData: any) => {
    console.log('Ligação iniciada:', callData)
    // TODO: Implementar integração com sistema de telefonia
  }

  const handleCompartilharTelaStart = (shareData: any) => {
    console.log('Compartilhamento iniciado:', shareData)
    // TODO: Implementar integração com plataforma de compartilhamento
  }

  // Função para responder com IA 
  const handleAIResponse = async (message: any) => {
    try {
      console.log('🤖 Gerando resposta com IA para:', message.body?.substring(0, 50))
      
      // Mostrar loading na interface
      setMessage('🤖 Gerando resposta...')
      
      // Chamar API de IA existente (DeepSeek + OpenAI)
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message.body,
          context: 'Contexto: Você está gerando uma resposta para um atendimento via WhatsApp. A mensagem do cliente foi: "' + message.body + '". Gere uma resposta profissional, amigável e útil.',
          type: 'response'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar resposta com IA')
      }

      const data = await response.json()
      
      if (data.success && data.text) {
        // Colocar a resposta gerada no campo de texto
        setMessage(data.text)
        
        // Opcional: enviar automaticamente (comentado por segurança)
        // await sendMessage(data.text)
        
        console.log('✅ Resposta IA gerada:', data.text)
      } else {
        throw new Error('Resposta inválida da IA')
      }
      
    } catch (error) {
      console.error('❌ Erro na resposta IA:', error)
      setMessage('') // Limpar loading
      alert('Erro ao gerar resposta com IA. Tente novamente.')
    }
  }

  // Função para traduzir mensagem dinamicamente (inline) - REAL
  const handleTranslateMessage = async (message: any) => {
    const messageId = message.id
    
    // Se já está traduzindo, não fazer nada
    if (translatingMessages.has(messageId)) return
    
    // Se já tem tradução, remover (toggle)
    if (translatedMessages[messageId]) {
      setTranslatedMessages(prev => {
        const newState = { ...prev }
        delete newState[messageId]
        return newState
      })
      return
    }
    
    try {
      console.log('🌍 Traduzindo mensagem:', message.body?.substring(0, 50) + '...')
      
      // Marcar como traduzindo
      setTranslatingMessages(prev => new Set(Array.from(prev).concat([messageId])))
      
      // Detectar idioma de forma mais precisa
      const hasPortugueseAccents = /[àáâãäéêëíîïóôõöúûüç]/i.test(message.body)
      const hasPortugueseWords = /\b(de|da|do|para|com|sem|sobre|entre|por|em|no|na|que|não|sim|está|ser|ter|fazer|como|muito|mais|quando|onde|porque|já|ainda|então|assim|bem|mas|só|seu|sua|seus|suas)\b/i.test(message.body)
      const hasEnglishWords = /\b(the|and|you|are|how|need|help|your|what|when|where|why|have|with|this|that|they|them|from|would|could|should|will|can|get|make|time|know|think|see|come|take|look|use|way|work|life|day|hand|eye|back|part|right|left|good|great|first|last|long|little|big|small|high|low|new|old|young|next|same|different|important|every|much|many|most|few|other|another|each|some|all|any|both|neither|either)\b/i.test(message.body)
      
      // Lógica de detecção melhorada
      let isPortuguese = hasPortugueseAccents || hasPortugueseWords
      let isEnglish = hasEnglishWords && !hasPortugueseAccents && !hasPortugueseWords
      
      // Se não detectar claramente, assume que texto sem acentos é inglês
      if (!isPortuguese && !isEnglish) {
        isEnglish = true
      }
      
      const targetLanguage = isPortuguese ? 'en' : 'pt'
      
      console.log('🔍 Detecção de idioma:', {
        text: message.body.substring(0, 50),
        hasPortugueseAccents,
        hasPortugueseWords, 
        hasEnglishWords,
        isPortuguese,
        isEnglish,
        targetLanguage: targetLanguage === 'pt' ? 'Português BR' : 'Inglês'
      })
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.body,
          targetLanguage,
          sourceLanguage: isPortuguese ? 'pt' : 'auto'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao traduzir mensagem')
      }

      const data = await response.json()
      
      if (data.success) {
        // Salvar tradução no estado
        setTranslatedMessages(prev => ({
          ...prev,
          [messageId]: data.translatedText
        }))
        
        console.log('✅ Tradução salva para mensagem:', messageId)
      }
    } catch (error) {
      console.error('❌ Erro ao traduzir:', error)
      // Mostrar erro brevemente
      setTranslatedMessages(prev => ({
        ...prev,
        [messageId]: '❌ Erro na tradução'
      }))
      
      // Remover erro após 3 segundos
      setTimeout(() => {
        setTranslatedMessages(prev => {
          const newState = { ...prev }
          delete newState[messageId]
          return newState
        })
      }, 3000)
    } finally {
      // Remover do estado de traduzindo
      setTranslatingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  // Função para marcar mensagens como vistas (usando nova rota anti-bloqueio)
  const markMessagesAsSeen = async (messageIds: string[]) => {
    if (!messageIds.length) return
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      // Chamar backend direto
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'
      await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/seen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Erro ao marcar mensagens como vistas:', error)
    }
  }

  // Extrair dados do contato atual
  const getContactData = () => {
    if (!conversation) return null
    return {
      id: conversation.id || `temp-${Date.now()}`,
      nome: conversation.name,
      telefone: conversation.phone || extractChatId(conversation),
      avatar: conversation.profilePictureUrl,
      email: '',
      empresa: ''
    }
  }
  
  // Funções para mídia
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Abrir modal para envio com texto
    setMediaSendType(type === 'file' ? 'document' : type)
    setShowMediaSendModal(true)
    
    // Simular seleção do arquivo no modal
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput && fileInput !== event.target) {
      const dt = new DataTransfer()
      dt.items.add(file)
      fileInput.files = dt.files
    }
    
    // Limpar input original
    event.target.value = ''
  }

  // Função para envio de mídia com modal (usando métodos seguros)
  const handleMediaSendWithModal = async (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => {
    if (!conversation) return
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    try {
      // 1. Primeiro enviar o arquivo usando upload tradicional
      if (mediaType === 'image') {
        await mediaUpload.sendImage(chatId, file)
      } else if (mediaType === 'video') {
        await mediaUpload.sendVideo(chatId, file)
      } else {
        await mediaUpload.sendFile(chatId, file)
      }
      
      // 2. Se há caption, enviar como mensagem separada usando métodos seguros
      if (caption.trim()) {
        // Simular typewriting para evitar ban
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
        const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            message: caption.trim()
          })
        })
        
        if (!response.ok) {
          console.error('Erro ao enviar caption:', response.statusText)
        }
      }
      
    } catch (error) {
      console.error('Erro ao enviar mídia com modal:', error)
      throw error
    }
  }

  // Função para envio de mídia especial (contato, localização, enquete)
  const handleSpecialMediaSend = async (data: any, caption: string) => {
    if (!conversation) return
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    try {
      // 1. Enviar o conteúdo especial
      if (showMediaModal === 'contact') {
        console.log('📞 Enviando contatos via sendContactVcard:', data)
        // Usar nova API sendContactVcard
        const response = await fetch('/api/whatsapp/sendContactVcard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatId,
            contacts: data.contacts
          })
        })
        
        if (!response.ok) {
          throw new Error('Erro ao enviar contato')
        }
        
        console.log('✅ Contatos enviados com sucesso!')
      } else if (showMediaModal === 'location') {
        await messageActions.sendLocation(data.latitude, data.longitude, data.title, data.address)
      } else if (showMediaModal === 'poll') {
        await messageActions.sendPoll(data.name, data.options, data.multipleAnswers)
      }
      
      // 2. Se há caption, enviar como mensagem separada usando métodos seguros
      if (caption.trim()) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
        const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            message: caption.trim()
          })
        })
        
        if (!response.ok) {
          console.error('Erro ao enviar caption:', response.statusText)
        }
      }
      
    } catch (error) {
      console.error('Erro ao enviar mídia especial:', error)
      throw error
    }
  }
  
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const files = Array.from(event.dataTransfer.files)
    if (files.length === 0 || !conversation) return
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    for (const file of files) {
      try {
        const type = getFileType(file)
        if (type === 'image') {
          await mediaUpload.sendImage(chatId, file)
        } else if (type === 'video') {
          await mediaUpload.sendVideo(chatId, file)
        } else if (type === 'voice') {
          await mediaUpload.sendVoice(chatId, file)
        } else {
          await mediaUpload.sendFile(chatId, file)
        }
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error)
      }
    }
  }
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }
  
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }
  
  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'voice'
    return 'file'
  }
  
  const handleAudioRecord = async () => {
    console.log('🎤 BOTÃO - handleAudioRecord clicado, isRecording:', audioRecorder.isRecording)
    
    if (audioRecorder.isRecording) {
      console.log('🎤 BOTÃO - Parando gravação...')
      audioRecorder.stopRecording()
    } else {
      console.log('🎤 BOTÃO - Iniciando gravação...')
      try {
        await audioRecorder.startRecording()
        console.log('🎤 BOTÃO - Gravação iniciada com sucesso')
      } catch (error) {
        console.error('🎤 BOTÃO - Erro ao iniciar gravação:', error)
      }
    }
  }
  
  const handleSendAudio = async () => {
    if (!audioRecorder.audioBlob || !conversation) return
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    try {
      await mediaUpload.sendVoice(chatId, audioRecorder.audioBlob)
      audioRecorder.clearRecording()
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
    }
  }

  // Função para lidar com typing status
  const handleTyping = (isTyping: boolean) => {
    if (onTyping && conversation) {
      const chatId = extractChatId(conversation)
      if (chatId) {
        onTyping(chatId, isTyping)
      }
    }
  }

  // Função para detectar links no texto
  const detectLinkInText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}[^\s]*)/gi
    const match = text.match(urlRegex)
    if (match && match.length > 0) {
      let url = match[0]
      if (!url.startsWith('http')) {
        url = url.startsWith('www.') ? `https://${url}` : `https://${url}`
      }
      return url
    }
    return null
  }

  // Função para lidar com mudanças no input
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    // Detectar links no texto
    const link = detectLinkInText(e.target.value)
    setDetectedLink(link)
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    // Enviar sinal de digitação via WAHA API
    if (e.target.value.length > 0) {
      await startTyping(chatId)
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      
      // Set new timeout to stop typing indicator
      const timeout = setTimeout(async () => {
        await stopTyping(chatId)
      }, 2000)
      
      setTypingTimeout(timeout)
    } else {
      // Se o campo estiver vazio, para imediatamente o status de "digitando"
      handleTyping(false)
    }
  }

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (!message.trim()) return
    
    const messageToSend = message.trim()
    const chatId = extractChatId(conversation)
    
    try {
      const token = localStorage.getItem('token')
      if (!token || !chatId) return
      
      // Se há uma mensagem sendo respondida, enviar como reply
      if (replyingTo) {
        const replyPayload = {
          chatId: chatId,
          text: messageToSend,
          replyTo: replyingTo.id || replyingTo._data?.id?.id
        }
        
        const response = await fetch('/api/whatsapp/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(replyPayload)
        })
        
        if (!response.ok) {
          throw new Error('Erro ao enviar reply')
        }
      } else {
        // Enviar mensagem normal
        onSendMessage(messageToSend)
      }
      
      // Limpar estados após envio
      setMessage('')
      setDetectedLink(null)
      setReplyingTo(null)
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      // Em caso de erro, usar fallback
      onSendMessage(messageToSend)
      setMessage('')
      setDetectedLink(null)
      setReplyingTo(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Selecione uma conversa</h3>
          <p className="text-muted-foreground">Escolha uma conversa da lista para começar a atender</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative">

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 bg-background border-b border-border px-6 flex items-center justify-between shadow-lg"
      >
        {/* Contact Info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border">
              {conversation.profilePictureUrl ? (
                <img 
                  src={conversation.profilePictureUrl} 
                  alt={conversation.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback para ícone se a imagem falhar
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`${conversation.profilePictureUrl ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            {/* Presence Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
              isOnline(extractChatId(conversation) || '') ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {isOnline(extractChatId(conversation) || '') ? (
                <Wifi className="w-2 h-2 text-white" />
              ) : (
                <WifiOff className="w-2 h-2 text-white" />
              )}
            </div>
          </motion.div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">{conversation.name}</h3>
              
              {/* Tags do contato */}
              {conversation?.tags && conversation.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {conversation.tags.slice(0, 2).map((tag: any) => (
                    <div
                      key={tag.id}
                      className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: tag.cor || '#6b7280' }}
                      title={tag.nome}
                    >
                      #{tag.nome}
                    </div>
                  ))}
                  {conversation.tags.length > 2 && (
                    <div className="px-2 py-1 rounded-md text-xs font-medium bg-slate-500 text-white shadow-sm">
                      +{conversation.tags.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isOnline(extractChatId(conversation) || '') ? 'bg-green-500' : 'bg-slate-400'
              }`} />
              <span className="text-sm text-slate-300">
                {isOnline(extractChatId(conversation) || '') ? 'Online' : 'Offline'}
                {isContactTyping(extractChatId(conversation) || '') && ' • digitando...'}
              </span>
            </div>
          </div>


        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Indicador de Nova Mensagem */}
          {newMessageReceived && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-full cursor-pointer transition-colors"
              onClick={() => {
                onNewMessageSeen?.()
                // Scroll para a última mensagem
                const messagesContainer = document.querySelector('[data-messages-container]')
                if (messagesContainer) {
                  messagesContainer.scrollTop = messagesContainer.scrollHeight
                }
              }}
              title="Nova mensagem recebida - Clique para ver"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
              <span className="text-xs font-medium text-white">Nova mensagem</span>
              <MessageCircle className="w-3 h-3 text-white" />
            </motion.div>
          )}

          {/* Buscar Mensagens */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('🔍 Botão busca clicado! showSearch:', showSearch, 'chatId:', chatId)
              setShowSearch(true)
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Buscar Mensagens"
          >
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-background"></div>
          </motion.button>
          
          {/* Transferir Atendimento */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTransferirModal(true)}
            className="p-2 bg-gray-100 hover:bg-blue-200 dark:bg-gray-800 dark:hover:bg-blue-700 rounded-full transition-all duration-300"
            title="Transferir Atendimento"
          >
            <ArrowRightLeft className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-blue-600" />
          </motion.button>

          {/* Tags */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTagsModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Gerenciar Tags"
          >
            <Tag className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge - mostrar número de tags */}
            {contatoTags && contatoTags.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border border-background flex items-center justify-center">
                <span className="text-xs font-bold text-white">{contatoTags.length}</span>
              </div>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTicketModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Gerenciar Tickets"
          >
            <Ticket className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-background"></div>
          </motion.button>
          
          {/* Agenda */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAgendamentoModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Agendar"
          >
            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge com contagem real */}
            {agendamentosCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                {agendamentosCount > 99 ? '99+' : agendamentosCount}
              </span>
            )}
          </motion.button>
          
          {/* Orçamento */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOrcamentoModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Orçamento"
          >
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge com contagem real */}
            {orcamentosCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                {orcamentosCount > 99 ? '99+' : orcamentosCount}
              </span>
            )}
          </motion.button>
          
          <button
            onClick={() => setShowAssinaturaModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Assinatura"
          >
            <FileSignature className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge com contagem real */}
            {assinaturasCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                {assinaturasCount > 99 ? '99+' : assinaturasCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              // Lógica inteligente: verificar se já é contato
              if (contactStatus === 'synced') {
                // Já é um lead - mostrar modal informativo
                setShowLeadInfoModal(true)
              } else {
                // Não é lead ainda - abrir modal de criação
                setShowCreateContactModal(true)
              }
            }}
            className={`p-2 rounded-full transition-all duration-300 relative ${
              contactStatus === 'synced' 
                ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30' 
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
            title={contactStatus === 'synced' ? 'Ver informações do Lead' : 'Criar Contato / Lead'}
          >
            <UserCheck className={`w-4 h-4 ${
              contactStatus === 'synced' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-600 dark:text-gray-300'
            }`} />
            {/* Badge de status do contato */}
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-background ${
              contactStatus === 'synced' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          </button>

          {/* Anotações */}
          <motion.button
            onClick={() => {
              console.log('🔍 DEBUG: Botão Anotações clicado!')
              console.log('🔍 onToggleAnotacoesSidebar:', onToggleAnotacoesSidebar)
              console.log('🔍 isAnotacoesSidebarOpen:', isAnotacoesSidebarOpen)
              if (onToggleAnotacoesSidebar) {
                onToggleAnotacoesSidebar()
                console.log('✅ Função chamada com sucesso!')
              } else {
                console.error('❌ onToggleAnotacoesSidebar não está definido!')
              }
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Anotações"
          >
            <StickyNote className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge com contagem real */}
            {notesCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                {notesCount > 99 ? '99+' : notesCount}
              </span>
            )}
          </motion.button>
            
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLigacaoModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Telefone"
          >
            <Phone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-background"></div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVideoChamadaModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Vídeo Chamada"
          >
            <Video className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-background"></div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCompartilharTelaModal(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title="Compartilhar Tela"
          >
            <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-background"></div>
          </motion.button>

        

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all duration-300 relative"
            title={isFullscreen ? "Sair do Fullscreen" : "Fullscreen"}
          >
            <Expand className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-background"></div>
          </motion.button>
          
          {/* Badge do Kanban */}
          {kanbanInfo && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center px-3 py-1 text-xs text-white rounded-full font-medium shadow-sm ml-2 flex-shrink-0"
              style={{ backgroundColor: kanbanInfo.color }}
            >
              <Tag className="w-3 h-3 mr-1" />
              {kanbanInfo.coluna ? `${kanbanInfo.quadro} • ${kanbanInfo.coluna}` : kanbanInfo.quadro}
            </motion.span>
          )}
          {!kanbanInfo && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center px-3 py-1 text-xs text-slate-300 rounded-full font-medium shadow-sm ml-2 flex-shrink-0"
              style={{ backgroundColor: '#64748b' }}
            >
              <Tag className="w-3 h-3 mr-1" />
              Carregando...
            </motion.span>
          )}



          {/* Badge de Atendentes */}
          {conexaoFilaInfo?.atendentes && conexaoFilaInfo.atendentes.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="inline-flex items-center px-3 py-1 text-xs text-white bg-blue-500 rounded-full font-medium shadow-sm ml-2 flex-shrink-0 cursor-help"
              title={`Atendentes: ${conexaoFilaInfo.atendentes.map((atendente: any) => atendente.nome || atendente.name || 'Sem nome').join(', ')}`}
            >
              <Users2 className="w-3 h-3 mr-1" />
              {conexaoFilaInfo.atendentes.length} Atendente{conexaoFilaInfo.atendentes.length > 1 ? 's' : ''}
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Indicador de Tradução */}
      {selectedLanguage !== 'pt' && selectedLanguage !== 'pt-BR' && (
        <div className="px-6 py-2 bg-blue-500/20 backdrop-blur-sm border-l-4 border-blue-400">
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <Languages className="w-4 h-4" />
            <span>
              {isTranslating ? 'Traduzindo conversas...' : 'Conversas traduzidas automaticamente'}
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-background scrollbar-chat">
        {/* 📱 Loading indicator para mensagens antigas (top) */}
        {isLoadingMoreMessages && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Carregando mensagens antigas...
            </div>
          </div>
        )}
        
        {/* 📱 Indicador de mensagens não carregadas */}
        {visibleMessagesCount < displayMessages.length && !isLoadingMoreMessages && (
          <div className="flex justify-center py-2">
            <button
              onClick={loadMoreMessages}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
            >
              ↑ {displayMessages.length - visibleMessagesCount} mensagens mais antigas
            </button>
          </div>
        )}
        
        <AnimatePresence>
          {lazyDisplayMessages.map((msg, index) => (
            <motion.div
              key={msg.id}
              id={`message-${msg.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'} group`}
              onMouseEnter={() => setHoveredMessage(msg.id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              <div 
                className={`relative max-w-xs lg:max-w-md xl:max-w-lg ${msg.sender === 'agent' ? 'ml-auto' : ''}`}
              >
                <div 
                  className={`p-3 rounded-xl ${
                    msg.sender === 'agent' 
                      ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-black/95 dark:from-slate-900/90 dark:via-black/95 dark:to-slate-950/98 text-white shadow-2xl shadow-black/40 border border-slate-600/30 dark:border-slate-700/40' 
                      : 'bg-white dark:bg-slate-50 border border-gray-200 dark:border-gray-300 text-gray-900 dark:text-gray-900 shadow-sm'
                  } max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl`}
                  onDoubleClick={() => {
                    if (msg.sender === 'agent' && msg.type === 'text') {
                      setEditingMessage(msg)
                      setShowEditModal(true)
                    }
                  }}
                >
                  {/* Renderizar conteúdo da mensagem com mídia */}
                  
               
                  {/* Verificar se é localização */}
                  {(() => {
                    const isLocation = msg.type === 'location' || (msg as any).location || 
                     (msg.content && (
                       msg.content.toLowerCase().includes('latitude') || 
                       msg.content.toLowerCase().includes('localização') ||
                       msg.content.toLowerCase().includes('location')
                     ))
                    
                    // 🔍 DEBUG APENAS PARA LOCATION REAL
                    if (msg.type === 'location' || (msg as any).latitude || (msg as any).longitude || (msg as any).location || 
                        (msg.content && msg.content.includes('Rua Isaltino'))) {
                      console.log('🗺️ LOCATION ENCONTRADA!:', {
                        ...msg,
                        allKeys: Object.keys(msg as any),
                        hasLatitude: !!(msg as any).latitude,
                        hasLongitude: !!(msg as any).longitude,
                        body: (msg as any).body,
                        lat: (msg as any).lat,
                        lng: (msg as any).lng
                      })
                    }
                    
                    return isLocation
                  })() ? (
                    <div className="mb-2">
                      {/* 🔍 DEBUG VISUAL - Indicador LOCATION na mensagem */}
                      <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-xs">
                        <div className="font-bold text-green-800">📍 LOCATION DEBUG:</div>
                        <div>Type: {msg.type} → isLocation: {String(msg.type === 'location' || (msg as any).location || 
                         (msg.content && (
                           msg.content.toLowerCase().includes('latitude') || 
                           msg.content.toLowerCase().includes('localização') ||
                           msg.content.toLowerCase().includes('location')
                         )))}</div>
                        <div>Has .location: {String(!!(msg as any).location)}</div>
                        <div>Has .latitude: {String(!!(msg as any).latitude)}</div>
                        <div>Content: {msg.content?.substring(0, 50)}...</div>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        msg.sender === 'agent' ? 'bg-white/10 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/30' : 'bg-gray-100 dark:bg-gray-200 border border-gray-300'
                      }`}>
                        <div className={`p-2 rounded-full ${
                          msg.sender === 'agent' ? 'bg-white/20 dark:bg-slate-700/60 backdrop-blur-sm' : 'bg-gray-200 dark:bg-gray-300'
                        }`}>
                          <MapPin className={`w-4 h-4 ${
                            msg.sender === 'agent' ? 'text-white' : 'text-gray-800 dark:text-gray-800'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${
                            msg.sender === 'agent' ? 'text-white' : 'text-gray-800 dark:text-gray-800'
                          }`}>
                            {(msg as any).location?.title || msg.content || 'Localização'}
                          </div>
                          {(msg as any).location?.address && (
                            <div className={`text-xs mt-1 ${
                              msg.sender === 'agent' ? 'text-white/70' : 'text-gray-600 dark:text-gray-600'
                            }`}>
                              {(msg as any).location.address}
                            </div>
                          )}
                          <div className={`text-xs mt-1 ${
                            msg.sender === 'agent' ? 'text-white/70' : 'text-gray-600 dark:text-gray-600'
                          }`}>
                            Lat: {(msg as any).location?.latitude || (msg as any).latitude}, 
                            Lng: {(msg as any).location?.longitude || (msg as any).longitude}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const lat = (msg as any).location?.latitude || (msg as any).latitude
                            const lng = (msg as any).location?.longitude || (msg as any).longitude
                            window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
                          }}
                          className={`p-2 rounded-full hover:bg-opacity-80 transition-colors ${
                            msg.sender === 'agent' ? 'bg-white/20 hover:bg-white/30' : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          <ExternalLink className={`w-3 h-3 ${
                            msg.sender === 'agent' ? 'text-white' : 'text-gray-600 dark:text-gray-600'
                          }`} />
                        </button>
                      </div>
                    </div>
                  ) : (() => {
                    const isPoll = msg.type === 'poll' || (msg as any).poll || 
                     (msg.content && (
                       msg.content.toLowerCase().includes('enquete') ||
                       // 📊 Detectar listas numeradas com emojis
                       (msg.content.includes('1️⃣') && msg.content.includes('2️⃣')) ||
                       // 📋 Padrões de formulário/questionário
                       (msg.content.includes('Me conte:') && msg.content.includes('?')) ||
                       (msg.content.includes('Qual ') && msg.content.includes('?') && msg.content.includes('\n'))
                     ))
                    
                    // 🔍 DEBUG APENAS PARA POLL REAL
                    if (msg.type === 'poll' || (msg as any).poll || (msg as any).pollData || 
                        (msg.content && (msg.content.includes('?') || msg.content.toLowerCase().includes('enquete')))) {
                    
                    }
                    
                    return isPoll
                  })() ? (
                    <div className="mb-2">
                      {/* 🔍 DEBUG VISUAL - Indicador POLL na mensagem */}
                      <div className="mb-2 p-2 bg-purple-100 border border-purple-300 rounded text-xs">
                        <div className="font-bold text-purple-800">📊 POLL DEBUG:</div>
                        <div>Type: {msg.type} → isPoll: {String(msg.type === 'poll' || (msg as any).poll || 
                         (msg.content && (
                           msg.content.toLowerCase().includes('enquete') ||
                           (msg.content.includes('1️⃣') && msg.content.includes('2️⃣')) ||
                           (msg.content.includes('Me conte:') && msg.content.includes('?')) ||
                           (msg.content.includes('Qual ') && msg.content.includes('?') && msg.content.includes('\n'))
                         )))}</div>
                        <div>Content: {msg.content?.substring(0, 50)}...</div>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        msg.sender === 'agent' ? 'bg-white/10 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/30' : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-2 rounded-full ${
                            msg.sender === 'agent' ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-800'
                          }`}>
                            <svg className={`w-4 h-4 ${msg.sender === 'agent' ? 'text-white' : 'text-purple-600 dark:text-purple-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div className={`font-medium text-sm ${
                            msg.sender === 'agent' ? 'text-white' : 'text-purple-800 dark:text-purple-200'
                          }`}>
                            📊 {(() => {
                              // Extrair título da enquete do conteúdo
                              if ((msg as any).poll?.name) return (msg as any).poll.name;
                              if (msg.content) {
                                const firstLine = msg.content.split('\n')[0];
                                return firstLine.length > 50 ? 'Formulário/Questionário' : firstLine;
                              }
                              return 'Enquete';
                            })()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            // 📊 Extrair opções do conteúdo se for poll manual
                            const pollOptions = (msg as any).poll?.options || [];
                            
                            if (pollOptions.length === 0 && msg.content) {
                              // Extrair linhas que começam com emojis numerados
                              const lines = msg.content.split('\n');
                              const extractedOptions: string[] = [];
                              
                              lines.forEach(line => {
                                const trimmed = line.trim();
                                if (trimmed.match(/^[1-9]️⃣|^[1-9]\.|^[1-9]\)/)) {
                                  extractedOptions.push(trimmed);
                                }
                              });
                              
                              return extractedOptions.length > 0 ? extractedOptions : ['📋 ' + msg.content];
                            }
                            
                            return pollOptions;
                          })().map((option: any, index: number) => (
                            <div key={index} className={`flex items-center gap-2 p-2 rounded ${
                              msg.sender === 'agent' ? 'bg-white/10' : 'bg-white dark:bg-purple-800/30'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                msg.sender === 'agent' ? 'bg-white/60' : 'bg-purple-400'
                              }`} />
                              <span className={`text-sm ${
                                msg.sender === 'agent' ? 'text-white/90' : 'text-purple-700 dark:text-purple-200'
                              }`}>
                                {typeof option === 'string' ? option : (option.name || option)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {(msg as any).poll?.multipleAnswers && (
                          <div className={`text-xs mt-2 ${
                            msg.sender === 'agent' ? 'text-white/70' : 'text-purple-600 dark:text-purple-400'
                          }`}>
                            ✓ Múltiplas respostas permitidas
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (msg as any).mediaUrl && (
                    (msg as any).mediaUrl.includes('.jpeg') ||
                    (msg as any).mediaUrl.includes('.jpg') ||
                    (msg as any).mediaUrl.includes('.png') ||
                    (msg as any).mediaUrl.includes('.gif') ||
                    (msg as any).mediaUrl.includes('.webp') ||
                    msg.type === 'image' || 
                    (msg as any).mimetype?.includes('image')
                  ) && !(
                    (msg as any).mediaUrl.includes('.webm') ||
                    (msg as any).mediaUrl.includes('.mp4') ||
                    (msg as any).mediaUrl.includes('.mov') ||
                    (msg as any).mediaUrl.includes('.avi')
                  ) ? (
                    <div className="mb-2">
                      <div className="relative">
                        <img 
                          src={(msg as any).mediaUrl || msg.content} 
                          alt="Imagem enviada" 
                          className="w-full h-auto rounded-lg max-h-64 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA2MEw5MCA0NUwxMjUgODBMMTUwIDU1VjEyMEg1MFY2MEg3NVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY5NzA3QiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2VtPC90ZXh0Pgo8L3N2Zz4K";
                          }}
                        />
                      </div>
                      {(msg.content || (msg as any).caption) && (
                        <p className={`text-sm mt-2 ${msg.sender === 'agent' ? 'text-white/90' : 'text-gray-700'}`}>
                          {msg.content || (msg as any).caption}
                        </p>
                      )}
                    </div>
                  ) : (() => {
                    const isAudio = (msg as any).mediaUrl && (
                      (msg as any).mediaUrl.includes('.oga') ||
                      (msg as any).mediaUrl.includes('.ogg') ||
                      (msg as any).mediaUrl.includes('.mp3') ||
                      (msg as any).mediaUrl.includes('.mpga') || // 🎤 FIX: Extensão .mpga (MPEG Audio)
                      (msg as any).mediaUrl.includes('.wav') ||
                      (msg as any).mediaUrl.includes('.webm') ||
                      (msg as any).mediaUrl.includes('.bin') ||
                      (msg as any).mediaUrl.includes('.mp4') || // 🎤 FIX: Arquivos de áudio podem ter extensão .mp4
                      msg.type === 'audio' || 
                      msg.type === 'ptt' || // 🎤 FIX: Adicionar detecção por type ptt
                      (msg as any).processedType === 'audio' || // 🎤 FIX: Usar processedType do backend
                      (msg as any).mimetype?.includes('audio')
                    );
                    return isAudio;
                  })() ? (
                    <div className="mb-2">
                      {/* Usar dados base64 se disponíveis, senão usar URL */}
                      {(msg as any).media?.data ? (
                        <div className="mb-2">
                          <div className={`p-4 rounded-lg ${
                            msg.sender === 'agent' ? 'bg-white/10' : 'bg-blue-50 dark:bg-blue-950/30'
                          }`}>
                            <div className="mb-3">
                              <p className={`text-sm font-medium ${
                                msg.sender === 'agent' ? 'text-white' : 'text-blue-700'
                              }`}>
                                🎤 Mensagem de Áudio
                              </p>
                            </div>
                            <audio 
                              controls 
                              className="w-full h-10 rounded-lg" 
                              preload="metadata"
                              style={{ minHeight: '40px' }}
                            >
                              <source src={`data:${(msg as any).media.mimetype || 'audio/webm'};base64,${(msg as any).media.data}`} type="audio/webm" />
                              <source src={`data:${(msg as any).media.mimetype || 'audio/ogg'};base64,${(msg as any).media.data}`} type="audio/ogg" />
                              Áudio não suportado
                            </audio>
                          </div>
                        </div>
                      ) : (msg as any).mediaUrl ? (
                        <>
                         
                          <AudioMessageComponent 
                            message={{
                              mediaUrl: (msg as any).mediaUrl,
                              body: msg.content,
                              caption: (msg as any).caption
                            }}
                            onTranscribe={(text) => {
                              console.log('🎤 Transcrição recebida:', { messageId: msg.id, text });
                            }}
                          />
                        </>
                      ) : (
                        <>
                          {console.log('❌ AUDIO FALLBACK RENDER:', {
                            id: msg.id,
                            reason: 'No mediaUrl and no media.data',
                            hasMediaUrl: !!(msg as any).mediaUrl,
                            hasMediaData: !!(msg as any).media?.data,
                            type: msg.type,
                            mimetype: (msg as any).mimetype,
                            content: msg.content?.substring(0, 50)
                          })}
                          <div className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed ${
                            msg.sender === 'agent' ? 'bg-orange-50/10 dark:bg-orange-900/20 border-orange-300/50 dark:border-orange-600/40 backdrop-blur-sm' : 'bg-orange-50 dark:bg-orange-100 border-orange-200 dark:border-orange-300'
                          }`}>
                            <div className={`p-2 rounded-full ${
                              msg.sender === 'agent' ? 'bg-orange-200/20 dark:bg-orange-800/40' : 'bg-orange-100 dark:bg-orange-200'
                            }`}>
                              <AudioLines className={`w-4 h-4 ${
                                msg.sender === 'agent' ? 'text-orange-300' : 'text-orange-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                msg.sender === 'agent' ? 'text-orange-200' : 'text-orange-700 dark:text-orange-800'
                              }`}>
                                🎤 Mensagem de Áudio
                              </p>
                              <p className={`text-xs ${
                                msg.sender === 'agent' ? 'text-orange-300/80' : 'text-orange-600 dark:text-orange-700'
                              }`}>
                                Arquivo não disponível
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {(msg.content || (msg as any).caption) && (
                        <p className={`text-sm mt-2 ${msg.sender === 'agent' ? 'text-white/90' : 'text-gray-700'}`}>
                          {msg.content || (msg as any).caption}
                        </p>
                      )}
                    </div>
                  ) : (() => {
                    // 🎬 DETECÇÃO DE VÍDEO - Excluir arquivos que já foram detectados como áudio
                    const isAudioFile = (msg as any).mediaUrl && (
                      (msg as any).mediaUrl.includes('.oga') ||
                      (msg as any).mediaUrl.includes('.ogg') ||
                      (msg as any).mediaUrl.includes('.mp3') ||
                      (msg as any).mediaUrl.includes('.mpga') || // 🎤 FIX: Extensão .mpga (MPEG Audio)
                      (msg as any).mediaUrl.includes('.wav') ||
                      (msg as any).mediaUrl.includes('.webm') ||
                      (msg as any).mediaUrl.includes('.bin') ||
                      msg.type === 'audio' || 
                      msg.type === 'ptt' || 
                      (msg as any).processedType === 'audio' || 
                      (msg as any).mimetype?.includes('audio')
                    );
                    
                    const isVideoFile = (msg as any).mediaUrl && (
                      (msg as any).mediaUrl.includes('.mp4') ||
                      (msg as any).mediaUrl.includes('.webm') ||
                      (msg as any).mediaUrl.includes('.mov') ||
                      (msg as any).mediaUrl.includes('.avi') ||
                      msg.type === 'video' || 
                      (msg as any).mimetype?.includes('video')
                    );
                    
                    // 🚨 SÓ é vídeo se NÃO for áudio
                    return isVideoFile && !isAudioFile;
                  })() ? (
                    <div className="mb-2">
                      <div className={`p-3 rounded-lg ${
                        msg.sender === 'agent' ? 'bg-white/5 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-slate-600/30 shadow-lg dark:shadow-black/50' : 'bg-muted/50 dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border dark:border-slate-600/30'
                      }`}>
                        <div className={`flex items-center gap-2 mb-3 ${
                          msg.sender === 'agent' ? 'text-white/90' : 'text-gray-700'
                        }`}>
                          <Video className="w-4 h-4" />
                          <span className="text-sm font-medium">📹 Vídeo</span>
                        </div>
                        <video 
                          controls 
                          className="w-full max-w-sm rounded-lg shadow-sm"
                          preload="metadata"
                          poster=""
                        >
                          <source src={(msg as any).mediaUrl} type="video/mp4" />
                          <source src={(msg as any).mediaUrl} type="video/webm" />
                          <source src={(msg as any).mediaUrl} type="video/quicktime" />
                          Seu navegador não suporta o elemento de vídeo.
                        </video>
                        {(msg.content || (msg as any).caption) && (
                          <p className={`text-sm mt-3 ${msg.sender === 'agent' ? 'text-white/90' : 'text-gray-700'}`}>
                            {msg.content || (msg as any).caption}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (() => {
                    const isDocument = (msg.type === 'document' || msg.type === 'file') || 
                        (msg as any).mimetype?.includes('application/') || 
                        (msg as any).mimetype?.includes('text/') ||
                        // 📎 Documentos
                        (msg as any).mediaUrl?.includes('.pdf') || (msg as any).mediaUrl?.includes('.doc') || (msg as any).mediaUrl?.includes('.docx') ||
                        (msg as any).mediaUrl?.includes('.txt') || (msg as any).mediaUrl?.includes('.rtf') ||
                        // 📊 Planilhas
                        (msg as any).mediaUrl?.includes('.xlsx') || (msg as any).mediaUrl?.includes('.xls') || (msg as any).mediaUrl?.includes('.csv') ||
                        // 📋 Apresentações
                        (msg as any).mediaUrl?.includes('.ppt') || (msg as any).mediaUrl?.includes('.pptx') ||
                        // 🗂️ Arquivos Compactados
                        (msg as any).mediaUrl?.includes('.zip') || (msg as any).mediaUrl?.includes('.rar') || (msg as any).mediaUrl?.includes('.7z') ||
                        // 🔧 Código & Dados
                        (msg as any).mediaUrl?.includes('.json') || (msg as any).mediaUrl?.includes('.xml') || (msg as any).mediaUrl?.includes('.md') ||
                        (msg as any).mediaUrl?.includes('.js') || (msg as any).mediaUrl?.includes('.ts') || (msg as any).mediaUrl?.includes('.html') ||
                        (msg as any).mediaUrl?.includes('.css') || (msg as any).mediaUrl?.includes('.py') || (msg as any).mediaUrl?.includes('.java') ||
                        // 📄 Outros formatos comuns
                        (msg as any).mediaUrl?.includes('.epub') || (msg as any).mediaUrl?.includes('.mobi');
                    
                    const hasMediaUrl = !!(msg as any).mediaUrl;
                    const shouldRender = isDocument && hasMediaUrl;
                    
                   
                    if (isDocument && !hasMediaUrl) {
                      console.log('❌ DOCUMENT SKIPPED - No mediaUrl:', {
                        id: msg.id,
                        type: msg.type,
                        mimetype: (msg as any).mimetype
                      });
                    }
                    
                    return shouldRender;
                  })() ? (
                    <div className="mb-2">
                      <div className={`p-4 rounded-xl backdrop-blur-md border ${
                        msg.sender === 'agent' ? 'bg-white/5 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-slate-600/30 shadow-lg dark:shadow-black/50' : 'bg-gray-100 dark:bg-gray-200 border border-gray-300'
                      }`}>
                        {/* Header com ícone e tipo */}
                        <div className={`flex items-center gap-3 mb-3 ${
                          msg.sender === 'agent' ? 'text-white/90' : 'text-gray-800 dark:text-gray-800'
                        }`}>
                          <div className={`p-2 rounded-lg ${
                            msg.sender === 'agent' ? 'bg-white/20 dark:bg-slate-700/60 backdrop-blur-sm' : 'bg-blue-100 dark:bg-blue-200'
                          }`}>
                            {(() => {
                              const filename = (msg as any).fileName || (msg as any).filename || 'documento'
                              const ext = filename.toLowerCase().split('.').pop()
                              // 📄 Documentos
                              if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-600" />
                              if (['doc', 'docx', 'rtf'].includes(ext)) return <FileText className="w-5 h-5 text-blue-600" />
                              if (['txt', 'md'].includes(ext)) return <FileText className="w-5 h-5 text-gray-600" />
                              // 📊 Planilhas
                              if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileText className="w-5 h-5 text-green-600" />
                              // 📋 Apresentações
                              if (['ppt', 'pptx'].includes(ext)) return <FileText className="w-5 h-5 text-orange-600" />
                              // 🗂️ Compactados
                              if (['zip', 'rar', '7z'].includes(ext)) return <FileText className="w-5 h-5 text-yellow-600" />
                              // 🔧 Código
                              if (['js', 'ts', 'html', 'css', 'py', 'java', 'json', 'xml'].includes(ext)) return <FileText className="w-5 h-5 text-purple-600" />
                              // 📚 E-books
                              if (['epub', 'mobi'].includes(ext)) return <FileText className="w-5 h-5 text-indigo-600" />
                              return <FileText className={`w-5 h-5 ${msg.sender === 'agent' ? 'text-white' : 'text-gray-600'}`} />
                            })()}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${
                              msg.sender === 'agent' ? 'text-white' : 'text-gray-900 dark:text-gray-900'
                            }`}>
                              {(() => {
                                const filename = (msg as any).fileName || (msg as any).filename || 'documento'
                                const ext = filename.toLowerCase().split('.').pop()
                                // 📄 Documentos
                                if (ext === 'pdf') return '📄 Documento PDF'
                                if (['doc', 'docx'].includes(ext)) return '📝 Documento Word'
                                if (ext === 'rtf') return '📝 Documento RTF'
                                if (ext === 'txt') return '📋 Arquivo de Texto'
                                if (ext === 'md') return '📋 Markdown'
                                // 📊 Planilhas
                                if (['xls', 'xlsx'].includes(ext)) return '📊 Planilha Excel'
                                if (ext === 'csv') return '📊 Planilha CSV'
                                // 📋 Apresentações
                                if (['ppt', 'pptx'].includes(ext)) return '📋 Apresentação PowerPoint'
                                // 🗂️ Compactados
                                if (ext === 'zip') return '🗂️ Arquivo ZIP'
                                if (ext === 'rar') return '🗂️ Arquivo RAR'
                                if (ext === '7z') return '🗂️ Arquivo 7-Zip'
                                // 🔧 Código
                                if (ext === 'js') return '🔧 JavaScript'
                                if (ext === 'ts') return '🔧 TypeScript'
                                if (ext === 'html') return '🔧 HTML'
                                if (ext === 'css') return '🔧 CSS'
                                if (ext === 'py') return '🔧 Python'
                                if (ext === 'java') return '🔧 Java'
                                if (ext === 'json') return '🔧 JSON'
                                if (ext === 'xml') return '🔧 XML'
                                // 📚 E-books
                                if (ext === 'epub') return '📚 E-book EPUB'
                                if (ext === 'mobi') return '📚 E-book Mobi'
                                return '📁 Documento'
                              })()}
                            </p>
                            <p className={`text-xs ${
                              msg.sender === 'agent' ? 'text-white/70' : 'text-gray-500 dark:text-gray-600'
                            }`}>
                              {(msg as any).fileName || (msg as any).filename || 'arquivo.pdf'}
                            </p>
                          </div>
                        </div>

                        {/* Preview/Thumbnail area */}
                        <div className={`mb-4 p-4 rounded-lg border-2 border-dashed ${
                          msg.sender === 'agent' ? 'border-white/20 bg-white/5 dark:bg-black/30 dark:border-slate-600/30 backdrop-blur-sm' : 'border-gray-300 bg-gray-50 dark:bg-gray-100 dark:border-gray-400'
                        }`}>
                          <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-3 ${
                              msg.sender === 'agent' ? 'bg-white/20 dark:bg-slate-700/60 backdrop-blur-sm' : 'bg-gray-200 dark:bg-gray-300'
                            }`}>
                              {(() => {
                                const filename = (msg as any).fileName || (msg as any).filename || 'documento'
                                const ext = filename.toLowerCase().split('.').pop()
                                // 📄 Documentos
                                if (ext === 'pdf') return <div className="text-2xl">📄</div>
                                if (['doc', 'docx'].includes(ext)) return <div className="text-2xl">📝</div>
                                if (ext === 'rtf') return <div className="text-2xl">📝</div>
                                if (ext === 'txt') return <div className="text-2xl">📋</div>
                                if (ext === 'md') return <div className="text-2xl">📝</div>
                                // 📊 Planilhas
                                if (['xls', 'xlsx'].includes(ext)) return <div className="text-2xl">📊</div>
                                if (ext === 'csv') return <div className="text-2xl">📈</div>
                                // 📋 Apresentações
                                if (['ppt', 'pptx'].includes(ext)) return <div className="text-2xl">📊</div>
                                // 🗂️ Compactados
                                if (['zip', 'rar', '7z'].includes(ext)) return <div className="text-2xl">🗜️</div>
                                // 🔧 Código
                                if (['js', 'ts'].includes(ext)) return <div className="text-2xl">🔧</div>
                                if (ext === 'html') return <div className="text-2xl">🌐</div>
                                if (ext === 'css') return <div className="text-2xl">🎨</div>
                                if (ext === 'py') return <div className="text-2xl">🐍</div>
                                if (ext === 'java') return <div className="text-2xl">☕</div>
                                if (ext === 'json') return <div className="text-2xl">📋</div>
                                if (ext === 'xml') return <div className="text-2xl">📄</div>
                                // 📚 E-books
                                if (['epub', 'mobi'].includes(ext)) return <div className="text-2xl">📚</div>
                                return <div className="text-2xl">📁</div>
                              })()}
                            </div>
                            <p className={`text-sm font-medium ${
                              msg.sender === 'agent' ? 'text-white/80' : 'text-gray-700 dark:text-gray-800'
                            }`}>
                              Preview não disponível
                            </p>
                            <p className={`text-xs ${
                              msg.sender === 'agent' ? 'text-white/60' : 'text-gray-500 dark:text-gray-600'
                            }`}>
                              Clique para fazer download
                            </p>
                          </div>
                        </div>

                        {/* Botão de download */}
                        <a 
                          href={(msg as any).mediaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm ${
                            msg.sender === 'agent' 
                              ? 'bg-white/10 hover:bg-white/20 text-white dark:bg-slate-700/40 dark:hover:bg-slate-600/50 dark:border dark:border-slate-600/30' 
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 dark:backdrop-blur-sm'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Baixar arquivo</p>
                            <p className={`text-xs ${
                              msg.sender === 'agent' ? 'text-white/70' : 'text-blue-600'
                            }`}>
                              {(msg as any).fileName || (msg as any).filename || 'documento.pdf'}
                            </p>
                          </div>
                          <div className={`p-1 rounded ${
                            msg.sender === 'agent' ? 'bg-white/20' : 'bg-blue-100'
                          }`}>
                            <Eye className="w-3 h-3" />
                          </div>
                        </a>

                        {/* Caption */}
                        {(msg.content || (msg as any).caption) && (
                          <div className={`mt-3 pt-3 border-t ${
                            msg.sender === 'agent' ? 'border-white/10' : 'border-gray-200'
                          }`}>
                            <p className={`text-sm ${msg.sender === 'agent' ? 'text-white/90' : 'text-gray-700'}`}>
                              {msg.content || (msg as any).caption}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* 🔍 DEBUG VISUAL - Só mostra se mensagem tem dados de mídia mas caiu no fallback */}
                      {((msg as any).mediaUrl || (msg as any).poll || (msg as any).location || msg.type !== 'text' || (msg as any).processedType) && (
                        <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
                          <div className="font-bold text-yellow-800">⚠️ FALLBACK DEBUG:</div>
                          <div>Type: <span className="font-mono">{msg.type}</span> → <span className="font-mono">{(msg as any).processedType || 'N/A'}</span></div>
                          <div>MediaURL: {(msg as any).mediaUrl ? '✅ SIM' : '❌ NÃO'}</div>
                          {(msg as any).mediaUrl && (
                            <div className="text-xs bg-gray-200 p-1 rounded mt-1">
                              <strong>URL:</strong> <span className="font-mono break-all">{(msg as any).mediaUrl}</span>
                            </div>
                          )}
                          <div>Poll: {(msg as any).poll ? '✅ SIM' : '❌ NÃO'}</div>
                          <div>Location: {(msg as any).location ? '✅ SIM' : '❌ NÃO'}</div>
                          <div>Mimetype: <span className="font-mono">{(msg as any).mimetype || 'N/A'}</span></div>
                          <div className="text-red-600 font-bold mt-1">↑ Deveria renderizar como mídia!</div>
                        </div>
                      )}
                      <MessageContent 
                        content={msg.content} 
                        className={msg.sender === 'agent' ? 'text-white/90' : 'text-gray-900 dark:text-gray-900'}
                      />

                      {/* Tradução dinâmica inline */}
                      {translatingMessages.has(msg.id) && (
                        <div className={`mt-2 p-2 rounded-md border-l-2 ${
                          msg.sender === 'agent' 
                            ? 'bg-white/10 border-white/30 text-white/80' 
                            : 'bg-blue-50 border-blue-200 text-gray-600'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs">Traduzindo...</span>
                          </div>
                        </div>
                      )}
                      
                      {translatedMessages[msg.id] && !translatingMessages.has(msg.id) && (
                        <div className={`mt-2 p-2 rounded-md border-l-2 ${
                          msg.sender === 'agent' 
                            ? 'bg-white/10 border-green-300 text-white/90' 
                            : 'bg-green-50 border-green-300 text-green-800'
                        }`}>
                          <div className="flex items-start gap-2">
                            <Languages className="w-3 h-3 mt-0.5 text-green-600" />
                            <div>
                              <span className="text-xs font-medium block mb-1">Tradução:</span>
                              <span className="text-sm">{translatedMessages[msg.id]}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Linha com timestamp e ícones */}
                  <div className={`flex items-center gap-3 ${
                    msg.sender === 'agent' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{msg.timestamp}</span>
                      {/* Indicador de mensagem favoritada */}
                      {starredMessages.has(msg.id) && (
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      )}
                      {/* Status de mensagem do agente */}
                      {msg.sender === 'agent' && (
                        <div className="flex items-center gap-1">
                          {msg.status === 'sent' && <Check className="w-3 h-3" />}
                          {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                        </div>
                      )}
                    </div>
                    
                    {/* Ícones de Ação - Aparecem no hover */}
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {/* Botão de Favoritar */}
                      <motion.button
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 15
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleStarred(msg.id)}
                        className={`
                          p-1.5 rounded-full transition-all duration-200 ease-out shadow-sm
                          ${starredMessages.has(msg.id)
                            ? 'bg-yellow-400/30 text-yellow-500 hover:bg-yellow-400/40 border border-yellow-400/20'
                            : msg.sender === 'agent' 
                              ? 'bg-white/25 text-white hover:bg-white/35 border border-white/10' 
                              : 'bg-gray-600/25 text-gray-600 hover:bg-gray-600/35 border border-gray-600/10'
                          }
                        `}
                        title={starredMessages.has(msg.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Star className={`w-3.5 h-3.5 ${starredMessages.has(msg.id) ? 'fill-current' : ''}`} />
                      </motion.button>

                     

                      {/* Ícone de Transcrição de Áudio - Só para áudios (removido duplicata) */}
                      {(msg.type === 'audio' || (msg as any).mimetype?.includes('audio') || 
                        ((msg as any).mediaUrl && (
                          (msg as any).mediaUrl.includes('.oga') ||
                          (msg as any).mediaUrl.includes('.ogg') ||
                          (msg as any).mediaUrl.includes('.mp3') ||
                          (msg as any).mediaUrl.includes('.wav') ||
                          (msg as any).mediaUrl.includes('.webm')
                        ))) && (
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              p-1.5 rounded-full transition-all duration-200 ease-out shadow-sm
                              ${msg.sender === 'agent' 
                                ? 'bg-white/25 text-white hover:bg-white/35 border border-white/10' 
                                : 'bg-blue-600/25 text-blue-600 hover:bg-blue-600/35 border border-blue-600/10'
                              }
                            `}
                            title="Transcrever áudio"
                          >
                            <AudioLines className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              p-1.5 rounded-full transition-all duration-200 ease-out shadow-sm
                              ${msg.sender === 'agent' 
                                ? 'bg-white/25 text-white hover:bg-white/35 border border-white/10' 
                                : 'bg-orange-600/25 text-orange-600 hover:bg-orange-600/35 border border-orange-600/10'
                              }
                            `}
                            title="Traduzir áudio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      )}

                      {/* Menu de Contexto - Não mostrar para mensagens de áudio */}
                      {msg.type !== 'voice' && msg.type !== 'audio' && (
                        <MessageContextMenu
                          message={{
                            ...msg,
                            chatId: chatId || '',
                            fromMe: msg.sender === 'agent',
                            author: msg.sender === 'agent' ? 'agent' : 'user',
                            body: msg.content
                          } as any}
                          isStarred={isStarred(msg.id)}
                          onReply={(message) => setReplyingTo(message)}
                          onForward={(message) => {
                            setMessageToForward(message)
                            setShowForwardModal(true)
                          }}
                          onEdit={(message) => {
                            setEditingMessage(message)
                            setShowEditModal(true)
                          }}
                          onDelete={(message) => messageActions.deleteMessage(message.id)}
                          onStar={async (message) => {
                            if (chatId) {
                              await toggleStar(message.id, chatId)
                            }
                          }}
                          onCopy={(text) => messageActions.copyToClipboard(text)}
                          onTranslate={(message) => handleAIResponse(message)}
                          onTranslateReal={(message) => handleTranslateMessage(message)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isContactTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-slate-700/60 dark:via-slate-800/70 dark:to-slate-900/80 dark:backdrop-blur-md dark:border dark:border-slate-600/30 dark:shadow-lg dark:shadow-black/40 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Typing Indicator */}
          {isContactTyping(extractChatId(conversation) || '') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="bg-gray-200 rounded-2xl px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600 mr-2">digitando</span>
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-gray-500 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-500 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
        
        {/* 🔔 Botão flutuante "Nova mensagem" */}
        <AnimatePresence>
          {showNewMessageIndicator && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => {
                chatContainerRef.current?.scrollTo({
                  top: chatContainerRef.current.scrollHeight,
                  behavior: 'smooth'
                })
                setShowNewMessageIndicator(false)
              }}
              className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-colors z-10"
            >
              <ChevronDown className="w-4 h-4" />
              Nova mensagem
            </motion.button>
          )}
        </AnimatePresence>
      </div>



      {/* Input de Busca Compacto na parte inferior */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background/98 backdrop-blur-sm border-t border-border z-50 shadow-sm"
          >
            <div className="px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar mensagens..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentMatchIndex(0)
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    autoFocus
                  />
                </div>
                
                {/* Contador e navegação */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{currentMatchIndex + 1} de {searchResults.length}</span>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigateToMatch('prev')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        disabled={searchResults.length === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigateToMatch('next')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        disabled={searchResults.length === 0}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                )}
                
                {searchQuery && searchResults.length === 0 && (
                  <span className="text-xs text-gray-400">Nenhuma mensagem</span>
                )}
                
                {/* Botão Fechar */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery('')
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div 
        className={`p-6 bg-background border-t border-border relative ${
          dragOver ? 'bg-blue-500/10 border-blue-400' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag Overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-500 font-medium">Solte os arquivos aqui</p>
            </div>
          </div>
        )}
        
        {/* Inputs ocultos para upload */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'file')}
          accept="*/*"
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'image')}
          accept="image/*"
        />
        <input
          ref={videoInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'video')}
          accept="video/*"
        />
        
     
        
        <div className="flex items-center gap-3">
          {/* Quick Actions Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleQuickActionsSidebar?.()}
            className="p-3 bg-accent hover:bg-accent/80 rounded-xl transition-all duration-300 relative"
            title="Ações Rápidas"
          >
            <MessageSquare className="w-5 h-5 text-foreground" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-background"></div>
          </motion.button>


          {/* Attachment Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-3 bg-accent hover:bg-accent/80 rounded-xl transition-all duration-300 relative"
            title="Anexar arquivo"
          >
            <Paperclip className="w-5 h-5 text-foreground" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </motion.button>

          {/* Input Area */}
          <div className="flex-1 relative">
            {/* Reply Preview */}
            {replyingTo && (
              <div className="mb-2 p-3 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-blue-500 font-medium">
                      Respondendo para {replyingTo.sender === 'agent' ? 'Você' : replyingTo.author}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {replyingTo.body || replyingTo.content}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Link Preview */}
            {detectedLink && (
              <div className="mb-2">
                <InputLinkPreview 
                  url={detectedLink} 
                  onRemove={() => setDetectedLink(null)}
                />
              </div>
            )}

            {/* Message Input */}
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-foreground placeholder:text-muted-foreground"
            />
            

            
            {/* Emoji Picker */}
            <EmojiPicker
              isOpen={showEmojiPicker}
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
            
            {/* Attachment Menu */}
            {showAttachmentMenu && (
              <motion.div
                ref={attachmentModalRef}
                key="attachment-modal-unique"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-16 left-0 z-50"
                data-attachment-menu
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="bg-background rounded-2xl shadow-2xl border border-border p-4 min-w-[280px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Anexar arquivos</h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAttachmentMenu(false)}
                        className="p-1 hover:bg-accent rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    </div>
                    
                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Imagem */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          imageInputRef.current?.click()
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Imagem</span>
                        <span className="text-xs text-muted-foreground">JPG, PNG, GIF</span>
                      </motion.button>
                      
                      {/* Vídeo */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          videoInputRef.current?.click()
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Vídeo</span>
                        <span className="text-xs text-muted-foreground">MP4, AVI, MOV</span>
                      </motion.button>
                      
                      {/* Arquivo */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          fileInputRef.current?.click()
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-green-400 hover:bg-green-500/10 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Documento</span>
                        <span className="text-xs text-muted-foreground">PDF, DOC, TXT</span>
                      </motion.button>
                      
                      {/* Contato */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMediaModal('contact')
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Contact className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Contato</span>
                        <span className="text-xs text-muted-foreground">Compartilhar</span>
                      </motion.button>
                      
                      {/* Localização */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMediaModal('location')
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-green-400 hover:bg-green-500/10 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Localização</span>
                        <span className="text-xs text-muted-foreground">Enviar local</span>
                      </motion.button>
                      
                      {/* Enquete */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMediaModal('poll')
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Enquete</span>
                        <span className="text-xs text-muted-foreground">Criar votação</span>
                      </motion.button>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        Arraste e solte arquivos aqui ou clique para selecionar
                      </p>
                    </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Emoji Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 bg-accent hover:bg-accent/80 rounded-xl transition-all duration-300 relative"
            title="Emojis"
          >
            <Smile className="w-5 h-5 text-foreground" />
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-background"></div>
          </motion.button>

          {audioRecorder.isRecording ? (
            <div className="flex items-center gap-2">
              {/* Indicador de gravação */}
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-500">
                  {formatDuration(audioRecorder.duration)}
                </span>
              </div>
              
              {/* Botões de controle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={audioRecorder.pauseRecording}
                className="p-3 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl transition-all duration-300"
                title="Pausar gravação"
              >
                <Pause className="w-5 h-5 text-yellow-500" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAudioRecord}
                className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                title="Parar gravação"
              >
                <Square className="w-5 h-5 text-red-500" />
              </motion.button>
            </div>
          ) : audioRecorder.audioBlob ? (
            <div className="flex items-center gap-2">
              {/* Preview do áudio */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg">
                <Mic className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">
                  {formatDuration(audioRecorder.duration)}
                </span>
              </div>
              
              {/* Botões de ação */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendAudio}
                className="p-3 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all duration-300"
                title="Enviar áudio"
              >
                <Send className="w-5 h-5 text-green-500" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={audioRecorder.clearRecording}
                className="p-3 bg-accent hover:bg-accent/80 rounded-xl transition-all duration-300"
                title="Cancelar"
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAudioRecord}
              className="p-3 bg-accent hover:bg-accent/80 rounded-xl transition-all duration-300"
              title="Gravar áudio"
            >
              <Mic className="w-5 h-5 text-foreground" />
            </motion.button>
          )}

          {/* IA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAgenteModal(true)}
            className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all duration-300 relative"
            title={
              isGenerating 
                ? `Gerando resposta... (${agenteAtual?.nome})` 
                : agenteAtivo 
                  ? `Agente ativo: ${agenteAtual?.nome}` 
                  : "Selecionar agente IA"
            }
          >
            <Bot className="w-5 h-5 text-blue-500" />
            {/* Badge - Amarelo pulsando se gerando, verde se ativo, vermelho se inativo */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background transition-all duration-300 ${
              isGenerating 
                ? 'bg-yellow-500 animate-pulse' 
                : agenteAtivo 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
            }`}></div>
            {/* Indicador adicional quando gerando */}
            {isGenerating && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
            )}
          </motion.button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!message.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      
      {/* Modais */}
      <UniversalAgendamentoModal
        isOpen={showAgendamentoModal}
        onClose={() => setShowAgendamentoModal(false)}
        onSave={handleAgendamentoSave}
        contactData={getContactData()}
        mode="create"
      />
      
      <CriarOrcamentoModal
        isOpen={showOrcamentoModal}
        onClose={() => setShowOrcamentoModal(false)}
        onSave={handleOrcamentoSave}
        contactData={getContactData()}
        disableContactFields={true}
      />
      
      <AssinaturaModal
        isOpen={showAssinaturaModal}
        onClose={() => setShowAssinaturaModal(false)}
        onSave={handleAssinaturaSave}
        chatId={conversation?.id}
        contactData={getContactData()}
      />
      
      <TagsModal
        isOpen={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        onSave={handleTagsSave}
        contactData={getContactData()}
        currentTags={contatoTags || []}
      />
      
      <VideoChamadaModal
        isOpen={showVideoChamadaModal}
        onClose={() => setShowVideoChamadaModal(false)}
        onStartCall={handleVideoChamadaStart}
        contactData={getContactData()}
      />
      
      <LigacaoModal
        isOpen={showLigacaoModal}
        onClose={() => setShowLigacaoModal(false)}
        onStartCall={handleLigacaoStart}
        contactData={getContactData()}
      />
      
      <TransferirAtendimentoModal
        isOpen={showTransferirModal}
        onClose={() => setShowTransferirModal(false)}
        onConfirm={handleTransferirSave}
        chatId={conversation?.id}
        contactData={getContactData()}
      />
      
      <CompartilharTelaModal
        isOpen={showCompartilharTelaModal}
        onClose={() => setShowCompartilharTelaModal(false)}
        onStartShare={handleCompartilharTelaStart}
        contactData={getContactData()}
      />

      <AgenteSelectionModal
        isOpen={showAgenteModal}
        onClose={() => setShowAgenteModal(false)}
        chatId={conversation?.id}
        onAgentActivated={() => {
          refetchAgente()
        }}
      />


      {/* Modal de Encaminhamento */}
      {showForwardModal && messageToForward && (
        <ForwardMessageModal
          isOpen={showForwardModal}
          onClose={() => {
            setShowForwardModal(false)
            setMessageToForward(null)
          }}
          message={messageToForward}
          onForward={async (toChatIds) => {
            try {
              await messageActions.forwardMessage(messageToForward.id, toChatIds)
              setShowForwardModal(false)
              setMessageToForward(null)
            } catch (error) {
              console.error('Erro ao encaminhar mensagem:', error)
            }
          }}
        />
      )}

      {/* Modal de Edição */}
      {showEditModal && editingMessage && (
        <EditMessageModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingMessage(null)
          }}
          initialText={editingMessage.content || editingMessage.body || ''}
          onSave={async (newText) => {
            try {
              await messageActions.editMessage(editingMessage.id, newText)
              setShowEditModal(false)
              setEditingMessage(null)
              // Forçar reload das mensagens
              window.location.reload()
            } catch (error) {
              console.error('Erro ao editar mensagem:', error)
            }
          }}
          loading={messageActions.loading}
        />
      )}

      {/* Modal de Envio de Mídia (Imagem/Vídeo/Documento) */}
      {showSendMediaModal && (
        <MediaSendModal
          isOpen={showSendMediaModal}
          onClose={() => {
            setShowSendMediaModal(false)
            setSelectedMediaFile(null)
            setSelectedMediaType(null)
          }}
          onSend={handleMediaSend}
          mediaType={selectedMediaType || 'document'}
          file={selectedMediaFile}
        />
      )}

      {/* Modal de Mídia Especial (Contato/Localização/Enquete) */}
      {showMediaModal && chatId && (
        <SpecialMediaModal
          isOpen={!!showMediaModal}
          onClose={() => setShowMediaModal(null)}
          type={showMediaModal}
          chatId={chatId}
          onSend={handleSpecialMediaSend}
        />
      )}

      {/* Quick Actions Sidebar */}
      <QuickActionsSidebar
        isOpen={isQuickActionsSidebarOpen}
        onClose={() => onToggleQuickActionsSidebar?.()}
        activeChatId={conversation?.id || conversation?.jid}
        onSelectAction={async (action) => {
          // Se há ações editadas, executar diretamente
          if (action.editedActions && action.editedActions.length > 0) {
            console.log('🎯 Executando resposta rápida com ações editadas:', action.editedActions)
            
            try {
              const response = await fetch(`/api/respostas-rapidas/${action.originalData?.id}/executar`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  chat_id: conversation?.id || conversation?.jid,
                  acoes_customizadas: action.editedActions // Enviar ações editadas
                })
              })
              
              if (response.ok) {
                console.log('✅ Resposta rápida executada com sucesso!')
              } else {
                console.error('❌ Erro ao executar resposta rápida:', await response.text())
              }
            } catch (error) {
              console.error('❌ Erro ao executar resposta rápida:', error)
            }
            return
          }
          
          // Fluxo normal: abre modal de edição para permitir edição antes do envio
          const textContent = action.originalData?.acoes?.find(a => a.tipo === 'texto')?.conteudo?.texto || action.content
          setEditingText(textContent)
          setEditingAction(action)
          setShowEditTextModal(true)
        }}
        onEditAction={(action) => {
          // Abre modal de edição diretamente
          const textContent = action.originalData?.acoes?.find(a => a.tipo === 'texto')?.conteudo?.texto || action.content
          setEditingText(textContent)
          setEditingAction(action)
          setShowEditTextModal(true)
        }}
        onScheduleAction={(action) => {
          // TODO: Implementar agendamento
          console.log('Agendar ação:', action.title)
          alert('Funcionalidade de agendamento em desenvolvimento')
        }}
        onCreateWithAI={() => {
          // Abre modal de edição para gerar novo texto com IA
          setEditingText('')
          setEditingAction(null)
          setShowEditTextModal(true)
        }}
        selectedContact={conversation}
      />

      {/* Anotações Sidebar */}
      <AnotacoesSidebar
        isOpen={isAnotacoesSidebarOpen}
        onClose={() => onToggleAnotacoesSidebar?.()}
        activeChatId={conversation?.id || conversation?.jid}
        selectedContact={conversation}
      />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        contactId={conversation?.id || ''}
        contactName={conversation?.name || conversation?.pushname}
      />

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={showCreateContactModal}
        onClose={() => setShowCreateContactModal(false)}
        preFilledChatId={chatId}
        autoAddToKanban={true}
        onContactCreated={(contactData) => {
          console.log('✅ [ChatArea] Contato criado e vinculado ao kanban:', contactData)
          setShowCreateContactModal(false)
        }}
      />

      {/* Lead Info Modal - Quando já é contato */}
      {showLeadInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Lead já Cadastrado! 🎯
            </h3>
            <p className="text-muted-foreground mb-4">
              <strong>{conversation?.name || conversation?.pushname}</strong> já está salvo como lead no sistema.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ Contato sincronizado no Kanban<br/>
                ✅ Disponível para agendamentos<br/>
                ✅ Histórico de conversas salvo
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeadInfoModal(false)}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowLeadInfoModal(false)
                  // Abrir kanban em nova aba para ver o lead
                  window.open('/dashboard/admin/kanban', '_blank')
                }}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Ver no Kanban
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
