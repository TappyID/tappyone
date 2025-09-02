'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MapPin, Contact, Users, Loader2, Plus, Trash2, Search, User, ChevronDown } from 'lucide-react'

interface SpecialMediaModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'contact' | 'location' | 'poll'
  chatId: string
  onSend: (data: any, caption: string) => Promise<void>
}

export default function SpecialMediaModal({ isOpen, onClose, type, chatId, onSend }: SpecialMediaModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [caption, setCaption] = useState('')
  
  // Estados para contato
  const [contactId, setContactId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [contactsLoading, setContactsLoading] = useState(false)
  const [showContactsList, setShowContactsList] = useState(true)
  
  // Estados para localização
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationTitle, setLocationTitle] = useState('')
  const [address, setAddress] = useState('')
  
  // Estados para enquete
  const [pollTitle, setPollTitle] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [multipleAnswers, setMultipleAnswers] = useState(false)

  const addPollOption = () => {
    setPollOptions([...pollOptions, ''])
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index))
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  // Buscar contatos quando modal de contato abrir
  useEffect(() => {
    if (isOpen && type === 'contact') {
      fetchContacts()
    }
  }, [isOpen, type])

  const fetchContacts = async () => {
    setContactsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
    } finally {
      setContactsLoading(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
  )

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact)
    setContactName(contact.name || contact.phone)
    setContactId(contact.phone || contact.id)
    setShowContactsList(false)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString())
          setLongitude(position.coords.longitude.toString())
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          alert('Erro ao obter sua localização. Verifique as permissões.')
        }
      )
    } else {
      alert('Geolocalização não é suportada neste navegador.')
    }
  }

  const handleSend = async () => {
    if (isLoading) return

    let data: any = {}

    if (type === 'contact') {
      if (!contactId.trim() || !contactName.trim()) {
        alert('Preencha o ID e nome do contato')
        return
      }
      data = { contactId: contactId.trim(), name: contactName.trim() }
    } else if (type === 'location') {
      if (!latitude.trim() || !longitude.trim()) {
        alert('Informe a latitude e longitude')
        return
      }
      data = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        title: locationTitle.trim() || 'Localização compartilhada',
        address: address.trim() || ''
      }
    } else if (type === 'poll') {
      const validOptions = pollOptions.filter(opt => opt.trim())
      if (!pollTitle.trim() || validOptions.length < 2) {
        alert('Preencha o título e pelo menos 2 opções')
        return
      }
      data = {
        name: pollTitle.trim(),
        options: validOptions,
        multipleAnswers
      }
    }

    setIsLoading(true)
    try {
      await onSend(data, caption.trim())
      
      // Limpar formulário
      setCaption('')
      setContactId('')
      setContactName('')
      setLatitude('')
      setLongitude('')
      setLocationTitle('')
      setAddress('')
      setPollTitle('')
      setPollOptions(['', ''])
      setMultipleAnswers(false)
      
      onClose()
    } catch (error) {
      console.error('Erro ao enviar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'contact': return <Contact className="w-5 h-5" />
      case 'location': return <MapPin className="w-5 h-5" />
      case 'poll': return <Users className="w-5 h-5" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'contact': return 'Enviar Contato'
      case 'location': return 'Enviar Localização'
      case 'poll': return 'Criar Enquete'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'contact': return 'from-blue-500 to-blue-600'
      case 'location': return 'from-green-500 to-green-600'
      case 'poll': return 'from-purple-500 to-purple-600'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b bg-gradient-to-r ${getColor()}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {getIcon()}
                </div>
                <h3 className="text-lg font-semibold text-white">{getTitle()}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {type === 'contact' && (
                <div className="space-y-4">
                  {showContactsList && !selectedContact ? (
                    <>
                      {/* Busca de contatos */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selecionar contato
                        </label>
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar contatos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Lista de contatos */}
                        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                          {contactsLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                              <span className="ml-2 text-gray-500">Carregando contatos...</span>
                            </div>
                          ) : filteredContacts.length > 0 ? (
                            filteredContacts.map((contact, index) => (
                              <div
                                key={contact.id || index}
                                onClick={() => handleContactSelect(contact)}
                                className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  {contact.profilePictureUrl ? (
                                    <img 
                                      src={contact.profilePictureUrl} 
                                      alt={contact.name || contact.phone}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {contact.name || contact.phone}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {contact.phone}
                                  </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 transform -rotate-90" />
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                              <User className="w-8 h-8 mb-2" />
                              <p>Nenhum contato encontrado</p>
                            </div>
                          )}
                        </div>

                        {/* Botão para preencher manualmente */}
                        <button
                          type="button"
                          onClick={() => setShowContactsList(false)}
                          className="mt-3 w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Preencher manualmente
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Contato selecionado ou preenchimento manual */}
                      {selectedContact && (
                        <div className="p-3 bg-blue-50 rounded-lg mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {selectedContact.profilePictureUrl ? (
                                <img 
                                  src={selectedContact.profilePictureUrl} 
                                  alt={selectedContact.name || selectedContact.phone}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{selectedContact.name || selectedContact.phone}</p>
                              <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContact(null)
                                setContactName('')
                                setContactId('')
                                setShowContactsList(true)
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Alterar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Campos manuais */}
                      {!selectedContact && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ID do Contato (Telefone)
                            </label>
                            <input
                              type="text"
                              value={contactId}
                              onChange={(e) => setContactId(e.target.value)}
                              placeholder="Ex: 5511999999999@c.us"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do Contato
                            </label>
                            <input
                              type="text"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="Ex: João Silva"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={isLoading}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowContactsList(true)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            ← Voltar para lista de contatos
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {type === 'location' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={getCurrentLocation}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      disabled={isLoading}
                    >
                      📍 Usar localização atual
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="-23.550520"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="-46.633309"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      value={locationTitle}
                      onChange={(e) => setLocationTitle(e.target.value)}
                      placeholder="Nome do local"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço (opcional)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Endereço completo"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {type === 'poll' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título da Enquete
                    </label>
                    <input
                      type="text"
                      value={pollTitle}
                      onChange={(e) => setPollTitle(e.target.value)}
                      placeholder="Qual sua opinião sobre..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opções de Resposta
                    </label>
                    <div className="space-y-2">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            placeholder={`Opção ${index + 1}`}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            disabled={isLoading}
                          />
                          {pollOptions.length > 2 && (
                            <button
                              onClick={() => removePollOption(index)}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 10 && (
                        <button
                          onClick={addPollOption}
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
                          disabled={isLoading}
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar opção
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="multipleAnswers"
                      checked={multipleAnswers}
                      onChange={(e) => setMultipleAnswers(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <label htmlFor="multipleAnswers" className="text-sm text-gray-700">
                      Permitir múltiplas respostas
                    </label>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Digite uma mensagem para acompanhar..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Esta mensagem será enviada usando modo seguro para evitar ban
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
