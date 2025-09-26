'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#273155]"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Layout especial para usuários - sem sidebar, apenas topbar
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {children}
    </div>
  )
}
