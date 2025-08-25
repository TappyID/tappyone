import React, { useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Trash2, Square } from 'lucide-react'
import { useAudioRecorder, formatDuration, blobToFile } from '../../hooks/useAudioRecorder'

interface AudioRecorderProps {
  onAudioReady: (file: File, url: string) => void
  onRemove: () => void
  currentAudioUrl?: string
  disabled?: boolean
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioReady,
  onRemove,
  currentAudioUrl,
  disabled = false
}) => {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    error
  } = useAudioRecorder()

  const [isPlaying, setIsPlaying] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  // Quando a gravação é finalizada, processar o arquivo
  useEffect(() => {
    if (audioBlob && audioUrl && !isRecording) {
      console.log('AudioRecorder: Processando arquivo de áudio...')
      const file = blobToFile(audioBlob, `audio-${Date.now()}.webm`)
      console.log('AudioRecorder: Chamando onAudioReady...', { fileName: file.name, url: audioUrl })
      try {
        onAudioReady(file, audioUrl)
        console.log('AudioRecorder: onAudioReady executado com sucesso')
      } catch (error) {
        console.error('AudioRecorder: Erro em onAudioReady:', error)
      }
    }
  }, [audioBlob, audioUrl, isRecording, onAudioReady])

  const handlePlayPause = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleClearRecording = () => {
    clearRecording()
    onRemove()
    setIsPlaying(false)
  }

  const playbackUrl = audioUrl || currentAudioUrl

  if (disabled) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg border">
        <p className="text-sm text-gray-500">Gravação de áudio não disponível</p>
      </div>
    )
  }

  return (
    <div 
      className="space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Controles de Gravação */}
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3">
          {!isRecording && !playbackUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                startRecording()
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>Gravar Áudio</span>
            </button>
          )}

          {isRecording && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Gravando...</span>
                <span className="text-sm text-gray-600">{formatDuration(duration)}</span>
              </div>
              
              <div className="flex space-x-2">
                {!isPaused ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      pauseRecording()
                    }}
                    className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      resumeRecording()
                    }}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    stopRecording()
                  }}
                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Player de Áudio */}
      {playbackUrl && !isRecording && (
        <div 
          className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handlePlayPause()
              }}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-green-800">Áudio gravado</span>
              <span className="text-xs text-green-600">
                Duração: {duration > 0 ? formatDuration(duration) : 'Carregando...'}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClearRecording()
            }}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="Remover áudio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Elemento de áudio oculto */}
      {playbackUrl && (
        <audio
          ref={audioRef}
          src={playbackUrl}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            // Atualizar duração se não foi gravado nesta sessão
            if (duration === 0 && audioRef.current) {
              const audioDuration = Math.floor(audioRef.current.duration)
              if (audioDuration > 0) {
                // Aqui poderíamos atualizar o estado do duration se necessário
              }
            }
          }}
        />
      )}

      {/* Instruções */}
      {!playbackUrl && !isRecording && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Clique em "Gravar Áudio" para criar uma mensagem de voz. 
            O áudio será salvo automaticamente na ação quando finalizar a gravação.
          </p>
        </div>
      )}
    </div>
  )
}
