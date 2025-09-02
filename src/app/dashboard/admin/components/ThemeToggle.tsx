'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { TopBarButton } from './TopBarButton'

interface ThemeToggleProps {
  sidebarCollapsed?: boolean
}

export function ThemeToggle({ sidebarCollapsed = true }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: 'light' as const, name: 'Claro', icon: Sun },
    { id: 'dark' as const, name: 'Escuro', icon: Moon },
    { id: 'system' as const, name: 'Sistema', icon: Monitor }
  ]

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex(t => t.id === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].id)
  }

  const getCurrentIcon = () => {
    const currentTheme = themes.find(t => t.id === theme)
    return currentTheme?.icon || Sun
  }

  const CurrentIcon = getCurrentIcon()

  return (
    <TopBarButton
      icon={CurrentIcon}
      onClick={handleThemeChange}
      sidebarCollapsed={sidebarCollapsed}
      tooltip={`Tema: ${themes.find(t => t.id === theme)?.name}`}
    />
  )
}
