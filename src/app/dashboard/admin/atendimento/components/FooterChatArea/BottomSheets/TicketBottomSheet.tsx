'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Ticket, AlertCircle, Clock, CheckCircle } from 'lucide-react'

interface TicketBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function TicketBottomSheet({ isOpen, onClose, chatId }: TicketBottomSheetProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<'baixa' | 'media' | 'alta'>('media')
  const [categoria, setCategoria] = useState('suporte')
  const [status, setStatus] = useState<'aberto' | 'em_andamento' | 'resolvido' | 'fechado'>('aberto')

  if (!isOpen) return null

  const prioridades = [
    { value: 'baixa', label: 'Baixa', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'media', label: 'Média', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { value: 'alta', label: 'Alta', color: 'text-red-600', bg: 'bg-red-50' }
  ]

  const categorias = [
    'Suporte Técnico',
    'Dúvida Comercial',
    'Problema de Produto',
    'Solicitação de Recurso',
    'Reclamação',
    'Outros'
  ]

  const statusOptions = [
    { value: 'aberto', label: 'Aberto', icon: AlertCircle, color: 'text-red-600' },
    { value: 'em_andamento', label: 'Em Andamento', icon: Clock, color: 'text-yellow-600' },
    { value: 'resolvido', label: 'Resolvido', icon: CheckCircle, color: 'text-green-600' },
    { value: 'fechado', label: 'Fechado', icon: CheckCircle, color: 'text-gray-600' }
  ]

  const handleSave = async () => {
    try {
      // Extrair telefone do chatId
      const telefone = chatId ? chatId.replace('@c.us', '') : null
      if (!telefone) {
        console.error('❌ Telefone não encontrado')
        return
      }
      
      console.log('🎫 [TicketBottomSheet] Buscando UUID do contato pelo telefone:', telefone)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone (igual aos outros)
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
      
      // 2. SEGUNDO: Criar ticket usando MESMO FORMATO do TicketModal que funciona
      // Converter prioridade string para número
      const prioridadeMap = {
        'baixa': 1,
        'media': 2,
        'alta': 3
      }
      
      // Converter status para formato do TicketModal (maiúsculo)
      const statusMap = {
        'aberto': 'ABERTO',
        'em_andamento': 'ANDAMENTO',
        'resolvido': 'ENCERRADO',
        'fechado': 'ENCERRADO'
      }
      
      const ticketData = {
        titulo,
        descricao,
        status: statusMap[status as keyof typeof statusMap] || 'ABERTO', // Formato maiúsculo
        prioridade: prioridadeMap[prioridade as keyof typeof prioridadeMap] || 2,
        contato_id: telefone // Usar telefone como TicketModal, não UUID!
      }
      
      console.log('🎫 [TicketBottomSheet] Criando ticket:', ticketData)
      
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw',
        },
        body: JSON.stringify(ticketData),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ [TicketBottomSheet] Ticket criado com sucesso:', result)
        
        // Toaster de sucesso
        alert(`🎫 Ticket "${titulo}" criado com sucesso! Prioridade: ${prioridade.toUpperCase()}`)
        
        // Limpar formulário
        setTitulo('')
        setDescricao('')
        setPrioridade('media')
        setCategoria('suporte')
        setStatus('aberto')
        onClose()
        
        // Disparar evento personalizado para atualizar indicadores
        window.dispatchEvent(new CustomEvent('ticketCreated', { 
          detail: { contatoId: telefone, contatoUUID, ticket: result } 
        }))
        
        // Enviar notificação via WhatsApp
        const whatsappData = {
          chatId,
          text: `🎫 *Ticket Criado*\n\n*${titulo}*\n📋 ${categoria}\n⚠️ Prioridade: ${prioridade.toUpperCase()}\n📊 Status: ${status.replace('_', ' ')}\n\n${descricao}\n\n*Número do Ticket:* #${result?.id || Date.now()}`,
        }
        
        await fetch('http://159.65.34.199:3001/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(whatsappData),
        })
        
      } else {
        const errorData = await response.json().catch(() => null)
        console.error('❌ [TicketBottomSheet] Erro ao criar ticket:', response.status, errorData)
        alert(`❌ Erro ao criar ticket: ${errorData?.error || response.statusText}`)
      }
      
    } catch (error) {
      console.error('❌ [TicketBottomSheet] Erro ao salvar ticket:', error)
      alert(`❌ Erro ao salvar ticket: ${error.message}`)
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
        className="absolute bottom-0 left-0 right-0 w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🎫 Novo Ticket</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 pb-24">
          <div>
            <label className="block text-sm font-medium mb-2">Título do Ticket *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Problema com login do sistema"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '_')}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((s) => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value as any)}
                      className={`p-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        status === s.value 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${status === s.value ? s.color : 'text-gray-500'}`} />
                      <span className={`text-xs ${status === s.value ? 'font-medium' : ''}`}>
                        {s.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Prioridade</label>
            <div className="grid grid-cols-3 gap-3">
              {prioridades.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPrioridade(p.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    prioridade === p.value 
                      ? `border-current ${p.bg} ${p.color}` 
                      : 'border-gray-200 dark:border-gray-600 text-gray-600'
                  }`}
                >
                  <div className="font-medium">{p.label}</div>
                  <div className="text-xs mt-1">
                    {p.value === 'baixa' && 'Pode aguardar'}
                    {p.value === 'media' && 'Prazo normal'}
                    {p.value === 'alta' && 'Urgente'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição do Problema *</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o problema ou solicitação..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              📋 Sobre os tickets:
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              • Acompanhe solicitações e problemas<br/>
              • Defina prioridade para organização<br/>
              • Histórico completo de interações
            </p>
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
              disabled={!titulo.trim() || !descricao.trim()}
              className={`px-6 py-2 rounded-lg font-medium ${
                (!titulo.trim() || !descricao.trim())
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Criar Ticket
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
