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
  sendImage: (chatId: string, imageFile: File, caption?: string) => Promise<any>
  sendFile: (chatId: string, file: File, caption?: string) => Promise<any>
  sendVoice: (chatId: string, audioBlob: Blob) => Promise<any>
  sendVideo: (chatId: string, videoFile: File, caption?: string) => Promise<any>
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

  const sendImage = useCallback(async (chatId: string, imageFile: File, caption?: string) => {
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('chatId', chatId)
      formData.append('image', imageFile)
      if (caption) {
        formData.append('caption', caption)
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Send image failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send image failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const sendFile = useCallback(async (chatId: string, file: File, caption?: string) => {
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('chatId', chatId)
      formData.append('file', file)
      if (caption) {
        formData.append('caption', caption)
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/file`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Send file failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send file failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const sendVoice = useCallback(async (chatId: string, audioBlob: Blob) => {
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('chatId', chatId)
      formData.append('voice', audioBlob, 'voice_message.webm')

      console.log('🎵 ENVIANDO ÁUDIO:', {
        chatId,
        audioBlob: audioBlob,
        audioSize: audioBlob.size,
        audioType: audioBlob.type,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
        }))
      })

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/voice`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      console.log('🎵 RESPOSTA ÁUDIO:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        throw new Error(`Send voice failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send voice failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const sendVideo = useCallback(async (chatId: string, videoFile: File, caption?: string) => {
    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('chatId', chatId)
      formData.append('video', videoFile)
      if (caption) {
        formData.append('caption', caption)
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/video`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Send video failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Send video failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
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

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/media`, {
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
