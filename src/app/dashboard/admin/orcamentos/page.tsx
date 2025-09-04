'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useOrcamentos, type Orcamento } from '@/hooks/useOrcamentos'
import { AdminLayout } from '../components/AdminLayout'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Eye,
  Edit,
  Download,
  Send,
  MoreVertical,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Target,
  Zap,
  Grid,
  List,
  User,
  Trash2,
  Copy,
  ExternalLink,
  Package
} from 'lucide-react'
import CriarOrcamentoModal from './components/CriarOrcamentoModal'

// Interface removida - usando a do hook useOrcamentos

interface OrcamentoStats {
  total: number
  aprovados: number
  pendentes: number
  rejeitados: number
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
  desconto?: number
  taxa_adicional?: number
}

export default function OrcamentosPage() {
  const { user, loading: authLoading } = useAuth()
  const { 
    orcamentos, 
    loading: loadingOrcamentos, 
    error,
    fetchOrcamentos,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    updateOrcamentoStatus
  } = useOrcamentos()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null)
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'data' | 'valor' | 'cliente' | 'status'>('data')

  // Estados para dados reais
  const [stats, setStats] = useState({
    totalValue: 0,
    totalQuotes: 0,
    conversionRate: 0,
    avgTime: '0 dias',
    approved: 0,
    pending: 0,
    rejected: 0,
    expired: 0
  })

  // Função para lidar com erro
  const handleError = (message: string) => {
    console.error(message)
    // Aqui você pode adicionar um sistema de notificação
  }

  // Filtrar e ordenar orçamentos
  const filteredOrcamentos = useMemo(() => {
    return orcamentos
      .filter(orcamento => {
        const matchesSearch = searchQuery === '' || 
          orcamento.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (orcamento.contato?.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          orcamento.id.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesStatus = filterStatus === 'all' || orcamento.status === filterStatus
        
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'data':
            return new Date(b.data).getTime() - new Date(a.data).getTime()
          case 'valor':
            return b.valorTotal - a.valorTotal
          case 'cliente':
            return (a.contato?.nome || '').localeCompare(b.contato?.nome || '')
          case 'status':
            return a.status.localeCompare(b.status)
          default:
            return 0
        }
      })
  }, [orcamentos, searchQuery, filterStatus, sortBy])

  useEffect(() => {
    if (user) {
      console.log('🚀 INICIANDO busca de orçamentos...')
      fetchOrcamentos()
    }
  }, [user])

  // Debug dos orçamentos carregados
  useEffect(() => {
    console.log('📊 ESTADO ORCAMENTOS:', { 
      quantidade: orcamentos.length, 
      loading: loadingOrcamentos, 
      dados: orcamentos 
    })
  }, [orcamentos, loadingOrcamentos])

  // Redirect to login if not authenticated (only after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login'
    }
  }, [user, authLoading])
  if (loadingOrcamentos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#305e73]/20"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#305e73] absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleOrcamentoSave = async (novoOrcamento: any) => {
    try {
      if (editingOrcamento) {
        // Editando orçamento existente
        await updateOrcamento({
          id: editingOrcamento.id,
          titulo: novoOrcamento.titulo,
          contato_nome: novoOrcamento.contato_nome,
          contato_telefone: novoOrcamento.contato_telefone,
          valor_total: novoOrcamento.valor_total,
          observacao: novoOrcamento.observacao,
          itens: novoOrcamento.itens
        })
        setEditingOrcamento(null)
      } else {
        // Criando novo orçamento
        await createOrcamento({
          titulo: novoOrcamento.titulo,
          contato_nome: novoOrcamento.contato_nome,
          contato_telefone: novoOrcamento.contato_telefone,
          valor_total: novoOrcamento.valor_total,
          observacao: novoOrcamento.observacao,
          status: 'rascunho',
          itens: novoOrcamento.itens
        })
      }
      setShowCreateModal(false)
    } catch (error) {
      handleError('Erro ao salvar orçamento')
    }
  }

  // Função para editar orçamento
  const handleEditOrcamento = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento)
    setShowCreateModal(true)
  }

  // Função para deletar orçamento
  const handleDeleteOrcamento = async (id: string) => {
    try {
      await deleteOrcamento(id)
      setShowDeleteConfirm(null)
    } catch (error) {
      handleError('Erro ao deletar orçamento')
    }
  }

  // Função para alterar status
  const handleStatusChange = async (id: string, status: Orcamento['status']) => {
    try {
      await updateOrcamentoStatus(id, status)
    } catch (error) {
      handleError('Erro ao alterar status do orçamento')
    }
  }

  // Função para visualizar orçamento
  const handleViewOrcamento = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento)
  }

  // Função para duplicar orçamento
  const handleDuplicateOrcamento = async (orcamento: Orcamento) => {
    try {
      await createOrcamento({
        titulo: `${orcamento.titulo} (Cópia)`,
        contato_id: orcamento.contatoId,
        tipo: 'orcamento' as const,
        valorTotal: orcamento.valorTotal,
        observacao: orcamento.observacao,
        status: 'rascunho',
        itens: orcamento.itens
      })
    } catch (error) {
      handleError('Erro ao duplicar orçamento')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
      case 'enviado': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
      case 'rascunho': return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
      case 'rejeitado': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
      case 'expirado': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return CheckCircle
      case 'enviado': return Send
      case 'rascunho': return Edit
      case 'rejeitado': return XCircle
      case 'expirado': return AlertCircle
      default: return FileText
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Ultra Sofisticado */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-[#305e73] via-[#3a6d84] to-[#4a7d94] rounded-2xl flex items-center justify-center shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-4xl font-black text-gray-900 flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Orçamentos
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </motion.h1>
                  <motion.p 
                    className="text-gray-600 mt-2 text-lg font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Gerencie suas propostas com elegância e eficiência
                  </motion.p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#305e73] via-[#3a6d84] to-[#4a7d94] text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                Novo Orçamento
              </motion.button>
            </div>

            {/* Stats Cards Integradas */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { title: 'Faturamento', value: `R$ ${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
                { title: 'Orçamentos', value: stats.totalQuotes, icon: FileText, color: 'from-blue-500 to-blue-600' },
                { title: 'Conversão', value: `${stats.conversionRate}%`, icon: Target, color: 'from-purple-500 to-purple-600' },
                { title: 'Tempo Médio', value: stats.avgTime, icon: Clock, color: 'from-orange-500 to-orange-600' }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.title}
                    className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                    whileHover={{ y: -8, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                        {stat.value}
                      </div>
                      <div className="text-gray-600 font-medium">{stat.title}</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Controles e Filtros */}
            <motion.div
              className="flex items-center justify-between mt-8 bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar orçamentos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-6 py-3 w-80 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-[#305e73] outline-none"
                >
                  <option value="all">Todos Status</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="expirado">Expirado</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-[#305e73] outline-none"
                >
                  <option value="data">Por Data</option>
                  <option value="valor">Por Valor</option>
                  <option value="cliente">Por Cliente</option>
                  <option value="status">Por Status</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'grid' 
                    ? 'bg-[#305e73] text-white shadow-lg' 
                    : 'bg-white/60 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'list' 
                    ? 'bg-[#305e73] text-white shadow-lg' 
                    : 'bg-white/60 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Grid de Orçamentos Ultra Elegante */}
        <div className="px-8 py-8">
          {loadingOrcamentos ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                className="w-16 h-16 border-4 border-[#305e73]/20 border-t-[#305e73] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <motion.div
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                : "space-y-6"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence>
                {filteredOrcamentos.map((orcamento, index) => {
                  // Debug - vamos ver o que tem nos dados
                  console.log('🔍 CARD DEBUG - Orçamento:', orcamento)
                  
                  const statusColor = getStatusColor(orcamento.status)
                  const StatusIcon = getStatusIcon(orcamento.status)
                  
                  return (
                    <motion.div
                      key={orcamento.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden"
                      onClick={() => setSelectedOrcamento(orcamento)}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-[#305e73] to-[#4a7d94]" />
                      
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className={`p-3 rounded-2xl ${statusColor.bg} ${statusColor.border} border-2 group-hover:scale-110 transition-transform duration-300`}
                            whileHover={{ rotate: 10 }}
                          >
                            <StatusIcon className={`w-5 h-5 ${statusColor.text}`} />
                          </motion.div>
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {orcamento.numero}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor.bg} ${statusColor.text} mt-1`}>
                              {orcamento.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <motion.button
                            className="p-2 rounded-xl bg-white/60 hover:bg-white/90 transition-all opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              // Toggle dropdown menu here if needed
                              console.log('More options for:', orcamento.id)
                            }}
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Título e Descrição */}
                      <div className="mb-6 relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#305e73] transition-colors duration-300">
                          {orcamento.titulo}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {orcamento.observacao}
                        </p>
                      </div>

                      {/* Cliente Info */}
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#305e73] to-[#4a7c95] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{orcamento.contato?.nome || 'Sem cliente'}</div>
                          <div className="text-xs text-gray-500">{orcamento.contato?.telefone || 'Sem telefone'}</div>
                        </div>
                      </div>

                      {/* Detalhes adicionais */}
                      <div className="space-y-3 mb-4 relative z-10">
                        {/* Data de vencimento se existir */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                          <Calendar className="w-3 h-3" />
                          {orcamento.tipo.charAt(0).toUpperCase() + orcamento.tipo.slice(1)}
                        </div>
                        
                        {/* Número de itens */}
                        {orcamento.itens && orcamento.itens.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                            <Package className="w-3 h-3" />
                            <span>{orcamento.itens.length} {orcamento.itens.length === 1 ? 'item' : 'itens'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Valor e Data */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 relative z-10">
                        <div>
                          <div className="text-2xl font-black text-[#305e73] group-hover:scale-105 transition-transform duration-300">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(orcamento.valorTotal || 0)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Criado em: {new Date(orcamento.data).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewOrcamento(orcamento)
                            }}
                            className="p-2 rounded-xl bg-[#305e73]/10 hover:bg-[#305e73]/20 text-[#305e73] transition-all"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditOrcamento(orcamento)
                            }}
                            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-all"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateOrcamento(orcamento)
                            }}
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-all"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteConfirm(orcamento.id)
                            }}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showCreateModal && (
            <CriarOrcamentoModal
              isOpen={showCreateModal}
              onClose={() => {
                setShowCreateModal(false)
                setEditingOrcamento(null)
              }}
              onSave={handleOrcamentoSave}
              editingOrcamento={editingOrcamento}
            />
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
                    <p className="text-gray-600 text-sm">Esta ação não pode ser desfeita.</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Tem certeza que deseja excluir este orçamento?
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeleteOrcamento(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* View Modal */}
          {selectedOrcamento && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedOrcamento(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#305e73]/10 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#305e73]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Orçamento #{selectedOrcamento.id.slice(-8)}</h2>
                      <p className="text-gray-600 mt-1">{selectedOrcamento.observacao || 'Sem observações'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrcamento(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cliente</label>
                      <p className="text-gray-900 font-medium">{selectedOrcamento.cliente_nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-900">{selectedOrcamento.cliente_telefone || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusColor(selectedOrcamento.status).bg} ${getStatusColor(selectedOrcamento.status).text}`}>
                        {selectedOrcamento.status.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor Total</label>
                      <p className="text-2xl font-black text-[#305e73]">R$ {(selectedOrcamento.valor_total || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                    <p className="text-gray-900">{new Date(selectedOrcamento.data_criacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  {selectedOrcamento.observacoes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Observações</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedOrcamento.observacoes}</p>
                    </div>
                  )}
                  
                  {selectedOrcamento.itens && selectedOrcamento.itens.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Itens</label>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Qtd</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Valor</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrcamento.itens.map((item, index) => (
                              <tr key={index} className="border-t">
                                <td className="px-4 py-2 text-sm text-gray-900">{item.nome}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{item.quantidade}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">R$ {item.valor.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">R$ {(item.valor * item.quantidade).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedOrcamento(null)
                      handleEditOrcamento(selectedOrcamento)
                    }}
                    className="px-4 py-2 bg-[#305e73] hover:bg-[#305e73]/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setSelectedOrcamento(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}
