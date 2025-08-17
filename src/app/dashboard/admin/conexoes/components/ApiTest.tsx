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
      
      const API_BASE = 'https://apiwhatsapp.vyzer.com.br/api'
      const API_KEY = 'atendia-waha-2024-secretkey'

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Teste de API WhatsApp
        </h3>
        <motion.button
          onClick={testAPI}
          disabled={testing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-[#273155] text-white rounded-lg hover:bg-[#1e2442] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          {testing ? 'Testando...' : 'Testar API'}
        </motion.button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <span className={`font-medium ${
              result.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {result.message}
            </span>
          </div>
          
          {result.data && (
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </motion.div>
      )}
    </div>
  )
}
