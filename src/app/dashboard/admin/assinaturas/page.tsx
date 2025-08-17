'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import AssinaturasHeader from './components/AssinaturasHeader'
import AssinaturasStats from './components/AssinaturasStats'
import AssinaturasFilters from './components/AssinaturasFilters'
import AssinaturasList from './components/AssinaturasList'
import CriarAssinaturaModal from './components/CriarAssinaturaModal'

export interface Assinatura {
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

// Mock data para assinaturas
const mockAssinaturas: Assinatura[] = [
  {
    id: '1',
    contato: {
      id: 'c1',
      nome: 'João Silva',
      telefone: '+5511999887766',
      email: 'joao@empresa.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    plano: {
      nome: 'Premium Business',
      tipo: 'premium',
      valor: 299.90,
      periodo: 'mensal',
      descricao: 'Plano completo para empresas médias',
      recursos: ['WhatsApp Business API', 'Kanban Avançado', 'Relatórios Detalhados', 'Suporte 24/7']
    },
    status: 'ativa',
    dataInicio: new Date('2024-01-15'),
    dataVencimento: new Date('2024-02-15'),
    dataProximoPagamento: new Date('2024-02-15'),
    formaPagamento: 'cartao',
    valorPago: 299.90,
    criadaEm: new Date('2024-01-15'),
    atualizadaEm: new Date('2024-01-20'),
    configuracoes: {
      renovacaoAutomatica: true,
      notificacoes: {
        lembreteVencimento: {
          ativo: true,
          diasAntes: [7, 3, 1],
          mensagem: 'Olá {nome}! Sua assinatura {plano} vence em {dias} dias. Renove para continuar aproveitando nossos serviços.'
        },
        confirmacaoPagamento: {
          ativo: true,
          mensagem: 'Pagamento confirmado! Sua assinatura {plano} foi renovada até {dataVencimento}. Obrigado!'
        },
        expiracaoAssinatura: {
          ativo: true,
          mensagem: 'Sua assinatura {plano} expirou. Renove agora para reativar todos os recursos.'
        },
        suspensaoServico: {
          ativo: true,
          diasAposSuspensao: 7,
          mensagem: 'Serviços suspensos por falta de pagamento. Entre em contato para regularizar.'
        }
      },
      limitesUso: {
        mensagensWhatsapp: 10000,
        atendimentosSimultaneos: 50,
        integracoes: 10,
        armazenamento: 100
      }
    },
    historicoPagamentos: [
      {
        id: 'p1',
        data: new Date('2024-01-15'),
        valor: 299.90,
        status: 'pago',
        formaPagamento: 'cartao',
        referencia: 'PAG-001'
      }
    ],
    estatisticas: {
      totalPago: 299.90,
      diasAtivos: 30,
      ultimoAcesso: new Date('2024-01-22T14:30:00'),
      usageStats: {
        mensagensEnviadas: 2450,
        atendimentosRealizados: 89,
        integracoesUsadas: 5,
        armazenamentoUsado: 23.5
      }
    }
  },
  {
    id: '2',
    contato: {
      id: 'c2',
      nome: 'Maria Santos',
      telefone: '+5511888776655',
      email: 'maria@loja.com'
    },
    plano: {
      nome: 'Básico Starter',
      tipo: 'basico',
      valor: 99.90,
      periodo: 'mensal',
      descricao: 'Plano ideal para pequenos negócios',
      recursos: ['WhatsApp Web', 'Kanban Básico', 'Relatórios Simples']
    },
    status: 'expirada',
    dataInicio: new Date('2023-12-01'),
    dataVencimento: new Date('2024-01-01'),
    dataProximoPagamento: new Date('2024-02-01'),
    formaPagamento: 'pix',
    valorPago: 99.90,
    criadaEm: new Date('2023-12-01'),
    atualizadaEm: new Date('2024-01-01'),
    configuracoes: {
      renovacaoAutomatica: false,
      notificacoes: {
        lembreteVencimento: {
          ativo: true,
          diasAntes: [5, 1],
          mensagem: 'Oi {nome}! Sua assinatura vence em {dias} dias. Não perca o acesso!'
        },
        confirmacaoPagamento: {
          ativo: true,
          mensagem: 'Pagamento recebido! Assinatura renovada com sucesso.'
        },
        expiracaoAssinatura: {
          ativo: true,
          mensagem: 'Assinatura expirada. Renove para continuar usando nossos serviços.'
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
    historicoPagamentos: [
      {
        id: 'p2',
        data: new Date('2023-12-01'),
        valor: 99.90,
        status: 'pago',
        formaPagamento: 'pix'
      }
    ],
    estatisticas: {
      totalPago: 99.90,
      diasAtivos: 31,
      ultimoAcesso: new Date('2024-01-01T10:15:00'),
      usageStats: {
        mensagensEnviadas: 890,
        atendimentosRealizados: 23,
        integracoesUsadas: 2,
        armazenamentoUsado: 5.2
      }
    }
  },
  {
    id: '3',
    contato: {
      id: 'c3',
      nome: 'Carlos Oliveira',
      telefone: '+5511777665544',
      email: 'carlos@tech.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    plano: {
      nome: 'Enterprise Pro',
      tipo: 'enterprise',
      valor: 899.90,
      periodo: 'anual',
      descricao: 'Solução completa para grandes empresas',
      recursos: ['API Completa', 'Kanban Ilimitado', 'BI Avançado', 'Suporte Dedicado', 'Integrações Personalizadas']
    },
    status: 'ativa',
    dataInicio: new Date('2024-01-01'),
    dataVencimento: new Date('2025-01-01'),
    dataProximoPagamento: new Date('2025-01-01'),
    formaPagamento: 'transferencia',
    valorPago: 8999.00,
    desconto: 1800.00,
    criadaEm: new Date('2024-01-01'),
    atualizadaEm: new Date('2024-01-10'),
    configuracoes: {
      renovacaoAutomatica: true,
      notificacoes: {
        lembreteVencimento: {
          ativo: true,
          diasAntes: [30, 15, 7, 1],
          mensagem: 'Prezado {nome}, sua assinatura Enterprise vence em {dias} dias. Nossa equipe entrará em contato.'
        },
        confirmacaoPagamento: {
          ativo: true,
          mensagem: 'Pagamento Enterprise confirmado! Assinatura renovada por mais 12 meses.'
        },
        expiracaoAssinatura: {
          ativo: true,
          mensagem: 'Assinatura Enterprise expirada. Entre em contato com nosso time comercial.'
        },
        suspensaoServico: {
          ativo: true,
          diasAposSuspensao: 15,
          mensagem: 'Serviços Enterprise suspensos. Contate nosso suporte dedicado.'
        }
      },
      limitesUso: {
        mensagensWhatsapp: 100000,
        atendimentosSimultaneos: 500,
        integracoes: 50,
        armazenamento: 1000
      }
    },
    historicoPagamentos: [
      {
        id: 'p3',
        data: new Date('2024-01-01'),
        valor: 8999.00,
        status: 'pago',
        formaPagamento: 'transferencia',
        referencia: 'TRF-ENT-001'
      }
    ],
    estatisticas: {
      totalPago: 8999.00,
      diasAtivos: 22,
      ultimoAcesso: new Date('2024-01-22T16:45:00'),
      usageStats: {
        mensagensEnviadas: 15600,
        atendimentosRealizados: 234,
        integracoesUsadas: 12,
        armazenamentoUsado: 156.8
      }
    }
  }
]

export default function AssinaturasPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>(mockAssinaturas)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'todas' | 'ativa' | 'expirada' | 'cancelada' | 'pendente' | 'suspensa'>('todas')
  const [filterTipo, setFilterTipo] = useState<string>('')
  const [filterPeriodo, setFilterPeriodo] = useState<string>('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#305e73]"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const filteredAssinaturas = assinaturas.filter(assinatura => {
    const matchesSearch = assinatura.contato.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assinatura.contato.telefone.includes(searchQuery) ||
                         assinatura.plano.nome.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todas' || assinatura.status === filterStatus
    const matchesTipo = !filterTipo || assinatura.plano.tipo === filterTipo
    const matchesPeriodo = !filterPeriodo || assinatura.plano.periodo === filterPeriodo
    
    return matchesSearch && matchesStatus && matchesTipo && matchesPeriodo
  })

  const handleCreateAssinatura = (novaAssinatura: Omit<Assinatura, 'id' | 'criadaEm' | 'atualizadaEm' | 'historicoPagamentos' | 'estatisticas'>) => {
    const assinatura: Assinatura = {
      ...novaAssinatura,
      id: Date.now().toString(),
      criadaEm: new Date(),
      atualizadaEm: new Date(),
      historicoPagamentos: [],
      estatisticas: {
        totalPago: 0,
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
    setAssinaturas(prev => [...prev, assinatura])
    setShowCreateModal(false)
  }

  const handleUpdateAssinatura = (id: string, updates: Partial<Assinatura>) => {
    setAssinaturas(prev => prev.map(assinatura => 
      assinatura.id === id 
        ? { ...assinatura, ...updates, atualizadaEm: new Date() }
        : assinatura
    ))
  }

  const handleDeleteAssinatura = (id: string) => {
    setAssinaturas(prev => prev.filter(assinatura => assinatura.id !== id))
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <AssinaturasHeader onCreateAssinatura={() => setShowCreateModal(true)} />
        
        <AssinaturasStats assinaturas={assinaturas} />
        
        <AssinaturasFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterTipo={filterTipo}
          setFilterTipo={setFilterTipo}
          filterPeriodo={filterPeriodo}
          setFilterPeriodo={setFilterPeriodo}
        />
        
        <AssinaturasList
          assinaturas={filteredAssinaturas}
          onUpdateAssinatura={handleUpdateAssinatura}
          onDeleteAssinatura={handleDeleteAssinatura}
        />

        {showCreateModal && (
          <CriarAssinaturaModal
            onClose={() => setShowCreateModal(false)}
            onCreateAssinatura={handleCreateAssinatura}
          />
        )}
      </div>
    </AdminLayout>
  )
}
