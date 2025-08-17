'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AdminLayout from '../components/AdminLayout'
import AtendentesHeader from './components/AtendentesHeader'
import AtendentesStats from './components/AtendentesStats'
import AtendentesFilters from './components/AtendentesFilters'
import AtendentesList from './components/AtendentesList'
import CriarAtendenteModal from './components/CriarAtendenteModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface Atendente {
  id: string
  nome: string
  email: string
  telefone: string
  avatar: string
  cargo: 'atendente' | 'supervisor' | 'gerente'
  departamento: string
  status: 'online' | 'ausente' | 'ocupado' | 'offline'
  statusAtendimento: 'disponivel' | 'em_atendimento' | 'em_pausa' | 'finalizando'
  criadoEm: Date
  ultimoLogin: Date
  estatisticas: {
    atendimentosHoje: number
    atendimentosTotal: number
    tempoMedioAtendimento: number
    avaliacaoMedia: number
    ticketsResolvidos: number
    ticketsPendentes: number
  }
  atendimentoAtual?: {
    id: string
    cliente: string
    iniciadoEm: Date
    canal: 'whatsapp' | 'email' | 'chat'
    assunto: string
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  }
  configuracoes: {
    notificacoes: boolean
    autoAssign: boolean
    maxAtendimentosSimultaneos: number
    horarioTrabalho: {
      inicio: string
      fim: string
      diasSemana: number[]
    }
  }
  permissoes: string[]
  meta: {
    atendimentosDiarios: number
    tempoMaximoResposta: number
    avaliacaoMinima: number
  }
}

// Mock data realista
const mockAtendentes: Atendente[] = [
  {
    id: '1',
    nome: 'Ana Silva',
    email: 'ana.silva@tappyone.com',
    telefone: '+5511987654321',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    cargo: 'supervisor',
    departamento: 'Suporte',
    status: 'online',
    statusAtendimento: 'em_atendimento',
    criadoEm: new Date('2024-01-15'),
    ultimoLogin: new Date(),
    estatisticas: {
      atendimentosHoje: 12,
      atendimentosTotal: 1847,
      tempoMedioAtendimento: 8.5,
      avaliacaoMedia: 4.8,
      ticketsResolvidos: 1650,
      ticketsPendentes: 3
    },
    atendimentoAtual: {
      id: 'ticket-001',
      cliente: 'João Santos',
      iniciadoEm: new Date(Date.now() - 15 * 60 * 1000),
      canal: 'whatsapp',
      assunto: 'Problema com integração',
      prioridade: 'alta'
    },
    configuracoes: {
      notificacoes: true,
      autoAssign: true,
      maxAtendimentosSimultaneos: 5,
      horarioTrabalho: {
        inicio: '08:00',
        fim: '18:00',
        diasSemana: [1, 2, 3, 4, 5]
      }
    },
    permissoes: ['atender', 'transferir', 'escalar', 'relatorios'],
    meta: {
      atendimentosDiarios: 15,
      tempoMaximoResposta: 10,
      avaliacaoMinima: 4.5
    }
  },
  {
    id: '2',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@tappyone.com',
    telefone: '+5511876543210',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    cargo: 'atendente',
    departamento: 'Vendas',
    status: 'online',
    statusAtendimento: 'disponivel',
    criadoEm: new Date('2024-02-20'),
    ultimoLogin: new Date(Date.now() - 5 * 60 * 1000),
    estatisticas: {
      atendimentosHoje: 8,
      atendimentosTotal: 892,
      tempoMedioAtendimento: 12.3,
      avaliacaoMedia: 4.6,
      ticketsResolvidos: 820,
      ticketsPendentes: 2
    },
    configuracoes: {
      notificacoes: true,
      autoAssign: true,
      maxAtendimentosSimultaneos: 3,
      horarioTrabalho: {
        inicio: '09:00',
        fim: '19:00',
        diasSemana: [1, 2, 3, 4, 5]
      }
    },
    permissoes: ['atender', 'transferir'],
    meta: {
      atendimentosDiarios: 12,
      tempoMaximoResposta: 15,
      avaliacaoMinima: 4.0
    }
  },
  {
    id: '3',
    nome: 'Maria Santos',
    email: 'maria.santos@tappyone.com',
    telefone: '+5511765432109',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    cargo: 'atendente',
    departamento: 'Suporte',
    status: 'ocupado',
    statusAtendimento: 'finalizando',
    criadoEm: new Date('2024-03-10'),
    ultimoLogin: new Date(Date.now() - 2 * 60 * 1000),
    estatisticas: {
      atendimentosHoje: 15,
      atendimentosTotal: 654,
      tempoMedioAtendimento: 6.8,
      avaliacaoMedia: 4.9,
      ticketsResolvidos: 598,
      ticketsPendentes: 1
    },
    atendimentoAtual: {
      id: 'ticket-002',
      cliente: 'Empresa ABC Ltda',
      iniciadoEm: new Date(Date.now() - 45 * 60 * 1000),
      canal: 'email',
      assunto: 'Configuração de webhook',
      prioridade: 'media'
    },
    configuracoes: {
      notificacoes: true,
      autoAssign: false,
      maxAtendimentosSimultaneos: 4,
      horarioTrabalho: {
        inicio: '08:30',
        fim: '17:30',
        diasSemana: [1, 2, 3, 4, 5]
      }
    },
    permissoes: ['atender', 'transferir'],
    meta: {
      atendimentosDiarios: 18,
      tempoMaximoResposta: 8,
      avaliacaoMinima: 4.7
    }
  },
  {
    id: '4',
    nome: 'Pedro Costa',
    email: 'pedro.costa@tappyone.com',
    telefone: '+5511654321098',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cargo: 'atendente',
    departamento: 'Suporte',
    status: 'ausente',
    statusAtendimento: 'em_pausa',
    criadoEm: new Date('2024-01-30'),
    ultimoLogin: new Date(Date.now() - 20 * 60 * 1000),
    estatisticas: {
      atendimentosHoje: 6,
      atendimentosTotal: 1234,
      tempoMedioAtendimento: 9.2,
      avaliacaoMedia: 4.4,
      ticketsResolvidos: 1100,
      ticketsPendentes: 4
    },
    configuracoes: {
      notificacoes: false,
      autoAssign: true,
      maxAtendimentosSimultaneos: 3,
      horarioTrabalho: {
        inicio: '08:00',
        fim: '17:00',
        diasSemana: [1, 2, 3, 4, 5]
      }
    },
    permissoes: ['atender'],
    meta: {
      atendimentosDiarios: 10,
      tempoMaximoResposta: 12,
      avaliacaoMinima: 4.0
    }
  },
  {
    id: '5',
    nome: 'Juliana Lima',
    email: 'juliana.lima@tappyone.com',
    telefone: '+5511543210987',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    cargo: 'gerente',
    departamento: 'Geral',
    status: 'offline',
    statusAtendimento: 'disponivel',
    criadoEm: new Date('2023-12-01'),
    ultimoLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estatisticas: {
      atendimentosHoje: 0,
      atendimentosTotal: 2156,
      tempoMedioAtendimento: 7.1,
      avaliacaoMedia: 4.7,
      ticketsResolvidos: 1980,
      ticketsPendentes: 0
    },
    configuracoes: {
      notificacoes: true,
      autoAssign: false,
      maxAtendimentosSimultaneos: 8,
      horarioTrabalho: {
        inicio: '07:00',
        fim: '19:00',
        diasSemana: [1, 2, 3, 4, 5, 6]
      }
    },
    permissoes: ['atender', 'transferir', 'escalar', 'relatorios', 'gerenciar', 'configurar'],
    meta: {
      atendimentosDiarios: 20,
      tempoMaximoResposta: 5,
      avaliacaoMinima: 4.5
    }
  }
]

export default function AtendentesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [atendentes, setAtendentes] = useState<Atendente[]>(mockAtendentes)
  const [filteredAtendentes, setFilteredAtendentes] = useState<Atendente[]>(mockAtendentes)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    statusAtendimento: 'todos',
    departamento: 'todos',
    cargo: 'todos'
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    let filtered = atendentes

    if (filters.search) {
      filtered = filtered.filter(atendente => 
        atendente.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        atendente.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        atendente.departamento.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.status !== 'todos') {
      filtered = filtered.filter(atendente => atendente.status === filters.status)
    }

    if (filters.statusAtendimento !== 'todos') {
      filtered = filtered.filter(atendente => atendente.statusAtendimento === filters.statusAtendimento)
    }

    if (filters.departamento !== 'todos') {
      filtered = filtered.filter(atendente => atendente.departamento === filters.departamento)
    }

    if (filters.cargo !== 'todos') {
      filtered = filtered.filter(atendente => atendente.cargo === filters.cargo)
    }

    setFilteredAtendentes(filtered)
  }, [atendentes, filters])

  const handleCreateAtendente = (atendenteData: Omit<Atendente, 'id' | 'criadoEm' | 'ultimoLogin' | 'estatisticas'>) => {
    const novoAtendente: Atendente = {
      ...atendenteData,
      id: Date.now().toString(),
      criadoEm: new Date(),
      ultimoLogin: new Date(),
      estatisticas: {
        atendimentosHoje: 0,
        atendimentosTotal: 0,
        tempoMedioAtendimento: 0,
        avaliacaoMedia: 0,
        ticketsResolvidos: 0,
        ticketsPendentes: 0
      }
    }

    setAtendentes(prev => [novoAtendente, ...prev])
    setShowCreateModal(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#305e73]"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AtendentesHeader onCreateClick={() => setShowCreateModal(true)} />
        <AtendentesStats atendentes={atendentes} />
        <AtendentesFilters 
          filters={filters}
          onFiltersChange={setFilters}
          atendentes={atendentes}
        />
        <AtendentesList 
          atendentes={filteredAtendentes}
          onUpdateAtendente={(id, updates) => {
            setAtendentes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
          }}
        />
      </div>

      {showCreateModal && (
        <CriarAtendenteModal
          onClose={() => setShowCreateModal(false)}
          onCreateAtendente={handleCreateAtendente}
        />
      )}
    </AdminLayout>
  )
}
