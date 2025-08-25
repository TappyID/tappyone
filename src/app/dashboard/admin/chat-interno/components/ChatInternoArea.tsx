'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Circle,
  Clock,
  Check,
  CheckCheck,
  Image,
  File,
  Mic,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Atendente {
  id: string
  nome: string
  email: string
  avatar: string
  status: 'online' | 'ocupado' | 'ausente' | 'offline'
  cargo: string
  ultimaMsg: string
  ultimaAtividade: Date
  naoLidas: number
}

interface User {
  id: string
  nome: string
  email: string
  avatar?: string
}

interface Mensagem {
  id: string
  texto: string
  remetente: 'admin' | 'atendente'
  timestamp: Date
  status: 'enviando' | 'enviada' | 'lida'
  tipo: 'texto' | 'imagem' | 'arquivo' | 'audio'
  anexo?: {
    nome: string
    url: string
    tamanho?: string
  }
}

interface ChatInternoAreaProps {
  atendente: Atendente
  currentUser: User
}

// Mock data para mensagens
const mockMensagens: Mensagem[] = [
  {
    id: '1',
    texto: 'Olá! Preciso de ajuda com um cliente que está com dúvidas sobre o plano premium.',
    remetente: 'atendente',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'lida',
    tipo: 'texto'
  },
  {
    id: '2',
    texto: 'Claro! Me conte mais detalhes sobre a situação. Qual é a principal dúvida do cliente?',
    remetente: 'admin',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
    status: 'lida',
    tipo: 'texto'
  },
  {
    id: '3',
    texto: 'Ele quer saber sobre os benefícios específicos e se vale a pena fazer o upgrade agora.',
    remetente: 'atendente',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
    status: 'lida',
    tipo: 'texto'
  },
  {
    id: '4',
    texto: 'Perfeito! Você pode usar nossa tabela comparativa. Vou te enviar o material atualizado.',
    remetente: 'admin',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'lida',
    tipo: 'texto'
  }
]

const statusConfig = {
  online: { color: 'bg-green-500', label: 'Online' },
  ocupado: { color: 'bg-yellow-500', label: 'Ocupado' },
  ausente: { color: 'bg-orange-500', label: 'Ausente' },
  offline: { color: 'bg-gray-400', label: 'Offline' }
}

export default function ChatInternoArea({ atendente, currentUser }: ChatInternoAreaProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mockMensagens)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return

    const novaMsgObj: Mensagem = {
      id: Date.now().toString(),
      texto: novaMensagem,
      remetente: 'admin',
      timestamp: new Date(),
      status: 'enviando',
      tipo: 'texto'
    }

    setMensagens(prev => [...prev, novaMsgObj])
    setNovaMensagem('')

    // Simular envio
    setTimeout(() => {
      setMensagens(prev => 
        prev.map(msg => 
          msg.id === novaMsgObj.id 
            ? { ...msg, status: 'enviada' as const }
            : msg
        )
      )
    }, 1000)

    // Simular resposta do atendente (opcional)
    setTimeout(() => {
      const respostaAtendente: Mensagem = {
        id: (Date.now() + 1).toString(),
        texto: 'Entendi! Obrigado pela orientação.',
        remetente: 'atendente',
        timestamp: new Date(),
        status: 'lida',
        tipo: 'texto'
      }
      setMensagens(prev => [...prev, respostaAtendente])
    }, 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header do Chat */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={atendente.avatar}
                alt={atendente.nome}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusConfig[atendente.status].color}`} />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">{atendente.nome}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{atendente.cargo}</span>
                <Circle className={`w-2 h-2 fill-current ${statusConfig[atendente.status].color.replace('bg-', 'text-')}`} />
                <span>{statusConfig[atendente.status].label}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Ligar"
            >
              <Phone className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Videochamada"
            >
              <Video className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              title="Informações"
            >
              <Info className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              title="Mais opções"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
        {mensagens.map((mensagem, index) => {
          const isAdmin = mensagem.remetente === 'admin'
          const showAvatar = index === 0 || mensagens[index - 1].remetente !== mensagem.remetente

          return (
            <motion.div
              key={mensagem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-end gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {showAvatar ? (
                <motion.img
                  src={isAdmin 
                    ? (currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150')
                    : atendente.avatar
                  }
                  alt={isAdmin ? currentUser.nome : atendente.nome}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                />
              ) : (
                <div className="w-8 h-8 flex-shrink-0" />
              )}

              {/* Mensagem */}
              <div className={`flex flex-col max-w-xs lg:max-w-md ${isAdmin ? 'items-end' : 'items-start'}`}>
                <motion.div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isAdmin
                      ? 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm leading-relaxed">{mensagem.texto}</p>
                </motion.div>
                
                {/* Timestamp e Status */}
                <div className={`flex items-center gap-2 mt-1 px-1 ${
                  isAdmin ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatDistanceToNow(mensagem.timestamp, { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                  
                  {isAdmin && (
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      {mensagem.status === 'enviando' && (
                        <Clock className="w-3 h-3 text-gray-400" />
                      )}
                      {mensagem.status === 'enviada' && (
                        <Check className="w-3 h-3 text-gray-400" />
                      )}
                      {mensagem.status === 'lida' && (
                        <CheckCheck className="w-3 h-3 text-[#305e73]" />
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Indicador de digitação */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-3 px-2"
          >
            <img
              src={atendente.avatar}
              alt={atendente.nome}
              className="w-8 h-8 rounded-full object-cover shadow-sm"
            />
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#305e73] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#305e73] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-[#305e73] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="flex items-end gap-4">
          {/* Botões de Anexo */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 text-gray-600 hover:text-[#305e73] hover:bg-blue-50 rounded-xl transition-all duration-300"
              title="Anexar arquivos"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 text-gray-600 hover:text-[#305e73] hover:bg-blue-50 rounded-xl transition-all duration-300"
              title="Enviar imagem"
            >
              <Image className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 text-gray-600 hover:text-[#305e73] hover:bg-blue-50 rounded-xl transition-all duration-300"
              title="Gravar áudio"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Input Container */}
          <div className="flex-1 relative">
            <div className="relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-[#305e73] focus-within:ring-2 focus-within:ring-[#305e73]/20 transition-all duration-300">
              <textarea
                ref={inputRef}
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full px-4 py-3 pr-12 bg-transparent border-none rounded-2xl resize-none focus:outline-none max-h-32 placeholder-gray-500"
                rows={1}
                style={{ minHeight: '48px' }}
              />
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#305e73] hover:bg-white rounded-lg transition-all duration-300"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Botão Enviar */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={enviarMensagem}
            disabled={!novaMensagem.trim()}
            className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
              novaMensagem.trim()
                ? 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
