'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Download, 
  Send, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Package,
  CreditCard,
  Truck,
  Star,
  BarChart3
} from 'lucide-react'

interface Contato {
  id: string
  nome: string
  telefone: string
  email?: string
  foto_perfil?: string
  total_orcamentos: number
  valor_total: number
  ultimo_orcamento: string
  status: 'ativo' | 'inativo'
  favorito: boolean
  tags: string[]
}

interface Orcamento {
  id: string
  numero: string
  titulo: string
  cliente_id: string
  cliente_nome: string
  data_criacao: string
  data_validade: string
  tipo: 'venda' | 'assinatura' | 'orcamento' | 'cobranca'
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado'
  valor_total: number
  itens: {
    id: string
    nome: string
    descricao?: string
    quantidade: number
    valor_unitario: number
    valor_total: number
  }[]
  observacoes?: string
  condicoes_pagamento?: string
  prazo_entrega?: string
}

interface OrcamentoViewerProps {
  contato: Contato | null
  orcamentos: Orcamento[]
  selectedOrcamento: Orcamento | null
  onSelectOrcamento: (orcamento: Orcamento) => void
  onCreateOrcamento: () => void
}

export default function OrcamentoViewer({
  contato,
  orcamentos,
  selectedOrcamento,
  onSelectOrcamento,
  onCreateOrcamento
}: OrcamentoViewerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'rascunho':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Edit, label: 'Rascunho' }
      case 'enviado':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Send, label: 'Enviado' }
      case 'aprovado':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Aprovado' }
      case 'rejeitado':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle, label: 'Rejeitado' }
      case 'expirado':
        return { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: AlertCircle, label: 'Expirado' }
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FileText, label: status }
    }
  }

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'venda':
        return { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Venda' }
      case 'assinatura':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Assinatura' }
      case 'orcamento':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Orçamento' }
      case 'cobranca':
        return { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cobrança' }
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', label: tipo }
    }
  }

  if (!contato) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#305e73]/10 to-[#3a6d84]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-[#305e73]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Selecione um Contato
          </h3>
          <p className="text-gray-600 max-w-md">
            Escolha um contato na barra lateral para visualizar seus orçamentos
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <motion.div
        className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {contato.foto_perfil ? (
                <img
                  src={contato.foto_perfil}
                  alt={contato.nome}
                  className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {contato.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              
              {contato.favorito && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                  <Star className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {contato.nome}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{contato.telefone}</span>
                </div>
                {contato.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{contato.email}</span>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {contato.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {contato.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#305e73]/10 text-[#305e73] rounded-full text-xs font-medium border border-[#305e73]/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#305e73]">
                {contato.total_orcamentos}
              </div>
              <div className="text-sm text-gray-600">Orçamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(contato.valor_total)}
              </div>
              <div className="text-sm text-gray-600">Valor Total</div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateOrcamento}
              className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Orçamento
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {orcamentos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex items-center justify-center p-12"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#305e73]/10 to-[#3a6d84]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-[#305e73]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Nenhum Orçamento
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Este contato ainda não possui orçamentos. Crie o primeiro orçamento para começar.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateOrcamento}
                className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Orçamento
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex">
            {/* Lista de Orçamentos */}
            <div className="w-96 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Orçamentos ({orcamentos.length})
                  </h3>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-400 hover:text-[#305e73] hover:bg-[#305e73]/10 rounded-lg transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {orcamentos.map((orcamento, index) => {
                      const statusConfig = getStatusConfig(orcamento.status)
                      const tipoConfig = getTipoConfig(orcamento.tipo)
                      const StatusIcon = statusConfig.icon
                      const isSelected = selectedOrcamento?.id === orcamento.id

                      return (
                        <motion.div
                          key={orcamento.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          onClick={() => onSelectOrcamento(orcamento)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#305e73]/10 to-[#3a6d84]/10 border-2 border-[#305e73]/30 shadow-lg'
                              : 'bg-gray-50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 border-2 border-transparent hover:border-gray-200 hover:shadow-md'
                          }`}
                        >
                          {/* Selection Indicator */}
                          {isSelected && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#305e73] to-[#3a6d84]"
                            />
                          )}

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-mono text-gray-500">
                                  {orcamento.numero}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoConfig.bgColor} ${tipoConfig.color}`}>
                                  {tipoConfig.label}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900 truncate group-hover:text-[#305e73] transition-colors">
                                {orcamento.titulo}
                              </h4>
                            </div>

                            <div className={`p-2 rounded-lg ${statusConfig.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                            </div>
                          </div>

                          {/* Value */}
                          <div className="text-2xl font-bold text-green-600 mb-2 group-hover:scale-105 transition-transform duration-200">
                            {formatCurrency(orcamento.valor_total)}
                          </div>

                          {/* Dates */}
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(orcamento.data_criacao)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(orcamento.data_validade)}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center justify-between">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color} border border-current/20`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              {orcamento.itens.length} {orcamento.itens.length === 1 ? 'item' : 'itens'}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Detalhes do Orçamento */}
            <div className="flex-1 overflow-y-auto">
              {selectedOrcamento ? (
                <OrcamentoDetails orcamento={selectedOrcamento} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center p-12"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#305e73]/10 to-[#3a6d84]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-10 h-10 text-[#305e73]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Selecione um Orçamento
                    </h3>
                    <p className="text-gray-600">
                      Clique em um orçamento para ver os detalhes completos
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para detalhes do orçamento
function OrcamentoDetails({ orcamento }: { orcamento: Orcamento }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const statusConfig = {
    rascunho: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
    enviado: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
    aprovado: { color: 'text-green-600', bgColor: 'bg-green-100' },
    rejeitado: { color: 'text-red-600', bgColor: 'bg-red-100' },
    expirado: { color: 'text-orange-600', bgColor: 'bg-orange-100' }
  }[orcamento.status] || { color: 'text-gray-600', bgColor: 'bg-gray-100' }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {orcamento.titulo}
            </h2>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color} border border-current/20`}>
              {orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 font-mono">
            {orcamento.numero}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
          >
            <Download className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-[#305e73]/10 hover:bg-[#305e73]/20 text-[#305e73] rounded-xl transition-all"
          >
            <Edit className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-blue-600 font-medium">Criado em</div>
              <div className="text-lg font-bold text-blue-900">
                {formatDate(orcamento.data_criacao)}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-green-600 font-medium">Valor Total</div>
              <div className="text-lg font-bold text-green-900">
                {formatCurrency(orcamento.valor_total)}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-orange-600 font-medium">Válido até</div>
              <div className="text-lg font-bold text-orange-900">
                {formatDate(orcamento.data_validade)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Itens */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-[#305e73]" />
            <h3 className="text-lg font-bold text-gray-900">
              Itens do Orçamento ({orcamento.itens.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {orcamento.itens.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {item.nome}
                  </h4>
                  {item.descricao && (
                    <p className="text-gray-600 text-sm mb-3">
                      {item.descricao}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Qtd: {item.quantidade}</span>
                    <span>Valor Unit.: {formatCurrency(item.valor_unitario)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(item.valor_total)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <span className="text-lg font-semibold">Total Geral:</span>
            <span className="text-3xl font-bold">
              {formatCurrency(orcamento.valor_total)}
            </span>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orcamento.condicoes_pagamento && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-[#305e73]" />
              <h4 className="font-semibold text-gray-900">Condições de Pagamento</h4>
            </div>
            <p className="text-gray-700">
              {orcamento.condicoes_pagamento}
            </p>
          </div>
        )}

        {orcamento.prazo_entrega && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-[#305e73]" />
              <h4 className="font-semibold text-gray-900">Prazo de Entrega</h4>
            </div>
            <p className="text-gray-700">
              {orcamento.prazo_entrega}
            </p>
          </div>
        )}
      </div>

      {orcamento.observacoes && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#305e73]" />
            <h4 className="font-semibold text-gray-900">Observações</h4>
          </div>
          <p className="text-gray-700">
            {orcamento.observacoes}
          </p>
        </div>
      )}
    </motion.div>
  )
}
