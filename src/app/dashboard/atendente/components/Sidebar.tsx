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
  Tag, 
  MessageCircle, 
  Bot,
  LinkIcon, 
  Brain, 
  GitBranch, 
  HelpCircle, 
  Megaphone, 
  UsersIcon, 
  BarChart3, 
  Settings,
  Plug,
  ChevronDown,
  ChevronRight,
  Workflow,
  Ticket,
  TrendingUp,
  Heart,
  DollarSign,
  UserCheck,
  Circle,
  UserX,
  Bell,
  List
} from 'lucide-react'
import { SidebarLogo } from './SidebarLogo'
import { SidebarToggle } from './SidebarToggle'
import { SidebarItem } from './SidebarItem'
import './sidebar-scrollbar.css'
import { useColorTheme } from '@/contexts/ColorThemeContext'

interface SidebarProps {}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard/atendente',
    color: 'text-blue-600',
    badge: null
  },
  {
    title: 'Atendimentos',
    icon: MessageSquare,
    href: '/dashboard/atendente/atendimento',
    color: 'text-green-600',
    badge: 12,
    badgeColor: 'from-green-400 to-green-600'
  },
  {
    title: 'Kanban',
    icon: Kanban,
    href: '/dashboard/atendente/kanban',
    color: 'text-purple-600',
    badge: 8,
    badgeColor: 'from-purple-400 to-purple-600'
  },
  {
    title: 'Respostas Rápidas',
    icon: Zap,
    href: '/dashboard/atendente/respostas-rapidas',
    color: 'text-yellow-600',
    badge: 24,
    badgeColor: 'from-yellow-400 to-yellow-600'
  },
 
  {
    title: 'Contatos',
    icon: Users,
    href: '/dashboard/atendente/contatos',
    color: 'text-indigo-600',
    badge: 156,
    badgeColor: 'from-indigo-400 to-indigo-600'
  },
  {
    title: 'Agendamentos',
    icon: Calendar,
    href: '/dashboard/atendente/agendamentos',
    color: 'text-pink-600',
    badge: 5,
    badgeColor: 'from-pink-400 to-pink-600'
  },
  {
    title: 'Orçamentos',
    icon: FileText,
    href: '/dashboard/atendente/orcamentos',
    color: 'text-orange-600',
    badge: 3,
    badgeColor: 'from-orange-400 to-orange-600'
  },
  
  {
    title: 'Chat Interno',
    icon: MessageCircle,
    href: '/dashboard/atendente/chat-interno',
    color: 'text-cyan-600',
    badge: 2,
    badgeColor: 'from-cyan-400 to-cyan-600'
  },
  
  {
    title: 'Meu perfil',
    icon: Settings,
    href: '/dashboard/atendente/configuracoes',
    color: 'text-slate-600',
    badge: null
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const { colorTheme } = useColorTheme()

  const toggleSubmenu = (title: string) => {
    if (!isHovered) return
    
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ 
        width: isHovered ? 280 : 80,
        backgroundImage: `linear-gradient(180deg, ${colorTheme.primary}, ${colorTheme.secondary})`,
        opacity: isHovered ? 1 : 0.95
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

      {/* Toggle Button - Removido, expande ao hover */}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Logo */}
        <motion.div 
          className="border-b border-white/10"
        >
          <SidebarLogo isCollapsed={!isHovered} />
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
                isCollapsed={!isHovered}
                color={item.color}
                badge={item.badge}
                badgeColor={item.badgeColor}
              />
            </motion.div>
          ))}
        </motion.nav>

        {/* Footer */}
        <motion.div 
          className="p-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1
          }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="text-center"
            animate={{ opacity: !isHovered ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-medium text-white/70">
              TappyOne CRM v2.0
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 pointer-events-none" />
    </motion.div>
  )
}

export default Sidebar
