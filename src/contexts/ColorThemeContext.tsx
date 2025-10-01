'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ColorTheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  colors: string[]
}

const colorThemes: ColorTheme[] = [
  {
    id: 'default',
    name: 'Azul Padrão',
    primary: '#273155',
    secondary: '#3b82f6',
    accent: '#1e40af',
    colors: ['#273155', '#3b82f6', '#1e40af', '#1d4ed8']
  },
  {
    id: 'ocean',
    name: 'Oceano',
    primary: '#305e73',
    secondary: '#3a6d84',
    accent: '#2a5363',
    colors: ['#305e73', '#3a6d84', '#2a5363', '#1a4353']
  },
  {
    id: 'emerald',
    name: 'Esmeralda',
    primary: '#065f46',
    secondary: '#10b981',
    accent: '#059669',
    colors: ['#065f46', '#10b981', '#059669', '#047857']
  },
  {
    id: 'purple',
    name: 'Roxo Real',
    primary: '#581c87',
    secondary: '#a855f7',
    accent: '#9333ea',
    colors: ['#581c87', '#a855f7', '#9333ea', '#7c3aed']
  },
  {
    id: 'rose',
    name: 'Rosa Pink',
    primary: '#881337',
    secondary: '#f43f5e',
    accent: '#e11d48',
    colors: ['#881337', '#f43f5e', '#e11d48', '#be123c']
  },
  {
    id: 'orange',
    name: 'Laranja Vibrante',
    primary: '#9a3412',
    secondary: '#f97316',
    accent: '#ea580c',
    colors: ['#9a3412', '#f97316', '#ea580c', '#dc2626']
  },
  {
    id: 'teal',
    name: 'Azul-Verde',
    primary: '#134e4a',
    secondary: '#14b8a6',
    accent: '#0d9488',
    colors: ['#134e4a', '#14b8a6', '#0d9488', '#0f766e']
  },
  {
    id: 'cyan',
    name: 'Ciano Moderno',
    primary: '#155e75',
    secondary: '#06b6d4',
    accent: '#0891b2',
    colors: ['#155e75', '#06b6d4', '#0891b2', '#0e7490']
  },
  {
    id: 'indigo',
    name: 'Índigo Profundo',
    primary: '#3730a3',
    secondary: '#6366f1',
    accent: '#4f46e5',
    colors: ['#3730a3', '#6366f1', '#4f46e5', '#4338ca']
  }
]

interface ColorThemeContextType {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  colorThemes: ColorTheme[]
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined)

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(colorThemes[0])

  useEffect(() => {
    // Carregar tema de cores do localStorage
    const savedThemeId = localStorage.getItem('colorTheme')
    if (savedThemeId) {
      const savedTheme = colorThemes.find(t => t.id === savedThemeId)
      if (savedTheme) {
        setColorTheme(savedTheme)
      }
    }
  }, [])

  useEffect(() => {
    // Aplicar variáveis CSS customizadas
    const root = document.documentElement
    root.style.setProperty('--color-primary', colorTheme.primary)
    root.style.setProperty('--color-secondary', colorTheme.secondary)
    root.style.setProperty('--color-accent', colorTheme.accent)
  }, [colorTheme])

  const handleSetColorTheme = (newTheme: ColorTheme) => {
    setColorTheme(newTheme)
    localStorage.setItem('colorTheme', newTheme.id)
  }

  return (
    <ColorThemeContext.Provider value={{ 
      colorTheme, 
      setColorTheme: handleSetColorTheme, 
      colorThemes 
    }}>
      {children}
    </ColorThemeContext.Provider>
  )
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext)
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider')
  }
  return context
}
