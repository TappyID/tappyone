'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, ChevronRight, ArrowLeft } from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  description?: string
  icon?: string
  submenu?: MenuItem[]
}

interface MessageMenuProps {
  title: string
  description?: string
  items: MenuItem[]
  isFromUser: boolean
  caption?: string
}

export default function MessageMenu({ 
  title, 
  description,
  items,
  isFromUser,
  caption 
}: MessageMenuProps) {
  const [currentMenu, setCurrentMenu] = useState<MenuItem[]>(items)
  const [breadcrumb, setBreadcrumb] = useState<string[]>([title])

  const handleItemClick = (item: MenuItem) => {
    if (item.submenu && item.submenu.length > 0) {
      // Navegar para submenu
      setCurrentMenu(item.submenu)
      setBreadcrumb(prev => [...prev, item.title])
    } else {
      // Ação do item
      console.log('Menu item selecionado:', item)
    }
  }

  const handleBackClick = () => {
    if (breadcrumb.length > 1) {
      // Voltar para menu anterior
      setBreadcrumb(prev => prev.slice(0, -1))
      // Aqui você implementaria a lógica para reconstruir o menu anterior
      // Por simplicidade, voltamos para o menu raiz
      setCurrentMenu(items)
    }
  }

  return (
    <div className="space-y-2">
      {/* Container do Menu */}
      <div className="rounded-2xl overflow-hidden max-w-sm bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600">
        
        {/* Header do menu */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{breadcrumb[breadcrumb.length - 1]}</h3>
              {description && breadcrumb.length === 1 && (
                <p className="text-sm opacity-90">{description}</p>
              )}
            </div>
          </div>
          
          {/* Breadcrumb */}
          {breadcrumb.length > 1 && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackClick}
                className="flex items-center gap-1 text-sm opacity-90 hover:opacity-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </motion.button>
            </div>
          )}
        </div>

        {/* Itens do menu */}
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {currentMenu.map((item, index) => (
            <motion.div
              key={item.id}
              whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick(item)}
              className="flex items-center p-4 cursor-pointer transition-colors"
            >
              {/* Ícone do item */}
              {item.icon && (
                <div className="w-8 h-8 flex items-center justify-center mr-3">
                  <span className="text-lg">{item.icon}</span>
                </div>
              )}

              {/* Conteúdo do item */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Indicador de submenu */}
              {item.submenu && item.submenu.length > 0 && (
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Selecione uma opção para continuar
          </p>
        </div>
      </div>

      {/* Caption opcional */}
      {caption && (
        <p className={`text-sm ${
          isFromUser ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {caption}
        </p>
      )}
    </div>
  )
}
