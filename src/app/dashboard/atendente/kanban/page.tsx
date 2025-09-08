'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Importar o kanban do admin dinamicamente para reutilizar
const KanbanPage = dynamic(() => import('../../admin/kanban/page'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#305e73]"></div>
    </div>
  )
})

export default function AtendenteKanbanPage() {
  const { user, isAuthenticated, loading } = useAuth()
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

  // Verificar se é atendente
  if (!user.tipo.startsWith('ATENDENTE_')) {
    router.push('/dashboard/admin')
    return null
  }

  return <KanbanPage />
}
