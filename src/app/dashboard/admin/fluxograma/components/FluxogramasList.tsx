'use client'

import { motion } from 'framer-motion'
import { 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  MoreVertical,
  Activity,
  Calendar,
  Target,
  GitBranch,
  Clock,
  Users,
  MessageSquare,
  Bot,
  Layers
} from 'lucide-react'
import { useState } from 'react'
import { Fluxograma } from '../page'

interface FluxogramasListProps {
  fluxogramas: Fluxograma[]
  onEdit: (fluxograma: Fluxograma) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onView: (fluxograma: Fluxograma) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ativo':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'inativo':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'rascunho':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getCategoryColor = (categoria: string) => {
  switch (categoria) {
    case 'delivery':
      return 'bg-orange-100 text-orange-800'
    case 'vendas':
      return 'bg-blue-100 text-blue-800'
    case 'saude':
      return 'bg-green-100 text-green-800'
    case 'suporte':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getNodeTypeIcon = (type: string) => {
  switch (type) {
    case 'trigger':
      return MessageSquare
    case 'condition':
      return GitBranch
    case 'ia':
      return Bot
    case 'atendente':
      return Users
    case 'kanban':
      return Layers
    case 'delay':
      return Clock
    default:
      return Target
  }
}

export default function FluxogramasList({
  fluxogramas,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
  onView
}: FluxogramasListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNodeTypesPreview = (nodes: any[]) => {
    const types = [...new Set(nodes.map(node => node.type))]
    return types.slice(0, 4).map(type => {
      const Icon = getNodeTypeIcon(type)
      return <Icon key={type} className="w-3 h-3" />
    })
  }

  if (fluxogramas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nenhum fluxograma encontrado
        </h3>
        <p className="text-gray-600 mb-6">
          Crie seu primeiro fluxograma de automação para começar
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fluxogramas.map((fluxograma, index) => (
        <motion.div
          key={fluxograma.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 overflow-hidden group"
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-[#305e73] transition-colors">
                  {fluxograma.nome}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {fluxograma.descricao}
                </p>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === fluxograma.id ? null : fluxograma.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {openMenuId === fluxograma.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10"
                  >
                    <button
                      onClick={() => {
                        onView(fluxograma)
                        setOpenMenuId(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    <button
                      onClick={() => {
                        onEdit(fluxograma)
                        setOpenMenuId(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate(fluxograma.id)
                        setOpenMenuId(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </button>
                    <button
                      onClick={() => {
                        onToggleStatus(fluxograma.id)
                        setOpenMenuId(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      {fluxograma.status === 'ativo' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Ativar
                        </>
                      )}
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        onDelete(fluxograma.id)
                        setOpenMenuId(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Status and Category */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(fluxograma.status)}`}>
                {fluxograma.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(fluxograma.categoria)}`}>
                {fluxograma.categoria}
              </span>
            </div>

            {/* Tags */}
            {fluxograma.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {fluxograma.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {fluxograma.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{fluxograma.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {fluxograma.nodes.length}
                </div>
                <div className="text-xs text-gray-600">Elementos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {fluxograma.edges.length}
                </div>
                <div className="text-xs text-gray-600">Conexões</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#305e73]">
                  {fluxograma.execucoes.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Execuções</div>
              </div>
            </div>

            {/* Node Types Preview */}
            {fluxograma.nodes.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-600">Elementos:</span>
                <div className="flex items-center gap-1 text-gray-500">
                  {getNodeTypesPreview(fluxograma.nodes)}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Criado: {formatDate(fluxograma.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3" />
                <span>Atualizado: {formatDate(fluxograma.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onView(fluxograma)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#305e73] hover:bg-[#305e73]/10 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(fluxograma)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                
                <button
                  onClick={() => onToggleStatus(fluxograma.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    fluxograma.status === 'ativo'
                      ? 'text-red-700 hover:bg-red-100'
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  {fluxograma.status === 'ativo' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Ativar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
