'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Link, FileText, User, Phone } from 'lucide-react'

interface AgendamentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (agendamento: AgendamentoData) => void
  chatId?: string
  contactData?: {
    nome?: string
    telefone?: string
  }
}

interface AgendamentoData {
  titulo: string
  data: string
  horario: string
  linkMeeting: string
  descricao: string
  cliente: string
  telefone: string
}

export default function AgendamentoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  chatId,
  contactData 
}: AgendamentoModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AgendamentoData>({
    titulo: '',
    data: '',
    horario: '',
    linkMeeting: '',
    descricao: '',
    cliente: contactData?.nome || '',
    telefone: contactData?.telefone || ''
  })

  // API para criar agendamento
  const apiCreateAgendamento = async (agendamentoData: any) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token não encontrado')

    const response = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(agendamentoData),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar agendamento')
    }

    return response.json()
  }

  // Preencher dados do contato quando disponível
  useEffect(() => {
    if (contactData) {
      setFormData(prev => ({
        ...prev,
        cliente: contactData.nome || '',
        telefone: contactData.telefone || ''
      }))
    }
  }, [contactData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatId) return
    
    setLoading(true)
    try {
      // Preparar dados para o backend
      const agendamentoData = {
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        inicio_em: new Date(`${formData.data}T${formData.horario}`).toISOString(),
        fim_em: new Date(`${formData.data}T${formData.horario}`).toISOString(), // Por enquanto mesmo horário
        link_meeting: formData.linkMeeting || null,
        contato_id: chatId, // JID do contato
      }

      console.log('Criando agendamento:', agendamentoData)
      
      await apiCreateAgendamento(agendamentoData)
      
      // Callback opcional para compatibilidade
      if (onSave) {
        onSave(formData)
      }
      
      onClose()
      
      // Reset form
      setFormData({
        titulo: '',
        data: '',
        horario: '',
        linkMeeting: '',
        descricao: '',
        cliente: contactData?.nome || '',
        telefone: contactData?.telefone || ''
      })
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento!')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof AgendamentoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#273155] to-[#2a3660] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Novo Agendamento</h2>
                      <p className="text-blue-100 text-sm">Agende uma reunião ou compromisso</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Título do Agendamento
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => handleChange('titulo', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                      placeholder="Ex: Reunião de apresentação do projeto"
                      required
                    />
                  </div>

                  {/* Data e Horário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Data
                      </label>
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => handleChange('data', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Horário
                      </label>
                      <input
                        type="time"
                        value={formData.horario}
                        onChange={(e) => handleChange('horario', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Link da Reunião */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Link className="w-4 h-4 inline mr-2" />
                      Link da Reunião (Meet/Zoom)
                    </label>
                    <input
                      type="url"
                      value={formData.linkMeeting}
                      onChange={(e) => handleChange('linkMeeting', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    />
                  </div>

                  {/* Cliente e Telefone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Cliente
                      </label>
                      <input
                        type="text"
                        value={formData.cliente}
                        onChange={(e) => handleChange('cliente', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all bg-gray-50"
                        placeholder="Nome do cliente"
                        readOnly={!!contactData?.nome}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all bg-gray-50"
                        placeholder="(11) 99999-9999"
                        readOnly={!!contactData?.telefone}
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all resize-none"
                      placeholder="Descreva o objetivo da reunião, tópicos a serem discutidos, etc."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#273155] to-[#2a3660] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      Criar Agendamento
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
