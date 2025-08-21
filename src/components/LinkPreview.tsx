'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Globe } from 'lucide-react'

interface LinkPreviewData {
  title?: string
  description?: string
  image?: string
  favicon?: string
  url: string
  siteName?: string
}

interface LinkPreviewProps {
  url: string
  className?: string
}

export default function LinkPreview({ url, className = '' }: LinkPreviewProps) {
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

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-3 bg-gray-50 animate-pulse ${className}`}>
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !preview) {
    return (
      <div 
        onClick={handleClick}
        className={`border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors ${className}`}
      >
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
          <span className="text-sm font-medium truncate">{url}</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={handleClick}
      className={`border border-gray-200 rounded-lg overflow-hidden bg-white hover:bg-gray-50 cursor-pointer transition-colors ${className}`}
    >
      <div className="flex">
        {preview.image && (
          <div className="w-20 h-20 flex-shrink-0">
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
        
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {preview.title && (
                <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
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
            
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
