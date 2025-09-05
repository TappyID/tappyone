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

  // Usar proxy local para contornar mixed content blocking em produção
  const API_BASE = `/api/waha`
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
      
      // Primeiro limpar localStorage antigo - sempre verificar status real
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`whatsapp_connection_${userId}`)
        console.log('🧹 Cache de conexão limpo para validação')
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

  // Criar sessão WhatsApp - com verificação otimizada
  const createSession = async () => {
    setStatus('connecting')
    setError(null)

    try {
      console.log('🔍 Verificando sessões existentes antes de criar nova...')
      
      // 1. PRIMEIRO: Verificar se já existe uma sessão ativa para ESTE usuário específico
      const userSessionActive = await checkUserActiveSession()
      if (userSessionActive) {
        console.log('✅ Sessão do usuário já está ativa - não criando nova')
        return
      }

      // 2. Verificar conexão no backend 
      const backendConnected = await checkBackendConnection()
      if (backendConnected) {
        console.log('✅ Conexão já existe no backend - não criando nova')
        return
      }

      // 3. Verificar se usuário está logado
      if (!user) {
        console.warn('⚠️ Usuário não encontrado no useAuth, tentando fallback...')
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
        } catch (err) {
          setError('Erro ao verificar autenticação')
          return
        }
      }

      console.log('🚀 Criando nova sessão para usuário:', getUserId())

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token de autenticação não encontrado')
        return
      }

      // 1. Primeiro criar sessão no backend (tabela sessoes_whatsapp)
      console.log('💾 Criando sessão no backend primeiro...')
      const backendResponse = await fetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomeSessao: SESSION_NAME
        })
      })

      if (backendResponse.ok) {
        const backendSession = await backendResponse.json()
        console.log('✅ Sessão criada no backend:', backendSession)
      } else if (backendResponse.status !== 409) { // 409 = sessão já existe
        const error = await backendResponse.text()
        console.error('❌ Erro criando sessão no backend:', error)
        throw new Error(`Erro ao criar sessão no backend: ${error}`)
      }

      // 2. Verificar se já existe uma sessão na WAHA
      let response = await fetch(`${API_BASE}/sessions/${SESSION_NAME}`)

      if (response.ok) {
        // Sessão existe, usar PUT para atualizar/iniciar
        console.log('📱 Sessão já existe, usando PUT para iniciar...')
        response = await fetch(`${API_BASE}/sessions/${SESSION_NAME}`, {
          method: 'PUT',
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
        
        // Se PUT funcionou, tentar iniciar a sessão
        if (response.ok) {
          console.log('✅ Sessão atualizada com PUT, tentando iniciar...')
          const startResponse = await fetch(`${API_BASE}/sessions/${SESSION_NAME}/start`, {
            method: 'POST'
          })
          
          // Se iniciar falhou com 422, usar PUT novamente
          if (!startResponse.ok && startResponse.status === 422) {
            console.log('🔄 POST /start falhou com 422, sessão já deve estar iniciando...')
            response = startResponse // Manter resposta para continuar fluxo
          } else {
            response = startResponse
          }
        }
      } else {
        // Criar nova sessão E iniciar com start: true
        console.log('🔄 Criando e iniciando nova sessão:', SESSION_NAME)
        response = await fetch(`${API_BASE}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: SESSION_NAME,
            start: true, // Iniciar automaticamente após criar
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
        
        // Se sessão já existe (400) ou precisa ser atualizada (422), tentar PUT
        if (response.status === 400 && errorData.message?.includes('already exists')) {
          console.log('Sessão já existe (400), verificando status...')
          await checkSessionStatus()
          return
        } else if (response.status === 422) {
          console.log('Sessão já existe (422), tentando atualizar com PUT...')
          try {
            // Usar PUT para atualizar a sessão existente
            const putResponse = await fetch(`${API_BASE}/sessions/${SESSION_NAME}`, {
              method: 'PUT',
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
            
            if (putResponse.ok) {
              console.log('✅ Sessão atualizada com PUT com sucesso')
              
              // Tentar iniciar a sessão atualizada
              const startResponse = await fetch(`${API_BASE}/sessions/${SESSION_NAME}/start`, {
                method: 'POST'
              })
              
              if (startResponse.ok) {
                const data = await startResponse.json()
                console.log('✅ Sessão iniciada após PUT:', data)
                
                // Criar/atualizar conexão no backend
                await createBackendConnection('connecting')
                
                // Verificar status após iniciar
                setTimeout(() => {
                  checkSessionStatus()
                }, 2000)
                return
              } else {
                console.warn('⚠️ Erro ao iniciar sessão após PUT:', startResponse.status)
                // Ainda assim, verificar status - pode já estar funcionando
                await checkSessionStatus()
                return
              }
            } else {
              console.error('❌ Erro no PUT:', putResponse.status)
              // Fallback: verificar status atual
              await checkSessionStatus()
              return
            }
          } catch (putError) {
            console.error('❌ Erro durante PUT:', putError)
            // Fallback: verificar status atual
            await checkSessionStatus()
            return
          }
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
              'Accept': 'image/png'
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
              'Accept': 'image/png'
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
    // Tentar diferentes endpoints possíveis para QR code
    const endpoints = [
      `${API_BASE}/sessions/${SESSION_NAME}/auth/qr?format=image`,
      `${API_BASE}/sessions/${SESSION_NAME}/qr?format=image`,
      `${API_BASE}/${SESSION_NAME}/auth/qr?format=image`,
      `${API_BASE}/sessions/${SESSION_NAME}/qr`,
      `${API_BASE}/sessions/${SESSION_NAME}/screenshot`
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`📱 Tentando endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'image/png'
          }
        })

        if (response.ok) {
          const blob = await response.blob()
          if (blob.size > 0) {
            const qrUrl = URL.createObjectURL(blob)
            setQrCode(qrUrl)
            setShowQRModal(true)
            console.log(`✅ QR Code obtido via: ${endpoint}`)
            return
          }
        } else {
          console.log(`❌ ${endpoint} retornou: ${response.status}`)
        }
      } catch (err) {
        console.log(`❌ Erro em ${endpoint}:`, err)
      }
    }

    // Se todos falharam, usar backend como proxy
    try {
      console.log('📱 Tentando obter QR via backend proxy...')
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_NAME}/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'image/png'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        if (blob.size > 0) {
          const qrUrl = URL.createObjectURL(blob)
          setQrCode(qrUrl)
          setShowQRModal(true)
          console.log('✅ QR Code obtido via backend proxy!')
          return
        }
      }
    } catch (err) {
      console.log('❌ Erro no backend proxy:', err)
    }

    // Último recurso: instruções dos logs
    console.log('📋 QR Code disponível apenas nos logs')
    setError('QR Code visível nos logs do container WAHA. Use: docker logs backend-waha-1')
  }

  // Verificar se há sessão ativa específica do usuário
  const checkUserActiveSession = async (): Promise<boolean> => {
    try {
      const currentUserId = getUserId()
      const expectedSessionName = `user_${currentUserId}`
      
      console.log('🔍 Verificando sessão específica do usuário:', expectedSessionName)
      
      // Verificar diretamente a sessão específica do usuário
      const response = await fetch(`${API_BASE}/sessions/${expectedSessionName}`)

      if (response.ok) {
        const session = await response.json()
        console.log('📡 Status da sessão do usuário:', session)
        
        if (session.status === 'WORKING') {
          console.log('✅ Sessão do usuário já está WORKING - conectado!')
          setStatus('connected')
          setError(null)
          onUpdate({ isConnected: true, isActive: true })
          
          // Salvar no localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(`whatsapp_connection_${currentUserId}`, JSON.stringify({
              status: 'connected',
              timestamp: Date.now(),
              sessionName: expectedSessionName
            }))
          }
          
          return true
        } else if (session.status === 'SCAN_QR_CODE') {
          console.log('📱 Sessão existe mas precisa de QR Code')
          setStatus('qr_ready')
          await getQRCode()
          return true
        } else if (session.status === 'STARTING') {
          console.log('🔄 Sessão existe mas ainda está inicializando')
          setStatus('connecting')
          return true
        } else {
          console.log('⚠️ Sessão existe mas status é:', session.status)
        }
      } else if (response.status === 404) {
        console.log('❌ Sessão do usuário não existe - pode criar nova')
        return false
      }
      
      return false
    } catch (err) {
      console.error('❌ Erro ao verificar sessão do usuário:', err)
      return false
    }
  }

  // Verificar se há sessões ativas no WAHA (geral)
  const checkActiveSessions = async (): Promise<boolean> => {
    try {
      console.log('🔍 Verificando todas as sessões ativas no WAHA...')
      const response = await fetch(`${API_BASE}/sessions`)

      if (response.ok) {
        const sessions = await response.json()
        console.log('📡 Total de sessões encontradas:', sessions.length)
        
        // Filtrar apenas sessões WORKING
        const workingSessions = sessions.filter((s: any) => s.status === 'WORKING')
        console.log('💼 Sessões ativas (WORKING):', workingSessions.map((s: any) => s.name))
        
        return workingSessions.length > 0
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
          console.log('📱 QR Code pronto para leitura')
          setStatus('qr_ready')
          setError(null)
          
          // Buscar QR Code apenas se ainda não temos um
          if (!qrCode || !showQRModal) {
            try {
              await getQRCode()
            } catch (err) {
              console.error('Erro ao buscar QR Code:', err)
              setError('Erro ao buscar QR Code')
            }
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
      
      // 1. Parar a sessão primeiro
      console.log('🛑 Parando sessão no WAHA...')
      await fetch(`${API_BASE}/sessions/${SESSION_NAME}/stop`, {
        method: 'POST'
      })
      
      // 2. Aguardar um momento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 3. Deletar a sessão
      console.log('🗑️ Deletando sessão no WAHA...')
      const wahaResponse = await fetch(`${API_BASE}/sessions/${SESSION_NAME}`, {
        method: 'DELETE'
      })
      
      console.log(`📡 Resposta WAHA DELETE: ${wahaResponse.status}`)
      
      // 4. Desconectar no backend
      const token = localStorage.getItem('token')
      if (token) {
        console.log('📡 Atualizando status no backend...')
        await fetch(`/api/connections/whatsapp`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform: 'whatsapp',
            status: 'disconnected',
            session_name: SESSION_NAME
          })
        })
      }
      
      // 5. Forçar limpeza do estado
      console.log('🧹 Limpando estado local...')
      setStatus('disconnected')
      setQrCode(null)
      setShowQRModal(false)
      setError(null)
      onUpdate({ isConnected: false, isActive: false })
      
      // 6. Limpar localStorage
      const userId = getUserId()
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`whatsapp_connection_${userId}`)
      }
      
      console.log('✅ Desconexão concluída!')
      
    } catch (err) {
      console.error('❌ Erro durante desconexão:', err)
      
      // Forçar desconexão local mesmo com erro
      console.log('🔧 Forçando desconexão local...')
      setStatus('disconnected')
      setQrCode(null)
      setShowQRModal(false)
      setError(null)
      onUpdate({ isConnected: false, isActive: false })
      
      const userId = getUserId()
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`whatsapp_connection_${userId}`)
      }
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
