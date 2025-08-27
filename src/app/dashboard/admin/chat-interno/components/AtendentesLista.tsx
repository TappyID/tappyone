'use client'

import { motion } from 'framer-motion'
import { 
  Circle, 
  Clock, 
  Badge,
  MoreVertical,
  Phone,
  Video,
  Mail
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTheme } from '@/contexts/ThemeContext'

interface Atendente {
  id: string
  nome: string
  email: string
  avatar: string
  status: 'online' | 'ocupado' | 'ausente' | 'offline'
  cargo: string
  ultimaMsg: string
  ultimaAtividade: Date
  naoLidas: number
}

interface AtendentesListaProps {
  atendentes: Atendente[]
  selectedAtendente: string | null
  onSelectAtendente: (id: string) => void
}

const statusConfig = {
  online: { color: 'bg-green-500', label: 'Online' },
  ocupado: { color: 'bg-yellow-500', label: 'Ocupado' },
  ausente: { color: 'bg-orange-500', label: 'Ausente' },
  offline: { color: 'bg-gray-400', label: 'Offline' }
}

export default function AtendentesLista({
  atendentes,
  selectedAtendente,
  onSelectAtendente
}: AtendentesListaProps) {
  const { theme } = useTheme()
  const actualTheme = theme === 'system' ? 'light' : theme

  return (
    <div className="h-full flex flex-col">
      {/* Header com Glass Effect */}
      <div className={`p-6 border-b backdrop-blur-xl ${
        actualTheme === 'dark' 
          ? 'border-gray-700/50 bg-gray-900/80' 
          : 'border-gray-200/50 bg-white/80'
      }`}>
        <motion.h2 
          className={`text-lg font-bold ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Atendentes ({atendentes.length})
        </motion.h2>
        <motion.p 
          className={`text-sm mt-1 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Clique para iniciar conversa
        </motion.p>
      </div>

      {/* Lista com Glass Effect */}
      <div className="flex-1 overflow-y-auto">
        {atendentes.length === 0 ? (
          <div className="p-8 text-center">
            <motion.div 
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-xl ${
                actualTheme === 'dark' 
                  ? 'bg-gray-800/50 border border-gray-700/50' 
                  : 'bg-gray-100/50 border border-gray-200/50'
              }`}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Circle className={`w-8 h-8 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            </motion.div>
            <p className={`${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Nenhum atendente encontrado
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {atendentes.map((atendente, index) => (
              <motion.div
                key={atendente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectAtendente(atendente.id)}
                className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 group backdrop-blur-xl border ${
                  selectedAtendente === atendente.id
                    ? actualTheme === 'dark'
                      ? 'bg-blue-600/20 border-blue-500/50 shadow-2xl shadow-blue-500/20'
                      : 'bg-blue-50/80 border-blue-200/80 shadow-2xl shadow-blue-500/10'
                    : actualTheme === 'dark'
                    ? 'hover:bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50 hover:shadow-xl hover:shadow-gray-900/20'
                    : 'hover:bg-white/60 border-gray-200/30 hover:border-gray-300/50 hover:shadow-xl hover:shadow-gray-500/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar com Status Glass Effect */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <img
                        src={atendente.avatar}
                        alt={atendente.nome}
                        className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                      />
                      <motion.div 
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 ${
                          actualTheme === 'dark' ? 'border-gray-800' : 'border-white'
                        } ${statusConfig[atendente.status].color} shadow-lg`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>

                  {/* Info com Glass Effect */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <motion.h3 
                        className={`font-bold text-base truncate ${
                          selectedAtendente === atendente.id 
                            ? actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-900'
                            : actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                        whileHover={{ x: 2 }}
                      >
                        {atendente.nome}
                      </motion.h3>
                      
                      {atendente.naoLidas > 0 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
                        >
                          {atendente.naoLidas > 9 ? '9+' : atendente.naoLidas}
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <motion.span 
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm border ${
                          selectedAtendente === atendente.id 
                            ? actualTheme === 'dark'
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                              : 'bg-blue-100/80 text-blue-700 border-blue-200/80'
                            : actualTheme === 'dark'
                            ? 'bg-gray-700/50 text-gray-300 border-gray-600/50'
                            : 'bg-gray-100/80 text-gray-600 border-gray-200/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {atendente.cargo}
                      </motion.span>
                      
                      <div className="flex items-center gap-1.5">
                        <motion.div
                          className={`w-2.5 h-2.5 rounded-full ${statusConfig[atendente.status].color} shadow-lg`}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className={`text-xs font-medium ${
                          actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {statusConfig[atendente.status].label}
                        </span>
                      </div>
                    </div>

                    <motion.p 
                      className={`text-sm truncate mb-3 ${
                        selectedAtendente === atendente.id 
                          ? actualTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                          : actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      {atendente.ultimaMsg}
                    </motion.p>

                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-xs ${
                        actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </motion.div>
                        <span className="font-medium">
                          {formatDistanceToNow(atendente.ultimaAtividade, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>

                      {/* Quick Actions Glass Effect */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.button
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Ação de email
                          }}
                          className={`p-2 rounded-xl backdrop-blur-sm border transition-all duration-200 ${
                            actualTheme === 'dark'
                              ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 border-gray-600/50 hover:border-blue-500/50'
                              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50/80 border-gray-200/50 hover:border-blue-200/80'
                          } shadow-lg`}
                          title="Enviar email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Ação de chamada
                          }}
                          className={`p-2 rounded-xl backdrop-blur-sm border transition-all duration-200 ${
                            actualTheme === 'dark'
                              ? 'text-gray-400 hover:text-green-400 hover:bg-green-600/20 border-gray-600/50 hover:border-green-500/50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50/80 border-gray-200/50 hover:border-green-200/80'
                          } shadow-lg`}
                          title="Ligar"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Ação de vídeo
                          }}
                          className={`p-2 rounded-xl backdrop-blur-sm border transition-all duration-200 ${
                            actualTheme === 'dark'
                              ? 'text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 border-gray-600/50 hover:border-purple-500/50'
                              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50/80 border-gray-200/50 hover:border-purple-200/80'
                          } shadow-lg`}
                          title="Videochamada"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicador de seleção */}
                {selectedAtendente === atendente.id && (
                  <motion.div
                    layoutId="selectedIndicator"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Glass Effect */}
      <motion.div 
        className={`p-5 border-t backdrop-blur-xl ${
          actualTheme === 'dark' 
            ? 'border-gray-700/50 bg-gray-900/80' 
            : 'border-gray-200/50 bg-white/80'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className={`flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-sm border ${
              actualTheme === 'dark'
                ? 'bg-green-600/20 border-green-500/30 text-green-400'
                : 'bg-green-50/80 border-green-200/50 text-green-700'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-semibold">
              {atendentes.filter(a => a.status === 'online').length} online
            </span>
          </motion.div>
          
          <motion.div 
            className={`flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-sm border ${
              actualTheme === 'dark'
                ? 'bg-red-600/20 border-red-500/30 text-red-400'
                : 'bg-red-50/80 border-red-200/50 text-red-700'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <span className="text-xs font-semibold">
              {atendentes.reduce((acc, a) => acc + a.naoLidas, 0)} não lidas
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
