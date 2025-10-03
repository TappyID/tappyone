'use client'

import { useState, useEffect } from 'react'

export interface KanbanColors {
  board: {
    bgPrimary: string
    bgSecondary: string
    bgImage?: string
  }
  columns: {
    bgPrimary: string
    bgSecondary: string
    border: string
  }
  cards: {
    bgPrimary: string
    bgSecondary: string
    border: string
    hoverBg: string
  }
}

const defaultColors: KanbanColors = {
  board: {
    bgPrimary: '#273155',
    bgSecondary: '#2a3660',
    bgImage: ''
  },
  columns: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    border: '#e2e8f0'
  },
  cards: {
    bgPrimary: '#ffffff',
    bgSecondary: '#fefefe',
    border: '#e5e7eb',
    hoverBg: '#f9fafb'
  }
}

export function useKanbanColors() {
  const [colors, setColors] = useState<KanbanColors>(defaultColors)

  useEffect(() => {
    // Carregar cores do localStorage
    const savedColors = localStorage.getItem('kanbanColors')
    if (savedColors) {
      try {
        setColors(JSON.parse(savedColors))
      } catch (e) {
        console.error('Erro ao carregar cores:', e)
      }
    }

    // Listener para mudanças nas cores
    const handleColorsChanged = () => {
      const savedColors = localStorage.getItem('kanbanColors')
      if (savedColors) {
        try {
          setColors(JSON.parse(savedColors))
        } catch (e) {
          console.error('Erro ao carregar cores:', e)
        }
      } else {
        setColors(defaultColors)
      }
    }

    window.addEventListener('kanbanColorsChanged', handleColorsChanged)
    return () => window.removeEventListener('kanbanColorsChanged', handleColorsChanged)
  }, [])

  return colors
}
