'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Clock, MessageCircle } from 'lucide-react'

interface AtendenteSidebarProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function AtendenteSidebar({ isOpen, onClose, chatId }: AtendenteSidebarProps) {
  const [atendente, setAtendente] = useState<any>(null)
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && chatId) {
      fetchAtendente()
    }
  }, [isOpen, chatId])

  const fetchAtendente = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/atendentes?chatId=${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAtendente(data.atendente || null)
        setHistorico(data.historico || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl border-l">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold">Atendente</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : atendente ? (
            <>
              {/* Card do Atendente */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{atendente.nome}</h4>
                    <p className="text-sm text-gray-600">{atendente.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${atendente.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">
                        {atendente.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{atendente.totalChats || 0}</p>
                  <p className="text-xs text-gray-600">Chats Ativos</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{atendente.tempoMedio || '0m'}</p>
                  <p className="text-xs text-gray-600">Tempo Médio</p>
                </div>
              </div>

              {/* Histórico */}
              <div>
                <h5 className="font-medium text-gray-700 mb-3">Histórico de Atendimentos</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {historico.length > 0 ? (
                    historico.map((item: any, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">{item.acao}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {item.observacao && (
                          <p className="text-xs text-gray-600">{item.observacao}</p>
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
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum atendente atribuído</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
