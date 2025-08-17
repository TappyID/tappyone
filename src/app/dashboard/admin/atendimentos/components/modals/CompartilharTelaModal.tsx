'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Monitor, User, Phone, Copy, ExternalLink, Play, Square, Video } from 'lucide-react'

interface CompartilharTelaModalProps {
  isOpen: boolean
  onClose: () => void
  onStartShare: (shareData: CompartilharTelaData) => void
  contactData?: {
    nome?: string
    telefone?: string
  }
}

interface CompartilharTelaData {
  tipo: 'tela_completa' | 'janela_especifica' | 'aba_navegador'
  plataforma: 'meet' | 'zoom' | 'teams' | 'anydesk' | 'teamviewer'
  linkSessao: string
  cliente: string
  telefone: string
  permitirControle: boolean
  gravarSessao: boolean
  notificarCliente: boolean
  observacoes: string
}

export default function CompartilharTelaModal({ 
  isOpen, 
  onClose, 
  onStartShare, 
  contactData 
}: CompartilharTelaModalProps) {
  const [formData, setFormData] = useState<CompartilharTelaData>({
    tipo: 'tela_completa',
    plataforma: 'meet',
    linkSessao: '',
    cliente: contactData?.nome || '',
    telefone: contactData?.telefone || '',
    permitirControle: false,
    gravarSessao: false,
    notificarCliente: true,
    observacoes: ''
  })

  const [compartilhamentoAtivo, setCompartilhamentoAtivo] = useState(false)
  const [tempoSessao, setTempoSessao] = useState(0)
  const [linkGerado, setLinkGerado] = useState(false)

  const tiposCompartilhamento = [
    { 
      value: 'tela_completa', 
      label: 'Tela Completa', 
      icon: <Monitor className="w-6 h-6" />,
      description: 'Compartilhar toda a tela'
    },
    { 
      value: 'janela_especifica', 
      label: 'Janela Específica', 
      icon: <Square className="w-6 h-6" />,
      description: 'Compartilhar apenas uma janela'
    },
    { 
      value: 'aba_navegador', 
      label: 'Aba do Navegador', 
      icon: <ExternalLink className="w-6 h-6" />,
      description: 'Compartilhar aba específica'
    }
  ]

  const plataformas = [
    { 
      value: 'meet', 
      label: 'Google Meet', 
      icon: <Video className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      description: 'Compartilhamento via Meet'
    },
    { 
      value: 'zoom', 
      label: 'Zoom', 
      icon: <Video className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      description: 'Compartilhamento via Zoom'
    },
    { 
      value: 'teams', 
      label: 'Microsoft Teams', 
      icon: <Video className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      description: 'Compartilhamento via Teams'
    },
    { 
      value: 'anydesk', 
      label: 'AnyDesk', 
      icon: <Monitor className="w-5 h-5" />,
      color: 'from-red-500 to-red-600',
      description: 'Acesso remoto AnyDesk'
    },
    { 
      value: 'teamviewer', 
      label: 'TeamViewer', 
      icon: <Monitor className="w-5 h-5" />,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Acesso remoto TeamViewer'
    }
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

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (compartilhamentoAtivo) {
      interval = setInterval(() => {
        setTempoSessao(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [compartilhamentoAtivo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    iniciarCompartilhamento()
  }

  const handleChange = (field: keyof CompartilharTelaData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const gerarLink = () => {
    const baseUrls = {
      meet: 'https://meet.google.com/',
      zoom: 'https://zoom.us/j/',
      teams: 'https://teams.microsoft.com/l/meetup-join/',
      anydesk: 'anydesk://',
      teamviewer: 'teamviewer://'
    }
    
    const randomId = Math.random().toString(36).substring(2, 15)
    const link = baseUrls[formData.plataforma] + randomId
    
    setFormData(prev => ({ ...prev, linkSessao: link }))
    setLinkGerado(true)
  }

  const iniciarCompartilhamento = () => {
    setCompartilhamentoAtivo(true)
    setTempoSessao(0)
    // TODO: Implementar lógica real de compartilhamento
  }

  const pararCompartilhamento = () => {
    setCompartilhamentoAtivo(false)
    setTempoSessao(0)
    onStartShare({ ...formData })
    onClose()
  }

  const copiarLink = () => {
    navigator.clipboard.writeText(formData.linkSessao)
    // TODO: Mostrar toast de sucesso
  }

  const abrirLink = () => {
    if (formData.linkSessao) {
      window.open(formData.linkSessao, '_blank')
    }
  }

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
            onClick={!compartilhamentoAtivo ? onClose : undefined}
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
              <div className={`px-6 py-4 ${
                compartilhamentoAtivo 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-[#273155] to-[#2a3660]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      {compartilhamentoAtivo ? (
                        <Monitor className="w-5 h-5 text-white animate-pulse" />
                      ) : (
                        <Monitor className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {compartilhamentoAtivo ? 'Compartilhamento Ativo' : 'Compartilhar Tela'}
                      </h2>
                      <p className="text-blue-100 text-sm">
                        {compartilhamentoAtivo 
                          ? `${formatarTempo(tempoSessao)} - ${formData.cliente}`
                          : 'Configure e inicie o compartilhamento de tela'
                        }
                      </p>
                    </div>
                  </div>
                  {!compartilhamentoAtivo && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {compartilhamentoAtivo ? (
                  /* Interface de Compartilhamento Ativo */
                  <div className="text-center space-y-6">
                    {/* Status */}
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                        <Monitor className="w-12 h-12 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Compartilhando com {formData.cliente}</h3>
                        <p className="text-lg text-gray-600">
                          {tiposCompartilhamento.find(t => t.value === formData.tipo)?.label} via {
                            plataformas.find(p => p.value === formData.plataforma)?.label
                          }
                        </p>
                      </div>
                    </div>

                    {/* Tempo de Sessão */}
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                        {formatarTempo(tempoSessao)}
                      </div>
                      <div className="text-sm text-gray-500">Tempo de compartilhamento</div>
                    </div>

                    {/* Controles */}
                    <div className="flex justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={pararCompartilhamento}
                        className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
                        title="Parar compartilhamento"
                      >
                        <Square className="w-6 h-6" />
                      </motion.button>
                    </div>

                    {/* Status da Gravação */}
                    {formData.gravarSessao && (
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Gravando sessão</span>
                      </div>
                    )}

                    {/* Controle Remoto */}
                    {formData.permitirControle && (
                      <div className="flex items-center justify-center gap-2 text-orange-600">
                        <Monitor className="w-4 h-4" />
                        <span className="text-sm font-medium">Controle remoto habilitado</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Formulário de Configuração */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo de Compartilhamento */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Tipo de Compartilhamento
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {tiposCompartilhamento.map((tipo) => (
                          <motion.button
                            key={tipo.value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleChange('tipo', tipo.value)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              formData.tipo === tipo.value
                                ? 'border-[#273155] bg-gradient-to-r from-[#273155] to-[#2a3660] text-white'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-center mb-2">{tipo.icon}</div>
                            <div className="font-semibold text-sm text-center">{tipo.label}</div>
                            <div className={`text-xs ${
                              formData.tipo === tipo.value ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {tipo.description}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Plataforma */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Plataforma
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

                    {/* Link da Sessão */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">
                          <ExternalLink className="w-4 h-4 inline mr-2" />
                          Link da Sessão
                        </label>
                        {!linkGerado && (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={gerarLink}
                            className="flex items-center gap-2 px-3 py-1 bg-[#273155] text-white rounded-lg hover:bg-[#2a3660] transition-colors text-sm"
                          >
                            <Monitor className="w-4 h-4" />
                            Gerar Link
                          </motion.button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.linkSessao}
                          onChange={(e) => handleChange('linkSessao', e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                          placeholder="Cole o link da sessão ou gere automaticamente"
                        />
                        {formData.linkSessao && (
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

                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Observações
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => handleChange('observacoes', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all resize-none"
                        placeholder="Objetivo do compartilhamento, instruções especiais, etc."
                      />
                    </div>

                    {/* Opções */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <input
                          type="checkbox"
                          id="permitirControle"
                          checked={formData.permitirControle}
                          onChange={(e) => handleChange('permitirControle', e.target.checked)}
                          className="w-4 h-4 text-[#273155] border-gray-300 rounded focus:ring-[#273155]"
                        />
                        <label htmlFor="permitirControle" className="text-sm font-medium text-gray-700">
                          Permitir controle remoto do cliente
                        </label>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="gravarSessao"
                          checked={formData.gravarSessao}
                          onChange={(e) => handleChange('gravarSessao', e.target.checked)}
                          className="w-4 h-4 text-[#273155] border-gray-300 rounded focus:ring-[#273155]"
                        />
                        <label htmlFor="gravarSessao" className="text-sm font-medium text-gray-700">
                          Gravar sessão de compartilhamento
                        </label>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <input
                          type="checkbox"
                          id="notificarCliente"
                          checked={formData.notificarCliente}
                          onChange={(e) => handleChange('notificarCliente', e.target.checked)}
                          className="w-4 h-4 text-[#273155] border-gray-300 rounded focus:ring-[#273155]"
                        />
                        <label htmlFor="notificarCliente" className="text-sm font-medium text-gray-700">
                          Enviar link de acesso para o cliente via WhatsApp
                        </label>
                      </div>
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
                        <Play className="w-4 h-4 inline mr-2" />
                        Iniciar Compartilhamento
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
