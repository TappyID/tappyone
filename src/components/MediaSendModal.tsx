'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Users, Contact, Send, Search } from 'lucide-react'

interface MediaSendModalProps {
  type: 'contact' | 'location' | 'poll'
  chatId: string
  onClose: () => void
  onSend: (data: any) => void
}

export const MediaSendModal: React.FC<MediaSendModalProps> = ({
  type,
  chatId,
  onClose,
  onSend
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Fazer reverse geocoding para obter endereço usando Nominatim (gratuito)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt&addressdetails=1`
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data && data.address) {
              const address = data.address
              
              // Extrair informações do endereço do Nominatim
              const city = address.city || address.town || address.village || address.municipality || ''
              const state = address.state || address.region || ''
              const country = address.country || ''
              const road = address.road || ''
              const houseNumber = address.house_number || ''
              const neighbourhood = address.neighbourhood || address.suburb || ''
              
              // Montar título (cidade, estado)
              let title = ''
              if (city && state) {
                title = `${city}, ${state}`
              } else if (city) {
                title = city
              } else if (state) {
                title = state
              } else if (neighbourhood) {
                title = neighbourhood
              }
              
              // Montar endereço completo usando display_name do Nominatim
              let fullAddress = data.display_name || ''
              
              // Se não tiver display_name, montar manualmente
              if (!fullAddress) {
                const parts = []
                if (road) parts.push(houseNumber ? `${road}, ${houseNumber}` : road)
                if (neighbourhood) parts.push(neighbourhood)
                if (city) parts.push(city)
                if (state) parts.push(state)
                if (country) parts.push(country)
                fullAddress = parts.join(', ')
              }
              
              setFormData({
                ...formData,
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6)),
                title: title,
                address: fullAddress
              })
            } else {
              // Fallback sem geocoding
              setFormData({
                ...formData,
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6))
              })
            }
          } else {
            // Fallback sem geocoding
            setFormData({
              ...formData,
              latitude: parseFloat(latitude.toFixed(6)),
              longitude: parseFloat(longitude.toFixed(6))
            })
          }
        } catch (geocodingError) {
          console.error('Erro no reverse geocoding:', geocodingError)
          // Fallback sem geocoding
          setFormData({
            ...formData,
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6))
          })
        }
        
        setLoading(false)
      },
      (error) => {
        console.error('Erro ao obter localização:', error)
        let message = 'Erro ao obter localização'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada. Permita o acesso à localização nas configurações do navegador.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível. Verifique se o GPS está ativado.'
            break
          case error.TIMEOUT:
            message = 'Tempo limite para obter localização. Tente novamente.'
            break
        }
        alert(message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSend(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao enviar:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderContactForm = () => {
    const [contacts, setContacts] = useState<any[]>([])
    const [selectedContact, setSelectedContact] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [contactsLoading, setContactsLoading] = useState(false)

    // Buscar contatos quando o modal abrir
    React.useEffect(() => {
      fetchContacts()
    }, [])

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
      setFormData({
        ...formData,
        name: contact.name || contact.phone,
        contactId: contact.phone || contact.id
      })
    }

    const handleSubmitContact = (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedContact) {
        onSend({
          type: 'contact',
          name: selectedContact.name || selectedContact.phone,
          contactId: selectedContact.phone || selectedContact.id
        })
      }
    }

    return (
      <form onSubmit={handleSubmitContact} className="space-y-4">
        {/* Busca de contatos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar contato
          </label>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Lista de contatos */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            {contactsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhum contato encontrado
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id || contact.phone}
                    onClick={() => handleContactSelect(contact)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${
                      selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Contact className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {contact.name || contact.phone}
                      </div>
                      {contact.name && (
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contato selecionado */}
        {selectedContact && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Contact className="w-4 h-4" />
              <span className="font-medium">Contato selecionado:</span>
            </div>
            <div className="mt-1 text-sm text-green-700">
              {selectedContact.name || selectedContact.phone}
              {selectedContact.name && (
                <span className="block text-green-600">{selectedContact.phone}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !selectedContact}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar contato
          </button>
        </div>
      </form>
    )
  }

  const renderLocationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Botão para pegar localização atual */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-blue-900">Localização Atual</h4>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            Usar minha localização
          </button>
        </div>
        <p className="text-xs text-blue-700">
          Clique para obter automaticamente suas coordenadas via GPS
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.latitude || ''}
            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="-23.5505"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            required
            value={formData.longitude || ''}
            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="-46.6333"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título (opcional)
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nome do local"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Endereço (opcional)
        </label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Endereço completo"
        />
      </div>

      <div className="text-sm text-gray-500">
        <p>💡 Dica: Clique em "Usar minha localização" para obter automaticamente suas coordenadas</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          Enviar localização
        </button>
      </div>
    </form>
  )

  const renderPollForm = () => {
    const [options, setOptions] = useState(['', ''])

    const addOption = () => {
      setOptions([...options, ''])
    }

    const removeOption = (index: number) => {
      if (options.length > 2) {
        setOptions(options.filter((_, i) => i !== index))
      }
    }

    const updateOption = (index: number, value: string) => {
      const newOptions = [...options]
      newOptions[index] = value
      setOptions(newOptions)
      setFormData({ ...formData, options: newOptions.filter(opt => opt.trim()) })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pergunta da enquete
          </label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Qual sua opinião sobre...?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opções de resposta
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Opção ${index + 1}`}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          {options.length < 12 && (
            <button
              type="button"
              onClick={addOption}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              + Adicionar opção
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="multipleAnswers"
            checked={formData.multipleAnswers || false}
            onChange={(e) => setFormData({ ...formData, multipleAnswers: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="multipleAnswers" className="text-sm text-gray-700">
            Permitir múltiplas respostas
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || options.filter(opt => opt.trim()).length < 2}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            Criar enquete
          </button>
        </div>
      </form>
    )
  }

  const getTitle = () => {
    switch (type) {
      case 'contact': return 'Enviar contato'
      case 'location': return 'Enviar localização'
      case 'poll': return 'Criar enquete'
      default: return 'Enviar mídia'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'contact': return <Contact className="w-5 h-5" />
      case 'location': return <MapPin className="w-5 h-5" />
      case 'poll': return <Users className="w-5 h-5" />
      default: return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {type === 'contact' && renderContactForm()}
          {type === 'location' && renderLocationForm()}
          {type === 'poll' && renderPollForm()}
        </div>
      </div>
    </div>
  )
}
