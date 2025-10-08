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
  List,
  Send
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
    href: '/dashboard/admin',
    color: 'text-blue-600',
    badge: null
  },
  {
    title: 'Atendimentos',
    icon: MessageSquare,
    href: '/dashboard/admin/atendimento',
    color: 'text-green-600',
    badge: 28,
    badgeColor: 'from-green-400 to-green-600'
  },
  
  {
    title: 'Kanban',
    icon: Kanban,
    href: '/dashboard/admin/kanban',
    color: 'text-purple-600',
    badge: 15,
    badgeColor: 'from-purple-400 to-purple-600'
  },
  {
    title: 'Filas',
    icon: List,
    href: '/dashboard/admin/filas',
    color: 'text-slate-600',
    badge: 6,
    badgeColor: 'from-slate-400 to-slate-600'
  },
  
  {
    title: 'Atendentes',
    icon: Users,
    href: '/dashboard/admin/atendentes',
    color: 'text-teal-600',
    badge: 8,
    badgeColor: 'from-teal-400 to-teal-600'
  },
  {
    title: 'Agentes',
    icon: Bot,
    href: '/dashboard/admin/agentes',
    color: 'text-cyan-600',
    badge: 6,
    badgeColor: 'from-cyan-400 to-cyan-600'
  },
  {
    title: 'Respostas Rápidas',
    icon: Zap,
    href: '/dashboard/admin/respostas-rapidas',
    color: 'text-yellow-600',
    badge: 45,
    badgeColor: 'from-yellow-400 to-yellow-600'
  },
  {
    title: 'Disparos',
    icon: Send,
    href: '/dashboard/admin/disparos',
    color: 'text-violet-600',
    badge: null,
    badgeColor: 'from-violet-400 to-violet-600'
  },
  {
    title: 'Contatos',
    icon: Users,
    href: '/dashboard/admin/contatos',
    color: 'text-indigo-600',
    badge: 342,
    badgeColor: 'from-indigo-400 to-indigo-600'
  },
  {
    title: 'Agendamentos',
    icon: Calendar,
    href: '/dashboard/admin/agendamentos',
    color: 'text-pink-600',
    badge: 12,
    badgeColor: 'from-pink-400 to-pink-600'
  },
  {
    title: 'Orçamentos',
    icon: FileText,
    href: '/dashboard/admin/orcamentos',
    color: 'text-orange-600',
    badge: 7,
    badgeColor: 'from-orange-400 to-orange-600'
  },
  {
    title: 'Assinaturas',
    icon: CreditCard,
    href: '/dashboard/admin/assinaturas',
    color: 'text-emerald-600',
    badge: 23,
    badgeColor: 'from-emerald-400 to-emerald-600'
  },
  {
    title: 'Tags',
    icon: Tag,
    href: '/dashboard/admin/tags',
    color: 'text-red-600',
    badge: 18,
    badgeColor: 'from-red-400 to-red-600'
  },
  {
    title: 'Alertas',
    icon: Bell,
    href: '/dashboard/admin/alertas',
    color: 'text-amber-600',
    badge: 4,
    badgeColor: 'from-amber-400 to-amber-600'
  },
  
  {
    title: 'Tickets',
    icon: Ticket,
    href: '/dashboard/admin/tickets',
    color: 'text-blue-600',
    badge: 9,
    badgeColor: 'from-blue-400 to-blue-600'
  },
  {
    title: 'Chat Interno',
    icon: MessageCircle,
    href: '/dashboard/admin/chat-interno',
    color: 'text-cyan-600',
    badge: 5,
    badgeColor: 'from-cyan-400 to-cyan-600'
  },
  {
    title: 'Fluxos',
    icon: Workflow,
    color: 'text-teal-600',
    badge: 3,
    badgeColor: 'from-teal-400 to-teal-600',
    isSubmenu: true,
    children: [
      {
        title: 'Fluxo de Bot',
        icon: Bot,
        href: '/dashboard/admin/fluxograma',
        color: 'text-teal-600'
      },
      {
        title: 'Fluxo de I.A',
        icon: Brain,
        href: '/dashboard/admin/fluxograma',
        color: 'text-teal-600'
      },
      {
        title: 'Fluxo do Kanban',
        icon: GitBranch,
        href: '/dashboard/admin/fluxograma',
        color: 'text-teal-600'
      }
    ]
  },
  {
    title: 'Usuários',
    icon: UsersIcon,
    color: 'text-teal-600',
    badge: 47,
    badgeColor: 'from-violet-400 to-violet-600',
    isSubmenu: true,
    children: [
      {
        title: 'Administradores',
        icon: UsersIcon,
        href: '/dashboard/admin/usuarios/',
        color: 'text-teal-600'
      },
      {
        title: 'Atendentes',
        icon: Users,
        href: '/dashboard/admin/usuarios/',
        color: 'text-teal-600'
      },
      {
        title: 'Afiliados',
        icon: Users,
        href: '/dashboard/admin/usuarios/',
        color: 'text-teal-600'
      },
      {
        title: 'Assinantes',
        icon: CreditCard,
        href: '/dashboard/admin/usuarios/',
        color: 'text-teal-600'
      },
     
    ]
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    color: 'text-teal-600',
    badge: 12,
    badgeColor: 'from-blue-400 to-blue-600',
    isSubmenu: true,
    children: [
      {
        title: 'Performances',
        icon: TrendingUp,
        href: '/dashboard/admin/relatorios/performances',
        color: 'text-teal-600'
      },
      {
        title: 'NPS',
        icon: Heart,
        href: '/dashboard/admin/relatorios/nps',
        color: 'text-teal-600'
      },
      {
        title: 'Atendentes',
        icon: Users,
        href: '/dashboard/admin/relatorios/atendentes',
        color: 'text-teal-600'
      },
      {
        title: 'Vendas',
        icon: DollarSign,
        href: '/dashboard/admin/relatorios/vendas',
        color: 'text-teal-600'
      }
    ]
  },
  {
    title: 'Conexões',
    icon: LinkIcon,
    href: '/dashboard/admin/conexoes',
    color: 'text-blue-500'
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/dashboard/admin/configuracoes',
    color: 'text-slate-600'
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const { colorTheme } = useColorTheme()

  // ✅ Mesma função do TopBar para converter hex para rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

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
      className="relative h-screen shadow-xl shadow-black/5 backdrop-blur-xl"
      initial={false}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ 
        width: isHovered ? 280 : 80,
        backgroundImage: `linear-gradient(135deg, ${hexToRgba(colorTheme.primary, 0.75)}, ${hexToRgba(colorTheme.secondary, 0.75)})`,
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
              {item.isSubmenu ? (
                <div>
                  {/* Submenu Header */}
                  <motion.div
                    whileHover={{ scale: !isHovered ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <motion.button
                      onClick={() => toggleSubmenu(item.title)}
                      className={`w-full flex items-center backdrop-blur-sm transition-all duration-300 ease-out group relative overflow-hidden ${
                        !isHovered 
                          ? `p-3 justify-center rounded-lg ${
                              isSubmenuItemActive(item.children) || isSubmenuOpen(item.title)
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`
                          : `p-3 justify-between rounded-xl ${
                              isSubmenuItemActive(item.children) || isSubmenuOpen(item.title)
                                ? 'bg-white/10 text-white shadow-lg'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`
                      }`}
                    >
                      {/* Indicador ativo */}
                      {(isSubmenuItemActive(item.children) || isSubmenuOpen(item.title)) && (
                        <motion.div
                          className="absolute left-0 top-1/2 h-6 w-1 rounded-r-full bg-white"
                          layoutId="submenu-activeIndicator"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="relative"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="p-2 rounded-lg transition-all duration-200 relative bg-white/20">
                            <item.icon className="w-5 h-5 text-white transition-all duration-300 drop-shadow-sm" strokeWidth={isSubmenuItemActive(item.children) || isSubmenuOpen(item.title) ? 2.5 : 2} />
                            
                            {/* Badge no submenu */}
                            {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                className={`absolute ${!isHovered ? '-top-1.5 -right-1.5' : '-top-2 -right-2'} min-w-[16px] h-[16px] px-0.5 bg-gradient-to-br ${item.badgeColor || 'from-red-400 to-red-600'} rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/30`}
                              >
                                <span className="text-[8px] font-bold text-white drop-shadow-sm">
                                  {item.badge > 99 ? '99+' : item.badge}
                                </span>
                              </motion.div>
                            )}
                            
                            {/* ❌ REMOVIDO: Glow effect para sidebar mais limpa */}
                          </div>
                        </motion.div>
                        
                        {!!isHovered && (
                          <motion.span 
                            className={`text-sm font-medium truncate ${
                              pathname === item.href ||
                              isSubmenuItemActive(item.children) || isSubmenuOpen(item.title)
                                ? 'text-white font-semibold'
                                : 'text-white/80 group-hover:text-white'
                            }`}
                            initial={false}
                            animate={{
                              opacity: !isHovered ? 0 : 1,
                              x: !isHovered ? -10 : 0
                            }}
                            transition={{ duration: 0.2, delay: !isHovered ? 0 : 0.1 }}
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </div>
                      
                      {!!isHovered && (
                        <motion.div
                          animate={{ rotate: isSubmenuOpen(item.title) ? 90 : 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="flex items-center justify-center"
                        >
                          <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                            isSubmenuOpen(item.title) ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                          }`} />
                        </motion.div>
                      )}
                      
                      {/* Ripple effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl overflow-hidden"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 1, opacity: 0.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-full h-full bg-white rounded-xl" />
                      </motion.div>
                      
                      {/* Background gradient */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                        initial={{ x: -100 }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                    
                    {/* Tooltip para modo colapsado */}
                    {!isHovered && (
                      <motion.div
                        className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                      >
                        {item.title}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Submenu Items */}
                  {!!isHovered && (
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: isSubmenuOpen(item.title) ? 'auto' : 0,
                        opacity: isSubmenuOpen(item.title) ? 1 : 0
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-4">
                        {item.children?.map((child, childIndex) => (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                              opacity: isSubmenuOpen(item.title) ? 1 : 0,
                              x: isSubmenuOpen(item.title) ? 0 : -10
                            }}
                            transition={{ 
                              delay: isSubmenuOpen(item.title) ? childIndex * 0.05 : 0,
                              duration: 0.2
                            }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="relative"
                            >
                              <Link href={child.href}>
                                <motion.div
                                  className={`group relative flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${
                                    pathname === child.href
                                      ? 'bg-white/15 text-white shadow-sm'
                                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                                  }`}
                                  whileHover={{ x: 4 }}
                                >
                                  {/* Indicador ativo para submenu */}
                                  {pathname === child.href && (
                                    <motion.div
                                      className="absolute left-0 top-1/2 h-4 w-0.5 bg-white rounded-r-full"
                                      layoutId={`submenu-indicator-${item.title}`}
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                  )}
                                  
                                  {/* Ícone do submenu */}
                                  <div className={`p-1.5 rounded-md transition-all duration-200 ${
                                    pathname === child.href
                                      ? 'bg-white/20 shadow-sm'
                                      : 'bg-white/10 group-hover:bg-white/15'
                                  }`}>
                                    <child.icon className={`w-4 h-4 ${child.color}`} />
                                  </div>
                                  
                                  {/* Título do submenu */}
                                  <span className={`font-medium text-sm transition-all duration-200 ${
                                    pathname === child.href
                                      ? 'text-white font-semibold'
                                      : 'text-white/80 group-hover:text-white'
                                  }`}>
                                    {child.title}
                                  </span>
                                  
                                  {/* Efeito de hover */}
                                  <motion.div
                                    className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    initial={{ scale: 0.8 }}
                                    whileHover={{ scale: 1 }}
                                  />
                                </motion.div>
                              </Link>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
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
              )}
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

      {/* ❌ REMOVIDO: Gradient Overlay que causava luz extra */}
    </motion.div>
  )
}

export default Sidebar
