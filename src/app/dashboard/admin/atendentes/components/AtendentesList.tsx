'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  MessageCircle, 
  Clock, 
  Star, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Activity,
  Pause,
  Play,
  UserX,
  Settings,
  Eye,
  Users
} from 'lucide-react'
import { useState } from 'react'
import { AtendenteComStats } from '@/hooks/useAtendentes'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AtendentesListProps {
  atendentes: AtendenteComStats[]
  onUpdateAtendente: (id: string, updates: Partial<AtendenteComStats>) => void
}

export default function AtendentesList({ atendentes, onUpdateAtendente }: AtendentesListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedAtendente, setSelectedAtendente] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'ocupado': return 'bg-yellow-400'
      case 'ausente': return 'bg-orange-400'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusAtendimentoColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'text-green-600 bg-green-50 border-green-200'
      case 'em_atendimento': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'em_pausa': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'finalizando': return 'text-purple-600 bg-purple-50 border-purple-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusAtendimentoLabel = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível'
      case 'em_atendimento': return 'Em Atendimento'
      case 'em_pausa': return 'Em Pausa'
      case 'finalizando': return 'Finalizando'
      default: return status
    }
  }

  const getCargoIcon = (cargo: string) => {
    switch (cargo) {
      case 'gerente': return '👑'
      case 'supervisor': return '⭐'
      case 'atendente': return '👤'
      default: return '👤'
    }
  }

  if (atendentes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum atendente encontrado</h3>
        <p className="text-gray-600">Ajuste os filtros ou adicione novos atendentes à equipe.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {atendentes.map((atendente, index) => {
        const isExpanded = expandedItems.has(atendente.id)
        const tempoAtendimentoAtual = atendente.atendimentoAtual 
          ? formatDistanceToNow(atendente.atendimentoAtual.iniciadoEm, { locale: ptBR })
          : null

        return (
          <motion.div
            key={atendente.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Header do card */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar com status */}
                  <div className="relative">
                    <img
                      src={atendente.avatar}
                      alt={atendente.nome}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <motion.div
                      animate={{ 
                        scale: atendente.status === 'online' ? [1, 1.2, 1] : 1,
                        opacity: atendente.status === 'online' ? [0.7, 1, 0.7] : 1
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(atendente.status)} rounded-full border-2 border-white shadow-lg`}
                    />
                  </div>

                  {/* Info básica */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{atendente.nome}</h3>
                      <span className="text-lg">{getCargoIcon(atendente.cargo)}</span>
                      <span className="text-sm text-gray-500 capitalize">
                        {atendente.cargo}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <div className="flex flex-wrap gap-1">
                          {atendente.filas && atendente.filas.length > 0 ? (
                            atendente.filas.map((fila, index) => (
                              <span
                                key={fila.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {fila.nome}
                              </span>
                            ))
                          ) : atendente.fila?.nome ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {atendente.fila.nome} (legado)
                            </span>
                          ) : (
                            <span className="text-gray-400">Sem filas</span>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Último login: {formatDistanceToNow(atendente.ultimoLogin, { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status e ações */}
                <div className="flex items-center gap-3">
                  {/* Status de atendimento */}
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusAtendimentoColor(atendente.statusAtendimento)}`}>
                    {getStatusAtendimentoLabel(atendente.statusAtendimento)}
                  </div>

                  {/* Estatísticas rápidas */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{atendente.estatisticas.atendimentosHoje}</div>
                      <div className="text-gray-500">Hoje</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        {atendente.estatisticas.avaliacaoMedia.toFixed(1)}
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="text-gray-500">Avaliação</div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleExpanded(atendente.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </motion.button>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAtendente(
                          selectedAtendente === atendente.id ? null : atendente.id
                        )}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </motion.button>

                      {/* Menu de ações */}
                      <AnimatePresence>
                        {selectedAtendente === atendente.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
                          >
                            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                              <Eye className="w-4 h-4" />
                              Ver Detalhes
                            </button>
                            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                              <MessageCircle className="w-4 h-4" />
                              Enviar Mensagem
                            </button>
                            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                              <Settings className="w-4 h-4" />
                              Configurações
                            </button>
                            <hr className="my-2" />
                            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600">
                              <UserX className="w-4 h-4" />
                              Desativar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atendimento atual (se houver) */}
              {atendente.atendimentoAtual && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-900">
                          Atendendo: {atendente.atendimentoAtual.cliente}
                        </div>
                        <div className="text-sm text-blue-700">
                          {atendente.atendimentoAtual.assunto} • {tempoAtendimentoAtual}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        atendente.atendimentoAtual.prioridade === 'urgente' ? 'bg-red-100 text-red-700' :
                        atendente.atendimentoAtual.prioridade === 'alta' ? 'bg-orange-100 text-orange-700' :
                        atendente.atendimentoAtual.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {atendente.atendimentoAtual.prioridade}
                      </span>
                      <span className="text-xs text-blue-600 uppercase font-medium">
                        {atendente.atendimentoAtual.canal}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Detalhes expandidos */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 space-y-6">
                    {/* Informações de contato */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Informações de Contato</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{atendente.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{atendente.telefone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas detalhadas */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {atendente.estatisticas.atendimentosTotal}
                          </div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {atendente.estatisticas.tempoMedioAtendimento.toFixed(1)}min
                          </div>
                          <div className="text-sm text-gray-600">Tempo Médio</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {atendente.estatisticas.ticketsResolvidos}
                          </div>
                          <div className="text-sm text-gray-600">Resolvidos</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {atendente.estatisticas.ticketsPendentes}
                          </div>
                          <div className="text-sm text-gray-600">Pendentes</div>
                        </div>
                      </div>
                    </div>

                    {/* Configurações */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Configurações</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Horário de Trabalho:</span>
                          <div className="font-medium">
                            {atendente.configuracoes.horarioTrabalho.inicio} - {atendente.configuracoes.horarioTrabalho.fim}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Max. Atendimentos:</span>
                          <div className="font-medium">
                            {atendente.configuracoes.maxAtendimentosSimultaneos}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Auto-assign:</span>
                          <div className="font-medium">
                            {atendente.configuracoes.autoAssign ? 'Ativo' : 'Inativo'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Notificações:</span>
                          <div className="font-medium">
                            {atendente.configuracoes.notificacoes ? 'Ativas' : 'Inativas'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metas */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Metas</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Atendimentos Diários</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#305e73] h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min((atendente.estatisticas.atendimentosHoje / atendente.meta.atendimentosDiarios) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {atendente.estatisticas.atendimentosHoje}/{atendente.meta.atendimentosDiarios}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avaliação Mínima</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min((atendente.estatisticas.avaliacaoMedia / 5) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {atendente.estatisticas.avaliacaoMedia.toFixed(1)}/5.0
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
