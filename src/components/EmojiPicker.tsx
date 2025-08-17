'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, Search } from 'lucide-react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  isOpen: boolean
  onClose: () => void
}

// Categorias de emojis mais usados
const EMOJI_CATEGORIES = {
  recent: {
    name: 'Recentes',
    emojis: ['😀', '😂', '🥰', '😍', '🤔', '👍', '❤️', '🔥']
  },
  smileys: {
    name: 'Rostos',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
      '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
      '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩'
    ]
  },
  gestures: {
    name: 'Gestos',
    emojis: [
      '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
      '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
      '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤝',
      '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂'
    ]
  },
  hearts: {
    name: 'Corações',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '♥️', '💌', '💋', '💍', '💎'
    ]
  },
  objects: {
    name: 'Objetos',
    emojis: [
      '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽',
      '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
      '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
      '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳'
    ]
  }
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([])
  const pickerRef = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Filtrar emojis baseado na busca
  useEffect(() => {
    if (searchTerm) {
      const allEmojis = Object.values(EMOJI_CATEGORIES).flatMap(cat => cat.emojis)
      setFilteredEmojis(allEmojis.filter(emoji => 
        emoji.includes(searchTerm.toLowerCase())
      ))
    } else {
      setFilteredEmojis([])
    }
  }, [searchTerm])

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    onClose()
  }

  const currentEmojis = searchTerm 
    ? filteredEmojis 
    : EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES]?.emojis || []

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={pickerRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full right-0 mb-2 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
        >
          {/* Header com busca */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emoji..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categorias */}
          {!searchTerm && (
            <div className="flex border-b border-gray-100 bg-gray-50">
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex-1 py-2 px-1 text-xs font-medium transition-colors ${
                    activeCategory === key
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Grid de emojis */}
          <div className="flex-1 overflow-y-auto p-3">
            {currentEmojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-1">
                {currentEmojis.map((emoji, index) => (
                  <motion.button
                    key={`${emoji}-${index}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                {searchTerm ? 'Nenhum emoji encontrado' : 'Selecione uma categoria'}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EmojiPicker
