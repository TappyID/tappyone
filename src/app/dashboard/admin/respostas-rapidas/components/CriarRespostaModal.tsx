'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Plus, 
  Trash2, 
  MessageCircle,
  Image,
  Mic,
  Video,
  File,
  CreditCard,
  Clock,
  Tag,
  Zap,
  Calendar,
  Settings
} from 'lucide-react'
import { useState } from 'react'
import { CategoriaResposta, CreateRespostaRequest } from '@/hooks/useRespostasRapidas'

interface CriarRespostaModalProps {
  categorias: CategoriaResposta[]
  onClose: () => void
  onSave: (data: CreateRespostaRequest) => Promise<void>
}

interface AcaoForm {
  tipo: 'texto' | 'imagem' | 'audio' | 'video' | 'arquivo' | 'pix' | 'delay'
  conteudo: any
  ordem: number
}

export default function CriarRespostaModal({
  categorias,
  onClose,
  onSave
}: CriarRespostaModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria_id: '',
    triggers: [''],
    agendamento_ativo: false,
    agendamento_config: {}
  })
  
  const [acoes, setAcoes] = useState<AcaoForm[]>([
    { tipo: 'texto', conteudo: { texto: '' }, ordem: 0 }
  ])
  
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basico' | 'acoes' | 'agendamento'>('basico')

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
    setAcoes(prev => prev.filter((_, i) => i !== index))
  }

  const updateAcao = (index: number, field: string, value: any) => {
    setAcoes(prev => prev.map((acao, i) => 
      i === index 
        ? { ...acao, conteudo: { ...acao.conteudo, [field]: value } }
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

    setLoading(true)
    try {
      const data: CreateRespostaRequest = {
        ...formData,
        triggers: validTriggers,
        acoes: acoes.map(({ tipo, conteudo, ordem }) => ({
          tipo,
          conteudo,
          ordem,
          ativo: true
        }))
      }
      
      await onSave(data)
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
        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tipoInfo?.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-medium text-gray-900">
              {tipoInfo?.label} #{index + 1}
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => removeAcao(index)}
            className="w-6 h-6 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {acao.tipo === 'texto' && (
          <textarea
            placeholder="Digite o texto da mensagem..."
            value={acao.conteudo.texto || ''}
            onChange={(e) => updateAcao(index, 'texto', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none resize-none"
            rows={3}
          />
        )}

        {(acao.tipo === 'imagem' || acao.tipo === 'video') && (
          <div className="space-y-3">
            <input
              type="url"
              placeholder="URL da mídia..."
              value={acao.conteudo.url || ''}
              onChange={(e) => updateAcao(index, 'url', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Legenda (opcional)..."
              value={acao.conteudo.caption || ''}
              onChange={(e) => updateAcao(index, 'caption', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
          </div>
        )}

        {acao.tipo === 'audio' && (
          <input
            type="url"
            placeholder="URL do áudio..."
            value={acao.conteudo.url || ''}
            onChange={(e) => updateAcao(index, 'url', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
          />
        )}

        {acao.tipo === 'arquivo' && (
          <div className="space-y-3">
            <input
              type="url"
              placeholder="URL do arquivo..."
              value={acao.conteudo.url || ''}
              onChange={(e) => updateAcao(index, 'url', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Nome do arquivo..."
              value={acao.conteudo.filename || ''}
              onChange={(e) => updateAcao(index, 'filename', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Descrição (opcional)..."
              value={acao.conteudo.caption || ''}
              onChange={(e) => updateAcao(index, 'caption', e.target.value)}
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
              className="w-20 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none text-center"
            />
            <span className="text-sm text-gray-600">segundos</span>
          </div>
        )}
      </motion.div>
    )
  }

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Nova Resposta Rápida</h2>
                  <p className="text-white/80 text-sm">Configure uma nova automação</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { id: 'basico', label: 'Básico', icon: Settings },
                { id: 'acoes', label: 'Ações', icon: Zap },
                { id: 'agendamento', label: 'Agendamento', icon: Calendar }
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                      placeholder="Ex: Bom dia personalizado"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none resize-none"
                      rows={3}
                      placeholder="Descreva o propósito desta resposta rápida..."
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={formData.categoria_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Palavras-chave (Triggers) *
                    </label>
                    <div className="space-y-3">
                      {formData.triggers.map((trigger, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={trigger}
                            onChange={(e) => updateTrigger(index, e.target.value)}
                            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                            placeholder="Ex: bom dia, oi, olá"
                          />
                          {formData.triggers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTrigger(index)}
                              className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addTrigger}
                        className="flex items-center gap-2 text-[#305e73] hover:text-[#3a6d84] font-medium"
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
                      <h3 className="text-lg font-semibold text-gray-900">Ações da Resposta</h3>
                      <p className="text-gray-600 text-sm">Configure as ações que serão executadas</p>
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
                            onClick={() => addAcao(tipo.tipo as any)}
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
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-2">Nenhuma ação configurada</p>
                      <p className="text-gray-500 text-sm">Adicione ações usando os botões acima</p>
                    </div>
                  )}
                </div>
              )}

              {/* Agendamento Tab */}
              {activeTab === 'agendamento' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="agendamento_ativo"
                      checked={formData.agendamento_ativo}
                      onChange={(e) => setFormData(prev => ({ ...prev, agendamento_ativo: e.target.checked }))}
                      className="w-4 h-4 text-[#305e73] border-gray-300 rounded focus:ring-[#305e73]"
                    />
                    <label htmlFor="agendamento_ativo" className="text-sm font-medium text-gray-700">
                      Ativar agendamento automático
                    </label>
                  </div>

                  {formData.agendamento_ativo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Funcionalidade em desenvolvimento:</strong> O sistema de agendamento será implementado em breve.
                        Por enquanto, as respostas serão ativadas apenas por triggers.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
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
                      Criar Resposta
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
