'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  UserX, 
  UserCheck,
  MessageCircle,
  TrendingUp,
  Star,
  Users,
  Activity,
  BarChart3,
  Layers
} from 'lucide-react'
import { AtendenteComStats } from '@/hooks/useAtendentes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AtendentesListProps {
  atendentes: AtendenteComStats[]
  onUpdateAtendente: (id: string, updates: Partial<AtendenteComStats>) => void
  onViewAtendente?: (atendente: AtendenteComStats) => void
  onEditAtendente?: (atendente: AtendenteComStats) => void
  onDeleteAtendente?: (atendente: AtendenteComStats) => void
  onAtribuirFila?: (atendente: AtendenteComStats) => void
}

export default function AtendentesList({ 
  atendentes, 
  onUpdateAtendente, 
  onViewAtendente, 
  onEditAtendente, 
  onDeleteAtendente,
  onAtribuirFila
}: AtendentesListProps) {
  const [selectedAtendente, setSelectedAtendente] = useState<string | null>(null)

  const toggleAtendenteStatus = (atendente: AtendenteComStats) => {
    onUpdateAtendente(atendente.id, { ativo: !atendente.ativo })
  }

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrador',
      'ATENDENTE_COMERCIAL': 'Comercial',
      'ATENDENTE_FINANCEIRO': 'Financeiro',
      'ATENDENTE_JURIDICO': 'Jurídico',
      'ATENDENTE_SUPORTE': 'Suporte',
      'ATENDENTE_VENDAS': 'Vendas',
      'ASSINANTE': 'Assinante',
      'AFILIADO': 'Afiliado'
    }
    return labels[tipo] || tipo
  }

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'text-purple-600 bg-purple-100',
      'ATENDENTE_COMERCIAL': 'text-blue-600 bg-blue-100',
      'ATENDENTE_FINANCEIRO': 'text-green-600 bg-green-100',
      'ATENDENTE_JURIDICO': 'text-indigo-600 bg-indigo-100',
      'ATENDENTE_SUPORTE': 'text-orange-600 bg-orange-100',
      'ATENDENTE_VENDAS': 'text-pink-600 bg-pink-100',
      'ASSINANTE': 'text-cyan-600 bg-cyan-100',
      'AFILIADO': 'text-yellow-600 bg-yellow-100'
    }
    return colors[tipo] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Atendentes ({atendentes.length})
          </h3>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {atendentes.map((atendente, index) => (
          <motion.div
            key={atendente.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden hover:shadow-2xl transition-all duration-500 group"
          >
            {/* Header com gradiente */}
            <div className={`h-2 bg-gradient-to-r ${
              atendente.ativo 
                ? 'from-green-400 via-emerald-500 to-teal-500' 
                : 'from-gray-400 via-gray-500 to-gray-600'
            }`} />
            
            <div className="p-6">
              {/* Avatar e Info Principal */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      atendente.ativo ? 'bg-gradient-to-br from-[#305e73] to-[#4a7c95]' : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      {getInitials(atendente.nome)}
                    </div>
                    
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-lg ${
                      atendente.ativo ? 'bg-green-400' : 'bg-red-400'
                    } animate-pulse`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#305e73] transition-colors truncate">
                      {atendente.nome}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        atendente.tipo === 'admin' 
                          ? 'text-purple-800 bg-purple-100 border border-purple-200' 
                          : atendente.tipo === 'comercial'
                          ? 'text-green-800 bg-green-100 border border-green-200'
                          : atendente.tipo === 'suporte'
                          ? 'text-blue-800 bg-blue-100 border border-blue-200'
                          : 'text-gray-800 bg-gray-100 border border-gray-200'
                      }`}>
                        {atendente.tipo === 'admin' ? 'Admin' : 
                         atendente.tipo === 'comercial' ? 'Comercial' : 
                         atendente.tipo === 'suporte' ? 'Suporte' : 'Atendente'}
                      </span>
                      
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        atendente.ativo 
                          ? 'text-green-800 bg-green-100 border border-green-200' 
                          : 'text-red-800 bg-red-100 border border-red-200'
                      }`}>
                        {atendente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions Button */}
                <div className="relative">
                  <button
                    onClick={() => setSelectedAtendente(selectedAtendente === atendente.id ? null : atendente.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group-hover:scale-105"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {selectedAtendente === atendente.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-20 backdrop-blur-sm"
                    >
                      <button
                        onClick={() => {
                          toggleAtendenteStatus(atendente)
                          setSelectedAtendente(null)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {atendente.ativo ? (
                          <><UserX className="w-4 h-4 text-red-500" />Desativar atendente</>
                        ) : (
                          <><UserCheck className="w-4 h-4 text-green-500" />Ativar atendente</>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          onViewAtendente?.(atendente)
                          setSelectedAtendente(null)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                        Visualizar detalhes
                      </button>
                      
                      <button
                        onClick={() => {
                          onEditAtendente?.(atendente)
                          setSelectedAtendente(null)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-orange-500" />
                        Editar atendente
                      </button>
                      
                      <div className="px-4 py-2">
                        <button
                          onClick={() => {
                            onAtribuirFila?.(atendente)
                            setSelectedAtendente(null)
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Users className="w-4 h-4" />
                          Atribuir à fila
                        </button>

                        <hr className="my-2 border-gray-100" />
                        
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o atendente ${atendente.nome}?`)) {
                              onDeleteAtendente?.(atendente)
                            }
                            setSelectedAtendente(null)
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir atendente
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Fila Atual - DESTAQUE */}
              {atendente.fila && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">Fila Atual:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${atendente.fila.cor}`} />
                      <span className="text-sm font-bold text-blue-900">{atendente.fila.nome}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="font-medium truncate">{atendente.email}</span>
                </div>
                
                {atendente.telefone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-green-500" />
                    <span className="font-medium">{atendente.telefone}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(atendente.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(atendente.atualizadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Statistics - Visual Melhorado - Oculto por padrão */}
              {atendente.estatisticas && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Estatísticas de Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {atendente.estatisticas.conversasAtivas}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">Conversas Ativas</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-green-100 group-hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {atendente.estatisticas.totalConversas}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">Total Conversas</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-yellow-100 group-hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {atendente.estatisticas.emAndamento}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">Em Andamento</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-purple-100 group-hover:scale-105 transition-transform">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {atendente.estatisticas.concluidas}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">Concluídas</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {atendentes.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum atendente encontrado
            </h3>
            <p className="text-gray-500">
              Use os filtros acima para encontrar atendentes específicos.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
