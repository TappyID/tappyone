'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ArrowRight, 
  User, 
  Users, 
  MessageSquare,
  Clock,
  AlertCircle,
  ArrowRightLeft,
  Layers
} from 'lucide-react'

interface TransferirAtendimentoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (dados: TransferenciaData) => void
  chatId?: string
  contactData?: {
    id?: string
    nome?: string
    telefone?: string
  }
}

interface TransferenciaData {
  filaId: string
  motivo: string
  notas?: string
  urgente: boolean
}

export default function TransferirAtendimentoModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  chatId,
  contactData 
}: TransferirAtendimentoModalProps) {
  const [formData, setFormData] = useState<TransferenciaData>({
    filaId: '',
    motivo: '',
    notas: '',
    urgente: false
  })
  const [filas, setFilas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Buscar filas disponíveis quando o modal abrir
  useEffect(() => {
    if (isOpen && chatId) {
      fetchFilas()
    }
  }, [isOpen, chatId])

  const fetchFilas = async () => {
    try {
      setLoading(true)
      console.log('🔄 [TransferModal] Iniciando busca de filas...')
      
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('❌ [TransferModal] Token não encontrado')
        return
      }

      // Buscar filas disponíveis baseado na conexão do chat
      console.log('🔍 [TransferModal] Fazendo request para /api/filas')
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      console.log('📡 [TransferModal] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 [TransferModal] Filas recebidas:', data)
        console.log('📊 [TransferModal] Tipo dos dados:', typeof data, 'É array:', Array.isArray(data))
        
        // A API retorna { success: true, data: [...] }
        if (data.success && Array.isArray(data.data)) {
          setFilas(data.data)
          console.log('✅ [TransferModal] Filas definidas:', data.data.length, 'filas')
        } else if (Array.isArray(data)) {
          // Fallback caso retorne array direto
          setFilas(data)
          console.log('✅ [TransferModal] Filas definidas (array direto):', data.length, 'filas')
        } else {
          console.log('⚠️ [TransferModal] Formato de resposta não reconhecido:', data)
          setFilas([])
        }
      } else {
        console.log('❌ [TransferModal] Erro na resposta:', response.statusText)
        const errorText = await response.text()
        console.log('❌ [TransferModal] Erro detalhado:', errorText)
      }
    } catch (error) {
      console.error('❌ [TransferModal] Erro ao buscar filas:', error)
      setFilas([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 [TransferModal] Iniciando transferência:', formData)
    
    try {
      setLoading(true)
      await onConfirm(formData)
      console.log('✅ [TransferModal] Transferência concluída')
      onClose()
      resetForm()
    } catch (error) {
      console.error('❌ [TransferModal] Erro na transferência:', error)
      // Não fechar o modal em caso de erro, para o usuário ver o que aconteceu
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      filaId: '',
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
              <div className="bg-gradient-to-r from-[#273155] to-[#2a3660] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ArrowRightLeft className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Transferir Atendimento</h2>
                      <p className="text-blue-100 text-sm">
                        {contactData?.nome ? `Cliente: ${contactData.nome}` : 'Transferir para outra fila'}
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

                  {/* Seleção de Fila */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Layers className="w-4 h-4 inline mr-2" />
                      Fila de Destino *
                    </label>
                    {loading ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#273155]"></div>
                          <span className="text-gray-500">Carregando filas...</span>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={formData.filaId}
                        onChange={(e) => setFormData(prev => ({ ...prev, filaId: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Selecione a fila de destino</option>
                        {filas.map(fila => (
                          <option key={fila.id} value={fila.id}>
                            {fila.nome} {fila.descricao && `- ${fila.descricao}`}
                          </option>
                        ))}
                      </select>
                    )}
                    {filas.length === 0 && !loading && (
                      <p className="text-sm text-gray-500 mt-2">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Nenhuma fila disponível para transferência
                      </p>
                    )}
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Motivo da Transferência *
                    </label>
                    <select
                      value={formData.motivo}
                      onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all resize-none"
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
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-sm font-semibold text-[#273155] mb-2">Preview da Transferência</h4>
                    <div className="text-sm text-blue-600">
                      <p><strong>Cliente:</strong> {contactData?.nome || 'N/A'}</p>
                      <p><strong>Fila Destino:</strong> {filas.find(f => f.id === formData.filaId)?.nome || 'Não selecionada'}</p>
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#273155] to-[#2a3660] text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
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
