'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  icon: LucideIcon
  title: string
  href: string
  isActive: boolean
  isCollapsed: boolean
  color: string
  isSubmenuItem?: boolean
}

export function SidebarItem({ 
  icon: Icon, 
  title, 
  href, 
  isActive, 
  isCollapsed, 
  color,
  isSubmenuItem = false
}: SidebarItemProps) {
  return (
    <motion.div
      whileHover={{ scale: isCollapsed ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <Link href={href}>
        <motion.div
          className={cn(
            "group relative flex items-center rounded-xl transition-all duration-300 ease-out overflow-hidden",
            "active:scale-[0.98]",
            isCollapsed ? "p-3 justify-center" : "p-3 gap-3",
            isSubmenuItem ? "ml-2 py-2 px-3 rounded-lg" : "",
            isActive 
              ? (isCollapsed ? "bg-white text-[#273155] shadow-lg" : "bg-white/10 text-white shadow-lg")
              : (isCollapsed ? "text-gray-600 hover:bg-white/80 hover:text-gray-900" : "text-white/70 hover:bg-white/5 hover:text-white")
          )}
          whileHover={!isSubmenuItem ? { x: isCollapsed ? 0 : 2 } : {}}
        >
          {/* Indicador ativo */}
          {isActive && (
            <motion.div
              className={cn(
                "absolute left-0 top-1/2 h-6 w-1 rounded-r-full",
                isCollapsed ? "bg-[#273155]" : "bg-white"
              )}
              layoutId={isSubmenuItem ? `submenu-indicator-${title}` : "activeIndicator"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Ícone com Background */}
          <motion.div
            className={cn(
              "relative flex items-center justify-center rounded-lg transition-all duration-200",
              isCollapsed ? "p-2" : "p-2",
              isActive 
                ? (isCollapsed ? "bg-[#273155]/10 shadow-sm" : "bg-white/20 shadow-sm")
                : (isCollapsed ? "bg-gray-100 group-hover:bg-gray-200" : "bg-white/10 group-hover:bg-white/15")
            )}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Icon
              className={cn(
                "transition-all duration-300",
                isActive 
                  ? (isCollapsed ? `${color} drop-shadow-sm` : "text-white drop-shadow-sm")
                  : (isCollapsed ? "text-gray-600 group-hover:text-gray-900" : "text-white/70 group-hover:text-white")
              )}
              size={isCollapsed ? 20 : 18}
              strokeWidth={isActive ? 2.5 : 2}
            />
            
            {/* Glow effect no hover */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                isActive ? color.replace('text-', 'bg-') : "bg-gray-400"
              )}
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.2 }}
            />
          </motion.div>

          {/* Título */}
          {!isCollapsed && (
            <motion.span
              className={cn(
                "font-medium text-sm transition-all duration-300 select-none",
                isActive 
                  ? (isCollapsed ? "text-[#273155] font-semibold" : "text-white font-semibold")
                  : (isCollapsed ? "text-gray-700 group-hover:text-gray-900" : "text-white/80 group-hover:text-white")
              )}
              initial={false}
              animate={{
                opacity: isCollapsed ? 0 : 1,
                x: isCollapsed ? -10 : 0
              }}
              transition={{ duration: 0.2, delay: isCollapsed ? 0 : 0.1 }}
            >
              {title}
            </motion.span>
          )}

          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-xl overflow-hidden"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.2 }}
          >
            <div className={cn(
              "w-full h-full rounded-xl",
              isCollapsed ? "bg-[#273155]" : "bg-white"
            )} />
          </motion.div>
          
          {/* Background gradient */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100",
              isCollapsed 
                ? "bg-gradient-to-r from-gray-100/50 to-transparent" 
                : "bg-gradient-to-r from-white/5 to-transparent"
            )}
            initial={{ x: -100 }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Tooltip para modo colapsado */}
          {isCollapsed && (
            <motion.div
              className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
            >
              {title}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  )
}
