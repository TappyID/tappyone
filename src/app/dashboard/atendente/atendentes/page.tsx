'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAtendentes, type AtendenteComStats } from '@/hooks/useAtendentes'
import AdminLayout from '../components/AdminLayout'
import AtendentesHeader from './components/AtendentesHeader'
import AtendentesStats from './components/AtendentesStats'
import AtendentesFilters from './components/AtendentesFilters'
import AtendentesList from './components/AtendentesListSimplified'
import CriarAtendenteModal from './components/CriarAtendenteModalSimplified'
import EditarAtendenteModal from './components/EditarAtendenteModal'
import VisualizarAtendenteModal from './components/VisualizarAtendenteModal'
import AtribuirFilaModal from './components/AtribuirFilaModal'

// Interface movida para useAtendentes hook

// Mock data removido - usando dados reais via API

export default function AtendentesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showAtribuirFilaModal, setShowAtribuirFilaModal] = useState(false)
  const [selectedAtendente, setSelectedAtendente] = useState<AtendenteComStats | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    tipo: 'atendente'
  })

  // Usar hook real para dados de atendentes
  const { 
    atendentes, 
    loading, 
    error, 
    createAtendente, 
    updateAtendente,
    deleteAtendente
  } = useAtendentes(filters)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // Filtros agora são aplicados diretamente no hook useAtendentes

  const handleCreateAtendente = async (atendenteData: any) => {
    try {
      await createAtendente({
        nome: atendenteData.nome,
        email: atendenteData.email,
        telefone: atendenteData.telefone,
        tipo: atendenteData.tipo,
        senha: atendenteData.senha
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Erro ao criar atendente:', error)
      // TODO: Mostrar toast de erro
    }
  }

  const handleUpdateAtendente = async (id: string, updates: Partial<AtendenteComStats>) => {
    try {
      await updateAtendente(id, updates)
    } catch (error) {
      console.error('Erro ao atualizar atendente:', error)
      // TODO: Mostrar toast de erro
    }
  }

  const handleExportAtendentes = () => {
    try {
      // Preparar dados para exportação
      const exportData = atendentes.map(atendente => ({
        'Nome': atendente.nome,
        'Email': atendente.email,
        'Telefone': atendente.telefone || 'N/A',
        'Tipo': atendente.tipo,
        'Status': atendente.ativo ? 'Ativo' : 'Inativo',
        'Conversas Ativas': atendente.estatisticas?.conversasAtivas || 0,
        'Total Conversas': atendente.estatisticas?.totalConversas || 0,
        'Em Andamento': atendente.estatisticas?.emAndamento || 0,
        'Concluídas': atendente.estatisticas?.concluidas || 0,
        'Tickets Resolvidos': atendente.estatisticas?.ticketsResolvidos || 0,
        'Tickets Pendentes': atendente.estatisticas?.ticketsPendentes || 0,
        'Criado em': new Date(atendente.criadoEm).toLocaleDateString('pt-BR'),
        'Atualizado em': new Date(atendente.atualizadoEm).toLocaleDateString('pt-BR')
      }))

      // Converter para CSV
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${(row as any)[header] || ''}"`).join(',')
        )
      ].join('\n')

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `atendentes_${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      // TODO: Mostrar toast de sucesso
      console.log('Atendentes exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar atendentes:', error)
      // TODO: Mostrar toast de erro
    }
  }

  const handleViewAtendente = (atendente: AtendenteComStats) => {
    setSelectedAtendente(atendente)
    setShowViewModal(true)
  }

  const handleEditAtendente = (atendente: AtendenteComStats) => {
    setSelectedAtendente(atendente)
    setShowEditModal(true)
  }

  const handleDeleteAtendente = async (atendente: AtendenteComStats) => {
    await deleteAtendente(atendente.id)
  }

  const handleAtribuirFila = (atendente: AtendenteComStats) => {
    setSelectedAtendente(atendente)
    setShowAtribuirFilaModal(true)
  }

  const handleAtribuirFilaSubmit = async (atendenteId: string, filaId: string) => {
    try {
      // Simular API call - aqui integraria com o backend
      console.log(`Atribuindo atendente ${atendenteId} à fila ${filaId}`)
      
      // Aqui faria a chamada real para o backend
      // await assignAtendenteToFila(atendenteId, filaId)
      
      // Mostrar feedback de sucesso (pode implementar toast/notification)
      alert('Atendente atribuído à fila com sucesso!')
      
    } catch (error) {
      console.error('Erro ao atribuir à fila:', error)
      throw error
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#305e73]"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Erro ao carregar atendentes: {error}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AtendentesHeader 
          onCreateClick={() => setShowCreateModal(true)}
          onExportClick={handleExportAtendentes}
        />
        <AtendentesStats atendentes={atendentes} />
        <AtendentesFilters 
          filters={filters}
          onFiltersChange={setFilters}
          atendentes={atendentes}
        />
        <AtendentesList
          atendentes={atendentes}
          onUpdateAtendente={updateAtendente}
          onViewAtendente={handleViewAtendente}
          onEditAtendente={handleEditAtendente}
          onDeleteAtendente={handleDeleteAtendente}
          onAtribuirFila={handleAtribuirFila}
        />
      </div>

      {showCreateModal && (
        <CriarAtendenteModal
          onClose={() => setShowCreateModal(false)}
          onCreateAtendente={handleCreateAtendente}
        />
      )}

      {showEditModal && selectedAtendente && (
        <EditarAtendenteModal
          atendente={selectedAtendente}
          onClose={() => {
            setShowEditModal(false)
            setSelectedAtendente(null)
          }}
          onUpdateAtendente={updateAtendente}
        />
      )}

      {showViewModal && selectedAtendente && (
        <VisualizarAtendenteModal
          atendente={selectedAtendente}
          onClose={() => {
            setShowViewModal(false)
            setSelectedAtendente(null)
          }}
          onEditAtendente={handleEditAtendente}
        />
      )}

      {showAtribuirFilaModal && selectedAtendente && (
        <AtribuirFilaModal
          atendente={selectedAtendente}
          isOpen={showAtribuirFilaModal}
          onClose={() => {
            setShowAtribuirFilaModal(false)
            setSelectedAtendente(null)
          }}
          onAtribuirFila={handleAtribuirFilaSubmit}
        />
      )}
    </AdminLayout>
  )
}
