'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Eye,
  File,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  FileCode
} from 'lucide-react'

interface MessageDocumentProps {
  documentUrl: string
  fileName: string
  fileSize?: number
  mimeType?: string
  isFromUser: boolean
  caption?: string
}

export default function MessageDocument({
  documentUrl,
  fileName,
  fileSize = 0,
  mimeType = '',
  isFromUser,
  caption
}: MessageDocumentProps) {

  const getFileIcon = () => {
    const iconProps = { className: "w-6 h-6" }

    if (mimeType.includes('pdf')) return <FileText {...iconProps} className="w-6 h-6 text-red-500" />
    if (mimeType.includes('image')) return <FileImage {...iconProps} className="w-6 h-6 text-green-500" />
    if (mimeType.includes('video')) return <FileVideo {...iconProps} className="w-6 h-6 text-purple-500" />
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet {...iconProps} className="w-6 h-6 text-emerald-500" />
    if (mimeType.includes('text') || mimeType.includes('code')) return <FileCode {...iconProps} className="w-6 h-6 text-blue-500" />

    return <File {...iconProps} className="w-6 h-6 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = documentUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = () => {
    window.open(documentUrl, '_blank')
  }

  return (
    <div className="space-y-2">
      {/* Container do Documento */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${
          isFromUser
            ? 'bg-blue-600/90 border-white/20 hover:border-white/40'
            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        {/* Ícone do arquivo */}
        <div className={`p-2 rounded-lg ${
          isFromUser
            ? 'bg-white/20'
            : 'bg-white dark:bg-gray-600'
        }`}>
          {getFileIcon()}
        </div>

        {/* Informações do arquivo */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate text-sm ${
            isFromUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {fileName}
          </h4>
          {fileSize > 0 && (
            <p className={`text-xs mt-1 ${
              isFromUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formatFileSize(fileSize)} • {mimeType.split('/')[1]?.toUpperCase() || 'Arquivo'}
            </p>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-1">
          {/* Botão Visualizar */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePreview}
            className={`p-2 rounded-full transition-colors ${
              isFromUser
                ? 'hover:bg-white/20'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Visualizar"
          >
            <Eye className={`w-4 h-4 ${
              isFromUser ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`} />
          </motion.button>

          {/* Botão Download */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className={`p-2 rounded-full transition-colors ${
              isFromUser
                ? 'hover:bg-white/20'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Download"
          >
            <Download className={`w-4 h-4 ${
              isFromUser ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`} />
          </motion.button>
        </div>
      </motion.div>

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
