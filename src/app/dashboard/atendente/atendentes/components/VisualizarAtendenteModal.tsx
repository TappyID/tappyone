'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Calendar, Activity, Star, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { AtendenteComStats } from '@/hooks/useAtendentes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTheme } from '@/contexts/ThemeContext'

interface VisualizarAtendenteModalProps {
  atendente: AtendenteComStats
  onClose: () => void
  onEdit: () => void
}

export default function VisualizarAtendenteModal({ 
  atendente, 
  onClose,
  onEdit
}: VisualizarAtendenteModalProps) {
  const { actualTheme } = useTheme()
  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'ATENDENTE_COMERCIAL': 'Comercial',
      'ATENDENTE_FINANCEIRO': 'Financeiro',
      'ATENDENTE_JURIDICO': 'Jurídico',
      'ATENDENTE_SUPORTE': 'Suporte',
      'ATENDENTE_VENDAS': 'Vendas',
      'ASSINANTE': 'Assinante',
      'AFILIADO': 'Afiliado'
    }
    return labels[tipo] || tipo
  }

  const getTipoColor = (tipo: string) => {
    const lightColors: Record<string, string> = {
      'ADMIN': 'text-purple-600 bg-purple-100',
      'ATENDENTE_COMERCIAL': 'text-blue-600 bg-blue-100',
      'ATENDENTE_FINANCEIRO': 'text-green-600 bg-green-100',
      'ATENDENTE_JURIDICO': 'text-indigo-600 bg-indigo-100',
      'ATENDENTE_SUPORTE': 'text-orange-600 bg-orange-100',
      'ATENDENTE_VENDAS': 'text-pink-600 bg-pink-100',
      'ASSINANTE': 'text-cyan-600 bg-cyan-100',
      'AFILIADO': 'text-yellow-600 bg-yellow-100'
    }
    
    const darkColors: Record<string, string> = {
      'ADMIN': 'text-purple-300 bg-purple-900/50',
      'ATENDENTE_COMERCIAL': 'text-blue-300 bg-blue-900/50',
      'ATENDENTE_FINANCEIRO': 'text-green-300 bg-green-900/50',
      'ATENDENTE_JURIDICO': 'text-indigo-300 bg-indigo-900/50',
      'ATENDENTE_SUPORTE': 'text-orange-300 bg-orange-900/50',
      'ATENDENTE_VENDAS': 'text-pink-300 bg-pink-900/50',
      'ASSINANTE': 'text-cyan-300 bg-cyan-900/50',
      'AFILIADO': 'text-yellow-300 bg-yellow-900/50'
    }
    
    const colors = actualTheme === 'dark' ? darkColors : lightColors
    return colors[tipo] || (actualTheme === 'dark' ? 'text-gray-300 bg-gray-700/50' : 'text-gray-600 bg-gray-100')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden backdrop-blur-sm ${
            actualTheme === 'dark'
              ? 'bg-slate-800/90 border border-slate-700/50'
              : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#305e73] to-[#273155] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Detalhes do Atendente</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Profile Section */}
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                  actualTheme === 'dark'
                    ? 'bg-slate-700/50 text-white border border-slate-600/50'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {getInitials(atendente.nome)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
                  atendente.ativo ? 'bg-green-400' : 'bg-red-400'
                }`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-2xl font-bold ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{atendente.nome}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(atendente.tipo)}`}>
                    {getTipoLabel(atendente.tipo)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    atendente.ativo 
                      ? actualTheme === 'dark'
                        ? 'text-green-300 bg-green-900/50'
                        : 'text-green-700 bg-green-100'
                      : actualTheme === 'dark'
                        ? 'text-red-300 bg-red-900/50'
                        : 'text-red-700 bg-red-100'
                  }`}>
                    {atendente.ativo ? (
                      <><CheckCircle className="w-4 h-4" />Ativo</>
                    ) : (
                      <></>
                    )}
                  </span>
                </div>
                
                <div className={`space-y-2 ${
                  actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{atendente.email}</span>
                  </div>
                  
                  {atendente.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{atendente.telefone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl p-4 ${
                actualTheme === 'dark'
                  ? 'bg-slate-700/50 border border-slate-600/50'
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#305e73]" />
                  <h4 className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Data de Criação</h4>
                </div>
                <p className={`${
                  actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {format(new Date(atendente.criadoEm), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                </p>
              </div>

              <div className={`rounded-xl p-4 ${
                actualTheme === 'dark'
                  ? 'bg-slate-700/50 border border-slate-600/50'
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-[#305e73]" />
                  <h4 className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Última Atualização</h4>
                </div>
                <p className={`${
                  actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {format(new Date(atendente.atualizadoEm), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Statistics */}
            {atendente.estatisticas && (
              <div className="bg-gradient-to-br from-[#305e73] to-[#273155] rounded-xl p-6 text-white mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-6 h-6" />
                  <h4 className="text-lg font-semibold">Estatísticas de Performance</h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {atendente.estatisticas.conversasAtivas}
                    </div>
                    <div className="text-white/80 text-sm">Conversas Ativas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {atendente.estatisticas.totalConversas}
                    </div>
                    <div className="text-white/80 text-sm">Total de Conversas</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold mb-1 flex items-center justify-center gap-1">
                      <Clock className="w-5 h-5" />
                      {atendente.estatisticas.emAndamento}
                    </div>
                    <div className="text-white/80 text-sm">Em Andamento</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold mb-1 flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 fill-current" />
                      {atendente.estatisticas.concluidas}
                    </div>
                    <div className="text-white/80 text-sm">Concluídas</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="text-xl font-bold mb-1 text-green-300">
                      {atendente.estatisticas.ticketsResolvidos}
                    </div>
                    <div className="text-white/80 text-sm">Tickets Resolvidos</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/10 rounded-lg">
                    <div className="text-xl font-bold mb-1 text-yellow-300">
                      {atendente.estatisticas.ticketsPendentes}
                    </div>
                    <div className="text-white/80 text-sm">Tickets Pendentes</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  actualTheme === 'dark'
                    ? 'text-white/80 border-slate-600/50 hover:bg-slate-700/50'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  onEdit()
                  onClose()
                }}
                className="flex-1 px-4 py-2 bg-[#305e73] text-white rounded-lg hover:bg-[#273155] transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Editar Atendente
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
