'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface SidebarLogoProps {
  isCollapsed: boolean
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  return (
    <Link href="/dashboard/admin">
      <motion.div
        className="flex items-center gap-3 p-4 group cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Logo */}
        <motion.div
          className="relative flex-shrink-0"
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#273155] to-[#1e2442] rounded-xl flex items-center justify-center shadow-lg">
            <motion.div
              className="text-white font-bold text-lg"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              T
            </motion.div>
          </div>
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-[#273155] rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.2 }}
          />
        </motion.div>

        {/* Texto */}
        <motion.div
          className="flex flex-col overflow-hidden"
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            x: isCollapsed ? -20 : 0,
            width: isCollapsed ? 0 : "auto"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.h1
            className="text-xl font-bold leading-none"
            initial={{ y: 0 }}
            animate={{ color: isCollapsed ? "rgb(17 24 39)" : "rgb(255 255 255)" }}
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            TappyOne
          </motion.h1>
          <motion.p
            className="text-xs font-medium"
            initial={{ opacity: 0.7 }}
            animate={{ 
              opacity: 1,
              color: isCollapsed ? "rgb(107 114 128)" : "rgb(255 255 255 / 0.7)"
            }}
            whileHover={{ opacity: 1 }}
          >
            CRM Dashboard
          </motion.p>
        </motion.div>
      </motion.div>
    </Link>
  )
}
