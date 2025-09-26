'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { AdminLayout } from '../components/AdminLayout'
import { ActiveConnectionsTable } from './components/ActiveConnectionsTable'
import { ViewConnectionModal } from './components/ViewConnectionModal'
import { EditConnectionModal } from './components/EditConnectionModal'
import { NewConnectionModal } from './components/NewConnectionModal'
import { ConnectionStats } from './components/ConnectionStats'
import { Plus, Zap, Link as LinkIcon, Settings, Eye, Edit, RefreshCw } from 'lucide-react'

export default function ConexoesPage() {
  const { theme } = useTheme()
  const [activeConnections, setActiveConnections] = useState(0)
  const [totalConnections, setTotalConnections] = useState(0)
  const [totalChats, setTotalChats] = useState(0)
  const [totalGroups, setTotalGroups] = useState(0)
  const [totalFilas, setTotalFilas] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Estados dos modais
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [newConnectionModalOpen, setNewConnectionModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)

  // Buscar estatísticas dinâmicas
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const token = localStorage.getItem('token')
      console.log('📊 [STATS] Iniciando busca de estatísticas...')
      
      // Buscar filas
      console.log('📊 [STATS] Buscando filas...')
      const filasResponse = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (filasResponse.ok) {
        const filasData = await filasResponse.json()
        const filasCount = filasData.data?.length || 0
        setTotalFilas(filasCount)
        console.log('✅ [STATS] Filas encontradas:', filasCount)
      } else {
        console.log('❌ [STATS] Erro ao buscar filas:', filasResponse.status)
      }
      
      // Buscar chats do WhatsApp
      console.log('📊 [STATS] Buscando chats WhatsApp...')
      const chatsResponse = await fetch('/api/whatsapp/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json()
        const chatsArray = chatsData.data || chatsData || []
        const chatsCount = Array.isArray(chatsArray) ? chatsArray.length : 0
        setTotalChats(chatsCount)
        console.log('✅ [STATS] Chats encontrados:', chatsCount)
      } else {
        console.log('❌ [STATS] Erro ao buscar chats:', chatsResponse.status)
      }
      
      // Buscar grupos do WhatsApp
      console.log('📊 [STATS] Buscando grupos WhatsApp...')
      const groupsResponse = await fetch('/api/whatsapp/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        const groupsArray = groupsData.data || groupsData || []
        const groupsCount = Array.isArray(groupsArray) ? groupsArray.length : 0
        setTotalGroups(groupsCount)
        console.log('✅ [STATS] Grupos encontrados:', groupsCount)
      } else {
        console.log('❌ [STATS] Erro ao buscar grupos:', groupsResponse.status)
      }
      
      // Buscar conexões ativas
      console.log('📊 [STATS] Buscando conexões...')
      const connectionsResponse = await fetch('/api/connections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json()
        const connections = connectionsData.connections || []
        const activeConns = connections.filter((conn: any) => conn.status === 'connected')
        setActiveConnections(activeConns.length)
        setTotalConnections(connections.length)
        console.log('✅ [STATS] Conexões ativas:', activeConns.length, 'de', connections.length)
      } else {
        console.log('❌ [STATS] Erro ao buscar conexões:', connectionsResponse.status)
      }
      
      console.log('✅ [STATS] Estatísticas atualizadas com sucesso!')
      
    } catch (error) {
      console.error('❌ [STATS] Erro ao buscar estatísticas:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Handlers dos modais
  const handleViewConnection = (connection: any) => {
    setSelectedConnection(connection)
    setViewModalOpen(true)
  }

  const handleEditConnection = (connection: any) => {
    setSelectedConnection(connection)
    setEditModalOpen(true)
  }

  const handleCreateConnection = () => {
    setNewConnectionModalOpen(true)
  }

  const handleNewConnectionSuccess = () => {
    // Atualizar lista de conexões após sucesso
    window.location.reload()
  }

  const handleSaveConnectionConfig = async (data: any) => {
    try {
      console.log('💾 [SAVE CONFIG] Salvando configuração:', data)
      console.log('💾 [SAVE CONFIG] Conexão selecionada:', selectedConnection)
      
      if (!selectedConnection?.sessionName) {
        console.error('❌ [SAVE CONFIG] SessionName não encontrado na conexão')
        return
      }

      const token = localStorage.getItem('token')
      // Salvar a modulação da conexão usando a API Next.js que cria a conexão automaticamente
      const connectionResponse = await fetch(`/api/connections/whatsapp/${selectedConnection.sessionName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modulation: {
            selectedFilas: data.selectedFilas || [],
            connectionName: data.connectionName || 'Nova Conexão'
          }
        })
      })

      console.log('📡 [SAVE CONFIG] Connection response status:', connectionResponse.status)
      
      const response = connectionResponse

      console.log('📡 [SAVE CONFIG] Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ [SAVE CONFIG] Configuração salva com sucesso:', result)
        setEditModalOpen(false)
        setSelectedConnection(null)
        
        // Atualizar estatísticas após salvar
        fetchStats()
        
        // TODO: Mostrar toast de sucesso
      } else {
        const error = await response.text()
        console.error('❌ [SAVE CONFIG] Erro do backend:', response.status, error)
      }
    } catch (error) {
      console.error('❌ [SAVE CONFIG] Erro interno:', error)
      // TODO: Mostrar toast de erro
    }
  }

  return (
    <AdminLayout>
      <div className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="p-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-r from-[#273155] to-[#1e2442] rounded-xl shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h1 className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Gerenciar Conexões
                  </h1>
                </div>
                <p className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Configure e gerencie conexões WhatsApp com modulação por filas
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchStats}
                disabled={statsLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                } disabled:opacity-50`}
              >
                <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                {statsLoading ? 'Atualizando...' : 'Atualizar Estatísticas'}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <ConnectionStats 
              activeConnections={activeConnections}
              totalConnections={totalConnections}
              totalChats={totalChats}
              totalGroups={totalGroups}
              totalFilas={totalFilas}
              loading={statsLoading}
            />
          </motion.div>

          {/* Active Connections Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ActiveConnectionsTable
              onViewConnection={handleViewConnection}
              onEditConnection={handleEditConnection}
              onCreateConnection={handleCreateConnection}
            />
          </motion.div>
        </div>

        {/* Modais */}
        <ViewConnectionModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false)
            setSelectedConnection(null)
          }}
          connection={selectedConnection}
        />

        <EditConnectionModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedConnection(null)
          }}
          onSave={handleSaveConnectionConfig}
          connection={selectedConnection}
        />

        <NewConnectionModal
          isOpen={newConnectionModalOpen}
          onClose={() => setNewConnectionModalOpen(false)}
          onSuccess={handleNewConnectionSuccess}
        />
      </div>
    </AdminLayout>
  )
}
