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

interface SidebarAtendenteProps {
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

export function SidebarAtendente({ isCollapsed, onToggle }: SidebarAtendenteProps) {
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

  return (
    <motion.div
      className={`relative flex flex-col h-screen bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <SidebarLogo isCollapsed={isCollapsed} />
        <SidebarToggle isCollapsed={isCollapsed} onToggle={onToggle} />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.title}>
              <SidebarItem
                icon={item.icon}
                title={item.title}
                href={item.href}
                isCollapsed={isCollapsed}
                isActive={pathname === item.href}
                color={item.color}
              />
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Atendente
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Painel do Atendente
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default SidebarAtendente
