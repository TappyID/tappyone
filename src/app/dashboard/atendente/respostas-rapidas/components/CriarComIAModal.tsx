'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Zap, 
  Sparkles,
  MessageCircle,
  Tag,
  Lightbulb,
  Send,
  Loader2
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface CriarComIAModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateResposta: (resposta: any) => void
}

export default function CriarComIAModal({
  isOpen,
  onClose,
  onCreateResposta
}: CriarComIAModalProps) {
  const { actualTheme } = useTheme()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    contexto: '',
    situacao: '',
    tom: 'profissional',
    incluirPix: false,
    incluirImagem: false
  })

  const [resultado, setResultado] = useState({
    titulo: '',
    descricao: '',
    triggers: [] as string[],
    acoes: [] as any[]
  })

  const handleGenerate = async () => {
    setLoading(true)
    
    // Simular geração com IA (depois integrar com API real)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult = {
      titulo: `Resposta sobre ${formData.contexto}`,
      descricao: `Resposta automática gerada para situações relacionadas a ${formData.situacao}`,
      triggers: [
        formData.contexto.toLowerCase(),
        formData.situacao.toLowerCase(),
        'ajuda',
        'informação'
      ],
      acoes: [
        {
          tipo: 'texto',
          ordem: 0,
          conteudo: {
            texto: `Olá! Entendi que você precisa de informações sobre ${formData.contexto}. ${
              formData.tom === 'amigavel' 
                ? 'Fico feliz em ajudar! 😊' 
                : 'Estou aqui para auxiliá-lo.'
            }\n\n${formData.situacao}\n\nSe precisar de mais alguma coisa, é só me avisar!`
          }
        },
        ...(formData.incluirPix ? [{
          tipo: 'pix',
          ordem: 1,
          conteudo: {
            chave: 'contato@empresa.com',
            valor: 0,
            descricao: 'Pagamento relacionado ao serviço'
          }
        }] : []),
        ...(formData.incluirImagem ? [{
          tipo: 'imagem',
          ordem: formData.incluirPix ? 2 : 1,
          conteudo: {
            url: '',
            legenda: 'Imagem explicativa sobre o assunto'
          }
        }] : [])
      ]
    }
    
    setResultado(mockResult)
    setStep(2)
    setLoading(false)
  }

  const handleCreateFinal = () => {
    onCreateResposta({
      titulo: resultado.titulo,
      descricao: resultado.descricao,
      // REMOVIDO categoria_id - deixar backend usar "Geral"
      triggers: resultado.triggers,
      acoes: resultado.acoes,
      automatico: true,
      ativo: true
    })
    onClose()
    setStep(1)
    setFormData({
      contexto: '',
      situacao: '',
      tom: 'profissional',
      incluirPix: false,
      incluirImagem: false
    })
  }

  if (!isOpen) return null

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
            className={`rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-xl ${
              actualTheme === 'dark'
                ? 'bg-slate-900/95 border border-slate-700/50'
                : 'bg-white/95'
            }`}
          >
            {/* Header */}
            <div className={`sticky top-0 text-white p-6 rounded-t-2xl ${
              actualTheme === 'dark'
                ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl border-b border-slate-600/30'
                : 'bg-gradient-to-r from-purple-600 to-blue-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    actualTheme === 'dark' ? 'bg-slate-600/50' : 'bg-white/20'
                  }`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Criar Resposta com IA</h2>
                    <p className="text-white/70">Descreva a situação e deixe a IA criar a resposta perfeita</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 && (
                <div className="space-y-6">
                  {/* Contexto */}
                  <div>
                    <label className={`flex items-center gap-2 font-medium mb-3 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Sobre o que é a resposta?
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: preços, produtos, suporte técnico, agendamento..."
                      value={formData.contexto}
                      onChange={(e) => setFormData(prev => ({ ...prev, contexto: e.target.value }))}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800/60 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Situação */}
                  <div>
                    <label className={`flex items-center gap-2 font-medium mb-3 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      Descreva a situação ou informação a ser passada
                    </label>
                    <textarea
                      placeholder="Ex: Nossos preços começam em R$ 50,00. Temos pacotes especiais para empresas. Entre em contato para mais detalhes..."
                      value={formData.situacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, situacao: e.target.value }))}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800/60 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      rows={4}
                    />
                  </div>

                  {/* Tom */}
                  <div>
                    <label className={`flex items-center gap-2 font-medium mb-3 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      <Tag className="w-5 h-5 text-green-500" />
                      Tom da resposta
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                        actualTheme === 'dark'
                          ? 'border-slate-600 hover:bg-slate-800/60'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="tom"
                          value="profissional"
                          checked={formData.tom === 'profissional'}
                          onChange={(e) => setFormData(prev => ({ ...prev, tom: e.target.value }))}
                          className="text-purple-600"
                        />
                        <div>
                          <span className={`font-medium ${
                            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>Profissional</span>
                          <p className={`text-sm ${
                            actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                          }`}>Formal e direto ao ponto</p>
                        </div>
                      </label>
                      
                      <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                        actualTheme === 'dark'
                          ? 'border-slate-600 hover:bg-slate-800/60'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="tom"
                          value="amigavel"
                          checked={formData.tom === 'amigavel'}
                          onChange={(e) => setFormData(prev => ({ ...prev, tom: e.target.value }))}
                          className="text-purple-600"
                        />
                        <div>
                          <span className={`font-medium ${
                            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>Amigável</span>
                          <p className={`text-sm ${
                            actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                          }`}>Descontraído com emojis</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Opções extras */}
                  <div>
                    <label className={`font-medium mb-3 block ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>Incluir:</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.incluirPix}
                          onChange={(e) => setFormData(prev => ({ ...prev, incluirPix: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span className={actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}>PIX para pagamento</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.incluirImagem}
                          onChange={(e) => setFormData(prev => ({ ...prev, incluirImagem: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span className={actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}>Espaço para imagem explicativa</span>
                      </label>
                    </div>
                  </div>

                  {/* Botão */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={!formData.contexto || !formData.situacao || loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Gerando resposta...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Gerar Resposta com IA
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      actualTheme === 'dark'
                        ? 'bg-gradient-to-r from-slate-700 to-slate-600'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}>
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Resposta Gerada!</h3>
                    <p className={actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'}>Revise e confirme para criar a resposta rápida</p>
                  </div>

                  {/* Preview */}
                  <div className={`rounded-xl p-6 border ${
                    actualTheme === 'dark'
                      ? 'bg-slate-800/60 border-slate-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="mb-4">
                      <h4 className={`font-semibold mb-2 ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Título:</h4>
                      <p className={actualTheme === 'dark' ? 'text-white/80' : 'text-gray-700'}>{resultado.titulo}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className={`font-semibold mb-2 ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Descrição:</h4>
                      <p className={actualTheme === 'dark' ? 'text-white/80' : 'text-gray-700'}>{resultado.descricao}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className={`font-semibold mb-2 ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Palavras-chave:</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultado.triggers.map((trigger, index) => (
                          <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                            actualTheme === 'dark'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className={`font-semibold mb-2 ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Conteúdo da resposta:</h4>
                      <div className={`rounded-lg p-4 border ${
                        actualTheme === 'dark'
                          ? 'bg-slate-900/60 border-slate-600'
                          : 'bg-white border-gray-200'
                      }`}>
                        <p className={`whitespace-pre-line ${
                          actualTheme === 'dark' ? 'text-white/80' : 'text-gray-700'
                        }`}>
                          {resultado.acoes.find(a => a.tipo === 'texto')?.conteudo?.texto}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className={`flex-1 p-4 rounded-xl font-medium transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-700/60 text-white hover:bg-slate-600/60'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Voltar e Editar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateFinal}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200"
                    >
                      <Send className="w-5 h-5" />
                      Criar Resposta
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
