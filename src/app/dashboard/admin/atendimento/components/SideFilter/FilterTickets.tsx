'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, ChevronDown } from 'lucide-react'

interface FilterTicketsProps {
  selectedStatus: string
  onStatusChange: (status: string) => void
  ticketStatuses: Array<{
    id: string
    nome: string
    cor?: string
    count?: number
  }>
  isLoading?: boolean
}

export default function FilterTickets({ 
  selectedStatus, 
  onStatusChange, 
  ticketStatuses, 
  isLoading = false 
}: FilterTicketsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedStatusData = ticketStatuses.find(s => s.id === selectedStatus)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 
                   dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        disabled={isLoading}
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {isLoading ? 'Carregando...' : 
              selectedStatus === 'todos' ? 'Todos os Tickets' : 
              selectedStatusData?.nome || 'Selecionar Status'
            }
          </span>
          {selectedStatusData?.cor && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedStatusData.cor }}
            />
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 
                       border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg 
                       z-50 max-h-60 overflow-y-auto"
          >
            {/* Opção "Todos" */}
            <button
              onClick={() => {
                onStatusChange('todos')
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors flex items-center gap-2 ${
                selectedStatus === 'todos' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Ticket className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Todos os Status</span>
            </button>

            {/* Lista de Status */}
            {ticketStatuses.map(status => (
              <button
                key={status.id}
                onClick={() => {
                  onStatusChange(status.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors flex items-center gap-2 ${
                  selectedStatus === status.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.cor || '#6b7280' }}
                />
                <span className="text-sm font-medium">{status.nome}</span>
                {status.count && (
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 
                                   px-2 py-1 rounded-full">
                    {status.count}
                  </span>
                )}
              </button>
            ))}

            {/* Estado vazio */}
            {ticketStatuses.length === 0 && !isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhum status encontrado
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
