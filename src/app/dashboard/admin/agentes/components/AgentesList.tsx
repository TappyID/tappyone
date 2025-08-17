'use client'

import { motion } from 'framer-motion'
import { 
  Bot, 
  Brain,
  Edit, 
  Trash2, 
  Eye,
  Play,
  Pause,
  Copy,
  MoreVertical,
  MessageSquare,
  Users,
  Activity,
  Zap,
  Settings,
  Target,
  Layers,
  GitBranch,
  Clock
} from 'lucide-react'
import { useState } from 'react'
import { Agente } from '../page'

interface AgentesListProps {
  agentes: Agente[]
  onEdit: (agente: Agente) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onView: (agente: Agente) => void
}

const modeloIcons = {
  chatgpt: '🤖',
  deepseek: '🧠',
  qwen: '⚡'
}

const modeloColors = {
  chatgpt: 'bg-green-100 text-green-700 border-green-200',
  deepseek: 'bg-blue-100 text-blue-700 border-blue-200',
  qwen: 'bg-purple-100 text-purple-700 border-purple-200'
}

const nichoColors = {
  delivery: 'bg-orange-100 text-orange-700',
  odontologico: 'bg-blue-100 text-blue-700',
  clinicas: 'bg-green-100 text-green-700',
  ecommerce: 'bg-purple-100 text-purple-700',
  imobiliario: 'bg-yellow-100 text-yellow-700'
}

const departamentoIcons = {
  vendas: Target,
  comercial: Users,
  financeiro: Activity,
  juridico: Settings,
  suporte: MessageSquare
}

export default function AgentesList({
  agentes,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
  onView
}: AgentesListProps) {
  const [selectedAgente, setSelectedAgente] = useState<string | null>(null)

  if (agentes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nenhum agente encontrado
        </h3>
        <p className="text-gray-600 mb-6">
          Crie seu primeiro agente de IA para automatizar atendimentos
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
        >
          <Bot className="w-5 h-5" />
          Criar Primeiro Agente
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {agentes.map((agente, index) => {
        const DepartamentoIcon = departamentoIcons[agente.departamento as keyof typeof departamentoIcons] || Settings
        
        return (
          <motion.div
            key={agente.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            {/* Status Indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              agente.status === 'ativado' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  agente.status === 'ativado' 
                    ? 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]' 
                    : 'bg-gray-400'
                }`}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 truncate max-w-[150px]">
                    {agente.nome}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      nichoColors[agente.nicho as keyof typeof nichoColors] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {agente.nicho}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedAgente(
                    selectedAgente === agente.id ? null : agente.id
                  )}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Dropdown Menu */}
                {selectedAgente === agente.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]"
                  >
                    <button
                      onClick={() => {
                        onView(agente)
                        setSelectedAgente(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                    
                    <button
                      onClick={() => {
                        onEdit(agente)
                        setSelectedAgente(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => {
                        onDuplicate(agente.id)
                        setSelectedAgente(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </button>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={() => {
                        onToggleStatus(agente.id)
                        setSelectedAgente(null)
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                        agente.status === 'ativado' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {agente.status === 'ativado' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Ativar
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        onDelete(agente.id)
                        setSelectedAgente(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Departamento e Modelo */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DepartamentoIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 capitalize">
                  {agente.departamento}
                </span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                modeloColors[agente.modelo]
              }`}>
                <span className="mr-1">{modeloIcons[agente.modelo]}</span>
                {agente.modelo.toUpperCase()}
              </div>
            </div>

            {/* Prompt Preview */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {agente.prompt}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600">Chats</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{agente.chats.length}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-600">Tokens</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {(agente.usodetokens / 1000).toFixed(1)}k
                </p>
              </div>
            </div>

            {/* Connections */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Kanban</span>
                </div>
                <span className="font-medium text-gray-900">{agente.kanban.length}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Listas</span>
                </div>
                <span className="font-medium text-gray-900">{agente.lista.length}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Fluxos</span>
                </div>
                <span className="font-medium text-gray-900">{agente.fluxograma_id.length}</span>
              </div>
            </div>

            {/* Regras Preview */}
            {agente.regras.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Regras:</p>
                <div className="flex flex-wrap gap-1">
                  {agente.regras.slice(0, 2).map((regra, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {regra.length > 20 ? `${regra.slice(0, 20)}...` : regra}
                    </span>
                  ))}
                  {agente.regras.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{agente.regras.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onView(agente)}
                className="flex-1 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleStatus(agente.id)}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  agente.status === 'ativado'
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {agente.status === 'ativado' ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(agente)}
                className="bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Atualizado {new Date(agente.updated_at).toLocaleDateString('pt-BR')}
              </div>
              
              <div className={`w-2 h-2 rounded-full ${
                agente.status === 'ativado' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
