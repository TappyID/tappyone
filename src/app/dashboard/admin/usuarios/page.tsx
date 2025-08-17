'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import UsuariosStats from './components/UsuariosStats'
import UsuariosList from './components/UsuariosList'
import CriarUsuarioModal from './components/CriarUsuarioModal'
import EditarUsuarioModal from './components/EditarUsuarioModal'
import PermissoesModal from './components/PermissoesModal'
import ImportarUsuariosModal from './components/ImportarUsuariosModal'
import { 
  Plus,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  Users,
  X,
  Trash2,
  Shield,
  UserCheck,
  Crown
} from 'lucide-react'

// Interface para Usuario
interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  avatar?: string
  tipo: 'admin' | 'atendente' | 'assinante'
  status: 'ativo' | 'inativo' | 'suspenso'
  ultimo_acesso: string
  criado_em: string
  permissoes: string[]
  departamento?: string
  cargo?: string
}

// Mock data para usuários
const initialMockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@tappyone.com',
    telefone: '(11) 99999-1111',
    tipo: 'admin',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T14:30:00Z',
    criado_em: '2023-12-01T10:00:00Z',
    permissoes: ['usuarios.criar', 'usuarios.editar', 'usuarios.excluir', 'configuracoes.sistema'],
    departamento: 'TI',
    cargo: 'Administrador do Sistema'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@tappyone.com',
    telefone: '(11) 99999-2222',
    tipo: 'atendente',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T13:45:00Z',
    criado_em: '2024-01-05T09:30:00Z',
    permissoes: ['atendimentos.visualizar', 'atendimentos.responder', 'kanban.criar'],
    departamento: 'Atendimento',
    cargo: 'Atendente Senior'
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    email: 'pedro.costa@tappyone.com',
    telefone: '(11) 99999-3333',
    tipo: 'atendente',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T12:20:00Z',
    criado_em: '2024-01-10T14:15:00Z',
    permissoes: ['atendimentos.visualizar', 'atendimentos.responder'],
    departamento: 'Atendimento',
    cargo: 'Atendente'
  },
  {
    id: '4',
    nome: 'Ana Oliveira',
    email: 'ana.oliveira@cliente.com',
    tipo: 'assinante',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T11:10:00Z',
    criado_em: '2024-01-12T16:45:00Z',
    permissoes: ['atendimentos.visualizar'],
    departamento: 'Vendas',
    cargo: 'Gerente Comercial'
  },
  {
    id: '5',
    nome: 'Carlos Mendes',
    email: 'carlos.mendes@tappyone.com',
    telefone: '(11) 99999-4444',
    tipo: 'admin',
    status: 'ativo',
    ultimo_acesso: '2024-01-14T18:30:00Z',
    criado_em: '2023-11-15T08:00:00Z',
    permissoes: ['usuarios.criar', 'usuarios.editar', 'relatorios.visualizar', 'relatorios.exportar'],
    departamento: 'Gestão',
    cargo: 'Diretor'
  },
  {
    id: '6',
    nome: 'Lucia Ferreira',
    email: 'lucia.ferreira@tappyone.com',
    tipo: 'atendente',
    status: 'inativo',
    ultimo_acesso: '2024-01-10T15:20:00Z',
    criado_em: '2023-12-20T11:30:00Z',
    permissoes: ['atendimentos.visualizar'],
    departamento: 'Atendimento',
    cargo: 'Atendente'
  },
  {
    id: '7',
    nome: 'Roberto Lima',
    email: 'roberto.lima@cliente.com',
    tipo: 'assinante',
    status: 'suspenso',
    ultimo_acesso: '2024-01-08T09:15:00Z',
    criado_em: '2024-01-08T09:00:00Z',
    permissoes: [],
    departamento: 'Financeiro'
  },
  {
    id: '8',
    nome: 'Fernanda Rocha',
    email: 'fernanda.rocha@tappyone.com',
    telefone: '(11) 99999-5555',
    tipo: 'atendente',
    status: 'ativo',
    ultimo_acesso: '2024-01-15T10:45:00Z',
    criado_em: '2024-01-03T13:20:00Z',
    permissoes: ['atendimentos.visualizar', 'atendimentos.responder', 'tags.gerenciar'],
    departamento: 'Suporte',
    cargo: 'Especialista em Suporte'
  }
]

export default function UsuariosPage() {
  const { user, loading } = useAuth()
  
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialMockUsuarios)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedUsuarios, setSelectedUsuarios] = useState<string[]>([])
  const [showCriarModal, setShowCriarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showPermissoesModal, setShowPermissoesModal] = useState(false)
  const [showImportarModal, setShowImportarModal] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)

  // Filtros ativos
  const filtrosAtivos = useMemo(() => {
    const filtros = []
    if (filtroTipo !== 'todos') filtros.push({ tipo: 'tipo', valor: filtroTipo })
    if (filtroStatus !== 'todos') filtros.push({ tipo: 'status', valor: filtroStatus })
    if (filtroDepartamento !== 'todos') filtros.push({ tipo: 'departamento', valor: filtroDepartamento })
    return filtros
  }, [filtroTipo, filtroStatus, filtroDepartamento])

  // Usuários filtrados
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchSearch = usuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         usuario.departamento?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         usuario.cargo?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchTipo = filtroTipo === 'todos' || usuario.tipo === filtroTipo
      
      const matchStatus = filtroStatus === 'todos' || usuario.status === filtroStatus
      
      const matchDepartamento = filtroDepartamento === 'todos' || usuario.departamento === filtroDepartamento
      
      return matchSearch && matchTipo && matchStatus && matchDepartamento
    })
  }, [searchQuery, filtroTipo, filtroStatus, filtroDepartamento, usuarios])

  // Departamentos únicos
  const departamentos = useMemo(() => {
    return Array.from(new Set(usuarios.map(usuario => usuario.departamento).filter(Boolean)))
  }, [usuarios])

  const removerFiltro = (tipo: string) => {
    if (tipo === 'tipo') setFiltroTipo('todos')
    if (tipo === 'status') setFiltroStatus('todos')
    if (tipo === 'departamento') setFiltroDepartamento('todos')
  }

  const limparFiltros = () => {
    setFiltroTipo('todos')
    setFiltroStatus('todos')
    setFiltroDepartamento('todos')
    setSearchQuery('')
  }

  const deletarSelecionados = () => {
    if (selectedUsuarios.length > 0) {
      setUsuarios(prev => prev.filter(usuario => !selectedUsuarios.includes(usuario.id)))
      setSelectedUsuarios([])
    }
  }

  const exportarUsuarios = () => {
    const dataStr = JSON.stringify(usuarios, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'usuarios-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handlers para modais
  const handleCriarUsuario = (novoUsuario: Omit<Usuario, 'id' | 'ultimo_acesso' | 'criado_em'>) => {
    const usuario: Usuario = {
      ...novoUsuario,
      id: Date.now().toString(),
      ultimo_acesso: new Date().toISOString(),
      criado_em: new Date().toISOString()
    }
    setUsuarios(prev => [...prev, usuario])
  }

  const handleImportarUsuarios = (usuariosImportados: Omit<Usuario, 'id' | 'ultimo_acesso' | 'criado_em'>[]) => {
    const novosUsuarios: Usuario[] = usuariosImportados.map(usuario => ({
      ...usuario,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ultimo_acesso: new Date().toISOString(),
      criado_em: new Date().toISOString()
    }))
    setUsuarios(prev => [...prev, ...novosUsuarios])
  }

  const handleEditUsuario = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario)
    setShowEditarModal(true)
  }

  const handleSaveEditUsuario = (usuarioAtualizado: Usuario) => {
    setUsuarios(prev => prev.map(usuario => 
      usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario
    ))
    setUsuarioSelecionado(null)
  }

  const handleDeleteUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(usuario => usuario.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setUsuarios(prev => prev.map(usuario => {
      if (usuario.id === id) {
        const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo'
        return { ...usuario, status: novoStatus }
      }
      return usuario
    }))
  }

  const handleManagePermissions = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario)
    setShowPermissoesModal(true)
  }

  const handleSavePermissions = (permissoes: string[]) => {
    if (usuarioSelecionado) {
      setUsuarios(prev => prev.map(usuario => 
        usuario.id === usuarioSelecionado.id 
          ? { ...usuario, permissoes }
          : usuario
      ))
    }
    setUsuarioSelecionado(null)
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'admin': return Crown
      case 'atendente': return UserCheck
      case 'assinante': return Shield
      default: return Users
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
              <p className="text-gray-600 mt-2">
                Administre usuários, permissões e acessos do sistema
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowImportarModal(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={exportarUsuarios}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowCriarModal(true)}
                className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl hover:shadow-lg font-semibold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Novo Usuário
              </motion.button>
            </div>
          </div>

          {/* Filtros e Controles */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Tipo */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                  >
                    <option value="todos">Todos os tipos</option>
                    <option value="admin">Administradores</option>
                    <option value="atendente">Atendentes</option>
                    <option value="assinante">Assinantes</option>
                  </select>
                </div>

                {/* Status */}
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                >
                  <option value="todos">Todos os status</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                  <option value="suspenso">Suspensos</option>
                </select>

                {/* Departamento */}
                <select
                  value={filtroDepartamento}
                  onChange={(e) => setFiltroDepartamento(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                >
                  <option value="todos">Todos os departamentos</option>
                  {departamentos.map(departamento => (
                    <option key={departamento} value={departamento}>{departamento}</option>
                  ))}
                </select>

                {/* Filtros Ativos */}
                <AnimatePresence>
                  {filtrosAtivos.map((filtro) => (
                    <motion.div
                      key={filtro.tipo}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-[#305e73] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{filtro.valor}</span>
                      <button
                        onClick={() => removerFiltro(filtro.tipo)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filtrosAtivos.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={limparFiltros}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Limpar filtros
                  </motion.button>
                )}
              </div>

              {/* Controles */}
              <div className="flex items-center gap-4">
                {/* Seleção múltipla */}
                {selectedUsuarios.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-red-700">
                      {selectedUsuarios.length} selecionado{selectedUsuarios.length > 1 ? 's' : ''}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={deletarSelecionados}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}

                {/* View Mode */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#305e73] shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-[#305e73] shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <UsuariosStats usuarios={usuarios} />

        {/* Users List */}
        <div className="mt-8">
          <UsuariosList
            usuarios={usuariosFiltrados}
            viewMode={viewMode}
            selectedUsuarios={selectedUsuarios}
            onSelectedUsuariosChange={setSelectedUsuarios}
            onEditUsuario={handleEditUsuario}
            onDeleteUsuario={handleDeleteUsuario}
            onToggleStatus={handleToggleStatus}
            onManagePermissions={handleManagePermissions}
          />
        </div>
      </div>

      {/* Modals */}
      <CriarUsuarioModal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        onSave={handleCriarUsuario}
      />

      <EditarUsuarioModal
        isOpen={showEditarModal}
        onClose={() => {
          setShowEditarModal(false)
          setUsuarioSelecionado(null)
        }}
        onSave={handleSaveEditUsuario}
        onDelete={handleDeleteUsuario}
        usuario={usuarioSelecionado}
      />

      <PermissoesModal
        isOpen={showPermissoesModal}
        onClose={() => {
          setShowPermissoesModal(false)
          setUsuarioSelecionado(null)
        }}
        onSave={handleSavePermissions}
        usuario={usuarioSelecionado}
      />

      <ImportarUsuariosModal
        isOpen={showImportarModal}
        onClose={() => setShowImportarModal(false)}
        onImport={handleImportarUsuarios}
      />
    </div>
  )
}
