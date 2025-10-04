'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoClose, 
  IoSend, 
  IoSparkles, 
  IoRefresh, 
  IoImage, 
  IoVolumeHigh,
  IoChatbubbleEllipses,
  IoPlayCircle,
  IoDownload,
  IoCopy
} from 'react-icons/io5'
import { 
  RiRobot2Fill, 
  RiMagicFill 
} from 'react-icons/ri'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

export interface SendData {
  text?: string
  imageUrl?: string
  audioBase64?: string
}

interface EditTextModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (data: SendData) => void
  initialText: string
  contactName?: string
  actionTitle?: string
}

export default function EditTextModal({ 
  isOpen, 
  onClose, 
  onSend, 
  initialText, 
  contactName,
  actionTitle 
}: EditTextModalProps) {
  const { actualTheme } = useTheme()
  const [text, setText] = useState(initialText)
  const [isGenerating, setIsGenerating] = useState(false)
  const [originalText] = useState(initialText)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [showAudioPreview, setShowAudioPreview] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>('nova')
  const [selectedImageModel, setSelectedImageModel] = useState<'dall-e-2' | 'dall-e-3'>('dall-e-2')
  const [showFullImage, setShowFullImage] = useState(false)
  
  // Checkboxes para escolher o que enviar
  const [sendText, setSendText] = useState(true)
  const [sendImage, setSendImage] = useState(false)
  const [sendAudio, setSendAudio] = useState(false)

  const handleSend = async () => {
    if (!sendText && !sendImage && !sendAudio) return
    
    const data: SendData = {}
    
    if (sendText && text.trim()) {
      data.text = text
    }
    
    if (sendImage && generatedImageUrl) {
      data.imageUrl = generatedImageUrl
    }
    
    if (sendAudio && generatedAudioUrl) {
      // Extrair apenas o base64 (remover o prefixo data:audio/mp3;base64,)
      data.audioBase64 = generatedAudioUrl.split(',')[1]
    }
    
    onSend(data)
    onClose()
  }

  const handleGenerate = async (type: 'improve' | 'formal' | 'casual' | 'response' | 'image' | 'audio') => {
    if (!text.trim() && type !== 'response') return
    
    setIsGenerating(true)
    try {
      let prompt = ''
      let context = ''
      
      if (contactName) {
        context = `Cliente: ${contactName}`
      }
      
      if (actionTitle) {
        context += context ? ` | Ação: ${actionTitle}` : `Ação: ${actionTitle}`
      }

      switch (type) {
        case 'improve':
          prompt = `Melhore este texto: "${text}"`
          break
        case 'formal':
          prompt = `Torne este texto mais formal: "${text}"`
          break
        case 'casual':
          prompt = `Torne este texto mais casual: "${text}"`
          break
        case 'response':
          prompt = text || 'Crie uma resposta de atendimento ao cliente profissional e amigável'
          break
        case 'image':
          prompt = text || 'Gere uma imagem profissional e atrativa'
          break
        case 'audio':
          prompt = text || 'Gere um áudio profissional'
          break
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          type,
          voice: selectedVoice, // Voz selecionada
          imageModel: selectedImageModel // Modelo de imagem selecionado
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (type === 'image') {
          if (data.imageUrl) {
            setGeneratedImageUrl(data.imageUrl)
            setShowImagePreview(true)
            setSendImage(true) // Auto-marcar checkbox
            setText(data.revised_prompt || data.prompt || text)
          } else {
            alert('Erro: URL da imagem não encontrada')
          }
        } else if (type === 'audio') {
          if (data.audioUrl) {
            setGeneratedAudioUrl(data.audioUrl)
            setShowAudioPreview(true)
            setSendAudio(true) // Auto-marcar checkbox
            setText(text || data.prompt)
          } else {
            alert('Erro: Áudio não gerado')
          }
        } else {
          setText(data.text)
        }
      } else {
        console.error('Erro ao gerar com IA:', response.status)
        alert('Erro ao gerar conteúdo com IA')
      }
    } catch (error) {
      console.error('Erro ao gerar com IA:', error)
      alert('Erro ao gerar conteúdo com IA')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setText(originalText)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border ${
            actualTheme === 'dark'
              ? 'bg-[#1a1a1a] border-gray-800'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header - Clean & Minimalista */}
          <div className="relative px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <IoChatbubbleEllipses className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Editar Mensagem
                  </h2>
                  {contactName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Para: <span className="font-medium">{contactName}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <IoClose className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* AI Actions - Design Categorizado */}
            <div className="space-y-3">
              {/* Seção: Texto */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <RiRobot2Fill className="w-3.5 h-3.5" />
                  Ajustes de Texto
                </h3>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerate('response')}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                  >
                    <RiRobot2Fill className="w-4 h-4" />
                    Gerar com IA
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerate('improve')}
                    disabled={isGenerating || !text.trim()}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                  >
                    <RiMagicFill className="w-4 h-4" />
                    Melhorar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerate('formal')}
                    disabled={isGenerating || !text.trim()}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                  >
                    <IoSparkles className="w-4 h-4" />
                    Formal
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerate('casual')}
                    disabled={isGenerating || !text.trim()}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                  >
                    <IoRefresh className="w-4 h-4" />
                    Casual
                  </motion.button>
                </div>
              </div>

              {/* Seção: Multimídia */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <IoSparkles className="w-3.5 h-3.5" />
                  Gerar Mídia (OpenAI)
                </h3>
                
                {/* Configurações de Mídia */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  {/* Seletor de Voz */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-1.5">
                      <IoVolumeHigh className="w-3.5 h-3.5 text-blue-500" />
                      Voz
                    </label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                      <option value="nova">Nova (Feminina)</option>
                      <option value="shimmer">Shimmer (Feminina)</option>
                      <option value="alloy">Alloy (Neutra)</option>
                      <option value="echo">Echo (Masculina)</option>
                      <option value="fable">Fable (Masculina)</option>
                      <option value="onyx">Onyx (Masculina)</option>
                    </select>
                  </div>
                  
                  {/* Seletor de Modelo de Imagem */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-1.5">
                      <IoImage className="w-3.5 h-3.5 text-blue-500" />
                      Modelo
                    </label>
                    <select
                      value={selectedImageModel}
                      onChange={(e) => setSelectedImageModel(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                      <option value="dall-e-2">DALL-E 2 (Econômico)</option>
                      <option value="dall-e-3">DALL-E 3 (Premium)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerate('image')}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                  >
                    <IoImage className="w-4 h-4" />
                    Gerar Imagem
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerate('audio')}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                  >
                    <IoVolumeHigh className="w-4 h-4" />
                    Gerar Áudio
                  </motion.button>

                  {text !== originalText && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 text-sm font-medium ml-auto"
                    >
                      Resetar
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Text Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mensagem
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="w-full min-h-[200px] p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-background text-foreground disabled:opacity-50"
                disabled={isGenerating}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{text.length} caracteres</span>
                {isGenerating && (
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Gerando com IA...
                  </div>
                )}
              </div>
            </div>

            {/* Preview de Imagem Gerada - THUMBNAIL */}
            {showImagePreview && generatedImageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={generatedImageUrl} 
                    alt="Thumbnail"
                    onClick={() => setShowFullImage(true)}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-md"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <IoImage className="w-4 h-4 text-blue-500" />
                      Imagem Gerada
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Clique para visualizar
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowImagePreview(false)
                      setGeneratedImageUrl(null)
                      setSendImage(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Modal Imagem Completa */}
            {showFullImage && generatedImageUrl && (
              <div 
                className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
                onClick={() => setShowFullImage(false)}
              >
                <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowFullImage(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300"
                  >
                    <IoClose className="w-8 h-8" />
                  </button>
                  <img 
                    src={generatedImageUrl} 
                    alt="Imagem completa"
                    className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            )}

            {/* Preview de Áudio Gerado - COMPACTO */}
            {showAudioPreview && generatedAudioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center">
                    <IoVolumeHigh className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <IoPlayCircle className="w-4 h-4 text-blue-500" />
                      Áudio Gerado
                    </h4>
                    <audio 
                      controls 
                      src={generatedAudioUrl}
                      className="w-full mt-2 h-8"
                      style={{ maxHeight: '32px' }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowAudioPreview(false)
                      setGeneratedAudioUrl(null)
                      setSendAudio(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            {/* Checkboxes de Envio */}
            {(showImagePreview || showAudioPreview || text.trim()) && (
              <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">
                  O que deseja enviar?
                </h4>
                <div className="flex flex-wrap gap-3">
                  {text.trim() && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sendText}
                        onChange={(e) => setSendText(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-500">
                        📝 Mensagem de texto
                      </span>
                    </label>
                  )}
                  {showImagePreview && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sendImage}
                        onChange={(e) => setSendImage(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-500">
                        🖼️ Imagem gerada
                      </span>
                    </label>
                  )}
                  {showAudioPreview && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sendAudio}
                        onChange={(e) => setSendAudio(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-500">
                        🎤 Áudio gerado
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={(!sendText && !sendImage && !sendAudio) || isGenerating}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <IoSend className="w-4 h-4" />
                Enviar
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
