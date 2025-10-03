'use client'

import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

export function QuickResponsesButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/admin/respostas-rapidas')
  }

  return (
    <TopBarButton
      icon={Zap}
      onClick={handleClick}
      tooltip="Respostas Rápidas"
    />
  )
}
