'use client'

import { motion } from 'framer-motion'
import { SearchBar } from './SearchBar'
import { NotificationsDropdown } from './NotificationsDropdown'
import { LanguageSelector } from './LanguageSelector'
import { AgendaButton } from './AgendaButton'
import { QuoteButton } from './QuoteButton'
import { SubscriptionButton } from './SubscriptionButton'
import { QuickResponsesButton } from './QuickResponsesButton'
import { ThemeToggle } from './ThemeToggle'
import { ColorThemeSelector } from './ColorThemeSelector'
import { ChatToggle } from './ChatToggle'
import { ProfileDropdown } from './ProfileDropdown'
import { GlassClock } from './GlassClock'
import { useColorTheme } from '@/contexts/ColorThemeContext'

export function TopBar() {
  const { colorTheme } = useColorTheme()
  
  // Converter hex para rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <motion.header
      className="h-16 backdrop-blur-xl border-b shadow-lg sticky top-0 z-30"
      style={{
        backgroundImage: `linear-gradient(135deg, ${hexToRgba(colorTheme.primary, 0.75)}, ${hexToRgba(colorTheme.secondary, 0.75)})`,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}
    >
      <div className="h-full px-8 flex items-center justify-between">
        {/* Left Section - Search */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar />
        </motion.div>

        {/* Right Section - Actions */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Access Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <QuickResponsesButton />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AgendaButton />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
            >
              <QuoteButton />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <SubscriptionButton />
            </motion.div>

            {/* Divider */}
            <div className="mx-3 h-8 w-px bg-white/30"></div>

            {/* System Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
            >
              <NotificationsDropdown />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <LanguageSelector />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
            >
              <ThemeToggle />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <ColorThemeSelector />
            </motion.div>

            {/* ChatToggle temporariamente comentado para debug
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 }}
            >
              <ChatToggle />
            </motion.div>
            */}

            {/* Glass Clock - com espaço maior antes */}
            <motion.div
              className="ml-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <GlassClock />
            </motion.div>
          </div>

          {/* Profile */}
          <motion.div
            className="ml-4 pl-4 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75 }}
          >
            {/* Smaller divider */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-white/30" />
            <ProfileDropdown />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none" />
    </motion.header>
  )
}

export default TopBar
