'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import AlertasHeader from './components/AlertasHeader'
import AlertasStats from './components/AlertasStats'
import AlertasFilters from './components/AlertasFilters'
import AlertasList from './components/AlertasList'
import CriarAlertaModal from './components/CriarAlertaModal'

export interface Alerta {
  id: string
  titulo: string
  descricao: string
  tipo: 'sistema' | 'usuario' | 'seguranca' | 'performance' | 'integracao'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'ativo' | 'pausado' | 'resolvido'
  cor: string
  icone: string
  criadoEm: Date
  atualizadoEm: Date
  configuracoes: {
    emailNotificacao: boolean
    whatsappNotificacao: boolean
    dashboardNotificacao: boolean
    frequencia: 'imediata' | 'horaria' | 'diaria' | 'semanal'
    destinatarios: string[]
    condicoes: {
      metrica: string
      operador: '>' | '<' | '=' | '>=' | '<=' | '!='
      valor: number | string
    }[]
  }
  estatisticas: {
    totalDisparos: number
    disparosHoje: number
    ultimoDisparo: Date | null
    taxaResolucao: number
  }
}

// Mock data para alertas
const mockAlertas: Alerta[] = [
  {
    id: '1',
    titulo: 'Tempo de Resposta Alto',
    descricao: 'Alerta quando o tempo médio de resposta excede 5 minutos',
    tipo: 'performance',
    prioridade: 'alta',
    status: 'ativo',
    cor: '#EF4444',
    icone: 'Clock',
    criadoEm: new Date('2024-01-15'),
    atualizadoEm: new Date('2024-01-20'),
    configuracoes: {
      emailNotificacao: true,
      whatsappNotificacao: false,
      dashboardNotificacao: true,
      frequencia: 'imediata',
      destinatarios: ['admin@tappyone.com', 'suporte@tappyone.com'],
      condicoes: [
        {
          metrica: 'tempo_resposta_medio',
          operador: '>',
          valor: 300
        }
      ]
    },
    estatisticas: {
      totalDisparos: 45,
      disparosHoje: 3,
      ultimoDisparo: new Date('2024-01-22T14:30:00'),
      taxaResolucao: 87.5
    }
  },
  {
    id: '2',
    titulo: 'Falha na Integração WhatsApp',
    descricao: 'Monitora falhas de conexão com a API do WhatsApp',
    tipo: 'integracao',
    prioridade: 'critica',
    status: 'ativo',
    cor: '#DC2626',
    icone: 'AlertTriangle',
    criadoEm: new Date('2024-01-10'),
    atualizadoEm: new Date('2024-01-22'),
    configuracoes: {
      emailNotificacao: true,
      whatsappNotificacao: true,
      dashboardNotificacao: true,
      frequencia: 'imediata',
      destinatarios: ['admin@tappyone.com', 'dev@tappyone.com'],
      condicoes: [
        {
          metrica: 'whatsapp_status',
          operador: '=',
          valor: 'disconnected'
        }
      ]
    },
    estatisticas: {
      totalDisparos: 12,
      disparosHoje: 0,
      ultimoDisparo: new Date('2024-01-20T09:15:00'),
      taxaResolucao: 100
    }
  },
  {
    id: '3',
    titulo: 'Muitas Conversas Pendentes',
    descricao: 'Alerta quando há mais de 50 conversas aguardando atendimento',
    tipo: 'usuario',
    prioridade: 'media',
    status: 'ativo',
    cor: '#F59E0B',
    icone: 'MessageSquare',
    criadoEm: new Date('2024-01-05'),
    atualizadoEm: new Date('2024-01-18'),
    configuracoes: {
      emailNotificacao: true,
      whatsappNotificacao: false,
      dashboardNotificacao: true,
      frequencia: 'horaria',
      destinatarios: ['gerente@tappyone.com'],
      condicoes: [
        {
          metrica: 'conversas_pendentes',
          operador: '>',
          valor: 50
        }
      ]
    },
    estatisticas: {
      totalDisparos: 89,
      disparosHoje: 5,
      ultimoDisparo: new Date('2024-01-22T16:45:00'),
      taxaResolucao: 92.1
    }
  },
  {
    id: '4',
    titulo: 'Login Suspeito Detectado',
    descricao: 'Alerta para tentativas de login de localizações não usuais',
    tipo: 'seguranca',
    prioridade: 'alta',
    status: 'pausado',
    cor: '#8B5CF6',
    icone: 'Shield',
    criadoEm: new Date('2024-01-12'),
    atualizadoEm: new Date('2024-01-21'),
    configuracoes: {
      emailNotificacao: true,
      whatsappNotificacao: true,
      dashboardNotificacao: true,
      frequencia: 'imediata',
      destinatarios: ['security@tappyone.com', 'admin@tappyone.com'],
      condicoes: [
        {
          metrica: 'login_location_unusual',
          operador: '=',
          valor: 'true'
        }
      ]
    },
    estatisticas: {
      totalDisparos: 7,
      disparosHoje: 0,
      ultimoDisparo: new Date('2024-01-19T22:10:00'),
      taxaResolucao: 85.7
    }
  },
  {
    id: '5',
    titulo: 'Uso de CPU Alto',
    descricao: 'Monitora quando o uso de CPU do servidor excede 85%',
    tipo: 'sistema',
    prioridade: 'media',
    status: 'ativo',
    cor: '#10B981',
    icone: 'Cpu',
    criadoEm: new Date('2024-01-08'),
    atualizadoEm: new Date('2024-01-20'),
    configuracoes: {
      emailNotificacao: false,
      whatsappNotificacao: false,
      dashboardNotificacao: true,
      frequencia: 'imediata',
      destinatarios: ['devops@tappyone.com'],
      condicoes: [
        {
          metrica: 'cpu_usage',
          operador: '>',
          valor: 85
        }
      ]
    },
    estatisticas: {
      totalDisparos: 23,
      disparosHoje: 1,
      ultimoDisparo: new Date('2024-01-22T11:20:00'),
      taxaResolucao: 95.7
    }
  }
]

export default function AlertasPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'pausado' | 'resolvido'>('todos')
  const [filterTipo, setFilterTipo] = useState<string>('')
  const [filterPrioridade, setFilterPrioridade] = useState<string>('')

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

  const filteredAlertas = alertas.filter(alerta => {
    const matchesSearch = alerta.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alerta.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || alerta.status === filterStatus
    const matchesTipo = !filterTipo || alerta.tipo === filterTipo
    const matchesPrioridade = !filterPrioridade || alerta.prioridade === filterPrioridade
    
    return matchesSearch && matchesStatus && matchesTipo && matchesPrioridade
  })

  const handleCreateAlerta = (novoAlerta: Omit<Alerta, 'id' | 'criadoEm' | 'atualizadoEm' | 'estatisticas'>) => {
    const alerta: Alerta = {
      ...novoAlerta,
      id: Date.now().toString(),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      estatisticas: {
        totalDisparos: 0,
        disparosHoje: 0,
        ultimoDisparo: null,
        taxaResolucao: 0
      }
    }
    setAlertas(prev => [...prev, alerta])
    setShowCreateModal(false)
  }

  const handleUpdateAlerta = (id: string, updates: Partial<Alerta>) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === id 
        ? { ...alerta, ...updates, atualizadoEm: new Date() }
        : alerta
    ))
  }

  const handleDeleteAlerta = (id: string) => {
    setAlertas(prev => prev.filter(alerta => alerta.id !== id))
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <AlertasHeader onCreateAlerta={() => setShowCreateModal(true)} />
        
        <AlertasStats alertas={alertas} />
        
        <AlertasFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterTipo={filterTipo}
          setFilterTipo={setFilterTipo}
          filterPrioridade={filterPrioridade}
          setFilterPrioridade={setFilterPrioridade}
        />
        
        <AlertasList
          alertas={filteredAlertas}
          onUpdateAlerta={handleUpdateAlerta}
          onDeleteAlerta={handleDeleteAlerta}
        />

        {showCreateModal && (
          <CriarAlertaModal
            onClose={() => setShowCreateModal(false)}
            onCreateAlerta={handleCreateAlerta}
          />
        )}
      </div>
    </AdminLayout>
  )
}
