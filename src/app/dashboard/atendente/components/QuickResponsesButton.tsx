'use client'

import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

interface QuickResponsesButtonProps {
  sidebarCollapsed?: boolean
}

export function QuickResponsesButton({ sidebarCollapsed = true }: QuickResponsesButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/admin/respostas-rapidas')
  }

  return (
    <TopBarButton
      icon={Zap}
      onClick={handleClick}
      sidebarCollapsed={sidebarCollapsed}
      tooltip="Respostas Rápidas"
    />
  )
}
