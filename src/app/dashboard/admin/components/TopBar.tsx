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

interface TopBarProps {
  sidebarCollapsed: boolean
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  return (
    <motion.header
      className="h-16 backdrop-blur-md border-b shadow-sm sticky top-0 z-30"
      initial={false}
      animate={{ 
        marginLeft: sidebarCollapsed ? 80 : 280,
        backgroundColor: sidebarCollapsed ? 'rgba(255, 255, 255, 0.8)' : 'rgba(39, 49, 85, 0.95)',
        borderBottomColor: sidebarCollapsed ? 'rgba(229, 231, 235, 0.6)' : 'rgba(59, 130, 246, 0.3)',
        color: sidebarCollapsed ? '#1e293b' : '#ffffff'
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8
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
          <SearchBar sidebarCollapsed={sidebarCollapsed} />
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
              <QuickResponsesButton sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AgendaButton sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
            >
              <QuoteButton sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <SubscriptionButton sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            {/* Divider */}
            <div className={`mx-3 h-8 w-px ${
              sidebarCollapsed ? 'bg-gray-200/60' : 'bg-white/30'
            }`}></div>

            {/* System Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
            >
              <NotificationsDropdown sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <LanguageSelector sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
            >
              <ThemeToggle sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <ColorThemeSelector sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 }}
            >
              <ChatToggle sidebarCollapsed={sidebarCollapsed} />
            </motion.div>

            {/* Glass Clock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <GlassClock sidebarCollapsed={sidebarCollapsed} />
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
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 ${
              sidebarCollapsed ? 'bg-gray-200/60' : 'bg-white/30'
            }`} />
            <ProfileDropdown sidebarCollapsed={sidebarCollapsed} />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none" />
    </motion.header>
  )
}

export default TopBar
