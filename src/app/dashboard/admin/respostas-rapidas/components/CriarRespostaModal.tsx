'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  X, 
  MessageCircle, 
  Mic, 
  Image, 
  Video, 
  File, 
  CreditCard, 
  Clock, 
  Settings, 
  Zap, 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Music 
} from 'lucide-react'
import { AudioRecorder } from '@/components/shared/AudioRecorder'
import MediaUpload from '@/components/shared/MediaUpload'
import { useTheme } from '@/contexts/ThemeContext'

interface CreateRespostaRequest {
  titulo: string
  descricao?: string
  categoria_id?: string
  triggers: string[]
  ativo: boolean
  automatico: boolean
  fallback: boolean
  agendamento_ativo?: boolean
  agendamento_config?: any
  acoes: Acao[]
}

interface Acao {
  tipo: string
  ordem: number
  conteudo: any
  ativo: boolean
}

interface CriarRespostaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateRespostaRequest) => Promise<void>
  onUpdate?: (id: string, data: Partial<CreateRespostaRequest>) => Promise<void>
  categorias: any[]
  editingResposta?: any
  fetchCategorias?: () => Promise<void>
}

interface AcaoForm {
  tipo: 'texto' | 'imagem' | 'audio' | 'video' | 'arquivo' | 'pix' | 'delay'
  conteudo: any
  ordem: number
}

export default function CriarRespostaModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onUpdate, 
  categorias, 
  editingResposta,
  fetchCategorias 
}: CriarRespostaModalProps) {
  const { actualTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [acoes, setAcoes] = useState<AcaoForm[]>([])
  const [activeTab, setActiveTab] = useState<'basico' | 'acoes' | 'regras'>('basico')
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    triggers: [''],
    ativo: true,
    automatico: false,
    fallback: false,
    agendamento_ativo: false,
    agendamento_config: {}
  })

  // Carregar dados quando estiver editando
  useEffect(() => {
    if (editingResposta) {
      console.log('Loading editing data:', editingResposta)
      
      // Garantir que triggers seja sempre um array válido
      let triggersArray = []
      if (Array.isArray(editingResposta.triggers)) {
        triggersArray = editingResposta.triggers
      } else if (typeof editingResposta.triggers === 'string') {
        triggersArray = editingResposta.triggers.split(',').map((t: string) => t.trim())
      }
      if (triggersArray.length === 0) {
        triggersArray = ['']
      }

      setFormData({
        titulo: editingResposta.titulo || '',
        descricao: editingResposta.descricao || '',
        categoria_id: editingResposta.categoria_id || '',
        triggers: triggersArray,
        ativo: editingResposta.ativo ?? true,
        automatico: editingResposta.automatico ?? false,
        fallback: editingResposta.fallback ?? false,
        agendamento_ativo: editingResposta.agendamento_ativo ?? false,
        agendamento_config: editingResposta.agendamento_config || {}
      })
      
      // Carregar ações
      let acoesArray = []
      if (Array.isArray(editingResposta.acoes) && editingResposta.acoes.length > 0) {
        acoesArray = editingResposta.acoes.map((acao: any, index: number) => {
          let processedConteudo = acao.conteudo
          
          if (typeof acao.conteudo === 'string') {
            try {
              const parsed = JSON.parse(acao.conteudo)
              if (parsed && typeof parsed === 'object' && '0' in parsed && '1' in parsed) {
                if (parsed.texto) {
                  processedConteudo = { texto: parsed.texto }
                } else {
                  processedConteudo = parsed
                }
              } else {
                processedConteudo = parsed
              }
            } catch (e) {
              // Se não conseguir fazer parse, tratar como texto simples ou objeto
              if (acao.tipo === 'texto') {
                processedConteudo = { texto: acao.conteudo }
              } else {
                processedConteudo = acao.conteudo
              }
            }
          }
          
          // Log para debug de ações de áudio
          if (acao.tipo === 'audio') {
            console.log('🎵 Carregando ação de áudio:', {
              tipo: acao.tipo,
              conteudo: processedConteudo,
              originalConteudo: acao.conteudo
            })
          }
          
          return {
            tipo: acao.tipo,
            conteudo: processedConteudo,
            ordem: acao.ordem || index + 1
          }
        })
      }
      setAcoes(acoesArray)
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        categoria_id: '',
        triggers: [''],
        ativo: true,
        automatico: false,
        fallback: false,
        agendamento_ativo: false,
        agendamento_config: {}
      })
      setAcoes([])
    }
  }, [editingResposta])

  const tiposAcao = [
    { tipo: 'texto', label: 'Texto', icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
    { tipo: 'imagem', label: 'Imagem', icon: Image, color: 'bg-green-100 text-green-600' },
    { tipo: 'audio', label: 'Áudio', icon: Mic, color: 'bg-purple-100 text-purple-600' },
    { tipo: 'video', label: 'Vídeo', icon: Video, color: 'bg-red-100 text-red-600' },
    { tipo: 'arquivo', label: 'Arquivo', icon: File, color: 'bg-orange-100 text-orange-600' },
    { tipo: 'pix', label: 'PIX', icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
    { tipo: 'delay', label: 'Delay', icon: Clock, color: 'bg-gray-100 text-gray-600' }
  ]

  const addTrigger = () => {
    setFormData(prev => ({
      ...prev,
      triggers: [...prev.triggers, '']
    }))
  }

  const removeTrigger = (index: number) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index)
    }))
  }

  const updateTrigger = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.map((trigger, i) => i === index ? value : trigger)
    }))
  }

  const addAcao = (tipo: AcaoForm['tipo']) => {
    const newAcao: AcaoForm = {
      tipo,
      ordem: acoes.length,
      conteudo: getDefaultContent(tipo)
    }
    setAcoes(prev => [...prev, newAcao])
  }

  const removeAcao = (index: number) => {
    setAcoes(prev => prev.filter((_, i) => i !== index).map((acao, i) => ({ ...acao, ordem: i })))
  }

  const moveAcao = (fromIndex: number, toIndex: number) => {
    setAcoes(prev => {
      const newAcoes = [...prev]
      const [movedItem] = newAcoes.splice(fromIndex, 1)
      newAcoes.splice(toIndex, 0, movedItem)
      return newAcoes.map((acao, i) => ({ ...acao, ordem: i }))
    })
  }

  const updateAcao = (index: number, field: string, value: any) => {
    setAcoes(prev => prev.map((acao, i) => 
      i === index 
        ? { ...acao, conteudo: { ...acao.conteudo, [field]: value } }
        : acao
    ))
  }

  const updateAcaoConteudo = (index: number, novoConteudo: any) => {
    setAcoes(prev => prev.map((acao, i) => 
      i === index 
        ? { ...acao, conteudo: novoConteudo }
        : acao
    ))
  }

  const getDefaultContent = (tipo: AcaoForm['tipo']) => {
    switch (tipo) {
      case 'texto':
        return { texto: '' }
      case 'imagem':
        return { url: '', caption: '' }
      case 'audio':
        return { url: '' }
      case 'video':
        return { url: '', caption: '' }
      case 'arquivo':
        return { url: '', filename: '', caption: '' }
      case 'pix':
        return { chave: '', valor: '', descricao: '' }
      case 'delay':
        return { segundos: 5 }
      default:
        return {}
    }
  }

  const handleCriarCategoria = async () => {
    if (!novaCategoria.trim()) return
    
    try {
      setLoading(true)
      console.log('Criando categoria:', novaCategoria.trim())
      
      const response = await fetch('/api/respostas-rapidas/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nome: novaCategoria.trim(),
          descricao: `Categoria ${novaCategoria.trim()}`
        })
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        await fetchCategorias() // Recarregar categoriasProps
        setFormData(prev => ({ ...prev, categoria_id: responseData.id }))
        setShowCategoriaModal(false)
        setNovaCategoria('')
        console.log('Categoria criada com sucesso!')
      } else {
        console.error('Erro na resposta:', responseData)
        alert('Erro ao criar categoria: ' + (responseData.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      alert('Erro ao criar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo.trim()) {
      alert('Título é obrigatório')
      return
    }

    if (acoes.length === 0) {
      alert('Adicione pelo menos uma ação')
      return
    }

    const validTriggers = formData.triggers.filter(t => t.trim())
    if (validTriggers.length === 0) {
      alert('Adicione pelo menos um trigger')
      return
    }

    console.log('💾 Iniciando salvamento da resposta rápida...')
    console.log('📋 Ações antes do submit:', acoes)

    setLoading(true)
    try {
      const processedAcoes = acoes.map(({ tipo, conteudo, ordem }) => {
        const processedAction = {
          tipo,
          conteudo: typeof conteudo === 'string' ? JSON.parse(conteudo) : conteudo,
          ordem,
          ativo: true
        }
        
        if (tipo === 'audio') {
          console.log('🎵 Processando ação de áudio:', { tipo, conteudo, ordem })
        }
        
        return processedAction
      })

      const data: CreateRespostaRequest = {
        ...formData,
        categoria_id: formData.categoria_id || undefined, // Converter string vazia para undefined
        triggers: validTriggers,
        acoes: processedAcoes
      }
      
      console.log('🚀 Dados sendo enviados para o backend:', data)
      console.log('🎵 Ações de áudio encontradas:', data.acoes.filter(a => a.tipo === 'audio'))
      
      if (editingResposta && onUpdate) {
        await onUpdate(editingResposta.id, data)
      } else {
        await onSave(data)
      }
      
      console.log('✅ Resposta salva com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar resposta rápida')
    } finally {
      setLoading(false)
    }
  }

  const renderAcaoForm = (acao: AcaoForm, index: number) => {
    const tipoInfo = tiposAcao.find(t => t.tipo === acao.tipo)
    const Icon = tipoInfo?.icon || MessageCircle

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border ${
          actualTheme === 'dark'
            ? 'bg-slate-800/60 border-slate-600'
            : 'bg-gray-50 border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <GripVertical className={`w-4 h-4 cursor-move ${
                actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
              }`} />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                actualTheme === 'dark'
                  ? 'bg-blue-900/50 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {index + 1}
              </div>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tipoInfo?.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`font-medium ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {tipoInfo?.label}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {index > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  moveAcao(index, index - 1)
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  actualTheme === 'dark'
                    ? 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Mover para cima"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
            {index < acoes.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  moveAcao(index, index + 1)
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  actualTheme === 'dark'
                    ? 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Mover para baixo"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeAcao(index)
              }}
              className="w-6 h-6 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
              title="Remover ação"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {acao.tipo === 'texto' && (
          <textarea
            placeholder="Digite o texto da mensagem..."
            value={acao.conteudo.texto || ''}
            onChange={(e) => updateAcaoConteudo(index, { ...acao.conteudo, texto: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none text-sm resize-none"
            rows={3}
          />
        )}

        {acao.tipo === 'audio' && (
          <div className="space-y-4">
            {/* Debug info */}
            <div className={`text-xs p-2 rounded ${
              actualTheme === 'dark'
                ? 'text-slate-400 bg-slate-800'
                : 'text-gray-500 bg-gray-50'
            }`}>
              Debug: currentAudioUrl = "{acao.conteudo.url || 'EMPTY'}"
              <br/>
              Conteúdo completo: {JSON.stringify(acao.conteudo)}
            </div>
            <AudioRecorder
              onAudioReady={async (file, url) => {
                console.log('🎵 onAudioReady chamado:', { fileName: file.name, fileSize: file.size, localUrl: url })
                try {
                  const formData = new FormData()
                  formData.append('file', file)
                  
                  console.log('🔄 Fazendo upload para blob storage...')
                  const response = await fetch('/api/upload/blob', {
                    method: 'POST',
                    body: formData
                  })
                  
                  if (response.ok) {
                    const { url: blobUrl } = await response.json()
                    console.log('✅ Upload successful, blob URL:', blobUrl)
                    
                    const novoConteudo = { 
                      url: blobUrl,
                      arquivo_nome: file.name,
                      arquivo_tamanho: file.size,
                      tipo: 'audio'
                    }
                    
                    console.log('💾 Atualizando conteúdo da ação:', { index, novoConteudo })
                    updateAcaoConteudo(index, novoConteudo)
                    
                    // Log do estado atual das ações após update
                    setTimeout(() => {
                      console.log('📋 Estado atual das ações:', acoes)
                    }, 100)
                  } else {
                    console.error('❌ Erro ao fazer upload do áudio:', response.status)
                  }
                } catch (error) {
                  console.error('❌ Erro ao processar áudio:', error)
                }
              }}
              onRemove={() => {
                updateAcaoConteudo(index, { 
                  ...acao.conteudo, 
                  url: '',
                  arquivo_nome: '',
                  arquivo_tamanho: 0,
                  tipo: 'arquivo'
                })
              }}
              currentAudioUrl={acao.conteudo.url}
              key={`audio-${index}-${acao.conteudo.url || 'empty'}`}
            />
            
            {/* Opção alternativa: Upload de arquivo de áudio */}
            <div className="border-t pt-4">
              <p className={`text-sm mb-2 ${
                actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
              }`}>Ou faça upload de um arquivo de áudio:</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        
                        const response = await fetch('/api/upload/blob', {
                          method: 'POST',
                          body: formData
                        })
                        
                        if (response.ok) {
                          const { url: blobUrl } = await response.json()
                          updateAcaoConteudo(index, { 
                            ...acao.conteudo, 
                            url: blobUrl,
                            arquivo_nome: file.name,
                            arquivo_tamanho: file.size,
                            tipo: 'arquivo'
                          })
                        }
                      } catch (error) {
                        console.error('Erro ao fazer upload:', error)
                      }
                    }
                  }}
                  className="w-full"
                />
                {acao.conteudo.arquivo_nome && (
                  <div className="mt-2 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span className="text-sm">{acao.conteudo.arquivo_nome}</span>
                    <button
                      onClick={() => {
                        updateAcaoConteudo(index, { 
                          ...acao.conteudo, 
                          url: '',
                          arquivo_nome: '',
                          arquivo_tamanho: 0,
                          tipo: 'arquivo'
                        })
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(acao.tipo === 'imagem' || acao.tipo === 'video') && (
          <div className="space-y-3">
            <MediaUpload
              type={acao.tipo === 'imagem' ? 'image' : 'video'}
              onUpload={(file, url) => {
                updateAcaoConteudo(index, { 
                  ...acao.conteudo, 
                  url: url || '',
                  filename: file.name 
                })
              }}
              onRemove={() => {
                updateAcaoConteudo(index, { 
                  ...acao.conteudo, 
                  url: '', 
                  filename: '' 
                })
              }}
              currentFile={acao.conteudo.url}
              currentFileName={acao.conteudo.filename}
              maxSizeMB={50}
            />
            <input
              type="text"
              placeholder="Descrição (opcional)..."
              value={acao.conteudo.caption || ''}
              onChange={(e) => updateAcaoConteudo(index, { ...acao.conteudo, caption: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
          </div>
        )}

        {acao.tipo === 'arquivo' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="*/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    try {
                      const formData = new FormData()
                      formData.append('file', file)
                      
                      const response = await fetch('/api/upload/blob', {
                        method: 'POST',
                        body: formData
                      })
                      
                      if (response.ok) {
                        const { url: blobUrl } = await response.json()
                        updateAcaoConteudo(index, { 
                          ...acao.conteudo, 
                          url: blobUrl,
                          arquivo_nome: file.name,
                          arquivo_tamanho: file.size,
                          tipo: 'arquivo'
                        })
                      }
                    } catch (error) {
                      console.error('Erro ao fazer upload:', error)
                    }
                  }
                }}
                className="w-full"
              />
              {acao.conteudo.arquivo_nome && (
                <div className="mt-2 flex items-center gap-2">
                  <File className="w-4 h-4" />
                  <span className="text-sm">{acao.conteudo.arquivo_nome}</span>
                  <button
                    type="button"
                    onClick={() => {
                      updateAcaoConteudo(index, { 
                        ...acao.conteudo, 
                        url: '',
                        arquivo_nome: '',
                        arquivo_tamanho: 0
                      })
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Descrição (opcional)..."
              value={acao.conteudo.caption || ''}
              onChange={(e) => updateAcaoConteudo(index, { ...acao.conteudo, caption: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
          </div>
        )}

        {acao.tipo === 'pix' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Chave PIX..."
              value={acao.conteudo.chave || ''}
              onChange={(e) => updateAcao(index, 'chave', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$)..."
              value={acao.conteudo.valor || ''}
              onChange={(e) => updateAcao(index, 'valor', parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Descrição do pagamento..."
              value={acao.conteudo.descricao || ''}
              onChange={(e) => updateAcao(index, 'descricao', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
          </div>
        )}

        {acao.tipo === 'delay' && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Aguardar:
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={acao.conteudo.segundos || 5}
              onChange={(e) => updateAcao(index, 'segundos', parseInt(e.target.value) || 5)}
              className={`w-20 p-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none text-center ${
                actualTheme === 'dark'
                  ? 'border-slate-600 bg-slate-800 text-white'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            />
            <span className={`text-sm ${
              actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
            }`}>segundos</span>
          </div>
        )}
      </motion.div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          actualTheme === 'dark' ? 'bg-black/70' : 'bg-black/50'
        }`}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl ${
            actualTheme === 'dark'
              ? 'bg-slate-900/95 border border-slate-700/50'
              : 'bg-white/95'
          }`}
        >
          {/* Header */}
          <div className={`p-6 text-white ${
            actualTheme === 'dark'
              ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl border-b border-slate-600/30'
              : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actualTheme === 'dark' ? 'bg-slate-600/50' : 'bg-white/20'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Nova Resposta Rápida</h2>
                  <p className="text-white/70 text-sm">Configure uma nova automação</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { id: 'basico', label: 'Básico', icon: Settings },
                { id: 'acoes', label: 'Ações', icon: Zap },
                { id: 'regras', label: 'Regras', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Básico Tab */}
              {activeTab === 'basico' && (
                <div className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800/60 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Ex: Bom dia personalizado"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none resize-none transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800/60 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      rows={3}
                      placeholder="Descreva o propósito desta resposta rápida..."
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`block text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>
                        Categoria
                      </label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCategoriaModal(true)
                        }}
                        className="text-xs text-[#305e73] hover:text-[#2a5365] font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Nova categoria
                      </button>
                    </div>
                    <select
                      value={formData.categoria_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800/60 border-slate-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Triggers */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      Palavras-chave (Triggers) *
                    </label>
                    <div className="space-y-3">
                      {formData.triggers.map((trigger, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={trigger}
                            onChange={(e) => updateTrigger(index, e.target.value)}
                            className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none transition-colors ${
                              actualTheme === 'dark'
                                ? 'bg-slate-800/60 border-slate-600 text-white placeholder-slate-400'
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="Ex: bom dia, oi, olá"
                          />
                          {formData.triggers.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeTrigger(index)
                              }}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                actualTheme === 'dark'
                                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          addTrigger()
                        }}
                        className={`flex items-center gap-2 font-medium transition-colors ${
                          actualTheme === 'dark'
                            ? 'text-blue-400 hover:text-blue-300'
                            : 'text-[#305e73] hover:text-[#3a6d84]'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar trigger
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Ações Tab */}
              {activeTab === 'acoes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Ações da Resposta</h3>
                      <p className={`text-sm ${
                        actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                      }`}>Configure as ações que serão executadas</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {tiposAcao.map((tipo) => {
                        const Icon = tipo.icon
                        return (
                          <motion.button
                            key={tipo.tipo}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              addAcao(tipo.tipo as any)
                            }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${tipo.color} hover:shadow-lg transition-all`}
                            title={`Adicionar ${tipo.label}`}
                          >
                            <Icon className="w-4 h-4" />
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {acoes.map((acao, index) => renderAcaoForm(acao, index))}
                  </div>

                  {acoes.length === 0 && (
                    <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/50 border-slate-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <Zap className={`w-12 h-12 mx-auto mb-3 ${
                        actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                      }`} />
                      <p className={`font-medium mb-2 ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-600'
                      }`}>Nenhuma ação configurada</p>
                      <p className={`text-sm ${
                        actualTheme === 'dark' ? 'text-white/70' : 'text-gray-500'
                      }`}>Adicione ações usando os botões acima</p>
                    </div>
                  )}
                </div>
              )}

              {/* Regras Tab */}
              {activeTab === 'regras' && (
                <div className="space-y-6">
                  {/* Status da Resposta */}
                  <div className={`rounded-xl p-4 space-y-4 ${
                    actualTheme === 'dark'
                      ? 'bg-slate-800/50 border border-slate-700'
                      : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Status da Resposta</h3>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="ativo"
                        checked={formData.ativo}
                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                        className="w-4 h-4 text-[#305e73] border-gray-300 rounded focus:ring-[#305e73]"
                      />
                      <label htmlFor="ativo" className={`text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>
                        Resposta ativa
                      </label>
                    </div>
                  </div>

                  {/* Modo de Operação */}
                  <div className={`rounded-xl p-4 space-y-4 ${
                    actualTheme === 'dark'
                      ? 'bg-slate-800/50 border border-slate-700'
                      : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Modo de Operação</h3>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="automatico"
                        checked={formData.automatico}
                        onChange={(e) => setFormData(prev => ({ ...prev, automatico: e.target.checked }))}
                        className="w-4 h-4 text-[#305e73] border-gray-300 rounded focus:ring-[#305e73]"
                      />
                      <label htmlFor="automatico" className={`text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>
                        Modo automático
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="fallback"
                        checked={formData.fallback}
                        onChange={(e) => setFormData(prev => ({ ...prev, fallback: e.target.checked }))}
                        className="w-4 h-4 text-[#305e73] border-gray-300 rounded focus:ring-[#305e73]"
                      />
                      <label htmlFor="fallback" className={`text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>
                        Resposta fallback
                      </label>
                    </div>
                  </div>

                  {/* Informações sobre os modos */}
                  <div className={`rounded-xl p-4 border ${
                    actualTheme === 'dark'
                      ? 'bg-blue-900/30 border-blue-800/30'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className={`space-y-2 text-sm ${
                      actualTheme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      <p><strong>Modo Automático:</strong> A resposta será enviada automaticamente quando os triggers forem detectados.</p>
                      <p><strong>Modo Manual:</strong> A resposta aparecerá nas ações rápidas para envio manual.</p>
                      <p><strong>Fallback:</strong> Será usada quando nenhuma outra resposta for encontrada.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`border-t p-6 ${
              actualTheme === 'dark'
                ? 'border-slate-700 bg-slate-900/50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-2 font-medium transition-colors ${
                    actualTheme === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-8 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      {editingResposta ? 'Editar Resposta' : 'Criar Resposta'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
        
        {/* Modal para criar categoria */}
        {isOpen && (
        <AnimatePresence>
          {showCategoriaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 flex items-center justify-center z-[60] ${
                actualTheme === 'dark' ? 'bg-black/70' : 'bg-black/50'
              }`}
              onClick={() => setShowCategoriaModal(false)}
            >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-xl shadow-xl w-full max-w-md mx-4 ${
                actualTheme === 'dark'
                  ? 'bg-slate-900 border border-slate-700'
                  : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Nova Categoria</h3>
                  <button
                    onClick={() => setShowCategoriaModal(false)}
                    className={`transition-colors ${
                      actualTheme === 'dark'
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>
                      Nome da categoria
                    </label>
                    <input
                      type="text"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      placeholder="Ex: Vendas, Suporte, Cobrança..."
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800/60 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleCriarCategoria()}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCategoriaModal(false)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        actualTheme === 'dark'
                          ? 'text-white bg-slate-700 hover:bg-slate-600'
                          : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCriarCategoria}
                      disabled={!novaCategoria.trim() || loading}
                      className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                        actualTheme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-[#305e73] hover:bg-[#2a5365]'
                      } disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Criar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
