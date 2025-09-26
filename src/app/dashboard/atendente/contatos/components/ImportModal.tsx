'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Database, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/contexts/ThemeContext'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: number
    errors: number
    details: string[]
  } | null>(null)

  const acceptedTypes = {
    'text/csv': '.csv',
    'application/json': '.json'
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && Object.keys(acceptedTypes).includes(droppedFile.type)) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/contatos/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      
      if (response.ok) {
        setUploadResult({
          success: data.success || 0,
          errors: data.errors || 0,
          details: data.errorDetails || []
        })
        toast.success(`${data.success || 0} contatos importados com sucesso!`)
        onSuccess()
      } else {
        throw new Error(data.error || 'Erro ao importar contatos')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao importar contatos')
    } finally {
      setIsUploading(false)
    }
  }

  const resetModal = () => {
    setFile(null)
    setUploadResult(null)
    setIsUploading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
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
            onClick={handleClose}
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
                    isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <Upload className={`w-5 h-5 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Importar Contatos
                    </h2>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Carregue seus contatos de arquivos CSV ou JSON
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
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
                {!uploadResult ? (
                  <>
                    {/* Formatos aceitos */}
                    <div>
                      <h3 className={`font-medium mb-3 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Formatos Aceitos</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${
                          isDark ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`} />
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>CSV</span>
                        </div>
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${
                          isDark ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <Database className={`w-5 h-5 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`} />
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>JSON</span>
                        </div>
                      </div>
                    </div>

                    {/* Área de upload */}
                    <div>
                      <h3 className={`font-medium mb-3 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Selecionar Arquivo</h3>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                          dragOver
                            ? isDark
                              ? 'border-blue-400 bg-blue-900/20'
                              : 'border-blue-500 bg-blue-50'
                            : file
                            ? isDark
                              ? 'border-green-400 bg-green-900/20'
                              : 'border-green-500 bg-green-50'
                            : isDark
                              ? 'border-gray-600 hover:border-gray-500'
                              : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {file ? (
                          <div className="space-y-2">
                            <CheckCircle className={`w-8 h-8 mx-auto ${
                              isDark ? 'text-green-400' : 'text-green-500'
                            }`} />
                            <p className={`font-medium ${
                              isDark ? 'text-green-300' : 'text-green-700'
                            }`}>{file.name}</p>
                            <p className={`text-sm ${
                              isDark ? 'text-green-400' : 'text-green-600'
                            }`}>
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              onClick={() => setFile(null)}
                              className={`text-sm transition-colors ${
                                isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Remover arquivo
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className={`w-8 h-8 mx-auto ${
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                            <p className={`${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              Arraste um arquivo aqui ou clique para selecionar
                            </p>
                            <input
                              type="file"
                              accept=".csv,.json"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="file-upload"
                            />
                            <label
                              htmlFor="file-upload"
                              className={`inline-block px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${
                                isDark 
                                  ? 'bg-blue-500 hover:bg-blue-600' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              Escolher Arquivo
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formato esperado */}
                    <div className={`border rounded-lg p-4 ${
                      isDark 
                        ? 'bg-amber-900/20 border-amber-800/50' 
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`w-5 h-5 mt-0.5 ${
                          isDark ? 'text-amber-400' : 'text-amber-600'
                        }`} />
                        <div className="space-y-2">
                          <h4 className={`font-medium ${
                            isDark ? 'text-amber-300' : 'text-amber-800'
                          }`}>Formato Esperado</h4>
                          <p className={`text-sm ${
                            isDark ? 'text-amber-200' : 'text-amber-700'
                          }`}>
                            CSV: nome, telefone, email, empresa (opcional)<br/>
                            JSON: Array com objetos contendo essas propriedades
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Resultado da importação */
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      uploadResult.success > 0 
                        ? isDark
                          ? 'bg-green-900/20 border-green-800/50'
                          : 'bg-green-50 border-green-200'
                        : isDark
                          ? 'bg-red-900/20 border-red-800/50' 
                          : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {uploadResult.success > 0 ? (
                          <CheckCircle className={`w-5 h-5 ${
                            isDark ? 'text-green-400' : 'text-green-600'
                          }`} />
                        ) : (
                          <AlertCircle className={`w-5 h-5 ${
                            isDark ? 'text-red-400' : 'text-red-600'
                          }`} />
                        )}
                        <h4 className={`font-medium ${
                          uploadResult.success > 0 
                            ? isDark ? 'text-green-300' : 'text-green-800'
                            : isDark ? 'text-red-300' : 'text-red-800'
                        }`}>
                          Resultado da Importação
                        </h4>
                      </div>
                      <p className={`text-sm ${
                        uploadResult.success > 0 
                          ? isDark ? 'text-green-200' : 'text-green-700'
                          : isDark ? 'text-red-200' : 'text-red-700'
                      }`}>
                        {uploadResult.success} contatos importados com sucesso
                      </p>
                    </div>

                    {uploadResult.details.length > 0 && (
                      <div className="space-y-2">
                        <h4 className={`font-medium ${
                          isDark ? 'text-red-300' : 'text-red-800'
                        }`}>Erros Encontrados ({uploadResult.errors}):</h4>
                        <div className="space-y-1">
                          {uploadResult.details.map((error, index) => (
                            <p key={index} className={`text-sm ${
                              isDark ? 'text-red-200' : 'text-red-600'
                            }`}>• {error}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`flex justify-end gap-3 p-6 border-t ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              }`}>
                {uploadResult ? (
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Fechar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleClose}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                          : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={!file || isUploading}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Importar
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
