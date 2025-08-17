'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  Users,
  Eye,
  Trash2,
  Crown,
  UserCheck,
  Shield,
  User
} from 'lucide-react'

interface Usuario {
  id?: string
  nome: string
  email: string
  telefone?: string
  tipo: 'admin' | 'atendente' | 'assinante'
  status: 'ativo' | 'inativo' | 'suspenso'
  departamento?: string
  cargo?: string
  permissoes?: string[]
}

interface ImportarUsuariosModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (usuarios: Usuario[]) => void
}

interface ValidationError {
  linha: number
  campo: string
  erro: string
}

const csvTemplate = `nome,email,telefone,tipo,status,departamento,cargo
João Silva,joao.silva@empresa.com,(11) 99999-1111,atendente,ativo,Atendimento,Atendente Senior
Maria Santos,maria.santos@empresa.com,(11) 99999-2222,admin,ativo,TI,Administrador
Pedro Costa,pedro.costa@cliente.com,,assinante,ativo,Vendas,Gerente`

export default function ImportarUsuariosModal({ 
  isOpen, 
  onClose, 
  onImport 
}: ImportarUsuariosModalProps) {
  const [step, setStep] = useState(1)
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv')
  const [file, setFile] = useState<File | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [selectedUsuarios, setSelectedUsuarios] = useState<number[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetModal = () => {
    setStep(1)
    setFile(null)
    setUsuarios([])
    setSelectedUsuarios([])
    setErrors([])
    setIsProcessing(false)
    setImportProgress(0)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const downloadTemplate = () => {
    if (fileType === 'csv') {
      const blob = new Blob([csvTemplate], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'template-usuarios.csv'
      link.click()
      URL.revokeObjectURL(url)
    } else {
      const jsonTemplate = [
        {
          nome: "João Silva",
          email: "joao.silva@empresa.com",
          telefone: "(11) 99999-1111",
          tipo: "atendente",
          status: "ativo",
          departamento: "Atendimento",
          cargo: "Atendente Senior"
        },
        {
          nome: "Maria Santos",
          email: "maria.santos@empresa.com",
          telefone: "(11) 99999-2222",
          tipo: "admin",
          status: "ativo",
          departamento: "TI",
          cargo: "Administrador"
        }
      ]
      
      const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'template-usuarios.json'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const validateUsuario = (usuario: any, linha: number): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!usuario.nome || usuario.nome.trim() === '') {
      errors.push({ linha, campo: 'nome', erro: 'Nome é obrigatório' })
    }

    if (!usuario.email || usuario.email.trim() === '') {
      errors.push({ linha, campo: 'email', erro: 'Email é obrigatório' })
    } else if (!/\S+@\S+\.\S+/.test(usuario.email)) {
      errors.push({ linha, campo: 'email', erro: 'Email inválido' })
    }

    if (usuario.tipo && !['admin', 'atendente', 'assinante'].includes(usuario.tipo)) {
      errors.push({ linha, campo: 'tipo', erro: 'Tipo deve ser: admin, atendente ou assinante' })
    }

    if (usuario.status && !['ativo', 'inativo', 'suspenso'].includes(usuario.status)) {
      errors.push({ linha, campo: 'status', erro: 'Status deve ser: ativo, inativo ou suspenso' })
    }

    return errors
  }

  const parseCSV = (csvText: string): Usuario[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    const usuarios: Usuario[] = []
    const allErrors: ValidationError[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const usuario: any = {}

      headers.forEach((header, index) => {
        usuario[header] = values[index] || ''
      })

      // Validar usuário
      const userErrors = validateUsuario(usuario, i + 1)
      allErrors.push(...userErrors)

      // Adicionar valores padrão
      usuario.tipo = usuario.tipo || 'assinante'
      usuario.status = usuario.status || 'ativo'
      usuario.permissoes = []

      usuarios.push(usuario as Usuario)
    }

    setErrors(allErrors)
    return usuarios
  }

  const parseJSON = (jsonText: string): Usuario[] => {
    try {
      const data = JSON.parse(jsonText)
      const usuarios: Usuario[] = Array.isArray(data) ? data : [data]
      const allErrors: ValidationError[] = []

      usuarios.forEach((usuario, index) => {
        const userErrors = validateUsuario(usuario, index + 1)
        allErrors.push(...userErrors)

        // Adicionar valores padrão
        usuario.tipo = usuario.tipo || 'assinante'
        usuario.status = usuario.status || 'ativo'
        usuario.permissoes = usuario.permissoes || []
      })

      setErrors(allErrors)
      return usuarios
    } catch (error) {
      setErrors([{ linha: 1, campo: 'arquivo', erro: 'JSON inválido' }])
      return []
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setIsProcessing(true)

    try {
      const text = await uploadedFile.text()
      let parsedUsuarios: Usuario[]

      if (fileType === 'csv') {
        parsedUsuarios = parseCSV(text)
      } else {
        parsedUsuarios = parseJSON(text)
      }

      setUsuarios(parsedUsuarios)
      setSelectedUsuarios(parsedUsuarios.map((_, index) => index))
      setStep(2)
    } catch (error) {
      setErrors([{ linha: 1, campo: 'arquivo', erro: 'Erro ao processar arquivo' }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    const usuariosParaImportar = usuarios.filter((_, index) => selectedUsuarios.includes(index))
    
    setIsProcessing(true)
    setStep(3)

    // Simular progresso de importação
    for (let i = 0; i <= 100; i += 10) {
      setImportProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    onImport(usuariosParaImportar)
    setIsProcessing(false)
    
    // Aguardar um pouco antes de fechar
    setTimeout(() => {
      handleClose()
    }, 1500)
  }

  const toggleUsuarioSelection = (index: number) => {
    setSelectedUsuarios(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const selectAllUsuarios = () => {
    setSelectedUsuarios(usuarios.map((_, index) => index))
  }

  const deselectAllUsuarios = () => {
    setSelectedUsuarios([])
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'admin': return Crown
      case 'atendente': return UserCheck
      case 'assinante': return Shield
      default: return User
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'text-red-600 bg-red-100'
      case 'atendente': return 'text-orange-600 bg-orange-100'
      case 'assinante': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'text-green-600 bg-green-100'
      case 'inativo': return 'text-gray-600 bg-gray-100'
      case 'suspenso': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Importar Usuários</h2>
                      <p className="text-white/80">Importe usuários em lote via CSV ou JSON</p>
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

              {/* Progress Steps */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-center space-x-8">
                  {[
                    { step: 1, label: 'Upload', icon: Upload },
                    { step: 2, label: 'Validação', icon: Eye },
                    { step: 3, label: 'Importação', icon: CheckCircle }
                  ].map(({ step: stepNumber, label, icon: Icon }) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step >= stepNumber
                          ? 'bg-[#305e73] text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`ml-2 font-medium ${
                        step >= stepNumber ? 'text-[#305e73]' : 'text-gray-400'
                      }`}>
                        {label}
                      </span>
                      {stepNumber < 3 && (
                        <div className={`w-16 h-0.5 ml-4 ${
                          step > stepNumber ? 'bg-[#305e73]' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {/* Step 1: Upload */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Tipo de Arquivo */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecione o formato do arquivo</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setFileType('csv')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            fileType === 'csv'
                              ? 'border-[#305e73] bg-[#305e73]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <FileText className="w-8 h-8 text-[#305e73] mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">CSV</h4>
                          <p className="text-sm text-gray-600">Arquivo de valores separados por vírgula</p>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setFileType('json')}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            fileType === 'json'
                              ? 'border-[#305e73] bg-[#305e73]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <FileText className="w-8 h-8 text-[#305e73] mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">JSON</h4>
                          <p className="text-sm text-gray-600">Arquivo JavaScript Object Notation</p>
                        </motion.button>
                      </div>
                    </div>

                    {/* Template */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1">Template de Exemplo</h4>
                          <p className="text-blue-700 text-sm mb-3">
                            Baixe o template para ver o formato correto dos dados
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={downloadTemplate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Baixar Template {fileType.toUpperCase()}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Upload Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#305e73] hover:bg-[#305e73]/5 transition-all cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {file ? file.name : `Clique para selecionar arquivo ${fileType.toUpperCase()}`}
                      </h3>
                      <p className="text-gray-600">
                        Ou arraste e solte o arquivo aqui
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={fileType === 'csv' ? '.csv' : '.json'}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {isProcessing && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#305e73] mx-auto mb-2"></div>
                        <p className="text-gray-600">Processando arquivo...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Validation */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Errors */}
                    {errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-2">
                              {errors.length} erro{errors.length > 1 ? 's' : ''} encontrado{errors.length > 1 ? 's' : ''}
                            </h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {errors.map((error, index) => (
                                <p key={index} className="text-red-700 text-sm">
                                  Linha {error.linha}, campo "{error.campo}": {error.erro}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selection Controls */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Usuários para Importar ({selectedUsuarios.length}/{usuarios.length})
                        </h3>
                        <p className="text-gray-600">Selecione os usuários que deseja importar</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={selectAllUsuarios}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          Selecionar Todos
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={deselectAllUsuarios}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          Desmarcar Todos
                        </motion.button>
                      </div>
                    </div>

                    {/* Users List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {usuarios.map((usuario, index) => {
                        const isSelected = selectedUsuarios.includes(index)
                        const hasErrors = errors.some(error => error.linha === index + 1)
                        const TipoIcon = getTipoIcon(usuario.tipo)

                        return (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#305e73] bg-[#305e73]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${hasErrors ? 'border-red-300 bg-red-50' : ''}`}
                            onClick={() => toggleUsuarioSelection(index)}
                          >
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleUsuarioSelection(index)}
                                className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
                              />
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">{usuario.nome}</h4>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getTipoColor(usuario.tipo)}`}>
                                    <TipoIcon className="w-3 h-3" />
                                    {usuario.tipo}
                                  </span>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(usuario.status)}`}>
                                    {usuario.status}
                                  </span>
                                  {hasErrors && (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Email:</span> {usuario.email}
                                  </div>
                                  {usuario.telefone && (
                                    <div>
                                      <span className="font-medium">Telefone:</span> {usuario.telefone}
                                    </div>
                                  )}
                                  {usuario.departamento && (
                                    <div>
                                      <span className="font-medium">Departamento:</span> {usuario.departamento}
                                    </div>
                                  )}
                                  {usuario.cargo && (
                                    <div>
                                      <span className="font-medium">Cargo:</span> {usuario.cargo}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3: Import Progress */}
                {step === 3 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-2xl flex items-center justify-center mx-auto mb-6">
                      {importProgress < 100 ? (
                        <Users className="w-8 h-8 text-white animate-pulse" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-white" />
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {importProgress < 100 ? 'Importando Usuários...' : 'Importação Concluída!'}
                    </h3>
                    
                    <p className="text-gray-600 mb-6">
                      {importProgress < 100 
                        ? `Processando ${selectedUsuarios.length} usuários`
                        : `${selectedUsuarios.length} usuários foram importados com sucesso`
                      }
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${importProgress}%` }}
                        className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] h-3 rounded-full"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500">{importProgress}% concluído</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {step === 1 && 'Selecione um arquivo para começar'}
                    {step === 2 && `${selectedUsuarios.length} de ${usuarios.length} usuários selecionados`}
                    {step === 3 && 'Importação em andamento...'}
                  </div>

                  <div className="flex items-center gap-3">
                    {step < 3 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={handleClose}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                      >
                        Cancelar
                      </motion.button>
                    )}

                    {step === 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        Selecionar Arquivo
                      </motion.button>
                    )}

                    {step === 2 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={handleImport}
                        disabled={selectedUsuarios.length === 0 || errors.length > 0}
                        className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Importar Usuários
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
