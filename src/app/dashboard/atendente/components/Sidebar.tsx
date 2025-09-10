'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Zap, 
  Kanban, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  MessageCircle, 
  Bot,
  Ticket
} from 'lucide-react'
import { SidebarLogo } from './SidebarLogo'
import { SidebarToggle } from './SidebarToggle'
import { SidebarItem } from './SidebarItem'
import './sidebar-scrollbar.css'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard/atendente',
    color: 'text-blue-600'
  },
  {
    title: 'Atendimentos',
    icon: MessageSquare,
    href: '/dashboard/atendente/atendimentos',
    color: 'text-green-600'
  },
  {
    title: 'Kanban',
    icon: Kanban,
    href: '/dashboard/atendente/kanban',
    color: 'text-purple-600'
  },
  {
    title: 'Contatos',
    icon: Users,
    href: '/dashboard/atendente/contatos',
    color: 'text-indigo-600'
  },
  {
    title: 'Agendamentos',
    icon: Calendar,
    href: '/dashboard/atendente/agendamentos',
    color: 'text-pink-600'
  },
  {
    title: 'Orçamentos',
    icon: FileText,
    href: '/dashboard/atendente/orcamentos',
    color: 'text-orange-600'
  },
  {
    title: 'Assinaturas',
    icon: CreditCard,
    href: '/dashboard/atendente/assinaturas',
    color: 'text-emerald-600'
  },
  {
    title: 'Respostas Rápidas',
    icon: Zap,
    href: '/dashboard/atendente/respostas-rapidas',
    color: 'text-yellow-600'
  },
  {
    title: 'Chat Interno',
    icon: MessageCircle,
    href: '/dashboard/atendente/chat-interno',
    color: 'text-cyan-600'
  },
  {
    title: 'Tickets',
    icon: Ticket,
    href: '/dashboard/atendente/tickets',
    color: 'text-red-600'
  },
  {
    title: 'Agentes',
    icon: Bot,
    href: '/dashboard/atendente/agentes',
    color: 'text-violet-600'
  }
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])

  const toggleSubmenu = (title: string) => {
    if (isCollapsed) return
    
    setOpenSubmenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isSubmenuOpen = (title: string) => openSubmenus.includes(title)
  
  const isSubmenuItemActive = (children: any[]) => {
    return children?.some(child => pathname === child.href)
  }

  return (
    <motion.div
      className="relative h-screen shadow-xl shadow-black/5"
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 280,
        backgroundColor: isCollapsed ? "#f9fafb" : "#273155"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23273155' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Toggle Button */}
      <SidebarToggle isCollapsed={isCollapsed} onToggle={onToggle} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Logo */}
        <motion.div 
          className="border-b"
          animate={{
            borderColor: isCollapsed ? "rgb(229 231 235 / 0.5)" : "rgb(255 255 255 / 0.1)"
          }}
        >
          <SidebarLogo isCollapsed={isCollapsed} />
        </motion.div>

        {/* Navigation */}
        <motion.nav 
          className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-nav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href || item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.1 + (index * 0.02),
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <SidebarItem
                icon={item.icon}
                title={item.title}
                href={item.href}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
                color={item.color}
              />
            </motion.div>
          ))}
        </motion.nav>

        {/* Footer */}
        <motion.div 
          className="p-4 border-t"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            borderColor: isCollapsed ? "rgb(229 231 235 / 0.5)" : "rgb(255 255 255 / 0.1)"
          }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="text-center"
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.p 
              className="text-xs font-medium"
              animate={{
                color: isCollapsed ? "rgb(107 114 128)" : "rgb(255 255 255 / 0.7)"
              }}
            >
              TappyOne CRM v2.0
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 pointer-events-none" />
    </motion.div>
  )
}

export default Sidebar
