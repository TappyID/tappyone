import { useState, useRef, useCallback } from 'react'

interface AudioRecorderState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
}

interface UseAudioRecorderReturn extends AudioRecorderState {
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  clearRecording: () => void
  error: string | null
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null
  })
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 ÁUDIO - Iniciando gravação...')
      setError(null)
      
      // Verificar se o browser suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser não suporta gravação de áudio')
      }
      
      console.log('🎤 ÁUDIO - Solicitando permissão do microfone...')
      
      // Tentar primeiro com configuração simples
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('🎤 ÁUDIO - Acesso básico ao microfone obtido')
      } catch (basicError) {
        console.log('🎤 ÁUDIO - Erro no acesso básico, tentando configuração detalhada...', basicError)
        
        // Fallback com configurações específicas
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            deviceId: 'default'
          } 
        })
        console.log('🎤 ÁUDIO - Acesso detalhado ao microfone obtido')
      }
      
      console.log('🎤 ÁUDIO - Permissão concedida, stream obtido')
      
      streamRef.current = stream
      chunksRef.current = []

      // Criar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder

      // Event listeners
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
          isPaused: false
        }))

        // Limpar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      // Iniciar gravação
      mediaRecorder.start(100) // Coletar dados a cada 100ms
      startTimeRef.current = Date.now()

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null
      }))

      // Iniciar contador de tempo
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }))
      }, 1000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar gravação'
      setError(errorMessage)
      console.error('Erro ao iniciar gravação:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause()
      
      setState(prev => ({
        ...prev,
        isPaused: true
      }))

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isRecording, state.isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume()
      
      setState(prev => ({
        ...prev,
        isPaused: false
      }))

      // Retomar contador
      const pausedDuration = state.duration
      startTimeRef.current = Date.now() - (pausedDuration * 1000)
      
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }))
      }, 1000)
    }
  }, [state.isRecording, state.isPaused, state.duration])

  const clearRecording = useCallback(() => {
    // Parar gravação se estiver ativa
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
    }

    // Limpar stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Limpar interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Limpar URL do áudio anterior
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl)
    }

    // Reset state
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null
    })

    setError(null)
  }, [state.isRecording, state.audioUrl])

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    error
  }
}

// Função utilitária para converter Blob para File
export const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, { type: blob.type })
}

// Função utilitária para formatar duração
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
