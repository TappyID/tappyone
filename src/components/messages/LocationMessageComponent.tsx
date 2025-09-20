import { MapPin, ExternalLink } from 'lucide-react'

interface LocationMessageProps {
  message: any
  sender: 'agent' | 'user'
}

export default function LocationMessageComponent({ message, sender }: LocationMessageProps) {
  // Detectar se é localização
  const isLocation = message.type === 'location' || 
    message.location || 
    message.latitude || 
    message.longitude ||
    (message.content && (
      message.content.toLowerCase().includes('latitude') || 
      message.content.toLowerCase().includes('localização') ||
      message.content.toLowerCase().includes('location')
    ))

  if (!isLocation) return null

  const lat = message.location?.latitude || message.latitude
  const lng = message.location?.longitude || message.longitude

  return (
    <div className="mb-2">
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        sender === 'agent' ? 'bg-white/10 dark:bg-black/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/30' : 'bg-gray-100 dark:bg-gray-200 border border-gray-300'
      }`}>
        <div className={`p-2 rounded-full ${
          sender === 'agent' ? 'bg-white/20 dark:bg-slate-700/60 backdrop-blur-sm' : 'bg-gray-200 dark:bg-gray-300'
        }`}>
          <MapPin className={`w-4 h-4 ${
            sender === 'agent' ? 'text-white' : 'text-gray-800 dark:text-gray-800'
          }`} />
        </div>
        <div className="flex-1">
          <div className={`font-medium text-sm ${
            sender === 'agent' ? 'text-white' : 'text-gray-800 dark:text-gray-800'
          }`}>
            {message.location?.title || message.content || 'Localização'}
          </div>
          {message.location?.address && (
            <div className={`text-xs mt-1 ${
              sender === 'agent' ? 'text-white/70' : 'text-gray-600 dark:text-gray-600'
            }`}>
              {message.location.address}
            </div>
          )}
          {(lat && lng) && (
            <div className={`text-xs mt-1 ${
              sender === 'agent' ? 'text-white/70' : 'text-gray-600 dark:text-gray-600'
            }`}>
              Lat: {lat}, Lng: {lng}
            </div>
          )}
        </div>
        {(lat && lng) && (
          <button
            onClick={() => {
              window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
            }}
            className={`p-2 rounded-full hover:bg-opacity-80 transition-colors ${
              sender === 'agent' ? 'bg-white/20 hover:bg-white/30' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <ExternalLink className={`w-3 h-3 ${
              sender === 'agent' ? 'text-white' : 'text-gray-600 dark:text-gray-600'
            }`} />
          </button>
        )}
      </div>
    </div>
  )
}
