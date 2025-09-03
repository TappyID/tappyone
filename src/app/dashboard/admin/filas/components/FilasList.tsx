'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  Copy, 
  Star,
  Users, 
  MessageSquare, 
  Bot, 
  Kanban,
  ArrowUpDown,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Circle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Fila } from '../page'

interface FilasListProps {
  filas: Fila[]
  onUpdateFila: (id: string, updates: Partial<Fila>) => void
  onDeleteFila: (id: string) => void
}

const prioridadeCores = {
  BAIXA: 'bg-gray-100 text-gray-700 border-gray-200',
  MEDIA: 'bg-blue-100 text-blue-700 border-blue-200',
  ALTA: 'bg-orange-100 text-orange-700 border-orange-200',
  URGENTE: 'bg-red-100 text-red-700 border-red-200'
}

const prioridadeIcons = {
  BAIXA: Circle,
  MEDIA: Clock,
  ALTA: AlertCircle,
  URGENTE: Star
}

export default function FilasList({ filas, onUpdateFila, onDeleteFila }: FilasListProps) {
  const [expandedFila, setExpandedFila] = useState<string | null>(null)
  const [showActions, setShowActions] = useState<string | null>(null)

  const toggleExpanded = (filaId: string) => {
    setExpandedFila(expandedFila === filaId ? null : filaId)
  }

  const toggleActions = (filaId: string) => {
    setShowActions(showActions === filaId ? null : filaId)
  }

  if (filas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Kanban className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma fila encontrada</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Não há filas que correspondam aos filtros aplicados. Tente ajustar os critérios de busca ou criar uma nova fila.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {filas.map((fila, index) => {
        const PrioridadeIcon = prioridadeIcons[fila.prioridade || 'MEDIA'] || Clock
        
        return (
          <motion.div
            key={fila.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 relative"
            style={{ zIndex: showActions === fila.id ? 50 : 1 }}
          >
            {/* Header da Fila - Layout Melhorado */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Informações principais */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Cor da Fila */}
                  <div 
                    className="w-1 h-20 rounded-full shadow-sm flex-shrink-0 mt-1"
                    style={{ backgroundColor: fila.cor }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    {/* Título e badges */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{fila.nome}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Badge */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                              fila.ativa 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${fila.ativa ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {fila.ativa ? 'Ativa' : 'Inativa'}
                          </motion.div>

                          {/* Prioridade Badge */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${prioridadeCores[fila.prioridade || 'MEDIA']}`}
                          >
                            <PrioridadeIcon className="w-3 h-3" />
                            {(fila.prioridade || 'MEDIA').charAt(0).toUpperCase() + (fila.prioridade || 'MEDIA').slice(1).toLowerCase()}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{fila.descricao}</p>
                    
                    {/* Integrações e Estatísticas */}
                    <div className="flex flex-wrap items-center gap-2">
                      {fila.chatBot && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                          <Bot className="w-3 h-3" />
                          ChatBot
                        </div>
                      )}
                      {fila.kanban && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          <Kanban className="w-3 h-3" />
                          Kanban
                        </div>
                      )}
                      {fila.whatsappChats && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        <Users className="w-3 h-3" />
                        {fila.atendentes?.length || 0} atendentes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats e Actions - Layout Reorganizado */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  {/* Quick Stats */}
                  <div className="hidden lg:flex items-center gap-4 text-sm bg-gray-50 rounded-xl p-4">
                    <div className="text-center px-3">
                      <p className="font-bold text-gray-900 text-lg">{fila.estatisticas?.conversasAtivas || 0}</p>
                      <p className="text-gray-600 text-xs">Ativas</p>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center px-3">
                      <p className="font-bold text-gray-900 text-lg">{fila.estatisticas?.tempoMedioResposta || 0}<span className="text-sm">min</span></p>
                      <p className="text-gray-600 text-xs">Tempo médio</p>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center px-3">
                      <p className="font-bold text-gray-900 text-lg">{fila.estatisticas?.satisfacao?.toFixed(1) || '0.0'}</p>
                      <p className="text-gray-600 text-xs">Satisfação</p>
                    </div>
                  </div>

                  {/* Action Buttons - Melhorados */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Toggle Status Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onUpdateFila(fila.id, { ativa: !fila.ativa })}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                        fila.ativa 
                          ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md' 
                          : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md'
                      }`}
                      title={fila.ativa ? 'Desativar fila' : 'Ativar fila'}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {fila.ativa ? 'Desativar' : 'Ativar'}
                    </motion.button>

                    {/* Edit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Editar fila"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar</span>
                    </motion.button>

                    {/* View Details Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleExpanded(fila.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                        expandedFila === fila.id 
                          ? 'bg-[#305e73] text-white shadow-md' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                      }`}
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                      <span>
                        {expandedFila === fila.id ? 'Ocultar' : 'Detalhes'}
                      </span>
                    </motion.button>

                    {/* Delete Button - Mais Visível */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta fila? Esta ação não pode ser desfeita.')) {
                          onDeleteFila(fila.id)
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Excluir fila"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes Expandidos - Visual Melhorado */}
            <AnimatePresence>
              {expandedFila === fila.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100"
                >
                  {/* Header da seção expandida */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#305e73]" />
                        Detalhes da Fila
                      </h4>
                      <div className="text-sm text-gray-600">
                        ID: {fila.id}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Estatísticas Detalhadas - Card estilizado */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <h5 className="font-semibold text-gray-900">Estatísticas</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                            <p className="text-2xl font-bold text-blue-600">{fila.estatisticas?.totalConversas || 0}</p>
                            <p className="text-xs text-gray-600 mt-1">Total de conversas</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                            <p className="text-2xl font-bold text-green-600">{fila.estatisticas?.conversasAtivas || 0}</p>
                            <p className="text-xs text-gray-600 mt-1">Conversas ativas</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border border-orange-200">
                            <p className="text-2xl font-bold text-orange-600">{fila.estatisticas?.tempoMedioResposta || 0}<span className="text-sm">min</span></p>
                            <p className="text-xs text-gray-600 mt-1">Tempo médio</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                            <p className="text-2xl font-bold text-purple-600">{fila.estatisticas?.satisfacao?.toFixed(1) || '0.0'}<span className="text-sm">/5</span></p>
                            <p className="text-xs text-gray-600 mt-1">Satisfação</p>
                          </div>
                        </div>
                      </div>

                      {/* Configurações - Card estilizado */}
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gray-500 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <h5 className="font-semibold text-gray-900">Configurações</h5>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <span className="text-gray-600 font-medium">Posição na fila</span>
                            <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">#{fila.ordenacao}</span>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-gray-600 font-medium">Criada</span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(fila.criadoEm), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600 font-medium">Atualizada</span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(fila.atualizadoEm), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Atendentes - Card estilizado */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <h5 className="font-semibold text-gray-900">Atendentes</h5>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {fila.atendentes?.length || 0}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {(fila.atendentes && fila.atendentes.length > 0) ? (
                            fila.atendentes.map((atendente, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {atendente.usuario.nome.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{atendente.usuario.nome}</p>
                                  <p className="text-xs text-gray-500">{atendente.usuario.email}</p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Ativo" />
                              </div>
                            ))
                          ) : (
                            <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Nenhum atendente associado</p>
                              <p className="text-xs text-gray-400 mt-1">Configure atendentes para esta fila</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Integrações em destaque */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-[#305e73]" />
                        Integrações Ativas
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {fila.chatBot && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-200">
                            <Bot className="w-4 h-4" />
                            <span className="font-medium">ChatBot Ativo</span>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {fila.kanban && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                            <Kanban className="w-4 h-4" />
                            <span className="font-medium">Kanban Integrado</span>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {fila.whatsappChats && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">WhatsApp Conectado</span>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {!fila.chatBot && !fila.kanban && !fila.whatsappChats && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Nenhuma integração ativa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
