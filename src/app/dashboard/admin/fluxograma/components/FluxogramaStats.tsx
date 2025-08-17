'use client'

import { Fluxograma } from '../page'

interface FluxogramaStatsProps {
  fluxogramas: Fluxograma[]
}

export default function FluxogramaStats({ fluxogramas }: FluxogramaStatsProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Estatísticas em Breve
      </h3>
      <p className="text-gray-600">
        Dashboard de estatísticas será implementado em breve
      </p>
    </div>
  )
}
