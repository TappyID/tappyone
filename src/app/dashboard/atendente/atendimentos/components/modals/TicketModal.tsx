'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Tag
} from 'lucide-react'

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
}

interface TicketModalProps {
  isOpen: boolean
  onClose: () => void
  contactId: string
  contactName?: string
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

export default function TicketModal({ isOpen, onClose, contactId, contactName }: TicketModalProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'ABERTO' as Ticket['status'],
    prioridade: 2
  })

  // Buscar tickets do contato
  const fetchTickets = async () => {
    if (!contactId) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const numeroTelefone = contactId.replace('@c.us', '')
      
      const response = await fetch(`/api/tickets?contato_id=${numeroTelefone}`, {
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
    const numeroTelefone = contactId.replace('@c.us', '')
    
    try {
      const data = {
        ...formData,
        contato_id: numeroTelefone
      }

      let response
      if (editingTicket) {
        // Atualizar ticket existente
        response = await fetch(`/api/tickets/${editingTicket.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      } else {
        // Criar novo ticket
        response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
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

  // Deletar ticket
  const handleDelete = async (ticketId: string) => {
    if (!confirm('Tem certeza que deseja excluir este ticket?')) return
    
    const token = localStorage.getItem('token')
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchTickets() // Recarregar lista
      } else {
        console.error('Erro ao deletar ticket:', response.statusText)
        alert('Erro ao deletar ticket. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao deletar ticket:', error)
      alert('Erro ao deletar ticket. Verifique sua conexão.')
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
      prioridade: 2
    })
    setShowCreateForm(false)
    setEditingTicket(null)
  }

  const handleEdit = (ticket: Ticket) => {
    setFormData({
      titulo: ticket.titulo,
      descricao: ticket.descricao || '',
      status: ticket.status,
      prioridade: ticket.prioridade
    })
    setEditingTicket(ticket)
    setShowCreateForm(true)
  }

  // Carregar tickets quando modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchTickets()
    }
  }, [isOpen, contactId])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Tickets de Suporte
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {contactName || contactId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {tickets.length} ticket(s) encontrado(s)
                </span>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Ticket
              </button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 mb-6"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingTicket ? 'Editar Ticket' : 'Novo Ticket'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Descreva o problema resumidamente"
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
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-24"
                      placeholder="Descreva o problema em detalhes"
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
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value={1}>Alta</option>
                        <option value={2}>Média</option>
                        <option value={3}>Baixa</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
            )}

            {/* Tickets List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum ticket encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Este contato ainda não possui tickets de suporte.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const StatusIcon = statusIcons[ticket.status]
                  
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded-full ${prioridadeColors[ticket.prioridade]}`} />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {ticket.titulo}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ID: {ticket.id}
                            </p>
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
                            onClick={() => handleEdit(ticket)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {ticket.descricao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {ticket.descricao}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {ticket.status}
                          </span>
                          <span>Prioridade: {prioridadeLabels[ticket.prioridade]}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ticket.criadoEm).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
