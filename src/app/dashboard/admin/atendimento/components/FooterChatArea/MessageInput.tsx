'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Smile,
  X,
  Calendar,
  DollarSign,
  Paperclip,
  Video,
  FileSignature,
  UserCheck,
  Mic,
  Send,
  List,
  Plus,
  Trash2
} from 'lucide-react'

import {
  AnexoMenuButton,
  AudioButton,
  AgenteButton,
  IAButton,
  RespostaRapidaButton,
  EnviarButton
} from './InputActions'

import {
  TabButton,
  MenuButton,
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
  TagButton,
  TicketButton,
  FilaButton,
  AtendenteButton
} from './TabComponents'

import SpecialMediaModal from '@/components/ui/SpecialMediaModal'
import MediaSendModal from '@/components/ui/MediaSendModal'

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
  // Novas funções para envio de mídia
  onSendContact?: (contacts: any[], caption: string) => Promise<void>
  onSendLocation?: (latitude: number, longitude: number, title: string, address: string) => Promise<void>
  onSendPoll?: (name: string, options: string[], multipleAnswers: boolean) => Promise<void>
  onSendMenu?: (title: string, description: string, options: string[]) => Promise<void>
  onSendEvent?: (title: string, dateTime: string) => Promise<void>
  onSendMedia?: (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => Promise<void>
  // ID do chat para as APIs
  chatId?: string
}

interface ExtendedSpecialModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'contact' | 'location' | 'poll' | 'menu' | 'events'
  onSend: (data: any, caption: string) => Promise<void>
  chatId?: string
}

const ExtendedSpecialModal = ({ isOpen, onClose, type, onSend, chatId }: ExtendedSpecialModalProps) => {
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
  isTyping = false 
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sistema'>('whatsapp')
  
  // Estados para modals
  const [showSpecialModal, setShowSpecialModal] = useState<'contact' | 'location' | 'poll' | 'menu' | 'events' | null>(null)
  const [showMediaSendModal, setShowMediaSendModal] = useState(false)
  const [mediaSendType, setMediaSendType] = useState<'image' | 'video' | 'document'>('image')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Estados para ações rápidas (bottom sheet)
  const [showActionSheet, setShowActionSheet] = useState<'agendamento' | 'orcamento' | 'assinatura' | 'tags' | 'ticket' | 'fila' | 'atendente' | null>(null)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
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
            <TabButton 
              active={activeTab === 'whatsapp'} 
              onClick={() => setActiveTab('whatsapp')}
            >
              WhatsApp
            </TabButton>
            <TabButton 
              active={activeTab === 'sistema'} 
              onClick={() => setActiveTab('sistema')}
            >
              Sistema
            </TabButton>
          </div>
          
          {/* Conteúdo das Tabs */}
          <div className="grid grid-cols-4 gap-3">
            {activeTab === 'whatsapp' ? (
              <>
                <MenuButton onClick={() => { 
                  setShowSpecialModal('menu'); 
                  setShowAttachMenu(false) 
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
                <AgendamentoButton onClick={() => { 
                  setShowActionSheet('agendamento'); 
                  setShowAttachMenu(false) 
                }} />
                <OrcamentoButton onClick={() => { 
                  setShowActionSheet('orcamento'); 
                  setShowAttachMenu(false) 
                }} />
                <AssinaturaButton onClick={() => { 
                  setShowActionSheet('assinatura'); 
                  setShowAttachMenu(false) 
                }} />
                <TagButton onClick={() => { 
                  setShowActionSheet('tags'); 
                  setShowAttachMenu(false) 
                }} />
                <TicketButton onClick={() => { 
                  setShowActionSheet('ticket'); 
                  setShowAttachMenu(false) 
                }} />
                <FilaButton onClick={() => { 
                  setShowActionSheet('fila'); 
                  setShowAttachMenu(false) 
                }} />
                <AtendenteButton onClick={() => { 
                  setShowActionSheet('atendente'); 
                  setShowAttachMenu(false) 
                }} />
              </>
            )}
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
        {/* Input de mensagem */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                       rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400 resize-none
                       transition-all duration-200"
            style={{
              maxHeight: '120px',
              minHeight: '48px'
            }}
          />
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
        <AgenteButton onClick={onAgentClick} />
        
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
          {/* Botão Lista */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => console.log('📋 Lista')}
            className="p-3 bg-gray-500/80 hover:bg-gray-600 text-white rounded-full 
                       shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
            title="Lista de mensagens"
          >
            <List className="w-5 h-5" />
          </motion.button>
          
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

      {/* Bottom Sheet para Ações Rápidas */}
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
      
      {/* Outros bottom sheets em desenvolvimento */}
      {(showActionSheet && !['agendamento', 'tags'].includes(showActionSheet)) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white dark:bg-gray-900 rounded-t-2xl p-6 w-full max-w-md pointer-events-auto"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">
                {showActionSheet === 'orcamento' && '💰'}
                {showActionSheet === 'assinatura' && '✍️'}
                {showActionSheet === 'ticket' && '🎫'}
                {showActionSheet === 'fila' && '👥'}
                {showActionSheet === 'atendente' && '👨‍💼'}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {showActionSheet === 'orcamento' && 'Orçamento'}
                {showActionSheet === 'assinatura' && 'Assinatura'}
                {showActionSheet === 'ticket' && 'Ticket'}
                {showActionSheet === 'fila' && 'Fila'}
                {showActionSheet === 'atendente' && 'Atendente'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Em desenvolvimento...
              </p>
              <button
                onClick={() => setShowActionSheet(null)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
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
    </div>
  )
}
