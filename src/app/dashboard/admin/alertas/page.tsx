'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useAlertas, Alerta as AlertaInterface } from '@/hooks/useAlertas'
import AlertasHeader from './components/AlertasHeader'
import AlertasStats from './components/AlertasStats'
import AlertasFilters from './components/AlertasFilters'
import AlertasList from './components/AlertasList'
import CriarAlertaModal from './components/CriarAlertaModal'

// Using Alerta interface from useAlertas hook
export type Alerta = AlertaInterface

export default function AlertasPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { 
    alertas, 
    loading: alertasLoading, 
    error, 
    fetchAlertas, 
    createAlerta, 
    updateAlerta, 
    deleteAlerta, 
    toggleStatus 
  } = useAlertas()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'pausado' | 'resolvido'>('todos')
  const [filterTipo, setFilterTipo] = useState<string>('')
  const [filterPrioridade, setFilterPrioridade] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || alertasLoading) {
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">❌ Erro ao carregar alertas: {error}</div>
        <button 
          onClick={fetchAlertas}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const filteredAlertas = Array.isArray(alertas) ? alertas.filter(alerta => {
    const matchesSearch = alerta.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alerta.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || alerta.status === filterStatus
    const matchesTipo = !filterTipo || alerta.tipo === filterTipo
    const matchesPrioridade = !filterPrioridade || alerta.prioridade === filterPrioridade
    
    return matchesSearch && matchesStatus && matchesTipo && matchesPrioridade
  }) : []

  const handleCreateAlerta = async (novoAlerta: Omit<Alerta, 'id' | 'criadoEm' | 'atualizadoEm' | 'estatisticas'>) => {
    try {
      await createAlerta(novoAlerta)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Erro ao criar alerta:', error)
    }
  }

  const handleUpdateAlerta = async (id: string, updates: Partial<Alerta>) => {
    try {
      await updateAlerta(id, updates)
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error)
    }
  }

  const handleDeleteAlerta = async (id: string) => {
    try {
      await deleteAlerta(id)
    } catch (error) {
      console.error('Erro ao deletar alerta:', error)
    }
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
