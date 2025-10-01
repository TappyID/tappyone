'use client'

import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

export function AgendaButton() {
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
      badge={pendingAppointments > 0 ? pendingAppointments : false}
      badgeColor="bg-blue-500"
      tooltip="Agendamentos"
    />
  )
}
