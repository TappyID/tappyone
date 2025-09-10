'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallbackRoute?: string
}

export function RoleGuard({ children, allowedRoles, fallbackRoute }: RoleGuardProps) {
  const { user, loading, isAuthenticated, getDashboardRoute } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        // Não autenticado - redirecionar para login
        router.push('/login')
        return
      }

      // Verificar se o usuário tem permissão para acessar esta rota
      const hasPermission = allowedRoles.includes(user.tipo) || allowedRoles.includes('ADMIN') && user.tipo === 'ADMIN'
      
      if (!hasPermission) {
        // Usuário não tem permissão - redirecionar para dashboard apropriado
        const userDashboard = fallbackRoute || getDashboardRoute(user.tipo)
        router.push(userDashboard)
        return
      }
    }
  }, [user, loading, isAuthenticated, allowedRoles, fallbackRoute, router, getDashboardRoute])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Usuário não autenticado
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // Verificar permissão
  const hasPermission = allowedRoles.includes(user.tipo) || (allowedRoles.includes('ADMIN') && user.tipo === 'ADMIN')
  
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Acesso negado. Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Usuário tem permissão - mostrar conteúdo
  return <>{children}</>
}
