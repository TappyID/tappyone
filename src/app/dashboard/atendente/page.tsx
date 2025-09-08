'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  MessageCircle,
  UserCheck,
  ClipboardList,
  Tag,
  Home,
  Kanban,
  UserCircle
} from 'lucide-react'

export default function AtendenteDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#273155]"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Atendente</h1>
              <p className="text-gray-600">Bem-vindo, {user.nome}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <UserCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">{user.tipo}</span>
              </div>
              <Button onClick={logout} variant="outline">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <Link href="/dashboard/atendente" className="flex items-center gap-2 text-gray-900 font-medium">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link href="/dashboard/atendente/kanban" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Kanban className="h-4 w-4" />
              Kanban
            </Link>
            <Link href="/dashboard/atendente/atendimentos" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <MessageCircle className="h-4 w-4" />
              Atendimentos
            </Link>
            <Link href="/dashboard/atendente/contatos" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <UserCheck className="h-4 w-4" />
              Contatos
            </Link>
            <Link href="/dashboard/atendente/agendamentos" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Calendar className="h-4 w-4" />
              Agendamentos
            </Link>
            <Link href="/dashboard/atendente/tags" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Tag className="h-4 w-4" />
              Tags
            </Link>
            <Link href="/dashboard/atendente/respostas-rapidas" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ClipboardList className="h-4 w-4" />
              Respostas Rápidas
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 para hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">+5% desde semana passada</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos Recentes</CardTitle>
              <CardDescription>Seus últimos atendimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Lista de atendimentos será implementada aqui...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarefas Pendentes</CardTitle>
              <CardDescription>O que precisa ser feito</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Lista de tarefas será implementada aqui...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
