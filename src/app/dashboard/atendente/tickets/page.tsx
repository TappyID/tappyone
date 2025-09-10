'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AtendenteLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Tag,
  Eye
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface Ticket {
  id: string
  titulo: string
  descricao?: string
  status: 'ABERTO' | 'ANDAMENTO' | 'ENCERRADO'
  prioridade: number // 1 = Alta, 2 = Média, 3 = Baixa
  usuarioId: string
  contatoId: string
  atendenteId?: string
  filaId?: string
  criadoEm: string
  atualizadoEm: string
  // Campos extras para exibição
  contato?: {
    nome?: string
    numeroTelefone?: string
  }
  usuario?: {
    nome: string
    email: string
  }
  atendente?: {
    nome: string
    email: string
  }
}

const statusColors = {
  ABERTO: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  ANDAMENTO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  ENCERRADO: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
}

const statusIcons = {
  ABERTO: AlertTriangle,
  ANDAMENTO: Clock,
  ENCERRADO: CheckCircle2
}

const prioridadeColors = {
  1: 'bg-red-500',
  2: 'bg-yellow-500', 
  3: 'bg-green-500'
}

const prioridadeLabels = {
  1: 'Alta',
  2: 'Média',
  3: 'Baixa'
}

export default function TicketsPage() {
  const { actualTheme } = useTheme()
  const { user, loading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ABERTO' | 'ANDAMENTO' | 'ENCERRADO'>('ALL')
  const [prioridadeFilter, setPrioridadeFilter] = useState<'ALL' | 1 | 2 | 3>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'ABERTO' as Ticket['status'],
    prioridade: 2,
    contatoId: ''
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Buscar tickets do atendente logado
  const fetchTickets = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tickets/atendente', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      } else {
        console.error('Erro ao buscar tickets:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Criar ou atualizar ticket
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    
    try {
      let response
      if (editingTicket) {
        // Atualizar ticket existente
        response = await fetch(`/api/tickets/${editingTicket.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
      } else {
        // Criar novo ticket
        response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
      }

      if (response.ok) {
        resetForm()
        fetchTickets() // Recarregar lista
      } else {
        console.error('Erro ao salvar ticket:', response.statusText)
        alert('Erro ao salvar ticket. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao salvar ticket:', error)
      alert('Erro ao salvar ticket. Verifique sua conexão.')
    }
  }

  // Atualizar status do ticket
  const handleStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    const token = localStorage.getItem('token')
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchTickets() // Recarregar lista
      } else {
        console.error('Erro ao atualizar status:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      status: 'ABERTO',
      prioridade: 2,
      contatoId: ''
    })
    setShowCreateModal(false)
    setEditingTicket(null)
  }

  const handleEdit = (ticket: Ticket) => {
    setFormData({
      titulo: ticket.titulo,
      descricao: ticket.descricao || '',
      status: ticket.status,
      prioridade: ticket.prioridade,
      contatoId: ticket.contatoId
    })
    setEditingTicket(ticket)
    setShowCreateModal(true)
  }

  // Filtrar tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.contato?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.contato?.numeroTelefone?.includes(searchQuery)

    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter
    const matchesPrioridade = prioridadeFilter === 'ALL' || ticket.prioridade === prioridadeFilter

    return matchesSearch && matchesStatus && matchesPrioridade
  })

  // Carregar tickets na inicialização
  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <AtendenteLayout>
      <div className={`min-h-screen transition-colors duration-300 ${
        actualTheme === 'dark' 
          ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
          : 'bg-gray-50'
      }`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Meus Tickets
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerencie seus tickets de suporte
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ABERTO">Aberto</option>
            <option value="ANDAMENTO">Em Andamento</option>
            <option value="ENCERRADO">Encerrado</option>
          </select>

          {/* Priority Filter */}
          <select
            value={prioridadeFilter}
            onChange={(e) => setPrioridadeFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value) as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value={1}>Alta</option>
            <option value={2}>Média</option>
            <option value={3}>Baixa</option>
          </select>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredTickets.length} de {tickets.length} tickets
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {tickets.length === 0 ? 'Nenhum ticket encontrado' : 'Nenhum resultado'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {tickets.length === 0 
                ? 'Comece criando seu primeiro ticket de suporte.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
            {tickets.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Criar Primeiro Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => {
              const StatusIcon = statusIcons[ticket.status]
              
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-1 h-16 rounded-full ${prioridadeColors[ticket.prioridade]}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {ticket.titulo}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {ticket.status}
                          </span>
                        </div>
                        
                        {ticket.descricao && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {ticket.descricao}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            ID: {ticket.id.slice(0, 8)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.contato?.nome || ticket.contato?.numeroTelefone || 'Sem contato'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(ticket.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                          <span>Prioridade: {prioridadeLabels[ticket.prioridade]}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as Ticket['status'])}
                        className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-red-500 ${statusColors[ticket.status]}`}
                      >
                        <option value="ABERTO">Aberto</option>
                        <option value="ANDAMENTO">Em Andamento</option>
                        <option value="ENCERRADO">Encerrado</option>
                      </select>
                      
                      <button
                        onClick={() => setViewingTicket(ticket)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingTicket ? 'Editar Ticket' : 'Novo Ticket'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Título do ticket"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                  placeholder="Descrição detalhada do problema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID do Contato *
                </label>
                <input
                  type="text"
                  value={formData.contatoId}
                  onChange={(e) => setFormData(prev => ({ ...prev, contatoId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Número do telefone ou ID do contato"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Ticket['status'] }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="ANDAMENTO">Em Andamento</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData(prev => ({ ...prev, prioridade: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={1}>Alta</option>
                    <option value={2}>Média</option>
                    <option value={3}>Baixa</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {editingTicket ? 'Atualizar' : 'Criar'} Ticket
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalhes do Ticket
              </h2>
              <button
                onClick={() => setViewingTicket(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400 rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {viewingTicket.titulo}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[viewingTicket.status]}`}>
                    {React.createElement(statusIcons[viewingTicket.status], { className: "w-3 h-3" })}
                    {viewingTicket.status}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${prioridadeColors[viewingTicket.prioridade]}`} />
                  <span className="text-sm text-gray-500">
                    Prioridade {prioridadeLabels[viewingTicket.prioridade]}
                  </span>
                </div>
              </div>

              {viewingTicket.descricao && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Descrição</h4>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {viewingTicket.descricao}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informações</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>ID: {viewingTicket.id}</div>
                    <div>Contato: {viewingTicket.contato?.nome || viewingTicket.contato?.numeroTelefone || viewingTicket.contatoId}</div>
                    <div>Criado em: {new Date(viewingTicket.criadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                    <div>Atualizado em: {new Date(viewingTicket.atualizadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric', 
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setViewingTicket(null)
                    handleEdit(viewingTicket)
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Editar Ticket
                </button>
                <button
                  onClick={() => setViewingTicket(null)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </AtendenteLayout>
  )
}
