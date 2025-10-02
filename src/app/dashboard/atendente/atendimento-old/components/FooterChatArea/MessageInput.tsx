'use client'

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Smile, Send, Mic, MicOff, Zap, Bot, MessageSquare, X, Reply, 
  GripHorizontal, Bold, Italic, Code, Strikethrough, Quote, List, 
  ListOrdered, Type
} from 'lucide-react'
import { useMessagesData } from '@/hooks/useMessagesData'
import { useChatAgente } from '@/hooks/useChatAgente'
import { Dispatch, SetStateAction } from 'react'

import {
  AnexoMenuButton,
  AudioButton,
  AgenteButton,
  IAButton,
  RespostaRapidaButton,
  EnviarButton
} from './InputActions'

import {
  MenuButton,
  ImageButton,
  EnqueteButton,
  LocalizacaoButton,
  ContatoButton,
  AnexoWhatsappButton,
  VideoButton,
  AudioWhatsappButton,
  EventsButton,
  AgendamentoButton,
  OrcamentoButton,
  AssinaturaButton,
  AnotacoesButton,
  TagButton,
  TicketButton,
  FilaButton,
  AtendenteButton
} from './AttachMenuButtons'
import AgendamentoBottomSheet from './BottomSheets/AgendamentoBottomSheet'
import TagsBottomSheet from './BottomSheets/TagsBottomSheet'
import OrcamentoBottomSheet from './BottomSheets/OrcamentoBottomSheet'
import TicketBottomSheet from './BottomSheets/TicketBottomSheet'
import FilaBottomSheet from './BottomSheets/FilaBottomSheet'
import AtendenteBottomSheet from './BottomSheets/AtendenteBottomSheet'
import AssinaturaBottomSheet from './BottomSheets/AssinaturaBottomSheet'
import AnotacoesBottomSheet from './BottomSheets/AnotacoesBottomSheet'

import SpecialMediaModal from '@/components/ui/SpecialMediaModal'
import MediaSendModal from '@/components/ui/MediaSendModal'
import AgenteSelectionModal from './modals/AgenteSelectionModal'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onAttachFile?: () => void
  onSendImage?: () => void
  onSendAudio?: () => void
  onOpenCamera?: () => void
  onOpenEmojis?: () => void
  onAgentClick?: () => void
  onAcoesRapidasClick?: () => void
  onIAClick?: () => void
  onRespostaRapidaClick?: () => void
  onStartTyping?: () => void
  onStopTyping?: () => void
  onMarkAsSeen?: (messageId: string) => void
  placeholder?: string
  disabled?: boolean
  isTyping?: boolean
  
  // Estado de resposta
  replyingTo?: {
    messageId: string
    content: string
    sender: string
  } | null
  onCancelReply?: () => void
  
  // Novas funções para envio de mídia
  onSendContact?: (contacts: any[], caption: string) => Promise<void>
  onSendLocation?: (latitude: number, longitude: number, title: string, address: string) => Promise<void>
  onSendPoll?: (name: string, options: string[], multipleAnswers: boolean) => Promise<void>
  onSendMenu?: (title: string, description: string, options: string[]) => Promise<void>
  onSendEvent?: (title: string, dateTime: string) => Promise<void>
  onSendMedia?: (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => Promise<void>
  // ID do chat para as APIs
  chatId?: string
  
  // Contato ID extraído do chatId para vincular criações
  contatoId?: string | null
}

interface ExtendedSpecialModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'contact' | 'location' | 'poll' | 'menu' | 'events'
  onSend: (data: any, caption: string) => Promise<void>
  chatId?: string
}

const ExtendedSpecialModal = ({ isOpen, onClose, type, onSend, chatId }: ExtendedSpecialModalProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showSpecialModal, setShowSpecialModal] = useState<string | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [menuTitle, setMenuTitle] = useState('')
  const [menuDescription, setMenuDescription] = useState('')
  const [menuOptions, setMenuOptions] = useState<string[]>([''])
  const [eventTitle, setEventTitle] = useState('')
  const [eventDateTime, setEventDateTime] = useState('')

  // Para tipos que já existem no SpecialMediaModal, usa o componente original
  if (type === 'contact' || type === 'location' || type === 'poll') {
    return (
      <SpecialMediaModal
        isOpen={isOpen}
        onClose={onClose}
        type={type}
        chatId={chatId || 'temp-chat-id'}
        onSend={onSend}
      />
    )
  }

  const addMenuOption = () => {
    setMenuOptions([...menuOptions, ''])
  }

  const removeMenuOption = (index: number) => {
    if (menuOptions.length > 1) {
      setMenuOptions(menuOptions.filter((_, i) => i !== index))
    }
  }

  const updateMenuOption = (index: number, value: string) => {
    const newOptions = [...menuOptions]
    newOptions[index] = value
    setMenuOptions(newOptions)
  }

  const handleSend = () => {
    if (type === 'menu') {
      const menuData = {
        title: menuTitle,
        description: menuDescription,
        options: menuOptions.filter(opt => opt.trim() !== '')
      }
      onSend(menuData, '')
    } else if (type === 'events') {
      const eventData = {
        title: eventTitle,
        dateTime: eventDateTime
      }
      onSend(eventData, '')
    }
  }

  // Para novos tipos (menu e events), renderiza modals customizados
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {type === 'menu' ? '🔗 Criar Menu Interativo' : '📅 Criar Evento'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {type === 'menu' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔗 Texto do Botão *
                </label>
                <input
                  type="text"
                  value={menuTitle}
                  onChange={(e) => setMenuTitle(e.target.value)}
                  placeholder="Ex: Ver Cardápio, Escolher Serviço"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Este texto aparece no botão que o usuário clica</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📝 Título da Mensagem *
                </label>
                <textarea
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  placeholder="Ex: Escolha uma das opções abaixo para continuar..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Texto que aparece acima do botão de opções</p>
              </div>
              
              {/* Opções do Menu */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    📋 Opções Clicáveis * (mín. 1, máx. 10)
                  </label>
                  <button
                    onClick={addMenuOption}
                    disabled={menuOptions.length >= 10}
                    className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                      menuOptions.length >= 10 
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    + Adicionar opção
                  </button>
                </div>
                
                <div className="space-y-3 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                  {menuOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 w-6 flex-shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateMenuOption(index, e.target.value)}
                        placeholder={`Ex: 🍕 Fazer pedido, 📞 Falar com atendente`}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {menuOptions.length > 1 && (
                        <button
                          onClick={() => removeMenuOption(index)}
                          className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remover opção"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  📋 Sobre o menu interativo:
                </p>
                <p className="text-xs text-green-500 dark:text-green-300 mt-1">
                  • {menuOptions.filter(opt => opt.trim()).length} opção(ões) configurada(s)<br/>
                  • Usuário clica no botão "{menuTitle || 'Ver opções'}" para abrir<br/>
                  • Cada opção é clicável e pode ter emojis<br/>
                  • Ideal para cardápios, serviços e atendimento
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📅 Nome do Evento *
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ex: Reunião de Vendas às 14h"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🕒 Data e Hora do Evento *
                </label>
                <input
                  type="datetime-local"
                  value={eventDateTime}
                  onChange={(e) => setEventDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().slice(0, 16)} // Não permite datas passadas
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  📋 Sobre o evento:
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                  • Aparece no calendário do WhatsApp do usuário<br/>
                  • Permite definir lembretes automáticos<br/>
                  • Usuário pode aceitar/recusar o convite
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 
                     dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={
              type === 'menu' 
                ? !menuTitle.trim() || menuOptions.filter(opt => opt.trim()).length === 0
                : !eventTitle.trim() || !eventDateTime
            }
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              (type === 'menu' && (!menuTitle.trim() || menuOptions.filter(opt => opt.trim()).length === 0)) ||
              (type === 'events' && (!eventTitle.trim() || !eventDateTime))
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Enviar {type === 'menu' ? 'Menu' : 'Evento'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MessageInput({ 
  onSendMessage,
  onAttachFile,
  onSendImage,
  onSendAudio,
  onOpenCamera,
  onOpenEmojis,
  onAgentClick,
  onAcoesRapidasClick,
  onIAClick,
  onRespostaRapidaClick,
  onStartTyping,
  onStopTyping,
  onMarkAsSeen,
  onSendContact,
  onSendLocation,
  onSendPoll,
  onSendMenu,
  onSendEvent,
  onSendMedia,
  chatId,
  placeholder = "Digite sua mensagem...",
  disabled = false,
  isTyping = false,
  replyingTo,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sistema'>('whatsapp')
  
  // Extrair contato_id do chatId (remover @c.us)
  const contatoId = chatId ? chatId.replace('@c.us', '') : null
  
  console.log('🔍 [MessageInput] chatId:', chatId)
  console.log('🔍 [MessageInput] contatoId extraído:', contatoId)
  
  // Estados para modals
  const [showSpecialModal, setShowSpecialModal] = useState<'contact' | 'location' | 'poll' | 'menu' | 'events' | null>(null)
  const [showMediaSendModal, setShowMediaSendModal] = useState(false)
  const [mediaSendType, setMediaSendType] = useState<'image' | 'video' | 'document'>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Estados para ações rápidas (bottom sheet)
  const [showActionSheet, setShowActionSheet] = useState<'agendamento' | 'orcamento' | 'assinatura' | 'anotacoes' | 'tags' | 'ticket' | 'fila' | 'atendente' | null>(null)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Estados para agente IA
  const [showAgenteModal, setShowAgenteModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Hook para buscar agente ativo do chat
  const { 
    ativo: agenteAtivo, 
    agente: agenteAtual, 
    refetch: refetchAgente,
    activateAgent,
    deactivateAgent 
  } = useChatAgente(chatId)
  
  // Ref para textarea expansivo
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [textareaHeight, setTextareaHeight] = useState(48)
  const [isDragging, setIsDragging] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [manualHeight, setManualHeight] = useState<number | null>(null)
  
  // Estados para transcrição de voz
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  // Auto-resize inteligente - só expande quando necessário
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea && !isDragging) {
      // Altura base
      const baseHeight = 48
      const focusBoost = isFocused ? 8 : 0 // pequeno aumento no foco
      const minHeight = baseHeight + focusBoost
      
      // Calcular altura necessária para o conteúdo
      textarea.style.height = `${baseHeight}px`
      const scrollHeight = textarea.scrollHeight
      
      // Se não há conteúdo que excede uma linha, manter mínimo
      const contentHeight = scrollHeight <= baseHeight + 2 ? minHeight : scrollHeight + focusBoost
      
      // Usar altura manual se definida, senão usar altura do conteúdo
      const targetHeight = manualHeight || contentHeight
      const maxHeight = 300 // altura máxima
      
      const newHeight = Math.max(minHeight, Math.min(targetHeight, maxHeight))
      setTextareaHeight(newHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [isFocused, isDragging, manualHeight])
  
  // Ajustar altura quando mensagem muda
  useLayoutEffect(() => {
    adjustHeight()
  }, [message, adjustHeight])

  // Redimensionamento manual
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const startY = e.clientY
    const startHeight = textareaHeight

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY // invertido para arrastar para cima aumentar
      const newHeight = Math.max(48, Math.min(300, startHeight + deltaY))
      setTextareaHeight(newHeight)
      setManualHeight(newHeight) // salvar altura manual
      if (textareaRef.current) {
        textareaRef.current.style.height = `${newHeight}px`
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Formatação de texto para WhatsApp
  const applyFormat = (format: 'bold' | 'italic' | 'code' | 'strike' | 'quote' | 'list' | 'numbered') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = message.substring(start, end)
    let formattedText = selectedText

    switch (format) {
      case 'bold':
        formattedText = `*${selectedText}*`
        break
      case 'italic':
        formattedText = `_${selectedText}_`
        break
      case 'code':
        formattedText = selectedText.includes('\n') ? `\`\`\`\n${selectedText}\n\`\`\`` : `\`${selectedText}\``
        break
      case 'strike':
        formattedText = `~${selectedText}~`
        break
      case 'quote':
        formattedText = `> ${selectedText}`
        break
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n')
        break
      case 'numbered':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
        break
    }

    const newMessage = message.substring(0, start) + formattedText + message.substring(end)
    setMessage(newMessage)
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + formattedText.length)
    }, 0)
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      setManualHeight(null) // resetar altura manual
      // Resetar altura do textarea após enviar
      setTimeout(() => adjustHeight(), 0)
    }
  }
  
  // Funções de transcrição de voz
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      console.log('🎙️ Gravação de voz iniciada')
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error)
      alert('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }
  
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log('🛑 Gravação de voz parada')
    }
  }
  
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true)
      console.log('🔄 Transcrevendo áudio...')
      
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.text) {
          console.log('✅ Transcrição recebida:', data.text)
          
          // Adicionar texto transcrito ao campo
          setMessage(prevMessage => {
            const newMessage = prevMessage ? `${prevMessage} ${data.text}` : data.text
            return newMessage
          })
          
          // Ajustar altura do textarea
          setTimeout(() => adjustHeight(), 0)
        }
      } else {
        console.error('❌ Erro na resposta da API:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao transcrever áudio:', error)
    } finally {
      setIsTranscribing(false)
    }
  }
  
  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording()
    } else {
      startVoiceRecording()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handlers para modals de mídia
  const handleFileSelect = (type: 'image' | 'video' | 'document') => {
    setMediaSendType(type)
    setShowMediaSendModal(true)
    setShowAttachMenu(false)
  }

  const handleMediaSend = async (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => {
    console.log('📎 Enviando mídia:', mediaType, file.name, caption)
    
    if (onSendMedia) {
      try {
        await onSendMedia(file, caption, mediaType)
        console.log('✅ Mídia enviada com sucesso!')
      } catch (error) {
        console.error('❌ Erro ao enviar mídia:', error)
      }
    } else {
      console.warn('⚠️ onSendMedia não está definido')
    }
    
    setShowMediaSendModal(false)
    setSelectedFile(null)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value
    setMessage(newMessage)
    
    // Gerenciar typing indicators
    if (newMessage.length > 0) {
      // Iniciar typing se ainda não iniciou
      if (!typingTimeout) {
        onStartTyping?.()
      }
      
      // Limpar timeout anterior
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      
      // Definir novo timeout para parar typing
      const timeout = setTimeout(() => {
        onStopTyping?.()
        setTypingTimeout(null)
      }, 3000) // Para de mostrar "digitando" após 3 segundos de inatividade
      
      setTypingTimeout(timeout)
    } else {
      // Se apagou tudo, parar typing
      if (typingTimeout) {
        clearTimeout(typingTimeout)
        setTypingTimeout(null)
      }
      onStopTyping?.()
    }
  }


  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
      {/* Menu Expansível com Tabs */}
      {showAttachMenu && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700"
        >
          {/* Header com botão fechar */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Anexos & Ações
            </h3>
            <button
              onClick={() => setShowAttachMenu(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'whatsapp' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('sistema')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'sistema' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Sistema
            </button>
          </div>
          
          {/* Conteúdo das Tabs */}
          <div className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="grid grid-cols-4 gap-3">
              {activeTab === 'whatsapp' ? (
                <>
                <MenuButton onClick={() => { 
                  setShowSpecialModal('menu'); 
                  setShowAttachMenu(false) 
                }} />
                <ImageButton onClick={() => {
                  setMediaSendType('image');
                  setShowMediaSendModal(true);
                  setShowAttachMenu(false);
                }} />
                <EnqueteButton onClick={() => { 
                  setShowSpecialModal('poll'); 
                  setShowAttachMenu(false) 
                }} />
                <LocalizacaoButton onClick={() => { 
                  setShowSpecialModal('location'); 
                  setShowAttachMenu(false) 
                }} />
                <ContatoButton onClick={() => { 
                  setShowSpecialModal('contact'); 
                  setShowAttachMenu(false) 
                }} />
                <AnexoWhatsappButton onClick={() => handleFileSelect('document')} />
                <VideoButton onClick={() => handleFileSelect('video')} />
                <AudioWhatsappButton onClick={() => handleFileSelect('document')} />
                <EventsButton onClick={() => { 
                  setShowSpecialModal('events'); 
                  setShowAttachMenu(false) 
                }} />
              </>
            ) : (
              <>
                <AgendamentoButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log('📅 Criando agendamento para contato:', contatoId)
                    setShowActionSheet('agendamento'); 
                    setShowAttachMenu(false) 
                  }} 
                />
                <OrcamentoButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log('💰 Criando orçamento para contato:', contatoId)
                    setShowActionSheet('orcamento'); 
                    setShowAttachMenu(false) 
                  }} 
                />
                <AssinaturaButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log(' Criando assinatura para contato:', contatoId)
                    setShowActionSheet('assinatura')
                    setShowAttachMenu(false) 
                  }} 
                />
                <AnotacoesButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log(' Abrindo anotações para contato:', contatoId)
                    setShowActionSheet('anotacoes')
                    setShowAttachMenu(false) 
                  }} 
                />
                <TagButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log('🏷️ Criando tag para contato:', contatoId)
                    setShowActionSheet('tags'); 
                  setShowAttachMenu(false) 
                }} />
                <TicketButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log('🎫 Criando ticket para contato:', contatoId)
                    setShowActionSheet('ticket'); 
                    setShowAttachMenu(false) 
                  }} 
                />
                <FilaButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log('👥 Atribuindo fila para contato:', contatoId)
                    setShowActionSheet('fila'); 
                    setShowAttachMenu(false) 
                  }} 
                />
                <AtendenteButton 
                  contatoId={contatoId}
                  onClick={() => { 
                    console.log('👤 Atribuindo atendente para contato:', contatoId)
                    setShowActionSheet('atendente'); 
                    setShowAttachMenu(false) 
                  }} 
                />
              </>
            )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        {/* Botões de Ação Otimizados */}
        <div className="flex items-center gap-1">
          {/* Botão Anexo (abre painel) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 
                       dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
            title="Anexos & Ações"
          >
            📎
          </motion.button>
          
          {/* Botões principais */}
          <RespostaRapidaButton onClick={onRespostaRapidaClick} />
          <IAButton onClick={onIAClick} />
        </div>

        {/* Preview de Resposta */}
        {replyingTo && (
          <div className="flex-1">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mb-2 rounded-r-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Reply className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Respondendo para {replyingTo.sender}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {replyingTo.content}
                  </p>
                </div>
                <button
                  onClick={onCancelReply}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full ml-2"
                >
                  <X className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input de mensagem com formatação */}
        <div className="flex-1 relative">
          {/* Container do textarea com resize handle */}
          <div className="relative border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={`absolute top-0 left-0 right-0 h-1 cursor-ns-resize group ${
                isDragging ? 'bg-blue-500' : 'hover:bg-gray-300 dark:hover:bg-gray-600'
              } transition-colors`}
            >
              <div className="flex justify-center items-center h-full">
                <GripHorizontal className="w-4 h-4 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Toolbar de formatação */}
            {showFormatting && (
              <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => applyFormat('bold')}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Negrito (*texto*)"
                >
                  <Bold className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => applyFormat('italic')}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Itálico (_texto_)"
                >
                  <Italic className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => applyFormat('code')}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Código (`código`)"
                >
                  <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => applyFormat('strike')}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Riscado (~texto~)"
                >
                  <Strikethrough className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => applyFormat('quote')}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Citação (> texto)"
                >
                  <Quote className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => applyFormat('list')}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Lista com marcadores"
                >
                  <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => applyFormat('numbered')}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Lista numerada"
                >
                  <ListOrdered className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100
                         focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 
                         resize-none transition-all duration-200 overflow-hidden"
              style={{
                height: `${textareaHeight}px`,
                minHeight: '48px',
                paddingTop: showFormatting ? '12px' : '12px'
              }}
              onFocus={() => {
                setIsFocused(true)
                setShowFormatting(true)
              }}
              onBlur={() => {
                setIsFocused(false)
                // Só esconder formatação se não tem conteúdo
                if (!message.trim()) {
                  setShowFormatting(false)
                }
              }}
            />
          </div>

          {/* Toggle para toolbar */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFormatting(!showFormatting)}
            className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 
                       dark:hover:text-gray-400 rounded transition-colors"
            title="Formatação de texto"
          >
            <Type className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Botão de Emojis (fora do input) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenEmojis}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 
                     dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                     dark:hover:bg-gray-800 transition-colors"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </motion.button>

        {/* Botão Agente antes do enviar */}
        <AgenteButton 
          onClick={() => setShowAgenteModal(true)}
          isGenerating={isGenerating}
          agenteAtivo={agenteAtivo}
          agenteNome={agenteAtual?.nome || ''}
        />
        
        {/* Botão de Áudio */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onSendAudio}
          className="p-3 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full 
                     shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
          title="Gravar áudio"
        >
          <Mic className="w-5 h-5" />
        </motion.button>
        
        {/* Botões de enviar com ícones */}
        <div className="flex items-center gap-1">
          {/* Botão Enviar */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm ${
              disabled || !message.trim()
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-green-500/80 hover:bg-green-600 text-white'
            }`}
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Indicador de digitação */}
      {isTyping && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 dark:text-gray-400 mt-2"
        >
          Digitando...
        </motion.p>
      )}

      {/* Modals Especiais */}
      {showSpecialModal && (
        <ExtendedSpecialModal
          isOpen={!!showSpecialModal}
          onClose={() => setShowSpecialModal(null)}
          type={showSpecialModal}
          chatId={chatId}
          onSend={async (data: any, caption: string) => {
            console.log('Enviando:', showSpecialModal, data, caption)
            
            try {
              if (showSpecialModal === 'contact' && onSendContact) {
                await onSendContact(data.contacts || [], caption)
              } else if (showSpecialModal === 'location' && onSendLocation) {
                await onSendLocation(data.latitude, data.longitude, data.title, data.address)
              } else if (showSpecialModal === 'poll' && onSendPoll) {
                await onSendPoll(data.name, data.options, data.multipleAnswers)
              } else if (showSpecialModal === 'menu' && onSendMenu) {
                await onSendMenu(data.title, data.description, data.options)
              } else if (showSpecialModal === 'events' && onSendEvent) {
                await onSendEvent(data.title, data.dateTime)
              }
              
              console.log('✅ Dados especiais enviados com sucesso!')
            } catch (error) {
              console.error('❌ Erro ao enviar dados especiais:', error)
            }
            
            setShowSpecialModal(null)
          }}
        />
      )}

      {/* Bottom Sheets para Ações Rápidas */}
      {showActionSheet === 'agendamento' && (
        <AgendamentoBottomSheet
          isOpen={showActionSheet === 'agendamento'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}
      
      {showActionSheet === 'tags' && (
        <TagsBottomSheet
          isOpen={showActionSheet === 'tags'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}

      {showActionSheet === 'orcamento' && (
        <OrcamentoBottomSheet
          isOpen={showActionSheet === 'orcamento'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}

      {showActionSheet === 'ticket' && (
        <TicketBottomSheet
          isOpen={showActionSheet === 'ticket'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}

      {showActionSheet === 'fila' && (
        <FilaBottomSheet
          isOpen={showActionSheet === 'fila'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}

      {showActionSheet === 'atendente' && (
        <AtendenteBottomSheet
          isOpen={showActionSheet === 'atendente'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}

      {showActionSheet === 'assinatura' && (
        <AssinaturaBottomSheet
          isOpen={showActionSheet === 'assinatura'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}
      
      {showActionSheet === 'anotacoes' && (
        <AnotacoesBottomSheet
          isOpen={showActionSheet === 'anotacoes'}
          onClose={() => setShowActionSheet(null)}
          chatId={chatId}
        />
      )}

      {/* Modal de Envio de Mídia */}
      {showMediaSendModal && (
        <MediaSendModal
          isOpen={showMediaSendModal}
          onClose={() => setShowMediaSendModal(false)}
          onSend={handleMediaSend}
          mediaType={mediaSendType}
          file={selectedFile}
        />
      )}
      
      {/* Modal de Seleção de Agente */}
      <AgenteSelectionModal
        isOpen={showAgenteModal}
        onClose={() => setShowAgenteModal(false)}
        onSelect={async (agente) => {
          console.log('🤖 Agente selecionado:', agente)
          try {
            if (agente) {
              // Ativar agente
              await activateAgent(agente.id)
              console.log('✅ Agente ativado com sucesso!')
            } else {
              // Desativar agente
              await deactivateAgent()
              console.log('✅ Agente desativado com sucesso!')
            }
            // Recarregar dados do agente após seleção
            refetchAgente()
          } catch (error) {
            console.error('❌ Erro ao ativar/desativar agente:', error)
          }
        }}
        agenteAtual={agenteAtual ? { 
          ...agenteAtual, 
          cor: '#3b82f6',
          descricao: agenteAtual.descricao || 'Agente IA'
        } : null}
        chatId={chatId}
      />
    </div>
  )
}
