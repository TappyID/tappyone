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
import { useTheme } from '@/contexts/ThemeContext'

interface ContatosTopBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExport: () => void
  onImport: () => void
}

export default function ContatosTopBar({ searchQuery, onSearchChange, onExport, onImport }: ContatosTopBarProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')
  const [selectedTag, setSelectedTag] = useState<string>('todas')
  const [showFavoritosOnly, setShowFavoritosOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Tags disponíveis (em um app real, isso viria da API)
  const availableTags = ['cliente', 'prospect', 'vip', 'lead', 'parceiro', 'fornecedor']

  return (
    <motion.div
      className={`${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      } rounded-xl p-6 shadow-lg border mb-8`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex flex-col gap-4">
        {/* Primeira linha - Busca e botões principais */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Buscar contatos por nome, email, telefone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-4 py-3 font-medium transition-all duration-500 group overflow-hidden ${
                showFilters
                  ? isDark
                    ? 'text-white'
                    : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-lg shadow-lg'
                  : isDark 
                    ? 'text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg'
              }`}
              style={showFilters && isDark ? {
                background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              } : !showFilters && isDark ? {
                background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.6) 0%, rgba(107, 114, 128, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
              } : {}}
            >
              {/* Glass effect layers for active state */}
              {showFilters && isDark && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl" />
                  <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-xl" />
                </>
              )}
              <SlidersHorizontal className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{showFilters ? 'Ocultar Filtros' : 'Filtros'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFavoritosOnly(!showFavoritosOnly)}
              className={`relative flex items-center gap-2 px-4 py-3 font-medium transition-all duration-500 group overflow-hidden ${
                showFavoritosOnly
                  ? isDark
                    ? 'text-white'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg'
                  : isDark 
                    ? 'text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg'
              }`}
              style={showFavoritosOnly && isDark ? {
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px -12px rgba(251, 191, 36, 0.6), 0 0 0 1px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              } : !showFavoritosOnly && isDark ? {
                background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.6) 0%, rgba(107, 114, 128, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
              } : {}}
            >
              {showFavoritosOnly && isDark && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-amber-500/20 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl" />
                  <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-yellow-400/50 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-xl" />
                </>
              )}
              <Star className={`w-4 h-4 relative z-10 ${showFavoritosOnly ? 'fill-current' : ''}`} />
              <span className="relative z-10">Favoritos</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExport}
              className={`relative flex items-center gap-2 px-4 py-3 font-medium transition-all duration-500 group overflow-hidden ${
                isDark
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl'
              }`}
              style={isDark ? {
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              } : {}}
            >
              {isDark && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl" />
                  <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-xl" />
                </>
              )}
              <Download className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Exportar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onImport}
              className={`relative flex items-center gap-2 px-4 py-3 font-medium transition-all duration-500 group overflow-hidden ${
                isDark
                  ? 'text-white'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl'
              }`}
              style={isDark ? {
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(126, 34, 206, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px -12px rgba(147, 51, 234, 0.6), 0 0 0 1px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              } : {}}
            >
              {isDark && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-violet-500/20 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl" />
                  <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-purple-400/50 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-xl" />
                </>
              )}
              <Upload className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Importar</span>
            </motion.button>
          </div>
        </div>

        {/* Segunda linha - Filtros expandidos */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex flex-col sm:flex-row gap-4 pt-4 border-t ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            {/* Status Filter */}
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tags
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="todas">Todas as Tags</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Origem Filter */}
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Origem
              </label>
              <select className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}>
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
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Período
              </label>
              <select className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}>
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
