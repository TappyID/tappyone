'use client'

import { useCallback, useRef } from 'react'

// Hook para gerenciar sons de notificação
export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastPlayTime = useRef<number>(0)
  
  // Inicializar o áudio
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      // Criar um som de notificação usando Web Audio API
      audioRef.current = new Audio()
      
      // Som de notificação do WhatsApp (simulado com frequências)
      const createNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Configurar o som (frequência similar ao WhatsApp)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        
        // Volume
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        // Tocar o som
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        
        return audioContext
      }
      
      // Função para tocar o som customizado
      audioRef.current.play = async () => {
        try {
          createNotificationSound()
        } catch (error) {
          console.log('Audio context not available, using fallback')
          // Fallback: usar um beep simples
          const utterance = new SpeechSynthesisUtterance('')
          utterance.volume = 0.1
          utterance.rate = 10
          speechSynthesis.speak(utterance)
        }
      }
    }
  }, [])

  // Tocar som de notificação
  const playNotificationSound = useCallback(() => {
    const now = Date.now()
    
    // Evitar spam de sons (mínimo 1 segundo entre sons)
    if (now - lastPlayTime.current < 1000) {
      return
    }
    
    lastPlayTime.current = now
    
    try {
      initAudio()
      if (audioRef.current) {
        audioRef.current.play()
      }
    } catch (error) {
      console.log('Could not play notification sound:', error)
      
      // Fallback alternativo: vibração no mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    }
  }, [initAudio])

  // Tocar som de mensagem enviada (mais suave)
  const playSentSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Som mais suave para mensagem enviada
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    } catch (error) {
      console.log('Could not play sent sound:', error)
    }
  }, [])

  return {
    playNotificationSound,
    playSentSound
  }
}
