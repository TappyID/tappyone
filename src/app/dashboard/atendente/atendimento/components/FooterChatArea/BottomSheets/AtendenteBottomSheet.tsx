'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, UserCheck, Users, Circle, Search, CheckCircle } from 'lucide-react'

interface AtendenteBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function AtendenteBottomSheet({ isOpen, onClose, chatId }: AtendenteBottomSheetProps) {
  const [atendentes, setAtendentes] = useState<any[]>([])
  const [atendentesAtuais, setAtendentesAtuais] = useState<any[]>([])
  const [atendenteSelecionado, setAtendenteSelecionado] = useState('')
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState('')

  // Buscar atendentes disponíveis e atuais do contato
  useEffect(() => {
    if (!isOpen || !chatId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const telefone = chatId.replace('@c.us', '')

        // 1. Buscar atendentes atuais do contato
        const conexaoResponse = await fetch(`/api/conexoes/contato/${telefone}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })

        if (conexaoResponse.ok) {
          const conexaoData = await conexaoResponse.json()
          setAtendentesAtuais(conexaoData.atendentes || [])
          if (conexaoData.atendentes && conexaoData.atendentes.length > 0) {
            setAtendenteSelecionado(conexaoData.atendentes[0].id || conexaoData.atendentes[0].ID)
          }

        }

        // 2. Buscar todos os atendentes disponíveis
        const atendentesResponse = await fetch('/api/atendentes', {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })

        if (atendentesResponse.ok) {
          const atendentesData = await atendentesResponse.json()
          setAtendentes(atendentesData.data || atendentesData || [])

        }

      } catch {} finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, chatId])

  // Atribuir atendente ao contato
  const handleAtribuirAtendente = async () => {
    if (!atendenteSelecionado || !chatId) return

    try {
      setLoading(true)
      const telefone = chatId.replace('@c.us', '')

      const response = await fetch(`/api/conexoes/contato/${telefone}/atendente`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        },
        body: JSON.stringify({ atendenteId: atendenteSelecionado })
      })

      if (response.ok) {

        alert(`✅ Atendente atribuído com sucesso!`)
        onClose()

        // Disparar evento para atualizar indicadores
        window.dispatchEvent(new CustomEvent('atendenteChanged', {
          detail: { contatoId: telefone, atendenteId: atendenteSelecionado }
        }))
      } else {

        alert('❌ Erro ao atribuir atendente')
      }
    } catch {

      alert('❌ Erro ao atribuir atendente')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Filtrar atendentes pela busca
  const atendentesFiltrados = atendentes.filter(atendente =>
    (atendente.nome || atendente.name || '').toLowerCase().includes(busca.toLowerCase()) ||
    (atendente.email || '').toLowerCase().includes(busca.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors: any = {
      'online': 'text-green-600',
      'ocupado': 'text-yellow-600',
      'ausente': 'text-red-600',
      'offline': 'text-gray-400'
    }
    return colors[status] || 'text-gray-400'
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Disponível'
      case 'ocupado': return 'Ocupado'
      case 'ausente': return 'Ausente'
      default: return 'Offline'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: any = {
      'online': 'bg-green-500',
      'ocupado': 'bg-yellow-500',
      'ausente': 'bg-red-500',
      'offline': 'bg-gray-400'
    }
    return colors[status] || 'bg-gray-400'
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
            <UserCheck className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">👨‍💼 Escolher Atendente</h2>
              <p className="text-sm text-gray-500">Transferir contato para atendente específico</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 pb-24">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar atendente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Lista de Atendentes */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando atendentes...</p>
              </div>
            ) : atendentesAtuais.length > 0 && (
              <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-900 dark:text-teal-100">
                    Atendente Atual: {atendentesAtuais.map(a => a.nome || a.name).join(', ')}
                  </span>
                </div>
              </div>
            )}

            {atendentesFiltrados.map((atendente) => (
              <motion.button
                key={atendente.id || atendente.ID}
                onClick={() => setAtendenteSelecionado(atendente.id || atendente.ID)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                  atendenteSelecionado === (atendente.id || atendente.ID)
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                        {atendente.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusBadgeColor(atendente.status || 'offline')} rounded-full border-2 border-white`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                        {atendente.nome}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {atendente.email}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${atendente.cor}`}>
                          {atendente.especialidade}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getStatusText(atendente.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{atendente.chatsAtivos}</span>
                    </div>
                    <span className="text-xs text-gray-500">chats ativos</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {atendentesFiltrados.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum atendente encontrado</p>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mt-6">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Atenção:
            </p>
            <p className="text-xs text-amber-500 dark:text-amber-300 mt-1">
              • O chat será transferido imediatamente<br/>
              • O atendente receberá notificação<br/>
              • Histórico da conversa será mantido
            </p>
          </div>

          {/* Botão Salvar */}
          <button
            onClick={handleAtribuirAtendente}
            disabled={!atendenteSelecionado || loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400
                     text-white font-medium rounded-lg transition-colors mt-4"
          >
            {loading ? 'Processando...' : 'Atribuir Atendente'}
          </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
