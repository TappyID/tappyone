'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MessageCircle, 
  Image as ImageIcon, 
  Mic, 
  Video, 
  FileText,
  CreditCard,
  Clock,
  Zap,
  Tag,
  Calendar,
  Edit
} from 'lucide-react'
import { RespostaRapida } from '@/hooks/useRespostasRapidas'

interface VisualizarRespostaModalProps {
  isOpen: boolean
  onClose: () => void
  resposta: RespostaRapida | null
  onEdit: () => void
}

export default function VisualizarRespostaModal({
  isOpen,
  onClose,
  resposta,
  onEdit
}: VisualizarRespostaModalProps) {
  if (!resposta) return null

  const getAcaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'texto': return <MessageCircle className="w-5 h-5" />
      case 'imagem': return <ImageIcon className="w-5 h-5" />
      case 'audio': return <Mic className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'arquivo': return <FileText className="w-5 h-5" />
      case 'pix': return <CreditCard className="w-5 h-5" />
      default: return <MessageCircle className="w-5 h-5" />
    }
  }

  const getAcaoColor = (tipo: string) => {
    switch (tipo) {
      case 'texto': return 'bg-blue-100 text-blue-700'
      case 'imagem': return 'bg-purple-100 text-purple-700'
      case 'audio': return 'bg-orange-100 text-orange-700'
      case 'video': return 'bg-red-100 text-red-700'
      case 'arquivo': return 'bg-gray-100 text-gray-700'
      case 'pix': return 'bg-green-100 text-green-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  if (!isOpen || !resposta) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{resposta.titulo}</h2>
                    <p className="text-gray-600">{resposta.descricao}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onEdit()
                      onClose()
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">Categoria</span>
                  </div>
                  <p className="text-blue-900 font-semibold">{resposta.categoria?.nome || 'Sem categoria'}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Status</span>
                  </div>
                  <p className="text-green-900 font-semibold">
                    {resposta.pausado ? '⏸️ Pausada' : '✅ Ativa'}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Criada em</span>
                  </div>
                  <p className="text-purple-900 font-semibold">
                    {new Date(resposta.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Triggers */}
              {resposta.triggers && resposta.triggers.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Palavras-chave (Triggers)</h3>
                  <div className="flex flex-wrap gap-2">
                    {resposta.triggers.map((trigger, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ações ({resposta.acoes?.length || 0})
                </h3>
                
                {resposta.acoes && resposta.acoes.length > 0 ? (
                  <div className="space-y-4">
                    {resposta.acoes.map((acao, index) => (
                      <motion.div
                        key={acao.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex items-start gap-4">
                          {/* Número da ordem */}
                          <div className="w-8 h-8 bg-[#305e73] text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {acao.ordem + 1}
                          </div>
                          
                          {/* Tipo da ação */}
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getAcaoColor(acao.tipo)}`}>
                            {getAcaoIcon(acao.tipo)}
                            {acao.tipo.toUpperCase()}
                          </div>
                          
                          {/* Delay */}
                          {(acao as any).delay_segundos > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                              <Clock className="w-3 h-3" />
                              {(acao as any).delay_segundos}s
                            </div>
                          )}
                        </div>

                        {/* Conteúdo da ação */}
                        <div className="mt-3 pl-12">
                          {acao.tipo === 'texto' && (
                            <p className="text-gray-700 bg-white p-3 rounded-lg border">
                              {acao.conteudo?.texto}
                            </p>
                          )}
                          
                          {(acao.tipo === 'imagem' || acao.tipo === 'video' || acao.tipo === 'audio') && (
                            <div className="bg-white p-3 rounded-lg border">
                              {acao.conteudo?.url && (
                                <p className="text-blue-600 underline mb-2">{acao.conteudo.arquivo_nome || 'Arquivo'}</p>
                              )}
                              {acao.conteudo?.legenda && (
                                <p className="text-gray-600 text-sm">"{acao.conteudo.legenda}"</p>
                              )}
                            </div>
                          )}
                          
                          {acao.tipo === 'pix' && (
                            <div className="bg-white p-3 rounded-lg border">
                              <p><strong>Chave:</strong> {acao.conteudo?.chave}</p>
                              <p><strong>Valor:</strong> R$ {acao.conteudo?.valor}</p>
                              <p><strong>Descrição:</strong> {acao.conteudo?.descricao}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma ação configurada</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
