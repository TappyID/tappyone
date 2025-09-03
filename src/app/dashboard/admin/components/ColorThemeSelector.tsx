'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import { TopBarButton } from './TopBarButton'

interface ColorThemeSelectorProps {
  sidebarCollapsed?: boolean
}

export function ColorThemeSelector({ sidebarCollapsed = true }: ColorThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme()

  const handleThemeSelect = (theme: any) => {
    setColorTheme(theme)
    setIsOpen(false)
  }

  
}
