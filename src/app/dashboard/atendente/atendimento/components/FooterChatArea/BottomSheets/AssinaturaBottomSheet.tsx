'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, PenTool, FileText, Upload, Download } from 'lucide-react'

interface AssinaturaBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function AssinaturaBottomSheet({ isOpen, onClose, chatId }: AssinaturaBottomSheetProps) {
  const [titulo, setTitulo] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('contrato')
  const [descricao, setDescricao] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [prazoAssinatura, setPrazoAssinatura] = useState('')

  if (!isOpen) return null

  const tiposDocumento = [
    { value: 'contrato', label: 'Contrato', desc: 'Acordo comercial' },
    { value: 'proposta', label: 'Proposta', desc: 'Proposta comercial' },
    { value: 'termo', label: 'Termo', desc: 'Termo de uso/serviço' },
    { value: 'acordo', label: 'Acordo', desc: 'Acordo específico' },
    { value: 'autorizacao', label: 'Autorização', desc: 'Documento de autorização' },
    { value: 'outros', label: 'Outros', desc: 'Outro tipo de documento' }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0])
    }
  }

  const handleSave = () => {
    console.log('✍️ Assinatura:', { 
      titulo, 
      tipoDocumento, 
      descricao, 
      arquivo: arquivo?.name, 
      prazoAssinatura, 
      chatId 
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <PenTool className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">✍️ Nova Assinatura</h2>
              <p className="text-sm text-gray-500">Solicitar assinatura digital de documento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 pb-24">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Documento *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Contrato de Prestação de Serviços"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prazo para Assinatura</label>
              <input
                type="date"
                value={prazoAssinatura}
                onChange={(e) => setPrazoAssinatura(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Tipo de Documento</label>
            <div className="grid grid-cols-3 gap-2">
              {tiposDocumento.map((tipo) => (
                <button
                  key={tipo.value}
                  onClick={() => setTipoDocumento(tipo.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    tipoDocumento === tipo.value 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{tipo.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{tipo.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload do Documento</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {arquivo ? (
                  <>
                    <FileText className="w-8 h-8 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">{arquivo.name}</span>
                    <span className="text-xs text-gray-500">
                      {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Clique para fazer upload
                    </span>
                    <span className="text-xs text-gray-500">
                      PDF, DOC, DOCX (máx. 10MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição/Instruções</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Instruções para o signatário, pontos importantes, etc..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              📋 Processo de assinatura:
            </p>
            <p className="text-xs text-purple-500 dark:text-purple-300 mt-1">
              • Documento será enviado por email<br/>
              • Cliente recebe link para assinatura digital<br/>
              • Você receberá notificação quando assinado<br/>
              • Documento assinado fica disponível para download
            </p>
          </div>

          </div>
        </div>
        
        {/* Botões fixos na parte inferior */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!titulo.trim() || !arquivo}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                (!titulo.trim() || !arquivo)
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              Enviar para Assinatura
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
