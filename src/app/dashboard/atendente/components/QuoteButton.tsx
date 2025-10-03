'use client'

import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

export function QuoteButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/admin/orcamentos')
  }

  // Simular alguns orçamentos pendentes
  const pendingQuotes = 2

  return (
    <TopBarButton
      icon={FileText}
      onClick={handleClick}
      badge={pendingQuotes > 0 ? pendingQuotes : false}
      badgeColor="bg-orange-500"
      tooltip="Orçamentos"
    />
  )
}
