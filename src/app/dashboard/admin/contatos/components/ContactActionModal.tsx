'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Calendar, Edit, Trash2, Phone, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ContactActionModalProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    id: string
    nome: string
    telefone: string
    email?: string
    empresa?: string
    cpf?: string
    cnpj?: string
    cep?: string
    rua?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    pais?: string
    fotoPerfil?: string
  }
  onSuccess?: () => void
  onEdit?: (contact: any) => void
}

const ContactActionModal: React.FC<ContactActionModalProps> = ({
  isOpen,
  onClose,
  contact,
  onSuccess,
  onEdit
}) => {
  const [loading, setLoading] = useState(false)

  const handleStartConversation = async () => {
    setLoading(true)
    try {
      // Aqui você implementaria a lógica para iniciar uma conversa no WhatsApp
      // Por enquanto, vamos simular uma ação
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Conversa iniciada com ${contact.nome}`)
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Erro ao iniciar conversa')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleMeeting = async () => {
    setLoading(true)
    try {
      // Aqui você implementaria a lógica para agendar reunião
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Reunião agendada com ${contact.nome}`)
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Erro ao agendar reunião')
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    // Abrir discador do telefone
    window.open(`tel:${contact.telefone}`, '_self')
    toast.success('Discador aberto')
  }

  const handleEmail = () => {
    if (contact.email) {
      window.open(`mailto:${contact.email}`, '_self')
      toast.success('Email aberto')
    } else {
      toast.error('Este contato não possui email')
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit({
        id: contact.id,
        nome: contact.nome,
        numeroTelefone: contact.telefone,
        email: contact.email,
        empresa: contact.empresa,
        cpf: contact.cpf,
        cnpj: contact.cnpj,
        cep: contact.cep,
        rua: contact.rua,
        numero: contact.numero,
        bairro: contact.bairro,
        cidade: contact.cidade,
        estado: contact.estado,
        pais: contact.pais,
        fotoPerfil: contact.fotoPerfil
      })
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${contact.nome}?`)) {
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/contatos/${contact.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Contato excluído com sucesso')
        onSuccess?.()
        onClose()
      } else {
        throw new Error('Erro ao excluir contato')
      }
    } catch (error) {
      toast.error('Erro ao excluir contato')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ações para {contact.nome}
              </h3>
              <p className="text-sm text-gray-500">{contact.telefone}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Start Conversation */}
            <button
              onClick={handleStartConversation}
              disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all group disabled:opacity-50"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Iniciar conversa</div>
                <div className="text-sm text-gray-500">Enviar mensagem no WhatsApp</div>
              </div>
            </button>

            {/* Schedule Meeting */}
            <button
              onClick={handleScheduleMeeting}
              disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all group disabled:opacity-50"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Agendar reunião</div>
                <div className="text-sm text-gray-500">Criar agendamento</div>
              </div>
            </button>

            {/* Call */}
            <button
              onClick={handleCall}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-all group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Phone className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Ligar</div>
                <div className="text-sm text-gray-500">Abrir discador</div>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              disabled={!contact.email}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 hover:text-orange-700 transition-all group disabled:opacity-50"
            >
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Mail className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Enviar email</div>
                <div className="text-sm text-gray-500">
                  {contact.email ? contact.email : 'Email não disponível'}
                </div>
              </div>
            </button>

            {/* Edit */}
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all group"
            >
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Edit className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Editar contato</div>
                <div className="text-sm text-gray-500">Alterar dados cadastrais</div>
              </div>
            </button>

            {/* Divider */}
            <hr className="my-4" />

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all group disabled:opacity-50"
            >
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Excluir contato</div>
                <div className="text-sm text-gray-500">Remover permanentemente</div>
              </div>
            </button>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ContactActionModal
