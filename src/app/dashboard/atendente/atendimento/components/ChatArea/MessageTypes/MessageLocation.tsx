'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'

interface MessageLocationProps {
  latitude: number
  longitude: number
  address?: string
  name?: string
  isFromUser: boolean
  caption?: string
}

export default function MessageLocation({ 
  latitude, 
  longitude, 
  address,
  name,
  isFromUser,
  caption 
}: MessageLocationProps) {
  
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`

  const handleOpenMaps = () => {
    window.open(mapUrl, '_blank')
  }

  const handleGetDirections = () => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(directionsUrl, '_blank')
  }

  return (
    <div className="space-y-2">
      {/* Container da Localização */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-2xl overflow-hidden max-w-sm bg-white dark:bg-gray-700 shadow-lg"
      >
        {/* Mapa estático (fallback para quando não há API key) */}
        <div className="relative h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <div className="text-center text-white">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Localização Compartilhada</p>
            <p className="text-xs opacity-80">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>
          
          {/* Botão para abrir no Google Maps */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenMaps}
            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            title="Abrir no Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Informações da localização */}
        <div className="p-4">
          {name && (
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {name}
            </h4>
          )}
          
          {address && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {address}
            </p>
          )}

          {/* Coordenadas */}
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 font-mono">
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenMaps}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Ver no Mapa
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetDirections}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Direções
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Caption opcional */}
      {caption && (
        <p className={`text-sm ${
          isFromUser ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {caption}
        </p>
      )}
    </div>
  )
}
