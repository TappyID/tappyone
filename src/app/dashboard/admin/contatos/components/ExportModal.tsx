'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Database } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Exportar Contatos
                    </h2>
                    <p className="text-sm text-gray-500">
                      Baixe seus contatos em diferentes formatos
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Formato de exportação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Formato de Exportação
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === 'csv'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">CSV</div>
                      <div className="text-xs text-gray-500">Excel, Sheets</div>
                    </button>
                    
                    <button
                      onClick={() => setExportFormat('json')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        exportFormat === 'json'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Database className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-gray-500">Desenvolvedores</div>
                    </button>
                  </div>
                </div>

                {/* Campos para exportar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
