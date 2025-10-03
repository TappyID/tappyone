'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Command } from 'lucide-react'

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleFocus = () => setIsExpanded(true)
  const handleBlur = () => {
    if (!searchValue) setIsExpanded(false)
  }

  const clearSearch = () => {
    setSearchValue('')
    setIsExpanded(false)
  }

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ width: isExpanded ? 400 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative">
        {/* Search Input */}
        <motion.input
          type="text"
          placeholder="Buscar atendimentos, contatos, tags..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full h-10 pl-10 pr-12 rounded-xl text-sm transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 bg-white/10 border border-white/20 text-white placeholder-white/70 focus:ring-white/30 focus:border-white"
          whileFocus={{ scale: 1.01 }}
        />

        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ 
              scale: isExpanded ? 1.1 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <Search 
              size={16} 
              className={`transition-colors duration-200 ${
                isExpanded ? 'text-white' : 'text-white/70'
              }`} 
            />
          </motion.div>
        </div>

        {/* Clear Button */}
        {searchValue && (
          <motion.button
            onClick={clearSearch}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3 h-3 text-gray-500" />
          </motion.button>
        )}

        {/* Keyboard Shortcut */}
        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md"
          animate={{ 
            opacity: isExpanded || searchValue ? 0 : 1,
            scale: isExpanded || searchValue ? 0.8 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <Command className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">K</span>
        </motion.div>
      </div>

      {/* Search Results Dropdown */}
      {isExpanded && (
        <motion.div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-3">Sugestões de busca</div>
            <div className="space-y-2">
              {['Atendimentos pendentes', 'Contatos VIP', 'Tags importantes', 'Relatórios mensais'].map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
