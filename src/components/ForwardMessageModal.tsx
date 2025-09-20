'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, User, Users, Check } from 'lucide-react'

interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  isGroup?: boolean
}

interface ForwardMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onForward: (selectedContacts: string[]) => void
  message: any
}

export default function ForwardMessageModal({ 
  isOpen, 
  onClose, 
  onForward, 
  message 
}: ForwardMessageModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // Buscar contatos
  useEffect(() => {
    if (isOpen) {
      fetchContacts()
    }
  }, [isOpen])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      console.log('📞 [ForwardModal] Buscando contatos...')
      
      const response = await fetch('/api/whatsapp/getContacts?limit=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [ForwardModal] Contatos recebidos:', data.contacts?.length)
        
        // Mapear contatos para formato esperado
        const mappedContacts = (data.contacts || []).map((contact: any) => ({
          id: contact.id,
          name: contact.name || contact.phone,
          phone: contact.phone,
          avatar: contact.profilePicture,
          isGroup: false
        }))
        
        setContacts(mappedContacts)
      } else {
        console.error('❌ [ForwardModal] Erro:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
  )

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleForward = () => {
    if (selectedContacts.length > 0) {
      onForward(selectedContacts)
      setSelectedContacts([])
      setSearchTerm('')
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedContacts([])
    setSearchTerm('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Encaminhar Mensagem
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecione os contatos para encaminhar
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Message Preview */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 truncate">
                {message?.content || message?.body || 'Mensagem selecionada'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <User className="w-12 h-12 mb-2" />
                <p>Nenhum contato encontrado</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => toggleContact(contact.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedContacts.includes(contact.id)
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      contact.isGroup ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {contact.avatar ? (
                        <img 
                          src={contact.avatar} 
                          alt={contact.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : contact.isGroup ? (
                        <Users className="w-5 h-5 text-green-600" />
                      ) : (
                        <User className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {contact.name || contact.phone}
                      </h3>
                      {contact.name && (
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      )}
                    </div>

                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedContacts.includes(contact.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedContacts.includes(contact.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {selectedContacts.length} contato(s) selecionado(s)
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleForward}
                  disabled={selectedContacts.length === 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Encaminhar
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
