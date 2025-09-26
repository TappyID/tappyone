'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useTheme } from '@/contexts/ThemeContext'

interface AtendenteLayoutProps {
  children: React.ReactNode
}

export function AtendenteLayout({ children }: AtendenteLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { actualTheme } = useTheme()

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className={`min-h-screen flex transition-all duration-500 ${
      actualTheme === 'dark' 
        ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-40">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <TopBar sidebarCollapsed={sidebarCollapsed} />

        {/* Page Content */}
        <motion.main
          className="flex-1 overflow-auto"
          initial={false}
          animate={{ 
            marginLeft: sidebarCollapsed ? 80 : 280 
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            mass: 0.8
          }}
        >
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
}

export default AtendenteLayout
