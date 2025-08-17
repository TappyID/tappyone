'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Shield,
  Key,
  Save,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  User,
  Crown,
  UserCheck,
  FileText,
  Users,
  MessageSquare,
  Trello,
  Tag,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: 'admin' | 'atendente' | 'assinante'
  permissoes: string[]
}

interface PermissoesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (permissoes: string[]) => void
  usuario: Usuario | null
}

const permissoesDisponiveis = [
  // Usuários
  { 
    id: 'usuarios.criar', 
    nome: 'Criar Usuários', 
    categoria: 'Usuários',
    descricao: 'Permite criar novos usuários no sistema',
    icone: Users,
    nivel: 'admin'
  },
  { 
    id: 'usuarios.editar', 
    nome: 'Editar Usuários', 
    categoria: 'Usuários',
    descricao: 'Permite editar informações de usuários existentes',
    icone: Users,
    nivel: 'admin'
  },
  { 
    id: 'usuarios.excluir', 
    nome: 'Excluir Usuários', 
    categoria: 'Usuários',
    descricao: 'Permite excluir usuários do sistema',
    icone: Users,
    nivel: 'admin'
  },
  { 
    id: 'usuarios.visualizar', 
    nome: 'Visualizar Usuários', 
    categoria: 'Usuários',
    descricao: 'Permite visualizar lista de usuários',
    icone: Users,
    nivel: 'atendente'
  },
  
  // Atendimentos
  { 
    id: 'atendimentos.visualizar', 
    nome: 'Visualizar Atendimentos', 
    categoria: 'Atendimentos',
    descricao: 'Permite visualizar conversas e atendimentos',
    icone: MessageSquare,
    nivel: 'assinante'
  },
  { 
    id: 'atendimentos.responder', 
    nome: 'Responder Atendimentos', 
    categoria: 'Atendimentos',
    descricao: 'Permite responder mensagens nos atendimentos',
    icone: MessageSquare,
    nivel: 'atendente'
  },
  { 
    id: 'atendimentos.transferir', 
    nome: 'Transferir Atendimentos', 
    categoria: 'Atendimentos',
    descricao: 'Permite transferir atendimentos entre usuários',
    icone: MessageSquare,
    nivel: 'atendente'
  },
  { 
    id: 'atendimentos.encerrar', 
    nome: 'Encerrar Atendimentos', 
    categoria: 'Atendimentos',
    descricao: 'Permite finalizar atendimentos',
    icone: MessageSquare,
    nivel: 'atendente'
  },
  
  // Kanban
  { 
    id: 'kanban.criar', 
    nome: 'Criar Quadros Kanban', 
    categoria: 'Kanban',
    descricao: 'Permite criar novos quadros kanban',
    icone: Trello,
    nivel: 'atendente'
  },
  { 
    id: 'kanban.editar', 
    nome: 'Editar Quadros Kanban', 
    categoria: 'Kanban',
    descricao: 'Permite editar quadros kanban existentes',
    icone: Trello,
    nivel: 'atendente'
  },
  { 
    id: 'kanban.excluir', 
    nome: 'Excluir Quadros Kanban', 
    categoria: 'Kanban',
    descricao: 'Permite excluir quadros kanban',
    icone: Trello,
    nivel: 'admin'
  },
  
  // Tags
  { 
    id: 'tags.gerenciar', 
    nome: 'Gerenciar Tags', 
    categoria: 'Tags',
    descricao: 'Permite criar, editar e excluir tags',
    icone: Tag,
    nivel: 'atendente'
  },
  { 
    id: 'tags.usar', 
    nome: 'Usar Tags', 
    categoria: 'Tags',
    descricao: 'Permite aplicar tags existentes',
    icone: Tag,
    nivel: 'assinante'
  },
  
  // Relatórios
  { 
    id: 'relatorios.visualizar', 
    nome: 'Visualizar Relatórios', 
    categoria: 'Relatórios',
    descricao: 'Permite visualizar relatórios e estatísticas',
    icone: BarChart3,
    nivel: 'atendente'
  },
  { 
    id: 'relatorios.exportar', 
    nome: 'Exportar Relatórios', 
    categoria: 'Relatórios',
    descricao: 'Permite exportar relatórios em diferentes formatos',
    icone: BarChart3,
    nivel: 'admin'
  },
  
  // Sistema
  { 
    id: 'configuracoes.sistema', 
    nome: 'Configurações do Sistema', 
    categoria: 'Sistema',
    descricao: 'Permite alterar configurações gerais do sistema',
    icone: Settings,
    nivel: 'admin'
  },
  { 
    id: 'configuracoes.integracao', 
    nome: 'Configurações de Integração', 
    categoria: 'Sistema',
    descricao: 'Permite configurar integrações com APIs externas',
    icone: Settings,
    nivel: 'admin'
  }
]

const permissoesPorTipo = {
  admin: permissoesDisponiveis.map(p => p.id),
  atendente: permissoesDisponiveis.filter(p => ['assinante', 'atendente'].includes(p.nivel)).map(p => p.id),
  assinante: permissoesDisponiveis.filter(p => p.nivel === 'assinante').map(p => p.id)
}

export default function PermissoesModal({ 
  isOpen, 
  onClose, 
  onSave,
  usuario 
}: PermissoesModalProps) {
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroNivel, setFiltroNivel] = useState('todos')
  const [showOnlyChanged, setShowOnlyChanged] = useState(false)

  useEffect(() => {
    if (usuario) {
      setPermissoesSelecionadas([...usuario.permissoes])
    }
  }, [usuario])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(permissoesSelecionadas)
    onClose()
  }

  const handlePermissaoToggle = (permissaoId: string) => {
    setPermissoesSelecionadas(prev => 
      prev.includes(permissaoId)
        ? prev.filter(p => p !== permissaoId)
        : [...prev, permissaoId]
    )
  }

  const aplicarPermissoesPadrao = () => {
    if (usuario) {
      const permissoesPadrao = permissoesPorTipo[usuario.tipo] || []
      setPermissoesSelecionadas(permissoesPadrao)
    }
  }

  const limparTodasPermissoes = () => {
    setPermissoesSelecionadas([])
  }

  const selecionarTodasPermissoes = () => {
    setPermissoesSelecionadas(permissoesDisponiveis.map(p => p.id))
  }

  // Filtrar permissões
  const permissoesFiltradas = permissoesDisponiveis.filter(permissao => {
    const matchSearch = permissao.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       permissao.descricao.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchCategoria = filtroCategoria === 'todas' || permissao.categoria === filtroCategoria
    
    const matchNivel = filtroNivel === 'todos' || permissao.nivel === filtroNivel
    
    const matchChanged = !showOnlyChanged || 
                        (usuario && permissoesSelecionadas.includes(permissao.id) !== usuario.permissoes.includes(permissao.id))
    
    return matchSearch && matchCategoria && matchNivel && matchChanged
  })

  const categorias = Array.from(new Set(permissoesDisponiveis.map(p => p.categoria)))
  const niveis = Array.from(new Set(permissoesDisponiveis.map(p => p.nivel)))

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'admin': return Crown
      case 'atendente': return UserCheck
      case 'assinante': return Shield
      default: return User
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'text-red-600 bg-red-100'
      case 'atendente': return 'text-orange-600 bg-orange-100'
      case 'assinante': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'admin': return 'text-red-600'
      case 'atendente': return 'text-orange-600'
      case 'assinante': return 'text-indigo-600'
      default: return 'text-gray-600'
    }
  }

  if (!usuario) return null

  const TipoIcon = getTipoIcon(usuario.tipo)
  const permissoesOriginais = usuario.permissoes
  const permissoesAlteradas = permissoesSelecionadas.filter(p => !permissoesOriginais.includes(p))
  const permissoesRemovidas = permissoesOriginais.filter(p => !permissoesSelecionadas.includes(p))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Gerenciar Permissões</h2>
                      <div className="flex items-center gap-2 text-white/80">
                        <span>{usuario.nome}</span>
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getTipoColor(usuario.tipo)} bg-white/20`}>
                          <TipoIcon className="w-3 h-3" />
                          {usuario.tipo}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex h-[calc(90vh-200px)]">
                {/* Sidebar com Filtros */}
                <div className="w-80 border-r border-gray-200 p-6 bg-gray-50">
                  {/* Busca */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-2" />
                      Buscar Permissões
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                      placeholder="Digite para buscar..."
                    />
                  </div>

                  {/* Filtros */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Filter className="w-4 h-4 inline mr-2" />
                        Categoria
                      </label>
                      <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent text-sm"
                      >
                        <option value="todas">Todas as categorias</option>
                        {categorias.map(categoria => (
                          <option key={categoria} value={categoria}>{categoria}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nível Mínimo
                      </label>
                      <select
                        value={filtroNivel}
                        onChange={(e) => setFiltroNivel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent text-sm"
                      >
                        <option value="todos">Todos os níveis</option>
                        <option value="assinante">Assinante+</option>
                        <option value="atendente">Atendente+</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showOnlyChanged}
                          onChange={(e) => setShowOnlyChanged(e.target.checked)}
                          className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
                        />
                        <span className="text-sm font-medium text-gray-700">Apenas alteradas</span>
                      </label>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Ações Rápidas</h4>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={aplicarPermissoesPadrao}
                      className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Aplicar Padrão do Tipo
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={selecionarTodasPermissoes}
                      className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Selecionar Todas
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={limparTodasPermissoes}
                      className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Remover Todas
                    </motion.button>
                  </div>

                  {/* Resumo */}
                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumo</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{permissoesSelecionadas.length}</span>
                      </div>
                      {permissoesAlteradas.length > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Adicionadas:</span>
                          <span className="font-medium">{permissoesAlteradas.length}</span>
                        </div>
                      )}
                      {permissoesRemovidas.length > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Removidas:</span>
                          <span className="font-medium">{permissoesRemovidas.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista de Permissões */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {categorias.map(categoria => {
                        const permissoesDaCategoria = permissoesFiltradas.filter(p => p.categoria === categoria)
                        if (permissoesDaCategoria.length === 0) return null

                        return (
                          <div key={categoria} className="bg-white rounded-xl border border-gray-200 p-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              {categoria}
                              <span className="text-sm font-normal text-gray-500">
                                ({permissoesDaCategoria.length} permissões)
                              </span>
                            </h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {permissoesDaCategoria.map(permissao => {
                                const isSelected = permissoesSelecionadas.includes(permissao.id)
                                const wasOriginal = permissoesOriginais.includes(permissao.id)
                                const isChanged = isSelected !== wasOriginal
                                const IconePermissao = permissao.icone

                                return (
                                  <motion.label
                                    key={permissao.id}
                                    whileHover={{ scale: 1.02 }}
                                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-[#305e73] bg-[#305e73]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                    } ${isChanged ? 'ring-2 ring-blue-200' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handlePermissaoToggle(permissao.id)}
                                      className="mt-1 rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
                                    />
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <IconePermissao className="w-4 h-4 text-gray-600" />
                                        <span className="font-medium text-gray-900">{permissao.nome}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getNivelColor(permissao.nivel)} bg-gray-100`}>
                                          {permissao.nivel}
                                        </span>
                                        {isChanged && (
                                          <div className="flex items-center gap-1">
                                            {isSelected && !wasOriginal && (
                                              <CheckCircle className="w-4 h-4 text-green-500" />
                                            )}
                                            {!isSelected && wasOriginal && (
                                              <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600">{permissao.descricao}</p>
                                    </div>
                                  </motion.label>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}

                      {permissoesFiltradas.length === 0 && (
                        <div className="text-center py-12">
                          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma permissão encontrada</h3>
                          <p className="text-gray-600">Tente ajustar os filtros para encontrar as permissões desejadas.</p>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {permissoesSelecionadas.length} de {permissoesDisponiveis.length} permissões selecionadas
                    {(permissoesAlteradas.length > 0 || permissoesRemovidas.length > 0) && (
                      <span className="ml-2 text-blue-600">
                        • {permissoesAlteradas.length + permissoesRemovidas.length} alterações pendentes
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                    >
                      Cancelar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Permissões
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
