'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Users,
  UserPlus,
  MoreHorizontal,
  Star,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Tag,
  MessageSquare,
  MoreVertical
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import ContactActionModal from './ContactActionModal'
import CreateContactModal from './CreateContactModal'

interface ContatosListProps {
  searchQuery: string
  refreshKey?: number
}

interface Contato {
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
  pais?: string
  foto_perfil?: string
  ultima_mensagem: string
  ultima_interacao: string
  total_mensagens: number
  status: 'online' | 'offline' | 'ausente'
  favorito: boolean
  tags: string[]
  origem: 'whatsapp' | 'instagram' | 'facebook' | 'site' | 'manual'
  cidade?: string
  estado?: string
}

export default function ContatosList({ searchQuery }: ContatosListProps) {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contato | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Carregar contatos reais da API
  const loadContatos = async () => {
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      console.log('📞 Buscando contatos da API...')
      
      const response = await fetch('/api/contatos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Contatos carregados:', data.length)
          
          // Transformar dados do backend para formato do frontend
          const contatosTransformados = data.map((contato: any) => ({
            id: contato.id,
            nome: contato.nome || contato.numeroTelefone,
            telefone: contato.numeroTelefone,
            email: contato.email,
            empresa: contato.empresa,
            cpf: contato.cpf,
            cnpj: contato.cnpj,
            cep: contato.cep,
            rua: contato.rua,
            numero: contato.numero,
            bairro: contato.bairro,
            pais: contato.pais,
            foto_perfil: contato.fotoPerfil,
            ultima_mensagem: '',
            ultima_interacao: contato.atualizadoEm || contato.criadoEm,
            total_mensagens: 0,
            status: 'offline' as const,
            favorito: contato.favorito || false,
            tags: [], // TODO: carregar tags relacionadas
            origem: 'whatsapp' as const, // Assumir WhatsApp por padrão
            cidade: contato.cidade,
            estado: contato.estado
          }))
          
          setContatos(contatosTransformados)
        } else {
          console.error('Erro ao buscar contatos:', response.status)
          setContatos([])
        }
      } catch (error) {
        console.error('Erro ao carregar contatos:', error)
        setContatos([])
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadContatos()
  }, [])

  // Filtrar contatos baseado na busca
  const filteredContatos = contatos.filter(contato => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      contato.nome.toLowerCase().includes(searchLower) ||
      contato.telefone.includes(searchQuery) ||
      contato.email?.toLowerCase().includes(searchLower) ||
      contato.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      contato.cidade?.toLowerCase().includes(searchLower) ||
      contato.estado?.toLowerCase().includes(searchLower)
    )
  })

  // Função para formatar timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return `${days} dias`
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  // Função para toggle favorito
  const handleToggleFavorito = async (id: string) => {
    const contato = contatos.find(c => c.id === id)
    if (!contato) return

    const novoFavorito = !contato.favorito

    // Atualizar UI otimisticamente
    setContatos(prev => prev.map(c => 
      c.id === id ? { ...c, favorito: novoFavorito } : c
    ))

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/contatos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ favorito: novoFavorito })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar favorito')
      }
    } catch (error) {
      console.error('Erro ao salvar favorito:', error)
      // Reverter mudança na UI se API falhou
      setContatos(prev => prev.map(c => 
        c.id === id ? { ...c, favorito: contato.favorito } : c
      ))
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#305e73]"></div>
          <span className="ml-2 text-gray-600">Carregando contatos...</span>
        </div>
      </div>
    )
  }

  if (filteredContatos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchQuery ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
        </h3>
        <p className="text-gray-600 mb-6">
          {searchQuery 
            ? 'Tente ajustar sua busca para encontrar contatos'
            : 'Seus contatos do WhatsApp aparecerão aqui automaticamente'
          }
        </p>
        {!searchQuery && (
          <div className="flex gap-4 justify-center">
            <motion.button 
              onClick={() => setIsCreateModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Novo Contato
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Sincronizar Contatos
            </motion.button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#305e73] via-[#3a6d84] to-[#305e73] px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Contatos
              </h2>
              <p className="text-white/80 text-sm">
                {filteredContatos.length} de {contatos.length} contatos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/20 rounded-full text-white text-sm font-medium">
              {contatos.filter(c => c.favorito).length} favoritos
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Contatos */}
      <div className="p-2">
        <AnimatePresence>
          {filteredContatos.map((contato, index) => (
            <motion.div
              key={contato.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 m-2 bg-gray-50/50 hover:bg-white hover:shadow-lg rounded-2xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start justify-between">
                {/* Informações principais */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="relative group-hover:scale-105 transition-transform duration-200">
                    {contato.foto_perfil ? (
                      <img
                        src={contato.foto_perfil}
                        alt={contato.nome}
                        className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#305e73] via-[#3a6d84] to-[#4a7d94] flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                          {contato.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-sm
                      ${contato.status === 'online' ? 'bg-green-500' : 
                        contato.status === 'ausente' ? 'bg-yellow-500' : 'bg-gray-400'}
                    `} />
                  </div>

                  {/* Detalhes do contato */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                            {contato.nome}
                            {contato.favorito && (
                              <Star className="w-5 h-5 text-yellow-500 fill-current inline-block ml-2" />
                            )}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full font-semibold border border-green-200">
                              WhatsApp
                            </span>
                            <div className={`w-2 h-2 rounded-full ${
                              contato.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-xs text-gray-500">
                              {contato.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorito(contato.id)
                          }}
                          className={`p-2.5 rounded-xl transition-all hover:scale-110 ${
                            contato.favorito 
                              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                              : 'text-gray-400 bg-gray-50 hover:bg-yellow-50 hover:text-yellow-500'
                          }`}
                          title={contato.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Star className={`w-5 h-5 ${contato.favorito ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedContact(contato)
                            setIsActionModalOpen(true)
                          }}
                          className="p-2.5 text-gray-400 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all hover:scale-110"
                          title="Ações do contato"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Telefone</p>
                          <p className="font-semibold text-gray-900">{contato.telefone}</p>
                        </div>
                      </div>
                      {contato.email && (
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Mail className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-purple-600 font-medium">Email</p>
                            <p className="font-semibold text-gray-900 truncate">{contato.email}</p>
                          </div>
                        </div>
                      )}
                      {contato.cidade && contato.estado && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-emerald-600 font-medium">Localização</p>
                            <p className="font-semibold text-gray-900 truncate">{contato.cidade}, {contato.estado}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <Calendar className="w-3 h-3 text-gray-500" />
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {contato.ultima_interacao 
                            ? formatTimestamp(contato.ultima_interacao)
                            : 'Novo contato'
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500">
                          {contato.total_mensagens} msg{contato.total_mensagens !== 1 ? 's' : ''}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contato.favorito ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {contato.favorito ? 'Favorito' : 'Normal'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Contact Action Modal */}
      {selectedContact && (
        <ContactActionModal
          isOpen={isActionModalOpen}
          onClose={() => {
            setIsActionModalOpen(false)
            setSelectedContact(null)
          }}
          contact={{
            id: selectedContact.id,
            nome: selectedContact.nome,
            telefone: selectedContact.telefone,
            email: selectedContact.email,
            empresa: selectedContact.empresa,
            cpf: selectedContact.cpf,
            cnpj: selectedContact.cnpj,
            cep: selectedContact.cep,
            rua: selectedContact.rua,
            numero: selectedContact.numero,
            bairro: selectedContact.bairro,
            cidade: selectedContact.cidade,
            estado: selectedContact.estado,
            pais: selectedContact.pais,
            fotoPerfil: selectedContact.foto_perfil
          }}
          onSuccess={() => {
            loadContatos() // Recarregar lista após ação
          }}
          onEdit={(contactData) => {
            setEditingContact(contactData)
            setIsEditModalOpen(true)
          }}
        />
      )}

      {/* Edit Contact Modal */}
      <CreateContactModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingContact(null)
        }}
        onSuccess={() => {
          loadContatos() // Recarregar lista após edição
          setIsEditModalOpen(false)
          setEditingContact(null)
        }}
        editContact={editingContact}
      />
    </div>
  )
}