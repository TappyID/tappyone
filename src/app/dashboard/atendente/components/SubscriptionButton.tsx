'use client'

import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

export function SubscriptionButton() {
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
      badge={expiredSubscriptions > 0 ? expiredSubscriptions : false}
      badgeColor="bg-red-500"
      tooltip="Assinaturas"
    />
  )
}
