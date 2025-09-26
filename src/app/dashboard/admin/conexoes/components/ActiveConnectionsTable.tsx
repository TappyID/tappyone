'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { 
  Eye, 
  Edit, 
  Trash2, 
  MessageCircle, 
  Users, 
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Settings
} from 'lucide-react'

interface WhatsAppSession {
  name: string
  status: 'WORKING' | 'SCAN_QR_CODE' | 'STARTING' | 'STOPPED' | 'FAILED'
  config?: {
    webhooks?: any[]
  }
  me?: {
    id: string
    pushName: string
    lid?: string
    jid?: string
  }
  assignedWorker?: string
}

interface ActiveConnection {
  id: string
  platform: 'whatsapp' | 'facebook' | 'instagram'
  sessionName: string
  status: 'connected' | 'connecting' | 'disconnected' | 'error'
  wahaSession?: WhatsAppSession
  createdAt: string
  lastActivity?: string
  stats?: {
    chats: number
    contacts: number
    groups: number
    messages: number
  }
  assignedQueues?: string[]
  isActive: boolean
}

interface ActiveConnectionsTableProps {
  onViewConnection: (connection: ActiveConnection) => void
  onEditConnection: (connection: ActiveConnection) => void
  onCreateConnection: () => void
}

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  qrCode: string | null
  sessionName: string
}

export function ActiveConnectionsTable({ 
  onViewConnection, 
  onEditConnection, 
  onCreateConnection 
}: ActiveConnectionsTableProps) {
  const { theme } = useTheme()
  const { user, loading: authLoading } = useAuth()
  const [connections, setConnections] = useState<ActiveConnection[]>([])
  const [loading, setLoading] = useState(false)
  const [editingConnectionName, setEditingConnectionName] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Função para buscar nomes das filas pelos IDs
  const fetchFilasNames = async (filaIds: string[]): Promise<string[]> => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔍 [FILAS] Buscando filas via proxy API local')
      
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const filasData = await response.json()
        const allFilas = filasData.data || []
        
        return filaIds
          .map((filaId: string) => {
            const fila = allFilas.find((f: any) => f.id === filaId)
            return fila?.nome || `Fila ${filaId.slice(0,8)}`
          })
          .filter(Boolean)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.warn('Erro ao buscar nomes das filas:', error)
      return filaIds.map((id: string) => `Fila ${id.slice(0,8)}`)
    }
  }
  
  const [error, setError] = useState<string | null>(null)

  // Função para iniciar edição do nome
  const handleStartEditName = (connection: ActiveConnection) => {
    setEditingConnectionName(connection.sessionName)
    setEditingName(connection.wahaSession?.me?.pushName || connection.sessionName)
  }

  // Função para salvar o nome editado
  const handleSaveConnectionName = async (sessionName: string) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/connections/whatsapp/${sessionName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: editingName
        })
      })

      if (response.ok) {
        console.log('✅ Nome da conexão atualizado com sucesso')
        // Atualizar a conexão local
        setConnections(prev => prev.map(conn => 
          conn.sessionName === sessionName 
            ? { ...conn, wahaSession: { ...conn.wahaSession, me: { ...conn.wahaSession?.me, pushName: editingName } } }
            : conn
        ))
        setEditingConnectionName(null)
        setEditingName('')
      } else {
        console.error('❌ Erro ao atualizar nome da conexão:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar nome da conexão:', error)
    }
  }

  // Função para cancelar edição
  const handleCancelEditName = () => {
    setEditingConnectionName(null)
    setEditingName('')
  }
  
  // Estados para QR Code
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [currentSessionName, setCurrentSessionName] = useState('')

  // Buscar conexões ativas
  const fetchConnections = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar sessões do WAHA com token de autorização
      const token = localStorage.getItem('token')
      console.log('🔍 [TOKEN] Token do localStorage:', token ? `${token.substring(0, 20)}...` : 'NULO/AUSENTE')
      
      if (!token) {
        console.log('❌ [TOKEN] Token não encontrado no localStorage, redirecionando para login...')
        setError('Sessão expirada. Faça login novamente.')
        return
      }

      // Obter sessões ativas da WAHA via proxy API
      const wahaResponse = await fetch('/api/waha/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!wahaResponse.ok) {
        console.error('🚨 [WAHA] Erro ao buscar sessões:', wahaResponse.status)
        return
      }
      
      const wahaSessionsData = await wahaResponse.json()
      const allWahaSessions = Array.isArray(wahaSessionsData) ? wahaSessionsData : []
      
      // 🔍 FILTRAR apenas sessões do usuário logado (usar apenas primeiros 8 chars + underscore)
      const userPrefix = `user_${user.id.slice(0, 8)}_`
      const wahaSessions = allWahaSessions.filter(session => 
        session.name && session.name.startsWith(userPrefix)
      )
      
      console.log('🔍 [WAHA] Total sessões WAHA:', allWahaSessions.length)
      console.log('🔍 [WAHA] TODAS as sessões disponíveis:', allWahaSessions.map(s => s.name))
      console.log('🔍 [WAHA] Sessões do usuário filtradas:', wahaSessions.length)
      console.log('🔍 [WAHA] Prefixo do usuário:', userPrefix)
      console.log('🔍 [WAHA] Sessões filtradas:', wahaSessions.map(s => s.name))

      // Buscar conexões do backend (apenas do usuário atual)
      const backendResponse = await fetch('/api/connections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      let backendConnections: any[] = []
      if (backendResponse.ok) {
        const backendData = await backendResponse.json()
        const allConnections = backendData.connections || []
        
        // Filtrar conexões apenas do usuário atual
        if (user?.id) {
          backendConnections = allConnections.filter((conn: any) => {
            const sessionName = conn.session_name || conn.id
            return sessionName.includes(`user_${user.id}`) || 
                   sessionName.startsWith(`user_${user.id.slice(0, 8)}`)
          })
        } else {
          // Se user.id não está disponível, usar todas as conexões temporariamente
          console.warn('⚠️ [FILTER] User ID não disponível, usando todas as conexões')
          backendConnections = allConnections
        }
        
        console.log('🔍 [FILTER] Total connections from backend:', allConnections.length)
        console.log('🔍 [FILTER] All backend connections:', allConnections.map(c => c.session_name || c.id))
        console.log('🔍 [FILTER] User connections after filter:', backendConnections.length)
        console.log('🔍 [FILTER] Filtered connections:', backendConnections.map(c => c.session_name || c.id))
        console.log('🔍 [FILTER] User ID for filtering:', user?.id)
        console.log('🔍 [FILTER] User object:', user)
      }

        // Combinar dados das duas APIs
      const activeConnections: ActiveConnection[] = []
      
      console.log('📊 [DEBUG] Total WAHA sessions (filtered):', wahaSessions.length)
      console.log('📊 [DEBUG] Total backend connections:', backendConnections.length)

      // Processar sessões WAHA
      for (const session of wahaSessions) {
        console.log('🔍 [TABLE] Processando sessão WAHA:', session.name)
        console.log('🔍 [TABLE] Status da sessão WAHA:', session.status)
        console.log('🔍 [TABLE] Backend connections disponíveis:', backendConnections.map(bc => bc.session_name || bc.id))
        
        const backendConnection = backendConnections.find(
          bc => bc.session_name === session.name
        )
        
        console.log('🔍 [TABLE] Backend connection encontrada:', !!backendConnection)
        if (backendConnection) {
          console.log('🔍 [TABLE] Modulation exists:', !!backendConnection.modulation)
          console.log('🔍 [TABLE] Modulation content:', backendConnection.modulation)
        }

        // Se a sessão está ativa no WAHA mas não tem conexão no backend, sincronizar (apenas uma vez por sessão)
        const syncKey = `synced_${session.name}`
        if (session.status === 'WORKING' && !backendConnection && !sessionStorage.getItem(syncKey)) {
          console.log(`🔄 [AUTO-SYNC] Sincronizando sessão ativa não registrada: ${session.name}`)
          sessionStorage.setItem(syncKey, 'true')
          syncSessionInBackground(session.name)
        }

        // Buscar estatísticas dos dados salvos (modulation) se existir
        let stats = undefined
        let assignedQueues: string[] = []
        
        if (backendConnection?.modulation) {
          try {
            const modulation = typeof backendConnection.modulation === 'string' 
              ? JSON.parse(backendConnection.modulation) 
              : backendConnection.modulation

            const filasCount = Array.isArray(modulation.selectedFilas) ? modulation.selectedFilas.length : 0
            
            stats = {
              chats: 0, // Não usamos mais chats individuais
              groups: 0, // Não usamos mais grupos individuais  
              messages: filasCount, // Agora messages representa o número de filas
              contacts: filasCount // Para compatibilidade
            }
            
            // Buscar nomes das filas da modulation (assíncrono para não travar)
            if (Array.isArray(modulation.selectedFilas)) {
              const filaIds = modulation.selectedFilas
              // ⚡ OTIMIZAÇÃO: Buscar filas em background sem travar a UI
              fetchFilasNames(filaIds).then(names => {
                // Atualizar apenas esta conexão específica
                setConnections(prev => prev.map(conn => 
                  conn.sessionName === session.name 
                    ? { ...conn, assignedQueues: names }
                    : conn
                ))
              }).catch(err => {
                console.warn('Erro ao buscar nomes das filas:', err)
              })
              
              // Usar IDs temporariamente
              assignedQueues = filaIds.map(id => `Fila ${id.slice(0,8)}`)
            }
          } catch (err) {
            console.warn('Erro ao parsear modulation:', err)
          }
        }

        // Se não tem modulation (ou está vazia) e sessão está ativa, usar dados básicos sem carregar tudo
        const hasValidModulation = stats && (stats.chats > 0 || stats.contacts > 0 || stats.groups > 0)
        
        if (!hasValidModulation && session.status === 'WORKING') {
          // ⚡ OTIMIZAÇÃO: Não carregar dados completos, usar estimativa básica
          console.log('📊 [STATS] Usando estatísticas básicas sem carregar dados completos')
          stats = {
            chats: 0, // Será mostrado como "Sem dados" na tabela
            contacts: 0,
            groups: 0,
            messages: 0
          }
        }

        // Extrair nome personalizado da modulation se existir
        let displayName = session.me?.pushName || session.name
        if (backendConnection?.modulation) {
          try {
            const modulation = typeof backendConnection.modulation === 'string' 
              ? JSON.parse(backendConnection.modulation) 
              : backendConnection.modulation
            
            if (modulation.connectionName) {
              displayName = modulation.connectionName
            }
          } catch (err) {
            console.warn('Erro ao extrair nome da conexão:', err)
          }
        }

        const connectionData = {
          id: session.name,
          sessionName: session.name,
          displayName: displayName, // Nome personalizado
          status: (
            session.status === 'WORKING' ? 'connected' : 
            session.status === 'SCAN_QR_CODE' ? 'connecting' : 
            session.status === 'STOPPING' || session.status === 'STOPPED' ? 'disconnected' :
            session.status === 'FAILED' ? 'error' :
            'disconnected'
          ) as 'connected' | 'connecting' | 'disconnected' | 'error',
          platform: 'whatsapp' as const,
          stats: stats,
          assignedQueues: assignedQueues,
          lastActivity: session.me?.pushName || 'N/A',
          createdAt: new Date().toISOString(),
          isActive: session.status === 'WORKING'
        }
        
        console.log('✅ [TABLE] Adicionando conexão ativa:', connectionData)
        activeConnections.push(connectionData)
      }

      console.log('📊 [FINAL] Total conexões ativas processadas:', activeConnections.length)
      console.log('📊 [FINAL] Conexões ativas:', activeConnections)
      
      setConnections(activeConnections)
    } catch (err) {
      console.error('Erro ao buscar conexões:', err)
      setError('Erro ao carregar conexões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Aguardar auth loading terminar E user estar disponível
    if (!authLoading && user?.id) {
      console.log('🔐 [AUTH] Auth carregado, user ID:', user.id)
      fetchConnections()
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(fetchConnections, 30000)
      return () => clearInterval(interval)
    } else {
      console.log('🔐 [AUTH] Aguardando auth - loading:', authLoading, 'user ID:', user?.id)
    }
  }, [authLoading, user?.id])

  // Conectar sessão
  const handleConnectSession = async (connection: ActiveConnection) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Criar sessão via API WhatsApp (que usa o backend Go)
      const response = await fetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomeSessao: connection.sessionName
        })
      })

      if (response.ok) {
        // Aguardar um pouco e verificar status
        setTimeout(() => {
          fetchConnections()
          checkForQRCode(connection.sessionName)
        }, 2000)
        
        // Iniciar monitoramento de QR code para sincronização automática
        startQRMonitoring(connection.sessionName)
      } else {
        console.error('Erro ao conectar sessão:', response.status)
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
    } finally {
      setLoading(false)
    }
  }

  // Desconectar sessão (apenas pausar, não excluir)
  const handleDisconnectSession = async (connection: ActiveConnection) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Pausar sessão na API WAHA sem excluir do banco
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      const response = await fetch(`${backendUrl}/api/whatsapp/sessions/${connection.sessionName}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar status da conexão para disconnected
        await fetch(`/api/connections/whatsapp/${connection.sessionName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            modulation: {
              status: 'disconnected'
            }
          })
        })
        fetchConnections()
      } else {
        console.error('Erro ao desconectar sessão:', response.status)
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error)
    } finally {
      setLoading(false)
    }
  }

  // Excluir conexão completamente (banco + sessão WAHA)
  const handleDeleteConnection = async (connection: ActiveConnection) => {
    if (!confirm('Tem certeza que deseja excluir esta conexão? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // 1. Excluir conexão do banco
      const response = await fetch(`/api/connections/whatsapp/${connection.sessionName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // 2. Remover sessão da API WAHA também
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
          await fetch(`${backendUrl}/api/whatsapp/sessions/${connection.sessionName}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        } catch (wahaError) {
          console.warn('Erro ao remover sessão WAHA (mas conexão foi excluída):', wahaError)
        }
        
        fetchConnections()
      } else {
        console.error('Erro ao excluir conexão:', response.status)
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar se precisa de QR Code
  const checkForQRCode = async (sessionName: string) => {
    try {
      console.log(`🔍 [QR] Verificando QR Code para sessão: ${sessionName}`)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/whatsapp/sessions/${sessionName}/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'image/png'
        }
      })

      console.log(`📱 [QR] Response status: ${response.status}`)
      
      if (response.ok) {
        const blob = await response.blob()
        console.log(`📱 [QR] Blob size: ${blob.size} bytes`)
        if (blob.size > 0) {
          const qrUrl = URL.createObjectURL(blob)
          console.log(`📱 [QR] QR Code encontrado, abrindo modal`)
          setQrCode(qrUrl)
          setCurrentSessionName(sessionName)
          setShowQRModal(true)
        } else {
          console.log(`📱 [QR] Blob vazio, sem QR Code disponível`)
        }
      } else if (response.status === 404) {
        console.log(`📱 [QR] QR Code não disponível (404) - sessão pode estar em outro estado`)
        // Forçar abertura do modal mesmo sem QR inicialmente
        setQrCode(null)
        setCurrentSessionName(sessionName)
        setShowQRModal(true)
      } else {
        console.log(`📱 [QR] Erro ao buscar QR Code: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ [QR] Erro ao buscar QR Code:', error)
      // Em caso de erro, ainda assim abrir o modal para mostrar status
      setQrCode(null)
      setCurrentSessionName(sessionName)
      setShowQRModal(true)
    }
  }

  // Monitorar QR code e sincronizar quando conectado
  const startQRMonitoring = (sessionName: string) => {
    const monitorInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Verificar status da sessão no WAHA
        const wahaResponse = await fetch('/api/whatsapp/sessions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (wahaResponse.ok) {
          const sessions = await wahaResponse.json()
          const session = sessions.find((s: any) => s.name === sessionName)
          
          if (session && session.status === 'WORKING') {
            console.log(`🔄 [SYNC] Sessão ${sessionName} conectada, sincronizando...`)
            
            // Sincronizar com backend
            await fetch(`/api/connections/whatsapp/sync/${sessionName}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            // Fechar modal QR se estiver aberto
            if (showQRModal && currentSessionName === sessionName) {
              setShowQRModal(false)
              setQrCode(null)
            }
            
            // Atualizar lista de conexões
            fetchConnections()
            
            // Parar monitoramento
            clearInterval(monitorInterval)
            console.log(`✅ [SYNC] Sincronização concluída para ${sessionName}`)
          }
        }
      } catch (error) {
        console.error('Erro no monitoramento:', error)
      }
    }, 3000) // Verificar a cada 3 segundos
    
    // Limpar após 5 minutos para evitar polling infinito
    setTimeout(() => {
      clearInterval(monitorInterval)
      console.log(`⏰ [SYNC] Timeout do monitoramento para ${sessionName}`)
    }, 300000) // 5 minutos
  }

  // Sincronizar sessão em background sem bloquear a UI
  const syncSessionInBackground = async (sessionName: string) => {
    try {
      const token = localStorage.getItem('token')
      
      console.log(`🔄 [BACKGROUND-SYNC] Iniciando sincronização para ${sessionName}`)
      
      const response = await fetch(`/api/connections/whatsapp/sync/${sessionName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log(`✅ [BACKGROUND-SYNC] Sessão ${sessionName} sincronizada com sucesso`)
        // NÃO recarregar automaticamente para evitar loop
        console.log(`✅ [BACKGROUND-SYNC] Sessão ${sessionName} sincronizada, aguardando ação manual para reload`)
      } else {
        console.error(`❌ [BACKGROUND-SYNC] Erro ao sincronizar ${sessionName}:`, response.status)
        sessionStorage.removeItem(`syncing_${sessionName}`)
      }
    } catch (error) {
      console.error(`❌ [BACKGROUND-SYNC] Erro na sincronização de ${sessionName}:`, error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'connecting':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado'
      case 'connecting': return 'Conectando'
      case 'error': return 'Erro'
      default: return 'Desconectado'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`rounded-xl p-8 text-center ${
        theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'
      }`}>
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          Carregando conexões...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-xl p-8 text-center ${
        theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50'
      }`}>
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
        <p className={`mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
        <motion.button
          onClick={fetchConnections}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tentar Novamente
        </motion.button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Conexões Ativas
          </h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {connections.filter(c => c.isActive).length} de {connections.length} conexões ativas
          </p>
        </div>

        <motion.button
          onClick={onCreateConnection}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-[#273155] to-[#1e2442] text-white hover:from-[#1e2442] hover:to-[#273155] shadow-lg hover:shadow-xl'
          }`}
        >
          + Nova Conexão
        </motion.button>
      </div>

      {/* Tabela */}
      {connections.length === 0 ? (
        <div className={`rounded-xl p-12 text-center ${
          theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-gray-200/50'
        }`}>
          <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Nenhuma conexão ativa
          </h3>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Crie sua primeira conexão para começar a gerenciar seus atendimentos
          </p>
          <motion.button
            onClick={onCreateConnection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Criar Primeira Conexão
          </motion.button>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden border ${
          theme === 'dark' 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white/50 border-gray-200/50'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50/50'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Plataforma
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                    ESTATÍSTICAS
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                    FILAS
                  </th>
                  <th className={`px-6 py-4 text-center text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Controle
                  </th>
                  <th className={`px-6 py-4 text-center text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {connections.map((connection, index) => (
                  <motion.tr
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`group hover:bg-opacity-50 transition-colors ${
                      theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    {/* Plataforma */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            WhatsApp Business
                          </p>
                          {editingConnectionName === connection.sessionName ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveConnectionName(connection.sessionName)
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditName()
                                  }
                                }}
                                className={`text-sm px-2 py-1 border rounded ${
                                  theme === 'dark' 
                                    ? 'bg-slate-700 border-slate-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveConnectionName(connection.sessionName)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEditName}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {connection.wahaSession?.me?.pushName || connection.sessionName}
                              </p>
                              <button
                                onClick={() => handleStartEditName(connection)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        <span className={`text-sm font-medium ${
                          connection.status === 'connected' ? 'text-green-600 dark:text-green-400' :
                          connection.status === 'connecting' ? 'text-yellow-600 dark:text-yellow-400' :
                          connection.status === 'error' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {getStatusText(connection.status)}
                        </span>
                      </div>
                    </td>

                    {/* Estatísticas */}
                    <td className="px-6 py-4">
                      {connection.stats ? (
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">{connection.stats.chats} chats</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">{connection.stats.groups} grupos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Settings className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">{connection.stats.messages} filas</span>
                          </div>
                        </div>
                      ) : (
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          Sem dados
                        </span>
                      )}
                    </td>

                    {/* Filas */}
                    <td className="px-6 py-4">
                      {connection.assignedQueues && connection.assignedQueues.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {connection.assignedQueues.slice(0, 2).map((queue, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                            >
                              {queue}
                            </span>
                          ))}
                          {connection.assignedQueues.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              +{connection.assignedQueues.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          Nenhuma fila
                        </span>
                      )}
                    </td>

                    {/* Controles de Conexão */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {connection.isActive ? (
                          <motion.button
                            onClick={() => handleDisconnectSession(connection)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Desconectar
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => handleConnectSession(connection)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Conectar
                          </motion.button>
                        )}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          onClick={() => onViewConnection(connection)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'hover:bg-slate-600/50 text-gray-400 hover:text-white' 
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }`}
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => onEditConnection(connection)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'hover:bg-slate-600/50 text-gray-400 hover:text-blue-400' 
                              : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                          }`}
                          title="Editar conexão"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => handleDeleteConnection(connection)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'hover:bg-slate-600/50 text-gray-400 hover:text-red-400' 
                              : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                          }`}
                          title="Excluir conexão permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative max-w-md w-full rounded-2xl shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Conectar WhatsApp
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Escaneie o QR Code com seu WhatsApp
                  </p>
                </div>
                <motion.button
                  onClick={() => setShowQRModal(false)}
                  whileHover={{ scale: 1.1 }}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* QR Code */}
              <div className="p-6 text-center">
                {qrCode ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl inline-block">
                      <img 
                        src={qrCode} 
                        alt="QR Code WhatsApp" 
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <p>1. Abra o WhatsApp no seu celular</p>
                      <p>2. Toque em Mais opções &gt; Aparelhos conectados</p>
                      <p>3. Toque em Conectar um aparelho</p>
                      <p>4. Escaneie este código QR</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Gerando QR Code...
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t ${
                theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <motion.button
                  onClick={() => setShowQRModal(false)}
                  whileHover={{ scale: 1.05 }}
                  className={`w-full py-2 rounded-lg font-medium ${
                    theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Fechar
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
