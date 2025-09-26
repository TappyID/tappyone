'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Database } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/contexts/ThemeContext'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exportFields, setExportFields] = useState({
    nome: true,
    telefone: true,
    email: true,
    empresa: false,
    tags: false,
    endereco: false,
    criadoEm: false
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!exportFormat) return
    
    setIsExporting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/contatos/export?format=${exportFormat}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `contatos.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        onClose()
        toast.success(`Contatos exportados em ${exportFormat.toUpperCase()} com sucesso!`)
      } else {
        throw new Error('Erro ao exportar contatos')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao exportar contatos')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
              isDark ? 'bg-black/70' : 'bg-black/50'
            }`}
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-green-900/30' : 'bg-green-100'
                  }`}>
                    <Download className={`w-5 h-5 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Exportar Contatos
                    </h2>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Baixe seus contatos em diferentes formatos
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Formato de exportação */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Formato de Exportação
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === 'csv'
                          ? isDark
                            ? 'border-green-500 bg-green-900/20 text-green-400'
                            : 'border-green-500 bg-green-50 text-green-700'
                          : isDark
                            ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">CSV</div>
                      <div className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Excel, Sheets</div>
                    </button>
                    
                    <button
                      onClick={() => setExportFormat('json')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === 'json'
                          ? isDark
                            ? 'border-green-500 bg-green-900/20 text-green-400'
                            : 'border-green-500 bg-green-50 text-green-700'
                          : isDark
                            ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Database className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">JSON</div>
                      <div className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Desenvolvedores</div>
                    </button>
                  </div>
                </div>

                {/* Campos para exportar */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Campos para Exportar
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'nome', label: 'Nome' },
                      { key: 'telefone', label: 'Telefone' },
                      { key: 'email', label: 'E-mail' },
                      { key: 'empresa', label: 'Empresa' },
                      { key: 'tags', label: 'Tags' },
                      { key: 'endereco', label: 'Endereço Completo' },
                      { key: 'criadoEm', label: 'Data de Criação' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={exportFields[key as keyof typeof exportFields]}
                          onChange={(e) => setExportFields(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className={`w-4 h-4 text-green-600 rounded focus:ring-green-500 ${
                            isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                          }`}
                        />
                        <span className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`flex justify-end gap-3 p-6 border-t ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || Object.values(exportFields).every(v => !v)}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exportar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
