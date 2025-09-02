'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Upload, 
  SlidersHorizontal 
} from 'lucide-react'

interface ContatosTopBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExport: () => void
  onImport: () => void
}

export default function ContatosTopBar({ searchQuery, onSearchChange, onExport, onImport }: ContatosTopBarProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')
  const [selectedTag, setSelectedTag] = useState<string>('todas')
  const [showFavoritosOnly, setShowFavoritosOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Tags disponíveis (em um app real, isso viria da API)
  const availableTags = ['cliente', 'prospect', 'vip', 'lead', 'parceiro', 'fornecedor']

  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex flex-col gap-4">
        {/* Primeira linha - Busca e botões principais */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contatos por nome, email, telefone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFavoritosOnly(!showFavoritosOnly)}
              className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showFavoritosOnly
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className={`w-4 h-4 ${showFavoritosOnly ? 'fill-current' : ''}`} />
              Favoritos
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExport}
              className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onImport}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar
            </motion.button>
          </div>
        </div>

        {/* Segunda linha - Filtros expandidos */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200"
          >
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
              >
                <option value="todas">Todas as Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Origem Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origem
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#273155] focus:border-transparent outline-none">
                <option value="todas">Todas as Origens</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="site">Site</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Data Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#273155] focus:border-transparent outline-none">
                <option value="todos">Todos os Períodos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="trimestre">Este Trimestre</option>
                <option value="ano">Este Ano</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
