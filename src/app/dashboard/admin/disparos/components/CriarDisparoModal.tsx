'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Sparkles,
  Type,
  FileAudio,
  Image as ImageIcon,
  Video,
  Clock,
  Users,
  Search,
  Check,
  Loader2,
  Calendar
} from 'lucide-react'

interface Chat {
  id: string
  name: string
  image?: string
}

interface CriarDisparoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CriarDisparoModal({ isOpen, onClose, onSuccess }: CriarDisparoModalProps) {
  const [step, setStep] = useState(1) // 1: Dados, 2: Selecionar Contatos, 3: Mensagem
  const [loading, setLoading] = useState(false)
  const [loadingIA, setLoadingIA] = useState(false)
  const [loadingChats, setLoadingChats] = useState(false)

  // Dados da campanha
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<'texto' | 'audio' | 'imagem' | 'video'>('texto')
  const [conteudoMensagem, setConteudoMensagem] = useState('')
  const [mediaURL, setMediaURL] = useState('')
  const [intervaloEnvio, setIntervaloEnvio] = useState(3)
  const [agendar, setAgendar] = useState(false)
  const [dataAgendamento, setDataAgendamento] = useState('')
  const [horaAgendamento, setHoraAgendamento] = useState('')

  // Contatos
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectAll, setSelectAll] = useState(false)

  // Conexões
  const [conexoes, setConexoes] = useState<any[]>([])
  const [conexaoSelecionada, setConexaoSelecionada] = useState('')

  // Carregar conexões
  useEffect(() => {
    if (isOpen) {
      fetchConexoes()
    }
  }, [isOpen])

  // Carregar chats quando selecionar conexão
  useEffect(() => {
    if (conexaoSelecionada && step === 2) {
      fetchChats()
    }
  }, [conexaoSelecionada, step])

  const fetchConexoes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/connections', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const activeConns = data.connections.filter((c: any) => c.status === 'WORKING')
        setConexoes(activeConns)
        if (activeConns.length > 0) {
          setConexaoSelecionada(activeConns[0].sessionName)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conexões:', error)
    }
  }

  const fetchChats = async () => {
    setLoadingChats(true)
    try {
      const isProduction = window.location.protocol === 'https:'
      const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'

      const response = await fetch(
        `${baseUrl}/api/${conexaoSelecionada}/chats/overview?limit=9999`,
        {
          headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' }
        }
      )

      if (response.ok) {
        const data = await response.json()
        const chatsFormatados = data.map((chat: any) => ({
          id: chat.id,
          name: chat.name || chat.contact?.name || chat.id.split('@')[0],
          image: chat.contact?.profilePicUrl
        }))
        setChats(chatsFormatados)
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error)
    } finally {
      setLoadingChats(false)
    }
  }

  const gerarMensagemIA = async () => {
    setLoadingIA(true)
    try {
      // Aqui você integra com sua API de IA
      // Exemplo: OpenAI, Anthropic, etc
      const prompt = `Gere uma mensagem de ${tipoMensagem} para uma campanha chamada "${nome}" com o seguinte objetivo: ${descricao}`
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mensagemGerada = `Olá! 👋\n\nTemos uma novidade incrível para você!\n\n${descricao || 'Confira nossas últimas ofertas'}\n\n🎯 Aproveite esta oportunidade única!\n\nQualquer dúvida, estamos à disposição.`
      
      setConteudoMensagem(mensagemGerada)
    } catch (error) {
      console.error('Erro ao gerar mensagem:', error)
      alert('Erro ao gerar mensagem com IA')
    } finally {
      setLoadingIA(false)
    }
  }

  const handleSelectChat = (chatId: string) => {
    const newSelected = new Set(selectedChats)
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId)
    } else {
      newSelected.add(chatId)
    }
    setSelectedChats(newSelected)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedChats(new Set())
    } else {
      setSelectedChats(new Set(filteredChats.map(c => c.id)))
    }
    setSelectAll(!selectAll)
  }

  const handleSubmit = async () => {
    if (!nome || !conteudoMensagem || selectedChats.size === 0) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      let agendadoPara = null
      if (agendar && dataAgendamento && horaAgendamento) {
        agendadoPara = new Date(`${dataAgendamento}T${horaAgendamento}`).toISOString()
      }

      const payload = {
        nome,
        descricao,
        tipoMensagem,
        conteudoMensagem,
        mediaUrl: tipoMensagem !== 'texto' ? mediaURL : null,
        intervaloEnvio,
        conexaoSession: conexaoSelecionada,
        contatosIds: Array.from(selectedChats),
        geradoPorIa: loadingIA, // Se foi gerado por IA
        agendadoPara
      }

      const response = await fetch('/api/disparos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        onSuccess()
        handleClose()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
      alert('Erro ao criar campanha')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setNome('')
    setDescricao('')
    setTipoMensagem('texto')
    setConteudoMensagem('')
    setMediaURL('')
    setIntervaloEnvio(3)
    setAgendar(false)
    setDataAgendamento('')
    setHoraAgendamento('')
    setSelectedChats(new Set())
    setSearchQuery('')
    setSelectAll(false)
    onClose()
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.id.includes(searchQuery)
  )

  const tiposMensagem = [
    { value: 'texto', label: 'Texto', icon: Type, color: 'blue' },
    { value: 'audio', label: 'Áudio', icon: FileAudio, color: 'purple' },
    { value: 'imagem', label: 'Imagem', icon: ImageIcon, color: 'green' },
    { value: 'video', label: 'Vídeo', icon: Video, color: 'red' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Send className="w-6 h-6 text-violet-600" />
                    Nova Campanha de Disparo
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Etapa {step} de 3
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1">
                      <div className={`h-2 rounded-full transition-all ${
                        s <= step 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span className={step === 1 ? 'text-violet-600 dark:text-violet-400' : ''}>Dados</span>
                  <span className={step === 2 ? 'text-violet-600 dark:text-violet-400' : ''}>Contatos</span>
                  <span className={step === 3 ? 'text-violet-600 dark:text-violet-400' : ''}>Mensagem</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {/* STEP 1: Dados básicos */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome da Campanha *
                      </label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Promoção Black Friday"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descreva o objetivo da campanha..."
                        rows={3}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Mensagem *
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {tiposMensagem.map((tipo: any) => {
                          const Icon = tipo.icon
                          const isSelected = tipoMensagem === tipo.value
                          return (
                            <button
                              key={tipo.value}
                              onClick={() => setTipoMensagem(tipo.value as any)}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? `border-${tipo.color}-500 bg-${tipo.color}-50 dark:bg-${tipo.color}-900/20`
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                                isSelected ? `text-${tipo.color}-600` : 'text-gray-400'
                              }`} />
                              <span className={`text-sm font-medium ${
                                isSelected ? `text-${tipo.color}-600` : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {tipo.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Conexão WhatsApp *
                      </label>
                      <select
                        value={conexaoSelecionada}
                        onChange={(e) => setConexaoSelecionada(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        {conexoes.map((conn) => (
                          <option key={conn.sessionName} value={conn.sessionName}>
                            {conn.name || conn.sessionName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Intervalo entre Envios (segundos)
                      </label>
                      <input
                        type="number"
                        value={intervaloEnvio}
                        onChange={(e) => setIntervaloEnvio(Number(e.target.value))}
                        min="1"
                        max="60"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recomendado: 3-5 segundos para evitar ban
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <input
                        type="checkbox"
                        id="agendar"
                        checked={agendar}
                        onChange={(e) => setAgendar(e.target.checked)}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                      />
                      <label htmlFor="agendar" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <Clock className="w-4 h-4" />
                        Agendar disparo
                      </label>
                    </div>

                    {agendar && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data
                          </label>
                          <input
                            type="date"
                            value={dataAgendamento}
                            onChange={(e) => setDataAgendamento(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Hora
                          </label>
                          <input
                            type="time"
                            value={horaAgendamento}
                            onChange={(e) => setHoraAgendamento(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: Selecionar contatos */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedChats.size} de {chats.length} contatos selecionados
                        </span>
                      </div>
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                      >
                        {selectAll ? 'Desmarcar Todos' : 'Selecionar Todos'}
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar contato..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    {loadingChats ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                      </div>
                    ) : (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                        {filteredChats.map((chat) => {
                          const isSelected = selectedChats.has(chat.id)
                          return (
                            <button
                              key={chat.id}
                              onClick={() => handleSelectChat(chat.id)}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                                isSelected ? 'bg-violet-50 dark:bg-violet-900/20' : ''
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-violet-600 border-violet-600' 
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              
                              {chat.image ? (
                                <img src={chat.image} alt={chat.name} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-medium">
                                  {chat.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              
                              <div className="flex-1 text-left">
                                <p className="font-medium text-gray-900 dark:text-white">{chat.name}</p>
                                <p className="text-xs text-gray-500">{chat.id}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Criar mensagem */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Conteúdo da Mensagem *
                      </label>
                      <button
                        onClick={gerarMensagemIA}
                        disabled={loadingIA}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingIA ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Gerar com IA
                      </button>
                    </div>

                    <textarea
                      value={conteudoMensagem}
                      onChange={(e) => setConteudoMensagem(e.target.value)}
                      placeholder="Digite ou gere a mensagem com IA..."
                      rows={10}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none font-mono text-sm"
                    />

                    {tipoMensagem !== 'texto' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          URL da Mídia
                        </label>
                        <input
                          type="url"
                          value={mediaURL}
                          onChange={(e) => setMediaURL(e.target.value)}
                          placeholder={`URL do ${tipoMensagem}...`}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resumo:</h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>📤 <strong>{selectedChats.size}</strong> contatos selecionados</li>
                        <li>📝 Tipo: <strong className="capitalize">{tipoMensagem}</strong></li>
                        <li>⏱️ Intervalo: <strong>{intervaloEnvio}s</strong> entre envios</li>
                        <li>⏳ Tempo estimado: <strong>{Math.ceil(selectedChats.size * intervaloEnvio / 60)} minutos</strong></li>
                        {agendar && dataAgendamento && horaAgendamento && (
                          <li>📅 Agendado: <strong>{dataAgendamento} às {horaAgendamento}</strong></li>
                        )}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {step === 1 ? 'Cancelar' : 'Voltar'}
                </button>

                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && (!nome || !conexaoSelecionada)) ||
                      (step === 2 && selectedChats.size === 0)
                    }
                    className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !conteudoMensagem}
                    className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {agendar ? 'Agendar Campanha' : 'Criar Campanha'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
