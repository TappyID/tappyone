'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, DollarSign, Plus, Trash2, FileText } from 'lucide-react'
import { fetchApi } from '@/utils/api'

interface OrcamentoBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function OrcamentoBottomSheet({ isOpen, onClose, chatId }: OrcamentoBottomSheetProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [itens, setItens] = useState([{ descricao: '', quantidade: 1, valor: 0 }])
  const [desconto, setDesconto] = useState(0)
  const [observacoes, setObservacoes] = useState('')
  const [orcamentosExistentes, setOrcamentosExistentes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  console.log('💰 [OrcamentoBottomSheet] Renderizado com chatId:', chatId)

  // 🚀 BUSCAR ORÇAMENTOS ESPECÍFICOS DO CHAT
  const fetchOrcamentos = useCallback(async () => {
    if (!chatId) return
    
    try {
      setLoading(true)
      console.log('💰 [OrcamentoBottomSheet] Buscando orçamentos para chatId:', chatId)
      
      // 🚀 NOVA URL ESPECÍFICA POR CHAT
      const path = `/api/chats/${encodeURIComponent(chatId)}/orcamentos`
      console.log('🌐 [OrcamentoBottomSheet] Path backend:', path)
      
      const response = await fetchApi('backend', path)
      
      if (!response.ok) {
        console.log('💰 [OrcamentoBottomSheet] Erro ao buscar orçamentos:', response.status)
        setOrcamentosExistentes([])
        return
      }
      
      const data = await response.json()
      const orcamentosData = Array.isArray(data) ? data : (data.data || [])
      
      console.log('💰 [OrcamentoBottomSheet] Resposta completa da API:', data)
      console.log('💰 [OrcamentoBottomSheet] Total de orçamentos retornados:', orcamentosData.length)
      
      setOrcamentosExistentes(orcamentosData)
      
    } catch (error) {
      console.error('❌ [OrcamentoBottomSheet] Erro ao buscar orçamentos:', error)
      setOrcamentosExistentes([])
    } finally {
      setLoading(false)
    }
  }, [chatId])

  // Carregar orçamentos quando abrir
  useEffect(() => {
    if (isOpen) {
      fetchOrcamentos()
    }
  }, [isOpen, fetchOrcamentos])

  if (!isOpen) return null

  const adicionarItem = () => {
    setItens([...itens, { descricao: '', quantidade: 1, valor: 0 }])
  }

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...itens]
    novosItens[index] = { ...novosItens[index], [campo]: valor }
    setItens(novosItens)
  }

  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor), 0)
  const total = subtotal - desconto

  const handleSave = async () => {
    if (!titulo.trim()) {
      alert('❌ Título é obrigatório!')
      return
    }

    try {
      console.log('💰 [OrcamentoBottomSheet] Criando orçamento para chatId:', chatId)
      
      const orcamentoData = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        valor_total: total,
        status: 'rascunho',
        observacoes: observacoes.trim(),
        itens: itens.map(item => ({
          descricao: item.descricao.trim(),
          quantidade: item.quantidade,
          valor_unitario: item.valor,
          valor_total: item.quantidade * item.valor
        }))
      }
      
      console.log('💰 [OrcamentoBottomSheet] Dados do orçamento:', orcamentoData)
      
      // 🚀 NOVA URL ESPECÍFICA POR CHAT
      const path = `/api/chats/${encodeURIComponent(chatId || '')}/orcamentos`
      const response = await fetchApi('backend', path, {
        method: 'POST',
        body: JSON.stringify(orcamentoData)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ [OrcamentoBottomSheet] Orçamento criado com sucesso:', result)
        
        // Toaster de sucesso
        alert(`💰 Orçamento "${titulo}" criado com sucesso! Valor: R$ ${total.toFixed(2)}`)
        
        // Limpar formulário
        setTitulo('')
        setDescricao('')
        setItens([{ descricao: '', quantidade: 1, valor: 0 }])
        setDesconto(0)
        setObservacoes('')
        onClose()
        
        // Disparar evento personalizado para atualizar indicadores
        window.dispatchEvent(new CustomEvent('orcamentoCreated', { 
          detail: { chatId, orcamento: result } 
        }))
        
        // Recarregar orçamentos
        fetchOrcamentos()
        
      } else {
        // Capturar erro detalhado
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        console.error('❌ Erro detalhado da API:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        alert(`Erro ao criar orçamento: ${errorData.error || errorData.message || response.statusText}`)
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar orçamento:', error)
    }
    
    onClose()
  }

  // Deletar orçamento
  const handleDeletarOrcamento = async (orcamentoId: string) => {
    if (!confirm('Deseja realmente deletar este orçamento?')) return
    
    try {
      // 🚀 NOVA URL ESPECÍFICA POR CHAT
      const path = `/api/chats/${encodeURIComponent(chatId || '')}/orcamentos/${orcamentoId}`
      const response = await fetchApi('backend', path, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        console.log('✅ Orçamento deletado com sucesso!')
        fetchOrcamentos() // Recarregar orçamentos
        
        // Disparar evento para atualizar indicadores
        window.dispatchEvent(new CustomEvent('orcamentoDeleted', { 
          detail: { orcamentoId } 
        }))
      } else {
        console.error('❌ Erro ao deletar orçamento:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao deletar orçamento:', error)
    }
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
        className="absolute bottom-0 left-0 right-0 w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💰 Novo Orçamento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 pb-24">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Proposta Comercial"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Itens do Orçamento</label>
              <button
                onClick={adicionarItem}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {itens.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                      placeholder="Descrição do item"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(index, 'quantidade', Number(e.target.value))}
                      placeholder="Qtd"
                      min="1"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.valor}
                      onChange={(e) => atualizarItem(index, 'valor', Number(e.target.value))}
                      placeholder="Valor"
                      step="0.01"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm font-medium">R$ {(item.quantidade * item.valor).toFixed(2)}</span>
                  </div>
                  <div className="col-span-1">
                    {itens.length > 1 && (
                      <button
                        onClick={() => removerItem(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Desconto (R$)</label>
              <input
                type="number"
                value={desconto}
                onChange={(e) => setDesconto(Number(e.target.value))}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Subtotal: R$ {subtotal.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Desconto: R$ {desconto.toFixed(2)}</div>
                <div className="text-lg font-bold text-green-600">Total: R$ {total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Condições, prazo de validade, etc..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Orçamentos Existentes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Orçamentos Existentes ({orcamentosExistentes.length})
            </h3>
            
            {loading && orcamentosExistentes.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando orçamentos...</p>
              </div>
            ) : orcamentosExistentes.length > 0 ? (
              <div className="space-y-3">
                {orcamentosExistentes.map((orcamento) => (
                  <motion.div
                    key={orcamento.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {orcamento.titulo}
                        </h4>
                        {orcamento.descricao && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {orcamento.descricao}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          R$ {(orcamento.valorTotal || 0).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeletarOrcamento(orcamento.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Deletar orçamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {orcamento.itens && orcamento.itens.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Itens:</p>
                        {orcamento.itens.map((item: any, index: number) => (
                          <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                            {item.quantidade}x {item.descricao} - R$ {(item.valor || 0).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500">
                        {new Date(orcamento.criadoEm).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(orcamento.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {orcamento.status && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          orcamento.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                          orcamento.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {orcamento.status}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum orçamento encontrado</p>
                <p className="text-xs mt-1">Crie o primeiro orçamento acima</p>
              </div>
            )}
          </div>

          </div>
        </div>
        
        {/* Botões fixos na parte inferior */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!titulo.trim() || itens.some(item => !item.descricao.trim())}
              className={`px-6 py-2 rounded-lg font-medium ${
                !titulo.trim() || itens.some(item => !item.descricao.trim())
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Criar Orçamento
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
