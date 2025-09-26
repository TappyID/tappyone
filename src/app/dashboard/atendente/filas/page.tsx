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
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  chatBot: boolean
  kanban: boolean
  whatsappChats: boolean
  criadoEm: string
  atualizadoEm: string
  atendentes?: Array<{
    id: string
    filaId: string
    usuarioId: string
    usuario: {
      id: string
      nome: string
      email: string
    }
  }>
  estatisticas?: {
    totalConversas: number
    conversasAtivas: number
    tempoMedioResposta: number
    satisfacao: number
  }
}

// Mock data será substituído por dados reais do backend
const mockFilas: Fila[] = []

export default function FilasPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [filas, setFilas] = useState<Fila[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFila, setEditingFila] = useState<Fila | null>(null)
  const [filterStatus, setFilterStatus] = useState<'todas' | 'ativas' | 'inativas'>('todas')
  const [filterPrioridade, setFilterPrioridade] = useState<string>('')
  const [filterIntegracao, setFilterIntegracao] = useState<string>('')

  const fetchFilas = async () => {
    try {
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFilas(Array.isArray(data.data) ? data.data : [])
      } else {
        console.error('Erro ao buscar filas:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar filas:', error)
    }
  }

  useEffect(() => {
    if (loading) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Buscar filas quando autenticado
    fetchFilas()
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

  const filteredFilas = (Array.isArray(filas) ? filas : []).filter(fila => {
    const matchesSearch = (fila.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (fila.descricao || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todas' || 
                         (filterStatus === 'ativas' && fila.ativa) ||
                         (filterStatus === 'inativas' && !fila.ativa)
    const matchesPrioridade = !filterPrioridade || fila.prioridade === filterPrioridade
    const matchesIntegracao = !filterIntegracao || 
                             (filterIntegracao === 'chatbot' && fila.chatBot) ||
                             (filterIntegracao === 'kanban' && fila.kanban) ||
                             (filterIntegracao === 'whatsapp' && fila.whatsappChats)
    
    return matchesSearch && matchesStatus && matchesPrioridade && matchesIntegracao
  })

  const handleCreateFila = async (novaFila: Omit<Fila, 'id' | 'criadoEm' | 'atualizadoEm' | 'estatisticas'>) => {
    try {
      const response = await fetch('/api/filas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaFila)
      })

      if (response.ok) {
        const novaFilaCriada = await response.json()
        setFilas(prev => [...(Array.isArray(prev) ? prev : []), novaFilaCriada])
        setShowCreateModal(false)
      } else {
        console.error('Erro ao criar fila:', response.status)
      }
    } catch (error) {
      console.error('Erro ao criar fila:', error)
    }
  }

  const handleUpdateFila = async (id: string, updates: Partial<Fila>) => {
    try {
      console.log('🔄 [UPDATE] Atualizando fila:', id, updates)
      
      const response = await fetch(`/api/filas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ [UPDATE] Resposta da API:', responseData)
        
        // Verificar se é um objeto direto ou tem wrapper
        const filaAtualizada = responseData.data || responseData
        console.log('✅ [UPDATE] Fila processada:', filaAtualizada)
        
        setFilas(prev => {
          console.log('🔍 [UPDATE] Estado anterior:', prev)
          console.log('🔍 [UPDATE] Fila atualizada a ser inserida:', filaAtualizada)
          console.log('🔍 [UPDATE] ID da fila (parâmetro):', id, 'tipo:', typeof id)
          
          const novasFilas = prev.map(fila => {
            console.log('🔍 [UPDATE] Comparando:', fila.id, 'tipo:', typeof fila.id, 'com:', id, 'tipo:', typeof id)
            if (fila.id === id || fila.id === String(id) || String(fila.id) === String(id)) {
              console.log('🔍 [UPDATE] ✅ Match! Substituindo fila:', fila.id, 'por:', filaAtualizada)
              return filaAtualizada
            }
            return fila
          })
          console.log('✅ [UPDATE] Estado final:', novasFilas)
          return novasFilas
        })
      } else {
        const errorData = await response.json()
        console.error('❌ [UPDATE] Erro ao atualizar fila:', response.status, errorData)
      }
    } catch (error) {
      console.error('❌ [UPDATE] Erro na requisição:', error)
    }
  }

  const handleDeleteFila = async (id: string) => {
    try {
      const response = await fetch(`/api/filas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setFilas(prev => prev.filter(fila => fila.id !== id))
      } else {
        console.error('Erro ao deletar fila:', response.status)
      }
    } catch (error) {
      console.error('Erro ao deletar fila:', error)
    }
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
          onEditFila={setEditingFila}
        />

        {showCreateModal && (
          <CriarFilaModal
            onClose={() => setShowCreateModal(false)}
            onCreateFila={handleCreateFila}
          />
        )}

        {editingFila && (
          <CriarFilaModal
            fila={editingFila}
            onClose={() => setEditingFila(null)}
            onCreateFila={(filaData) => {
              handleUpdateFila(editingFila.id, filaData)
              setEditingFila(null)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
