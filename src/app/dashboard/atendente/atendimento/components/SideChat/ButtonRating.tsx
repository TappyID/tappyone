'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Heart } from 'lucide-react'

interface ButtonRatingProps {
  rating?: number // 1-5 stars
  onClick?: (e: React.MouseEvent) => void
  type?: 'star' | 'heart'
  showBadge?: boolean
}

export default function ButtonRating({ 
  rating, 
  onClick, 
  type = 'star',
  showBadge = true 
}: ButtonRatingProps) {
  if (!rating || rating === 0) return null

  const IconComponent = type === 'heart' ? Heart : Star
  
  // Cores baseadas no rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500 bg-green-100'
    if (rating >= 3.5) return 'text-yellow-500 bg-yellow-100'
    if (rating >= 2.5) return 'text-orange-500 bg-orange-100'
    return 'text-red-500 bg-red-100'
  }

  const colorClass = getRatingColor(rating)

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${colorClass}`}
      title={`Avaliação: ${rating}/5`}
    >
      <div className="flex items-center gap-0.5">
        <IconComponent className="w-3 h-3 fill-current" />
        {showBadge && (
          <span className="text-xs font-bold">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    </motion.button>
  )
}
