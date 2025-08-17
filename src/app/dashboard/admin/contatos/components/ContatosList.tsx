'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Phone, 
  Mail, 
  MessageSquare, 
  Star, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Tag,
  Calendar,
  Activity,
  MapPin
} from 'lucide-react'

interface ContatosListProps {
  searchQuery: string
}

interface Contato {
  id: string
  nome: string
  telefone: string
  email?: string
  foto_perfil?: string
  ultima_mensagem?: string
  ultima_interacao: string
  total_mensagens: number
  status: 'online' | 'offline' | 'ausente'
  favorito: boolean
  tags: string[]
  kanban_info?: {
    quadro_nome: string
    coluna_nome: string
    card_id: string
    cor: string
  }
  origem: 'whatsapp' | 'instagram' | 'facebook' | 'site' | 'manual'
  cidade?: string
  estado?: string
}

export default function ContatosList({ searchQuery }: ContatosListProps) {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Simular carregamento de dados da API
  useEffect(() => {
    const loadContatos = async () => {
      setLoading(true)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados mockados que simulam a estrutura real
      const mockContatos: Contato[] = [
        {
          id: '1',
          nome: 'João Silva',
          telefone: '+55 11 99999-9999',
          email: 'joao.silva@email.com',
          foto_perfil: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          ultima_mensagem: 'Oi, gostaria de saber mais sobre o produto',
          ultima_interacao: '2024-01-20T10:30:00Z',
          total_mensagens: 45,
          status: 'online',
          favorito: true,
          tags: ['cliente', 'vip'],
          kanban_info: {
            quadro_nome: 'Vendas',
            coluna_nome: 'Negociação',
            card_id: 'card-123',
            cor: '#3b82f6'
          },
          origem: 'whatsapp',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          telefone: '+55 11 88888-8888',
          email: 'maria.santos@empresa.com',
          foto_perfil: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          ultima_mensagem: 'Obrigada pelo atendimento!',
          ultima_interacao: '2024-01-19T14:15:00Z',
          total_mensagens: 23,
          status: 'offline',
          favorito: false,
          tags: ['prospect', 'marketing'],
          kanban_info: {
            quadro_nome: 'Marketing',
            coluna_nome: 'Qualificação',
            card_id: 'card-456',
            cor: '#10b981'
          },
          origem: 'instagram',
          cidade: 'Rio de Janeiro',
          estado: 'RJ'
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          telefone: '+55 11 77777-7777',
          ultima_mensagem: 'Quando podemos conversar?',
          ultima_interacao: '2024-01-18T16:45:00Z',
          total_mensagens: 12,
          status: 'ausente',
          favorito: false,
          tags: ['lead', 'design'],
          kanban_info: {
            quadro_nome: 'Projetos',
            coluna_nome: 'Aguardando',
            card_id: 'card-789',
            cor: '#f59e0b'
          },
          origem: 'site',
          cidade: 'Belo Horizonte',
          estado: 'MG'
        },
        {
          id: '4',
          nome: 'Ana Oliveira',
          telefone: '+55 11 66666-6666',
          email: 'ana.oliveira@startup.com',
          foto_perfil: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          ultima_mensagem: 'Vamos fechar o negócio hoje!',
          ultima_interacao: '2024-01-21T08:20:00Z',
          total_mensagens: 67,
          status: 'online',
          favorito: true,
          tags: ['cliente', 'ceo', 'investidor'],
          kanban_info: {
            quadro_nome: 'Vendas',
            coluna_nome: 'Fechamento',
            card_id: 'card-101',
            cor: '#ef4444'
          },
          origem: 'whatsapp',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        {
          id: '5',
          nome: 'Carlos Ferreira',
          telefone: '+55 11 55555-5555',
          email: 'carlos.ferreira@corp.com',
          ultima_mensagem: 'Preciso de mais informações',
          ultima_interacao: '2024-01-17T12:00:00Z',
          total_mensagens: 8,
          status: 'offline',
          favorito: false,
          tags: ['corporativo', 'diretor'],
          origem: 'facebook',
          cidade: 'Brasília',
          estado: 'DF'
        }
      ]
      
      setContatos(mockContatos)
      setLoading(false)
    }

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
      contato.cidade?.toLowerCase().includes(searchLower)
    )
  })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'ausente':
        return 'bg-yellow-500'
      case 'offline':
      default:
        return 'bg-gray-400'
    }
  }

  const getOrigemIcon = (origem: string) => {
    switch (origem) {
      case 'whatsapp':
        return '💬'
      case 'instagram':
        return '📷'
      case 'facebook':
        return '📘'
      case 'site':
        return '🌐'
      case 'manual':
        return '✏️'
      default:
        return '📱'
    }
  }

  const handleToggleFavorito = (id: string) => {
    setContatos(prev => prev.map(c => 
      c.id === id ? { ...c, favorito: !c.favorito } : c
    ))
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#305e73]/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#305e73] absolute top-0 left-0"></div>
          </div>
          <span className="mt-6 text-gray-700 font-medium text-lg">Carregando contatos...</span>
          <span className="mt-2 text-gray-500 text-sm">Sincronizando dados do WhatsApp</span>
        </div>
      </motion.div>
    )
  }

  if (filteredContatos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-[#305e73]/10 to-[#3a6d84]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-12 h-12 text-[#305e73]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {searchQuery ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {searchQuery 
            ? 'Tente ajustar sua busca para encontrar contatos'
            : 'Seus contatos do WhatsApp aparecerão aqui automaticamente'
          }
        </p>
        {!searchQuery && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-3 mx-auto font-semibold"
          >
            <UserPlus className="w-5 h-5" />
            Sincronizar Contatos
          </motion.button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Contatos ({filteredContatos.length})
            </h3>
            <p className="text-gray-600 text-sm">
              Lista de todos os seus contatos sincronizados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">
                Sincronizado há 5 min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {filteredContatos.map((contato, index) => (
            <motion.div
              key={contato.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
              className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 group cursor-pointer border-l-4 border-transparent hover:border-[#305e73] hover:shadow-md"
              onClick={() => {/* Navegar para detalhes do contato */}}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {contato.foto_perfil ? (
                    <img
                      src={contato.foto_perfil}
                      alt={contato.nome}
                      className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {contato.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(contato.status)} rounded-full border-2 border-white shadow-sm`}></div>
                  
                  {/* Origem badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm border-2 border-gray-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {getOrigemIcon(contato.origem)}
                  </div>
                </div>

                {/* Informações principais */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {contato.nome}
                    </h4>
                    
                    {contato.favorito && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                    
                    {/* Kanban Badge */}
                    {contato.kanban_info && (
                      <span 
                        className="inline-flex items-center px-3 py-1.5 text-xs text-white rounded-full font-semibold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200"
                        style={{ 
                          background: `linear-gradient(135deg, ${contato.kanban_info.cor}, ${contato.kanban_info.cor}dd)`,
                          boxShadow: `0 2px 8px ${contato.kanban_info.cor}40`
                        }}
                      >
                        <Tag className="w-3 h-3 mr-1.5" />
                        {contato.kanban_info.coluna_nome}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{contato.telefone}</span>
                    </div>
                    
                    {contato.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{contato.email}</span>
                      </div>
                    )}
                    
                    {contato.cidade && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{contato.cidade}, {contato.estado}</span>
                      </div>
                    )}
                  </div>

                  {/* Última mensagem */}
                  {contato.ultima_mensagem && (
                    <p className="text-sm text-gray-500 truncate mb-2">
                      💬 {contato.ultima_mensagem}
                    </p>
                  )}

                  {/* Tags */}
                  {contato.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {contato.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#305e73]/10 to-[#3a6d84]/10 text-[#305e73] rounded-full text-xs font-semibold border border-[#305e73]/20 group-hover:scale-105 transition-transform duration-200"
                        >
                          #{tag}
                        </span>
                      ))}
                      {contato.tags.length > 3 && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full text-xs font-semibold border border-gray-300 group-hover:scale-105 transition-transform duration-200">
                          +{contato.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Estatísticas e ações */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  {/* Stats */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {contato.total_mensagens}
                    </div>
                    <div className="text-xs text-gray-600">mensagens</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {formatTimestamp(contato.ultima_interacao)}
                    </div>
                    <div className="text-xs text-gray-600">última interação</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorito(contato.id)
                      }}
                      className={`p-2.5 rounded-xl transition-all duration-200 shadow-sm ${
                        contato.favorito
                          ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200 border border-yellow-200'
                          : 'text-gray-400 bg-gray-100 hover:bg-yellow-100 hover:text-yellow-600 border border-gray-200 hover:border-yellow-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${contato.favorito ? 'fill-current' : ''}`} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        // Abrir chat
                      }}
                      className="p-2.5 text-[#305e73] bg-[#305e73]/10 hover:bg-[#305e73]/20 rounded-xl transition-all duration-200 shadow-sm border border-[#305e73]/20 hover:border-[#305e73]/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </motion.button>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === contato.id ? null : contato.id)
                        }}
                        className="p-2.5 text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-sm border border-gray-200 hover:border-gray-300"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>

                      {openMenuId === contato.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-10 backdrop-blur-sm"
                        >
                          <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 flex items-center gap-3 rounded-lg mx-2 transition-all duration-200">
                            <Eye className="w-4 h-4 text-[#305e73]" />
                            <span className="font-medium">Ver Perfil</span>
                          </button>
                          <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 flex items-center gap-3 rounded-lg mx-2 transition-all duration-200">
                            <Edit className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Editar</span>
                          </button>
                          <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 flex items-center gap-3 rounded-lg mx-2 transition-all duration-200">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Iniciar Conversa</span>
                          </button>
                          <hr className="my-3 mx-2 border-gray-200" />
                          <button className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 flex items-center gap-3 rounded-lg mx-2 transition-all duration-200">
                            <Trash2 className="w-4 h-4" />
                            <span className="font-medium">Remover</span>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
