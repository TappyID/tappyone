'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  atendentes: Atendente[]
  atendimentosEmEspera: number
  tempoMedioEspera: number
}

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: string
  chatName: string
  currentAtendente?: string
  currentFila?: string
  onTransfer: (targetId: string, type: 'atendente' | 'fila', notes?: string) => void
}

export default function TransferModal({
  isOpen,
  onClose,
  chatId,
  chatName,
  currentAtendente,
  currentFila,
  onTransfer
}: TransferModalProps) {
  const [activeTab, setActiveTab] = useState<'atendentes' | 'filas'>('atendentes')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [transferNotes, setTransferNotes] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'available'>('all')
  
  // Mock data - substituir por dados reais
  const [atendentes, setAtendentes] = useState<Atendente[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      status: 'online',
      atendimentosAtivos: 3,
      filas: ['Vendas', 'Suporte'],
      rating: 4.8,
      ultimoAtendimento: new Date()
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      status: 'busy',
      atendimentosAtivos: 5,
      filas: ['Suporte', 'Financeiro'],
      rating: 4.9,
      ultimoAtendimento: new Date()
    },
    {
      id: '3',
      nome: 'Pedro Oliveira',
      email: 'pedro@example.com',
      status: 'online',
      atendimentosAtivos: 2,
      filas: ['Vendas'],
      rating: 4.7,
      ultimoAtendimento: new Date()
    },
    {
      id: '4',
      nome: 'Ana Costa',
      email: 'ana@example.com',
      status: 'away',
      atendimentosAtivos: 0,
      filas: ['Financeiro', 'RH'],
      rating: 4.6,
      ultimoAtendimento: new Date()
    }
  ])

  const [filas, setFilas] = useState<Fila[]>([
    {
      id: 'f1',
      nome: 'Vendas',
      cor: '#10B981',
      descricao: 'Atendimento comercial e vendas',
      atendentes: [],
      atendimentosEmEspera: 2,
      tempoMedioEspera: 5
    },
    {
      id: 'f2',
      nome: 'Suporte Técnico',
      cor: '#3B82F6',
      descricao: 'Suporte técnico e resolução de problemas',
      atendentes: [],
      atendimentosEmEspera: 4,
      tempoMedioEspera: 8
    },
    {
      id: 'f3',
      nome: 'Financeiro',
      cor: '#F59E0B',
      descricao: 'Questões financeiras e cobranças',
      atendentes: [],
      atendimentosEmEspera: 1,
      tempoMedioEspera: 3
    }
  ])

  // Filtrar atendentes
  const filteredAtendentes = atendentes.filter(atendente => {
    const matchesSearch = atendente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atendente.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'online' && atendente.status === 'online') ||
                         (filterStatus === 'available' && atendente.status === 'online' && atendente.atendimentosAtivos < 5)
    
    return matchesSearch && matchesFilter
  })

  // Filtrar filas
  const filteredFilas = filas.filter(fila =>
    fila.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fila.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para transferir
  const handleTransfer = async () => {
    if (!selectedTarget) return
    
    setIsTransferring(true)
    
    try {
      await onTransfer(selectedTarget, activeTab === 'atendentes' ? 'atendente' : 'fila', transferNotes)
      onClose()
    } catch (error) {
      console.error('Erro ao transferir:', error)
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
                {currentAtendente && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-medium">Atendente Atual</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {currentAtendente}
                    </p>
                  </div>
                )}
                
                {currentFila && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Fila Atual</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {currentFila}
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
                <div className="space-y-2">
                  {filteredAtendentes.map((atendente) => (
                    <motion.div
                      key={atendente.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedTarget(atendente.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedTarget === atendente.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                        flex items-center justify-center text-white font-semibold">
                            {atendente.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          
                          {/* Info */}
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
                            
                            {/* Filas */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {atendente.filas.map((fila) => (
                                <span
                                  key={fila}
                                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 
                                           text-gray-600 dark:text-gray-400 rounded"
                                >
                                  {fila}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
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
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFilas.map((fila) => (
                    <motion.div
                      key={fila.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedTarget(fila.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedTarget === fila.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* Ícone colorido */}
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${fila.cor}20` }}
                          >
                            <Users className="w-5 h-5" style={{ color: fila.cor }} />
                          </div>
                          
                          {/* Info */}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {fila.nome}
                            </h4>
                            
                            {fila.descricao && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {fila.descricao}
                              </p>
                            )}
                            
                            {/* Stats */}
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

                        {/* Indicador de seleção */}
                        {selectedTarget === fila.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                  disabled={!selectedTarget || isTransferring}
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
