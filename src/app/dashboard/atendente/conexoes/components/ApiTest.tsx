'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, CheckCircle, XCircle } from 'lucide-react'

export function ApiTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testAPI = async () => {
    setTesting(true)
    setResult(null)

    try {
      console.log('Testando API WhatsApp...')
      
      const API_BASE = 'http://159.65.34.199:3001/api'
      const API_KEY = 'tappyone-waha-2024-secretkey'

      // Teste 1: Listar sessões existentes
      console.log('1. Listando sessões...')
      const listResponse = await fetch(`${API_BASE}/sessions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Api-Key': API_KEY
        }
      })

      if (listResponse.ok) {
        const sessions = await listResponse.json()
        console.log('Sessões existentes:', sessions)
        
        setResult({
          success: true,
          message: `API funcionando! ${sessions.length} sessões encontradas.`,
          data: sessions,
          status: listResponse.status
        })
        return
      }

      // Teste 2: Criar sessão simples sem webhooks
      console.log('2. Criando sessão simples...')
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          name: 'test-session',
          start: true,
          config: {
            metadata: {
              'user.id': '123',
              'user.email': 'test@example.com'
            },
            debug: false,
            noweb: {
              store: {
                enabled: true,
                fullSync: false
              }
            }
          }
        })
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: 'Sessão criada com sucesso!',
          data: data,
          status: response.status
        })
      } else {
        const errorData = await response.json().catch(() => null)
        setResult({
          success: false,
          message: `Erro ${response.status}: ${errorData?.message || 'Erro desconhecido'}`,
          data: errorData,
          status: response.status
        })
      }
    } catch (error) {
      console.error('Erro no teste:', error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error: error
      })
    } finally {
      setTesting(false)
    }
  }

 
}
