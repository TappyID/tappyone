import { useState } from 'react'

interface MessageDebuggerProps {
  message: any
  sender: 'agent' | 'user'
}

export default function MessageDebugger({ message, sender }: MessageDebuggerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Só mostra debug no desenvolvimento ou se tem ?debug=true na URL
  const shouldShowDebug = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'))
  
  if (!shouldShowDebug) return null

  const debugData = {
    id: message.id,
    type: message.type,
    processedType: message.processedType,
    hasMediaUrl: !!message.mediaUrl,
    mediaUrl: message.mediaUrl,
    hasMedia: !!message.media,
    mimetype: message.mimetype,
    filename: message.filename,
    caption: message.caption,
    content: message.content?.substring(0, 100) + '...',
    // Location
    hasLocation: !!message.location,
    latitude: message.latitude,
    longitude: message.longitude,
    // Poll
    hasPoll: !!message.poll,
    pollData: message.poll,
    // Contact
    hasContact: !!message.contact,
    hasVcard: !!message.vcard,
    contact: message.contact,
    vcard: message.vcard,
    // Raw keys
    allKeys: Object.keys(message)
  }

  const getDetectionStatus = () => {
    const detections = []
    
    // Location
    if (message.type === 'location' || message.location || message.latitude || message.longitude) {
      detections.push('📍 LOCATION')
    }
    
    // Poll
    if (message.type === 'poll' || message.poll || (message.content && message.content.toLowerCase().includes('enquete'))) {
      detections.push('📊 POLL')
    }
    
    // Contact
    if (message.type === 'contact' || message.type === 'vcard' || message.contact || message.vcard) {
      detections.push('👤 CONTACT')
    }
    
    // Document
    if ((message.type === 'document' || message.type === 'file') || 
        message.mimetype?.includes('application/') || 
        message.mediaUrl?.match(/\.(pdf|doc|docx|txt|xlsx|zip)$/i)) {
      detections.push('📄 DOCUMENT')
    }
    
    // Image
    if (message.type === 'image' || message.mimetype?.includes('image') || 
        message.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      detections.push('🖼️ IMAGE')
    }
    
    // Video
    if (message.type === 'video' || message.mimetype?.includes('video') || 
        message.mediaUrl?.match(/\.(mp4|webm|mov|avi)$/i)) {
      detections.push('🎬 VIDEO')
    }
    
    // Audio
    if (message.type === 'audio' || message.type === 'ptt' || message.mimetype?.includes('audio') || 
        message.mediaUrl?.match(/\.(mp3|ogg|wav|webm)$/i)) {
      detections.push('🎵 AUDIO')
    }
    
    return detections.length > 0 ? detections.join(' + ') : '📝 TEXT'
  }

  return (
    <div className="mb-2">
      {/* Debug Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-2 rounded-t cursor-pointer text-xs font-mono ${
          sender === 'agent' 
            ? 'bg-red-900/50 text-red-200 border border-red-500/50' 
            : 'bg-blue-900/50 text-blue-200 border border-blue-500/50'
        }`}
      >
        <div className="flex justify-between items-center">
          <span className="font-bold">🐛 DEBUG MESSAGE</span>
          <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        </div>
        <div className="mt-1">
          <strong>Detected:</strong> {getDetectionStatus()}
        </div>
        <div>
          <strong>Type:</strong> <code>{message.type}</code> → <code>{message.processedType || 'N/A'}</code>
        </div>
      </div>

      {/* Debug Details */}
      {isExpanded && (
        <div className={`p-3 rounded-b text-xs font-mono space-y-2 ${
          sender === 'agent' 
            ? 'bg-red-950/70 text-red-100 border border-red-500/50 border-t-0' 
            : 'bg-blue-950/70 text-blue-100 border border-blue-500/50 border-t-0'
        }`}>
          
          {/* Quick Status */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>MediaURL: {debugData.hasMediaUrl ? '✅' : '❌'}</div>
            <div>Media: {debugData.hasMedia ? '✅' : '❌'}</div>
            <div>Location: {debugData.hasLocation ? '✅' : '❌'}</div>
            <div>Poll: {debugData.hasPoll ? '✅' : '❌'}</div>
            <div>Contact: {debugData.hasContact ? '✅' : '❌'}</div>
            <div>VCard: {debugData.hasVcard ? '✅' : '❌'}</div>
          </div>

          {/* URLs */}
          {debugData.mediaUrl && (
            <div className="p-2 bg-black/30 rounded">
              <strong>MediaURL:</strong>
              <div className="break-all text-xs mt-1">{debugData.mediaUrl}</div>
            </div>
          )}

          {/* Content Preview */}
          {message.content && (
            <div className="p-2 bg-black/30 rounded">
              <strong>Content:</strong>
              <div className="break-words text-xs mt-1">{debugData.content}</div>
            </div>
          )}

          {/* Location Data */}
          {(debugData.latitude || debugData.longitude) && (
            <div className="p-2 bg-green-900/30 rounded">
              <strong>📍 Location:</strong>
              <div>Lat: {debugData.latitude} | Lng: {debugData.longitude}</div>
            </div>
          )}

          {/* Poll Data */}
          {debugData.pollData && (
            <div className="p-2 bg-purple-900/30 rounded">
              <strong>📊 Poll:</strong>
              <pre className="text-xs mt-1 overflow-auto max-h-20">
                {JSON.stringify(debugData.pollData, null, 2)}
              </pre>
            </div>
          )}

          {/* Contact Data */}
          {(debugData.contact || debugData.vcard) && (
            <div className="p-2 bg-blue-900/30 rounded">
              <strong>👤 Contact/VCard:</strong>
              <pre className="text-xs mt-1 overflow-auto max-h-20">
                {JSON.stringify(debugData.contact || debugData.vcard, null, 2)}
              </pre>
            </div>
          )}

          {/* Raw Data */}
          <details className="p-2 bg-black/50 rounded">
            <summary className="cursor-pointer font-bold text-yellow-300">
              🔍 RAW MESSAGE DATA (click to expand)
            </summary>
            <pre className="text-xs mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
              {JSON.stringify(message, null, 2)}
            </pre>
          </details>

          {/* All Keys */}
          <div className="p-2 bg-gray-900/50 rounded">
            <strong>Available Keys:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {debugData.allKeys.map(key => (
                <span key={key} className="px-1 bg-gray-700/50 rounded text-xs">
                  {key}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
