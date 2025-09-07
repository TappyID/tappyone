'use client'

import AdminLayout from './components/AdminLayout'
import AnalyticsHub from './components/AnalyticsHub'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Activity,
  Shield,
  Settings,
  BarChart3
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Chart Data
const revenueData = [
  { month: 'Jan', value: 40 },
  { month: 'Fev', value: 68 },
  { month: 'Mar', value: 85 },
  { month: 'Abr', value: 73 },
  { month: 'Mai', value: 56 },
  { month: 'Jun', value: 67 },
  { month: 'Jul', value: 87 }
]

const usersData = [
  { month: 'Jan', users: 850 },
  { month: 'Fev', users: 920 },
  { month: 'Mar', users: 1050 },
  { month: 'Abr', users: 1180 },
  { month: 'Mai', users: 1100 },
  { month: 'Jun', users: 1200 },
  { month: 'Jul', users: 1234 }
]

const performanceData = [
  { day: 'Seg', responseTime: 120, uptime: 99.2 },
  { day: 'Ter', responseTime: 98, uptime: 99.8 },
  { day: 'Qua', responseTime: 145, uptime: 98.5 },
  { day: 'Qui', responseTime: 110, uptime: 99.1 },
  { day: 'Sex', responseTime: 95, uptime: 99.9 },
  { day: 'Sáb', responseTime: 88, uptime: 99.7 },
  { day: 'Dom', responseTime: 102, uptime: 99.3 }
]

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#273155] dark:to-[#1e2442]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#273155] dark:border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const stats = [
    {
      title: 'Total Usuários',
      value: '1,234',
      change: '+20% desde o mês passado',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Mensagens',
      value: '12,345',
      change: '+180 desde ontem',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Performance',
      value: '98.5%',
      change: '+2% desde semana passada',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Sistema',
      value: 'Online',
      change: 'Todos os serviços funcionando',
      icon: Settings,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ]

  return (
    <AdminLayout>
      {/* Welcome Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-[#273155] to-[#1e2442] rounded-2xl p-8 text-white">
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Bem-vindo de volta, {user.nome}! 👋
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Aqui está um resumo do que está acontecendo no seu CRM hoje.
          </motion.p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (index * 0.1) }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-card dark:border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <motion.div
                  className={`p-2 rounded-lg ${stat.bgColor}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-card-foreground mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Hub */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <AnalyticsHub />
      </motion.div>
    </AdminLayout>
  )
}
