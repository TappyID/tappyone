import { useState, useCallback } from 'react'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface MediaUploadResult {
  url: string
  filename: string
  size: number
  type: string
}

interface UseMediaUploadReturn {
  uploadFile: (file: File) => Promise<MediaUploadResult>
  sendImage: (chatId: string, imageUrl: string, caption?: string) => Promise<any>
  sendFile: (chatId: string, fileUrl: string, filename: string, caption?: string) => Promise<any>
  sendVoice: (chatId: string, audioUrl: string) => Promise<any>
  sendVideo: (chatId: string, videoUrl: string, caption?: string) => Promise<any>
  uploadAndSendMedia: (chatId: string, file: File, type: string, caption?: string) => Promise<any>
  isUploading: boolean
  uploadProgress: UploadProgress | null
  error: string | null
}

export const useMediaUpload = (): UseMediaUploadReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  const uploadFile = useCallback(async (file: File): Promise<MediaUploadResult> => {
    setIsUploading(true)
    setError(null)
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/whatsapp/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      setUploadProgress({ loaded: file.size, total: file.size, percentage: 100 })
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const sendImage = useCallback(async (chatId: string, imageUrl: string, caption?: string) => {
    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          imageUrl,
          caption: caption || ''
        })
      })

      if (!response.ok) {
        throw new Error(`Send image failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send image failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const sendFile = useCallback(async (chatId: string, fileUrl: string, filename: string, caption?: string) => {
    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          fileUrl,
          filename,
          caption: caption || ''
        })
      })

      if (!response.ok) {
        throw new Error(`Send file failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send file failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const sendVoice = useCallback(async (chatId: string, audioUrl: string) => {
    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          audioUrl
        })
      })

      if (!response.ok) {
        throw new Error(`Send voice failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send voice failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const sendVideo = useCallback(async (chatId: string, videoUrl: string, caption?: string) => {
    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          videoUrl,
          caption: caption || ''
        })
      })

      if (!response.ok) {
        throw new Error(`Send video failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send video failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const uploadAndSendMedia = useCallback(async (chatId: string, file: File, type: string, caption?: string) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (caption) {
        formData.append('caption', caption)
      }

      const response = await fetch(`/api/whatsapp/chats/${chatId}/media`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload and send failed: ${response.statusText}`)
      }

      const result = await response.json()
      setUploadProgress({ loaded: file.size, total: file.size, percentage: 100 })
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload and send failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    uploadFile,
    sendImage,
    sendFile,
    sendVoice,
    sendVideo,
    uploadAndSendMedia,
    isUploading,
    uploadProgress,
    error
  }
}
