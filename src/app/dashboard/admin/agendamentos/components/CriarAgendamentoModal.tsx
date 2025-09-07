'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  Users,
  Coffee,
  Bell,
  FileText,
  Save
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface Contato {
  id: string
  nome: string
  telefone?: string
  email?: string
  empresa?: string
  avatar?: string
}

interface CriarAgendamentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (agendamento: AgendamentoData) => void
  contatos: Contato[]
  selectedDate?: Date
}

interface AgendamentoData {
  titulo: string
  descricao?: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: 'reuniao' | 'ligacao' | 'video' | 'presencial' | 'coffee'
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  prioridade: 'baixa' | 'media' | 'alta'
  contato: {
    id: string
    nome: string
    telefone?: string
    email?: string
    avatar?: string
    empresa?: string
  }
  local?: string
  link_video?: string
  observacoes?: string
  lembrete?: number
  cor?: string
}

export default function CriarAgendamentoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contatos,
  selectedDate 
}: CriarAgendamentoModalProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState<Omit<AgendamentoData, 'status'>>({
    titulo: '',
    descricao: '',
    data: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fim: '10:00',
    tipo: 'reuniao',
    prioridade: 'media',
    contato: contatos[0] || {
      id: '',
      nome: '',
      telefone: '',
      email: '',
      avatar: '',
      empresa: ''
    },
    local: '',
    link_video: '',
    observacoes: '',
    lembrete: 15,
    cor: '#3b82f6'
  })

  const [selectedContato, setSelectedContato] = useState<Contato | null>(contatos[0] || null)

  useEffect(() => {
    if (selectedContato) {
      setFormData(prev => ({
        ...prev,
        contato: selectedContato
      }))
    }
  }, [selectedContato])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      status: 'agendado'
    })
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      hora_inicio: '09:00',
      hora_fim: '10:00',
      tipo: 'reuniao',
      prioridade: 'media',
      contato: contatos[0] || {
        id: '',
        nome: '',
        telefone: '',
        email: '',
        avatar: '',
        empresa: ''
      },
      local: '',
      link_video: '',
      observacoes: '',
      lembrete: 15,
      cor: '#3b82f6'
    })
    setSelectedContato(contatos[0] || null)
  }

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const tiposAgendamento = [
    { value: 'reuniao', label: 'Reunião', icon: Users },
    { value: 'ligacao', label: 'Ligação', icon: Phone },
    { value: 'video', label: 'Videochamada', icon: Video },
    { value: 'presencial', label: 'Presencial', icon: MapPin },
    { value: 'coffee', label: 'Coffee Meeting', icon: Coffee }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden"
              style={{
                background: theme === 'dark' 
                  ? 'rgba(31, 41, 55, 0.95)' 
                  : 'white',
                borderColor: theme === 'dark' 
                  ? 'rgba(75, 85, 99, 0.3)' 
                  : 'rgb(229, 231, 235)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Novo Agendamento</h2>
                      <p className="text-white/80">
                        {selectedDate ? `Para ${selectedDate.toLocaleDateString('pt-BR')}` : 'Preencha os dados'}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FileText className="w-4 h-4 inline mr-2" />
                      Título do Agendamento
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => handleChange('titulo', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                        theme === 'dark'
                          ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Ex: Reunião de projeto"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Tipo de Agendamento
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {tiposAgendamento.map((tipo) => {
                        const TipoIcon = tipo.icon
                        return (
                          <motion.label
                            key={tipo.value}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.tipo === tipo.value
                                ? theme === 'dark'
                                  ? 'border-[#305e73] bg-[#305e73]/20 backdrop-blur-sm'
                                  : 'border-[#305e73] bg-[#305e73]/5'
                                : theme === 'dark'
                                  ? 'border-slate-600/50 hover:border-slate-500/70 bg-slate-700/20'
                                  : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="tipo"
                              value={tipo.value}
                              checked={formData.tipo === tipo.value}
                              onChange={(e) => handleChange('tipo', e.target.value)}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                                formData.tipo === tipo.value
                                  ? 'bg-[#305e73] text-white'
                                  : theme === 'dark'
                                    ? 'bg-slate-600/50 text-gray-300'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                <TipoIcon className="w-5 h-5" />
                              </div>
                              <div className={`text-sm font-medium ${
                                formData.tipo === tipo.value 
                                  ? 'text-[#305e73]' 
                                  : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                              }`}>
                                {tipo.label}
                              </div>
                            </div>
                          </motion.label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Data
                      </label>
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => handleChange('data', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 border-slate-600/50 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <Clock className="w-4 h-4 inline mr-2" />
                        Hora Início
                      </label>
                      <input
                        type="time"
                        value={formData.hora_inicio}
                        onChange={(e) => handleChange('hora_inicio', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 border-slate-600/50 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <Clock className="w-4 h-4 inline mr-2" />
                        Hora Fim
                      </label>
                      <input
                        type="time"
                        value={formData.hora_fim}
                        onChange={(e) => handleChange('hora_fim', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 border-slate-600/50 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <User className="w-4 h-4 inline mr-2" />
                      Selecionar Contato
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                      {contatos.map((contato) => (
                        <motion.label
                          key={contato.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedContato?.id === contato.id
                              ? theme === 'dark'
                                ? 'border-[#305e73] bg-[#305e73]/20 backdrop-blur-sm'
                                : 'border-[#305e73] bg-[#305e73]/5'
                              : theme === 'dark'
                                ? 'border-slate-600/50 hover:border-slate-500/70 bg-slate-700/20'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="contato"
                            value={contato.id}
                            checked={selectedContato?.id === contato.id}
                            onChange={() => setSelectedContato(contato)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            {contato.avatar ? (
                              <img
                                src={contato.avatar}
                                alt={contato.nome}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {contato.nome.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className={`font-medium ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>{contato.nome}</div>
                              {contato.empresa && (
                                <div className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>{contato.empresa}</div>
                              )}
                            </div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {formData.tipo === 'presencial' && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Local
                      </label>
                      <input
                        type="text"
                        value={formData.local}
                        onChange={(e) => handleChange('local', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                        placeholder="Endereço ou local do encontro"
                      />
                    </div>
                  )}

                  {formData.tipo === 'video' && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <Video className="w-4 h-4 inline mr-2" />
                        Link da Videochamada
                      </label>
                      <input
                        type="url"
                        value={formData.link_video}
                        onChange={(e) => handleChange('link_video', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Observações
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => handleChange('observacoes', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] resize-none ${
                        theme === 'dark'
                          ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Informações adicionais..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Prioridade
                      </label>
                      <select
                        value={formData.prioridade}
                        onChange={(e) => handleChange('prioridade', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 border-slate-600/50 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        <Bell className="w-4 h-4 inline mr-2" />
                        Lembrete (minutos antes)
                      </label>
                      <select
                        value={formData.lembrete}
                        onChange={(e) => handleChange('lembrete', parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] ${
                          theme === 'dark'
                            ? 'bg-slate-700/50 border-slate-600/50 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value={0}>Sem lembrete</option>
                        <option value={5}>5 minutos</option>
                        <option value={10}>10 minutos</option>
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center justify-between pt-6 border-t ${
                    theme === 'dark' ? 'border-slate-600/50' : 'border-gray-200'
                  }`}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      onClick={onClose}
                      className={`px-6 py-3 border rounded-xl font-medium transition-colors ${
                        theme === 'dark'
                          ? 'border-slate-600/50 text-gray-300 hover:bg-slate-700/50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancelar
                    </motion.button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Criar Agendamento
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
