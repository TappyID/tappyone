'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Video, Calendar, Clock, User, Phone, Copy, ExternalLink } from 'lucide-react'

interface VideoChamadaModalProps {
  isOpen: boolean
  onClose: () => void
  onStartCall: (callData: VideoChamadaData) => void
  contactData?: {
    nome?: string
    telefone?: string
  }
}

interface VideoChamadaData {
  tipo: 'imediata' | 'agendada'
  plataforma: 'meet' | 'zoom' | 'teams' | 'whatsapp'
  titulo?: string
  dataAgendamento?: string
  horarioAgendamento?: string
  duracao: number
  linkReuniao: string
  cliente: string
  telefone: string
  notificarCliente: boolean
}

export default function VideoChamadaModal({ 
  isOpen, 
  onClose, 
  onStartCall, 
  contactData 
}: VideoChamadaModalProps) {
  const [formData, setFormData] = useState<VideoChamadaData>({
    tipo: 'imediata',
    plataforma: 'meet',
    titulo: '',
    dataAgendamento: new Date().toISOString().split('T')[0],
    horarioAgendamento: new Date().toTimeString().slice(0, 5),
    duracao: 30,
    linkReuniao: '',
    cliente: contactData?.nome || '',
    telefone: contactData?.telefone || '',
    notificarCliente: true
  })

  const [linkGerado, setLinkGerado] = useState(false)

  const plataformas = [
    { 
      value: 'meet', 
      label: 'Google Meet', 
      icon: <Video className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      description: 'Reunião via Google Meet'
    },
    { 
      value: 'zoom', 
      label: 'Zoom', 
      icon: <Video className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      description: 'Reunião via Zoom'
    },
    { 
      value: 'teams', 
      label: 'Microsoft Teams', 
      icon: <Video className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      description: 'Reunião via Teams'
    },
    { 
      value: 'whatsapp', 
      label: 'WhatsApp Video', 
      icon: <Phone className="w-5 h-5" />,
      color: 'from-green-400 to-green-500',
      description: 'Chamada de vídeo do WhatsApp'
    }
  ]

  const duracoes = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1h 30min' },
    { value: 120, label: '2 horas' }
  ]

  useEffect(() => {
    if (contactData) {
      setFormData(prev => ({
        ...prev,
        cliente: contactData.nome || '',
        telefone: contactData.telefone || ''
      }))
    }
  }, [contactData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStartCall(formData)
    onClose()
  }

  const handleChange = (field: keyof VideoChamadaData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const gerarLink = () => {
    const baseUrls = {
      meet: 'https://meet.google.com/',
      zoom: 'https://zoom.us/j/',
      teams: 'https://teams.microsoft.com/l/meetup-join/',
      whatsapp: 'https://wa.me/'
    }
    
    const randomId = Math.random().toString(36).substring(2, 15)
    const link = baseUrls[formData.plataforma] + randomId
    
    setFormData(prev => ({ ...prev, linkReuniao: link }))
    setLinkGerado(true)
  }

  const copiarLink = () => {
    navigator.clipboard.writeText(formData.linkReuniao)
    // TODO: Mostrar toast de sucesso
  }

  const abrirLink = () => {
    if (formData.linkReuniao) {
      window.open(formData.linkReuniao, '_blank')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#273155] to-[#2a3660] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Video Chamada</h2>
                      <p className="text-blue-100 text-sm">
                        {formData.tipo === 'imediata' ? 'Iniciar chamada agora' : 'Agendar video chamada'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo de Chamada */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tipo de Chamada
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChange('tipo', 'imediata')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.tipo === 'imediata'
                            ? 'border-[#273155] bg-gradient-to-r from-green-500 to-green-600 text-white'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <Video className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Chamada Imediata</div>
                        <div className={`text-sm ${
                          formData.tipo === 'imediata' ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          Iniciar agora
                        </div>
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChange('tipo', 'agendada')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.tipo === 'agendada'
                            ? 'border-[#273155] bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <Calendar className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Agendar Chamada</div>
                        <div className={`text-sm ${
                          formData.tipo === 'agendada' ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          Para depois
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Plataforma */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Plataforma
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {plataformas.map((plataforma) => (
                        <motion.button
                          key={plataforma.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChange('plataforma', plataforma.value)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.plataforma === plataforma.value
                              ? `border-[#273155] bg-gradient-to-r ${plataforma.color} text-white`
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center mb-2">{plataforma.icon}</div>
                          <div className="font-semibold text-xs text-center">{plataforma.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Título (apenas para agendada) */}
                  {formData.tipo === 'agendada' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Título da Reunião
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => handleChange('titulo', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        placeholder="Ex: Apresentação do projeto"
                        required
                      />
                    </div>
                  )}

                  {/* Data e Horário (apenas para agendada) */}
                  {formData.tipo === 'agendada' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Data
                        </label>
                        <input
                          type="date"
                          value={formData.dataAgendamento}
                          onChange={(e) => handleChange('dataAgendamento', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Horário
                        </label>
                        <input
                          type="time"
                          value={formData.horarioAgendamento}
                          onChange={(e) => handleChange('horarioAgendamento', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Duração */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Duração Estimada
                    </label>
                    <select
                      value={formData.duracao}
                      onChange={(e) => handleChange('duracao', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                    >
                      {duracoes.map((duracao) => (
                        <option key={duracao.value} value={duracao.value}>
                          {duracao.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Link da Reunião */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        Link da Reunião
                      </label>
                      {!linkGerado && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={gerarLink}
                          className="flex items-center gap-2 px-3 py-1 bg-[#273155] text-white rounded-lg hover:bg-[#2a3660] transition-colors text-sm"
                        >
                          <Video className="w-4 h-4" />
                          Gerar Link
                        </motion.button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.linkReuniao}
                        onChange={(e) => handleChange('linkReuniao', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        placeholder="Cole o link da reunião ou gere automaticamente"
                      />
                      {formData.linkReuniao && (
                        <div className="flex gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={copiarLink}
                            className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Copiar link"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={abrirLink}
                            className="px-3 py-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors"
                            title="Abrir link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cliente e Telefone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Cliente
                      </label>
                      <input
                        type="text"
                        value={formData.cliente}
                        onChange={(e) => handleChange('cliente', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all bg-gray-50"
                        placeholder="Nome do cliente"
                        readOnly={!!contactData?.nome}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all bg-gray-50"
                        placeholder="(11) 99999-9999"
                        readOnly={!!contactData?.telefone}
                      />
                    </div>
                  </div>

                  {/* Notificar Cliente */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      id="notificarCliente"
                      checked={formData.notificarCliente}
                      onChange={(e) => handleChange('notificarCliente', e.target.checked)}
                      className="w-4 h-4 text-[#273155] border-gray-300 rounded focus:ring-[#273155]"
                    />
                    <label htmlFor="notificarCliente" className="text-sm font-medium text-gray-700">
                      Enviar convite e link da reunião para o cliente via WhatsApp
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#273155] to-[#2a3660] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      {formData.tipo === 'imediata' ? 'Iniciar Chamada' : 'Agendar Chamada'}
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
