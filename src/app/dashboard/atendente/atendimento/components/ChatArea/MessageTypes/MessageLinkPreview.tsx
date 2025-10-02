'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Globe, Image } from 'lucide-react'

interface LinkPreviewData {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
  favicon?: string
}

interface MessageLinkPreviewProps {
  content: string
  linkPreview: LinkPreviewData
  isFromUser: boolean
}

export default function MessageLinkPreview({
  content,
  linkPreview,
  isFromUser
}: MessageLinkPreviewProps) {

  const handleLinkClick = () => {
    window.open(linkPreview.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-2">
      {/* Texto da mensagem */}
      {content && (
        <p className={`text-sm leading-relaxed ${
          isFromUser ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'
        }`}>
          {content}
        </p>
      )}

      {/* Preview do link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm max-w-md"
      >
        {/* Imagem do preview (se disponível) */}
        {linkPreview.image && (
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            <img
              src={linkPreview.image}
              alt={linkPreview.title || 'Link preview'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Se a imagem falhar, esconder o container
                const target = e.target as HTMLImageElement
                target.parentElement?.remove()
              }}
            />
          </div>
        )}

        {/* Conteúdo do preview */}
        <div className="p-4 space-y-2">
          {/* Site name + favicon */}
          {(linkPreview.siteName || linkPreview.favicon) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {linkPreview.favicon ? (
                <img
                  src={linkPreview.favicon}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => {
                    // Se o favicon falhar, mostrar ícone genérico
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const icon = document.createElement('div')
                    icon.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>'
                    target.parentNode?.insertBefore(icon.firstChild!, target)
                  }}
                />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span>{linkPreview.siteName || new URL(linkPreview.url).hostname}</span>
            </div>
          )}

          {/* Título */}
          {linkPreview.title && (
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">
              {linkPreview.title}
            </h3>
          )}

          {/* Descrição */}
          {linkPreview.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {linkPreview.description}
            </p>
          )}

          {/* URL */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-blue-600 dark:text-blue-400 truncate">
              {linkPreview.url}
            </span>
            <button
              onClick={handleLinkClick}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Abrir link"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overlay clicável */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleLinkClick}
          title={`Abrir ${linkPreview.url}`}
        />
      </motion.div>
    </div>
  )
}
