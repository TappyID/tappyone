'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Edit, Wifi, MessageSquare, Users, Clock, Trash2, Loader2 } from 'lucide-react'

interface WAHASession {
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
  displayName?: string
  status: 'connected' | 'connecting' | 'disconnected' | 'WORKING' | 'STARTING' | 'STOPPED' | 'FAILED'
  stats?: {
    chats: number
    contacts: number
    groups: number
    messages: number
  }
  assignedQueues?: string[]
  lastActivity: string
  createdAt: string
  wahaSession?: WAHASession
  sessionData?: {
    waha_status?: string
    push_name?: string
    phone_id?: string
    total_chats?: number
    total_groups?: number
    [key: string]: any
  }
  modulation?: {
    selectedFilas?: string[]
    selectedChats?: string[]
    selectedGroups?: string[]
    connectionName?: string
    [key: string]: any
  }
  isActive: boolean
}

interface ActiveConnectionsTableProps {
  onEditConnection: (connection: ActiveConnection) => void
  onCreateConnection: () => void
  onConnectionDeleted?: () => void
}

export function ActiveConnectionsTable({ 
  onEditConnection, 
  onCreateConnection,
  onConnectionDeleted
}: ActiveConnectionsTableProps) {
  const [connections, setConnections] = useState<ActiveConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [filas, setFilas] = useState<any[]>([])
  const [deletingSession, setDeletingSession] = useState<string | null>(null)

  // Buscar filas para mapear nomes e cores
  const fetchFilas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFilas(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar filas:', error)
    }
  }

  // Buscar conexões reais
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        
        // Verificar se o token existe
        if (!token) {
          console.warn('⚠️ Token não encontrado - usuário não autenticado')
          setAuthError(true)
          setConnections([])
          setLoading(false)
          return
        }
        
        setAuthError(false)
        
        const response = await fetch('/api/connections', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ [CONNECTIONS] Dados recebidos:', data)
          
          const connections = data.connections || []
          
          // Debug detalhado de cada conexão
          connections.forEach((conn: any, index: number) => {
            console.log(`🔍 [CONNECTION ${index}] Estrutura:`, {
              id: conn.id,
              displayName: conn.displayName,
              sessionName: conn.sessionName,
              sessionData: conn.sessionData, // 🔥 DEBUG ESPECÍFICO
              platform: conn.platform,
              status: conn.status,
              assignedQueues: conn.assignedQueues,
              stats: conn.stats,
              wahaSession: conn.wahaSession,
              createdAt: conn.createdAt,
              allKeys: Object.keys(conn)
            })
            
            // 🔥 DEBUG ESPECÍFICO DO sessionData
            if (conn.sessionData) {
              console.log(`✅ [CONNECTION ${index}] sessionData encontrado:`, conn.sessionData)
            } else {
              console.log(`❌ [CONNECTION ${index}] sessionData está vazio/undefined`)
            }
            
            // 🔥 DEBUG ESPECÍFICO DO modulation
            if (conn.modulation) {
              console.log(`✅ [CONNECTION ${index}] modulation encontrado:`, conn.modulation)
              console.log(`✅ [CONNECTION ${index}] selectedFilas:`, conn.modulation.selectedFilas)
            } else {
              console.log(`❌ [CONNECTION ${index}] modulation está vazio/undefined`)
            }
          })
          
          // Filtrar conexões deletadas (waha_deleted: true)
          const activeConnections = connections.filter((conn: any) => {
            const isDeleted = conn.sessionData?.waha_deleted === true
            if (isDeleted) {
              console.log(`🗑️ [CONNECTION] Filtrando conexão deletada: ${conn.sessionName}`)
            }
            return !isDeleted
          })
          
          console.log('✅ [CONNECTIONS] Total de conexões ativas:', activeConnections.length, '(deletadas filtradas:', connections.length - activeConnections.length, ')')
          setConnections(activeConnections)
        } else if (response.status === 401) {
          console.warn('⚠️ Token inválido ou expirado - redirecionando para login')
          setAuthError(true)
          // Limpar token inválido
          localStorage.removeItem('token')
          // Redirecionar para login (opcional)
          // window.location.href = '/login'
          setConnections([])
        } else {
          console.error('❌ [CONNECTIONS] Erro na resposta:', response.status, response.statusText)
          try {
            const errorText = await response.text()
            console.error('❌ [CONNECTIONS] Detalhes do erro:', errorText)
          } catch (e) {
            console.error('❌ [CONNECTIONS] Não foi possível ler erro')
          }
          setConnections([])
        }
      } catch (error) {
        console.error('❌ Erro ao buscar conexões:', error)
        setConnections([])
      } finally {
        setLoading(false)
      }
    }

    fetchConnections()
    fetchFilas()
  }, [])

  // Função para obter dados da fila por ID
  const getFilaById = (filaId: string) => {
    return filas.find(fila => fila.id === filaId)
  }

  // Função para renderizar badges das filas
  const renderFilasBadges = (connection: ActiveConnection) => {
    const selectedFilas = connection.modulation?.selectedFilas || []
    
    if (selectedFilas.length === 0) {
      return (
        <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
          Nenhuma fila
        </span>
      )
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedFilas.slice(0, 2).map((filaId) => {
          const fila = getFilaById(filaId)
          const filaName = fila?.nome || filaId.slice(0, 8)
          const filaCor = fila?.cor || '#6B7280'
          
          return (
            <span
              key={filaId}
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm shadow-black/10"
              style={{ backgroundColor: filaCor }}
            >
              {filaName}
            </span>
          )
        })}
        {selectedFilas.length > 2 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
            +{selectedFilas.length - 2}
          </span>
        )}
      </div>
    )
  }

  const getStatusMeta = (connection: ActiveConnection) => {
    const isConnected =
      connection.status === 'connected' ||
      connection.status === 'WORKING' ||
      connection.sessionData?.waha_status === 'WORKING'
    const isConnecting = connection.status === 'connecting' || connection.status === 'STARTING'

    if (isConnected) {
      return {
        icon: CheckCircle,
        iconClass: 'text-emerald-400',
        iconBg: 'bg-emerald-500/15 border border-emerald-500/20 shadow-emerald-500/10',
        label: 'Conectado',
        pill: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
        dot: 'bg-emerald-400'
      }
    }

    if (isConnecting) {
      return {
        icon: Clock,
        iconClass: 'text-amber-400',
        iconBg: 'bg-amber-500/15 border border-amber-500/20 shadow-amber-500/10',
        label: 'Conectando',
        pill: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
        dot: 'bg-amber-400'
      }
    }

    return {
      icon: XCircle,
      iconClass: 'text-rose-400',
      iconBg: 'bg-rose-500/15 border border-rose-500/20 shadow-rose-500/10',
      label: 'Desconectado',
      pill: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
      dot: 'bg-rose-400'
    }
  }

  const handleDeleteConnection = async (connection: ActiveConnection) => {
    console.log('🗑️ [DELETE] Dados da conexão:', {
      id: connection.id,
      sessionName: connection.sessionName,
      displayName: connection.displayName,
      status: connection.status
    })

    if (!connection?.sessionName && !connection?.id) {
      console.warn('❌ [DELETE CONNECTION] Sem sessionName nem ID!', connection)
      window.alert('❌ Não foi possível identificar essa conexão.')
      return
    }

    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Isso vai remover COMPLETAMENTE a conexão!\n\n` +
      `Nome: ${connection.modulation?.connectionName || connection.displayName || connection.sessionName}\n` +
      `Session: ${connection.sessionName || 'N/A'}\n` +
      `ID: ${connection.id}\n\n` +
      `Isso vai:\n` +
      `✅ Remover do banco de dados\n` +
      `✅ Desconectar do WAHA\n\n` +
      `Deseja continuar?`
    )

    if (!confirmed) return

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        window.alert('Sessão expirada. Faça login novamente para continuar.')
        setAuthError(true)
        return
      }

      setDeletingSession(connection.sessionName || connection.id)

      // Tentar deletar pelo sessionName primeiro
      if (connection.sessionName) {
        console.log('🗑️ [DELETE] Tentando deletar via sessionName:', connection.sessionName)
        
        const response = await fetch(`/api/connections/whatsapp/${connection.sessionName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('🗑️ [DELETE] Resposta:', response.status)

        if (response.ok) {
          setConnections(prev => prev.filter(item => item.id !== connection.id))
          onConnectionDeleted?.()
          console.log('✅ [DELETE] Conexão removida com sucesso!')
          window.alert('✅ Conexão removida com sucesso!')
          return
        } else {
          const errorText = await response.text().catch(() => '')
          console.error('❌ [DELETE] Erro:', response.status, errorText)
        }
      }

      // Se falhou ou não tem sessionName, tentar pelo ID direto no backend
      console.log('🗑️ [DELETE] Tentando deletar via ID:', connection.id)
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'
      const responseById = await fetch(`${backendUrl}/api/connections/${connection.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🗑️ [DELETE] Resposta via ID:', responseById.status)

      if (responseById.ok) {
        setConnections(prev => prev.filter(item => item.id !== connection.id))
        onConnectionDeleted?.()
        console.log('✅ [DELETE] Conexão removida via ID!')
        window.alert('✅ Conexão removida com sucesso!')
      } else {
        const errorText = await responseById.text().catch(() => '')
        console.error('❌ [DELETE] Falha final:', responseById.status, errorText)
        window.alert(`❌ Não foi possível remover.\n\nErro: ${responseById.status}`)
      }

    } catch (error) {
      console.error('❌ [DELETE] Erro inesperado:', error)
      window.alert(`❌ Erro ao remover conexão:\n\n${error}`)
    } finally {
      setDeletingSession(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div
        className={`flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-md transition-all dark:border-slate-700/60 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Conexões Ativas
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {connections.length} {connections.length === 1 ? 'conexão localizada' : 'conexões encontradas'}
          </p>
        </div>

        <motion.button
          onClick={onCreateConnection}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <span className="text-base font-bold">+</span>
          Nova Conexão
        </motion.button>
      </div>

      {/* Lista de Conexões */}
      <div
        className={`rounded-3xl border border-slate-200/60 bg-white/80 shadow-xl backdrop-blur-md transition-colors dark:border-slate-800/70 dark:bg-slate-900/60`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-500 dark:text-slate-300">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            <p className="text-sm">Carregando conexões...</p>
          </div>
        ) : authError ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Erro de Autenticação</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Sua sessão expirou. Faça login novamente para continuar.
              </p>
            </div>
            <motion.button
              onClick={() => (window.location.href = '/login')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-600"
            >
              Fazer Login
            </motion.button>
          </div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Wifi className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Nenhuma conexão encontrada
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Clique em "Nova Conexão" para começar
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            {connections.map((conn, index) => {
              const statusMeta = getStatusMeta(conn)
              const StatusIcon = statusMeta.icon

              return (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/60 dark:bg-slate-900/70"
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${statusMeta.iconBg}`}>
                        <StatusIcon className={`h-7 w-7 ${statusMeta.iconClass}`} />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {conn.modulation?.connectionName ||
                              conn.sessionData?.push_name ||
                              conn.displayName ||
                              `Conexão ${conn.id?.slice(-8) || 'Sem Nome'}`}
                          </h3>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${statusMeta.pill}`}>
                            {statusMeta.label}
                          </span>
                          <span className="rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
                            {conn.sessionName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-widest text-slate-400">Phone</span>
                            <span className="font-mono text-sm text-slate-600 dark:text-slate-200">
                              {conn.sessionData?.phone_id || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-200">
                              {conn.sessionData?.push_name || 'WhatsApp'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Filas
                          </span>
                          {renderFilasBadges(conn)}
                        </div>

                        {conn.assignedQueues && conn.assignedQueues.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                            <span className="rounded-md bg-orange-500/10 px-2 py-1 font-semibold text-orange-500 dark:text-orange-300">
                              Filas atribuídas
                            </span>
                            {conn.assignedQueues.slice(0, 3).map((fila, filaIndex) => (
                              <span
                                key={`${conn.id}-fila-${filaIndex}`}
                                className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-600 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-300"
                              >
                                {fila}
                              </span>
                            ))}
                            {conn.assignedQueues.length > 3 && (
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                +{conn.assignedQueues.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-start gap-4 lg:w-auto lg:items-end">
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-200">
                          <MessageSquare className="h-4 w-4 text-sky-500" />
                          <span className="text-base font-semibold text-slate-900 dark:text-white">
                            {conn.sessionData?.total_chats || conn.stats?.chats || 0}
                          </span>
                          <span className="text-xs uppercase tracking-wider text-slate-400">Chats</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-200">
                          <Users className="h-4 w-4 text-emerald-500" />
                          <span className="text-base font-semibold text-slate-900 dark:text-white">
                            {conn.sessionData?.total_groups || conn.stats?.groups || 0}
                          </span>
                          <span className="text-xs uppercase tracking-wider text-slate-400">Grupos</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => onEditConnection(conn)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20"
                          title="Editar conexão"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteConnection(conn)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          disabled={deletingSession === conn.sessionName}
                          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                            deletingSession === conn.sessionName
                              ? 'cursor-wait border-rose-400/20 bg-rose-500/20 text-rose-200'
                              : 'border-rose-400/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                          }`}
                          title="Excluir conexão"
                        >
                          {deletingSession === conn.sessionName ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Excluir
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
