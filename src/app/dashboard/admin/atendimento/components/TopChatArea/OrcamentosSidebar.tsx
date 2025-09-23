'use client'

import React, { useState, useEffect } from 'react'
import { X, DollarSign } from 'lucide-react'
import { getContactUUID } from './utils/getContactUUID'

interface OrcamentosSidebarProps {
  isOpen: boolean
  onClose: () => void
  contatoId?: string
}

export default function OrcamentosSidebar({ isOpen, onClose, contatoId }: OrcamentosSidebarProps) {
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && contatoId) {
      fetchOrcamentos()
    }
  }, [isOpen, contatoId])

  const fetchOrcamentos = async () => {
    setLoading(true)
    console.log('💰 [OrcamentosSidebar] Buscando orçamentos do contato:', contatoId)
    try {
      // 1. Buscar UUID do contato
      const contatoUUID = await getContactUUID(contatoId!)
      if (!contatoUUID) {
        console.log('💰 [OrcamentosSidebar] UUID não encontrado')
        setOrcamentos([])
        return
      }
      
      // 2. Buscar orçamentos usando o UUID
      const token = localStorage.getItem('token')
      const response = await fetch(`http://159.65.34.199:8081/api/orcamentos?contato_id=${contatoUUID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('💰 [OrcamentosSidebar] Orçamentos recebidos:', result)
        const orcamentos = result.data || result || []
        setOrcamentos(Array.isArray(orcamentos) ? orcamentos : [])
        console.log('💰 [OrcamentosSidebar] Total de orçamentos:', orcamentos.length)
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
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
                  R$ {orcamentos.reduce((total: number, orc: any) => {
                    let valor = orc.valorTotal || orc.valor_total || orc.valor || 0;
                    if (valor === 0 && orc.itens?.length > 0) {
                      valor = orc.itens.reduce((sum: number, item: any) => 
                        sum + (item.valor || 0) * (item.quantidade || 1), 0
                      );
                    }
                    return total + valor;
                  }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <div key={orcamento.id} className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {orcamento.titulo || `Orçamento #${orcamento.id?.slice(0, 8)}`}
                    </h4>
                    {orcamento.descricao && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {orcamento.descricao}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {(() => {
                          const data = orcamento.createdAt || orcamento.criadoEm || orcamento.created_at || orcamento.data;
                          return data ? new Date(data).toLocaleDateString('pt-BR') : 'Sem data';
                        })()}
                      </span>
                      {orcamento.status && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          orcamento.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                          orcamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {orcamento.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-lg font-bold text-green-600">
                      R$ {(() => {
                        // Tentar pegar o valor de diferentes formas
                        let valor = orcamento.valorTotal || orcamento.valor_total || orcamento.valor || 0;
                        
                        // Se valor for 0 e tiver itens, calcular a partir dos itens
                        if (valor === 0 && orcamento.itens?.length > 0) {
                          valor = orcamento.itens.reduce((sum: number, item: any) => 
                            sum + (item.valor || 0) * (item.quantidade || 1), 0
                          );
                        }
                        
                        return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      })()}
                    </span>
                    {orcamento.itens?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {orcamento.itens.length} {orcamento.itens.length === 1 ? 'item' : 'itens'}
                      </p>
                    )}
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
