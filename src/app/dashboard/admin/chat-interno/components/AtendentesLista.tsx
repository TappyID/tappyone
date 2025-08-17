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
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Atendentes ({atendentes.length})
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Clique para iniciar conversa
        </p>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {atendentes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Circle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Nenhum atendente encontrado</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {atendentes.map((atendente, index) => (
              <motion.div
                key={atendente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectAtendente(atendente.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                  selectedAtendente === atendente.id
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar com Status */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={atendente.avatar}
                      alt={atendente.nome}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusConfig[atendente.status].color}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold text-sm truncate ${
                        selectedAtendente === atendente.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {atendente.nome}
                      </h3>
                      
                      {atendente.naoLidas > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                        >
                          {atendente.naoLidas > 9 ? '9+' : atendente.naoLidas}
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selectedAtendente === atendente.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {atendente.cargo}
                      </span>
                      <Circle className={`w-2 h-2 fill-current ${statusConfig[atendente.status].color.replace('bg-', 'text-')}`} />
                      <span className="text-xs text-gray-500">
                        {statusConfig[atendente.status].label}
                      </span>
                    </div>

                    <p className={`text-sm truncate mb-2 ${
                      selectedAtendente === atendente.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {atendente.ultimaMsg}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(atendente.ultimaAtividade, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Ação de email
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Enviar email"
                        >
                          <Mail className="w-3 h-3" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Ação de chamada
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                          title="Ligar"
                        >
                          <Phone className="w-3 h-3" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Ação de vídeo
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 rounded"
                          title="Videochamada"
                        >
                          <Video className="w-3 h-3" />
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

      {/* Footer com resumo */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {atendentes.filter(a => a.status === 'online').length} online
          </span>
          <span>
            {atendentes.reduce((acc, a) => acc + a.naoLidas, 0)} não lidas
          </span>
        </div>
      </div>
    </div>
  )
}
