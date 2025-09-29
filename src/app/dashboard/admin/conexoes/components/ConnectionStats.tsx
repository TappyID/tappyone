'use client'

import { motion } from 'framer-motion'
import { Zap, Link as LinkIcon, Activity, Clock } from 'lucide-react'

interface ConnectionStatsProps {
  activeConnections: number
  totalConnections: number
  totalChats: number
  totalGroups: number
  totalFilas: number
  loading?: boolean
}

export function ConnectionStats({ 
  activeConnections, 
  totalConnections, 
  totalChats, 
  totalGroups, 
  totalFilas,
  loading = false 
}: ConnectionStatsProps) {
  const stats = [
    {
      icon: LinkIcon,
      label: 'Conexões Ativas',
      value: loading ? '...' : activeConnections,
      gradient: 'from-emerald-500/25 via-emerald-400/10 to-transparent',
      iconAccent: 'bg-emerald-500/15 text-emerald-300',
      accent: 'text-emerald-600 dark:text-emerald-300',
      barGradient: 'from-emerald-500 via-emerald-400 to-emerald-600',
      description: () => loading
        ? 'Monitoramento em tempo real das conexões disponíveis.'
        : `${totalConnections} conexões cadastradas na plataforma.`,
      fill: () => {
        if (loading) return '45%'
        if (!totalConnections) return '65%'
        const ratio = Math.round((activeConnections / totalConnections) * 100)
        return `${Math.min(Math.max(ratio, 18), 100)}%`
      }
    },
    {
      icon: Zap,
      label: 'Total de Filas',
      value: loading ? '...' : totalFilas,
      gradient: 'from-sky-500/25 via-sky-400/10 to-transparent',
      iconAccent: 'bg-sky-500/15 text-sky-300',
      accent: 'text-sky-600 dark:text-sky-300',
      barGradient: 'from-sky-500 via-sky-400 to-sky-600',
      description: () => 'Filas configuradas para distribuir atendimentos.',
      fill: () => (loading ? '45%' : '68%')
    },
    {
      icon: Activity,
      label: 'Chats WhatsApp',
      value: loading ? '...' : totalChats,
      gradient: 'from-fuchsia-500/25 via-fuchsia-400/10 to-transparent',
      iconAccent: 'bg-fuchsia-500/15 text-fuchsia-300',
      accent: 'text-fuchsia-600 dark:text-fuchsia-300',
      barGradient: 'from-fuchsia-500 via-fuchsia-400 to-fuchsia-600',
      description: () => 'Conversas individuais sincronizadas com a WAHA.',
      fill: () => (loading ? '45%' : '74%')
    },
    {
      icon: Clock,
      label: 'Grupos WhatsApp',
      value: loading ? '...' : totalGroups,
      gradient: 'from-amber-500/25 via-amber-400/10 to-transparent',
      iconAccent: 'bg-amber-500/15 text-amber-300',
      accent: 'text-amber-600 dark:text-amber-300',
      barGradient: 'from-amber-500 via-amber-400 to-amber-600',
      description: () => 'Grupos WhatsApp ativos associados às conexões.',
      fill: () => (loading ? '45%' : '62%')
    }
  ]

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-900/60"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ translateY: -6 }}
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-70 transition-opacity duration-500 group-hover:opacity-90`} />
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/30 blur-2xl dark:bg-white/5" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-white/20 blur-2xl dark:bg-white/5" />

          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconAccent}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-white/60 backdrop-blur-sm transition-colors group-hover:text-slate-700 dark:text-slate-300 dark:ring-white/10">
                {loading ? 'Atualizando' : 'Ao vivo'}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <motion.span
                  key={`${stat.label}-${stat.value}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 + 0.2 }}
                  className="text-3xl font-bold text-slate-900 dark:text-white"
                >
                  {stat.value}
                </motion.span>
                <span className={`text-sm font-medium ${stat.accent}`}>
                  {loading ? '...' : 'em destaque'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/70">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${stat.barGradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: stat.fill() }}
                  transition={{ duration: 0.8, delay: index * 0.08 + 0.4, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-slate-600 transition-colors dark:text-slate-400">
                {loading ? 'Carregando estatísticas...' : stat.description()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
