'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Bug, RefreshCw, Download, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  source: string
  message: string
  data?: any
}

export default function DebugPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const { actualTheme } = useTheme()

  // Capturar logs do console
  useEffect(() => {
    if (!isCapturing) return

    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    const addLog = (level: LogEntry['level'], source: string, message: string, data?: any) => {
      const newLog: LogEntry = {
        id: Date.now() + Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        level,
        source,
        message,
        data
      }
      
      setLogs(prev => [newLog, ...prev].slice(0, 100)) // Manter apenas 100 logs
    }

    // Interceptar console.log
    console.log = (...args) => {
      originalLog(...args)
      const message = args.join(' ')
      
      // Detectar origem baseado no conteúdo
      let source = 'UNKNOWN'
      if (message.includes('[MODAL]')) source = 'MODAL'
      else if (message.includes('[PAGE]')) source = 'PAGE'
      else if (message.includes('[HOOK]')) source = 'HOOK'
      else if (message.includes('[API ROUTE]')) source = 'API_ROUTE'
      else if (message.includes('🔑')) source = 'AUTH'
      
      const level = message.includes('✅') ? 'success' : 
                   message.includes('❌') ? 'error' :
                   message.includes('⚠️') ? 'warning' : 'info'
      
      addLog(level, source, message, args.length > 1 ? args[1] : undefined)
    }

    // Interceptar console.error
    console.error = (...args) => {
      originalError(...args)
      addLog('error', 'ERROR', args.join(' '), args.length > 1 ? args[1] : undefined)
    }

    // Interceptar console.warn
    console.warn = (...args) => {
      originalWarn(...args)
      addLog('warning', 'WARNING', args.join(' '), args.length > 1 ? args[1] : undefined)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [isCapturing])

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return '#10b981'
      case 'error': return '#ef4444'
      case 'warning': return '#f59e0b'
      default: return actualTheme === 'dark' ? '#60a5fa' : '#3b82f6'
    }
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return CheckCircle2
      case 'error': return XCircle
      case 'warning': return AlertCircle
      default: return Bug
    }
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className={`h-full flex flex-col ${
        actualTheme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${
          actualTheme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Bug className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Debug Console
                </h1>
                <p className={`text-sm ${
                  actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                }`}>
                  Monitoramento de logs em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setIsCapturing(!isCapturing)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isCapturing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${isCapturing ? 'animate-spin' : ''}`} />
                {isCapturing ? 'Parar Captura' : 'Iniciar Captura'}
              </motion.button>

              <motion.button
                onClick={downloadLogs}
                disabled={logs.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  logs.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : actualTheme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                whileHover={{ scale: logs.length > 0 ? 1.05 : 1 }}
                whileTap={{ scale: logs.length > 0 ? 0.95 : 1 }}
              >
                <Download className="w-4 h-4" />
                Download
              </motion.button>

              <motion.button
                onClick={clearLogs}
                disabled={logs.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  logs.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                whileHover={{ scale: logs.length > 0 ? 1.05 : 1 }}
                whileTap={{ scale: logs.length > 0 ? 0.95 : 1 }}
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </motion.button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={`px-6 py-4 border-b ${
          actualTheme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  isCapturing ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={`text-sm font-medium ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Status: {isCapturing ? 'Capturando' : 'Parado'}
                </span>
              </div>
              <div className={`text-sm ${
                actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
              }`}>
                Total de logs: {logs.length}
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto p-6">
          {logs.length === 0 ? (
            <div className={`text-center py-12 ${
              actualTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
            }`}>
              {isCapturing ? (
                <p>Aguardando logs... Crie um quadro para ver os logs em tempo real.</p>
              ) : (
                <p>Clique em "Iniciar Captura" e crie um quadro para ver os logs.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const Icon = getLevelIcon(log.level)
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{
                          backgroundColor: `${getLevelColor(log.level)}20`,
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: getLevelColor(log.level) }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-xs font-mono px-2 py-1 rounded ${
                            actualTheme === 'dark'
                              ? 'bg-slate-700 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {log.timestamp}
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-1 rounded text-white"
                            style={{ backgroundColor: getLevelColor(log.level) }}
                          >
                            {log.source}
                          </span>
                        </div>
                        
                        <p className={`text-sm font-mono break-all ${
                          actualTheme === 'dark' ? 'text-white/80' : 'text-gray-700'
                        }`}>
                          {log.message}
                        </p>
                        
                        {log.data && (
                          <details className="mt-2">
                            <summary className={`text-xs cursor-pointer ${
                              actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
                            }`}>
                              Dados adicionais
                            </summary>
                            <pre className={`mt-2 text-xs p-3 rounded overflow-auto ${
                              actualTheme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
                            }`}>
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
