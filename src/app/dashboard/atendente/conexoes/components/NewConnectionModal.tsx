'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { 
  X, 
  MessageCircle, 
  Loader2,
  QrCode,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface NewConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type ConnectionStatus = 'idle' | 'creating' | 'qr_ready' | 'connected' | 'error'

export function NewConnectionModal({ isOpen, onClose, onSuccess }: NewConnectionModalProps) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [sessionName, setSessionName] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateSessionName = () => {
    const timestamp = Date.now()
    const userId = user?.id || 'default'
    return `user_${userId.slice(0, 8)}_${timestamp}`
  }

  const createNewConnection = async () => {
    try {
      setStatus('creating')
      setError(null)
      
      const newSessionName = generateSessionName()
      setSessionName(newSessionName)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      // 1. Verificar se já existe uma sessão para este usuário
      console.log('🔍 Verificando sessões existentes...')
      const sessionsResponse = await fetch('/api/whatsapp/sessions')
      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json()
        const userSessions = sessions.filter((s: any) => s.name.startsWith(`user_${user?.id}`))
        
        if (userSessions.length > 0) {
          const existingSession = userSessions[0]
          console.log('✅ Sessão existente encontrada:', existingSession.name)
          setSessionName(existingSession.name)
          
          if (existingSession.status === 'WORKING') {
            setStatus('connected')
            setTimeout(() => {
              onSuccess()
              handleClose()
            }, 2000)
            return
          } else if (existingSession.status === 'SCAN_QR_CODE') {
            await checkForQRCode(existingSession.name)
            monitorConnectionStatus(existingSession.name)
            return
          }
        }
      }

      // 2. Criar nova sessão apenas se não existir
      console.log('🔄 Criando nova sessão:', newSessionName)
      const createResponse = await fetch('/api/whatsapp/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newSessionName,
          config: {
            webhooks: [
              {
                url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/webhooks/whatsapp`,
                events: ['message', 'message.any'],
                hmac: null,
                retries: {
                  maxRetries: 3,
                  delay: 1000
                },
                customHeaders: []
              }
            ]
          }
        })
      })

      if (!createResponse.ok && createResponse.status !== 409) {
        const error = await createResponse.text()
        throw new Error(`Erro ao criar sessão: ${error}`)
      }

      console.log('✅ Sessão criada via backend')

      // 3. Aguardar um pouco para sessão ser inicializada
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 4. Iniciar a sessão WAHA
      console.log('🚀 Iniciando sessão WAHA:', newSessionName)
      const startResponse = await fetch(`/api/whatsapp/sessions/${newSessionName}/start`, {
        method: 'POST'
      })

      if (startResponse.ok) {
        console.log('✅ Sessão WAHA iniciada')
      } else {
        console.log('⚠️ Erro ao iniciar sessão, tentando continuar...')
      }

      // 5. Aguardar um pouco para inicialização
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 6. Tentar obter QR Code
      await checkForQRCode(newSessionName)

      // 7. Monitorar status da conexão
      monitorConnectionStatus(newSessionName)

    } catch (err) {
      console.error('Erro ao criar conexão:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStatus('error')
    }
  }

  const checkForQRCode = async (sessionName: string) => {
    try {
      console.log('📱 Buscando QR Code para sessão:', sessionName)
      
      // Tentar múltiplos endpoints para QR Code
      const endpoints = [
        `/api/whatsapp/${sessionName}/auth/qr?format=image`,
        `/api/whatsapp/sessions/${sessionName}/qr`
      ]

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Tentando endpoint: ${endpoint}`)
          const token = localStorage.getItem('token')
          
          const response = await fetch(endpoint, {
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
              setStatus('qr_ready')
              console.log('✅ QR Code obtido via:', endpoint)
              return
            }
          } else {
            console.log(`❌ ${endpoint} retornou:`, response.status)
          }
        } catch (err) {
          console.log(`❌ Erro em ${endpoint}:`, err)
        }
      }

      // Se não conseguiu QR, verificar se já está conectado
      console.log('⏳ QR Code não encontrado, verificando status...')
      setTimeout(() => checkConnectionStatus(sessionName), 2000)

    } catch (error) {
      console.error('Erro ao buscar QR Code:', error)
      setError('Erro ao obter QR Code')
      setStatus('error')
    }
  }

  const checkConnectionStatus = async (sessionName: string) => {
    try {
      const response = await fetch(`/api/whatsapp/sessions/${sessionName}`)
      
      if (response.ok) {
        const session = await response.json()
        
        if (session.status === 'WORKING') {
          setStatus('connected')
          setTimeout(() => {
            onSuccess()
            handleClose()
          }, 2000)
        } else if (session.status === 'SCAN_QR_CODE' && !qrCode) {
          await checkForQRCode(sessionName)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const monitorConnectionStatus = (sessionName: string) => {
    let attempts = 0
    const maxAttempts = 100 // 5 minutos (3s * 100)
    
    const interval = setInterval(async () => {
      attempts++
      
      if (status === 'connected' || attempts >= maxAttempts) {
        clearInterval(interval)
        return
      }

      await checkConnectionStatus(sessionName)
    }, 3000)

    return interval
  }

  const handleClose = () => {
    setStatus('idle')
    setSessionName('')
    setQrCode(null)
    setError(null)
    onClose()
  }

  const getStatusContent = () => {
    switch (status) {
      case 'creating':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Criando Conexão
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Preparando sessão WhatsApp...
            </p>
          </div>
        )

      case 'qr_ready':
        return (
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Escaneie o QR Code
              </h3>
              <p className={`text-sm mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Use seu WhatsApp para conectar
              </p>
            </div>

            {qrCode && (
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
                  <p>2. Toque em Mais opções → Aparelhos conectados</p>
                  <p>3. Toque em Conectar um aparelho</p>
                  <p>4. Escaneie este código QR</p>
                </div>
              </div>
            )}
          </div>
        )

      case 'connected':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Conectado com Sucesso!
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              WhatsApp conectado e funcionando
            </p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Erro na Conexão
            </h3>
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              {error}
            </p>
            <motion.button
              onClick={createNewConnection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tentar Novamente
            </motion.button>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Nova Conexão WhatsApp
            </h3>
            <p className={`text-sm mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Conecte uma nova conta do WhatsApp Business
            </p>
            <motion.button
              onClick={createNewConnection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center gap-2 mx-auto"
            >
              <MessageCircle className="w-5 h-5" />
              Conectar WhatsApp
            </motion.button>
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Nova Conexão
                  </h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {sessionName ? `Sessão: ${sessionName}` : 'WhatsApp Business'}
                  </p>
                </div>
              </div>

              {status === 'idle' && (
                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.1 }}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {getStatusContent()}
            </div>

            {/* Footer */}
            {(status === 'connected' || status === 'error') && (
              <div className={`px-6 py-4 border-t ${
                theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.05 }}
                  className={`w-full py-2 rounded-lg font-medium ${
                    theme === 'dark' 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {status === 'connected' ? 'Continuar' : 'Fechar'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
