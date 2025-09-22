'use client'

import React, { useState, useEffect } from 'react'
import { X, DollarSign } from 'lucide-react'

interface OrcamentosSidebarProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function OrcamentosSidebar({ isOpen, onClose, chatId }: OrcamentosSidebarProps) {
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && chatId) {
      fetchOrcamentos()
    }
  }, [isOpen, chatId])

  const fetchOrcamentos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orcamentos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrcamentos(data || [])
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
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Orçamentos</h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {orcamentos.length}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge Total - Bem Bonita */}
        {orcamentos.length > 0 && (
          <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 opacity-75 font-medium">Total em Orçamentos</p>
                <p className="text-2xl font-bold text-green-700">
                  R$ {orcamentos.reduce((total: number, orc: any) => total + (orc.valorTotal || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : orcamentos.length > 0 ? (
            orcamentos.map((orcamento: any) => (
              <div key={orcamento.id} className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{orcamento.titulo}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {orcamento.status}
                  </span>
                </div>
                
                {orcamento.observacao && (
                  <p className="text-sm text-gray-600 mb-3">{orcamento.observacao}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    <DollarSign className="w-3 h-3" />
                    <span>R$ {orcamento.valorTotal?.toFixed(2)}</span>
                  </div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {new Date(orcamento.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum orçamento encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
