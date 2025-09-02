'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  Users,
  Coffee,
  Bell,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  ExternalLink,
  Copy,
  Share2
} from 'lucide-react'

interface Agendamento {
  id: string
  titulo: string
  descricao?: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: 'reuniao' | 'ligacao' | 'video' | 'presencial' | 'coffee'
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  prioridade: 'baixa' | 'media' | 'alta'
  contato: {
    id: string
    nome: string
    telefone?: string
    email?: string
    avatar?: string
    empresa?: string
  }
  local?: string
  link_video?: string
  observacoes?: string
  lembrete?: number
  cor?: string
}

interface DetalhesAgendamentoModalProps {
  isOpen: boolean
  onClose: () => void
  agendamento: Agendamento | null
  onEdit: (agendamento: Agendamento) => void
  onDelete: (id: string) => void
}

export default function DetalhesAgendamentoModal({ 
  isOpen, 
  onClose, 
  agendamento,
  onEdit,
  onDelete
}: DetalhesAgendamentoModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!agendamento) return null

  const tipoIcons = {
    reuniao: Users,
    ligacao: Phone,
    video: Video,
    presencial: MapPin,
    coffee: Coffee
  }

  const tipoLabels = {
    reuniao: 'Reunião',
    ligacao: 'Ligação',
    video: 'Videochamada',
    presencial: 'Presencial',
    coffee: 'Coffee Meeting'
  }

  const statusColors = {
    agendado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmado: 'bg-green-100 text-green-800 border-green-200',
    cancelado: 'bg-red-100 text-red-800 border-red-200',
    concluido: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const statusLabels = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado',
    concluido: 'Concluído'
  }

  const prioridadeColors = {
    baixa: 'text-green-600 bg-green-50',
    media: 'text-yellow-600 bg-yellow-50',
    alta: 'text-red-600 bg-red-50'
  }

  const prioridadeLabels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta'
  }

  const TipoIcon = tipoIcons[agendamento.tipo]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleStatusChange = (newStatus: Agendamento['status']) => {
    onEdit({
      ...agendamento,
      status: newStatus
    })
  }

  const handleDelete = () => {
    onDelete(agendamento.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Aqui você poderia adicionar um toast de confirmação
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div 
                className="px-6 py-6 text-white relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${agendamento.cor || '#305e73'} 0%, ${agendamento.cor || '#3a6d84'} 100%)`
                }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <TipoIcon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-white">{agendamento.titulo}</h2>
                          {agendamento.prioridade === 'alta' && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-white/90 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(agendamento.data)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{agendamento.hora_inicio} - {agendamento.hora_fim}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[agendamento.status]} bg-white/20`}>
                            {statusLabels[agendamento.status]}
                          </div>
                          <div className="text-sm text-white/80">
                            {tipoLabels[agendamento.tipo]}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Informações do Contato */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#305e73]" />
                        Informações do Contato
                      </h3>
                      
                      <div className="flex items-start gap-4">
                        {agendamento.contato?.avatar ? (
                          <img
                            src={agendamento.contato.avatar}
                            alt={agendamento.contato?.nome || 'Contato'}
                            className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-2xl font-bold text-white">
                              {agendamento.contato?.nome?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">
                            {agendamento.contato?.nome || 'Contato não encontrado'}
                          </h4>
                          {agendamento.contato?.empresa && (
                            <p className="text-gray-600 mb-2">{agendamento.contato.empresa}</p>
                          )}
                          
                          <div className="space-y-2">
                            {agendamento.contato?.telefone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{agendamento.contato.telefone}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => copyToClipboard(agendamento.contato?.telefone || '')}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </motion.button>
                              </div>
                            )}
                            {agendamento.contato?.email && (
                              <div className="flex items-center gap-2">
                                <span className="w-4 h-4 text-gray-400">@</span>
                                <span className="text-gray-700">{agendamento.contato.email}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => copyToClipboard(agendamento.contato?.email || '')}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes do Agendamento */}
                    <div className="space-y-4">
                      {agendamento.descricao && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Descrição
                          </h4>
                          <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                            {agendamento.descricao}
                          </p>
                        </div>
                      )}

                      {agendamento.local && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Local
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-600 bg-gray-50 rounded-lg p-3 flex-1">
                              {agendamento.local}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => copyToClipboard(agendamento.local || '')}
                              className="p-3 hover:bg-gray-100 rounded-lg"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </motion.button>
                          </div>
                        </div>
                      )}

                      {agendamento.link_video && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Link da Videochamada
                          </h4>
                          <div className="flex items-center gap-2">
                            <a
                              href={agendamento.link_video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg p-3 flex-1 flex items-center gap-2"
                            >
                              {agendamento.link_video}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => copyToClipboard(agendamento.link_video || '')}
                              className="p-3 hover:bg-gray-100 rounded-lg"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </motion.button>
                          </div>
                        </div>
                      )}

                      {agendamento.observacoes && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Observações
                          </h4>
                          <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                            {agendamento.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar com Ações */}
                  <div className="space-y-6">
                    {/* Status Actions */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Alterar Status
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(statusLabels).map(([status, label]) => (
                          <motion.button
                            key={status}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleStatusChange(status as Agendamento['status'])}
                            className={`w-full p-3 rounded-lg text-left transition-all ${
                              agendamento.status === status
                                ? statusColors[status as keyof typeof statusColors]
                                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Detalhes
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Prioridade:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${prioridadeColors[agendamento.prioridade]}`}>
                            {prioridadeLabels[agendamento.prioridade]}
                          </span>
                        </div>
                        
                        {agendamento.lembrete && agendamento.lembrete > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Lembrete:</span>
                            <span className="text-sm text-gray-900">
                              {agendamento.lembrete} min antes
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">ID:</span>
                          <span className="text-sm text-gray-900 font-mono">
                            #{agendamento.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onEdit(agendamento)}
                        className="w-full bg-[#305e73] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#3a6d84] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar Agendamento
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-6 max-w-md w-full"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Excluir Agendamento
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Tem certeza que deseja excluir "{agendamento.titulo}"? Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={handleDelete}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                      >
                        Excluir
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
