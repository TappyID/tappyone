'use client'

import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

interface SubscriptionButtonProps {
  sidebarCollapsed?: boolean
}

export function SubscriptionButton({ sidebarCollapsed = true }: SubscriptionButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/admin/assinaturas')
  }

  // Simular algumas assinaturas com problemas
  const expiredSubscriptions = 1

  return (
    <TopBarButton
      icon={CreditCard}
      onClick={handleClick}
      sidebarCollapsed={sidebarCollapsed}
      badge={expiredSubscriptions > 0 ? expiredSubscriptions : false}
      badgeColor="bg-red-500"
      tooltip="Assinaturas"
    />
  )
}
