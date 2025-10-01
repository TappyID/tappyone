'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Menu,
  BarChart3,
  MapPin,
  User,
  Paperclip,
  Video,
  Calendar,
  DollarSign,
  FileSignature,
  Tag,
  Ticket,
  Users,
  UserCheck,
  Mic
} from 'lucide-react'

// ======================
// COMPONENTE DE TAB
// ======================
export const TabButton = ({
  active,
  onClick,
  children
}: {
  active: boolean,
  onClick: () => void,
  children: React.ReactNode
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
      active
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
  >
    {children}
  </motion.button>
)

// ======================
// AÇÕES DO WHATSAPP
// ======================
export const MenuButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-indigo-100 dark:bg-indigo-900/30"
  >
    <Menu className="w-6 h-6 mb-2 text-indigo-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Menu</span>
  </motion.button>
)

export const EnqueteButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-pink-100 dark:bg-pink-900/30"
  >
    <BarChart3 className="w-6 h-6 mb-2 text-pink-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Enquete</span>
  </motion.button>
)

export const LocalizacaoButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-orange-100 dark:bg-orange-900/30"
  >
    <MapPin className="w-6 h-6 mb-2 text-orange-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Localização</span>
  </motion.button>
)

export const ContatoButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-cyan-100 dark:bg-cyan-900/30"
  >
    <User className="w-6 h-6 mb-2 text-cyan-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Contato</span>
  </motion.button>
)

export const AnexoWhatsappButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-gray-100 dark:bg-gray-900/30"
  >
    <Paperclip className="w-6 h-6 mb-2 text-gray-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Anexo</span>
  </motion.button>
)

export const VideoButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-purple-100 dark:bg-purple-900/30"
  >
    <Video className="w-6 h-6 mb-2 text-purple-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Vídeo</span>
  </motion.button>
)

// ======================
// AÇÕES DO SISTEMA
// ======================
export const AgendamentoButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-purple-100 dark:bg-purple-900/30"
  >
    <Calendar className="w-6 h-6 mb-2 text-purple-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Agendamento</span>
  </motion.button>
)

export const OrcamentoButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-yellow-100 dark:bg-yellow-900/30"
  >
    <DollarSign className="w-6 h-6 mb-2 text-yellow-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Orçamento</span>
  </motion.button>
)

export const AssinaturaButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-green-100 dark:bg-green-900/30"
  >
    <FileSignature className="w-6 h-6 mb-2 text-green-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Assinatura</span>
  </motion.button>
)

export const TagButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-emerald-100 dark:bg-emerald-900/30"
  >
    <Tag className="w-6 h-6 mb-2 text-emerald-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Tag</span>
  </motion.button>
)

export const TicketButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-red-100 dark:bg-red-900/30"
  >
    <Ticket className="w-6 h-6 mb-2 text-red-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Ticket</span>
  </motion.button>
)

export const FilaButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-blue-100 dark:bg-blue-900/30"
  >
    <Users className="w-6 h-6 mb-2 text-blue-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Fila</span>
  </motion.button>
)

export const AtendenteButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-teal-100 dark:bg-teal-900/30"
  >
    <UserCheck className="w-6 h-6 mb-2 text-teal-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Atendente</span>
  </motion.button>
)

// ======================
// NOVOS BOTÕES WHATSAPP
// ======================
export const AudioWhatsappButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-orange-100 dark:bg-orange-900/30"
  >
    <Mic className="w-6 h-6 mb-2 text-orange-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Áudio</span>
  </motion.button>
)

export const EventsButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center p-3 rounded-xl transition-colors hover:bg-white dark:hover:bg-gray-600 bg-indigo-100 dark:bg-indigo-900/30"
  >
    <Calendar className="w-6 h-6 mb-2 text-indigo-500" />
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Agenda</span>
  </motion.button>
)
