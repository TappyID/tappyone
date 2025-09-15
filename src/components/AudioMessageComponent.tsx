'use client'

import { useState } from 'react'
import { AudioLines, FileText, Loader2 } from 'lucide-react'

interface AudioMessageComponentProps {
  message: {
    mediaUrl?: string
    body?: string
    caption?: string
  }
  onTranscribe?: (text: string) => void
}

export default function AudioMessageComponent({ message, onTranscribe }: AudioMessageComponentProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTranscribe = async () => {
    if (!message.mediaUrl) return

    setIsTranscribing(true)
    setError(null)

    try {
      // Corrigir URL para produção se necessário
      let audioUrl = message.mediaUrl
      if (audioUrl.includes('localhost:3000') && typeof window !== 'undefined') {
        audioUrl = audioUrl.replace('http://localhost:3000', window.location.origin)
      }
      
      console.log('🎤 [Transcrição] URL do áudio:', audioUrl)

      // Baixar o arquivo de áudio
      const audioResponse = await fetch(audioUrl)
      
      if (!audioResponse.ok) {
        throw new Error(`Erro ao baixar áudio: ${audioResponse.status}`)
      }
      
      const audioBlob = await audioResponse.blob()
      console.log('🎤 [Transcrição] Áudio baixado:', audioBlob.size, 'bytes')
      
      // Criar FormData para enviar para a API de transcrição
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.ogg')

      // Chamar API de transcrição
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Erro na transcrição: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.text) {
        setTranscription(result.text)
        onTranscribe?.(result.text)
      } else {
        throw new Error('Transcrição vazia ou inválida')
      }

    } catch (err) {
      console.error('Erro na transcrição:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Player de áudio */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        {message.mediaUrl ? (
          <audio controls className="flex-1" preload="metadata">
            <source src={message.mediaUrl} type="audio/webm" />
            <source src={message.mediaUrl} type="audio/ogg" />
            <source src={message.mediaUrl} type="audio/mpeg" />
            Seu navegador não suporta áudio.
          </audio>
        ) : (
          <span className="text-sm text-gray-500">Áudio não disponível</span>
        )}
        
        {/* Botão de transcrição */}
        {message.mediaUrl && (
          <button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Transcrever áudio"
          >
            {isTranscribing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <FileText className="w-3 h-3" />
            )}
            {isTranscribing ? 'Transcrevendo...' : 'Transcrever'}
          </button>
        )}
      </div>

      {/* Transcrição */}
      {transcription && (
        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">TRANSCRIÇÃO:</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line">{transcription}</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
          <p className="text-xs text-red-600">❌ Erro na transcrição: {error}</p>
        </div>
      )}
    </div>
  )
}
