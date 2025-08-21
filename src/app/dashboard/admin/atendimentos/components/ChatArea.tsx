'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  Search,
  Star,
  Archive,
  Trash2,
  UserPlus,
  Settings,
  X,
  Play,
  Pause,
  Download,
  Eye,
  EyeOff,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Users,
  MapPin,
  Contact,
  BarChart3,
  Check,
  CheckCheck,
  Languages,
  Volume2,
  VolumeX,
  AudioLines,
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  File,
  Reply,
  Forward,
  Edit,
  Copy,
  ExternalLink,
  User,
  Wifi,
  WifiOff,
  MessageSquare,
  FileSignature,
  Hash,
  Monitor,
  Upload,
  Square,
  Bot
} from 'lucide-react'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { useAudioRecorder, formatDuration, blobToFile } from '@/hooks/useAudioRecorder'
import { usePresence } from '@/hooks/usePresence'
import EmojiPicker from '@/components/EmojiPicker'
import { MessageContextMenu } from '@/components/MessageContextMenu'
import { EditMessageModal } from '@/components/EditMessageModal'
import ForwardMessageModal from '@/components/ForwardMessageModal'
import { MediaSendModal } from '@/components/MediaSendModal'
import MessageContent from '@/components/MessageContent'
import InputLinkPreview from '@/components/InputLinkPreview'
import { useMessageActions } from '@/hooks/useMessageActions'
import AgendamentoModal from './modals/AgendamentoModal'
import OrcamentoModal from './modals/OrcamentoModal'
import AssinaturaModal from './modals/AssinaturaModal'
import TagsModal from './modals/TagsModal'
import VideoChamadaModal from './modals/VideoChamadaModal'
import LigacaoModal from './modals/LigacaoModal'
import CompartilharTelaModal from './modals/CompartilharTelaModal'

interface ChatAreaProps {
  conversation: any
  messages: any[]
  onSendMessage: (message: string) => void
  onTyping?: (chatId: string, isTyping: boolean) => void
  onMarkAsRead?: (chatId: string) => void
  isLoading?: boolean
  isTyping?: boolean
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
    type: msg.type || 'text',
    mediaUrl: msg.mediaUrl || msg.url || null,
    filename: msg.filename || msg.name || null
  }))
}

export default function ChatArea({ 
  conversation, 
  messages: propMessages, 
  onSendMessage,
  onTyping,
  onMarkAsRead,
  isLoading = false,
  isTyping: propIsTyping = false 
}: ChatAreaProps) {
  const [message, setMessage] = useState('')
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [kanbanInfo, setKanbanInfo] = useState<{quadro: string, coluna: string, color: string} | null>(null)
  const { startTyping, stopTyping, isOnline, isTyping: isContactTyping, getChatPresence } = usePresence()
  
  // Função para buscar informações do quadro e coluna
  const getKanbanInfo = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      // Buscar todos os quadros do usuário
      const quadrosResponse = await fetch(`${backendUrl}/api/kanban/quadros`, {
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
          const metadataResponse = await fetch(`${backendUrl}/api/kanban/${quadro.id}/metadata`, {
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
              const quadroResponse = await fetch(`${backendUrl}/api/kanban/quadros/${quadro.id}`, {
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
          console.log('Erro ao buscar metadados do quadro:', quadro.id, error)
        }
      }
      
      return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
    } catch (error) {
      console.error('Erro ao buscar informações do Kanban:', error)
      return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
    }
  }

  
  // Função para extrair chatId
  const extractChatId = (conversation: any): string | null => {
    if (typeof conversation?.id === 'string') {
      return conversation.id
    } else if (conversation?.id && (conversation.id as any)._serialized) {
      return (conversation.id as any)._serialized
    }
    return null
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
  
  // Transformar mensagens da WAHA API para o formato do componente
  const messages = transformMessages(propMessages || [])
  const [isTyping, setIsTyping] = useState(propIsTyping)
  const [showQuickActions, setShowQuickActions] = useState(false)
  
  // Estados para mídia
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  
  // Estados para modais
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false)
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false)
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showVideoChamadaModal, setShowVideoChamadaModal] = useState(false)
  const [showLigacaoModal, setShowLigacaoModal] = useState(false)
  const [showCompartilharTelaModal, setShowCompartilharTelaModal] = useState(false)
  
  // Estados para novas funcionalidades
  const [showSearch, setShowSearch] = useState(false)
  const [showMediaModal, setShowMediaModal] = useState<'contact' | 'location' | 'poll' | null>(null)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const [messageToForward, setMessageToForward] = useState<any>(null)
  const [detectedLink, setDetectedLink] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [editingMessage, setEditingMessage] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [starredMessages, setStarredMessages] = useState<Set<string>>(() => {
    // Carregar mensagens favoritadas do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`starredMessages_${conversation?.id}`)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
  
  // Hook para ações de mensagem
  const chatId = extractChatId(conversation)
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

  // Marcar mensagens como vistas quando o chat é aberto ou mensagens mudam
  useEffect(() => {
    if (messages && messages.length > 0 && conversation) {
      // Filtrar mensagens não vistas do contato (não do agente)
      const unseenMessages = messages
        .filter(msg => msg.sender !== 'agent' && !(msg as any).seen)
        .map(msg => msg.id || (msg as any)._data?.id?.id)
        .filter(Boolean)
      
      if (unseenMessages.length > 0) {
        // Aguardar um pouco antes de marcar como visto para simular leitura
        const timer = setTimeout(() => {
          markMessagesAsSeen(unseenMessages)
        }, 1000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [messages, conversation])

  // Scroll inicial para o final quando conversa carrega
  useEffect(() => {
    if (messages.length > 0) {
      // Pequeno delay para garantir que o DOM foi renderizado
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [conversation?.id])

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

  // Handlers para modais
  const handleAgendamentoSave = (agendamento: any) => {
    console.log('Agendamento criado:', agendamento)
    // TODO: Implementar salvamento no backend
  }

  const handleOrcamentoSave = (orcamento: any) => {
    console.log('Orçamento criado:', orcamento)
    // TODO: Implementar salvamento no backend
  }

  const handleAssinaturaSave = (assinatura: any) => {
    console.log('Assinatura criada:', assinatura)
    // TODO: Implementar salvamento no backend
  }

  const handleTagsSave = (tags: string[]) => {
    console.log('Tags aplicadas:', tags)
    // TODO: Implementar salvamento no backend
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

  // Função para marcar mensagens como vistas (usando nova rota anti-bloqueio)
  const markMessagesAsSeen = async (messageIds: string[]) => {
    if (!messageIds.length) return
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      if (!token) return
      
      // Usar nova rota anti-bloqueio diretamente no backend
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
      nome: conversation.name,
      telefone: conversation.phone || extractChatId(conversation),
      avatar: conversation.profilePictureUrl
    }
  }
  
  // Funções para mídia
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0]
    if (!file || !conversation) return
    
    const chatId = extractChatId(conversation)
    if (!chatId) return
    
    try {
      if (type === 'image') {
        await mediaUpload.sendImage(chatId, file)
      } else if (type === 'video') {
        await mediaUpload.sendVideo(chatId, file)
      } else {
        await mediaUpload.sendFile(chatId, file)
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error)
    }
    
    // Limpar input
    event.target.value = ''
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
    if (audioRecorder.isRecording) {
      audioRecorder.stopRecording()
    } else {
      await audioRecorder.startRecording()
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
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/reply`, {
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
      <div className="flex-1 flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#273155] to-[#2a3660] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione uma conversa</h3>
          <p className="text-gray-600">Escolha uma conversa da lista para começar a atender</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 bg-white border-b border-gray-200/50 px-6 flex items-center justify-between backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#273155] to-[#2a3660] rounded-xl flex items-center justify-center overflow-hidden">
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
            <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isOnline(extractChatId(conversation) || '') ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600">
                {isOnline(extractChatId(conversation) || '') ? 'Online' : 'Offline'}
                {isContactTyping(extractChatId(conversation) || '') && ' • digitando...'}
              </span>
            </div>
          </div>


        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Buscar Mensagens */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Buscar Mensagens"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          {/* Resposta Rápida */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 relative"
            title="Respostas Rápidas"
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
            {/* Pin verde */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </motion.button>
          
          {/* Agenda */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAgendamentoModal(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Agendar"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          {/* Orçamento */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOrcamentoModal(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Orçamento"
          >
            <DollarSign className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          {/* Assinatura */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAssinaturaModal(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Assinatura"
          >
            <FileSignature className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          {/* Badge Tag */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTagsModal(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Tags"
          >
            <Hash className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLigacaoModal(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Telefone"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVideoChamadaModal(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Vídeo Chamada"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCompartilharTelaModal(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
            title="Compartilhar Tela"
          >
            <Monitor className="w-5 h-5 text-gray-600" />
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
              className="inline-flex items-center px-3 py-1 text-xs text-gray-600 rounded-full font-medium shadow-sm ml-2 flex-shrink-0"
              style={{ backgroundColor: '#e5e7eb' }}
            >
              <Tag className="w-3 h-3 mr-1" />
              Carregando...
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white scrollbar-chat">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
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
                  className={`p-3 rounded-lg ${
                    msg.sender === 'agent' 
                      ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-lg' 
                      : 'bg-white border border-gray-200'
                  } max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl shadow-sm`}
                  onDoubleClick={() => {
                    if (msg.sender === 'agent' && msg.type === 'text') {
                      setEditingMessage(msg)
                      setShowEditModal(true)
                    }
                  }}
                >
                  {/* Renderizar conteúdo da mensagem com mídia */}
                  
                  {/* Verificar se é localização */}
                  {msg.type === 'location' || (msg as any).location ? (
                    <div className="mb-2">
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        msg.sender === 'agent' ? 'bg-white/10' : 'bg-gray-50'
                      }`}>
                        <div className={`p-2 rounded-full ${
                          msg.sender === 'agent' ? 'bg-white/20' : 'bg-blue-100'
                        }`}>
                          <MapPin className={`w-4 h-4 ${
                            msg.sender === 'agent' ? 'text-white' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${
                            msg.sender === 'agent' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {(msg as any).location?.title || msg.content || 'Localização'}
                          </div>
                          {(msg as any).location?.address && (
                            <div className={`text-xs mt-1 ${
                              msg.sender === 'agent' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {(msg as any).location.address}
                            </div>
                          )}
                          <div className={`text-xs mt-1 ${
                            msg.sender === 'agent' ? 'text-white/70' : 'text-gray-500'
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
                            msg.sender === 'agent' ? 'bg-white/20 hover:bg-white/30' : 'bg-blue-100 hover:bg-blue-200'
                          }`}
                        >
                          <ExternalLink className={`w-3 h-3 ${
                            msg.sender === 'agent' ? 'text-white' : 'text-blue-600'
                          }`} />
                        </button>
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
                  ) : (msg as any).mediaUrl && (
                    (msg as any).mediaUrl.includes('.oga') ||
                    (msg as any).mediaUrl.includes('.ogg') ||
                    (msg as any).mediaUrl.includes('.mp3') ||
                    (msg as any).mediaUrl.includes('.wav') ||
                    (msg as any).mediaUrl.includes('.webm') ||
                    (msg as any).mediaUrl.includes('.bin') ||
                    msg.type === 'audio' || 
                    (msg as any).mimetype?.includes('audio')
                  ) ? (
                    <div className="mb-2">
                      {/* Verificar se tem dados de mídia válidos */}
                      {(msg as any).media?.data ? (
                        <div className={`flex items-center gap-3 p-3 rounded-lg ${
                          msg.sender === 'agent' ? 'bg-white/10' : 'bg-gray-50'
                        }`}>
                          <div className={`p-2 rounded-full ${
                            msg.sender === 'agent' ? 'bg-white/20' : 'bg-blue-100'
                          }`}>
                            <AudioLines className={`w-4 h-4 ${
                              msg.sender === 'agent' ? 'text-white' : 'text-blue-600'
                            }`} />
                          </div>
                          <audio 
                            controls 
                            className="w-full max-w-xs" 
                            preload="metadata"
                          >
                            <source src={`data:${(msg as any).media.mimetype || 'audio/webm'};base64,${(msg as any).media.data}`} type="audio/webm" />
                            <source src={`data:${(msg as any).media.mimetype || 'audio/ogg'};base64,${(msg as any).media.data}`} type="audio/ogg" />
                            Áudio não suportado
                          </audio>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed ${
                          msg.sender === 'agent' ? 'bg-orange-50/10 border-orange-300/50' : 'bg-orange-50 border-orange-200'
                        }`}>
                          <div className={`p-2 rounded-full ${
                            msg.sender === 'agent' ? 'bg-orange-200/20' : 'bg-orange-100'
                          }`}>
                            <AudioLines className={`w-4 h-4 ${
                              msg.sender === 'agent' ? 'text-orange-300' : 'text-orange-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              msg.sender === 'agent' ? 'text-orange-200' : 'text-orange-700'
                            }`}>
                              🎤 Mensagem de Áudio
                            </p>
                            <p className={`text-xs ${
                              msg.sender === 'agent' ? 'text-orange-300/80' : 'text-orange-600'
                            }`}>
                              Arquivo não disponível (mensagem antiga)
                            </p>
                          </div>
                        </div>
                      )}
                      {(msg.content || (msg as any).caption) && (
                        <p className={`text-sm mt-2 ${msg.sender === 'agent' ? 'text-white/90' : 'text-gray-700'}`}>
                          {msg.content || (msg as any).caption}
                        </p>
                      )}
                    </div>
                  ) : msg.type === 'video' && (msg as any).mediaUrl ? (
                    <div className="mb-2">
                      <video 
                        controls 
                        className="max-w-xs rounded-lg shadow-sm"
                        preload="metadata"
                      >
                        <source src={(msg as any).mediaUrl} type="video/mp4" />
                        <source src={(msg as any).mediaUrl} type="video/webm" />
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                      {(msg.content || (msg as any).caption) && <p className="text-sm mt-2">{msg.content || (msg as any).caption}</p>}
                    </div>
                  ) : msg.type === 'document' && (msg as any).mediaUrl ? (
                    <div className="mb-2">
                      <a 
                        href={(msg as any).mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        {(msg as any).fileName || (msg as any).filename || 'Documento'}
                      </a>
                      {(msg.content || (msg as any).caption) && <p className="text-sm mt-2">{msg.content || (msg as any).caption}</p>}
                    </div>
                  ) : (
                    <MessageContent 
                      content={msg.content} 
                      className={msg.sender === 'agent' ? 'text-white/90' : 'text-gray-700'}
                    />
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
                      {/* Ícone de Tradução */}
                      <motion.button
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 10
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          p-1.5 rounded-full transition-all duration-200 ease-out shadow-sm
                          ${msg.sender === 'agent' 
                            ? 'bg-white/25 text-white hover:bg-white/35 border border-white/10' 
                            : 'bg-blue-600/25 text-blue-600 hover:bg-blue-600/35 border border-blue-600/10'
                          }
                        `}
                        title="Traduzir mensagem"
                      >
                        <Languages className="w-3.5 h-3.5" />
                      </motion.button>

                      {/* Ícone de Transcrição de Áudio */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          scale: [1, 1.03, 1],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
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

                      {/* Menu de Contexto */}
                      <MessageContextMenu
                        message={{
                          ...msg,
                          chatId: chatId || '',
                          fromMe: msg.sender === 'agent',
                          author: msg.sender === 'agent' ? 'agent' : 'user',
                          body: msg.content
                        } as any}
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
                        onStar={(message) => {
                          messageActions.starMessage(message.id)
                          const newStarred = new Set(starredMessages)
                          if (newStarred.has(message.id)) {
                            newStarred.delete(message.id)
                          } else {
                            newStarred.add(message.id)
                          }
                          setStarredMessages(newStarred)
                          
                          // Salvar no localStorage
                          if (typeof window !== 'undefined' && conversation?.id) {
                            localStorage.setItem(`starredMessages_${conversation.id}`, JSON.stringify(Array.from(newStarred)))
                          }
                        }}
                        onCopy={(text) => messageActions.copyToClipboard(text)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
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
      </div>



      {/* Message Input */}
      <div 
        className={`p-6 bg-white border-t border-gray-200/50 relative ${
          dragOver ? 'bg-blue-50 border-blue-300' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag Overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-blue-100/80 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">Solte os arquivos aqui</p>
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
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
            title="Ações Rápidas"
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* Emoji Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
            title="Emojis"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* Attachment Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
            title="Anexar arquivo"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* Input Area */}
          <div className="flex-1 relative">
            {/* Reply Preview */}
            {replyingTo && (
              <div className="mb-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-blue-600 font-medium">
                      Respondendo para {replyingTo.sender === 'agent' ? 'Você' : replyingTo.author}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {replyingTo.body || replyingTo.content}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[280px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-800">Anexar arquivo</h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAttachmentMenu(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </motion.button>
                    </div>
                    
                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Imagem */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          imageInputRef.current?.click()
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Imagem</span>
                        <span className="text-xs text-gray-500">JPG, PNG, GIF</span>
                      </motion.button>
                      
                      {/* Vídeo */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          videoInputRef.current?.click()
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Vídeo</span>
                        <span className="text-xs text-gray-500">MP4, AVI, MOV</span>
                      </motion.button>
                      
                      {/* Arquivo */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          fileInputRef.current?.click()
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Documento</span>
                        <span className="text-xs text-gray-500">PDF, DOC, TXT</span>
                      </motion.button>
                      
                      {/* Contato */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMediaModal('contact')
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Contact className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Contato</span>
                        <span className="text-xs text-gray-500">Enviar vCard</span>
                      </motion.button>
                      
                      {/* Localização */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMediaModal('location')
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Localização</span>
                        <span className="text-xs text-gray-500">Enviar local</span>
                      </motion.button>
                      
                      {/* Enquete */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowMediaModal('poll')
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Enquete</span>
                        <span className="text-xs text-gray-500">Criar votação</span>
                      </motion.button>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 text-center">
                        Arraste e solte arquivos aqui ou clique para selecionar
                      </p>
                    </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Audio Button */}
          {audioRecorder.isRecording ? (
            <div className="flex items-center gap-2">
              {/* Tempo de gravação */}
              <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono text-red-600">
                  {formatDuration(audioRecorder.duration)}
                </span>
              </div>
              
              {/* Botões de controle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={audioRecorder.pauseRecording}
                className="p-3 bg-yellow-100 hover:bg-yellow-200 rounded-xl transition-all duration-300"
                title="Pausar gravação"
              >
                <Pause className="w-5 h-5 text-yellow-600" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAudioRecord}
                className="p-3 bg-red-100 hover:bg-red-200 rounded-xl transition-all duration-300"
                title="Parar gravação"
              >
                <Square className="w-5 h-5 text-red-600" />
              </motion.button>
            </div>
          ) : audioRecorder.audioBlob ? (
            <div className="flex items-center gap-2">
              {/* Preview do áudio */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
                <Mic className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {formatDuration(audioRecorder.duration)}
                </span>
              </div>
              
              {/* Botões de ação */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendAudio}
                className="p-3 bg-green-100 hover:bg-green-200 rounded-xl transition-all duration-300"
                title="Enviar áudio"
              >
                <Send className="w-5 h-5 text-green-600" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={audioRecorder.clearRecording}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
                title="Cancelar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAudioRecord}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
              title="Gravar áudio"
            >
              <Mic className="w-5 h-5 text-gray-600" />
            </motion.button>
          )}

          {/* IA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-300"
            title="Ativar IA"
          >
            <Bot className="w-5 h-5 text-blue-600" />
          </motion.button>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!message.trim()}
            className="p-3 bg-gradient-to-r from-[#273155] to-[#2a3660] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      
      {/* Modais */}
      <AgendamentoModal
        isOpen={showAgendamentoModal}
        onClose={() => setShowAgendamentoModal(false)}
        onSave={handleAgendamentoSave}
        contactData={getContactData()}
      />
      
      <OrcamentoModal
        isOpen={showOrcamentoModal}
        onClose={() => setShowOrcamentoModal(false)}
        onSave={handleOrcamentoSave}
        contactData={getContactData()}
      />
      
      <AssinaturaModal
        isOpen={showAssinaturaModal}
        onClose={() => setShowAssinaturaModal(false)}
        onSave={handleAssinaturaSave}
        contactData={getContactData()}
      />
      
      <TagsModal
        isOpen={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        onSave={handleTagsSave}
        contactData={getContactData()}
        currentTags={conversation?.tags || []}
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
      
      <CompartilharTelaModal
        isOpen={showCompartilharTelaModal}
        onClose={() => setShowCompartilharTelaModal(false)}
        onStartShare={handleCompartilharTelaStart}
        contactData={getContactData()}
      />
      
      {/* Modal de Busca */}
      {showSearch && chatId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Buscar Mensagens</h3>
            <input 
              type="text" 
              placeholder="Digite para buscar..."
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowSearch(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal de Envio de Mídia Especial */}
      {showMediaModal && chatId && (
        <MediaSendModal
          type={showMediaModal}
          chatId={chatId}
          onClose={() => setShowMediaModal(null)}
          onSend={async (data) => {
            try {
              if (showMediaModal === 'contact') {
                await messageActions.sendContact(data.contactId, data.name)
              } else if (showMediaModal === 'location') {
                await messageActions.sendLocation(data.latitude, data.longitude, data.title, data.address)
              } else if (showMediaModal === 'poll') {
                await messageActions.sendPoll(data.name, data.options, data.multipleAnswers)
              }
              setShowMediaModal(null)
            } catch (error) {
              console.error('Erro ao enviar mídia:', error)
            }
          }}
        />
      )}
    </div>
  )
}
