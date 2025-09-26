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
import { useTheme } from '@/contexts/ThemeContext'

interface FilasListProps {
  filas: Fila[]
  onUpdateFila: (id: string, updates: Partial<Fila>) => void
  onDeleteFila: (id: string) => void
  onEditFila: (fila: Fila) => void
}

const getPrioridadeCores = (prioridade: string, isDark: boolean) => {
  const cores = {
    BAIXA: isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200',
    MEDIA: isDark ? 'bg-blue-800 text-blue-300 border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-200',
    ALTA: isDark ? 'bg-orange-800 text-orange-300 border-orange-600' : 'bg-orange-100 text-orange-700 border-orange-200',
    URGENTE: isDark ? 'bg-red-800 text-red-300 border-red-600' : 'bg-red-100 text-red-700 border-red-200'
  }
  return cores[prioridade as keyof typeof cores] || cores.MEDIA
}

const prioridadeIcons = {
  BAIXA: Circle,
  MEDIA: Clock,
  ALTA: AlertCircle,
  URGENTE: Star
}

export default function FilasList({ filas, onUpdateFila, onDeleteFila, onEditFila }: FilasListProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
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
        className={`rounded-2xl p-12 shadow-lg text-center ${
          isDark 
            ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border border-slate-600/50' 
            : 'bg-white border border-gray-100'
        }`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDark ? 'bg-slate-700' : 'bg-gray-100'
        }`}>
          <Kanban className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Nenhuma fila encontrada</h3>
        <p className={`max-w-md mx-auto ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
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
            className={`rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 relative ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-slate-600/50 hover:shadow-2xl hover:shadow-slate-900/20 hover:border-slate-500/50' 
                : 'bg-white border-gray-200 hover:shadow-lg hover:border-gray-300'
            }`}
            style={{ zIndex: showActions === fila.id ? 50 : 1 }}
          >
            {/* Header da Fila - Layout Melhorado */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Informações principais */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Cor da Fila - Estendida */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl shadow-sm"
                    style={{ backgroundColor: fila.cor }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    {/* Título e badges */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{fila.nome}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Badge */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                              fila.ativa 
                                ? (isDark ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200')
                                : (isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200')
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${fila.ativa ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {fila.ativa ? 'Ativa' : 'Inativa'}
                          </motion.div>

                          {/* Prioridade Badge */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getPrioridadeCores(fila.prioridade || 'MEDIA', isDark)}`}
                          >
                            <PrioridadeIcon className="w-3 h-3" />
                            {(fila.prioridade || 'MEDIA').charAt(0).toUpperCase() + (fila.prioridade || 'MEDIA').slice(1).toLowerCase()}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    <p className={`mb-3 line-clamp-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>{fila.descricao}</p>
                    
                    {/* Integrações e Estatísticas */}
                    <div className="flex flex-wrap items-center gap-2">
                      {fila.chatBot && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                          isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          <Bot className="w-3 h-3" />
                          ChatBot
                        </div>
                      )}
                      {fila.kanban && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                          isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          <Kanban className="w-3 h-3" />
                          Kanban
                        </div>
                      )}
                      {fila.whatsappChats && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                          isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                        }`}>
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </div>
                      )}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Users className="w-3 h-3" />
                        {fila.atendentes?.length || 0} atendentes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats e Actions - Layout Reorganizado */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  {/* Quick Stats */}
                  <div className={`hidden lg:flex items-center gap-4 text-sm rounded-xl p-4 ${
                    isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="text-center px-3">
                      <p className={`font-bold text-lg ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{fila.estatisticas?.conversasAtivas || 0}</p>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Ativas</p>
                    </div>
                    <div className={`w-px h-8 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}></div>
                    <div className="text-center px-3">
                      <p className={`font-bold text-lg ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{fila.estatisticas?.tempoMedioResposta || 0}<span className="text-sm">min</span></p>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Tempo médio</p>
                    </div>
                    <div className={`w-px h-8 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}></div>
                    <div className="text-center px-3">
                      <p className={`font-bold text-lg ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{fila.estatisticas?.satisfacao?.toFixed(1) || '0.0'}</p>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Satisfação</p>
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
                      onClick={() => onEditFila(fila)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
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
                          ? (isDark ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#305e73] text-white shadow-md')
                          : (isDark ? 'bg-slate-600 text-gray-200 hover:bg-slate-500 hover:shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md')
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
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 border-red-800/30' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200'
                      }`}
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
                >
                  <div className={`border-t ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                    {/* Header da seção expandida */}
                    <div className={`px-6 py-4 ${
                      isDark ? 'bg-gradient-to-r from-slate-700 to-slate-600' : 'bg-gradient-to-r from-gray-50 to-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className={`text-lg font-semibold flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          <TrendingUp className={`w-5 h-5 ${
                            isDark ? 'text-emerald-400' : 'text-[#305e73]'
                          }`} />
                          Detalhes da Fila
                        </h4>
                        <div className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          ID: {fila.id}
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 ${
                      isDark ? 'bg-slate-800' : 'bg-white'
                    }`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Estatísticas Detalhadas - Card estilizado */}
                      <div className={`rounded-xl p-6 border ${
                        isDark 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500/50' 
                          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${
                            isDark ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}>
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <h5 className={`font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>Estatísticas</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`rounded-lg p-3 text-center border ${
                            isDark 
                              ? 'bg-slate-800 border-emerald-500/30' 
                              : 'bg-white border-blue-200'
                          }`}>
                            <p className={`text-2xl font-bold ${
                              isDark ? 'text-emerald-400' : 'text-blue-600'
                            }`}>{fila.estatisticas?.totalConversas || 0}</p>
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>Total de conversas</p>
                          </div>
                          <div className={`rounded-lg p-3 text-center border ${
                            isDark 
                              ? 'bg-slate-800 border-green-500/30' 
                              : 'bg-white border-green-200'
                          }`}>
                            <p className={`text-2xl font-bold ${
                              isDark ? 'text-green-400' : 'text-green-600'
                            }`}>{fila.estatisticas?.conversasAtivas || 0}</p>
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>Conversas ativas</p>
                          </div>
                          <div className={`rounded-lg p-3 text-center border ${
                            isDark 
                              ? 'bg-slate-800 border-orange-500/30' 
                              : 'bg-white border-orange-200'
                          }`}>
                            <p className={`text-2xl font-bold ${
                              isDark ? 'text-orange-400' : 'text-orange-600'
                            }`}>{fila.estatisticas?.tempoMedioResposta || 0}<span className="text-sm">min</span></p>
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>Tempo médio</p>
                          </div>
                          <div className={`rounded-lg p-3 text-center border ${
                            isDark 
                              ? 'bg-slate-800 border-purple-500/30' 
                              : 'bg-white border-purple-200'
                          }`}>
                            <p className={`text-2xl font-bold ${
                              isDark ? 'text-purple-400' : 'text-purple-600'
                            }`}>{fila.estatisticas?.satisfacao?.toFixed(1) || '0.0'}<span className="text-sm">/5</span></p>
                            <p className={`text-xs mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>Satisfação</p>
                          </div>
                        </div>
                      </div>

                      {/* Configurações - Card estilizado */}
                      <div className={`rounded-xl p-6 border ${
                        isDark 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500/50' 
                          : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${
                            isDark ? 'bg-slate-500' : 'bg-gray-500'
                          }`}>
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <h5 className={`font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>Configurações</h5>
                        </div>
                        <div className="space-y-4">
                          <div className={`flex items-center justify-between p-3 rounded-lg border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <span className={`font-medium ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>Posição na fila</span>
                            <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                              isDark 
                                ? 'text-emerald-400 bg-slate-600' 
                                : 'text-gray-900 bg-gray-100'
                            }`}>#{fila.ordenacao}</span>
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}>Criada</span>
                              <span className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {formatDistanceToNow(new Date(fila.criadoEm), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className={`font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}>Atualizada</span>
                              <span className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {formatDistanceToNow(new Date(fila.atualizadoEm), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Atendentes - Card estilizado */}
                      <div className={`rounded-xl p-6 border ${
                        isDark 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500/50' 
                          : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${
                            isDark ? 'bg-emerald-500' : 'bg-green-500'
                          }`}>
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <h5 className={`font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>Atendentes</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isDark 
                              ? 'bg-emerald-900/30 text-emerald-300' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {fila.atendentes?.length || 0}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {(fila.atendentes && fila.atendentes.length > 0) ? (
                            fila.atendentes.map((atendente, idx) => (
                              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${
                                isDark 
                                  ? 'bg-slate-700 border-emerald-500/30' 
                                  : 'bg-white border-green-200'
                              }`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isDark ? 'bg-emerald-500' : 'bg-green-500'
                                }`}>
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                  }`}>{atendente.nome || `Atendente ${idx + 1}`}</p>
                                  <p className={`text-xs ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                  }`}>{atendente.email || 'Email não informado'}</p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="Ativo" />
                              </div>
                            ))
                          ) : (
                            <div className={`p-4 rounded-lg border text-center ${
                              isDark 
                                ? 'bg-slate-700 border-slate-600' 
                                : 'bg-white border-gray-200'
                            }`}>
                              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className={`text-sm ${
                                isDark ? 'text-gray-300' : 'text-gray-500'
                              }`}>Nenhum atendente associado</p>
                              <p className={`text-xs mt-1 ${
                                isDark ? 'text-gray-400' : 'text-gray-400'
                              }`}>Configure atendentes para esta fila</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Integrações em destaque */}
                    <div className={`mt-8 pt-6 border-t ${
                      isDark ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <h5 className={`font-semibold mb-4 flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Bot className={`w-5 h-5 ${
                          isDark ? 'text-emerald-400' : 'text-[#305e73]'
                        }`} />
                        Integrações Ativas
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {fila.chatBot && (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' 
                              : 'bg-purple-100 text-purple-700 border-purple-200'
                          }`}>
                            <Bot className="w-4 h-4" />
                            <span className="font-medium">ChatBot Ativo</span>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {fila.kanban && (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30' 
                              : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                          }`}>
                            <Kanban className="w-4 h-4" />
                            <span className="font-medium">Kanban Integrado</span>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {fila.whatsappChats && (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-green-900/30 text-green-300 border-green-500/30' 
                              : 'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">WhatsApp Conectado</span>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {!fila.chatBot && !fila.kanban && !fila.whatsappChats && (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 border-gray-600' 
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Nenhuma integração ativa</span>
                          </div>
                        )}
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
    </div>
  )
}
