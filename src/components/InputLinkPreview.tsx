'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Globe } from 'lucide-react'

interface LinkPreviewData {
  title?: string
  description?: string
  image?: string
  favicon?: string
  url: string
  siteName?: string
}

interface InputLinkPreviewProps {
  url: string
  onRemove: () => void
  className?: string
}

export default function InputLinkPreview({ url, onRemove, className = '' }: InputLinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url || !isValidUrl(url)) return

    fetchPreview(url)
  }, [url])

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const fetchPreview = async (url: string) => {
    setLoading(true)
    setError(false)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/link-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      })

      if (response.ok) {
        const data = await response.json()
        setPreview({
          title: data.title,
          description: data.description,
          image: data.image,
          favicon: data.favicon || `https://www.google.com/s2/favicons?domain=${extractDomain(url)}&sz=32`,
          url: url,
          siteName: data.siteName || extractDomain(url)
        })
      } else {
        setError(true)
      }
    } catch (err) {
      console.error('Erro ao buscar preview:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'Link'
    }
  }

  if (loading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-3 bg-gray-50 animate-pulse relative ${className}`}>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !preview) {
    return (
      <div className={`border border-gray-200 rounded-lg p-3 bg-gray-50 relative ${className}`}>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="flex items-center gap-2 text-blue-600">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${extractDomain(url)}&sz=16`}
            alt="Favicon"
            className="w-4 h-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <ExternalLink className="w-4 h-4 hidden" />
          <span className="text-sm font-medium truncate pr-8">{url}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white relative ${className}`}>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white shadow-sm transition-colors z-10"
      >
        <X className="w-3 h-3" />
      </button>
      
      <div className="flex">
        {preview.image && (
          <div className="w-16 h-16 flex-shrink-0">
            <img 
              src={preview.image} 
              alt={preview.title || 'Preview'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div className="flex-1 p-3 min-w-0 pr-8">
          {preview.title && (
            <h4 className="font-medium text-sm text-gray-900 line-clamp-1 mb-1">
              {preview.title}
            </h4>
          )}
          
          {preview.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {preview.description}
            </p>
          )}
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {preview.favicon ? (
              <img 
                src={preview.favicon}
                alt="Favicon"
                className="w-3 h-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <Globe className={`w-3 h-3 ${preview.favicon ? 'hidden' : ''}`} />
            <span className="truncate">{preview.siteName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
