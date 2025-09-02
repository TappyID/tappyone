'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
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
  User
} from 'lucide-react'
import CriarOrcamentoModal from './components/CriarOrcamentoModal'

interface Orcamento {
  id: string
  numero: string
  titulo: string
  cliente_id: string
  cliente_nome: string
  cliente_telefone?: string
  cliente_email?: string
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
  desconto?: number
  taxa_adicional?: number
}

export default function OrcamentosPage() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado'>('all')
  const [sortBy, setSortBy] = useState<'data' | 'valor' | 'status' | 'cliente'>('data')
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loadingOrcamentos, setLoadingOrcamentos] = useState(true)
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  // API para buscar orçamentos
  const fetchOrcamentos = async () => {
    try {
      setLoadingOrcamentos(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      const response = await fetch('http://159.65.34.199:8081/api/orcamentos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Erro ao buscar orçamentos')
      
      const data = await response.json()
      console.log('📊 Orçamentos recebidos:', data)
      
      // Transformar dados da API para o formato esperado
      const orcamentosFormatados = data.map((orc: any) => ({
        id: orc.id,
        numero: `ORC-${new Date(orc.criadoEm).getFullYear()}-${String(orc.id).slice(-3).padStart(3, '0')}`,
        titulo: orc.titulo,
        cliente_id: orc.contatoId,
        cliente_nome: orc.contato?.nome || 'Cliente não informado',
        cliente_telefone: orc.contato?.numeroTelefone || '',
        data_criacao: orc.criadoEm.split('T')[0],
        data_validade: orc.dataValidade?.split('T')[0] || '',
        tipo: orc.tipo.toLowerCase(),
        status: orc.status.toLowerCase().replace('_', ''),
        valor_total: orc.valorTotal || 0,
        itens: orc.itens?.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          quantidade: item.quantidade,
          valor_unitario: item.valor,
          valor_total: item.subtotal
        })) || [],
        observacoes: orc.observacao
      }))
      
      setOrcamentos(orcamentosFormatados)
      
      // Calcular estatísticas baseadas nos dados reais
      const totalValue = orcamentosFormatados.reduce((sum: number, orc: any) => sum + orc.valor_total, 0)
      const totalQuotes = orcamentosFormatados.length
      const approved = orcamentosFormatados.filter((orc: any) => orc.status === 'aprovado').length
      const pending = orcamentosFormatados.filter((orc: any) => orc.status === 'pendente').length
      const rejected = orcamentosFormatados.filter((orc: any) => orc.status === 'rejeitado').length
      const expired = orcamentosFormatados.filter((orc: any) => orc.status === 'expirado').length
      const conversionRate = totalQuotes > 0 ? Math.round((approved / totalQuotes) * 100) : 0
      
      setStats({
        totalValue,
        totalQuotes,
        conversionRate,
        avgTime: '2.1 dias', // TODO: calcular tempo médio real
        approved,
        pending,
        rejected,
        expired
      })
      
    } catch (error) {
      console.error('❌ Erro ao buscar orçamentos:', error)
    } finally {
      setLoadingOrcamentos(false)
    }
  }

  useEffect(() => {
    if (user && !loading) {
      fetchOrcamentos()
    }
  }, [user, loading])

  const mockOrcamentos: Orcamento[] = [
    {
      id: '1',
      numero: 'ORC-2025-001',
      titulo: 'Website Institucional',
      cliente_id: '1',
      cliente_nome: 'João Silva',
      cliente_telefone: '(11) 99999-9999',
      cliente_email: 'joao@empresa.com',
      data_criacao: '2025-01-15',
      data_validade: '2025-02-15',
      tipo: 'orcamento',
      status: 'enviado',
      valor_total: 15000,
      itens: [],
      observacoes: 'Website responsivo com CMS'
    },
    {
      id: '2',
      numero: 'ORC-2025-002',
      titulo: 'Sistema de Vendas',
      cliente_id: '2',
      cliente_nome: 'Maria Santos',
      cliente_telefone: '(11) 88888-8888',
      cliente_email: 'maria@loja.com',
      data_criacao: '2025-01-14',
      data_validade: '2025-02-14',
      tipo: 'venda',
      status: 'aprovado',
      valor_total: 35000,
      itens: [],
      observacoes: 'Sistema completo de gestão'
    },
    {
      id: '3',
      numero: 'ORC-2025-003',
      titulo: 'App Mobile E-commerce',
      cliente_id: '3',
      cliente_nome: 'Pedro Costa',
      cliente_telefone: '(11) 77777-7777',
      cliente_email: 'pedro@tech.com',
      data_criacao: '2025-01-13',
      data_validade: '2025-02-13',
      tipo: 'orcamento',
      status: 'rascunho',
      valor_total: 58000,
      itens: [],
      observacoes: 'App para iOS e Android'
    }
  ]

  // Carregar dados quando o usuário estiver autenticado

  // Redirect to login if not authenticated  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])


  if (loading) {
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

  // Atualizar lista após criar novo orçamento
  const handleOrcamentoSave = async (novoOrcamento: any) => {
    console.log('💾 Novo orçamento salvo, atualizando lista...')
    await fetchOrcamentos() // Recarregar lista
  }

  // Filtros e ordenação
  const filteredOrcamentos = orcamentos
    .filter(orc => {
      const matchesStatus = filterStatus === 'all' || orc.status === filterStatus
      const matchesSearch = searchQuery === '' || 
        orc.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orc.cliente_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orc.numero.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'data': return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
        case 'valor': return b.valor_total - a.valor_total
        case 'cliente': return a.cliente_nome.localeCompare(b.cliente_nome)
        default: return 0
      }
    })

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
                        
                        <motion.button
                          className="p-2 rounded-xl bg-white/60 hover:bg-white/90 transition-all opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </motion.button>
                      </div>

                      {/* Título e Descrição */}
                      <div className="mb-6 relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#305e73] transition-colors duration-300">
                          {orcamento.titulo}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {orcamento.observacoes}
                        </p>
                      </div>

                      {/* Cliente Info */}
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{orcamento.cliente_nome}</div>
                          <div className="text-xs text-gray-500">{orcamento.cliente_telefone}</div>
                        </div>
                      </div>

                      {/* Valor e Data */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 relative z-10">
                        <div>
                          <div className="text-2xl font-black text-[#305e73] group-hover:scale-105 transition-transform duration-300">
                            R$ {orcamento.valor_total.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(orcamento.data_criacao).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-[#305e73]/10 hover:bg-[#305e73]/20 text-[#305e73] transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-all"
                          >
                            <Download className="w-4 h-4" />
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

        {/* Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CriarOrcamentoModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSave={handleOrcamentoSave}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}
