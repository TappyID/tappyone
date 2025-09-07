'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
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
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
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
    if (isDark) {
      switch (tipo) {
        case 'admin': return 'text-red-300 bg-red-900/30'
        case 'atendente': return 'text-orange-300 bg-orange-900/30'
        case 'assinante': return 'text-indigo-300 bg-indigo-900/30'
        default: return 'text-slate-300 bg-slate-700/30'
      }
    } else {
      switch (tipo) {
        case 'admin': return 'text-red-600 bg-red-100'
        case 'atendente': return 'text-orange-600 bg-orange-100'
        case 'assinante': return 'text-indigo-600 bg-indigo-100'
        default: return 'text-gray-600 bg-gray-100'
      }
    }
  }

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'ativo': return 'text-green-300 bg-green-900/30'
        case 'inativo': return 'text-slate-300 bg-slate-700/30'
        case 'suspenso': return 'text-red-300 bg-red-900/30'
        default: return 'text-slate-300 bg-slate-700/30'
      }
    } else {
      switch (status) {
        case 'ativo': return 'text-green-600 bg-green-100'
        case 'inativo': return 'text-gray-600 bg-gray-100'
        case 'suspenso': return 'text-red-600 bg-red-100'
        default: return 'text-gray-600 bg-gray-100'
      }
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
        className={`rounded-2xl p-12 text-center shadow-sm border ${
          isDark 
            ? 'bg-slate-800/50 border-slate-600' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          isDark ? 'bg-slate-700/50' : 'bg-gray-100'
        }`}>
          <Users className={`w-10 h-10 ${
            isDark ? 'text-slate-400' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${
          isDark ? 'text-slate-200' : 'text-gray-900'
        }`}>Nenhum usuário encontrado</h3>
        <p className={`mb-6 ${
          isDark ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Não há usuários que correspondam aos filtros selecionados.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`text-white px-6 py-3 rounded-xl font-semibold ${
            isDark 
              ? 'bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400' 
              : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
          }`}
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
              className={`rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 cursor-pointer ${
                selectedUsuarios.includes(usuario.id)
                  ? isDark
                    ? 'border-blue-400/50 bg-blue-900/20'
                    : 'border-[#305e73] bg-[#305e73]/5'
                  : isDark
                    ? 'border-slate-600 hover:border-slate-500 hover:shadow-lg bg-slate-800/50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
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
                    <h3 className={`font-bold truncate ${
                      isDark ? 'text-slate-200' : 'text-gray-900'
                    }`}>{usuario.nome}</h3>
                    <p className={`text-sm truncate ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>{usuario.email}</p>
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
                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    <MapPin className="w-4 h-4" />
                    <span>{usuario.departamento}</span>
                  </div>
                )}
                
                {usuario.cargo && (
                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    <Settings className="w-4 h-4" />
                    <span>{usuario.cargo}</span>
                  </div>
                )}
                
                <div className={`flex items-center gap-2 text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  <Calendar className="w-4 h-4" />
                  <span>Criado {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Footer */}
              <div className={`border-t pt-4 flex items-center justify-between ${
                isDark ? 'border-slate-600' : 'border-gray-200'
              }`}>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(usuario.status)}`}>
                  {usuario.status}
                </div>

                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onManagePermissions(usuario)
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDark 
                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    } ${
                      hoveredUsuario === usuario.id ? 'opacity-100' : 'opacity-0'
                    }`}
                    title="Gerenciar Permissões"
                  >
                    <Shield className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditUsuario(usuario)
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDark 
                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    } ${
                      hoveredUsuario === usuario.id ? 'opacity-100' : 'opacity-0'
                    }`}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteUsuario(usuario.id)
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDark 
                        ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                        : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                    } ${
                      hoveredUsuario === usuario.id ? 'opacity-100' : 'opacity-0'
                    }`}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // List View
  return (
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${
      isDark 
        ? 'bg-slate-800/50 border-slate-600' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium border-b ${
        isDark 
          ? 'bg-slate-700/50 border-slate-600 text-slate-300' 
          : 'bg-gray-50 border-gray-200 text-gray-700'
      }`}>
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={selectedUsuarios.length === usuarios.length && usuarios.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectedUsuariosChange(usuarios.map(u => u.id))
              } else {
                onSelectedUsuariosChange([])
              }
            }}
            className={`rounded border-gray-300 focus:ring-2 ${
              isDark 
                ? 'text-blue-400 focus:ring-blue-400/50' 
                : 'text-[#305e73] focus:ring-[#305e73]'
            }`}
          />
        </div>
        <div className="col-span-3">Usuário</div>
        <div className="col-span-2">Tipo</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Último Acesso</div>
        <div className="col-span-1">Permissões</div>
        <div className="col-span-1">Ações</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {usuarios.map((usuario, index) => {
            const TipoIcon = getTipoIcon(usuario.tipo)
            
            return (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
                className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedUsuarios.includes(usuario.id)
                    ? isDark
                      ? 'bg-blue-900/20 hover:bg-blue-900/30'
                      : 'bg-[#305e73]/5 hover:bg-[#305e73]/10'
                    : isDark
                      ? 'hover:bg-slate-700/30'
                      : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectUsuario(usuario.id)}
                onMouseEnter={() => setHoveredUsuario(usuario.id)}
                onMouseLeave={() => setHoveredUsuario(null)}
              >
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedUsuarios.includes(usuario.id)}
                    onChange={() => handleSelectUsuario(usuario.id)}
                    className={`rounded border-gray-300 focus:ring-2 ${
                      isDark 
                        ? 'text-blue-400 focus:ring-blue-400/50' 
                        : 'text-[#305e73] focus:ring-[#305e73]'
                    }`}
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
                      
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${
                        isDark ? 'border-slate-700' : 'border-white'
                      } ${
                        usuario.status === 'ativo' ? 'bg-green-500' : 
                        usuario.status === 'suspenso' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <div className={`font-medium ${
                        isDark ? 'text-slate-200' : 'text-gray-900'
                      }`}>{usuario.nome}</div>
                      <div className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>{usuario.email}</div>
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
                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    <Activity className="w-4 h-4" />
                    {formatLastAccess(usuario.ultimo_acesso)}
                  </div>
                </div>

                {/* Permissões */}
                <div className="col-span-1">
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-slate-300' : 'text-gray-900'
                  }`}>{usuario.permissoes.length}</span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onManagePermissions(usuario)
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-slate-400 hover:text-blue-300 hover:bg-blue-900/30' 
                          : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                      }`}
                      title="Gerenciar Permissões"
                    >
                      <Key className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditUsuario(usuario)
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-slate-400 hover:text-green-300 hover:bg-green-900/30' 
                          : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                      }`}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteUsuario(usuario.id)
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-slate-400 hover:text-red-300 hover:bg-red-900/30' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
