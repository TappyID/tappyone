'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Users, Clock, UserCheck, AlertCircle, CheckCircle } from 'lucide-react'

interface FilaBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function FilaBottomSheet({ isOpen, onClose, chatId }: FilaBottomSheetProps) {
  const [filas, setFilas] = useState<any[]>([])
  const [filaAtual, setFilaAtual] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [filaSelecionada, setFilaSelecionada] = useState('')

  // Buscar filas disponíveis e fila atual do contato
  useEffect(() => {
    if (!isOpen || !chatId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const telefone = chatId.replace('@c.us', '')

        // 1. Buscar fila atual do contato
        const conexaoResponse = await fetch(`/api/conexoes/contato/${telefone}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })

        if (conexaoResponse.ok) {
          const conexaoData = await conexaoResponse.json()
          setFilaAtual(conexaoData.fila)
          setFilaSelecionada(conexaoData.fila?.id || '')

        }

        // 2. Buscar todas as filas disponíveis
        const filasResponse = await fetch('/api/filas', {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })

        if (filasResponse.ok) {
          const filasData = await filasResponse.json()
          setFilas(filasData.data || filasData || [])

        }

      } catch {} finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, chatId])

  // Trocar fila do contato
  const handleTrocarFila = async () => {
    if (!filaSelecionada || !chatId) return

    try {
      setLoading(true)
      const telefone = chatId.replace('@c.us', '')

      const response = await fetch(`/api/conexoes/contato/${telefone}/fila`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        },
        body: JSON.stringify({ filaId: filaSelecionada })
      })

      if (response.ok) {

        alert(`✅ Fila trocada com sucesso!`)
        onClose()

        // Disparar evento para atualizar indicadores
        window.dispatchEvent(new CustomEvent('filaChanged', {
          detail: { contatoId: telefone, filaId: filaSelecionada }
        }))
      } else {

        alert('❌ Erro ao trocar fila')
      }
    } catch {

      alert('❌ Erro ao trocar fila')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getFilaColor = (cor: string) => {
    const colors: any = {
      'verde': 'bg-green-100 text-green-800 border-green-200',
      'azul': 'bg-blue-100 text-blue-800 border-blue-200',
      'roxo': 'bg-purple-100 text-purple-800 border-purple-200',
      'vermelho': 'bg-red-100 text-red-800 border-red-200',
      'amarelo': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cinza': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[cor] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white"> Escolher Fila</h2>
              <p className="text-sm text-gray-500">Transferir contato para fila especializada</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 pb-24">
            {/* Fila Atual */}
            {filaAtual && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Fila Atual: {filaAtual.nome || filaAtual.fila?.nome || 'Sem nome'}
                  </span>
                </div>
              </div>
            )}

            {/* Lista de Filas */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando filas...</p>
                </div>
              ) : filas.length > 0 ? (
                filas.map((fila) => (
                  <motion.div
                    key={fila.id || fila.ID}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilaSelecionada(fila.id || fila.ID)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      filaSelecionada === (fila.id || fila.ID)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getFilaColor(fila.cor)}`}>
                            {fila.nome}
                          </span>
                          {filaSelecionada === (fila.id || fila.ID) && (
                            <UserCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {fila.descricao || 'Sem descrição'}
                        </p>
                      </div>

                      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {fila.atendentes && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{fila.atendentes}</span>
                          </div>
                        )}
                        {fila.aguardando !== undefined && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{fila.aguardando}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma fila disponível</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Como funciona:
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                • O contato será transferido para a fila selecionada<br/>
                • Um atendente disponível da fila assumirá o chat<br/>
                • Você receberá notificação sobre a transferência
              </p>
            </div>

            {/* Botão Salvar */}
            <button
              onClick={handleTrocarFila}
              disabled={!filaSelecionada || loading || filaSelecionada === filaAtual?.id}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
                       text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Processando...' : 'Transferir para Fila'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
