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
  AlertCircle
} from 'lucide-react'
import ContatosSidebar from './components/ContatosSidebar'
import OrcamentoViewer from './components/OrcamentoViewer'
import OrcamentoStats from './components/OrcamentoStats'
import CriarOrcamentoModal from './components/CriarOrcamentoModal'

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
  desconto?: number
  taxa_adicional?: number
}

export default function OrcamentosPage() {
  const { user, loading } = useAuth()
  const [selectedContato, setSelectedContato] = useState<Contato | null>(null)
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'full'>('split')

  // Mock data - em produção viria da API
  const [contatos] = useState<Contato[]>([
    {
      id: '1',
      nome: 'João Silva',
      telefone: '+55 11 99999-9999',
      email: 'joao.silva@email.com',
      foto_perfil: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      total_orcamentos: 12,
      valor_total: 45600.00,
      ultimo_orcamento: '2024-01-20T10:30:00Z',
      status: 'ativo',
      favorito: true,
      tags: ['vip', 'corporativo']
    },
    {
      id: '2',
      nome: 'Maria Santos',
      telefone: '+55 11 88888-8888',
      email: 'maria.santos@empresa.com',
      foto_perfil: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      total_orcamentos: 8,
      valor_total: 23400.00,
      ultimo_orcamento: '2024-01-19T14:15:00Z',
      status: 'ativo',
      favorito: false,
      tags: ['cliente', 'recorrente']
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      telefone: '+55 11 77777-7777',
      total_orcamentos: 5,
      valor_total: 12800.00,
      ultimo_orcamento: '2024-01-18T16:45:00Z',
      status: 'ativo',
      favorito: false,
      tags: ['prospect', 'design']
    }
  ])

  const [orcamentos] = useState<Orcamento[]>([
    {
      id: '1',
      numero: 'ORC-2024-001',
      titulo: 'Website Corporativo',
      cliente_id: '1',
      cliente_nome: 'João Silva',
      data_criacao: '2024-01-20T10:30:00Z',
      data_validade: '2024-02-20T23:59:59Z',
      tipo: 'orcamento',
      status: 'enviado',
      valor_total: 15600.00,
      itens: [
        {
          id: '1',
          nome: 'Desenvolvimento Frontend',
          descricao: 'Desenvolvimento completo da interface do usuário',
          quantidade: 1,
          valor_unitario: 8000.00,
          valor_total: 8000.00
        },
        {
          id: '2',
          nome: 'Desenvolvimento Backend',
          descricao: 'API REST e integração com banco de dados',
          quantidade: 1,
          valor_unitario: 6000.00,
          valor_total: 6000.00
        },
        {
          id: '3',
          nome: 'Design UI/UX',
          descricao: 'Criação do design e prototipagem',
          quantidade: 1,
          valor_unitario: 1600.00,
          valor_total: 1600.00
        }
      ],
      observacoes: 'Projeto inclui 3 revisões e suporte por 30 dias',
      condicoes_pagamento: '50% entrada, 50% na entrega',
      prazo_entrega: '45 dias úteis'
    },
    {
      id: '2',
      numero: 'ORC-2024-002',
      titulo: 'Sistema de Gestão',
      cliente_id: '1',
      cliente_nome: 'João Silva',
      data_criacao: '2024-01-15T09:00:00Z',
      data_validade: '2024-02-15T23:59:59Z',
      tipo: 'venda',
      status: 'aprovado',
      valor_total: 30000.00,
      itens: [
        {
          id: '1',
          nome: 'Sistema Completo',
          descricao: 'Desenvolvimento do sistema de gestão completo',
          quantidade: 1,
          valor_unitario: 30000.00,
          valor_total: 30000.00
        }
      ],
      condicoes_pagamento: '30% entrada, 40% desenvolvimento, 30% entrega',
      prazo_entrega: '90 dias úteis'
    }
  ])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  // Selecionar primeiro contato automaticamente
  useEffect(() => {
    if (contatos.length > 0 && !selectedContato) {
      setSelectedContato(contatos[0])
    }
  }, [contatos, selectedContato])

  // Selecionar primeiro orçamento do contato selecionado
  useEffect(() => {
    if (selectedContato) {
      const contatoOrcamentos = orcamentos.filter(o => o.cliente_id === selectedContato.id)
      if (contatoOrcamentos.length > 0) {
        setSelectedOrcamento(contatoOrcamentos[0])
      } else {
        setSelectedOrcamento(null)
      }
    }
  }, [selectedContato, orcamentos])

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

  const filteredContatos = contatos.filter(contato =>
    contato.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contato.telefone.includes(searchQuery) ||
    contato.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const contatoOrcamentos = selectedContato 
    ? orcamentos.filter(o => o.cliente_id === selectedContato.id)
    : []

  return (
    <AdminLayout>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <motion.div
          className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  Orçamentos
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerencie orçamentos e propostas comerciais
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'split'
                      ? 'bg-white text-[#305e73] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewMode('full')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'full'
                      ? 'bg-white text-[#305e73] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Full View
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contatos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                />
              </div>

              {/* Actions */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Novo Orçamento
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="px-8 py-6 flex-shrink-0">
          <OrcamentoStats />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {viewMode === 'split' ? (
            <>
              {/* Sidebar - Contatos */}
              <div className="w-96 flex-shrink-0">
                <ContatosSidebar
                  contatos={filteredContatos}
                  selectedContato={selectedContato}
                  onSelectContato={setSelectedContato}
                  searchQuery={searchQuery}
                />
              </div>

              {/* Main Content - Orçamentos */}
              <div className="flex-1 min-w-0">
                <OrcamentoViewer
                  contato={selectedContato}
                  orcamentos={contatoOrcamentos}
                  selectedOrcamento={selectedOrcamento}
                  onSelectOrcamento={setSelectedOrcamento}
                  onCreateOrcamento={() => setShowCreateModal(true)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 p-8">
              {/* Full view implementation */}
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Visualização Completa
                </h3>
                <p className="text-gray-600">
                  Em desenvolvimento - Use o Split View por enquanto
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CriarOrcamentoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          contactData={selectedContato ? {
            nome: selectedContato.nome,
            telefone: selectedContato.telefone
          } : undefined}
          onSave={(orcamento) => {
            console.log('Novo orçamento:', orcamento)
            // Aqui você salvaria o orçamento na API
          }}
        />
      )}
    </AdminLayout>
  )
}
