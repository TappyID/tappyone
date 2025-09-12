'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Phone, Mail, Building2, MapPin, Save, Loader2,
  Search, UserPlus, MessageCircle, Users
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface WhatsAppContact {
  id: string
  name: string
  pushname?: string
  phone?: string
  profilePicUrl?: string
  isGroup?: boolean
}

interface CreateContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onContactCreated?: (contactData: any) => void
  preFilledChatId?: string
  chatId?: string
  autoAddToKanban?: boolean
  editContact?: {
    id: string
    nome: string
    numeroTelefone: string
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
}

interface ContactFormData {
  whatsappContactId: string
  nome: string
  numeroTelefone: string
  fotoPerfil?: string
  email: string
  empresa: string
  cpf: string
  cnpj: string
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  pais: string
}

export default function CreateContactModal({ 
  isOpen, 
  onClose, 
  onSuccess = () => {}, 
  onContactCreated,
  preFilledChatId,
  chatId,
  editContact
}: CreateContactModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'search' | 'form'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([])
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  
  // ChatId efetivo: pode vir do ChatArea (chatId) ou legado (preFilledChatId)
  const providedChatId = chatId || preFilledChatId
  
  const [formData, setFormData] = useState<ContactFormData>({
    whatsappContactId: '', nome: '', numeroTelefone: '', fotoPerfil: '',
    email: '', empresa: '', cpf: '', cnpj: '', cep: '', rua: '',
    numero: '', bairro: '', cidade: '', estado: '', pais: 'Brasil'
  })

  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal aberto')
      if (editContact) {
        console.log('🔄 Modo edição ativado com dados:', editContact)
        setStep('form')
        setFormData({
          whatsappContactId: editContact.id,
          nome: editContact.nome || '',
          numeroTelefone: editContact.numeroTelefone || '',
          fotoPerfil: editContact.fotoPerfil || '',
          email: editContact.email || '',
          empresa: editContact.empresa || '',
          cpf: editContact.cpf || '',
          cnpj: editContact.cnpj || '',
          cep: editContact.cep || '',
          rua: editContact.rua || '',
          numero: editContact.numero || '',
          bairro: editContact.bairro || '',
          cidade: editContact.cidade || '',
          estado: editContact.estado || '',
          pais: editContact.pais || 'Brasil'
        })
        console.log('✅ FormData configurado para edição')
      } else if (providedChatId) {
        // Modo criação com chatId direto (vem do ChatArea)
        console.log('🔄 Modo criação com chatId direto:', providedChatId)
        setStep('form')
        setSelectedContact(null)
        setSearchQuery('')
        // Buscar dados do contato pelo chatId
        fetchContactByChatId(providedChatId)
      } else {
        // Modo criação - buscar contatos do WhatsApp
        if (!editContact) {
          fetchWhatsAppContacts()
        }
        setStep(editContact ? 'form' : 'search')
        setSelectedContact(null)
        setSearchQuery('')
        setFormData({
          whatsappContactId: '', nome: '', numeroTelefone: '', fotoPerfil: '',
          email: '', empresa: '', cpf: '', cnpj: '', cep: '', rua: '',
          numero: '', bairro: '', cidade: '', estado: '', pais: 'Brasil'
        })
      }
    }
  }, [isOpen, editContact, chatId, preFilledChatId])

  const fetchContactByChatId = async (chatId: string) => {
    console.log('🔄 Buscando contato pelo chatId via lista de chats:', chatId)
    setIsLoadingContacts(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      // Buscar lista de chats e localizar o chat específico
      const response = await fetch('/api/whatsapp/chats', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Erro ao buscar lista de chats')

      const chats = await response.json()
      const chat = Array.isArray(chats) ? chats.find((c: any) => c?.id === chatId || c?._id === chatId) : null

      const phoneFromId = chatId.replace('@c.us', '')

      setFormData({
        whatsappContactId: chatId,
        nome: chat?.name || chat?.title || phoneFromId || '',
        numeroTelefone: chat?.id?.replace('@c.us', '') || phoneFromId || '',
        fotoPerfil: chat?.profilePicUrl || '',
        email: '', empresa: '', cpf: '', cnpj: '', cep: '', rua: '',
        numero: '', bairro: '', cidade: '', estado: '', pais: 'Brasil'
      })

      console.log('✅ FormData preenchido com dados do chat/lista')
    } catch (error) {
      console.error('Erro ao buscar dados do chat:', error)
      setError(error instanceof Error ? error.message : 'Erro ao buscar dados do chat')
      // Em caso de erro, inicializar com chatId ao menos para o telefone
      const phoneFromId = chatId.replace('@c.us', '')
      setFormData({
        whatsappContactId: chatId,
        nome: phoneFromId,
        numeroTelefone: phoneFromId,
        fotoPerfil: '', email: '', empresa: '', cpf: '', cnpj: '', cep: '', rua: '',
        numero: '', bairro: '', cidade: '', estado: '', pais: 'Brasil'
      })
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const fetchWhatsAppContacts = async () => {
    setIsLoadingContacts(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      const response = await fetch('/api/whatsapp/contacts', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Erro ao buscar contatos do WhatsApp')

      const data = await response.json()
      const contactsArray = Array.isArray(data) ? data : [data]

      setWhatsappContacts(contactsArray)
      setError(null)
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const filteredContacts = whatsappContacts.filter(contact => 
    searchQuery === '' || 
    (contact.name && contact.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contact.phone && contact.phone.includes(searchQuery))
  )

  const handleContactSelect = (contact: WhatsAppContact) => {
    setSelectedContact(contact)
    setStep('form')
    setFormData(prev => ({
      ...prev,
      whatsappContactId: contact.id,
      nome: contact.name || contact.phone || '',
      numeroTelefone: contact.phone || '',
      fotoPerfil: contact.profilePicUrl || ''
    }))
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setFormData(prev => ({
            ...prev, rua: data.logradouro || '', bairro: data.bairro || '',
            cidade: data.localidade || '', estado: data.uf || '', pais: 'Brasil'
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`🔄 handleSubmit iniciado - Modo: ${editContact ? 'Edição' : 'Criação'}`)
    console.log('📝 formData:', formData)
    
    // Validação para criação vs edição
    if (!editContact) {
      // No fluxo via ChatArea (providedChatId), não exigimos selectedContact
      const creatingViaChatId = Boolean(providedChatId)
      if (!creatingViaChatId && (!selectedContact || !formData.nome.trim())) {
        console.log('❌ Validação falhou - contato ou nome não preenchido')
        setError('Selecione um contato e preencha o nome')
        return
      }
      // Garantir que temos telefone no fluxo via chatId
      if (creatingViaChatId && !formData.numeroTelefone.trim()) {
        setError('Não foi possível identificar o telefone do chat')
        return
      }
    }
    
    if (editContact && !formData.nome.trim()) {
      setError('O nome é obrigatório')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log('🔑 Buscando token...')
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      console.log('👤 Buscando dados do usuário...')
      const userResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!userResponse.ok) throw new Error('Erro ao obter dados do usuário')
      const userData = await userResponse.json()
      console.log('✅ Dados do usuário obtidos:', userData)

      console.log('📱 Buscando sessões WhatsApp da tabela sessoes_whatsapp...')
      const sessionsResponse = await fetch('/api/sessoes-whatsapp', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!sessionsResponse.ok) throw new Error('Erro ao obter sessões WhatsApp')
      const sessionsData = await sessionsResponse.json()
      console.log('✅ Sessões WhatsApp obtidas:', sessionsData)

      // Buscar sessão ativa na tabela sessoes_whatsapp
      let sessaoWhatsappId = ''
      if (Array.isArray(sessionsData) && sessionsData.length > 0) {
        const activeSession = sessionsData.find(s => s.ativo) || sessionsData[0]
        sessaoWhatsappId = activeSession.id
        console.log('✅ Sessão ativa encontrada:', activeSession)
      } else if (sessionsData?.id) {
        sessaoWhatsappId = sessionsData.id
        console.log('✅ Sessão única encontrada:', sessionsData)
      } else {
        // Criar sessão WhatsApp padrão para o usuário
        console.log('🔄 Nenhuma sessão encontrada, criando sessão padrão...')
        console.log('👤 userData:', userData)
        
        const createSessionResponse = await fetch('/api/sessoes-whatsapp', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomeSessao: `user_${userData.id}_${Date.now()}`,
            status: 'CONECTADO',
            ativo: true
          })
        })
        
        console.log('📡 Create session response status:', createSessionResponse.status)
        
        if (!createSessionResponse.ok) {
          const errorText = await createSessionResponse.text()
          console.error('❌ Erro ao criar sessão:', errorText)
          throw new Error(`Erro ao criar sessão WhatsApp padrão: ${errorText}`)
        }
        
        const newSession = await createSessionResponse.json()
        console.log('✅ Resposta da criação da sessão:', newSession)
        
        // Verificar se temos o ID da sessão
        if (!newSession || (!newSession.id && !newSession.data?.id)) {
          console.error('❌ Sessão criada mas sem ID válido:', newSession)
          throw new Error('Sessão criada mas sem ID válido')
        }
        
        sessaoWhatsappId = newSession.id || newSession.data?.id
        console.log('✅ Sessão padrão criada com ID:', sessaoWhatsappId)
      }

      console.log('🔗 Using sessaoWhatsappId:', sessaoWhatsappId)

      const contactData = {
        numeroTelefone: formData.numeroTelefone,
        nome: formData.nome,
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

      // Para criação, sempre incluir sessaoWhatsappId
      if (!editContact) {
        (contactData as any).sessaoWhatsappId = sessaoWhatsappId
      }

      console.log('📦 contactData sendo enviado:', contactData)
      console.log('🔍 editContact?', !!editContact)
      console.log('🆔 sessaoWhatsappId:', sessaoWhatsappId)
      console.log('📱 JSON sendo enviado:', JSON.stringify(contactData, null, 2))

      let response
      if (editContact) {
        // Atualizar contato existente
        console.log('🔄 Atualizando contato:', editContact.id)
        response = await fetch(`/api/contatos/${editContact.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        })
      } else {
        // Criar novo contato
        console.log('➕ Criando novo contato no endpoint /api/contatos')
        console.log('🔗 URL completa:', '/api/contatos')
        console.log('📋 Headers:', { 'Authorization': `Bearer ${token.substring(0, 20)}...`, 'Content-Type': 'application/json' })
        
        response = await fetch('/api/contatos', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        })
      }

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        
        throw new Error(errorData.error || `Erro ${response.status}: ${errorText}`)
      }

      const successData = await response.json()
      console.log('✅ Contato criado com sucesso:', successData)

      // Notificar parent opcionalmente
      try {
        onContactCreated?.(successData)
      } catch (e) {
        console.warn('onContactCreated callback lançou exceção, ignorando.', e)
      }

      // Se foi criado via chatId (modo ChatArea), adicionar automaticamente ao kanban
      if (!editContact && providedChatId && successData?.id) {
        console.log('🔄 Adicionando contato ao kanban automaticamente...')
        try {
          await addContactToKanban(successData.id, providedChatId)
        } catch (kanbanError) {
          console.error('❌ Erro ao adicionar ao kanban:', kanbanError)
          // Não falhar a criação do contato por erro no kanban
        }
      }

      onSuccess()
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar contato')
    } finally {
      setIsLoading(false)
    }
  }

  // Format functions
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    
    // Formato brasileiro: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX
    if (cleaned.length === 13) {
      // Número com código do país (55): 5518991230106 -> (55) 18 99123-0106
      return cleaned.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '($1) $2 $3-$4')
    } else if (cleaned.length === 11) {
      // Número com DDD: 18991230106 -> (18) 99123-0106
      return cleaned.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
      // Número fixo: 1831230106 -> (18) 3123-0106
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    return cleaned
  }

  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '')
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
  }

  const formatCNPJ = (cnpj: string) => {
    const cleaned = cnpj.replace(/\D/g, '')
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5')
  }

  const formatCEP = (cep: string) => {
    const cleaned = cep.replace(/\D/g, '')
    return cleaned.replace(/(\d{5})(\d{0,3})/, '$1-$2')
  }

  const addContactToKanban = async (contactId: string, chatId: string) => {
    console.log('🔄 Adicionando contato ao kanban (via MoveCard):', { contactId, chatId })
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      // 1) Buscar quadros do usuário
      const quadrosRes = await fetch('/api/kanban/quadros', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!quadrosRes.ok) throw new Error('Falha ao buscar quadros do Kanban')
      const quadros = await quadrosRes.json()
      const quadro = Array.isArray(quadros) && quadros.length > 0 ? quadros[0] : null
      if (!quadro?.id) throw new Error('Nenhum quadro Kanban disponível')

      // 2) Buscar colunas do quadro e escolher a de "Novo" (ou primeira)
      const quadroRes = await fetch(`/api/kanban/quadros/${quadro.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!quadroRes.ok) throw new Error('Falha ao buscar colunas do quadro')
      const quadroData = await quadroRes.json()
      const colunas = Array.isArray(quadroData?.colunas) ? quadroData.colunas : []
      if (colunas.length === 0) throw new Error('Quadro sem colunas ativas')
      const targetCol = colunas.find((c: any) => (c.nome || '').toLowerCase() === 'novo') || colunas.sort((a: any, b: any) => (a.posicao||0)-(b.posicao||0))[0]
      if (!targetCol?.id) throw new Error('Coluna alvo não encontrada')

      // 3) Chamar endpoint de movimentação (que cria se não existir)
      const moveRes = await fetch('/api/kanban/card-movement', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quadroId: quadro.id,
          cardId: chatId,
          sourceColumnId: targetCol.id,
          targetColumnId: targetCol.id,
          posicao: 0
        })
      })
      if (!moveRes.ok) {
        const errText = await moveRes.text()
        throw new Error(`Falha ao mover/criar card: ${errText}`)
      }

      const result = await moveRes.json()
      console.log('✅ Card criado/movido no kanban:', result)
      return result
    } catch (error) {
      console.error('❌ Erro ao adicionar ao kanban:', error)
      throw error
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className={`sticky top-0 border-b p-6 rounded-t-2xl ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {editContact ? 'Editar Contato' : 'Adicionar Contato'}
                    </h2>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {step === 'search' ? 'Selecione um contato do WhatsApp' : 'Complete os dados do contato'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className={`mb-6 p-4 border rounded-xl ${
                  isDark 
                    ? 'bg-red-900/30 border-red-700 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {step === 'search' ? (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      <MessageCircle className="w-5 h-5 text-[#305e73]" />
                      Contatos do WhatsApp
                    </h3>

                    <div className="mb-4 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar contatos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {isLoadingContacts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#305e73]" />
                        <span className={`ml-2 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Carregando contatos...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map((contact) => (
                            <motion.button
                              key={contact.id}
                              type="button"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleContactSelect(contact)}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all border border-transparent hover:border-[#305e73] ${
                                isDark 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="w-12 h-12 bg-[#305e73] rounded-full flex items-center justify-center">
                                {contact.profilePicUrl ? (
                                  <img src={contact.profilePicUrl} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                  <span className="text-white font-semibold text-lg">
                                    {contact.name?.charAt(0).toUpperCase() || 'C'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>{contact.name || contact.pushname}</p>
                                {contact.phone && (
                                  <p className={`text-sm ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {formatPhone(contact.phone.replace('@c.us', '').replace(/\D/g, ''))}
                                  </p>
                                )}
                              </div>
                            </motion.button>
                          ))
                        ) : (
                          <div className={`text-center py-8 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <Users className={`w-12 h-12 mx-auto mb-2 ${
                              isDark ? 'text-gray-500' : 'text-gray-300'
                            }`} />
                            <p>{searchQuery ? 'Nenhum contato encontrado para sua busca' : 'Nenhum contato encontrado'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedContact && (
                    <div className={`p-4 border border-[#305e73] rounded-xl ${
                      isDark ? 'bg-[#305e73]/10' : 'bg-[#305e73]/5'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#305e73] rounded-full flex items-center justify-center">
                            {selectedContact.profilePicUrl ? (
                              <img src={selectedContact.profilePicUrl} alt={selectedContact.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <span className="text-white font-semibold">{selectedContact.name?.charAt(0).toUpperCase() || 'C'}</span>
                            )}
                          </div>
                          <div>
                            <p className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>{selectedContact.name}</p>
                            {selectedContact.phone && (
                              <p className={`text-sm ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {formatPhone(selectedContact.phone.replace('@c.us', '').replace(/\D/g, ''))}
                              </p>
                            )}
                          </div>
                        </div>
                        <button type="button" onClick={() => setStep('search')} className="text-sm text-[#305e73] hover:text-[#2a5666] font-medium">
                          Trocar contato
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <User className="w-5 h-5 text-[#305e73]" />
                        Dados Pessoais
                      </h3>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Nome *</label>
                        <input
                          type="text" required value={formData.nome} disabled
                          className={`w-full px-4 py-3 border rounded-xl cursor-not-allowed ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 text-gray-400'
                              : 'border-gray-300 bg-gray-100 text-gray-600'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Telefone *</label>
                        <input
                          type="tel" required value={formatPhone(formData.numeroTelefone)} disabled
                          className={`w-full px-4 py-3 border rounded-xl cursor-not-allowed ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 text-gray-400'
                              : 'border-gray-300 bg-gray-100 text-gray-600'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Email</label>
                        <input
                          type="email" value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="contato@email.com"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Empresa</label>
                        <input
                          type="text" value={formData.empresa}
                          onChange={(e) => handleInputChange('empresa', e.target.value)}
                          placeholder="Nome da empresa"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>CPF</label>
                          <input
                            type="text" value={formatCPF(formData.cpf)}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '')
                              if (cleaned.length <= 11) handleInputChange('cpf', cleaned)
                            }}
                            placeholder="000.000.000-00"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>CNPJ</label>
                          <input
                            type="text" value={formatCNPJ(formData.cnpj)}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '')
                              if (cleaned.length <= 14) handleInputChange('cnpj', cleaned)
                            }}
                            placeholder="00.000.000/0000-00"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        <MapPin className="w-5 h-5 text-[#305e73]" />
                        Endereço
                      </h3>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>CEP</label>
                        <input
                          type="text" value={formatCEP(formData.cep)}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '')
                            if (cleaned.length <= 8) {
                              handleInputChange('cep', cleaned)
                              if (cleaned.length === 8) fetchAddressByCEP(cleaned)
                            }
                          }}
                          placeholder="00000-000"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>Rua</label>
                        <input
                          type="text" value={formData.rua} onChange={(e) => handleInputChange('rua', e.target.value)}
                          placeholder="Nome da rua"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Número</label>
                          <input
                            type="text" value={formData.numero} onChange={(e) => handleInputChange('numero', e.target.value)}
                            placeholder="123"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Bairro</label>
                          <input
                            type="text" value={formData.bairro} onChange={(e) => handleInputChange('bairro', e.target.value)}
                            placeholder="Nome do bairro"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Cidade</label>
                          <input
                            type="text" value={formData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)}
                            placeholder="Nome da cidade"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Estado</label>
                          <input
                            type="text" value={formData.estado} onChange={(e) => handleInputChange('estado', e.target.value)}
                            placeholder="SP"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>País</label>
                        <input
                          type="text" value={formData.pais} onChange={(e) => handleInputChange('pais', e.target.value)}
                          placeholder="Brasil"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-end gap-4 pt-6 border-t ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    {!editContact && (
                      <button
                        type="button" onClick={() => setStep('search')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          isDark 
                            ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        Voltar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#3a6d84] hover:to-[#305e73] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {editContact ? 'Salvando...' : 'Criando...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          {editContact ? 'Salvar Alterações' : 'Criar Contato'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

