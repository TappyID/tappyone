'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Clock, 
  User, 
  Hash, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Timer,
  Check,
  AlertTriangle,
  Tag,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react'
import { useTickets, Ticket } from '@/hooks/useTickets'
import { motion, AnimatePresence } from 'framer-motion'

interface TicketModalData {
  id: string
  titulo: string
  descricao: string
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
  prazoResolucao: number // minutos
  criadoEm: string
  atendente?: {
    id: string
    nome: string
    email: string
  }
}

interface TicketModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTicket: (ticket: any) => void
  onSelectTicket: (ticket: any) => void
  chatId: string
  contactName: string
  existingTickets?: Ticket[]
}

const PRIORIDADES = {
  baixa: { label: 'Baixa', color: 'bg-green-500', textColor: 'text-green-600', prazo: 240 },
  media: { label: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-600', prazo: 90 },
  alta: { label: 'Alta', color: 'bg-orange-500', textColor: 'text-orange-600', prazo: 45 },
  urgente: { label: 'Urgente', color: 'bg-red-500', textColor: 'text-red-600', prazo: 15 }
}

// Mapear prioridade numérica do backend para string do modal
const getPrioridadeString = (prioridadeNum: number): keyof typeof PRIORIDADES => {
  switch (prioridadeNum) {
    case 1: return 'alta'
    case 2: return 'media'  
    case 3: return 'baixa'
    default: return 'media'
  }
}

// Obter configuração da prioridade
const getPrioridadeConfig = (prioridade: number | string) => {
  const prioridadeKey = typeof prioridade === 'number' 
    ? getPrioridadeString(prioridade) 
    : prioridade as keyof typeof PRIORIDADES
  return PRIORIDADES[prioridadeKey] || PRIORIDADES.media
}

export default function TicketModal({
  isOpen,
  onClose,
  onCreateTicket,
  onSelectTicket,
  chatId,
  contactName,
  existingTickets = []
}: TicketModalProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select')
  const [searchQuery, setSearchQuery] = useState('')
  const { tickets, fetchTicketsByContact, loading } = useTickets({ contactId: chatId, autoFetch: false })
  const [newTicket, setNewTicket] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media' as keyof typeof PRIORIDADES,
    prazoResolucao: 120
  })

  // Buscar tickets ao abrir o modal
  useEffect(() => {
    if (isOpen && chatId) {
      fetchTicketsByContact(chatId)
    }
  }, [isOpen, chatId, fetchTicketsByContact])

  // Usar tickets do hook ou os passados como prop
  const ticketsToShow = existingTickets && existingTickets.length > 0 ? existingTickets : tickets

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(ticketsToShow.length > 0 ? 'select' : 'create')
      setSearchQuery('')
      setNewTicket({
        titulo: '',
        descricao: '',
        prioridade: 'media',
        prazoResolucao: 120
      })
    }
  }, [isOpen, existingTickets.length])

  // Update prazo when prioridade changes
  useEffect(() => {
    setNewTicket(prev => ({
      ...prev,
      prazoResolucao: PRIORIDADES[prev.prioridade].prazo
    }))
  }, [newTicket.prioridade])

  const filteredTickets = existingTickets.filter(ticket =>
    ticket.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTicket = () => {
    if (!newTicket.titulo.trim()) return

    onCreateTicket({
      ...newTicket,
      status: 'aberto'
    })
    onClose()
  }

  const getPrioridadeIcon = (prioridade: keyof typeof PRIORIDADES) => {
    switch (prioridade) {
      case 'baixa': return <CheckCircle className="w-4 h-4" />
      case 'media': return <Clock className="w-4 h-4" />
      case 'alta': return <AlertCircle className="w-4 h-4" />
      case 'urgente': return <Zap className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Gerenciar Ticket
                </h2>
                <p className="text-muted-foreground mt-1">
                  Para conversa com <strong>{contactName}</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('select')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'select'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Escolher Existente ({existingTickets.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'create'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Novo
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'select' ? (
              <div className="space-y-4">
                {existingTickets.length > 0 ? (
                  <>
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Tickets list */}
                    <div className="space-y-3">
                      {filteredTickets.map((ticket) => (
                        <motion.div
                          key={ticket.id}
                          whileHover={{ y: -2 }}
                          className="p-4 bg-muted/30 border border-border rounded-lg cursor-pointer hover:shadow-md transition-all"
                          onClick={() => {
                            onSelectTicket(ticket)
                            onClose()
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${getPrioridadeConfig(ticket.prioridade).color} text-white`}>
                                {getPrioridadeIcon(getPrioridadeString(ticket.prioridade))}
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{ticket.titulo}</h3>
                                <p className="text-sm text-muted-foreground">{ticket.descricao}</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded ${getPrioridadeConfig(ticket.prioridade).textColor} bg-current/10`}>
                                {getPrioridadeConfig(ticket.prioridade).label}
                              </span>
                              <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {getPrioridadeConfig(ticket.prioridade).prazo}min
                              </div>
                            </div>
                            <span>{new Date(ticket.criadoEm).toLocaleDateString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Hash className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Novo Ticket - {contactName}</h3>
                    <p className="text-muted-foreground mb-4">
                      Não há tickets existentes para este chat.
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Criar Primeiro Ticket
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Título do Ticket *
                  </label>
                  <input
                    type="text"
                    value={newTicket.titulo}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Problema com pedido, Dúvida sobre produto..."
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newTicket.descricao}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva os detalhes do ticket..."
                    rows={3}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prioridade
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(PRIORIDADES).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setNewTicket(prev => ({ 
                          ...prev, 
                          prioridade: key as keyof typeof PRIORIDADES 
                        }))}
                        className={`p-3 border rounded-lg transition-all ${
                          newTicket.prioridade === key
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-border hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1 rounded ${config.color} text-white`}>
                            {getPrioridadeIcon(key as keyof typeof PRIORIDADES)}
                          </div>
                          <span className="font-medium">{config.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {config.prazo} minutos
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prazo personalizado */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Prazo de Resolução (minutos)
                  </label>
                  <input
                    type="number"
                    value={newTicket.prazoResolucao}
                    onChange={(e) => setNewTicket(prev => ({ 
                      ...prev, 
                      prazoResolucao: parseInt(e.target.value) || 0 
                    }))}
                    min="1"
                    max="1440"
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'create' && (
            <div className="p-6 border-t border-border bg-muted/20">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTicket}
                  disabled={!newTicket.titulo.trim()}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Ticket
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
