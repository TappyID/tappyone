'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Clock, Users, Phone, Video, MapPin, Coffee } from 'lucide-react'

interface AgendamentoBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function AgendamentoBottomSheet({ isOpen, onClose, chatId }: AgendamentoBottomSheetProps) {
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [tipo, setTipo] = useState('reuniao')
  const [descricao, setDescricao] = useState('')

  if (!isOpen) return null

  const handleSave = async () => {
    try {
      // Extrair telefone do chatId
      const telefone = chatId ? chatId.replace('@c.us', '') : null
      if (!telefone) {
        console.error('❌ Telefone não encontrado')
        return
      }
      
      console.log('📅 [AgendamentoBottomSheet] Buscando UUID do contato pelo telefone:', telefone)
      
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
      
      // 2. SEGUNDO: Criar agendamento com UUID correto
      const inicioEm = new Date(`${data}T${horaInicio}:00.000Z`).toISOString()
      const fimEm = new Date(`${data}T${horaFim}:00.000Z`).toISOString()
      
      const agendamentoData = {
        titulo: titulo,
        descricao: descricao || null,
        inicio_em: inicioEm,
        fim_em: fimEm,
        link_meeting: null,
        contato_id: contatoUUID, // Usar UUID correto
        tipo,
        chatId
      }
      
      console.log('📅 [AgendamentoBottomSheet] Criando agendamento:', agendamentoData)
      
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw',
        },
        body: JSON.stringify(agendamentoData),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ [AgendamentoBottomSheet] Agendamento criado com sucesso:', result)
        
        // Toaster de sucesso
        alert(`📅 Agendamento "${titulo}" criado com sucesso! Data: ${new Date(data).toLocaleDateString('pt-BR')} às ${horaInicio}`)
        
        // Limpar formulário
        setTitulo('')
        setData('')
        setHoraInicio('')
        setHoraFim('')
        setTipo('reuniao')
        setDescricao('')
        onClose()
        
        // Disparar evento personalizado para atualizar indicadores
        window.dispatchEvent(new CustomEvent('agendamentoCreated', { 
          detail: { contatoId: telefone, contatoUUID, agendamento: result } 
        }))
        
        // Enviar notificação via WhatsApp
        const whatsappData = {
          chatId,
          text: `📅 *Agendamento Confirmado*\n\n*${titulo}*\n📅 ${new Date(data).toLocaleDateString('pt-BR')}\n🕐 ${horaInicio} às ${horaFim}\n📋 ${tipo}\n\n${descricao || 'Aguardamos você!'}`,
        }
        
        await fetch('http://159.65.34.199:3001/api/send', {
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
        
        // Se for 401, sugerir relogin
        if (response.status === 401) {
          alert('❌ Token expirado ou inválido!\n\nFaça logout e login novamente.')
        } else {
          alert(`Erro ao criar agendamento: ${errorData.error || errorData.message || response.statusText}`)
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error)
    }
    
    onClose()
  }

  const tipos = [
    { value: 'reuniao', icon: Users, label: 'Reunião' },
    { value: 'ligacao', icon: Phone, label: 'Ligação' },
    { value: 'video', icon: Video, label: 'Vídeo' },
    { value: 'presencial', icon: MapPin, label: 'Presencial' },
    { value: 'coffee', icon: Coffee, label: 'Coffee' }
  ]

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
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📅 Novo Agendamento</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 pb-24">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reunião de Vendas"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data *</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Início *</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fim *</label>
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tipo</label>
            <div className="grid grid-cols-5 gap-2">
              {tipos.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.value}
                    onClick={() => setTipo(t.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      tipo === t.value 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${tipo === t.value ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`text-xs ${tipo === t.value ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes do agendamento..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          </div>
        </div>
        
        {/* Botões fixos na parte inferior */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!titulo.trim() || !data || !horaInicio}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                (!titulo.trim() || !data || !horaInicio)
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Criar Agendamento
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
