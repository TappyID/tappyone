'use client'

import { motion } from 'framer-motion'
import { 
  Send, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  XCircle, 
  Clock,
  CheckCircle,
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  Image,
  FileAudio,
  Video,
  Type
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Campanha {
  id: string
  nome: string
  descricao?: string
  tipoMensagem: 'texto' | 'audio' | 'imagem' | 'video'
  conteudoMensagem: string
  status: 'rascunho' | 'agendado' | 'enviando' | 'concluido' | 'cancelado' | 'pausado'
  totalContatos: number
  enviadosComSucesso: number
  falhasEnvio: number
  agendadoPara?: string
  createdAt: string
  geradoPorIa: boolean
}

interface DisparosListProps {
  campanhas: Campanha[]
  loading: boolean
  onEdit: (campanha: Campanha) => void
  onDelete: (id: string) => void
  onDisparar: (id: string) => void
  onPausar: (id: string) => void
  onCancelar: (id: string) => void
}

export function DisparosList({
  campanhas,
  loading,
  onEdit,
  onDelete,
  onDisparar,
  onPausar,
  onCancelar
}: DisparosListProps) {
  const getStatusConfig = (status: Campanha['status']) => {
    const configs = {
      rascunho: {
        label: 'Rascunho',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        icon: Edit
      },
      agendado: {
        label: 'Agendado',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: Clock
      },
      enviando: {
        label: 'Enviando',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: TrendingUp
      },
      concluido: {
        label: 'Concluído',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      },
      cancelado: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle
      },
      pausado: {
        label: 'Pausado',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Pause
      }
    }
    return configs[status]
  }

  const getTipoIcon = (tipo: Campanha['tipoMensagem']) => {
    const icons = {
      texto: Type,
      audio: FileAudio,
      imagem: Image,
      video: Video
    }
    return icons[tipo] || Type
  }

  const calcularProgresso = (campanha: Campanha) => {
    if (campanha.totalContatos === 0) return 0
    return Math.round((campanha.enviadosComSucesso / campanha.totalContatos) * 100)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (campanhas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700"
      >
        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-violet-600 dark:text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Nenhuma campanha criada
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Crie sua primeira campanha de disparo em massa
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {campanhas.map((campanha, index) => {
        const statusConfig = getStatusConfig(campanha.status)
        const StatusIcon = statusConfig.icon
        const TipoIcon = getTipoIcon(campanha.tipoMensagem)
        const progresso = calcularProgresso(campanha)

        return (
          <motion.div
            key={campanha.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campanha.nome}
                  </h3>
                  {campanha.geradoPorIa && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                      ✨ IA
                    </span>
                  )}
                </div>
                {campanha.descricao && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {campanha.descricao}
                  </p>
                )}
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusConfig.label}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                  <TipoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {campanha.tipoMensagem}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {campanha.totalContatos} contatos
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {campanha.enviadosComSucesso} enviados
                </span>
              </div>

              {campanha.falhasEnvio > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {campanha.falhasEnvio} falhas
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {campanha.status === 'enviando' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                  <span className="font-medium text-gray-900 dark:text-white">{progresso}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progresso}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Agendamento */}
            {campanha.agendadoPara && campanha.status === 'agendado' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span>
                  Agendado para {format(new Date(campanha.agendadoPara), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}

            {/* Preview da Mensagem */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {campanha.conteudoMensagem}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              {(campanha.status === 'rascunho' || campanha.status === 'agendado') && (
                <>
                  <button
                    onClick={() => onDisparar(campanha.id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Disparar
                  </button>
                  <button
                    onClick={() => onEdit(campanha)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </>
              )}

              {campanha.status === 'enviando' && (
                <button
                  onClick={() => onPausar(campanha.id)}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Pause className="w-4 h-4" />
                  Pausar
                </button>
              )}

              {(campanha.status === 'enviando' || campanha.status === 'pausado') && (
                <button
                  onClick={() => onCancelar(campanha.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              )}

              {(campanha.status === 'concluido' || campanha.status === 'cancelado') && (
                <button
                  onClick={() => onDelete(campanha.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </button>
              )}
            </div>

            {/* Footer - Data de criação */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
              Criado em {format(new Date(campanha.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
