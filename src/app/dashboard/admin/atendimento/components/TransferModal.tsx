'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtendimentoStates } from '@/hooks/useAtendimentoStates'
import {
  X,
  Search,
  Users,
  User,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  Building,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Star,
  ArrowRight,
  Filter
} from 'lucide-react'

// Adicionar estilo de animação para os toasts
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
  `
  if (!document.querySelector('style[data-toast-animations]')) {
    style.setAttribute('data-toast-animations', 'true')
    document.head.appendChild(style)
  }
}

interface Atendente {
  id: string
  nome: string
  email: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
  atendimentosAtivos: number
  filas: string[]
  rating?: number
  ultimoAtendimento?: Date
}

interface Fila {
  id: string
  nome: string
  cor: string
  descricao?: string
  atendentes: any[]
  atendimentosEmEspera: number
  tempoMedioEspera: number
  count?: number
}

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: string
  chatName: string
  currentAtendente?: string
  currentFila?: string
  onTransferSuccess?: () => void // Callback opcional para refresh
}

export default function TransferModal({
  isOpen,
  onClose,
  chatId,
  chatName,
  currentAtendente,
  currentFila,
  onTransferSuccess
}: TransferModalProps) {

  if (!isOpen) {
    return null
  }
  const [activeTab, setActiveTab] = useState<'atendentes' | 'filas'>('atendentes')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAtendente, setSelectedAtendente] = useState<string | null>(null)
  const [selectedFila, setSelectedFila] = useState<string | null>(null)
  const [transferNotes, setTransferNotes] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'available'>('all')

  // Hook para transferir atendimento
  const { transferirAtendimento } = useAtendimentoStates()

  // Estados locais para evitar loop do useFiltersData
  const [realAtendentes, setRealAtendentes] = useState<any[]>([])
  const [realFilas, setRealFilas] = useState<any[]>([])
  const [isLoadingAtendentes, setIsLoadingAtendentes] = useState(false)
  const [isLoadingFilas, setIsLoadingFilas] = useState(false)

  // Buscar dados apenas quando modal abrir
  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      // Buscar atendentes, admins e usuário atual
      setIsLoadingAtendentes(true)
      try {
        const [atendentesResponse, adminsResponse, currentUserResponse] = await Promise.all([
          fetch('/api/users?tipo=atendente', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
          fetch('/api/users?tipo=admin', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
          fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          })
        ])

        const allUsers = []

        if (atendentesResponse.ok) {
          const atendentesData = await atendentesResponse.json()

          // Os dados estão diretamente no array, não em .data
          const dataArray = atendentesData.data || atendentesData || []

          const formatted = dataArray.map((user: any) => ({
            id: user.id,
            nome: user.nome,
            email: user.email,
            status: user.status || 'offline',
            atendimentosAtivos: user.atendimentosAtivos || 0,
            filas: user.filas || [],
            tipo: 'atendente'
          }))
          allUsers.push(...formatted)
        }

        if (adminsResponse.ok) {
          const adminsData = await adminsResponse.json()
          const formatted = (adminsData.data || []).map((user: any) => ({
            id: user.id,
            nome: user.nome,
            email: user.email,
            status: 'online',
            atendimentosAtivos: 0,
            filas: [],
            tipo: 'admin'
          }))
          allUsers.push(...formatted)
        }

        // Adicionar usuário atual (que foi excluído pelo backend)
        if (currentUserResponse.ok) {
          const currentUserData = await currentUserResponse.json()

          // A API retorna o usuário diretamente, não em { data: user }
          const userData = currentUserData.data || currentUserData
          if (userData && userData.id) {
            const currentUser = {
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              status: 'online',
              atendimentosAtivos: 0,
              filas: [],
              tipo: userData.tipo?.toLowerCase() || 'admin'
            }
            allUsers.push(currentUser)
          }
        }
        setRealAtendentes(allUsers)
      } catch {

        setRealAtendentes([])
      } finally {
        setIsLoadingAtendentes(false)
      }

      // Buscar filas
      setIsLoadingFilas(true)
      try {
        const response = await fetch('/api/filas', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          const data = await response.json()
          const formatted = (data.data || [])
            .filter((fila: any) => fila && fila.ativo !== false && !fila.deletedAt)
            .map((fila: any) => ({
              id: fila.id,
              nome: fila.nome,
              cor: fila.cor || '#3B82F6',
              descricao: fila.descricao || ''
            }))
            setRealFilas(formatted)
        }
      } catch {

        setRealFilas([])
      } finally {
        setIsLoadingFilas(false)
      }
    }

    fetchData()
  }, [isOpen]) // ← SÓ EXECUTA QUANDO MODAL ABRIR

  const atendentes = useMemo(() => (
    realAtendentes.map(a => ({
      ...a,
      atendimentosAtivos: a.atendimentosAtivos || 0,
      ultimoAtendimento: new Date()
    }))
  ), [realAtendentes])

  const filas = useMemo(() => (
    realFilas.map(f => ({
      ...f,
      atendentes: f.atendentes || [],
      atendimentosEmEspera: f.count || 0,
      tempoMedioEspera: Math.floor(Math.random() * 15) + 1
    }))
  ), [realFilas])

  const currentAtendenteMatch = useMemo(() => {
    if (!currentAtendente) return null

    // Se currentAtendente começa com "ID:", extrair o ID real
    if (currentAtendente.startsWith('ID:')) {
      const idPart = currentAtendente.replace('ID:', '')
      return atendentes.find(a => a.id.startsWith(idPart))
    }

    return atendentes.find(a => a.id === currentAtendente || a.nome === currentAtendente)
  }, [currentAtendente, atendentes])

  const currentFilaMatch = useMemo(() => {
    if (!currentFila || currentFila === 'Sem fila') {
      return null
    }

    return filas.find(f => f.id === currentFila || f.nome === currentFila)
  }, [currentFila, filas])

  const currentAtendenteDisplay = currentAtendenteMatch?.nome || (currentAtendente && currentAtendente !== 'Não atribuído' ? currentAtendente : null)
  const currentFilaDisplay = currentFilaMatch?.nome || (currentFila && currentFila !== 'Sem fila' ? currentFila : null)

  useEffect(() => {
    if (!isOpen) {
      setSelectedAtendente(null)
      setSelectedFila(null)
      setActiveTab('atendentes')
      setSearchTerm('')
      return
    }

    // Dados já são carregados quando modal abre

    const matchedAtendenteId = currentAtendenteMatch?.id
    const matchedFila = currentFilaMatch || (currentFila
      ? filas.find(f => f.id === currentFila || f.nome === currentFila)
      : null)

    if (matchedAtendenteId) {
      setSelectedAtendente(matchedAtendenteId)
      setActiveTab('atendentes')
    } else {
      setSelectedAtendente(null)
    }

    if (matchedFila?.id) {
      setSelectedFila(matchedFila.id)
      if (!matchedAtendenteId) {
        setActiveTab('filas')
      }
    } else {
      setSelectedFila(null)
    }
  }, [isOpen, currentAtendente, currentAtendenteMatch, currentFilaMatch, currentFila, filas])

  // Filtrar atendentes
  const filteredAtendentes = useMemo(() => {
    const filtered = atendentes.filter(atendente => {
      const matchesSearch = atendente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           atendente.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = filterStatus === 'all' ||
                           (filterStatus === 'online' && atendente.status === 'online') ||
                           (filterStatus === 'available' && atendente.status === 'online' && atendente.atendimentosAtivos < 5)

      return matchesSearch && matchesFilter
    })

    return filtered
  }, [atendentes, searchTerm, filterStatus])

  // Filtrar filas
  const filteredFilas = useMemo(() => {
    const filtered = filas.filter(fila =>
      fila.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fila.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered
  }, [filas, searchTerm])

  const isTransferDisabled = (activeTab === 'atendentes' ? !selectedAtendente : !selectedFila) || isTransferring

  // Função para transferir
  const handleTransfer = async () => {
    const targetId = activeTab === 'atendentes' ? selectedAtendente : selectedFila
    console.log('🔄 [TRANSFER] Iniciando transferência:', {
      chatId,
      activeTab,
      targetId,
      transferNotes
    })
    
    if (!targetId) {
      console.error('❌ [TRANSFER] targetId não definido!')
      // Toast de erro
      const toastDiv = document.createElement('div')
      toastDiv.className = 'fixed top-20 right-4 z-[9999] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-right'
      toastDiv.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg><span>❌ Erro: Selecione um destino!</span>`
      document.body.appendChild(toastDiv)
      setTimeout(() => toastDiv.remove(), 3000)
      return
    }

    setIsTransferring(true)
    try {
      if (activeTab === 'atendentes') {
        console.log('👤 [TRANSFER] Transferindo para atendente:', targetId)
        // Transferir para um atendente específico
        await transferirAtendimento(chatId, targetId, undefined, transferNotes)
      } else {
        console.log('📋 [TRANSFER] Transferindo para fila:', targetId)
        // Transferir para uma fila (limpar atendente atual)
        await transferirAtendimento(chatId, '', targetId, transferNotes)
      }

      console.log('✅ [TRANSFER] Transferência concluída!')
      
      // Toast de sucesso
      const toastDiv = document.createElement('div')
      toastDiv.className = 'fixed top-20 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right'
      toastDiv.innerHTML = `
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div>
          <p class="font-bold">✅ Transferência realizada!</p>
          <p class="text-xs opacity-90">Atualizando lista...</p>
        </div>
      `
      document.body.appendChild(toastDiv)
      setTimeout(() => toastDiv.remove(), 4000)
      
      // Chamar callback de sucesso se fornecido
      if (onTransferSuccess) {
        console.log('🔄 [TRANSFER] Chamando onTransferSuccess')
        onTransferSuccess()
      }
      
      // Aguardar 500ms e então recarregar a página para garantir atualização
      setTimeout(() => {
        console.log('🔄 [TRANSFER] Recarregando página...')
        window.location.reload()
      }, 500)

      onClose()
    } catch (error) {
      console.error('❌ [TRANSFER] Erro ao transferir:', error)

      // Toast de erro
      const toastDiv = document.createElement('div')
      toastDiv.className = 'fixed top-20 right-4 z-[9999] bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right'
      toastDiv.innerHTML = `
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div>
          <p class="font-bold">❌ Erro na transferência!</p>
          <p class="text-xs opacity-90">${error instanceof Error ? error.message : 'Tente novamente'}</p>
        </div>
      `
      document.body.appendChild(toastDiv)
      setTimeout(() => toastDiv.remove(), 4000)
    } finally {
      setIsTransferring(false)
    }
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { color: 'bg-green-500', text: 'Online' },
      offline: { color: 'bg-gray-500', text: 'Offline' },
      busy: { color: 'bg-red-500', text: 'Ocupado' },
      away: { color: 'bg-yellow-500', text: 'Ausente' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline

    return (
      <span className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-xs text-gray-500">{config.text}</span>
      </span>
    )
  }

  // Formatar tempo
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
  }

  const renderAtendentesContent = () => {

    if (isLoadingAtendentes) {
      return (
        <div className="flex items-center justify-center py-6 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando atendentes...
        </div>
      )
    }

    if (filteredAtendentes.length === 0) {
      return (
        <div className="py-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Nenhum atendente disponível.
        </div>
      )
    }

    return filteredAtendentes.map((atendente) => (
      <motion.div
        key={atendente.id}
        whileHover={{ scale: 1.01 }}
        onClick={() => setSelectedAtendente(atendente.id)}
        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all
          ${selectedAtendente === atendente.id
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                          flex items-center justify-center text-white font-semibold">
              {atendente.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {atendente.nome}
                </h4>
                {getStatusBadge(atendente.status)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {atendente.email}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(atendente.filas || []).map((fila) => (
                  <span
                    key={`${atendente.id}-${fila}`}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800
                             text-gray-600 dark:text-gray-400 rounded"
                  >
                    {fila}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MessageSquare className="w-3 h-3" />
              <span>{atendente.atendimentosAtivos} ativos</span>
            </div>
            {atendente.rating && (
              <div className="flex items-center gap-1 text-xs text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <span>{atendente.rating}</span>
              </div>
            )}
          </div>
        </div>
        {selectedAtendente === atendente.id && (
          <CheckCircle className="w-5 h-5 text-blue-500 absolute top-3 right-3" />
        )}
      </motion.div>
    ))
  }

  const renderFilasContent = () => {

    if (isLoadingFilas) {
      return (
        <div className="flex items-center justify-center py-6 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando filas...
        </div>
      )
    }

    if (filteredFilas.length === 0) {
      return (
        <div className="py-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Nenhuma fila disponível.
        </div>
      )
    }

    return filteredFilas.map((fila) => (
      <motion.div
        key={fila.id}
        whileHover={{ scale: 1.01 }}
        onClick={() => setSelectedFila(fila.id)}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all
          ${selectedFila === fila.id
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${fila.cor || '#3B82F6'}20` }}
            >
              <Users className="w-5 h-5" style={{ color: fila.cor || '#3B82F6' }} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {fila.nome}
              </h4>
              {fila.descricao && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {fila.descricao}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>~{formatTime(fila.tempoMedioEspera)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{fila.atendimentosEmEspera} na fila</span>
                </div>
              </div>
            </div>
          </div>
          {selectedFila === fila.id && (
            <CheckCircle className="w-5 h-5 text-blue-500" />
          )}
        </div>
      </motion.div>
    ))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900
                       shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transferir Atendimento
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Transferindo conversa com <span className="font-semibold">{chatName}</span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                {currentAtendenteDisplay && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-medium">Atendente Atual</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {currentAtendenteDisplay}
                    </p>
                  </div>
                )}

                {currentFilaDisplay && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Fila Atual</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {currentFilaDisplay}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('atendentes')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative
                  ${activeTab === 'atendentes'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  Atendentes
                </div>
                {activeTab === 'atendentes' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('filas')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors relative
                  ${activeTab === 'filas'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Filas
                </div>
                {activeTab === 'filas' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  />
                )}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Buscar ${activeTab === 'atendentes' ? 'atendente' : 'fila'}...`}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200
                           dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500
                           focus:border-transparent"
                />
              </div>

              {activeTab === 'atendentes' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                      ${filterStatus === 'all'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterStatus('online')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                      ${filterStatus === 'online'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => setFilterStatus('available')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                      ${filterStatus === 'available'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                  >
                    Disponíveis
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {activeTab === 'atendentes' ? (
                <div className="space-y-2">{renderAtendentesContent()}</div>
              ) : (
                <div className="space-y-2">{renderFilasContent()}</div>
              )}
            </div>

            {/* Notes Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações da transferência (opcional)
              </label>
              <textarea
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Adicione informações relevantes sobre o atendimento..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200
                         dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500
                         focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800
                           border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50
                           dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleTransfer}
                  disabled={isTransferDisabled}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transferindo...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Transferir
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
