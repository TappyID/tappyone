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
      console.log('📋 [FETCH] Buscando filas...')
      
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📋 [FETCH] Dados recebidos:', data)
        
        const lista = (Array.isArray(data.data) ? data.data : [])
          .filter((fila: any) => {
            // Filtrar apenas filas válidas e ativas
            const isValid = fila && 
                           fila.id && 
                           fila.status !== 'inactive' && 
                           fila.status !== 'deleted' && 
                           fila.ativo !== false && 
                           !fila.deletedAt
            
            if (!isValid) {
              console.log('🚫 [FETCH] Fila filtrada:', fila?.id, fila?.nome)
            }
            
            return isValid
          })
        
        console.log('✅ [FETCH] Filas válidas encontradas:', lista.length)
        setFilas(lista)
      } else {
        const errorData = await response.json()
        console.error('❌ [FETCH] Erro ao buscar filas:', response.status, errorData)
      }
    } catch (error) {
      console.error('❌ [FETCH] Erro na requisição:', error)
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
      console.log('➕ [CREATE] Criando nova fila:', novaFila)
      
      const response = await fetch('/api/filas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaFila)
      })

      if (response.ok) {
        const filaCreated = await response.json()
        console.log('✅ [CREATE] Fila criada com sucesso:', filaCreated)
        
        // Fechar modal primeiro
        setShowCreateModal(false)
        
        // Recarregar lista para garantir dados completos
        await fetchFilas()
        
        console.log('🔄 [CREATE] Lista recarregada após criação')
      } else {
        const errorData = await response.json()
        console.error('❌ [CREATE] Erro ao criar fila:', response.status, errorData)
      }
    } catch (error) {
      console.error('❌ [CREATE] Erro na requisição:', error)
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
        await fetchFilas()
        setEditingFila(null)
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
      console.log('🗑️ [DELETE] Iniciando exclusão da fila:', id)
      
      // Remover imediatamente do estado local (otimistic update)
      setFilas(prev => prev.filter(fila => fila.id !== id))
      
      const response = await fetch(`/api/filas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        console.log('✅ [DELETE] Fila excluída com sucesso')
        // Recarregar para garantir sincronização
        await fetchFilas()
      } else {
        console.error('❌ [DELETE] Erro ao deletar fila:', response.status)
        // Reverter mudança otimista em caso de erro
        await fetchFilas()
      }
    } catch (error) {
      console.error('❌ [DELETE] Erro na requisição:', error)
      // Reverter mudança otimista em caso de erro
      await fetchFilas()
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
