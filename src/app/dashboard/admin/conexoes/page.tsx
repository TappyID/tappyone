'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { AdminLayout } from '../components/AdminLayout'
import { ActiveConnectionsTable } from './components/ActiveConnectionsTable'
import { EditConnectionModal } from './components/EditConnectionModal'
import { NewConnectionModal } from './components/NewConnectionModal'
import { ConnectionStats } from './components/ConnectionStats'
import { Settings, RefreshCw } from 'lucide-react'

export default function ConexoesPage() {
  const { theme } = useTheme()
  const [activeConnections, setActiveConnections] = useState(0)
  const [totalConnections, setTotalConnections] = useState(0)
  const [totalChats, setTotalChats] = useState(0)
  const [totalGroups, setTotalGroups] = useState(0)
  const [totalFilas, setTotalFilas] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)
  const [tableRefreshKey, setTableRefreshKey] = useState(0)
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [newConnectionModalOpen, setNewConnectionModalOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)

  // VERSÃO SIMPLIFICADA - Apenas estatísticas básicas para não travar
  const fetchStats = async () => {
    setStatsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      
      // Buscar apenas filas e conexões (mais rápido)
      const [filasResponse, connectionsResponse] = await Promise.all([
        fetch('/api/filas', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/connections', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      // Processar filas
      let filasCount = 0
      if (filasResponse.ok) {
        const filasData = await filasResponse.json()
        filasCount = filasData.data?.length || 0
      }

      // Processar conexões E somar chats/grupos de todas
      let totalConns = 0
      let activeConns = 0
      let sumChats = 0
      let sumGroups = 0
      
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json()
        const connections = connectionsData.connections || []
        
        totalConns = connections.length
        activeConns = connections.filter((conn: any) => conn.status === 'connected' || conn.status === 'WORKING').length
        
        // 🔥 SOMAR chats e grupos de TODAS as conexões
        connections.forEach((conn: any) => {
          const sessionData = conn.sessionData || conn.session_data
          if (sessionData) {
            const chats = sessionData.total_chats || 0
            const groups = sessionData.total_groups || 0
            sumChats += chats
            sumGroups += groups
          }
        })
      }

      setTotalFilas(filasCount)
      setActiveConnections(activeConns)
      setTotalConnections(totalConns)
      setTotalChats(sumChats)
      setTotalGroups(sumGroups)
      
    } catch (error) {
      console.error('❌ [STATS] Erro ao carregar estatísticas:', error)
      // Fallback values
      setTotalFilas(0)
      setTotalChats(0)
      setTotalGroups(0)
      setActiveConnections(0)
      setTotalConnections(0)
    } finally {
      setStatsLoading(false)
    }
  }

  // Carregar estatísticas na montagem do componente
  useEffect(() => {
    fetchStats()
  }, [])

  // Handlers dos modais
  const handleEditConnection = (connection: any) => {
    console.log('🔧 [EDIT CONNECTION] ==========================================')
    console.log('🔧 [EDIT CONNECTION] Conexão selecionada para edição:', connection)
    console.log('🔧 [EDIT CONNECTION] ID:', connection.id)
    console.log('🔧 [EDIT CONNECTION] SessionName:', connection.sessionName)
    console.log('🔧 [EDIT CONNECTION] Platform:', connection.platform)
    console.log('🔧 [EDIT CONNECTION] Status:', connection.status)
    console.log('🔧 [EDIT CONNECTION] ==========================================')
    
    setSelectedConnection(connection)
    setEditModalOpen(true)
  }

  const handleCreateConnection = () => {
    setNewConnectionModalOpen(true)
  }

  const handleNewConnectionSuccess = () => {
    window.location.reload()
  }

  const handleConnectionDeleted = () => {
    fetchStats()
    setTableRefreshKey(prev => prev + 1)
  }

  const handleDebugConnections = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/debug/filas-por-conexao', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [DEBUG] Estado atual das conexões:')
        console.table(data.connections)
        
        // Verificar se há conflitos de filas
        const filasMap = new Map()
        data.connections.forEach((conn: any) => {
          conn.filas_selecionadas.forEach((filaId: string) => {
            if (!filasMap.has(filaId)) {
              filasMap.set(filaId, [])
            }
            filasMap.get(filaId).push({
              session: conn.session_name,
              name: conn.connection_name
            })
          })
        })
        
        console.log('🔍 [DEBUG] Mapeamento de filas:')
        filasMap.forEach((connections, filaId) => {
          if (connections.length > 1) {
            console.log(`⚠️ [CONFLITO] Fila ${filaId} está em ${connections.length} conexões:`, connections)
          } else {
            console.log(`✅ [OK] Fila ${filaId} está apenas em:`, connections[0])
          }
        })
      }
    } catch (error) {
      console.error('Erro ao buscar debug:', error)
    }
  }

  const handleSaveConnectionConfig = async (data: any) => {
    try {
      console.log('📡 [SAVE CONFIG] ==========================================')
      console.log('📡 [SAVE CONFIG] Tentando salvar configuração para:', selectedConnection?.sessionName)
      console.log('📡 [SAVE CONFIG] Dados a salvar:', data)
      console.log('📡 [SAVE CONFIG] Filas selecionadas:', data.selectedFilas)
      console.log('📡 [SAVE CONFIG] Nome da conexão:', data.connectionName)
      console.log('📡 [SAVE CONFIG] URL da requisição:', `/api/connections/whatsapp/${selectedConnection.sessionName}`)
      console.log('📡 [SAVE CONFIG] ==========================================')
      
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
        
        // Forçar refresh da tabela sem recarregar a página
        setTableRefreshKey(prev => prev + 1)
        
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
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } ${statsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                  {statsLoading ? 'Atualizando...' : 'Atualizar Estatísticas'}
                </motion.button>
                
             
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
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
              key={tableRefreshKey}
              onEditConnection={handleEditConnection}
              onCreateConnection={handleCreateConnection}
              onConnectionDeleted={handleConnectionDeleted}
            />
          </motion.div>
        </div>

        {/* Modais */}
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
