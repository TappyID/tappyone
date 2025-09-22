'use client'

import { motion } from 'framer-motion'
import { 
  List,
  BarChart3,
  MapPin,
  User,
  Paperclip,
  Video,
  Mic,
  Calendar,
  DollarSign,
  PenTool,
  Tag,
  Ticket,
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  Image
} from 'lucide-react'

interface ButtonProps {
  onClick: () => void
}

interface SystemButtonProps {
  onClick: () => void
  contatoId?: string | null // Para criar registros vinculados ao contato
}

// Botões de Ações do WhatsApp
export const MenuButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
    title="Lista/Menu"
  >
    <List className="w-5 h-5" />
    <span className="text-xs font-medium">Menu</span>
  </motion.button>
)

export const ImageButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
    title="Enviar Imagem"
  >
    <Image className="w-5 h-5" />
    <span className="text-xs font-medium">Imagem</span>
  </motion.button>
)

export const EnqueteButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
    title="Enquete"
  >
    <BarChart3 className="w-5 h-5" />
    <span className="text-xs font-medium">Enquete</span>
  </motion.button>
)

export const LocalizacaoButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    title="Localização"
  >
    <MapPin className="w-5 h-5" />
    <span className="text-xs font-medium">Localização</span>
  </motion.button>
)

export const ContatoButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
    title="Contato"
  >
    <User className="w-5 h-5" />
    <span className="text-xs font-medium">Contato</span>
  </motion.button>
)

export const AnexoWhatsappButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
    title="Anexo"
  >
    <Paperclip className="w-5 h-5" />
    <span className="text-xs font-medium">Anexo</span>
  </motion.button>
)

export const VideoButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
    title="Vídeo"
  >
    <Video className="w-5 h-5" />
    <span className="text-xs font-medium">Vídeo</span>
  </motion.button>
)

export const AudioWhatsappButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
    title="Áudio"
  >
    <Mic className="w-5 h-5" />
    <span className="text-xs font-medium">Áudio</span>
  </motion.button>
)

export const EventsButton = ({ onClick }: ButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
    title="Eventos"
  >
    <CalendarDays className="w-5 h-5" />
    <span className="text-xs font-medium">Eventos</span>
  </motion.button>
)

// Botões do Sistema
export const AgendamentoButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
    title="Agendamento"
  >
    <Calendar className="w-5 h-5" />
    <span className="text-xs font-medium">Agendamento</span>
  </motion.button>
)

export const OrcamentoButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
    title="Orçamento"
  >
    <DollarSign className="w-5 h-5" />
    <span className="text-xs font-medium">Orçamento</span>
  </motion.button>
)

export const AssinaturaButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
    title="Assinatura"
  >
    <PenTool className="w-5 h-5" />
    <span className="text-xs font-medium">Assinatura</span>
  </motion.button>
)

export const AnotacoesButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
    title="Anotações"
  >
    <FileText className="w-5 h-5" />
    <span className="text-xs font-medium">Anotações</span>
  </motion.button>
)

export const TagButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
    title="Tags"
  >
    <Tag className="w-5 h-5" />
    <span className="text-xs font-medium">Tags</span>
  </motion.button>
)

export const TicketButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    title="Ticket"
  >
    <Ticket className="w-5 h-5" />
    <span className="text-xs font-medium">Ticket</span>
  </motion.button>
)

export const FilaButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
    title="Fila"
  >
    <Users className="w-5 h-5" />
    <span className="text-xs font-medium">Fila</span>
  </motion.button>
)

export const AtendenteButton = ({ onClick, contatoId }: SystemButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-3 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
    title="Atendente"
  >
    <UserCheck className="w-5 h-5" />
    <span className="text-xs font-medium">Atendente</span>
  </motion.button>
)
