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
  baixa: 'bg-gray-100 text-gray-700 border-gray-200',
  media: 'bg-blue-100 text-blue-700 border-blue-200',
  alta: 'bg-orange-100 text-orange-700 border-orange-200',
  urgente: 'bg-red-100 text-red-700 border-red-200'
}

const prioridadeIcons = {
  baixa: Circle,
  media: Clock,
  alta: AlertCircle,
  urgente: Star
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
    <div className="space-y-4">
      {filas.map((fila, index) => {
        const PrioridadeIcon = prioridadeIcons[fila.regras.prioridade]
        
        return (
          <motion.div
            key={fila.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Header da Fila */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Cor da Fila */}
                  <div 
                    className="w-4 h-16 rounded-full shadow-sm"
                    style={{ backgroundColor: fila.cor }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{fila.nome}</h3>
                      
                      {/* Status Badge */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${prioridadeCores[fila.regras.prioridade]}`}
                      >
                        <PrioridadeIcon className="w-3 h-3" />
                        {fila.regras.prioridade.charAt(0).toUpperCase() + fila.regras.prioridade.slice(1)}
                      </motion.div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{fila.descricao}</p>
                    
                    {/* Integrações */}
                    <div className="flex items-center gap-2">
                      {fila.regras.chatBot && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                          <Bot className="w-3 h-3" />
                          ChatBot
                        </div>
                      )}
                      {fila.regras.kanban && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                          <Kanban className="w-3 h-3" />
                          Kanban
                        </div>
                      )}
                      {fila.regras.whatsappChats && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </div>
                      )}
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                        <Users className="w-3 h-3" />
                        {fila.regras.atendentes.length} atendentes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats e Actions */}
                <div className="flex items-center gap-6">
                  {/* Quick Stats */}
                  <div className="hidden lg:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{fila.estatisticas.conversasAtivas}</p>
                      <p className="text-gray-600">Ativas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{fila.estatisticas.tempoMedioResposta}min</p>
                      <p className="text-gray-600">Tempo médio</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">{fila.estatisticas.satisfacao.toFixed(1)}</p>
                      <p className="text-gray-600">Satisfação</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleExpanded(fila.id)}
                      className="p-2 text-gray-600 hover:text-[#305e73] hover:bg-[#305e73]/10 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleActions(fila.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </motion.button>

                      <AnimatePresence>
                        {showActions === fila.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
                          >
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                              <Edit3 className="w-4 h-4" />
                              Editar
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                              <Copy className="w-4 h-4" />
                              Duplicar
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                              <ArrowUpDown className="w-4 h-4" />
                              Reordenar
                            </button>
                            <hr className="my-2" />
                            <button 
                              onClick={() => onDeleteFila(fila.id)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes Expandidos */}
            <AnimatePresence>
              {expandedFila === fila.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100 bg-gray-50 p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Estatísticas Detalhadas */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Estatísticas</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total de conversas:</span>
                          <span className="font-medium">{fila.estatisticas.totalConversas}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Conversas ativas:</span>
                          <span className="font-medium text-green-600">{fila.estatisticas.conversasAtivas}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tempo médio:</span>
                          <span className="font-medium">{fila.estatisticas.tempoMedioResposta}min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Satisfação:</span>
                          <span className="font-medium">{fila.estatisticas.satisfacao.toFixed(1)}/5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Configurações */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Configurações</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ordenação:</span>
                          <span className="font-medium">#{fila.ordenacao}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Criada em:</span>
                          <span className="font-medium">
                            {formatDistanceToNow(fila.criadaEm, { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Atualizada:</span>
                          <span className="font-medium">
                            {formatDistanceToNow(fila.atualizadaEm, { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Atendentes */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Atendentes</h4>
                      <div className="space-y-2">
                        {fila.regras.atendentes.map((atendente, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-gray-700">{atendente}</span>
                          </div>
                        ))}
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
