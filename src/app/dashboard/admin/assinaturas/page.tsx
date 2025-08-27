'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useAssinaturas, type Assinatura } from '@/hooks/useAssinaturas'
import AssinaturasHeader from './components/AssinaturasHeader'
import AssinaturasStats from './components/AssinaturasStats'
import AssinaturasFilters from './components/AssinaturasFilters'
import AssinaturasList from './components/AssinaturasList'
import CriarAssinaturaModal from './components/CriarAssinaturaModal'

// Interface compatível com mock data para os componentes
export interface AssinaturaDisplay {
  id: string
  contato: {
    id: string
    nome: string
    telefone: string
    email?: string
    avatar?: string
  }
  plano: {
    nome: string
    tipo: 'basico' | 'premium' | 'enterprise' | 'custom'
    valor: number
    periodo: 'mensal' | 'trimestral' | 'semestral' | 'anual'
    descricao: string
    recursos: string[]
  }
  status: 'ativa' | 'expirada' | 'cancelada' | 'pendente' | 'suspensa'
  dataInicio: Date
  dataVencimento: Date
  dataProximoPagamento: Date
  formaPagamento: 'pix' | 'cartao' | 'boleto' | 'transferencia'
  valorPago: number
  desconto?: number
  criadaEm: Date
  atualizadaEm: Date
  configuracoes: {
    renovacaoAutomatica: boolean
    notificacoes: {
      lembreteVencimento: {
        ativo: boolean
        diasAntes: number[]
        mensagem: string
      }
      confirmacaoPagamento: {
        ativo: boolean
        mensagem: string
      }
      expiracaoAssinatura: {
        ativo: boolean
        mensagem: string
      }
      suspensaoServico: {
        ativo: boolean
        diasAposSuspensao: number
        mensagem: string
      }
    }
    limitesUso: {
      mensagensWhatsapp: number
      atendimentosSimultaneos: number
      integracoes: number
      armazenamento: number // em GB
    }
  }
  historicoPagamentos: {
    id: string
    data: Date
    valor: number
    status: 'pago' | 'pendente' | 'cancelado' | 'estornado'
    formaPagamento: string
    referencia?: string
  }[]
  estatisticas: {
    totalPago: number
    diasAtivos: number
    ultimoAcesso: Date
    usageStats: {
      mensagensEnviadas: number
      atendimentosRealizados: number
      integracoesUsadas: number
      armazenamentoUsado: number
    }
  }
}

// Função para converter dados do backend para formato de display
const convertToDisplayFormat = (assinatura: Assinatura): AssinaturaDisplay => {
  // Garantir que todos os valores são strings/números válidos
  const nome = typeof assinatura.nome === 'string' ? assinatura.nome : 'Cliente';
  const plano = typeof assinatura.plano === 'string' ? assinatura.plano : 'Plano Padrão';
  const valor = typeof assinatura.valor === 'number' ? assinatura.valor : 0;
  const status = typeof assinatura.status === 'string' ? assinatura.status : 'ativa';
  const renovacao = typeof assinatura.renovacao === 'string' ? assinatura.renovacao : 'mensal';
  const formaPagamento = typeof assinatura.forma_pagamento === 'string' ? assinatura.forma_pagamento : 'pix';

  return {
    id: String(assinatura.id),
    contato: {
      id: String(assinatura.contato_id || ''),
      nome: nome,
      telefone: '',
      email: ''
    },
    plano: {
      nome: plano,
      tipo: 'custom',
      valor: valor,
      periodo: renovacao as any,
      descricao: '',
      recursos: []
    },
    status: status as any,
    dataInicio: new Date(assinatura.data_inicio || new Date()),
    dataVencimento: assinatura.data_fim ? new Date(assinatura.data_fim) : new Date(),
    dataProximoPagamento: assinatura.data_fim ? new Date(assinatura.data_fim) : new Date(),
    formaPagamento: formaPagamento as any,
    valorPago: valor,
    criadaEm: new Date(assinatura.criado_em || new Date()),
    atualizadaEm: new Date(assinatura.atualizado_em || new Date()),
    configuracoes: {
      renovacaoAutomatica: true,
      notificacoes: {
        lembreteVencimento: {
          ativo: true,
          diasAntes: [7, 3, 1],
          mensagem: 'Sua assinatura vence em {dias} dias.'
        },
        confirmacaoPagamento: {
          ativo: true,
          mensagem: 'Pagamento confirmado!'
        },
        expiracaoAssinatura: {
          ativo: true,
          mensagem: 'Assinatura expirada.'
        },
        suspensaoServico: {
          ativo: false,
          diasAposSuspensao: 0,
          mensagem: ''
        }
      },
      limitesUso: {
        mensagensWhatsapp: 1000,
        atendimentosSimultaneos: 5,
        integracoes: 2,
        armazenamento: 10
      }
    },
    historicoPagamentos: [],
    estatisticas: {
      totalPago: valor,
      diasAtivos: 0,
      ultimoAcesso: new Date(),
      usageStats: {
        mensagensEnviadas: 0,
        atendimentosRealizados: 0,
        integracoesUsadas: 0,
        armazenamentoUsado: 0
      }
    }
  }
}

export default function AssinaturasPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { 
    assinaturas, 
    loading: assinaturasLoading, 
    error,
    createAssinatura,
    updateAssinatura,
    deleteAssinatura,
    updateAssinaturaStatus
  } = useAssinaturas()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todas')
  const [filterTipo, setFilterTipo] = useState<string>('')
  const [filterPeriodo, setFilterPeriodo] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAssinatura, setEditingAssinatura] = useState<AssinaturaDisplay | null>(null)
  const [displayAssinaturas, setDisplayAssinaturas] = useState<AssinaturaDisplay[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    try {
      console.log('Dados recebidos do backend:', assinaturas)
      if (assinaturas && Array.isArray(assinaturas) && assinaturas.length > 0) {
        console.log('Convertendo assinaturas...')
        const converted = assinaturas.map((item, index) => {
          console.log(`Convertendo item ${index}:`, item)
          return convertToDisplayFormat(item)
        }).filter(Boolean)
        console.log('Assinaturas convertidas:', converted)
        setDisplayAssinaturas(converted)
      } else {
        console.log('Nenhuma assinatura para converter')
        setDisplayAssinaturas([])
      }
    } catch (error) {
      console.error('Erro ao converter assinaturas:', error)
      setDisplayAssinaturas([])
    }
  }, [assinaturas])

  if (loading || assinaturasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#305e73]"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erro ao carregar assinaturas: {error}</p>
          <p className="text-sm text-gray-600 mt-2">Verifique se o backend está rodando e tente novamente.</p>
        </div>
      </div>
    )
  }

  // Se não há dados ainda, mostrar estado vazio
  if (!assinaturasLoading && displayAssinaturas.length === 0 && assinaturas.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma assinatura encontrada</h3>
          <p className="text-gray-500">Crie a primeira assinatura para começar.</p>
        </div>
      </div>
    )
  }

  const filteredAssinaturas = displayAssinaturas.filter(assinatura => {
    const matchesSearch = assinatura.contato.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assinatura.contato.telefone.includes(searchQuery) ||
                         assinatura.plano.nome.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todas' || assinatura.status === filterStatus
    const matchesTipo = !filterTipo || assinatura.plano.tipo === filterTipo
    const matchesPeriodo = !filterPeriodo || assinatura.plano.periodo === filterPeriodo
    
    return matchesSearch && matchesStatus && matchesTipo && matchesPeriodo
  })

  const handleCreateAssinatura = async (novaAssinatura: any) => {
    try {
      console.log('Dados enviados para o backend:', novaAssinatura)
      
      if (editingAssinatura) {
        // Atualizar assinatura existente
        await updateAssinatura(editingAssinatura.id, {
          nome: novaAssinatura.contato.nome || 'Cliente',
          forma_pagamento: novaAssinatura.formaPagamento || 'pix',
          valor: Number(novaAssinatura.plano.valor) || 0,
          renovacao: novaAssinatura.plano.periodo || 'mensal'
        })
      } else {
        // Criar nova assinatura
        await createAssinatura({
          nome: novaAssinatura.contato.nome || 'Cliente',
          plano: novaAssinatura.plano.nome || 'Plano Padrão',
          forma_pagamento: novaAssinatura.formaPagamento || 'pix',
          valor: Number(novaAssinatura.plano.valor) || 0,
          renovacao: novaAssinatura.plano.periodo || 'mensal',
          data_inicio: new Date().toISOString(),
          data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          contato_id: "1" // ID padrão por enquanto
        })
      }
      
      setShowCreateModal(false)
      setEditingAssinatura(null)
    } catch (err) {
      console.error('Erro ao criar/atualizar assinatura:', err)
    }
  }

  const handleUpdateAssinatura = async (id: string, updates: Partial<AssinaturaDisplay>) => {
    try {
      await updateAssinatura(id, updates)
      // Atualizar o estado local
      setDisplayAssinaturas(prev => 
        prev.map(assinatura => 
          assinatura.id === id ? { ...assinatura, ...updates } : assinatura
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error)
    }
  }

  const handleEditAssinatura = (assinatura: AssinaturaDisplay) => {
    setEditingAssinatura(assinatura)
    setShowCreateModal(true)
  }

  const handleDeleteAssinatura = async (id: string) => {
    try {
      await deleteAssinatura(id)
    } catch (err) {
      console.error('Erro ao excluir assinatura:', err)
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <AssinaturasHeader onCreateAssinatura={() => setShowCreateModal(true)} />
        
        <AssinaturasStats assinaturas={filteredAssinaturas} />
        
        <AssinaturasFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus as any}
          filterTipo={filterTipo}
          setFilterTipo={setFilterTipo}
          filterPeriodo={filterPeriodo}
          setFilterPeriodo={setFilterPeriodo}
        />
        
        <AssinaturasList 
          assinaturas={filteredAssinaturas}
          onUpdateAssinatura={handleUpdateAssinatura}
          onDeleteAssinatura={handleDeleteAssinatura}
          onEditAssinatura={handleEditAssinatura}
        />

        {showCreateModal && (
          <CriarAssinaturaModal
            onClose={() => {
              setShowCreateModal(false)
              setEditingAssinatura(null)
            }}
            onCreateAssinatura={handleCreateAssinatura}
            editingAssinatura={editingAssinatura}
            contatos={[
              { id: '1', nome: 'João Silva', telefone: '+5519999887766', email: 'joao@empresa.com' },
              { id: '2', nome: 'Maria Santos', telefone: '+5519888776655', email: 'maria@empresa.com' },
              { id: '3', nome: 'Pedro Costa', telefone: '+5519777665544', email: 'pedro@empresa.com' }
            ]}
          />
        )}
      </div>
    </AdminLayout>
  )
}
