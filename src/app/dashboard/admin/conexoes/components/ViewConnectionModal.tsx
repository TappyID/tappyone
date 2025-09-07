'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  MessageCircle, 
  Users, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Server,
  Globe,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react'

interface ViewConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  connection: any
}

export function ViewConnectionModal({ isOpen, onClose, connection }: ViewConnectionModalProps) {
  const { theme } = useTheme()

  if (!connection) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Mostrar toast de copiado
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
              theme === 'dark' 
                ? 'bg-slate-800 border border-slate-700' 
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Detalhes da Conexão
                  </h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {connection.wahaSession?.me?.pushName || connection.sessionName}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className={`p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Informações Básicas
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Status:
                      </span>
                      <div className="flex items-center gap-2">
                        {connection.status === 'connected' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          connection.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {connection.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Sessão:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {connection.sessionName}
                        </span>
                        <motion.button
                          onClick={() => copyToClipboard(connection.sessionName)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-1 rounded ${
                            theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                          }`}
                        >
                          <Copy className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Criado em:
                      </span>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {formatDate(connection.createdAt)}
                      </span>
                    </div>

                    {connection.lastActivity && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Última atividade:
                        </span>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {formatDate(connection.lastActivity)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <div className={`p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Estatísticas
                  </h3>

                  {connection.stats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {connection.stats.chats}
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Chats
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {connection.stats.contacts}
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Contatos
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {connection.stats.groups}
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Grupos
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {connection.assignedQueues?.length || 0}
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Filas
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-center py-8 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Estatísticas não disponíveis
                    </p>
                  )}
                </div>

                {/* Dados da Sessão WAHA */}
                {connection.wahaSession && (
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Dados da Sessão WAHA
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Status WAHA:
                        </span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          connection.wahaSession.status === 'WORKING' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {connection.wahaSession.status}
                        </span>
                      </div>

                      {connection.wahaSession.me && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              WhatsApp ID:
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-mono ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {connection.wahaSession.me.id}
                              </span>
                              <motion.button
                                onClick={() => copyToClipboard(connection.wahaSession.me.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-1 rounded ${
                                  theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                                }`}
                              >
                                <Copy className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Nome:
                            </span>
                            <span className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {connection.wahaSession.me.pushName}
                            </span>
                          </div>

                          {connection.wahaSession.me.jid && (
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                JID:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-mono ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {connection.wahaSession.me.jid}
                                </span>
                                <motion.button
                                  onClick={() => copyToClipboard(connection.wahaSession.me.jid)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={`p-1 rounded ${
                                    theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                                  }`}
                                >
                                  <Copy className="w-3 h-3" />
                                </motion.button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {connection.wahaSession.assignedWorker && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Worker:
                          </span>
                          <span className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {connection.wahaSession.assignedWorker}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Filas Vinculadas */}
                <div className={`p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Filas Vinculadas
                  </h3>

                  {connection.assignedQueues && connection.assignedQueues.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {connection.assignedQueues.map((queue, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                        >
                          {queue}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-center py-4 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Nenhuma fila vinculada
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${
              theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Fechar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
