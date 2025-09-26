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
import { useTheme } from '@/contexts/ThemeContext'

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
  const { actualTheme } = useTheme()
  
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
    if (actualTheme === 'dark') {
      switch (tipo) {
        case 'texto': return 'bg-blue-900/30 text-blue-400'
        case 'imagem': return 'bg-purple-900/30 text-purple-400'
        case 'audio': return 'bg-orange-900/30 text-orange-400'
        case 'video': return 'bg-red-900/30 text-red-400'
        case 'arquivo': return 'bg-slate-800 text-slate-400'
        case 'pix': return 'bg-green-900/30 text-green-400'
        default: return 'bg-blue-900/30 text-blue-400'
      }
    } else {
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
  }

  if (!isOpen || !resposta) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          actualTheme === 'dark' ? 'bg-black/70' : 'bg-black/50'
        }`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl ${
              actualTheme === 'dark'
                ? 'bg-slate-900/95 border border-slate-700/50'
                : 'bg-white/95'
            }`}
          >
            {/* Header */}
            <div className={`sticky top-0 p-6 rounded-t-2xl border-b ${
              actualTheme === 'dark'
                ? 'bg-slate-900/95 border-slate-600'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    actualTheme === 'dark'
                      ? 'bg-gradient-to-r from-slate-700 to-slate-600'
                      : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
                  }`}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{resposta.titulo}</h2>
                    <p className={actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'}>{resposta.descricao}</p>
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
                    className={`text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      actualTheme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors ${
                      actualTheme === 'dark'
                        ? 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
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
                <div className={`rounded-xl p-4 ${
                  actualTheme === 'dark'
                    ? 'bg-blue-900/30 border border-blue-800/30'
                    : 'bg-blue-50'
                }`}>
                  <div className={`flex items-center gap-2 mb-2 ${
                    actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                  }`}>
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">Categoria</span>
                  </div>
                  <p className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                  }`}>{resposta.categoria?.nome || 'Sem categoria'}</p>
                </div>

                <div className={`rounded-xl p-4 ${
                  actualTheme === 'dark'
                    ? 'bg-green-900/30 border border-green-800/30'
                    : 'bg-green-50'
                }`}>
                  <div className={`flex items-center gap-2 mb-2 ${
                    actualTheme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Status</span>
                  </div>
                  <p className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-green-300' : 'text-green-900'
                  }`}>
                    {resposta.pausado ? '⏸️ Pausada' : '✅ Ativa'}
                  </p>
                </div>

                <div className={`rounded-xl p-4 ${
                  actualTheme === 'dark'
                    ? 'bg-purple-900/30 border border-purple-800/30'
                    : 'bg-purple-50'
                }`}>
                  <div className={`flex items-center gap-2 mb-2 ${
                    actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Criada em</span>
                  </div>
                  <p className={`font-semibold ${
                    actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-900'
                  }`}>
                    {new Date(resposta.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Triggers */}
              {resposta.triggers && resposta.triggers.length > 0 && (
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Palavras-chave (Triggers)</h3>
                  <div className="flex flex-wrap gap-2">
                    {resposta.triggers.map((trigger, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          actualTheme === 'dark'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
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
                        className={`rounded-xl p-4 border ${
                          actualTheme === 'dark'
                            ? 'bg-slate-800/50 border-slate-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Número da ordem */}
                          <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold ${
                            actualTheme === 'dark'
                              ? 'bg-slate-600'
                              : 'bg-[#305e73]'
                          }`}>
                            {acao.ordem + 1}
                          </div>
                          
                          {/* Tipo da ação */}
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getAcaoColor(acao.tipo)}`}>
                            {getAcaoIcon(acao.tipo)}
                            {acao.tipo.toUpperCase()}
                          </div>
                          
                          {/* Delay */}
                          {(acao as any).delay_segundos > 0 && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                              actualTheme === 'dark'
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {(acao as any).delay_segundos}s
                            </div>
                          )}
                        </div>

                        {/* Conteúdo da ação */}
                        <div className="mt-3 pl-12">
                          {acao.tipo === 'texto' && (
                            <p className={`p-3 rounded-lg border ${
                              actualTheme === 'dark'
                                ? 'text-white bg-slate-800 border-slate-600'
                                : 'text-gray-700 bg-white border-gray-200'
                            }`}>
                              {acao.conteudo?.texto}
                            </p>
                          )}
                          
                          {(acao.tipo === 'imagem' || acao.tipo === 'video' || acao.tipo === 'audio') && (
                            <div className={`p-3 rounded-lg border ${
                              actualTheme === 'dark'
                                ? 'bg-slate-800 border-slate-600'
                                : 'bg-white border-gray-200'
                            }`}>
                              {acao.conteudo?.url && (
                                <p className={`underline mb-2 ${
                                  actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                }`}>{acao.conteudo.arquivo_nome || 'Arquivo'}</p>
                              )}
                              {acao.conteudo?.legenda && (
                                <p className={`text-sm ${
                                  actualTheme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                                }`}>"{acao.conteudo.legenda}"</p>
                              )}
                            </div>
                          )}
                          
                          {acao.tipo === 'pix' && (
                            <div className={`p-3 rounded-lg border ${
                              actualTheme === 'dark'
                                ? 'bg-slate-800 border-slate-600'
                                : 'bg-white border-gray-200'
                            }`}>
                              <p className={actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}><strong>Chave:</strong> {acao.conteudo?.chave}</p>
                              <p className={actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}><strong>Valor:</strong> R$ {acao.conteudo?.valor}</p>
                              <p className={actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}><strong>Descrição:</strong> {acao.conteudo?.descricao}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${
                    actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                  }`}>
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
