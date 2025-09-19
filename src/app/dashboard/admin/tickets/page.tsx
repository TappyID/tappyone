'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Tag,
  Eye,
  MoreVertical
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState('')
  const [contatos, setContatos] = useState<any[]>([])
  const [atendentes, setAtendentes] = useState<any[]>([])
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'ABERTO' as Ticket['status'],
    prioridade: 2,
    contatoId: '',
    atendenteId: [] as string[]
  })

  // Buscar todos os tickets
  const fetchTickets = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tickets', {
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

  // Criar novo ticket
  const createTicket = async () => {
    setSaveLoading(true)
    try {
      const token = localStorage.getItem('token')
      const ticketData = {
        ...formData,
        atendenteId: formData.atendenteId.length > 0 ? formData.atendenteId[0] : null // Por enquanto, enviamos apenas o primeiro
      }
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      })

      if (response.ok) {
        fetchTickets()
        setShowCreateModal(false)
        resetForm()
        alert('✅ Ticket criado com sucesso!')
      } else {
        const errorData = await response.json()
        console.error('Erro ao criar ticket:', response.statusText)
        alert(`❌ Erro ao criar ticket: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Erro ao criar ticket:', error)
      alert('❌ Erro de conexão ao criar ticket')
    } finally {
      setSaveLoading(false)
    }
  }

  // Reset form function
  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      status: 'ABERTO',
      prioridade: 2,
      contatoId: '',
      atendenteId: []
    })
    setEditingTicket(null)
    setShowCreateModal(false)
  }

  // Editar ticket
  const updateTicket = async () => {
    if (!editingTicket) return
    setSaveLoading(true)

    try {
      const token = localStorage.getItem('token')
      const ticketData = {
        ...formData,
        atendenteId: formData.atendenteId.length > 0 ? formData.atendenteId[0] : null // Por enquanto, enviamos apenas o primeiro
      }
      const response = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      })

      if (response.ok) {
        fetchTickets()
        resetForm()
        alert('✅ Ticket atualizado com sucesso!')
      } else {
        const errorData = await response.json()
        console.error('Erro ao atualizar ticket:', response.statusText)
        alert(`❌ Erro ao atualizar ticket: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error)
      alert('❌ Erro de conexão ao atualizar ticket')
    } finally {
      setSaveLoading(false)
    }
  }

  // Deletar ticket
  const deleteTicket = async (id: string) => {
    if (!confirm('⚠️ Tem certeza que deseja excluir este ticket?\n\nEsta ação não pode ser desfeita.')) return
    
    setDeleteLoading(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchTickets()
        alert('✅ Ticket excluído com sucesso!')
      } else {
        const errorData = await response.json()
        console.error('Erro ao deletar ticket:', response.statusText)
        alert(`❌ Erro ao deletar ticket: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Erro ao deletar ticket:', error)
      alert('❌ Erro de conexão ao deletar ticket')
    } finally {
      setDeleteLoading('')
    }
  }

  // Atualizar status do ticket
  const updateTicketStatus = async (id: number, status: Ticket['status']) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchTickets()
      } else {
        console.error('Erro ao atualizar status:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  // Handlers
  const handleStatusChange = (id: string | number, status: Ticket['status']) => {
    const numericId = typeof id === 'string' ? parseInt(id) : id
    updateTicketStatus(numericId, status)
  }

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setFormData({
      titulo: ticket.titulo,
      descricao: ticket.descricao || '',
      status: ticket.status,
      prioridade: ticket.prioridade,
      contatoId: ticket.contatoId?.toString() || '',
      atendenteId: ticket.atendenteId ? [ticket.atendenteId.toString()] : []
    })
    setShowCreateModal(true)
  }

  const handleDelete = (id: string | number) => {
    const stringId = typeof id === 'number' ? id.toString() : id
    deleteTicket(stringId)
  }

  const handleSubmit = () => {
    if (editingTicket) {
      updateTicket()
    } else {
      createTicket()
    }
  }

  // Filtrar e paginar tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (ticket.descricao && ticket.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter
    const matchesPrioridade = prioridadeFilter === 'ALL' || ticket.prioridade === prioridadeFilter
    
    return matchesSearch && matchesStatus && matchesPrioridade
  })

  // Paginação
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Buscar contatos
  const fetchContatos = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/contatos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContatos(data)
      } else {
        console.error('Erro ao buscar contatos:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
    }
  }

  // Buscar atendentes (usuários)
  const fetchAtendentes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAtendentes(data)
      } else {
        console.error('Erro ao buscar atendentes:', response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error)
    }
  }

  // Carregar tickets na inicialização
  useEffect(() => {
    if (!authLoading && user) {
      fetchTickets()
    }
  }, [authLoading, user])

  // Carregar contatos e atendentes quando abrir modal
  useEffect(() => {
    if (showCreateModal) {
      fetchContatos()
      fetchAtendentes()
    }
  }, [showCreateModal])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className={`min-h-screen transition-colors duration-300 ${
        actualTheme === 'dark' 
          ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
          : 'bg-gray-50'
      }`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gerenciar Tickets
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sistema completo de tickets de suporte
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
        {/* Tickets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Criar Primeiro Ticket
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
            {paginatedTickets.map((ticket) => {
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
                            {ticket.contato?.nome || ticket.contato?.numeroTelefone || `Contato ID: ${ticket.contatoId}`}
                          </span>
                          {ticket.atendente && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-500" />
                              Atendente: {ticket.atendente.nome}
                            </span>
                          )}
                          {!ticket.atendente && ticket.atendenteId && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400" />
                              ID Atendente: {ticket.atendenteId}
                            </span>
                          )}
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
                        className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${statusColors[ticket.status]}`}
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
                      
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        disabled={deleteLoading === ticket.id}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        {deleteLoading === ticket.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredTickets.length)} de {filteredTickets.length} tickets
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
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

            <form onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }} className="p-6 space-y-4">
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
                  Contato *
                </label>
                <select
                  value={formData.contatoId}
                  onChange={(e) => setFormData(prev => ({ ...prev, contatoId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Selecione um contato</option>
                  {contatos.map((contato) => (
                    <option key={contato.id} value={contato.numeroTelefone || contato.id}>
                      {contato.nome} {contato.numeroTelefone ? `(${contato.numeroTelefone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Atendentes (múltipla seleção)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 max-h-40 overflow-y-auto">
                  {atendentes.map((atendente) => (
                    <label key={atendente.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.atendenteId.includes(atendente.id.toString())}
                        onChange={(e) => {
                          const atendenteId = atendente.id.toString()
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              atendenteId: [...prev.atendenteId, atendenteId]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              atendenteId: prev.atendenteId.filter(id => id !== atendenteId)
                            }))
                          }
                        }}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {atendente.nome} ({atendente.email})
                      </span>
                    </label>
                  ))}
                  {atendentes.length === 0 && (
                    <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
                      Nenhum atendente disponível
                    </div>
                  )}
                </div>
                {formData.atendenteId.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {formData.atendenteId.length} atendente(s) selecionado(s)
                  </div>
                )}
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
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingTicket ? 'Atualizar' : 'Criar'} Ticket
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={saveLoading}
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
                    <div><strong>ID:</strong> {viewingTicket.id}</div>
                    <div><strong>Contato:</strong> {viewingTicket.contato?.nome || viewingTicket.contato?.numeroTelefone || `ID: ${viewingTicket.contatoId}`}</div>
                    {viewingTicket.atendente && (
                      <div><strong>Atendente:</strong> {viewingTicket.atendente.nome} ({viewingTicket.atendente.email})</div>
                    )}
                    <div><strong>Criado em:</strong> {new Date(viewingTicket.criadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                    <div><strong>Atualizado em:</strong> {new Date(viewingTicket.atualizadoEm).toLocaleDateString('pt-BR', {
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
    </AdminLayout>
  )
}
