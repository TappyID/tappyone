'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface SidebarLogoProps {
  isCollapsed: boolean
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <Link href="/dashboard/admin">
      <motion.div
        className="flex items-center gap-3 h-16 px-4 group cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Logo */}
        {isCollapsed && (
          <motion.div
            className="relative flex-shrink-0"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
          <div className="w-10 h-10 bg-gradient-to-br from-[#273155] to-[#1e2442] rounded-xl flex items-center justify-center shadow-lg">
            <motion.div
              initial={{ scale: 1.05 }}
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Image
                src="/favicon-white.svg"
                alt="TappyOne Icon"
                width={25}
                height={25}
                className="object-contain"
              />
            </motion.div>
          </div>
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-[#273155] rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.2 }}
          />
          </motion.div>
        )}

        {/* Logo SVG */}
        <motion.div
          className="flex items-center overflow-hidden"
          initial={false}
          animate={{
            opacity: isCollapsed ? 0 : 1,
            x: isCollapsed ? -20 : 0,
            width: isCollapsed ? 0 : "auto"
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Image
              src="/logo-branca.svg"
              alt="TappyOne Logo"
              width={147}
              height={38}
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </Link>
  )
}
