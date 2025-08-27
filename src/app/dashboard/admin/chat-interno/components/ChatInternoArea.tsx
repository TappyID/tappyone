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
  X,
  Hash,
  Users,
  Star,
  AlertCircle,
  Timer,
  Tag
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
  fila?: string
  tag?: string
  indiceNCS?: number
  prioridade?: 'alta' | 'media' | 'baixa'
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
  isDark?: boolean
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

export default function ChatInternoArea({ atendente, currentUser, isDark = false }: ChatInternoAreaProps) {
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
    // Só faz scroll se não é a primeira renderização
    if (mensagens.length > mockMensagens.length) {
      scrollToBottom()
    }
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
      <div className={`${isDark ? 'bg-gray-800/95 border-gray-700/50 backdrop-blur-xl' : 'bg-white border-gray-200'} border-b p-4`}>
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
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{atendente.nome}</h3>
                {atendente.prioridade === 'alta' && (
                  <motion.div 
                    className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    Alta
                  </motion.div>
                )}
                {atendente.naoLidas > 0 && (
                  <motion.div 
                    className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium animate-pulse"
                    whileHover={{ scale: 1.1 }}
                  >
                    {atendente.naoLidas}
                  </motion.div>
                )}
              </div>
              <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className="flex items-center gap-1">
                  <span>{atendente.cargo}</span>
                  <Circle className={`w-2 h-2 fill-current ${statusConfig[atendente.status].color.replace('bg-', 'text-')}`} />
                  <span>{statusConfig[atendente.status].label}</span>
                </div>
                {atendente.fila && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">{atendente.fila}</span>
                  </div>
                )}
                {atendente.tag && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{atendente.tag}</span>
                  </div>
                )}
                {atendente.indiceNCS && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span className="text-xs font-mono">{atendente.indiceNCS}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2 ${isDark ? 'text-gray-400 hover:text-green-400 hover:bg-green-500/20' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'} rounded-lg transition-colors`}
                title="Ligar"
              >
                <Phone className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2 ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/20' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-colors`}
                title="Videochamada"
              >
                <Video className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2 ${isDark ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'} rounded-lg transition-colors`}
                title="Marcar como favorito"
              >
                <Star className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition-colors`}
                title="Informações"
              >
                <Info className="w-5 h-5" />
                {atendente.indiceNCS && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    !
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition-colors`}
                title="Mais opções"
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className={`flex-1 overflow-y-auto px-6 py-4 space-y-3 scroll-smooth ${isDark ? 'bg-gradient-to-b from-gray-900/50 to-gray-800/30' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
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
                      : isDark 
                        ? 'bg-gray-700/80 text-gray-100 border border-gray-600/50 rounded-bl-sm backdrop-blur-sm'
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
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
            <div className={`${isDark ? 'bg-gray-700/80 border-gray-600/50 backdrop-blur-sm' : 'bg-white border-gray-200'} border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm`}>
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
      <div className={`${isDark ? 'bg-gray-800/95 border-gray-700/50 backdrop-blur-xl' : 'bg-white border-gray-200'} border-t px-6 py-4 shadow-lg`}>
        <div className="flex items-end gap-4">
          {/* Botões de Anexo */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className={`relative p-2.5 ${isDark ? 'text-gray-400 hover:text-[#4a90e2] hover:bg-blue-500/20' : 'text-gray-600 hover:text-[#305e73] hover:bg-blue-50'} rounded-xl transition-all duration-300`}
              title="Anexar arquivos"
            >
              <Paperclip className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className={`relative p-2.5 ${isDark ? 'text-gray-400 hover:text-[#4a90e2] hover:bg-blue-500/20' : 'text-gray-600 hover:text-[#305e73] hover:bg-blue-50'} rounded-xl transition-all duration-300`}
              title="Enviar imagem"
            >
              <Image className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`relative p-2.5 ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'} rounded-xl transition-all duration-300`}
              title="Gravar áudio"
            >
              <Mic className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </motion.button>
          </div>

          {/* Input Container */}
          <div className="flex-1 relative">
            <div className={`relative rounded-2xl border transition-all duration-300 ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600/50 focus-within:border-[#4a90e2] focus-within:ring-2 focus-within:ring-[#4a90e2]/20 backdrop-blur-sm'
                : 'bg-gray-50 border-gray-200 focus-within:border-[#305e73] focus-within:ring-2 focus-within:ring-[#305e73]/20'
            }`}>
              <textarea
                ref={inputRef}
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className={`w-full px-4 py-3 pr-12 bg-transparent border-none rounded-2xl resize-none focus:outline-none max-h-32 ${isDark ? 'text-gray-100 placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                rows={1}
                style={{ minHeight: '48px' }}
              />
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 ${
                  isDark 
                    ? 'text-gray-400 hover:text-[#4a90e2] hover:bg-gray-600/50'
                    : 'text-gray-500 hover:text-[#305e73] hover:bg-white'
                }`}
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
