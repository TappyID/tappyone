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
