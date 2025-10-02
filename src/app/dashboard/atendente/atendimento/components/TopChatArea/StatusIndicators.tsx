'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Tag,
  Kanban,
  Ticket,
  Calendar,
  DollarSign,
  UserCheck,
  MessageSquare,
  Users,
  Headphones
} from 'lucide-react'

// Micro componente Tags
export const TagsIndicator = ({ count = 0, onClick }: { count?: number, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-full
               border border-emerald-400/30 transition-colors"
    title={`${count} Tags`}
  >
    <Tag className="w-4 h-4 text-emerald-600" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs
                       rounded-full w-4 h-4 flex items-center justify-center font-bold">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </motion.button>
)

// Micro componente Kanban
export const KanbanIndicator = ({ status = "Pendente", onClick }: { status?: string, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-full
               border border-blue-400/30 transition-colors"
    title={`Kanban: ${status}`}
  >
    <Kanban className="w-4 h-4 text-blue-600" />
    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs
                     rounded-full w-3 h-3 flex items-center justify-center">
      •
    </span>
  </motion.button>
)

// Micro componente Tickets
export const TicketsIndicator = ({ count = 2, onClick }: { count?: number, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-orange-500/20 hover:bg-orange-500/30 rounded-full
               border border-orange-400/30 transition-colors"
    title={`${count} Tickets`}
  >
    <Ticket className="w-4 h-4 text-orange-600" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs
                       rounded-full w-4 h-4 flex items-center justify-center font-bold">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </motion.button>
)

// Micro componente Agendamentos
export const AgendamentosIndicator = ({ count = 3, onClick }: { count?: number, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-full
               border border-purple-400/30 transition-colors"
    title={`${count} Agendamentos`}
  >
    <Calendar className="w-4 h-4 text-purple-600" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs
                       rounded-full w-4 h-4 flex items-center justify-center font-bold">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </motion.button>
)

// Micro componente Orçamentos
export const OrcamentosIndicator = ({ count = 1, onClick }: { count?: number, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-full
               border border-green-400/30 transition-colors"
    title={`${count} Orçamentos`}
  >
    <DollarSign className="w-4 h-4 text-green-600" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs
                       rounded-full w-4 h-4 flex items-center justify-center font-bold">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </motion.button>
)

// Micro componente Agente
export const AgenteIndicator = ({ nome = "João", onClick }: { nome?: string, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-full
               border border-indigo-400/30 transition-colors"
    title={`Agente: ${nome}`}
  >
    <UserCheck className="w-4 h-4 text-indigo-600" />
    <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs
                     rounded-full w-3 h-3 flex items-center justify-center">
      •
    </span>
  </motion.button>
)

// Micro componente Resposta Rápida
export const RespostaRapidaIndicator = ({ count = 5, onClick }: { count?: number, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-teal-500/20 hover:bg-teal-500/30 rounded-full
               border border-teal-400/30 transition-colors"
    title={`${count} Respostas Rápidas`}
  >
    <MessageSquare className="w-4 h-4 text-teal-600" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs
                       rounded-full w-4 h-4 flex items-center justify-center font-bold">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </motion.button>
)

// Micro componente Fila
export const FilaIndicator = ({ nome = "Suporte", onClick }: { nome?: string, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-full
               border border-cyan-400/30 transition-colors"
    title={`Fila: ${nome}`}
  >
    <Users className="w-4 h-4 text-cyan-600" />
    <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs
                     rounded-full w-3 h-3 flex items-center justify-center">
      •
    </span>
  </motion.button>
)

// Micro componente Atendimento
export const AtendimentoIndicator = ({ status = "Ativo", onClick }: { status?: string, onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    className="relative p-1.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-full
               border border-rose-400/30 transition-colors"
    title={`Atendimento: ${status}`}
  >
    <Headphones className="w-4 h-4 text-rose-600" />
    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs
                     rounded-full w-3 h-3 flex items-center justify-center">
      •
    </span>
  </motion.button>
)
