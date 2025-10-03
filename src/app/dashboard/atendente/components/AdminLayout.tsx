'use client'

import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useTheme } from '@/contexts/ThemeContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { actualTheme } = useTheme()

  return (
    <div className={`min-h-screen flex transition-all duration-500 ${
      actualTheme === 'dark' 
        ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Sidebar - Fixed, expande ao hover */}
      <div className="fixed left-0 top-0 z-40 h-screen">
        <Sidebar />
      </div>

      {/* Main Content - Largura total com margem fixa para sidebar */}
      <div className="flex-1 flex flex-col ml-20">
        {/* TopBar */}
        <TopBar />

        {/* Page Content */}
        <motion.main
          className="flex-1 overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-6">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export default AdminLayout
