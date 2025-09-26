'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  Upload,
  FileText,
  Download,
  Check,
  AlertTriangle,
  Tag,
  Eye,
  EyeOff,
  Star,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface TagImport {
  nome: string
  descricao?: string
  cor: string
  categoria: string
  ativo: boolean
  favorito: boolean
  status: 'valid' | 'invalid' | 'duplicate'
  error?: string
}

interface ImportarTagsModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (tags: TagImport[]) => void
  existingTags: string[]
}

export default function ImportarTagsModal({ 
  isOpen, 
  onClose, 
  onImport,
  existingTags
}: ImportarTagsModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload')
  const [tagsToImport, setTagsToImport] = useState<TagImport[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let data: any[]

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content)
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(content)
        } else {
          throw new Error('Formato de arquivo não suportado')
        }

        const processedTags = processImportData(data)
        setTagsToImport(processedTags)
        setSelectedTags(processedTags.filter(tag => tag.status === 'valid').map((_, index) => index.toString()))
        setStep('preview')
      } catch (error) {
        alert('Erro ao processar arquivo: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })
  }

  const processImportData = (data: any[]): TagImport[] => {
    return data.map(item => {
      const tag: TagImport = {
        nome: item.nome || item.name || '',
        descricao: item.descricao || item.description || '',
        cor: item.cor || item.color || '#3b82f6',
        categoria: item.categoria || item.category || 'Geral',
        ativo: item.ativo !== undefined ? Boolean(item.ativo) : true,
        favorito: item.favorito !== undefined ? Boolean(item.favorito) : false,
        status: 'valid'
      }

      // Validações
      if (!tag.nome) {
        tag.status = 'invalid'
        tag.error = 'Nome é obrigatório'
      } else if (existingTags.includes(tag.nome.toLowerCase())) {
        tag.status = 'duplicate'
        tag.error = 'Tag já existe'
      } else if (!/^#[0-9A-F]{6}$/i.test(tag.cor)) {
        tag.cor = '#3b82f6' // Cor padrão se inválida
      }

      return tag
    })
  }

  const handleImport = async () => {
    const validTags = tagsToImport.filter((_, index) => 
      selectedTags.includes(index.toString()) && 
      tagsToImport[index].status === 'valid'
    )

    setStep('importing')
    setImportProgress(0)

    // Simular progresso de importação
    for (let i = 0; i <= 100; i += 10) {
      setImportProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    onImport(validTags)
    setStep('complete')
  }

  const handleSelectTag = (index: string) => {
    if (selectedTags.includes(index)) {
      setSelectedTags(selectedTags.filter(id => id !== index))
    } else {
      setSelectedTags([...selectedTags, index])
    }
  }

  const handleSelectAll = () => {
    const validIndexes = tagsToImport
      .map((tag, index) => tag.status === 'valid' ? index.toString() : null)
      .filter(Boolean) as string[]
    
    if (selectedTags.length === validIndexes.length) {
      setSelectedTags([])
    } else {
      setSelectedTags(validIndexes)
    }
  }

  const downloadTemplate = () => {
    const template = [
      'nome,descricao,cor,categoria,ativo,favorito',
      'Urgente,Para itens que precisam de atenção imediata,#ef4444,Prioridade,true,false',
      'Cliente VIP,Para clientes importantes,#10b981,Cliente,true,true',
      'Bug,Para reportar problemas,#f59e0b,Tipo,true,false'
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-tags.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetModal = () => {
    setStep('upload')
    setTagsToImport([])
    setSelectedTags([])
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'valid': return 'text-green-400 bg-green-900/30'
        case 'invalid': return 'text-red-400 bg-red-900/30'
        case 'duplicate': return 'text-yellow-400 bg-yellow-900/30'
        default: return 'text-gray-400 bg-gray-700'
      }
    } else {
      switch (status) {
        case 'valid': return 'text-green-600 bg-green-100'
        case 'invalid': return 'text-red-600 bg-red-100'
        case 'duplicate': return 'text-yellow-600 bg-yellow-100'
        default: return 'text-gray-600 bg-gray-100'
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <Check className="w-4 h-4" />
      case 'invalid': return <X className="w-4 h-4" />
      case 'duplicate': return <AlertTriangle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className={`fixed inset-0 backdrop-blur-sm z-50 ${
              isDark ? 'bg-black/70' : 'bg-black/50'
            }`}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Header */}
              <div className={`px-6 py-4 ${
                isDark 
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600' 
                  : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Importar Tags</h2>
                      <p className="text-white/80">
                        {step === 'upload' && 'Faça upload de um arquivo CSV ou JSON'}
                        {step === 'preview' && `${tagsToImport.length} tags encontradas`}
                        {step === 'importing' && 'Importando tags...'}
                        {step === 'complete' && 'Importação concluída!'}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Upload Step */}
                {step === 'upload' && (
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                      isDark 
                        ? 'border-slate-600 hover:border-slate-500' 
                        : 'border-gray-300 hover:border-[#305e73]'
                    }`}>
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                        isDark ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        <Upload className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Arraste um arquivo ou clique para selecionar
                      </h3>
                      <p className={`mb-6 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Suportamos arquivos CSV e JSON com as tags a serem importadas
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`text-white px-6 py-3 rounded-xl font-semibold ${
                          isDark 
                            ? 'bg-gradient-to-r from-slate-600 to-slate-500' 
                            : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
                        }`}
                      >
                        Selecionar Arquivo
                      </motion.button>
                    </div>

                    {/* Template Download */}
                    <div className={`border rounded-xl p-4 ${
                      isDark 
                        ? 'bg-blue-900/20 border-blue-700' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 ${
                            isDark ? 'text-blue-300' : 'text-blue-800'
                          }`}>Precisa de um template?</h4>
                          <p className={`text-sm mb-3 ${
                            isDark ? 'text-blue-200' : 'text-blue-700'
                          }`}>
                            Baixe nosso template CSV com exemplos para facilitar a importação.
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={downloadTemplate}
                            className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                              isDark 
                                ? 'bg-blue-700 hover:bg-blue-600' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <Download className="w-4 h-4" />
                            Baixar Template
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Format Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-xl p-4 ${
                        isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}>
                        <h4 className={`font-semibold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>Formato CSV</h4>
                        <p className={`text-sm mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Colunas: nome, descricao, cor, categoria, ativo, favorito
                        </p>
                        <code className={`text-xs p-2 rounded block ${
                          isDark ? 'bg-slate-800 text-gray-200' : 'bg-white text-gray-900'
                        }`}>
                          nome,descricao,cor,categoria,ativo,favorito<br/>
                          Urgente,Para itens urgentes,#ef4444,Prioridade,true,false
                        </code>
                      </div>
                      
                      <div className={`rounded-xl p-4 ${
                        isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}>
                        <h4 className={`font-semibold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>Formato JSON</h4>
                        <p className={`text-sm mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Array de objetos com as propriedades das tags
                        </p>
                        <code className={`text-xs p-2 rounded block ${
                          isDark ? 'bg-slate-800 text-gray-200' : 'bg-white text-gray-900'
                        }`}>
                          {`[{
  "nome": "Urgente",
  "cor": "#ef4444",
  "categoria": "Prioridade"
}]`}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview Step */}
                {step === 'preview' && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className={`rounded-xl p-4 text-center ${
                        isDark ? 'bg-green-900/30' : 'bg-green-50'
                      }`}>
                        <div className={`text-2xl font-bold ${
                          isDark ? 'text-green-400' : 'text-green-600'
                        }`}>
                          {tagsToImport.filter(tag => tag.status === 'valid').length}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-green-300' : 'text-green-700'
                        }`}>Válidas</div>
                      </div>
                      <div className={`rounded-xl p-4 text-center ${
                        isDark ? 'bg-red-900/30' : 'bg-red-50'
                      }`}>
                        <div className={`text-2xl font-bold ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {tagsToImport.filter(tag => tag.status === 'invalid').length}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-red-300' : 'text-red-700'
                        }`}>Inválidas</div>
                      </div>
                      <div className={`rounded-xl p-4 text-center ${
                        isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'
                      }`}>
                        <div className={`text-2xl font-bold ${
                          isDark ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>
                          {tagsToImport.filter(tag => tag.status === 'duplicate').length}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-yellow-300' : 'text-yellow-700'
                        }`}>Duplicadas</div>
                      </div>
                      <div className={`rounded-xl p-4 text-center ${
                        isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}>
                        <div className={`text-2xl font-bold ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {selectedTags.length}
                        </div>
                        <div className={`text-sm ${
                          isDark ? 'text-blue-300' : 'text-blue-700'
                        }`}>Selecionadas</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Tags para Importar ({tagsToImport.length})
                      </h3>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedTags(tagsToImport.map(t => t.nome))}
                          className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            isDark 
                              ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          Selecionar Todos
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedTags([])}
                          className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            isDark 
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Limpar Seleção
                        </motion.button>
                      </div>
                    </div>

                    {/* Tags List */}
                    <div className={`rounded-xl border overflow-hidden ${
                      isDark ? 'bg-slate-800/50 border-slate-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`px-4 py-3 border-b ${
                        isDark 
                          ? 'bg-slate-700/50 border-slate-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className={`grid grid-cols-12 gap-4 text-sm font-semibold ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              checked={selectedTags.length === tagsToImport.filter(tag => tag.status === 'valid').length}
                              onChange={handleSelectAll}
                              className={`rounded focus:ring-2 ${
                                isDark 
                                  ? 'border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500' 
                                  : 'border-gray-300 text-[#305e73] focus:ring-[#305e73]'
                              }`}
                            />
                          </div>
                          <div className="col-span-3">Tag</div>
                          <div className="col-span-2">Categoria</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-2">Configurações</div>
                          <div className="col-span-2">Erro</div>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {tagsToImport.map((tag, index) => (
                          <div key={index} className={`flex items-center p-4 transition-colors ${
                            index !== tagsToImport.length - 1 
                              ? (isDark ? 'border-b border-slate-600' : 'border-b border-gray-100') 
                              : ''
                          } ${
                            isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                          }`}>
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag.nome)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTags([...selectedTags, tag.nome])
                                } else {
                                  setSelectedTags(selectedTags.filter(t => t !== tag.nome))
                                }
                              }}
                              className={`mr-3 rounded focus:ring-2 ${
                                isDark 
                                  ? 'border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500' 
                                  : 'focus:ring-[#305e73] text-[#305e73]'
                              }`}
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: tag.cor }} />
                                <span className={`font-medium ${
                                  isDark ? 'text-white' : 'text-gray-900'
                                }`}>{tag.nome}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tag.status)}`}>
                                  {getStatusIcon(tag.status)}
                                </span>
                              </div>
                              {tag.descricao && (
                                <p className={`text-sm mt-1 ${
                                  isDark ? 'text-gray-300' : 'text-gray-600'
                                }`}>{tag.descricao}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Importing Step */}
                {step === 'importing' && (
                  <div className="text-center py-12">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      isDark ? 'bg-slate-700/50' : 'bg-[#305e73]/10'
                    }`}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className={`w-10 h-10 ${
                          isDark ? 'text-slate-400' : 'text-[#305e73]'
                        }`} />
                      </motion.div>
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Importando Tags</h3>
                    <p className={`mb-6 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Processando {selectedTags.length} tags selecionadas...
                    </p>
                    
                    <div className={`w-full max-w-md mx-auto rounded-full h-3 mb-4 ${
                      isDark ? 'bg-slate-700' : 'bg-gray-200'
                    }`}>
                      <motion.div 
                        className={`h-3 rounded-full ${
                          isDark 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' 
                            : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${importProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>{importProgress}% concluído</p>
                    
                    <div className="space-y-4">
                      <div className={`rounded-xl p-4 ${
                        isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                          }`}>
                            <FileText className={`w-4 h-4 ${
                              isDark ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>Formato CSV</h4>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>Nome, Descrição, Categoria, Cor</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`rounded-xl p-4 ${
                        isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-green-900/30' : 'bg-green-100'
                          }`}>
                            <FileText className={`w-4 h-4 ${
                              isDark ? 'text-green-400' : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>Formato JSON</h4>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>Array de objetos com propriedades da tag</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complete Step */}
                {step === 'complete' && (
                  <div className="text-center py-12">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      isDark ? 'bg-green-900/30' : 'bg-green-100'
                    }`}>
                      <Check className={`w-10 h-10 ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`} />
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Importação Concluída!</h3>
                    <p className={`mb-6 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedTags.length} tags foram importadas com sucesso.
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClose}
                      className={`text-white px-6 py-3 rounded-xl font-semibold ${
                        isDark 
                          ? 'bg-gradient-to-r from-slate-600 to-slate-500' 
                          : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
                      }`}
                    >
                      Fechar
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {step === 'preview' && (
                <div className={`px-6 py-4 border-t ${
                  isDark 
                    ? 'bg-slate-800/50 border-slate-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('upload')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                        isDark 
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Voltar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleImport}
                      disabled={selectedTags.length === 0}
                      className={`flex-1 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark 
                          ? 'bg-gradient-to-r from-slate-600 to-slate-500' 
                          : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
                      }`}
                    >
                      Importar {selectedTags.length} Tags
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
