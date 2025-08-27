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

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard/admin',
    color: 'text-blue-600'
  },
  {
    title: 'Atendimentos',
    icon: MessageSquare,
    href: '/dashboard/admin/atendimentos',
    color: 'text-green-600'
  },
  {
    title: 'Respostas Rápidas',
    icon: Zap,
    href: '/dashboard/admin/respostas-rapidas',
    color: 'text-yellow-600'
  },
  {
    title: 'Kanban',
    icon: Kanban,
    href: '/dashboard/admin/kanban',
    color: 'text-purple-600'
  },
  {
    title: 'Atendentes',
    icon: Users,
    color: 'text-teal-600',
    isSubmenu: true,
   
  },
  {
    title: 'Contatos',
    icon: Users,
    href: '/dashboard/admin/contatos',
    color: 'text-indigo-600'
  },
  {
    title: 'Agendamentos',
    icon: Calendar,
    href: '/dashboard/admin/agendamentos',
    color: 'text-pink-600'
  },
  {
    title: 'Orçamentos',
    icon: FileText,
    href: '/dashboard/admin/orcamentos',
    color: 'text-orange-600'
  },
  {
    title: 'Assinaturas',
    icon: CreditCard,
    href: '/dashboard/admin/assinaturas',
    color: 'text-emerald-600'
  },
  {
    title: 'Tags',
    icon: Tag,
    href: '/dashboard/admin/tags',
    color: 'text-red-600'
  },
  {
    title: 'Alertas',
    icon: Bell,
    href: '/dashboard/admin/alertas',
    color: 'text-amber-600'
  },
  {
    title: 'Filas',
    icon: List,
    href: '/dashboard/admin/filas',
    color: 'text-slate-600'
  },
  {
    title: 'Chat Interno',
    icon: MessageCircle,
    href: '/dashboard/admin/chat-interno',
    color: 'text-cyan-600'
  },
  {
    title: 'Fluxos',
    icon: Workflow,
    color: 'text-teal-600',
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
              {item.isSubmenu ? (
                <div>
                  {/* Submenu Header */}
                  <motion.div
                    whileHover={{ scale: isCollapsed ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <motion.button
                      onClick={() => toggleSubmenu(item.title)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden ${
                        isSubmenuItemActive(item.children) || isSubmenuOpen(item.title)
                          ? 'bg-white/10 text-white shadow-lg'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
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
                          className={`p-2 rounded-lg transition-all duration-200 relative ${
                            isSubmenuItemActive(item.children) || isSubmenuOpen(item.title)
                              ? 'bg-white/20 shadow-sm'
                              : 'bg-white/10 group-hover:bg-white/15'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <item.icon className={`w-5 h-5 ${item.color} transition-all duration-300`} strokeWidth={isSubmenuItemActive(item.children) || isSubmenuOpen(item.title) ? 2.5 : 2} />
                          
                          {/* Glow effect */}
                          <motion.div
                            className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${item.color.replace('text-', 'bg-')}`}
                            initial={{ scale: 0.8 }}
                            whileHover={{ scale: 1.2 }}
                          />
                        </motion.div>
                        
                        {!isCollapsed && (
                          <motion.span 
                            className={`font-medium text-sm transition-all duration-300 select-none ${
                              isSubmenuItemActive(item.children) || isSubmenuOpen(item.title)
                                ? 'text-white font-semibold'
                                : 'text-white/80 group-hover:text-white'
                            }`}
                            initial={false}
                            animate={{
                              opacity: isCollapsed ? 0 : 1,
                              x: isCollapsed ? -10 : 0
                            }}
                            transition={{ duration: 0.2, delay: isCollapsed ? 0 : 0.1 }}
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </div>
                      
                      {!isCollapsed && (
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
                    {isCollapsed && (
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
                  {!isCollapsed && (
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
                  isCollapsed={isCollapsed}
                  color={item.color}
                />
              )}
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
