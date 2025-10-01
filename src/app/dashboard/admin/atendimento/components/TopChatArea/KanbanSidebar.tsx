'use client'

import React, { useState, useEffect } from 'react'
import { X, LayoutDashboard, ArrowRight, Clock } from 'lucide-react'

interface KanbanSidebarProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function KanbanSidebar({ isOpen, onClose, chatId }: KanbanSidebarProps) {
  const [kanban, setKanban] = useState<any>(null)
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && chatId) {
      fetchKanban()
    }
  }, [isOpen, chatId])

  const fetchKanban = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban?chatId=${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setKanban(data.kanban || null)
        setHistorico(data.historico || [])
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'em andamento': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'finalizado': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl border-l">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Status Kanban</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : kanban ? (
            <>
              {/* Status Atual */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 opacity-75 font-medium">Status Atual</p>
                    <h4 className="text-xl font-bold text-blue-700">{kanban.status}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Desde: {new Date(kanban.atualizadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <LayoutDashboard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Informações do Kanban */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Detalhes</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Responsável</span>
                    <span className="text-sm font-medium">{kanban.responsavel || 'Não atribuído'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Prioridade</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      kanban.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                      kanban.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {kanban.prioridade || 'Normal'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Tempo no Status</span>
                    <span className="text-sm font-medium">{kanban.tempoNoStatus || '0h'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Estimativa</span>
                    <span className="text-sm font-medium">{kanban.estimativa || 'Não definida'}</span>
                  </div>
                </div>
              </div>

              {/* Histórico de Mudanças */}
              <div>
                <h5 className="font-medium text-gray-700 mb-3">Histórico de Status</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {historico.length > 0 ? (
                    historico.map((item: any, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(item.statusAnterior)}`}>
                            {item.statusAnterior}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(item.statusNovo)}`}>
                            {item.statusNovo}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">{item.responsavel}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {item.observacao && (
                          <p className="text-xs text-gray-600 mt-1">{item.observacao}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Nenhum histórico encontrado
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <LayoutDashboard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Chat não possui status kanban</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
