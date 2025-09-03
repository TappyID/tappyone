'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, QrCode, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface ChatToggleProps {
  sidebarCollapsed?: boolean
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'error'

export function ChatToggle({ sidebarCollapsed = true }: ChatToggleProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserId = () => {
    if (user?.id) return user.id
    
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

  // Verificar conexão no backend primeiro
  const checkBackendConnection = async () => {
    try {
      const userId = getUserId()
      const response = await fetch('/api/whatsapp/check-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.connected && data.active) {
          setStatus('connected')
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Erro ao verificar backend:', error)
      return false
    }
  }

  // Verificar sessões ativas específicas do usuário
  const checkActiveSessions = async () => {
    try {
      const response = await fetch('/api/whatsapp/sessions')
      
      if (response.ok) {
        const sessions = await response.json()
        const userId = getUserId()
        const userSession = sessions.find((session: any) => 
          session.name === `user_${userId}` && session.status === 'WORKING'
        )
        
        if (userSession) {
          setStatus('connected')
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Erro ao verificar sessões ativas:', error)
      return false
    }
  }

  const checkSessionStatus = async () => {
    // 1. Verificar backend primeiro
    const backendConnected = await checkBackendConnection()
    if (backendConnected) return

    // 2. Verificar sessões ativas
    const sessionActive = await checkActiveSessions()
    if (sessionActive) return

    // 3. Verificar status específico da sessão
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_NAME}/status`)
      const data = await response.json()
      
      if (data.status === 'WORKING') {
        setStatus('connected')
        setQrCode(null)
        setError(null)
      } else if (data.status === 'STARTING') {
        setStatus('connecting')
      } else {
        setStatus('disconnected')
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setStatus('disconnected')
    }
  }

  const startSession = async () => {
    try {
      setStatus('connecting')
      setError(null)
      
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_NAME}/start`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Aguardar um pouco e buscar QR code
        setTimeout(fetchQRCode, 2000)
      } else {
        throw new Error('Falha ao iniciar sessão')
      }
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error)
      setError('Erro ao conectar')
      setStatus('error')
    }
  }

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/api/whatsapp/sessions/${SESSION_NAME}/qr`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          const data = await response.json()
          if (data.qr) {
            setQrCode(data.qr)
            setStatus('qr_ready')
          }
        } else {
          const blob = await response.blob()
          const qrUrl = URL.createObjectURL(blob)
          setQrCode(qrUrl)
          setStatus('qr_ready')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar QR code:', error)
    }
  }

  const stopSession = async () => {
    try {
      await fetch(`/api/whatsapp/sessions/${SESSION_NAME}/stop`, {
        method: 'POST'
      })
      setStatus('disconnected')
      setQrCode(null)
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao parar sessão:', error)
    }
  }

  // Verificar status inicial quando componente carrega
  useEffect(() => {
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
    } else if (status === 'connected') {
      // Polling lento para manter conexão
      interval = setInterval(() => {
        checkSessionStatus()
      }, 10000) // 10 segundos
    } else {
      // Polling normal para desconectado
      interval = setInterval(() => {
        checkSessionStatus()
      }, 5000) // 5 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status])


  const toggleModal = () => {
    setShowModal(!showModal)
    if (!showModal && status === 'disconnected') {
      startSession()
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'connecting': case 'qr_ready': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      {/* WhatsApp Toggle Button */}
      <motion.button
        onClick={toggleModal}
        className={`relative p-2 rounded-xl transition-colors duration-200 group ${
          sidebarCollapsed 
            ? 'hover:bg-gray-100 text-gray-600'
            : 'hover:bg-white/10 text-white'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className={`w-5 h-5 transition-colors duration-200 ${
          sidebarCollapsed 
            ? 'text-gray-600 group-hover:text-[#273155]'
            : 'text-white group-hover:text-green-200'
        }`} />
        
        {/* Status Badge */}
        <motion.div
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {status === 'connecting' && (
            <motion.div
              className="w-full h-full bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ opacity: 0.8 }}
            />
          )}
        </motion.div>
      </motion.button>

      {/* WhatsApp Connection Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-green-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {getStatusIcon()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">WhatsApp Business</h3>
                    <p className="text-xs text-white/70">
                      {status === 'connected' && 'Conectado'}
                      {status === 'connecting' && 'Conectando...'}
                      {status === 'qr_ready' && 'Escaneie o QR Code'}
                      {status === 'disconnected' && 'Desconectado'}
                      {status === 'error' && 'Erro na conexão'}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4">
                {status === 'connected' && (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">WhatsApp conectado com sucesso!</p>
                    <motion.button
                      onClick={stopSession}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Desconectar
                    </motion.button>
                  </div>
                )}

                {(status === 'qr_ready' && qrCode) && (
                  <div className="text-center">
                    <QrCode className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">Escaneie este QR Code no WhatsApp</p>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                      <img 
                        src={qrCode} 
                        alt="QR Code WhatsApp" 
                        className="w-full max-w-[200px] mx-auto"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Abra o WhatsApp {'>'} Menu {'>'} Dispositivos conectados {'>'} Conectar dispositivo
                    </p>
                  </div>
                )}

                {status === 'connecting' && (
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-600">Iniciando conexão...</p>
                  </div>
                )}

                {status === 'disconnected' && (
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">Conecte seu WhatsApp Business</p>
                    <motion.button
                      onClick={startSession}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Conectar WhatsApp
                    </motion.button>
                  </div>
                )}

                {status === 'error' && error && (
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <motion.button
                      onClick={startSession}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Tentar Novamente
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
