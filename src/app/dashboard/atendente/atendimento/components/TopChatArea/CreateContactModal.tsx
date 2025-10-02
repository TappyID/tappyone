'use client'

import React, { useState } from 'react'
import { X, User } from 'lucide-react'

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string | null
  chatName?: string
}

export default function CreateContactModal({ isOpen, onClose, chatId, chatName }: CreateContactModalProps) {
  const [formData, setFormData] = useState({
    nome: chatName || '',
    telefone: chatId ? chatId.replace('@c.us', '') : '',
    email: '',
    empresa: '',
    cpf: '',
    cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil'
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.telefone) {
      alert('Nome e telefone são obrigatórios!')
      return
    }

    setLoading(true)

    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'

      // 1. Buscar sessão ativa (igual ao modal que funciona)

      const sessionsResponse = await fetch('/api/sessoes-whatsapp', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!sessionsResponse.ok) {
        throw new Error('Erro ao buscar sessões WhatsApp')
      }

      const sessionsData = await sessionsResponse.json()

      // Buscar sessão ativa
      let sessaoWhatsappId = ''
      if (Array.isArray(sessionsData) && sessionsData.length > 0) {
        const activeSession = sessionsData.find(s => s.ativo) || sessionsData[0]
        sessaoWhatsappId = activeSession.id

      } else if (sessionsData?.id) {
        sessaoWhatsappId = sessionsData.id

      } else {
        throw new Error('Nenhuma sessão WhatsApp encontrada')
      }

      // 2. Criar contato com sessão válida
      const contactData = {
        nome: formData.nome.trim(),
        numeroTelefone: formData.telefone,
        sessaoWhatsappId: sessaoWhatsappId, // Sessão dinâmica
        email: formData.email || null,
        empresa: formData.empresa || null,
        cpf: formData.cpf || null,
        cnpj: formData.cnpj || null,
        cep: formData.cep || null,
        rua: formData.rua || null,
        numero: formData.numero || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        pais: formData.pais || null
      }

      const response = await fetch('/api/contatos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
      })

      if (response.ok) {
        const result = await response.json()

        window.dispatchEvent(new CustomEvent('contactCreated', {
          detail: { chatId, contato: result }
        }))

        alert('Contato criado com sucesso! Lead enviado para o kanban.')
        onClose()
      } else {
        const error = await response.text()

        alert('Erro ao criar contato: ' + error)
      }
    } catch {

      alert('Erro ao criar contato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Criar Contato
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do contato"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="text"
                  value={formData.telefone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="Telefone"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleChange('cpf', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            {/* Endereço */}
            <h3 className="text-sm font-medium text-gray-700 mt-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                <input
                  type="text"
                  value={formData.rua}
                  onChange={(e) => handleChange('rua', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da rua"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleChange('numero', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Número"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="UF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) => handleChange('pais', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="País"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Contato'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}