'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, DollarSign, Plus, Trash2 } from 'lucide-react'

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
    try {
      // Extrair telefone do chatId
      const telefone = chatId ? chatId.replace('@c.us', '') : null
      if (!telefone) {
        console.error('❌ Telefone não encontrado')
        return
      }
      
      console.log('💰 [OrcamentoBottomSheet] Buscando UUID do contato pelo telefone:', telefone)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone (igual ao TagsBottomSheet)
      const contactResponse = await fetch(`/api/contatos?telefone=${telefone}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.error('❌ Erro ao buscar contato:', contactResponse.status)
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === telefone)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('✅ UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === telefone)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('✅ UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.error('❌ UUID do contato não encontrado')
        return
      }
      
      // 2. SEGUNDO: Criar orçamento com UUID correto e formato do backend (igual ao agendamento)
      const orcamentoData = {
        titulo: titulo,
        descricao: descricao,
        data: new Date().toISOString(), // Campo obrigatório (minúsculo)
        tipo: 'orcamento', // Campo obrigatório (minúsculo)
        valorTotal: total,
        status: 'PENDENTE',
        contato_id: contatoUUID, // Campo obrigatório - mesmo formato do agendamento
        observacao: observacoes || null,
        itens,
        subtotal,
        desconto,
        chatId
      }
      
      console.log('💰 [OrcamentoBottomSheet] Criando orçamento:', orcamentoData)
      
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        },
        body: JSON.stringify(orcamentoData),
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
          detail: { contatoId: telefone, contatoUUID, orcamento: result } 
        }))
        
        // Opcional: Enviar notificação via WhatsApp
        const whatsappData = {
          chatId,
          text: `💰 *Orçamento Criado*\n\n*${titulo}*\n${descricao}\n\nTotal: *R$ ${total.toFixed(2)}*\n\nOrçamento válido por 30 dias.`,
        }
        
        const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
        const wahaUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'
        
        await fetch(`${wahaUrl}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(whatsappData),
        })
        
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
