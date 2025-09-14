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
import { AgenteIa } from '@/hooks/useAgentes'

interface AgentesListProps {
  agentes: AgenteIa[]
  onEdit: (agente: AgenteIa) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onView: (agente: AgenteIa) => void
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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-3xl flex items-center justify-center mb-6">
          <Brain className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum agente encontrado</h3>
        <p className="text-gray-600 text-center max-w-md">
          Crie seu primeiro agente de IA para começar a automatizar seus atendimentos
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {agentes.map((agente, index) => {
        const isMenuOpen = selectedAgente === agente.id

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
              agente.ativo ? 'bg-green-500' : 'bg-red-500'
            }`}></div>

            {/* Header with badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  modeloColors[agente.modelo as keyof typeof modeloColors] || 'bg-gray-100 text-gray-700'
                }`}>
                  <span className="text-lg">
                    {modeloIcons[agente.modelo as keyof typeof modeloIcons] || '🤖'}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{agente.nome}</h3>
                  <p className="text-sm text-gray-600 capitalize">{agente.categoria || 'Geral'}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  agente.ativo 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {agente.ativo ? 'Ativo' : 'Inativo'}
                </span>
                
                <div className="relative">
                  <button
                    onClick={() => setSelectedAgente(
                      selectedAgente === agente.id ? null : agente.id
                    )}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
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
                          agente.ativo ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {agente.ativo ? (
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
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Function and Modelo */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 capitalize">
                  {agente.funcao?.replace('_', ' ') || 'Geral'}
                </span>
              </div>
              
              <div className={`px-3 py-1 rounded-lg border ${
                modeloColors[agente.modelo as keyof typeof modeloColors] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                <span className="text-xs font-medium">{agente.modelo}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {agente.descricao || agente.prompt}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600">Chats</span>
                </div>
                <p className="text-lg font-bold text-gray-900">0</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-600">Tokens</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {(agente.tokensUsados / 1000).toFixed(1)}k
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleStatus(agente.id)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  agente.ativo 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {agente.ativo ? 'Pausar' : 'Ativar'}
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
                {new Date(agente.updatedAt).toLocaleDateString('pt-BR')}
              </div>
              
              <div className={`w-2 h-2 rounded-full ${
                agente.ativo ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
