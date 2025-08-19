'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DeleteConfirmTooltipProps {
  onConfirm: () => void
  loading?: boolean
  children: React.ReactNode
}

export const DeleteConfirmTooltip: React.FC<DeleteConfirmTooltipProps> = ({
  onConfirm,
  loading = false,
  children
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onConfirm()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  // Auto-hide após 5 segundos
  useEffect(() => {
    if (showConfirm) {
      timeoutRef.current = setTimeout(() => {
        setShowConfirm(false)
      }, 5000)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [showConfirm])

  return (
    <div className="relative">
      <div onClick={handleClick}>
        {children}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px]"
          >
            <div className="text-sm text-gray-700 mb-3 text-center">
              Tem certeza que deseja deletar esta mensagem?
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                disabled={loading}
              >
                <X className="w-3 h-3" />
                Cancelar
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded transition-colors flex items-center gap-1"
              >
                {loading ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Deletar
              </button>
            </div>

            {/* Seta apontando para cima */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
