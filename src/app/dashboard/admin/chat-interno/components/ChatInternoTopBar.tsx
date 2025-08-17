'use client'

import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Users, 
  Circle,
  MessageCircle,
  Settings,
  Bell,
  RefreshCw
} from 'lucide-react'

interface ChatInternoTopBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: 'todos' | 'online' | 'ocupado' | 'ausente' | 'offline'
  setStatusFilter: (status: 'todos' | 'online' | 'ocupado' | 'ausente' | 'offline') => void
  totalAtendentes: number
  onlineCount: number
}

const statusOptions = [
  { value: 'todos', label: 'Todos', color: 'text-gray-600' },
  { value: 'online', label: 'Online', color: 'text-green-600' },
  { value: 'ocupado', label: 'Ocupado', color: 'text-yellow-600' },
  { value: 'ausente', label: 'Ausente', color: 'text-orange-600' },
  { value: 'offline', label: 'Offline', color: 'text-gray-400' }
]

export default function ChatInternoTopBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalAtendentes,
  onlineCount
}: ChatInternoTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Interno</h1>
              <p className="text-sm text-gray-600">
                Comunicação com a equipe
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200"
            >
              <Circle className="w-3 h-3 text-green-500 fill-current" />
              <span className="text-sm font-medium text-green-700">
                {onlineCount} Online
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {totalAtendentes} Total
              </span>
            </motion.div>
          </div>
        </div>

        {/* Right Section - Search and Filters */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar atendentes..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Atualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 flex items-center gap-2"
      >
        <span className="text-xs text-gray-500">Status rápido:</span>
        {statusOptions.slice(1).map(status => (
          <motion.button
            key={status.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStatusFilter(status.value as any)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === status.value
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Circle className={`w-2 h-2 fill-current ${status.color}`} />
            {status.label}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
