'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Database, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
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
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Importar Contatos
                    </h2>
                    <p className="text-sm text-gray-500">
                      Carregue seus contatos de arquivos CSV ou JSON
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {!uploadResult ? (
                  <>
                    {/* Formatos aceitos */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Formatos Aceitos</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="text-sm">CSV</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Database className="w-5 h-5 text-gray-600" />
                          <span className="text-sm">JSON</span>
                        </div>
                      </div>
                    </div>

                    {/* Área de upload */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Selecionar Arquivo</h3>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                          dragOver
                            ? 'border-blue-500 bg-blue-50'
                            : file
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {file ? (
                          <div className="space-y-2">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                            <p className="font-medium text-green-700">{file.name}</p>
                            <p className="text-sm text-green-600">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                              onClick={() => setFile(null)}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Remover arquivo
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-gray-600">
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
                              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                              Escolher Arquivo
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formato esperado */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="space-y-2">
                          <h4 className="font-medium text-amber-800">Formato Esperado</h4>
                          <p className="text-sm text-amber-700">
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
                    <div className={`p-4 rounded-lg ${
                      uploadResult.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {uploadResult.success > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <h4 className={`font-medium ${
                          uploadResult.success > 0 ? 'text-green-800' : 'text-red-800'
                        }`}>
                          Resultado da Importação
                        </h4>
                      </div>
                      <p className={`text-sm ${
                        uploadResult.success > 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {uploadResult.success} contatos importados com sucesso
                      </p>
                    </div>

                    {uploadResult.details.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-800">Erros Encontrados ({uploadResult.errors}):</h4>
                        <div className="space-y-1">
                          {uploadResult.details.map((error, index) => (
                            <p key={index} className="text-sm text-red-600">• {error}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
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
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
