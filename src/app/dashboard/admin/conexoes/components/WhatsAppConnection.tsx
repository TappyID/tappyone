'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X,
  Zap 
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type ConnectionStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'error'

interface WhatsAppConnectionProps {
  onUpdate: (data: { isConnected: boolean; isActive: boolean }) => void
}

export function WhatsAppConnection({ onUpdate }: WhatsAppConnectionProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = '/api/whatsapp' // Usar API routes internas para evitar Mixed Content 
  const API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'
  
  // Fallback para casos onde useAuth não retorna usuário
  const getUserId = () => {
    if (user?.id) return user.id
    
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.user_id || payload.sub
        } catch (e) {
          console.warn('Não foi possível decodificar token:', e)
        }
      }
    }
    return 'default'
  }
  
  const SESSION_NAME = `user_${getUserId()}`

  // Verificar status inicial quando componente carrega
  useEffect(() => {
    // Verificar conexão mesmo sem useAuth funcionando
    const initializeConnection = async () => {
      const userId = getUserId()
      console.log('🔄 Inicializando verificação de conexão para usuário:', userId)
      
      // Primeiro verifica se há uma sessão salva no localStorage
      if (typeof window !== 'undefined') {
        const savedConnection = localStorage.getItem(`whatsapp_connection_${userId}`)
        if (savedConnection) {
          const connectionData = JSON.parse(savedConnection)
          console.log('💾 Conexão salva encontrada:', connectionData)
          
          if (connectionData.status === 'connected' && connectionData.timestamp > Date.now() - 30000) { // 30 segundos de cache
            setStatus('connected')
            onUpdate({ isConnected: true, isActive: true })
            // Ainda verifica o backend para confirmar
          }
        }
      }
      
      const backendConnected = await checkBackendConnection()
      if (!backendConnected) {
        await checkSessionStatus()
      }
    }
    
    initializeConnection()
  }, []) // Executar apenas uma vez na montagem

  // Verificar status periodicamente com diferentes intervalos
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (status === 'connecting') {
      // Polling mais rápido quando conectando
      interval = setInterval(() => {
        checkSessionStatus()
      }, 2000) // 2 segundos
    } else if (status === 'qr_ready') {
      // Polling muito rápido quando QR está sendo lido
      interval = setInterval(() => {
        checkSessionStatus()
      }, 1000) // 1 segundo
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status])

  // Criar sessão WhatsApp
  const createSession = async () => {
    if (!user) {
      console.warn('⚠️ Usuário não encontrado no useAuth, tentando fallback...')
      // Fallback: tentar obter dados do localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Usuário não encontrado - faça login novamente')
        return
      }
      
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          setError('Usuário não encontrado - faça login novamente')
          return
        }
        
        const userData = await response.json()
        console.log('✅ Dados do usuário obtidos via fallback:', userData)
        // Continuar com os dados obtidos
      } catch (err) {
        setError('Erro ao verificar autenticação')
        return
      }
    }

    setStatus('connecting')
    setError(null)

    try {
      // Primeiro verificar se há alguma sessão ativa no WAHA para qualquer usuário  
      const activeSessions = await checkActiveSessions()
      if (activeSessions) return

      // Verificar se já existe uma conexão no backend
      const existingConnection = await checkBackendConnection()
      if (existingConnection) return

      // Verificar se já existe uma sessão na WAHA API
      const existingSession = await checkSessionStatus()
      if (existingSession) return

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token de autenticação não encontrado')
        return
      }

      // Primeiro verificar se sessão já existe
      let response = await fetch(`${API_BASE}/sessions/${SESSION_NAME}`, {
        headers: { 'X-Api-Key': API_KEY }
      })

      if (response.ok) {
        // Sessão existe, apenas iniciar
        console.log('📱 Sessão já existe, iniciando...')
        response = await fetch(`${API_BASE}/sessions/${SESSION_NAME}/start`, {
          method: 'POST',
          headers: { 'X-Api-Key': API_KEY }
        })
      } else {
        // Criar nova sessão
        console.log('🔄 Criando nova sessão:', SESSION_NAME)
        response = await fetch(`${API_BASE}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: SESSION_NAME,
            config: {
              webhooks: [{
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/webhooks/whatsapp`,
                events: ['message', 'session.status'],
                hmac: null,
                retries: {
                  delaySeconds: 2,
                  attempts: 15
                },
                customHeaders: [{
                  name: 'Authorization',
                  value: `Bearer ${token}`
                }]
              }]
            }
          })
        })
      }

      if (response.ok) {
        const data = await response.json()
        console.log('Sessão criada:', data)
        
        // Criar/atualizar conexão no backend
        await createBackendConnection('connecting')
        
        // Se já está WORKING, não precisa de QR Code
        if (data.status === 'WORKING') {
          setStatus('connected')
          await createBackendConnection('connected')
          onUpdate({ isConnected: true, isActive: true })
          return
        }
        
        // Aguardar um pouco e verificar o status
        setTimeout(() => {
          checkSessionStatus()
        }, 2000)
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
        console.error('Erro ao criar sessão:', errorData)
        
        // Se sessão já existe, verificar status
        if (response.status === 400 && errorData.message?.includes('already exists')) {
          console.log('Sessão já existe, verificando status...')
          await checkSessionStatus()
          return
        }
        
        setError(errorData.message || 'Erro ao criar sessão')
        setStatus('disconnected')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('disconnected')
      // Tentar obter QR Code - pode funcionar com GOWS
      const getQRCode = async () => {
        try {
          console.log(' Tentando obter QR Code via API...')
          const response = await fetch(`${API_BASE}/${SESSION_NAME}/auth/qr?format=image`, {
            headers: {
              'Accept': 'image/png',
              'X-Api-Key': API_KEY
            }
          })

          if (response.ok) {
            const blob = await response.blob()
            const qrUrl = URL.createObjectURL(blob)
            setQrCode(qrUrl)
            setShowQRModal(true)
            
            console.log(' QR Code obtido com sucesso!')
            return
          } else {
            console.log(' Endpoint /auth/qr retornou:', response.status)
          }
        } catch (err) {
          console.log(' Erro ao tentar /auth/qr:', err)
        }

        // Fallback: Tentar endpoint alternativo do GOWS
        try {
          console.log(' Tentando endpoint alternativo /screenshot...')
          const response = await fetch(`${API_BASE}/${SESSION_NAME}/screenshot`, {
            headers: {
              'Accept': 'image/png',
              'X-Api-Key': API_KEY
            }
          })

          if (response.ok) {
            const blob = await response.blob()
            const qrUrl = URL.createObjectURL(blob)
            setQrCode(qrUrl)
            setShowQRModal(true)
            
            console.log(' QR Code obtido via screenshot!')
            return
          }
        } catch (err) {
          console.log(' Screenshot também falhou:', err)
        }

        // Último fallback: instruções nos logs
        console.log(' QR Code disponível apenas nos logs do servidor')
        setError('QR Code disponível nos logs. Execute: docker logs backend-waha-1')
      }
    }
  }

  // Obter QR Code - tentar múltiplas abordagens
  const getQRCode = async () => {
    try {
      console.log('📱 Tentando obter QR Code via /sessions/[sessionName]/qr...')
      const response = await fetch(`${API_BASE}/sessions/${SESSION_NAME}/qr`, {
        headers: {
          'Accept': 'image/png'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const qrUrl = URL.createObjectURL(blob)
        setQrCode(qrUrl)
        setShowQRModal(true)
        console.log('✅ QR Code obtido com sucesso!')
        return
      } else {
        console.log('❌ QR Code retornou:', response.status)
      }
    } catch (err) {
      console.log('❌ Erro ao obter QR Code:', err)
    }

    // Último recurso: instruções dos logs
    console.log('📋 QR Code disponível apenas nos logs')
    setError('QR Code não disponível via API. Verifique logs: docker logs backend-waha-1')
  }

  // Verificar se há sessões ativas no WAHA
  const checkActiveSessions = async (): Promise<boolean> => {
    try {
      console.log('🔍 Verificando sessões ativas no WAHA...')
      const response = await fetch(`${API_BASE}/sessions`)

      if (response.ok) {
        const sessions = await response.json()
        console.log('📡 Sessões encontradas no WAHA:', sessions)
        
        // Procurar por sessão WORKING específica do usuário atual
        const currentUserId = getUserId()
        const expectedSessionName = `user_${currentUserId}`
        const userSession = sessions.find((s: any) => s.name === expectedSessionName)
        
        if (userSession && userSession.status === 'WORKING') {
          console.log('✅ Sessão do usuário encontrada e ativa:', userSession.name)
          setStatus('connected')
          setError(null)
          onUpdate({ isConnected: true, isActive: true })
          
          // Salvar no localStorage
          localStorage.setItem(`whatsapp_connection_${currentUserId}`, JSON.stringify({
            status: 'connected',
            timestamp: Date.now(),
            sessionName: userSession.name
          }))
          
          return true
        } else if (userSession) {
          console.log('📱 Sessão do usuário encontrada mas não ativa:', userSession.status)
          // Continuar com o processo normal para ativar a sessão
        } else {
          console.log('❌ Nenhuma sessão encontrada para o usuário atual:', expectedSessionName)
          // Outras sessões existem mas não são do usuário atual
        }
      }
      return false
    } catch (err) {
      console.error('❌ Erro ao verificar sessões ativas:', err)
      return false
    }
  }

  // Verificar conexão no backend primeiro
  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false

      console.log('🔍 Verificando conexão no backend...')
      const response = await fetch(`/api/connections/whatsapp`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Resposta do backend:', response.status)

      if (response.ok) {
        const connection = await response.json()
        console.log('✅ Conexão no backend encontrada:', connection)
        
        if (connection.status === 'connected' || connection.ativo) {
          setStatus('connected')
          setError(null)
          onUpdate({ isConnected: true, isActive: true })
          
          // Salvar no localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(`whatsapp_connection_${user?.id}`, JSON.stringify({
              status: 'connected',
              timestamp: Date.now(),
              sessionName: SESSION_NAME
            }))
          }
          
          return true
        } else if (connection.status === 'connecting') {
          setStatus('connecting')
          // Verificar status na WAHA API também
          await checkSessionStatus()
          return false
        }
      } else if (response.status === 404) {
        console.log('❌ Nenhuma conexão encontrada no backend')
        // Limpar localStorage se não há conexão
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`whatsapp_connection_${user?.id}`)
        }
      }
      return false
    } catch (err) {
      console.error('❌ Erro ao verificar backend:', err)
      return false
    }
  }

  // Verificar status da sessão na WAHA API
  const checkSessionStatus = async (): Promise<boolean> => {
    try {
      console.log('📡 Verificando status da sessão:', SESSION_NAME)
      const response = await fetch(`${API_BASE}/sessions/${SESSION_NAME}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Status da sessão WAHA:', data)
        
        // Sincronizar com backend
        await syncWithBackend(data.status)
        
        if (data.status === 'WORKING') {
          setStatus('connected')
          setShowQRModal(false)
          setError(null)
          onUpdate({ isConnected: true, isActive: true })
          
          // Salvar no localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(`whatsapp_connection_${user?.id}`, JSON.stringify({
              status: 'connected',
              timestamp: Date.now(),
              sessionName: SESSION_NAME,
              wahaStatus: data.status
            }))
          }
          
          console.log('✅ WhatsApp conectado com sucesso!', data.me)
          
          // Mostrar notificação de sucesso
          showSuccessNotification()
          
          return true
        } else if (data.status === 'SCAN_QR_CODE') {
          setStatus('qr_ready')
          setError(null)
          console.log('📱 QR Code pronto para leitura')
          // QR Code foi atualizado, buscar novo QR
          try {
            await getQRCode()
          } catch (err) {
            console.error('Erro ao buscar QR Code:', err)
            setError('Erro ao buscar QR Code')
          }
        } else if (data.status === 'STARTING') {
          setStatus('connecting')
          setError(null)
        } else if (data.status === 'FAILED') {
          setStatus('error')
          setError('Sessão falhou - tente reiniciar')
        } else if (data.status === 'STOPPED') {
          setStatus('disconnected')
          setError(null)
          onUpdate({ isConnected: false, isActive: false })
        }
      } else if (response.status === 404) {
        // Sessão não existe
        setStatus('disconnected')
        setError(null)
        onUpdate({ isConnected: false, isActive: false })
      }
      return false
    } catch (err) {
      console.error('❌ Erro ao verificar status:', err)
      return false
    }
  }

  // Mostrar notificação de sucesso
  const showSuccessNotification = () => {
    // Criar elemento de notificação
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      WhatsApp conectado com sucesso!
    `
    
    document.body.appendChild(notification)
    
    // Remover após 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }

  // Sincronizar status com backend
  const syncWithBackend = async (wahaStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch(`/api/connections/whatsapp/sync/${SESSION_NAME}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (err) {
      console.error('Erro ao sincronizar com backend:', err)
    }
  }

  // Criar/atualizar conexão no backend
  const createBackendConnection = async (status: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const connectionStatus = status === 'connected' ? 'connected' : 
                              status === 'connecting' ? 'connecting' : 'disconnected'

      await fetch(`/api/connections/whatsapp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'whatsapp',
          status: connectionStatus,
          session_name: SESSION_NAME,
          session_data: {
            user_id: user?.id,
            user_email: user?.email,
            created_at: new Date().toISOString()
          }
        })
      })
    } catch (err) {
      console.error('Erro ao criar conexão no backend:', err)
    }
  }

  // Desconectar sessão
  const disconnectSession = async () => {
    try {
      setStatus('connecting') // Mostrar loading durante desconexão
      setError(null)
      
      console.log('🔄 Iniciando desconexão...')
      
      // Desconectar da WAHA API primeiro
      console.log('📡 Desconectando da WAHA API...')
      const wahaResponse = await fetch(`${API_BASE}/sessions/${SESSION_NAME}`, {
        method: 'DELETE',
        headers: {
          'X-Api-Key': API_KEY
        }
      })
      
      if (!wahaResponse.ok && wahaResponse.status !== 404) {
        console.error('❌ Erro ao desconectar da WAHA:', wahaResponse.status)
        throw new Error(`Erro ao desconectar da WAHA: ${wahaResponse.status}`)
      }
      
      console.log('✅ WAHA desconectada com sucesso')
      
      // Desconectar no backend
      const token = localStorage.getItem('token')
      if (token) {
        console.log('📡 Desconectando do backend...')
        const backendResponse = await fetch(`/api/connections/whatsapp/${SESSION_NAME}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!backendResponse.ok && backendResponse.status !== 404) {
          console.error('❌ Erro ao desconectar do backend:', backendResponse.status)
          throw new Error(`Erro ao desconectar do backend: ${backendResponse.status}`)
        }
        
        console.log('✅ Backend desconectado com sucesso')
      }
      
      // Aguardar um momento para garantir que a desconexão foi processada
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar se realmente desconectou
      const stillConnected = await checkSessionStatus()
      if (stillConnected) {
        console.warn('⚠️ Sessão ainda ativa após desconexão, forçando...')
        // Tentar novamente
        await fetch(`${API_BASE}/sessions/${SESSION_NAME}/stop`, {
          method: 'POST',
          headers: {
            'X-Api-Key': API_KEY
          }
        })
        
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      // Atualizar estado apenas após confirmação
      setStatus('disconnected')
      setQrCode(null)
      setShowQRModal(false)
      setError(null)
      onUpdate({ isConnected: false, isActive: false })
      
      // Limpar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`whatsapp_connection_${user?.id}`)
      }
      
      console.log('✅ Desconexão concluída com sucesso!')
      
    } catch (err) {
      console.error('❌ Erro durante desconexão:', err)
      setError(err instanceof Error ? err.message : 'Erro ao desconectar')
      setStatus('error')
      
      // Mesmo com erro, tentar limpar o estado local
      setTimeout(() => {
        setStatus('disconnected')
        onUpdate({ isConnected: false, isActive: false })
        localStorage.removeItem(`whatsapp_connection_${user?.id}`)
      }, 3000)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600 dark:text-green-400'
      case 'connecting': case 'qr_ready': return 'text-yellow-600 dark:text-yellow-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const connection = {
    name: 'WhatsApp Business',
    description: 'Conecte sua conta do WhatsApp Business para atendimento automatizado',
    icon: MessageCircle,
    color: 'text-green-600'
  }

  return (
    <>
      <motion.div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ y: -2 }}
        layout
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20`}>
            <connection.icon className={`w-6 h-6 ${connection.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {connection.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {connection.description}
            </p>
          </div>
        </div>

        {/* Status Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-green-500' : 
              status === 'connecting' || status === 'qr_ready' ? 'bg-yellow-500' :
              status === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {status === 'connected' && 'Conectado'}
              {status === 'connecting' && 'Conectando...'}
              {status === 'qr_ready' && 'Aguardando QR Code'}
              {status === 'error' && 'Erro na conexão'}
              {status === 'disconnected' && 'Desconectado'}
            </span>
          </div>
          
          {/* Debug info quando há erro ou conectado */}
          {(error || status === 'connected') && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <div>Sessão: {SESSION_NAME}</div>
              <div>Usuário: {user?.nome} ({user?.email})</div>
              {status === 'connected' ? (
                <div className="text-green-600">✅ WhatsApp conectado e funcionando!</div>
              ) : error && (
                <div className="text-red-500">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          {status === 'connected' ? (
            <motion.button
              onClick={disconnectSession}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Desconectar
            </motion.button>
          ) : (
            <motion.button
              onClick={createSession}
              disabled={status === 'connecting'}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: status !== 'connecting' ? 1.02 : 1 }}
              whileTap={{ scale: status !== 'connecting' ? 0.98 : 1 }}
            >
              {status === 'connecting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Conectar
                </>
              )}
            </motion.button>
          )}
          
          {status === 'qr_ready' && (
            <motion.button
              onClick={() => setShowQRModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <QrCode className="w-4 h-4" />
              Ver QR
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && qrCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conectar WhatsApp
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p className="font-medium">Como conectar:</p>
                  <ol className="text-left space-y-1">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Toque em "Mais opções" (⋮) → "Dispositivos conectados"</li>
                    <li>3. Toque em "Conectar um dispositivo"</li>
                    <li>4. Escaneie este QR Code</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
