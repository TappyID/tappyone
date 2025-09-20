interface ImageMessageProps {
  message: any
  sender: 'agent' | 'user'
}

export default function ImageMessageComponent({ message, sender }: ImageMessageProps) {
  // Detectar se é imagem
  const isImage = message.type === 'image' || 
    message.mimetype?.includes('image') ||
    message.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  if (!isImage || !message.mediaUrl) return null

  return (
    <div className="mb-2">
      <div className="relative">
        <img 
          src={message.mediaUrl} 
          alt="Imagem enviada" 
          className="w-full h-auto rounded-lg max-h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA2MEw5MCA0NUwxMjUgODBMMTUwIDU1VjEyMEg1MFY2MEg3NVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY5NzA3QiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2VtPC90ZXh0Pgo8L3N2Zz4K";
          }}
        />
      </div>
      {(message.content || message.caption) && (
        <p className={`text-sm mt-2 ${sender === 'agent' ? 'text-white/90' : 'text-gray-700'}`}>
          {message.content || message.caption}
        </p>
      )}
    </div>
  )
}
