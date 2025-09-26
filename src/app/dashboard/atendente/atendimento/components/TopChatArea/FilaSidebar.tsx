'use client'

import React, { useState, useEffect } from 'react'
import { X, Users, Clock, TrendingUp } from 'lucide-react'

interface FilaSidebarProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function FilaSidebar({ isOpen, onClose, chatId }: FilaSidebarProps) {
  const [fila, setFila] = useState<any>(null)
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && chatId) {
      fetchFila()
    }
  }, [isOpen, chatId])

  const fetchFila = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/filas?chatId=${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFila(data.fila || null)
        setEstatisticas(data.estatisticas || null)
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
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Fila de Atendimento</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : fila ? (
            <>
              {/* Card da Fila */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{fila.nome}</h4>
                    <p className="text-sm text-gray-600">{fila.descricao}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Estatísticas da Fila */}
              {estatisticas && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{estatisticas.aguardando || 0}</p>
                    <p className="text-xs text-gray-600">Aguardando</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{estatisticas.tempoMedio || '0m'}</p>
                    <p className="text-xs text-gray-600">Tempo Médio</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{estatisticas.atendidos || 0}</p>
                    <p className="text-xs text-gray-600">Atendidos Hoje</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{estatisticas.agentes || 0}</p>
                    <p className="text-xs text-gray-600">Agentes Online</p>
                  </div>
                </div>
              )}

              {/* Informações da Fila */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Configurações</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Prioridade</span>
                    <span className="text-sm font-medium">{fila.prioridade || 'Normal'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Limite por Agente</span>
                    <span className="text-sm font-medium">{fila.limitePorAgente || 'Ilimitado'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Horário de Funcionamento</span>
                    <span className="text-sm font-medium">{fila.horario || '24h'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      fila.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {fila.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Chat não está em nenhuma fila</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
