'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { AdminLayout } from '../components/AdminLayout'
import { DisparosStats } from './components/DisparosStats'
import { DisparosList } from './components/DisparosList'
import { CriarDisparoModal } from './components/CriarDisparoModal'
import { Plus, RefreshCw } from 'lucide-react'

interface Campanha {
  id: string
  nome: string
  descricao?: string
  tipoMensagem: 'texto' | 'audio' | 'imagem' | 'video'
  conteudoMensagem: string
  status: 'rascunho' | 'agendado' | 'enviando' | 'concluido' | 'cancelado' | 'pausado'
  totalContatos: number
  enviadosComSucesso: number
  falhasEnvio: number
  agendadoPara?: string
  createdAt: string
  geradoPorIa: boolean
}

export default function DisparosPage() {
  const { theme } = useTheme()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Stats
  const [totalCampanhas, setTotalCampanhas] = useState(0)
  const [campanhasAtivas, setCampanhasAtivas] = useState(0)
  const [campanhasAgendadas, setCampanhasAgendadas] = useState(0)
  const [campanhasConcluidas, setCampanhasConcluidas] = useState(0)
  const [campanhasCanceladas, setCampanhasCanceladas] = useState(0)
  const [mensagensEnviadas, setMensagensEnviadas] = useState(0)

  useEffect(() => {
    fetchCampanhas()
  }, [])

  const fetchCampanhas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/disparos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const camps = data.campanhas || []
        setCampanhas(camps)

        // Calcular stats
        setTotalCampanhas(camps.length)
        setCampanhasAtivas(camps.filter((c: Campanha) => c.status === 'enviando').length)
        setCampanhasAgendadas(camps.filter((c: Campanha) => c.status === 'agendado').length)
        setCampanhasConcluidas(camps.filter((c: Campanha) => c.status === 'concluido').length)
        setCampanhasCanceladas(camps.filter((c: Campanha) => c.status === 'cancelado').length)
        
        const totalEnviadas = camps.reduce((sum: number, c: Campanha) => sum + c.enviadosComSucesso, 0)
        setMensagensEnviadas(totalEnviadas)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar campanhas:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCampanhas()
  }

  const handleDisparar = async (id: string) => {
    if (!confirm('Deseja iniciar o disparo desta campanha?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/disparos/${id}/disparar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Campanha iniciada com sucesso!')
        fetchCampanhas()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao disparar campanha:', error)
      alert('Erro ao disparar campanha')
    }
  }

  const handlePausar = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/disparos/${id}/pausar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Campanha pausada!')
        fetchCampanhas()
      }
    } catch (error) {
      console.error('Erro ao pausar campanha:', error)
      alert('Erro ao pausar campanha')
    }
  }

  const handleCancelar = async (id: string) => {
    if (!confirm('Deseja cancelar esta campanha?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/disparos/${id}/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Campanha cancelada!')
        fetchCampanhas()
      }
    } catch (error) {
      console.error('Erro ao cancelar campanha:', error)
      alert('Erro ao cancelar campanha')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta campanha? Esta ação não pode ser desfeita.')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/disparos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Campanha deletada!')
        fetchCampanhas()
      }
    } catch (error) {
      console.error('Erro ao deletar campanha:', error)
      alert('Erro ao deletar campanha')
    }
  }

  const handleEdit = (campanha: Campanha) => {
    // TODO: Implementar modal de edição
    alert('Em desenvolvimento: Editar campanha')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Disparos em Massa
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gerencie suas campanhas de disparo WhatsApp
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/30"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nova Campanha</span>
            </button>
          </motion.div>
        </div>

        {/* Stats */}
        <DisparosStats
          totalCampanhas={totalCampanhas}
          campanhasAtivas={campanhasAtivas}
          campanhasAgendadas={campanhasAgendadas}
          campanhasConcluidas={campanhasConcluidas}
          campanhasCanceladas={campanhasCanceladas}
          mensagensEnviadas={mensagensEnviadas}
          loading={loading}
        />

        {/* Lista de Campanhas */}
        <DisparosList
          campanhas={campanhas}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDisparar={handleDisparar}
          onPausar={handlePausar}
          onCancelar={handleCancelar}
        />

        {/* Modal Criar Campanha */}
        <CriarDisparoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchCampanhas}
        />
      </div>
    </AdminLayout>
  )
}
