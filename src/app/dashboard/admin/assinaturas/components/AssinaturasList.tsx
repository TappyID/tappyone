'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, Star, Crown, Building, Calendar, DollarSign, 
  MoreVertical, Play, Pause, Edit, Trash2, Mail, MessageSquare, 
  ChevronDown, ChevronUp, User, Phone, CheckCircle, XCircle, 
  AlertCircle, Clock, TrendingUp, BarChart3, Settings, Zap
} from 'lucide-react'
import { useState } from 'react'
import { Assinatura } from '../page'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AssinaturasListProps {
  assinaturas: Assinatura[]
  onUpdateAssinatura: (id: string, updates: Partial<Assinatura>) => void
  onDeleteAssinatura: (id: string) => void
}

export default function AssinaturasList({ assinaturas, onUpdateAssinatura, onDeleteAssinatura }: AssinaturasListProps) {
  const [expandedAssinatura, setExpandedAssinatura] = useState<string | null>(null)
  const [showMenuId, setShowMenuId] = useState<string | null>(null)

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'basico': return Star
      case 'premium': return Crown
      case 'enterprise': return Building
      case 'custom': return CreditCard
      default: return CreditCard
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-700 border-green-200'
      case 'expirada': return 'bg-red-100 text-red-700 border-red-200'
      case 'cancelada': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pendente': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'suspensa': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return CheckCircle
      case 'expirada': return XCircle
      case 'cancelada': return XCircle
      case 'pendente': return Clock
      case 'suspensa': return AlertCircle
      default: return AlertCircle
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'basico': return 'bg-blue-100 text-blue-700'
      case 'premium': return 'bg-purple-100 text-purple-700'
      case 'enterprise': return 'bg-indigo-100 text-indigo-700'
      case 'custom': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPeriodoLabel = (periodo: string) => {
    switch (periodo) {
      case 'mensal': return 'Mensal'
      case 'trimestral': return 'Trimestral'
      case 'semestral': return 'Semestral'
      case 'anual': return 'Anual'
      default: return periodo
    }
  }

  const getFormaPagamentoLabel = (forma: string) => {
    switch (forma) {
      case 'pix': return 'PIX'
      case 'cartao': return 'Cartão'
      case 'boleto': return 'Boleto'
      case 'transferencia': return 'Transferência'
      default: return forma
    }
  }

  const getDiasParaVencer = (dataVencimento: Date) => {
    const hoje = new Date()
    const diffTime = dataVencimento.getTime() - hoje.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const toggleAssinaturaStatus = (assinatura: Assinatura) => {
    const newStatus = assinatura.status === 'ativa' ? 'suspensa' : 'ativa'
    onUpdateAssinatura(assinatura.id, { status: newStatus })
  }

  if (assinaturas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
      >
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma assinatura encontrada</h3>
        <p className="text-gray-500">Crie a primeira assinatura ou ajuste os filtros de busca.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {assinaturas.map((assinatura, index) => {
          const IconComponent = getIconByTipo(assinatura.plano.tipo)
          const StatusIcon = getStatusIcon(assinatura.status)
          const isExpanded = expandedAssinatura === assinatura.id
          const diasParaVencer = getDiasParaVencer(assinatura.dataVencimento)

          return (
            <motion.div
              key={assinatura.id}
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
                    {/* Avatar/Icon */}
                    <div className="relative">
                      {assinatura.contato.avatar ? (
                        <img
                          src={assinatura.contato.avatar}
                          alt={assinatura.contato.nome}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#305e73] to-[#3a6d84] flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg ${getTipoColor(assinatura.plano.tipo)}`}>
                        <IconComponent className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {assinatura.contato.nome}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{assinatura.contato.telefone}</span>
                            {assinatura.contato.email && (
                              <>
                                <span>•</span>
                                <Mail className="w-4 h-4" />
                                <span>{assinatura.contato.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Status */}
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(assinatura.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {assinatura.status.charAt(0).toUpperCase() + assinatura.status.slice(1)}
                          </span>
                          
                          {/* Tipo */}
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTipoColor(assinatura.plano.tipo)}`}>
                            {assinatura.plano.tipo.charAt(0).toUpperCase() + assinatura.plano.tipo.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Plano Info */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{assinatura.plano.nome}</h4>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#305e73]">
                              R$ {assinatura.plano.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-600">{getPeriodoLabel(assinatura.plano.periodo)}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{assinatura.plano.descricao}</p>
                        <div className="flex flex-wrap gap-1">
                          {assinatura.plano.recursos.slice(0, 3).map((recurso, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {recurso}
                            </span>
                          ))}
                          {assinatura.plano.recursos.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              +{assinatura.plano.recursos.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-gray-600">Vencimento</div>
                            <div className={`font-medium ${diasParaVencer <= 7 && diasParaVencer > 0 ? 'text-orange-600' : diasParaVencer <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {format(assinatura.dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
                              {diasParaVencer > 0 && diasParaVencer <= 7 && (
                                <span className="text-xs text-orange-600 ml-1">({diasParaVencer}d)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-gray-600">Total Pago</div>
                            <div className="font-medium text-gray-900">
                              R$ {assinatura.estatisticas.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-gray-600">Dias Ativo</div>
                            <div className="font-medium text-gray-900">{assinatura.estatisticas.diasAtivos}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-gray-600">Último Acesso</div>
                            <div className="font-medium text-gray-900">
                              {format(assinatura.estatisticas.ultimoAcesso, 'dd/MM HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAssinaturaStatus(assinatura)}
                      className={`p-2 rounded-lg transition-colors ${
                        assinatura.status === 'ativa' 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={assinatura.status === 'ativa' ? 'Suspender assinatura' : 'Ativar assinatura'}
                    >
                      {assinatura.status === 'ativa' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExpandedAssinatura(isExpanded ? null : assinatura.id)}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowMenuId(showMenuId === assinatura.id ? null : assinatura.id)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>

                      {/* Menu dropdown */}
                      <AnimatePresence>
                        {showMenuId === assinatura.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
                          >
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Editar assinatura
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Configurar mensagens
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              Ver relatórios
                            </button>
                            <button 
                              onClick={() => onDeleteAssinatura(assinatura.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Cancelar assinatura
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
                      {/* Configurações de Notificação */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Configurações de Mensagens
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div>
                                <p className="font-medium text-gray-900">Lembrete de Vencimento</p>
                                <p className="text-sm text-gray-600">
                                  {assinatura.configuracoes.notificacoes.lembreteVencimento.diasAntes.join(', ')} dias antes
                                </p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${assinatura.configuracoes.notificacoes.lembreteVencimento.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div>
                                <p className="font-medium text-gray-900">Confirmação de Pagamento</p>
                                <p className="text-sm text-gray-600">Mensagem automática</p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${assinatura.configuracoes.notificacoes.confirmacaoPagamento.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div>
                                <p className="font-medium text-gray-900">Expiração de Assinatura</p>
                                <p className="text-sm text-gray-600">Quando assinatura expira</p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${assinatura.configuracoes.notificacoes.expiracaoAssinatura.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div>
                                <p className="font-medium text-gray-900">Suspensão de Serviço</p>
                                <p className="text-sm text-gray-600">
                                  {assinatura.configuracoes.notificacoes.suspensaoServico.diasAposSuspensao} dias após suspensão
                                </p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${assinatura.configuracoes.notificacoes.suspensaoServico.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Limites de Uso */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Limites de Uso
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="text-sm text-gray-600">Mensagens WhatsApp</div>
                            <div className="text-lg font-bold text-gray-900">
                              {assinatura.estatisticas.usageStats.mensagensEnviadas.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              de {assinatura.configuracoes.limitesUso.mensagensWhatsapp.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="text-sm text-gray-600">Atendimentos</div>
                            <div className="text-lg font-bold text-gray-900">
                              {assinatura.estatisticas.usageStats.atendimentosRealizados}
                            </div>
                            <div className="text-xs text-gray-500">
                              de {assinatura.configuracoes.limitesUso.atendimentosSimultaneos}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="text-sm text-gray-600">Integrações</div>
                            <div className="text-lg font-bold text-gray-900">
                              {assinatura.estatisticas.usageStats.integracoesUsadas}
                            </div>
                            <div className="text-xs text-gray-500">
                              de {assinatura.configuracoes.limitesUso.integracoes}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="text-sm text-gray-600">Armazenamento</div>
                            <div className="text-lg font-bold text-gray-900">
                              {assinatura.estatisticas.usageStats.armazenamentoUsado.toFixed(1)} GB
                            </div>
                            <div className="text-xs text-gray-500">
                              de {assinatura.configuracoes.limitesUso.armazenamento} GB
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Histórico de Pagamentos */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Histórico de Pagamentos
                        </h4>
                        <div className="space-y-2">
                          {assinatura.historicoPagamentos.map((pagamento) => (
                            <div key={pagamento.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  pagamento.status === 'pago' ? 'bg-green-500' :
                                  pagamento.status === 'pendente' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`} />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {format(pagamento.data, 'dd/MM/yyyy', { locale: ptBR })} • {getFormaPagamentoLabel(pagamento.formaPagamento)}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                pagamento.status === 'pago' ? 'bg-green-100 text-green-700' :
                                pagamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
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
