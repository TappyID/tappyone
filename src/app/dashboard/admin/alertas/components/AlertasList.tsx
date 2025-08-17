'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Shield, Cpu, MessageSquare, AlertTriangle, Clock, 
  MoreVertical, Play, Pause, Edit, Trash2, Mail, Phone, 
  Monitor, ChevronDown, ChevronUp, Calendar, TrendingUp,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import { Alerta } from '../page'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AlertasListProps {
  alertas: Alerta[]
  onUpdateAlerta: (id: string, updates: Partial<Alerta>) => void
  onDeleteAlerta: (id: string) => void
}

export default function AlertasList({ alertas, onUpdateAlerta, onDeleteAlerta }: AlertasListProps) {
  const [expandedAlerta, setExpandedAlerta] = useState<string | null>(null)
  const [showMenuId, setShowMenuId] = useState<string | null>(null)

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'sistema': return Cpu
      case 'usuario': return MessageSquare
      case 'seguranca': return Shield
      case 'performance': return AlertTriangle
      case 'integracao': return Bell
      default: return Bell
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-green-100 text-green-700 border-green-200'
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'alta': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'critica': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700 border-green-200'
      case 'pausado': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'resolvido': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return CheckCircle
      case 'pausado': return AlertCircle
      case 'resolvido': return XCircle
      default: return AlertCircle
    }
  }

  const toggleAlertaStatus = (alerta: Alerta) => {
    const newStatus = alerta.status === 'ativo' ? 'pausado' : 'ativo'
    onUpdateAlerta(alerta.id, { status: newStatus })
  }

  if (alertas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
      >
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum alerta encontrado</h3>
        <p className="text-gray-500">Crie seu primeiro alerta ou ajuste os filtros de busca.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {alertas.map((alerta, index) => {
          const IconComponent = getIconByTipo(alerta.tipo)
          const StatusIcon = getStatusIcon(alerta.status)
          const isExpanded = expandedAlerta === alerta.id

          return (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div 
                      className="p-3 rounded-xl shadow-sm"
                      style={{ backgroundColor: alerta.cor + '20', color: alerta.cor }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                          {alerta.titulo}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Status */}
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(alerta.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {alerta.status.charAt(0).toUpperCase() + alerta.status.slice(1)}
                          </span>
                          
                          {/* Prioridade */}
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPrioridadeColor(alerta.prioridade)}`}>
                            {alerta.prioridade.charAt(0).toUpperCase() + alerta.prioridade.slice(1)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {alerta.descricao}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{alerta.estatisticas.totalDisparos} disparos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Hoje: {alerta.estatisticas.disparosHoje}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{alerta.estatisticas.taxaResolucao.toFixed(1)}% resolvidos</span>
                        </div>
                        {alerta.estatisticas.ultimoDisparo && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Último: {format(alerta.estatisticas.ultimoDisparo, 'dd/MM HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAlertaStatus(alerta)}
                      className={`p-2 rounded-lg transition-colors ${
                        alerta.status === 'ativo' 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={alerta.status === 'ativo' ? 'Pausar alerta' : 'Ativar alerta'}
                    >
                      {alerta.status === 'ativo' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExpandedAlerta(isExpanded ? null : alerta.id)}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowMenuId(showMenuId === alerta.id ? null : alerta.id)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>

                      {/* Menu dropdown */}
                      <AnimatePresence>
                        {showMenuId === alerta.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
                          >
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Editar alerta
                            </button>
                            <button 
                              onClick={() => onDeleteAlerta(alerta.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir alerta
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100 bg-gray-50"
                  >
                    <div className="p-6 space-y-6">
                      {/* Configurações */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Configurações de Notificação</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Mail className={`w-4 h-4 ${alerta.configuracoes.emailNotificacao ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-sm text-gray-600">Email</span>
                            <span className={`text-xs px-2 py-1 rounded ${alerta.configuracoes.emailNotificacao ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {alerta.configuracoes.emailNotificacao ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className={`w-4 h-4 ${alerta.configuracoes.whatsappNotificacao ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-sm text-gray-600">WhatsApp</span>
                            <span className={`text-xs px-2 py-1 rounded ${alerta.configuracoes.whatsappNotificacao ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {alerta.configuracoes.whatsappNotificacao ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Monitor className={`w-4 h-4 ${alerta.configuracoes.dashboardNotificacao ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-sm text-gray-600">Dashboard</span>
                            <span className={`text-xs px-2 py-1 rounded ${alerta.configuracoes.dashboardNotificacao ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {alerta.configuracoes.dashboardNotificacao ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Frequência:</span>
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                              {alerta.configuracoes.frequencia.charAt(0).toUpperCase() + alerta.configuracoes.frequencia.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Destinatários */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Destinatários</h4>
                        <div className="flex flex-wrap gap-2">
                          {alerta.configuracoes.destinatarios.map((destinatario, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                              {destinatario}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Condições */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Condições de Disparo</h4>
                        <div className="space-y-2">
                          {alerta.configuracoes.condicoes.map((condicao, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono">
                                {condicao.metrica}
                              </span>
                              <span className="text-gray-500">{condicao.operador}</span>
                              <span className="px-2 py-1 bg-[#305e73] text-white rounded">
                                {condicao.valor}
                              </span>
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
      </AnimatePresence>
    </div>
  )
}
