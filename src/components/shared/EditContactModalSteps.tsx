'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Phone, Mail, Building2, MapPin, Save, Loader2,
  ArrowRight, ArrowLeft, Tag, ChevronRight, ChevronLeft
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface EditContactModalProps {
  isOpen: boolean
  onClose: () => void
  contactData: {
    id: string
    nome?: string
    numeroTelefone?: string
    email?: string
    empresa?: string
    cpf?: string
    cnpj?: string
    cep?: string
    rua?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    pais?: string
    fotoPerfil?: string
    tags?: string[]
  }
  onSave: (data: any) => Promise<void>
}

export default function EditContactModalSteps({ 
  isOpen, 
  onClose, 
  contactData, 
  onSave 
}: EditContactModalProps) {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState({
    nome: '',
    numeroTelefone: '',
    email: '',
    empresa: '',
    cpf: '',
    cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    fotoPerfil: '',
    tags: [] as string[]
  })

  useEffect(() => {
    if (isOpen && contactData) {
      console.log('🔍 [DEBUG] EditContactModal - Dados recebidos:', contactData)
      setFormData({
        nome: contactData.nome || '',
        numeroTelefone: contactData.numeroTelefone || '',
        email: contactData.email || '',
        empresa: contactData.empresa || '',
        cpf: contactData.cpf || '',
        cnpj: contactData.cnpj || '',
        cep: contactData.cep || '',
        rua: contactData.rua || '',
        numero: contactData.numero || '',
        bairro: contactData.bairro || '',
        cidade: contactData.cidade || '',
        estado: contactData.estado || '',
        pais: contactData.pais || 'Brasil',
        fotoPerfil: contactData.fotoPerfil || '',
        tags: contactData.tags || []
      })
      setCurrentStep(1) // Reset to step 1 when opening
    }
  }, [isOpen, contactData])

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      return
    }

    setLoading(true)
    try {
      await onSave({
        ...formData,
        id: contactData.id
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar contato:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Editar Contato
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Etapa {currentStep} de 2
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-full transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className={`px-6 py-3 border-b ${
            theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Dados Básicos</span>
              </div>
              
              <div className="flex-1 mx-4">
                <div className={`h-1 rounded-full ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              </div>
              
              <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Endereço & Outros</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Nome */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <User className="w-4 h-4 inline mr-2" />
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nome do contato"
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone (não editável)
                      </label>
                      <input
                        type="tel"
                        value={formData.numeroTelefone}
                        disabled
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-600 text-gray-400' 
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        } cursor-not-allowed opacity-60`}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    {/* Empresa */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nome da empresa"
                      />
                    </div>

                    {/* CPF/CNPJ */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          CPF
                        </label>
                        <input
                          type="text"
                          value={formData.cpf}
                          onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Endereço */}
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <MapPin className="w-4 h-4 inline mr-2" />
                          CEP
                        </label>
                        <input
                          type="text"
                          value={formData.cep}
                          onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="00000-000"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Rua
                          </label>
                          <input
                            type="text"
                            value={formData.rua}
                            onChange={(e) => setFormData(prev => ({ ...prev, rua: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Nome da rua"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Número
                          </label>
                          <input
                            type="text"
                            value={formData.numero}
                            onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={formData.bairro}
                          onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Nome do bairro"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={formData.cidade}
                            onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Nome da cidade"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Estado
                          </label>
                          <input
                            type="text"
                            value={formData.estado}
                            onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Estado"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          País
                        </label>
                        <input
                          type="text"
                          value={formData.pais}
                          onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Brasil"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Tag className="w-4 h-4 inline mr-2" />
                        Tags
                      </label>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <input
                        type="text"
                        placeholder="Digite uma tag e pressione Enter"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = (e.target as HTMLInputElement).value.trim()
                            if (value) {
                              handleAddTag(value)
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-between items-center p-6 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              {currentStep < 2 ? (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.nome.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    loading || !formData.nome.trim()
                      ? 'bg-blue-400 text-blue-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Contato
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
