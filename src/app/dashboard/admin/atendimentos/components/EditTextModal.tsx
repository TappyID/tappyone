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

interface EditTextModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (text: string) => void
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
  const [selectedImageModel, setSelectedImageModel] = useState<'dall-e-2' | 'dall-e-3'>('dall-e-2') // dall-e-2 mais barato!

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
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
            setText(data.revised_prompt || data.prompt || text)
          } else {
            alert('Erro: URL da imagem não encontrada')
          }
        } else if (type === 'audio') {
          if (data.audioUrl) {
            setGeneratedAudioUrl(data.audioUrl)
            setShowAudioPreview(true)
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
          {/* Header - Design Moderno */}
          <div className="relative p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent_70%)]" />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center ring-2 ring-white/30 shadow-lg"
                >
                  <IoChatbubbleEllipses className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Editar Mensagem
                    <IoSparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  </h2>
                  <p className="text-white/90 text-sm font-medium mt-0.5">
                    {actionTitle && <span className="bg-white/20 px-2 py-0.5 rounded">{actionTitle}</span>}
                    {actionTitle && contactName && ' • '}
                    {contactName && <span>Para: <strong>{contactName}</strong></span>}
                    {!actionTitle && !contactName && 'Nova mensagem com IA'}
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition-all ring-2 ring-white/20"
              >
                <IoClose className="w-5 h-5 text-white" />
              </motion.button>
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
                <div className="flex gap-3 pb-2">
                  {/* Seletor de Voz */}
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Voz para Áudio:</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="nova">🎤 Nova (Feminina)</option>
                      <option value="shimmer">✨ Shimmer (Feminina)</option>
                      <option value="alloy">🎵 Alloy (Neutra)</option>
                      <option value="echo">🔊 Echo (Masculina)</option>
                      <option value="fable">📖 Fable (Masculina)</option>
                      <option value="onyx">🎙️ Onyx (Masculina)</option>
                    </select>
                  </div>
                  
                  {/* Seletor de Modelo de Imagem */}
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Modelo de Imagem:</label>
                    <select
                      value={selectedImageModel}
                      onChange={(e) => setSelectedImageModel(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="dall-e-2">💰 DALL-E 2 ($0.02)</option>
                      <option value="dall-e-3">⭐ DALL-E 3 ($0.04)</option>
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

            {/* Preview de Imagem Gerada */}
            {showImagePreview && generatedImageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-pink-200 dark:border-pink-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                    <IoImage className="w-4 h-4" />
                    Imagem Gerada
                  </h4>
                  <button
                    onClick={() => {
                      setShowImagePreview(false)
                      setGeneratedImageUrl(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
                <img 
                  src={generatedImageUrl} 
                  alt="Imagem gerada"
                  className="w-full rounded-lg shadow-lg mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(generatedImageUrl, '_blank')}
                    className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <IoDownload className="w-4 h-4" />
                    Baixar
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedImageUrl)
                      alert('URL copiada!')
                    }}
                    className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <IoCopy className="w-4 h-4" />
                    Copiar URL
                  </button>
                </div>
              </motion.div>
            )}

            {/* Preview de Áudio Gerado */}
            {showAudioPreview && generatedAudioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    <IoVolumeHigh className="w-4 h-4" />
                    Áudio Gerado
                  </h4>
                  <button
                    onClick={() => {
                      setShowAudioPreview(false)
                      setGeneratedAudioUrl(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
                <audio 
                  controls 
                  src={generatedAudioUrl}
                  className="w-full mb-3"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  ✨ Este áudio será enviado como mensagem de voz no WhatsApp
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = generatedAudioUrl
                      link.download = 'audio.mp3'
                      link.click()
                    }}
                    className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <IoDownload className="w-4 h-4" />
                    Baixar MP3
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6 bg-muted/30">
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
                disabled={!text.trim() || isGenerating}
                className="flex items-center gap-2"
              >
                <IoSend className="w-4 h-4" />
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
