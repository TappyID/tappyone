'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  Info, 
  MoreVertical, 
  User,
  Bot,
  Tag,
  MessageSquare,
  Calendar,
  DollarSign,
  FileSignature,
  Hash,
  Mic,
  Clock,
  CheckCheck,
  Check,
  Monitor,
  Languages,
  AudioLines,
  Image,
  FileText,
  Play,
  Pause,
  Square,
  Upload,
  X
} from 'lucide-react'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { useAudioRecorder, formatDuration, blobToFile } from '@/hooks/useAudioRecorder'
import EmojiPicker from '@/components/EmojiPicker'
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
  
  // Função para buscar informações do quadro e coluna
  const getKanbanInfo = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
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
  
  // Debug: Log quando mensagens mudam
  useEffect(() => {
    console.log('ChatArea: Messages updated', {
      messageCount: propMessages?.length || 0,
      messages: propMessages
    })
  }, [propMessages])
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  // Extrair dados do contato atual
  const getContactData = () => {
    if (!conversation) return undefined
    return {
      nome: conversation.name || conversation.nome,
      telefone: conversation.id || conversation.numeroTelefone
    }
  }

  const sendMessage = () => {
    if (!message.trim()) return

    // Usar sempre a função real das props
    if (onSendMessage) {
      onSendMessage(message)
    }
    setMessage('')
    
    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
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
      await mediaUpload.uploadAndSendMedia(chatId, file, type)
      // Recarregar mensagens após envio
      // onSendMessage poderia ser expandido para suportar diferentes tipos
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
        await mediaUpload.uploadAndSendMedia(chatId, file, type)
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
      const audioFile = blobToFile(audioRecorder.audioBlob, `audio-${Date.now()}.webm`)
      await mediaUpload.uploadAndSendMedia(chatId, audioFile, 'voice')
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

  // Função para lidar com mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setMessage(newValue)
    
    // Enviar status de "digitando" quando começar a digitar
    if (newValue.length > 0 && message.length === 0) {
      handleTyping(true)
    }
    
    // Limpar timeout anterior
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Definir novo timeout para parar o status de "digitando"
    if (newValue.length > 0) {
      const timeout = setTimeout(() => {
        handleTyping(false)
      }, 2000) // Para de "digitar" após 2 segundos sem digitar
      setTypingTimeout(timeout)
    } else {
      // Se o campo estiver vazio, para imediatamente o status de "digitando"
      handleTyping(false)
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
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </motion.div>

          {/* User Info */}
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Online • Visto por último às 14:30</span>
            </div>
          </div>


        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white scrollbar-chat">
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
              <motion.div 
                className={`relative transition-all duration-300 ${
                  hoveredMessage === msg.id 
                    ? 'max-w-md lg:max-w-xl xl:max-w-2xl' 
                    : 'max-w-xs lg:max-w-md xl:max-w-lg'
                } ${msg.sender === 'agent' ? 'ml-auto' : ''}`}
                animate={{
                  scale: hoveredMessage === msg.id ? 1.02 : 1
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <motion.div
                  animate={{
                    paddingLeft: hoveredMessage === msg.id ? '20px' : '16px',
                    paddingRight: hoveredMessage === msg.id ? '20px' : '16px'
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`relative py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                    msg.sender === 'agent'
                      ? 'bg-gradient-to-r from-[#273155] to-[#2a3660] text-white'
                      : 'bg-white border border-gray-200'
                  } ${
                    hoveredMessage === msg.id ? 'shadow-xl' : ''
                  }`}
                >
                  {/* Renderizar conteúdo da mensagem com mídia */}
                  {msg.type === 'image' && (msg as any).mediaUrl ? (
                    <div className="mb-2">
                      <img 
                        src={(msg as any).mediaUrl} 
                        alt="Imagem" 
                        className="max-w-xs rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.open((msg as any).mediaUrl, '_blank')}
                      />
                      {msg.content && <p className="text-sm mt-2">{msg.content}</p>}
                    </div>
                  ) : msg.type === 'audio' && (msg as any).mediaUrl ? (
                    <div className="mb-2">
                      <audio 
                        controls 
                        className="max-w-xs"
                        preload="metadata"
                      >
                        <source src={(msg as any).mediaUrl} type="audio/webm" />
                        <source src={(msg as any).mediaUrl} type="audio/ogg" />
                        <source src={(msg as any).mediaUrl} type="audio/mp3" />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>
                      {msg.content && <p className="text-sm mt-2">{msg.content}</p>}
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
                      {msg.content && <p className="text-sm mt-2">{msg.content}</p>}
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
                        {(msg as any).filename || 'Documento'}
                      </a>
                      {msg.content && <p className="text-sm mt-2">{msg.content}</p>}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed mb-1">{msg.content}</p>
                  )}
                  
                  {/* Linha com timestamp e ícones */}
                  <div className={`flex items-center gap-3 ${
                    msg.sender === 'agent' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{msg.timestamp}</span>
                      {/* Status de mensagem do agente */}
                      {msg.sender === 'agent' && (
                        <div className="flex items-center gap-1">
                          {msg.status === 'sent' && <Check className="w-3 h-3" />}
                          {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                        </div>
                      )}
                    </div>
                    
                    {/* Ícones de Ação - Aparecem no hover */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, width: 0 }}
                      animate={{ 
                        opacity: hoveredMessage === msg.id ? 1 : 0,
                        scale: hoveredMessage === msg.id ? 1 : 0.8,
                        width: hoveredMessage === msg.id ? 'auto' : 0
                      }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex items-center gap-1.5 overflow-hidden"
                    >
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
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
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

          {/* Input Area */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-[#273155] focus-within:ring-2 focus-within:ring-[#273155]/20 transition-all duration-300">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
              />
              
              <div className="flex items-center gap-1 px-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={`p-2 hover:bg-gray-200 rounded-lg transition-colors ${
                    showAttachmentMenu ? 'bg-gray-200' : ''
                  }`}
                  title="Anexar arquivo"
                  data-attachment-button
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 hover:bg-gray-200 rounded-lg transition-colors ${
                    showEmojiPicker ? 'bg-gray-200' : ''
                  }`}
                  title="Emoji"
                >
                  <Smile className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>
            </div>
            
            {/* Emoji Picker */}
            <EmojiPicker
              isOpen={showEmojiPicker}
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
            
            {/* Attachment Menu */}
            {showAttachmentMenu && (
              console.log('🔍 Renderizando modal de anexo:', new Date().toISOString()),
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
                          <Image className="w-6 h-6 text-white" />
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
                      
                      {/* Câmera */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // TODO: Implementar captura de câmera
                          setShowAttachmentMenu(false)
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Câmera</span>
                        <span className="text-xs text-gray-500">Capturar foto</span>
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
    </div>
  )
}
