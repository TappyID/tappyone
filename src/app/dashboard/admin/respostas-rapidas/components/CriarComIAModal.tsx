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
      categoria_id: null, // Permitir null para categoria
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Criar Resposta com IA</h2>
                    <p className="opacity-90">Descreva a situação e deixe a IA criar a resposta perfeita</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-white bg-opacity-20 p-2 rounded-lg hover:bg-opacity-30 transition-colors"
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
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Sobre o que é a resposta?
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: preços, produtos, suporte técnico, agendamento..."
                      value={formData.contexto}
                      onChange={(e) => setFormData(prev => ({ ...prev, contexto: e.target.value }))}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Situação */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      Descreva a situação ou informação a ser passada
                    </label>
                    <textarea
                      placeholder="Ex: Nossos preços começam em R$ 50,00. Temos pacotes especiais para empresas. Entre em contato para mais detalhes..."
                      value={formData.situacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, situacao: e.target.value }))}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Tom */}
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                      <Tag className="w-5 h-5 text-green-500" />
                      Tom da resposta
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="tom"
                          value="profissional"
                          checked={formData.tom === 'profissional'}
                          onChange={(e) => setFormData(prev => ({ ...prev, tom: e.target.value }))}
                          className="text-purple-600"
                        />
                        <div>
                          <span className="font-medium">Profissional</span>
                          <p className="text-sm text-gray-600">Formal e direto ao ponto</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="tom"
                          value="amigavel"
                          checked={formData.tom === 'amigavel'}
                          onChange={(e) => setFormData(prev => ({ ...prev, tom: e.target.value }))}
                          className="text-purple-600"
                        />
                        <div>
                          <span className="font-medium">Amigável</span>
                          <p className="text-sm text-gray-600">Descontraído com emojis</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Opções extras */}
                  <div>
                    <label className="text-gray-700 font-medium mb-3 block">Incluir:</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.incluirPix}
                          onChange={(e) => setFormData(prev => ({ ...prev, incluirPix: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span>PIX para pagamento</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.incluirImagem}
                          onChange={(e) => setFormData(prev => ({ ...prev, incluirImagem: e.target.checked }))}
                          className="text-purple-600"
                        />
                        <span>Espaço para imagem explicativa</span>
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
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Resposta Gerada!</h3>
                    <p className="text-gray-600">Revise e confirme para criar a resposta rápida</p>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Título:</h4>
                      <p className="text-gray-700">{resultado.titulo}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Descrição:</h4>
                      <p className="text-gray-700">{resultado.descricao}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Palavras-chave:</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultado.triggers.map((trigger, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Conteúdo da resposta:</h4>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="whitespace-pre-line text-gray-700">
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
                      className="flex-1 bg-gray-100 text-gray-700 p-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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
