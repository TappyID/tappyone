'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, Calendar, Clock, User, Mic } from 'lucide-react'

interface LigacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onStartCall: (callData: LigacaoData) => void
  contactData?: {
    nome?: string
    telefone?: string
  }
}

interface LigacaoData {
  tipo: 'imediata' | 'agendada'
  numeroTelefone: string
  titulo?: string
  dataAgendamento?: string
  horarioAgendamento?: string
  duracao: number
  cliente: string
  observacoes: string
  gravarChamada: boolean
  notificarCliente: boolean
}

export default function LigacaoModal({ 
  isOpen, 
  onClose, 
  onStartCall, 
  contactData 
}: LigacaoModalProps) {
  const [formData, setFormData] = useState<LigacaoData>({
    tipo: 'imediata',
    numeroTelefone: '',
    titulo: '',
    dataAgendamento: '',
    horarioAgendamento: '',
    duracao: 15,
    cliente: '',
    observacoes: '',
    gravarChamada: false,
    notificarCliente: true
  })

  const [chamadaAtiva, setChamadaAtiva] = useState(false)
  const [tempoDecorrido, setTempoDecorrido] = useState(0)
  const [micMutado, setMicMutado] = useState(false)
  const [somMutado, setSomMutado] = useState(false)

  // Auto-preencher dados do contato
  useEffect(() => {
    if (contactData && isOpen) {
      setFormData(prev => ({
        ...prev,
        cliente: contactData.nome || '',
        numeroTelefone: contactData.telefone || ''
      }))
    }
  }, [contactData, isOpen])

  // Timer da chamada
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (chamadaAtiva) {
      interval = setInterval(() => {
        setTempoDecorrido(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [chamadaAtiva])

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.tipo === 'imediata') {
      setChamadaAtiva(true)
      setTempoDecorrido(0)
    }
    
    onStartCall(formData)
  }

  const encerrarChamada = () => {
    setChamadaAtiva(false)
    setTempoDecorrido(0)
    onClose()
  }

  const resetForm = () => {
    setFormData({
      tipo: 'imediata',
      numeroTelefone: contactData?.telefone || '',
      titulo: '',
      dataAgendamento: '',
      horarioAgendamento: '',
      duracao: 15,
      cliente: contactData?.nome || '',
      observacoes: '',
      gravarChamada: false,
      notificarCliente: true
    })
    setChamadaAtiva(false)
    setTempoDecorrido(0)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#273155] to-[#2a3660] p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {chamadaAtiva ? 'Ligação em Andamento' : 'Nova Ligação'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {chamadaAtiva ? `Duração: ${formatarTempo(tempoDecorrido)}` : 'Configurar ligação telefônica'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {chamadaAtiva ? (
              /* Interface de Chamada Ativa */
              <div className="text-center space-y-6">
                {/* Avatar e Info do Contato */}
                <div className={`p-6 rounded-2xl ${
                  chamadaAtiva 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : 'bg-gradient-to-r from-[#273155] to-[#2a3660]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        {chamadaAtiva ? (
                          <Phone className="w-5 h-5 text-white animate-pulse" />
                        ) : (
                          <Phone className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">{formData.cliente}</div>
                        <div className="text-white/80 text-sm">{formData.numeroTelefone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono text-2xl">{formatarTempo(tempoDecorrido)}</div>
                      <div className="text-white/80 text-sm">
                        {formData.gravarChamada && '🔴 Gravando'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controles da Chamada */}
                <div className="flex justify-center gap-4">
                  {/* Mute Microfone */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMicMutado(!micMutado)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      micMutado 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    title={micMutado ? 'Ativar microfone' : 'Mutar microfone'}
                  >
                    <Mic className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSomMutado(!somMutado)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      somMutado 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    title={somMutado ? 'Ativar som' : 'Mutar som'}
                  >
                    <Phone className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={encerrarChamada}
                    className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all"
                    title="Encerrar chamada"
                  >
                    <Phone className="w-6 h-6 rotate-[135deg]" />
                  </motion.button>
                </div>
              </div>
            ) : (
              /* Formulário de Configuração */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Ligação */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'imediata' }))}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.tipo === 'imediata'
                        ? 'border-[#273155] bg-gradient-to-r from-green-500 to-green-600 text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Phone className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Ligar Agora</div>
                    <div className={`text-sm ${
                      formData.tipo === 'imediata' ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      Iniciar imediatamente
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'agendada' }))}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.tipo === 'agendada'
                        ? 'border-[#273155] bg-gradient-to-r from-[#273155] to-[#2a3660] text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Calendar className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Agendar</div>
                    <div className={`text-sm ${
                      formData.tipo === 'agendada' ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      Programar para depois
                    </div>
                  </motion.div>
                </div>

                {/* Dados do Cliente */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Cliente
                    </label>
                    <input
                      type="text"
                      value={formData.cliente}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent"
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.numeroTelefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroTelefone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                {/* Agendamento (se selecionado) */}
                {formData.tipo === 'agendada' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Título da Ligação
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent"
                        placeholder="Ex: Ligação comercial"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Data
                        </label>
                        <input
                          type="date"
                          value={formData.dataAgendamento}
                          onChange={(e) => setFormData(prev => ({ ...prev, dataAgendamento: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent"
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
                          onChange={(e) => setFormData(prev => ({ ...prev, horarioAgendamento: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Duração Estimada */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Duração Estimada
                  </label>
                  <select
                    value={formData.duracao}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracao: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent"
                  >
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Notas sobre a ligação..."
                  />
                </div>

                {/* Opções */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gravarChamada}
                      onChange={(e) => setFormData(prev => ({ ...prev, gravarChamada: e.target.checked }))}
                      className="w-5 h-5 text-[#273155] border-gray-300 rounded focus:ring-[#273155]"
                    />
                    <span className="text-sm font-medium text-gray-700">Gravar chamada</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificarCliente}
                      onChange={(e) => setFormData(prev => ({ ...prev, notificarCliente: e.target.checked }))}
                      className="w-5 h-5 text-[#273155] border-gray-300 rounded focus:ring-[#273155]"
                    />
                    <span className="text-sm font-medium text-gray-700">Notificar cliente</span>
                  </label>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#273155] to-[#2a3660] text-white rounded-xl hover:from-[#2a3660] to-[#273155] font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    {formData.tipo === 'imediata' ? 'Ligar Agora' : 'Agendar Ligação'}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
