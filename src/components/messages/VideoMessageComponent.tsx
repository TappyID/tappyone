import { Video } from 'lucide-react'

interface VideoMessageProps {
  message: any
  sender: 'agent' | 'user'
}

export default function VideoMessageComponent({ message, sender }: VideoMessageProps) {
  // Detectar se é vídeo (mas não áudio)
  const isVideo = (message.type === 'video' || 
    message.mimetype?.includes('video') ||
    message.mediaUrl?.match(/\.(mp4|webm|mov|avi)$/i)) &&
    // Excluir áudios
    !message.mimetype?.includes('audio') &&
    !message.mediaUrl?.match(/\.(mp3|ogg|oga|wav|mpga)$/i)

  if (!isVideo || !message.mediaUrl) return null

  return (
    <div className="mb-2">
      <div className={`p-3 rounded-lg ${
        sender === 'agent' ? 'bg-white/5 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-slate-600/30 shadow-lg dark:shadow-black/50' : 'bg-muted/50 dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border dark:border-slate-600/30'
      }`}>
        <div className={`flex items-center gap-2 mb-3 ${
          sender === 'agent' ? 'text-white/90' : 'text-gray-700'
        }`}>
          <Video className="w-4 h-4" />
          <span className="text-sm font-medium">📹 Vídeo</span>
        </div>
        <video 
          controls 
          className="w-full max-w-sm rounded-lg shadow-sm"
          preload="metadata"
        >
          <source src={message.mediaUrl} type="video/mp4" />
          <source src={message.mediaUrl} type="video/webm" />
          <source src={message.mediaUrl} type="video/quicktime" />
          Seu navegador não suporta o elemento de vídeo.
        </video>
        {(message.content || message.caption) && (
          <p className={`text-sm mt-3 ${sender === 'agent' ? 'text-white/90' : 'text-gray-700'}`}>
            {message.content || message.caption}
          </p>
        )}
      </div>
    </div>
  )
}
