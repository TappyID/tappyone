'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface WhatsAppSession {
  id: string
  name: string
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'error'
  qrCode?: string
  sessionInfo?: any
  error?: string
}

export function useWhatsAppSession() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Map<string, WhatsAppSession>>(new Map())

  const API_BASE = '/api/whatsapp' // Usar API routes internas para evitar Mixed Content
  const API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

  const getSessionName = useCallback((userId?: string) => {
    return userId ? `user_${userId}` : 'default'
  }, [])

  const createSession = useCallback(async (userId?: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const sessionName = getSessionName(userId || user.id?.toString())
    
    // Atualizar estado local
    setSessions(prev => new Map(prev.set(sessionName, {
      id: sessionName,
      name: sessionName,
      status: 'connecting'
    })))

    try {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          name: sessionName,
          start: true,
          config: {
            metadata: {
              'user.id': user.id?.toString() || '0',
              'user.email': user.email || 'admin@tappyone.com',
              'user.name': user.nome || 'Admin',
              'company': 'TappyOne CRM'
            },
            proxy: null,
            debug: false,
            noweb: {
              store: {
                enabled: true,
                fullSync: false
              }
            },
            webhooks: [
              {
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/webhooks/whatsapp`,
                events: ['message', 'session.status'],
                hmac: null,
                retries: {
                  delaySeconds: 2,
                  attempts: 15
                },
                customHeaders: [
                  {
                    name: 'Authorization',
                    value: `Bearer ${localStorage.getItem('token') || ''}`
                  }
                ]
              }
            ]
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(prev => new Map(prev.set(sessionName, {
          id: sessionName,
          name: sessionName,
          status: 'qr_ready',
          sessionInfo: data
        })))
        return data
      } else {
        throw new Error(`Falha ao criar sessão: ${response.status}`)
      }
    } catch (error) {
      setSessions(prev => new Map(prev.set(sessionName, {
        id: sessionName,
        name: sessionName,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })))
      throw error
    }
  }, [user, API_BASE, API_KEY, getSessionName])

  const getQRCode = useCallback(async (sessionName: string) => {
    try {
      const response = await fetch(`${API_BASE}/${sessionName}/auth/qr?format=image`, {
        headers: {
          'Accept': 'image/png',
          'X-Api-Key': API_KEY
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const qrUrl = URL.createObjectURL(blob)
        
        setSessions(prev => {
          const session = prev.get(sessionName)
          if (session) {
            return new Map(prev.set(sessionName, { ...session, qrCode: qrUrl }))
          }
          return prev
        })
        
        return qrUrl
      } else {
        throw new Error('Falha ao obter QR Code')
      }
    } catch (error) {
      setSessions(prev => {
        const session = prev.get(sessionName)
        if (session) {
          return new Map(prev.set(sessionName, { 
            ...session, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro ao obter QR Code'
          }))
        }
        return prev
      })
      throw error
    }
  }, [API_BASE, API_KEY])

  const checkSessionStatus = useCallback(async (sessionName: string) => {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionName}`, {
        headers: {
          'X-Api-Key': API_KEY
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        let status: WhatsAppSession['status'] = 'disconnected'
        if (data.status === 'WORKING') {
          status = 'connected'
        } else if (data.status === 'SCAN_QR_CODE') {
          status = 'qr_ready'
        } else if (data.status === 'FAILED' || data.status === 'STOPPED') {
          status = 'error'
        }

        setSessions(prev => {
          const session = prev.get(sessionName)
          if (session) {
            return new Map(prev.set(sessionName, { 
              ...session, 
              status,
              sessionInfo: data,
              error: status === 'error' ? 'Sessão falhou ou foi interrompida' : undefined
            }))
          }
          return prev
        })
        
        return data
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }, [API_BASE, API_KEY])

  const disconnectSession = useCallback(async (sessionName: string) => {
    try {
      await fetch(`${API_BASE}/sessions/${sessionName}`, {
        method: 'DELETE',
        headers: {
          'X-Api-Key': API_KEY
        }
      })
      
      setSessions(prev => {
        const newSessions = new Map(prev)
        newSessions.delete(sessionName)
        return newSessions
      })
    } catch (error) {
      setSessions(prev => {
        const session = prev.get(sessionName)
        if (session) {
          return new Map(prev.set(sessionName, { 
            ...session, 
            status: 'error',
            error: 'Erro ao desconectar'
          }))
        }
        return prev
      })
      throw error
    }
  }, [API_BASE, API_KEY])

  return {
    sessions: Array.from(sessions.values()),
    getSession: (sessionName: string) => sessions.get(sessionName),
    createSession,
    getQRCode,
    checkSessionStatus,
    disconnectSession,
    getSessionName
  }
}
