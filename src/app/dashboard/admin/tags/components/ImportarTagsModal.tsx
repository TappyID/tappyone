'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100'
      case 'invalid': return 'text-red-600 bg-red-100'
      case 'duplicate': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
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
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#305e73] transition-colors">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Arraste um arquivo ou clique para selecionar
                      </h3>
                      <p className="text-gray-600 mb-6">
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
                        className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-semibold"
                      >
                        Selecionar Arquivo
                      </motion.button>
                    </div>

                    {/* Template Download */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 mb-1">Precisa de um template?</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Baixe nosso template CSV com exemplos para facilitar a importação.
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={downloadTemplate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Baixar Template
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Format Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Formato CSV</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Colunas: nome, descricao, cor, categoria, ativo, favorito
                        </p>
                        <code className="text-xs bg-white p-2 rounded block">
                          nome,descricao,cor,categoria,ativo,favorito<br/>
                          Urgente,Para itens urgentes,#ef4444,Prioridade,true,false
                        </code>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Formato JSON</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Array de objetos com as propriedades das tags
                        </p>
                        <code className="text-xs bg-white p-2 rounded block">
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
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {tagsToImport.filter(tag => tag.status === 'valid').length}
                        </div>
                        <div className="text-sm text-green-700">Válidas</div>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {tagsToImport.filter(tag => tag.status === 'invalid').length}
                        </div>
                        <div className="text-sm text-red-700">Inválidas</div>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {tagsToImport.filter(tag => tag.status === 'duplicate').length}
                        </div>
                        <div className="text-sm text-yellow-700">Duplicadas</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedTags.length}
                        </div>
                        <div className="text-sm text-blue-700">Selecionadas</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={handleSelectAll}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          {selectedTags.length === tagsToImport.filter(tag => tag.status === 'valid').length 
                            ? 'Desmarcar Todas' 
                            : 'Selecionar Válidas'
                          }
                        </motion.button>
                      </div>
                    </div>

                    {/* Tags List */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                          <div className="col-span-1">
                            <input
                              type="checkbox"
                              checked={selectedTags.length === tagsToImport.filter(tag => tag.status === 'valid').length}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
                            />
                          </div>
                          <div className="col-span-3">Tag</div>
                          <div className="col-span-2">Categoria</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-2">Configurações</div>
                          <div className="col-span-2">Erro</div>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {tagsToImport.map((tag, index) => (
                          <div key={index} className="px-4 py-3 hover:bg-gray-50">
                            <div className="grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-1">
                                <input
                                  type="checkbox"
                                  checked={selectedTags.includes(index.toString())}
                                  onChange={() => handleSelectTag(index.toString())}
                                  disabled={tag.status !== 'valid'}
                                  className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73] disabled:opacity-50"
                                />
                              </div>

                              <div className="col-span-3">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: tag.cor }}
                                  >
                                    <Tag className="w-3 h-3 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{tag.nome}</div>
                                    {tag.descricao && (
                                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                        {tag.descricao}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="col-span-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                  {tag.categoria}
                                </span>
                              </div>

                              <div className="col-span-2">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tag.status)}`}>
                                  {getStatusIcon(tag.status)}
                                  {tag.status === 'valid' && 'Válida'}
                                  {tag.status === 'invalid' && 'Inválida'}
                                  {tag.status === 'duplicate' && 'Duplicada'}
                                </div>
                              </div>

                              <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                  {tag.ativo ? (
                                    <Eye className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                  )}
                                  {tag.favorito && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                              </div>

                              <div className="col-span-2">
                                {tag.error && (
                                  <span className="text-xs text-red-600">{tag.error}</span>
                                )}
                              </div>
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
                    <div className="w-20 h-20 bg-[#305e73]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-10 h-10 text-[#305e73]" />
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Importando Tags</h3>
                    <p className="text-gray-600 mb-6">
                      Processando {selectedTags.length} tags selecionadas...
                    </p>
                    
                    <div className="max-w-md mx-auto">
                      <div className="bg-gray-200 rounded-full h-3 mb-2">
                        <motion.div
                          className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${importProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{importProgress}% concluído</p>
                    </div>
                  </div>
                )}

                {/* Complete Step */}
                {step === 'complete' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Importação Concluída!</h3>
                    <p className="text-gray-600 mb-6">
                      {selectedTags.length} tags foram importadas com sucesso.
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleClose}
                      className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Fechar
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {(step === 'preview') && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setStep('upload')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                    >
                      Voltar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleImport}
                      disabled={selectedTags.length === 0}
                      className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
