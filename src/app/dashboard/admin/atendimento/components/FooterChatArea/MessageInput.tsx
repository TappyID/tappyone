'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Smile,
  X,
  Tag,
  Ticket,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Menu,
  BarChart3,
  MapPin,
  User,
  Paperclip,
  Video,
  FileSignature,
  UserCheck,
  Mic
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
  AgendamentoButton,
  OrcamentoButton,
  AssinaturaButton,
  TagButton,
  TicketButton,
  FilaButton,
  AtendenteButton
} from './TabComponents'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text') => void
  onAttachFile?: () => void
  onSendImage?: () => void
  onSendAudio?: () => void
  onOpenCamera?: () => void
  onOpenEmojis?: () => void
  onAgentClick?: () => void
  onAcoesRapidasClick?: () => void
  onIAClick?: () => void
  onRespostaRapidaClick?: () => void
  placeholder?: string
  disabled?: boolean
  isTyping?: boolean
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
  placeholder = "Digite sua mensagem...",
  disabled = false,
  isTyping = false 
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sistema'>('whatsapp')

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
          <div className="grid grid-cols-3 gap-3">
            {activeTab === 'whatsapp' ? (
              <>
                <MenuButton onClick={() => { console.log('🔗 Menu'); setShowAttachMenu(false) }} />
                <EnqueteButton onClick={() => { console.log('📊 Enquete'); setShowAttachMenu(false) }} />
                <LocalizacaoButton onClick={() => { console.log('📍 Localização'); setShowAttachMenu(false) }} />
                <ContatoButton onClick={() => { console.log('👤 Contato'); setShowAttachMenu(false) }} />
                <AnexoWhatsappButton onClick={() => { console.log('📎 Anexo'); setShowAttachMenu(false) }} />
                <VideoButton onClick={() => { console.log('🎥 Vídeo'); setShowAttachMenu(false) }} />
              </>
            ) : (
              <>
                <AgendamentoButton onClick={() => { console.log('📅 Agendamento'); setShowAttachMenu(false) }} />
                <OrcamentoButton onClick={() => { console.log('💰 Orçamento'); setShowAttachMenu(false) }} />
                <AssinaturaButton onClick={() => { console.log('✍️ Assinatura'); setShowAttachMenu(false) }} />
                <TagButton onClick={() => { console.log('🏷️ Tag'); setShowAttachMenu(false) }} />
                <TicketButton onClick={() => { console.log('🎫 Ticket'); setShowAttachMenu(false) }} />
                <FilaButton onClick={() => { console.log('👥 Fila'); setShowAttachMenu(false) }} />
                <AtendenteButton onClick={() => { console.log('👨‍💼 Atendente'); setShowAttachMenu(false) }} />
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
            onChange={(e) => setMessage(e.target.value)}
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
        
        {/* Botão de Enviar sempre visível */}
        <EnviarButton onClick={handleSend} disabled={disabled || !message.trim()} />
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
    </div>
  )
}
