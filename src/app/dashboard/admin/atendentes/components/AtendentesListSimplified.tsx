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
import { useTheme } from '@/contexts/ThemeContext'

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
  const { actualTheme } = useTheme()
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
    if (actualTheme === 'dark') {
      const darkColors: Record<string, string> = {
        'ADMIN': 'text-purple-400 bg-purple-500/10',
        'ATENDENTE_COMERCIAL': 'text-blue-400 bg-blue-500/10',
        'ATENDENTE_FINANCEIRO': 'text-green-400 bg-green-500/10',
        'ATENDENTE_JURIDICO': 'text-indigo-400 bg-indigo-500/10',
        'ATENDENTE_SUPORTE': 'text-orange-400 bg-orange-500/10',
        'ATENDENTE_VENDAS': 'text-pink-400 bg-pink-500/10',
        'ASSINANTE': 'text-cyan-400 bg-cyan-500/10',
        'AFILIADO': 'text-yellow-400 bg-yellow-500/10'
      }
      return darkColors[tipo] || 'text-slate-400 bg-slate-500/10'
    } else {
      const lightColors: Record<string, string> = {
        'ADMIN': 'text-purple-600 bg-purple-100',
        'ATENDENTE_COMERCIAL': 'text-blue-600 bg-blue-100',
        'ATENDENTE_FINANCEIRO': 'text-green-600 bg-green-100',
        'ATENDENTE_JURIDICO': 'text-indigo-600 bg-indigo-100',
        'ATENDENTE_SUPORTE': 'text-orange-600 bg-orange-100',
        'ATENDENTE_VENDAS': 'text-pink-600 bg-pink-100',
        'ASSINANTE': 'text-cyan-600 bg-cyan-100',
        'AFILIADO': 'text-yellow-600 bg-yellow-100'
      }
      return lightColors[tipo] || 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`rounded-2xl shadow-sm border backdrop-blur-sm ${
      actualTheme === 'dark'
        ? 'bg-slate-800/60 border-slate-700/50'
        : 'bg-white border-gray-100'
    }`}>
      <div className={`p-6 border-b ${
        actualTheme === 'dark' ? 'border-slate-700/50' : 'border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
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
            className={`rounded-3xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-500 group backdrop-blur-sm ${
              actualTheme === 'dark'
                ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-slate-700/50'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-100/50'
            }`}
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
                    <h3 className={`text-xl font-bold mb-2 group-hover:text-[#305e73] transition-colors truncate ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {atendente.nome}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getTipoColor(atendente.tipo)}`}>
                        {getTipoLabel(atendente.tipo)}
                      </span>
                      
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        atendente.ativo 
                          ? actualTheme === 'dark'
                            ? 'text-green-400 bg-green-500/10 border border-green-500/30' 
                            : 'text-green-800 bg-green-100 border border-green-200'
                          : actualTheme === 'dark'
                            ? 'text-red-400 bg-red-500/10 border border-red-500/30'
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
                    className={`p-2 rounded-xl transition-all duration-200 group-hover:scale-105 ${
                      actualTheme === 'dark'
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {selectedAtendente === atendente.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border py-3 z-20 backdrop-blur-sm ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800/90 border-slate-700/50'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => {
                          toggleAtendenteStatus(atendente)
                          setSelectedAtendente(null)
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          actualTheme === 'dark'
                            ? 'text-white/80 hover:bg-slate-700/50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
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
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          actualTheme === 'dark'
                            ? 'text-white/80 hover:bg-slate-700/50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                        Visualizar detalhes
                      </button>
                      
                      <button
                        onClick={() => {
                          onEditAtendente?.(atendente)
                          setSelectedAtendente(null)
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          actualTheme === 'dark'
                            ? 'text-white/80 hover:bg-slate-700/50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
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

                        <hr className={`my-2 ${
                          actualTheme === 'dark' ? 'border-slate-600/50' : 'border-gray-100'
                        }`} />
                        
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o atendente ${atendente.nome}?`)) {
                              onDeleteAtendente?.(atendente)
                            }
                            setSelectedAtendente(null)
                          }}
                          className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                            actualTheme === 'dark'
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
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
                <div className={`mb-4 p-3 rounded-xl border ${
                  actualTheme === 'dark'
                    ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <Layers className={`w-4 h-4 ${
                      actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>Fila Atual:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${atendente.fila.cor}`} />
                      <span className={`text-sm font-bold ${
                        actualTheme === 'dark' ? 'text-blue-200' : 'text-blue-900'
                      }`}>{atendente.fila.nome}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className={`flex items-center text-sm ${
                  actualTheme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  <Mail className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="font-medium truncate">{atendente.email}</span>
                </div>
                
                {atendente.telefone && (
                  <div className={`flex items-center text-sm ${
                    actualTheme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    <Phone className="w-4 h-4 mr-3 text-green-500" />
                    <span className="font-medium">{atendente.telefone}</span>
                  </div>
                )}
                
                <div className={`flex items-center justify-between text-xs pt-2 border-t ${
                  actualTheme === 'dark' 
                    ? 'text-slate-500 border-slate-700/50' 
                    : 'text-gray-500 border-gray-100'
                }`}>
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

              {/* Statistics - Visual Melhorado - Sempre Visível */}
              {atendente.estatisticas && (
                <div className={`rounded-2xl p-4 border transition-opacity duration-300 ${
                  actualTheme === 'dark'
                    ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50'
                    : 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-100'
                }`}>
                  <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${
                    actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
                  }`}>
                    <BarChart3 className={`w-4 h-4 ${
                      actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    Estatísticas de Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-xl p-3 text-center shadow-sm border group-hover:scale-105 transition-transform ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/70 border-blue-500/30'
                        : 'bg-white border-blue-100'
                    }`}>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {atendente.estatisticas.conversasAtivas}
                      </div>
                      <div className={`text-xs font-semibold ${
                        actualTheme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                      }`}>Conversas Ativas</div>
                    </div>
                    
                    <div className={`rounded-xl p-3 text-center shadow-sm border group-hover:scale-105 transition-transform ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/70 border-green-500/30'
                        : 'bg-white border-green-100'
                    }`}>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {atendente.estatisticas.totalConversas}
                      </div>
                      <div className={`text-xs font-semibold ${
                        actualTheme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                      }`}>Total Conversas</div>
                    </div>
                    
                    <div className={`rounded-xl p-3 text-center shadow-sm border group-hover:scale-105 transition-transform ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/70 border-yellow-500/30'
                        : 'bg-white border-yellow-100'
                    }`}>
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {atendente.estatisticas.emAndamento}
                      </div>
                      <div className={`text-xs font-semibold ${
                        actualTheme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                      }`}>Em Andamento</div>
                    </div>
                    
                    <div className={`rounded-xl p-3 text-center shadow-sm border group-hover:scale-105 transition-transform ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/70 border-purple-500/30'
                        : 'bg-white border-purple-100'
                    }`}>
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {atendente.estatisticas.concluidas}
                      </div>
                      <div className={`text-xs font-semibold ${
                        actualTheme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                      }`}>Concluídas</div>
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
