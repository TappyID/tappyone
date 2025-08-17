'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  Crown,
  MoreVertical,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Settings,
  Key,
  Clock,
  Activity
} from 'lucide-react'

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

interface UsuariosListProps {
  usuarios: Usuario[]
  viewMode: 'grid' | 'list'
  selectedUsuarios: string[]
  onSelectedUsuariosChange: (usuarios: string[]) => void
  onEditUsuario: (usuario: Usuario) => void
  onDeleteUsuario: (id: string) => void
  onToggleStatus: (id: string) => void
  onManagePermissions: (usuario: Usuario) => void
}

export default function UsuariosList({
  usuarios,
  viewMode,
  selectedUsuarios,
  onSelectedUsuariosChange,
  onEditUsuario,
  onDeleteUsuario,
  onToggleStatus,
  onManagePermissions
}: UsuariosListProps) {
  const [hoveredUsuario, setHoveredUsuario] = useState<string | null>(null)

  const handleSelectUsuario = (usuarioId: string) => {
    if (selectedUsuarios.includes(usuarioId)) {
      onSelectedUsuariosChange(selectedUsuarios.filter(id => id !== usuarioId))
    } else {
      onSelectedUsuariosChange([...selectedUsuarios, usuarioId])
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatLastAccess = (dateString: string) => {
    const now = new Date()
    const lastAccess = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`
    return formatDate(dateString)
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'admin': return Crown
      case 'atendente': return UserCheck
      case 'assinante': return Shield
      default: return Users
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-600 bg-green-100'
      case 'inativo': return 'text-gray-600 bg-gray-100'
      case 'suspenso': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAvatarInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (usuarios.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
        <p className="text-gray-600 mb-6">
          Não há usuários que correspondam aos filtros selecionados.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-semibold"
        >
          Criar primeiro usuário
        </motion.button>
      </motion.div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {usuarios.map((usuario, index) => {
          const TipoIcon = getTipoIcon(usuario.tipo)
          
          return (
            <motion.div
              key={usuario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onMouseEnter={() => setHoveredUsuario(usuario.id)}
              onMouseLeave={() => setHoveredUsuario(null)}
              className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 cursor-pointer ${
                selectedUsuarios.includes(usuario.id)
                  ? 'border-[#305e73] bg-[#305e73]/5'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
              onClick={() => handleSelectUsuario(usuario.id)}
            >
              {/* Header com Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {usuario.avatar ? (
                      <img
                        src={usuario.avatar}
                        alt={usuario.nome}
                        className="w-12 h-12 rounded-xl object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#305e73] to-[#3a6d84] flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-lg">
                        {getAvatarInitials(usuario.nome)}
                      </div>
                    )}
                    
                    {/* Status Indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      usuario.status === 'ativo' ? 'bg-green-500' : 
                      usuario.status === 'suspenso' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{usuario.nome}</h3>
                    <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
                  </div>
                </div>

                {/* Tipo Badge */}
                <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getTipoColor(usuario.tipo)}`}>
                  <TipoIcon className="w-3 h-3" />
                  {usuario.tipo}
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-3 mb-4">
                {usuario.departamento && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{usuario.departamento}</span>
                  </div>
                )}
                
                {usuario.cargo && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Settings className="w-4 h-4" />
                    <span>{usuario.cargo}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Key className="w-4 h-4" />
                  <span>{usuario.permissoes.length} permissões</span>
                </div>
              </div>

              {/* Status e Último Acesso */}
              <div className="space-y-2 mb-4">
                <div className={`px-2 py-1 rounded-full text-xs font-medium text-center ${getStatusColor(usuario.status)}`}>
                  {usuario.status.charAt(0).toUpperCase() + usuario.status.slice(1)}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastAccess(usuario.ultimo_acesso)}</span>
                </div>
              </div>

              {/* Footer com Ações */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Desde {formatDate(usuario.criado_em)}
                </div>

                {/* Quick Actions */}
                <AnimatePresence>
                  {hoveredUsuario === usuario.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-1"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onManagePermissions(usuario)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                        title="Gerenciar Permissões"
                      >
                        <Key className="w-3 h-3" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditUsuario(usuario)
                        }}
                        className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-3 h-3" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleStatus(usuario.id)
                        }}
                        className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded"
                        title="Alterar Status"
                      >
                        {usuario.status === 'ativo' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteUsuario(usuario.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selection Indicator */}
              {selectedUsuarios.includes(usuario.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-[#305e73] rounded-full flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    )
  }

  // List View
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedUsuarios.length === usuarios.length}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectedUsuariosChange(usuarios.map(usuario => usuario.id))
                } else {
                  onSelectedUsuariosChange([])
                }
              }}
              className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
            />
          </div>
          <div className="col-span-3">Usuário</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Último Acesso</div>
          <div className="col-span-1">Permissões</div>
          <div className="col-span-1">Ações</div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {usuarios.map((usuario, index) => {
          const TipoIcon = getTipoIcon(usuario.tipo)
          
          return (
            <motion.div
              key={usuario.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                selectedUsuarios.includes(usuario.id) ? 'bg-[#305e73]/5' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedUsuarios.includes(usuario.id)}
                    onChange={() => handleSelectUsuario(usuario.id)}
                    className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
                  />
                </div>

                {/* Usuário Info */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {usuario.avatar ? (
                        <img
                          src={usuario.avatar}
                          alt={usuario.nome}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#305e73] to-[#3a6d84] flex items-center justify-center text-white font-bold text-sm">
                          {getAvatarInitials(usuario.nome)}
                        </div>
                      )}
                      
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        usuario.status === 'ativo' ? 'bg-green-500' : 
                        usuario.status === 'suspenso' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">{usuario.nome}</div>
                      <div className="text-sm text-gray-500">{usuario.email}</div>
                    </div>
                  </div>
                </div>

                {/* Tipo */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${getTipoColor(usuario.tipo)}`}>
                    <TipoIcon className="w-4 h-4" />
                    {usuario.tipo}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(usuario.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      usuario.status === 'ativo' ? 'bg-green-500' : 
                      usuario.status === 'suspenso' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    {usuario.status}
                  </div>
                </div>

                {/* Último Acesso */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" />
                    {formatLastAccess(usuario.ultimo_acesso)}
                  </div>
                </div>

                {/* Permissões */}
                <div className="col-span-1">
                  <span className="text-sm font-medium text-gray-900">{usuario.permissoes.length}</span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onManagePermissions(usuario)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Gerenciar Permissões"
                    >
                      <Key className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEditUsuario(usuario)}
                      className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteUsuario(usuario.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
