'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Star, 
  Phone, 
  Mail, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Clock,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'

interface Contato {
  id: string
  nome: string
  telefone: string
  email?: string
  foto_perfil?: string
  total_orcamentos: number
  valor_total: number
  ultimo_orcamento: string
  status: 'ativo' | 'inativo'
  favorito: boolean
  tags: string[]
}

interface ContatosSidebarProps {
  contatos: Contato[]
  selectedContato: Contato | null
  onSelectContato: (contato: Contato) => void
  searchQuery: string
}

export default function ContatosSidebar({
  contatos,
  selectedContato,
  onSelectContato,
  searchQuery
}: ContatosSidebarProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return 'Hoje'
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return `${days} dias atrás`
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500'
      case 'inativo':
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <motion.div
        className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#305e73]" />
              Contatos
            </h2>
            <p className="text-gray-600 text-sm">
              {contatos.length} contatos com orçamentos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-[#305e73] hover:bg-[#305e73]/10 rounded-lg transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">127</div>
                <div className="text-xs text-gray-600">Orçamentos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">R$ 2.1M</div>
                <div className="text-xs text-gray-600">Valor Total</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {contatos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum contato encontrado
            </h3>
            <p className="text-gray-600 text-sm">
              {searchQuery ? 'Tente ajustar sua busca' : 'Nenhum contato com orçamentos'}
            </p>
          </motion.div>
        ) : (
          <div className="p-4 space-y-2">
            <AnimatePresence>
              {contatos.map((contato, index) => (
                <motion.div
                  key={contato.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => onSelectContato(contato)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                    selectedContato?.id === contato.id
                      ? 'bg-gradient-to-r from-[#305e73]/10 to-[#3a6d84]/10 border-2 border-[#305e73]/30 shadow-lg'
                      : 'bg-gray-50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 border-2 border-transparent hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedContato?.id === contato.id && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#305e73] to-[#3a6d84]"
                    />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {contato.foto_perfil ? (
                        <img
                          src={contato.foto_perfil}
                          alt={contato.nome}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                          {contato.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                      
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(contato.status)} rounded-full border-2 border-white shadow-sm`}></div>
                      
                      {/* Favorite star */}
                      {contato.favorito && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <Star className="w-3 h-3 text-white fill-current" />
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name and contact */}
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#305e73] transition-colors">
                          {contato.nome}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{contato.telefone}</span>
                        </div>
                        {contato.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{contato.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/80 rounded-lg p-2 text-center group-hover:bg-white transition-colors">
                          <div className="text-lg font-bold text-[#305e73]">
                            {contato.total_orcamentos}
                          </div>
                          <div className="text-xs text-gray-600">Orçamentos</div>
                        </div>
                        <div className="bg-white/80 rounded-lg p-2 text-center group-hover:bg-white transition-colors">
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrency(contato.valor_total)}
                          </div>
                          <div className="text-xs text-gray-600">Valor Total</div>
                        </div>
                      </div>

                      {/* Tags */}
                      {contato.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {contato.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-[#305e73]/10 text-[#305e73] rounded-full text-xs font-medium border border-[#305e73]/20 group-hover:scale-105 transition-transform duration-200"
                            >
                              #{tag}
                            </span>
                          ))}
                          {contato.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              +{contato.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Last activity */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Último: {formatTimestamp(contato.ultimo_orcamento)}</span>
                        </div>
                        
                        {selectedContato?.id === contato.id && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[#305e73]"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#305e73]/5 to-[#3a6d84]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    whileHover={{ scale: 1.01 }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <motion.div
        className="p-4 border-t border-gray-200 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>+12% este mês</span>
          </div>
          <div className="text-xs">
            Atualizado há 5 min
          </div>
        </div>
      </motion.div>
    </div>
  )
}
