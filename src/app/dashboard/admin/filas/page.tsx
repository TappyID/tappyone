'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import FilasHeader from './components/FilasHeader'
import FilasStats from './components/FilasStats'
import FilasFilters from './components/FilasFilters'
import FilasList from './components/FilasList'
import CriarFilaModal from './components/CriarFilaModal'

export interface Fila {
  id: string
  nome: string
  descricao: string
  cor: string
  ordenacao: number
  ativa: boolean
  criadaEm: Date
  atualizadaEm: Date
  regras: {
    chatBot: boolean
    kanban: boolean
    atendentes: string[]
    whatsappChats: boolean
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  }
  estatisticas: {
    totalConversas: number
    conversasAtivas: number
    tempoMedioResposta: number
    satisfacao: number
  }
}

// Mock data para filas
const mockFilas: Fila[] = [
  {
    id: '1',
    nome: 'Suporte Técnico',
    descricao: 'Fila para atendimentos de suporte técnico e resolução de problemas',
    cor: '#3B82F6',
    ordenacao: 1,
    ativa: true,
    criadaEm: new Date('2024-01-15'),
    atualizadaEm: new Date('2024-01-20'),
    regras: {
      chatBot: true,
      kanban: true,
      atendentes: ['atendente1', 'atendente2'],
      whatsappChats: true,
      prioridade: 'alta'
    },
    estatisticas: {
      totalConversas: 1250,
      conversasAtivas: 23,
      tempoMedioResposta: 4.5,
      satisfacao: 4.2
    }
  },
  {
    id: '2',
    nome: 'Vendas Premium',
    descricao: 'Fila especializada para leads qualificados e vendas de alto valor',
    cor: '#10B981',
    ordenacao: 2,
    ativa: true,
    criadaEm: new Date('2024-01-10'),
    atualizadaEm: new Date('2024-01-22'),
    regras: {
      chatBot: false,
      kanban: true,
      atendentes: ['vendedor1', 'vendedor2', 'gerente1'],
      whatsappChats: true,
      prioridade: 'urgente'
    },
    estatisticas: {
      totalConversas: 890,
      conversasAtivas: 15,
      tempoMedioResposta: 2.1,
      satisfacao: 4.8
    }
  },
  {
    id: '3',
    nome: 'Atendimento Geral',
    descricao: 'Fila padrão para atendimentos gerais e dúvidas básicas',
    cor: '#8B5CF6',
    ordenacao: 3,
    ativa: true,
    criadaEm: new Date('2024-01-05'),
    atualizadaEm: new Date('2024-01-18'),
    regras: {
      chatBot: true,
      kanban: false,
      atendentes: ['atendente3', 'atendente4', 'atendente5'],
      whatsappChats: true,
      prioridade: 'media'
    },
    estatisticas: {
      totalConversas: 2100,
      conversasAtivas: 45,
      tempoMedioResposta: 8.2,
      satisfacao: 3.9
    }
  }
]

export default function FilasPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [filas, setFilas] = useState<Fila[]>(mockFilas)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'todas' | 'ativas' | 'inativas'>('todas')
  const [filterPrioridade, setFilterPrioridade] = useState<string>('')
  const [filterIntegracao, setFilterIntegracao] = useState<string>('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const filteredFilas = filas.filter(fila => {
    const matchesSearch = fila.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fila.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todas' || 
                         (filterStatus === 'ativas' && fila.ativa) ||
                         (filterStatus === 'inativas' && !fila.ativa)
    const matchesPrioridade = !filterPrioridade || fila.regras.prioridade === filterPrioridade
    const matchesIntegracao = !filterIntegracao || 
                             (filterIntegracao === 'chatbot' && fila.regras.chatBot) ||
                             (filterIntegracao === 'kanban' && fila.regras.kanban) ||
                             (filterIntegracao === 'whatsapp' && fila.regras.whatsappChats)
    
    return matchesSearch && matchesStatus && matchesPrioridade && matchesIntegracao
  })

  const handleCreateFila = (novaFila: Omit<Fila, 'id' | 'criadaEm' | 'atualizadaEm' | 'estatisticas'>) => {
    const fila: Fila = {
      ...novaFila,
      id: Date.now().toString(),
      criadaEm: new Date(),
      atualizadaEm: new Date(),
      estatisticas: {
        totalConversas: 0,
        conversasAtivas: 0,
        tempoMedioResposta: 0,
        satisfacao: 0
      }
    }
    setFilas(prev => [...prev, fila])
    setShowCreateModal(false)
  }

  const handleUpdateFila = (id: string, updates: Partial<Fila>) => {
    setFilas(prev => prev.map(fila => 
      fila.id === id 
        ? { ...fila, ...updates, atualizadaEm: new Date() }
        : fila
    ))
  }

  const handleDeleteFila = (id: string) => {
    setFilas(prev => prev.filter(fila => fila.id !== id))
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <FilasHeader onCreateFila={() => setShowCreateModal(true)} />
        
        <FilasStats filas={filas} />
        
        <FilasFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPrioridade={filterPrioridade}
          setFilterPrioridade={setFilterPrioridade}
          filterIntegracao={filterIntegracao}
          setFilterIntegracao={setFilterIntegracao}
        />
        
        <FilasList
          filas={filteredFilas}
          onUpdateFila={handleUpdateFila}
          onDeleteFila={handleDeleteFila}
        />

        {showCreateModal && (
          <CriarFilaModal
            onClose={() => setShowCreateModal(false)}
            onCreateFila={handleCreateFila}
          />
        )}
      </div>
    </AdminLayout>
  )
}
