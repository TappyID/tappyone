'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ArrowRight, 
  User, 
  Users, 
  MessageSquare,
  Clock,
  AlertCircle
} from 'lucide-react'

interface TransferirAtendimentoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (dados: TransferenciaData) => void
  contactData?: {
    id?: string
    nome?: string
    telefone?: string
  }
}

interface TransferenciaData {
  motivo: string
  notas?: string
  urgente: boolean
}

export default function TransferirAtendimentoModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  contactData 
}: TransferirAtendimentoModalProps) {
  const [formData, setFormData] = useState<TransferenciaData>({
    motivo: '',
    notas: '',
    urgente: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(formData)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      motivo: '',
      notas: '',
      urgente: false
    })
  }

  const motivosComuns = [
    'Especialização necessária',
    'Sobrecarga de trabalho', 
    'Fora do horário',
    'Cliente específico',
    'Departamento incorreto',
    'Urgência alta'
  ]

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
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Transferir Atendimento</h2>
                      <p className="text-orange-100 text-sm">
                        {contactData?.nome ? `Cliente: ${contactData.nome}` : 'Transferir para outro atendente'}
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
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Info do Cliente */}
                  {contactData && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{contactData.nome}</p>
                          <p className="text-sm text-gray-600">{contactData.telefone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Motivo da Transferência *
                    </label>
                    <select
                      value={formData.motivo}
                      onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Selecione o motivo</option>
                      {motivosComuns.map(motivo => (
                        <option key={motivo} value={motivo}>{motivo}</option>
                      ))}
                      <option value="outro">Outro motivo</option>
                    </select>
                  </div>

                  {/* Notas Adicionais */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Notas Adicionais (Opcional)
                    </label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      placeholder="Contexto adicional para o próximo atendente..."
                    />
                  </div>

                  {/* Urgência */}
                  <div>
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.urgente
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.urgente}
                        onChange={(e) => setFormData(prev => ({ ...prev, urgente: e.target.checked }))}
                        className="sr-only"
                      />
                      <AlertCircle className={`w-5 h-5 ${formData.urgente ? 'text-red-600' : 'text-gray-400'}`} />
                      <div>
                        <span className={`font-medium ${formData.urgente ? 'text-red-700' : 'text-gray-600'}`}>
                          Transferência Urgente
                        </span>
                        <p className="text-sm text-gray-500">
                          Notificar imediatamente o próximo atendente
                        </p>
                      </div>
                    </motion.label>
                  </div>

                  {/* Preview */}
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <h4 className="text-sm font-semibold text-orange-700 mb-2">Preview da Transferência</h4>
                    <div className="text-sm text-orange-600">
                      <p><strong>Cliente:</strong> {contactData?.nome || 'N/A'}</p>
                      <p><strong>Motivo:</strong> {formData.motivo || 'Não informado'}</p>
                      <p><strong>Urgente:</strong> {formData.urgente ? 'Sim' : 'Não'}</p>
                      {formData.notas && <p><strong>Notas:</strong> {formData.notas}</p>}
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Transferir Atendimento
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
