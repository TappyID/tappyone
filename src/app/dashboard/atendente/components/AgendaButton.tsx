'use client'

import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

interface AgendaButtonProps {
  sidebarCollapsed?: boolean
}

export function AgendaButton({ sidebarCollapsed = true }: AgendaButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/admin/agendamentos')
  }

  // Simular alguns agendamentos pendentes
  const pendingAppointments = 3

  return (
    <TopBarButton
      icon={Calendar}
      onClick={handleClick}
      sidebarCollapsed={sidebarCollapsed}
      badge={pendingAppointments > 0 ? pendingAppointments : false}
      badgeColor="bg-blue-500"
      tooltip="Agendamentos"
    />
  )
}
