'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, MapPin, User, Building, Phone, Mail, FileText, Users } from 'lucide-react'

interface LeadEditSidebarProps {
  isOpen: boolean
  onClose: () => void
  theme: string
  chatId: string
  initialData?: {
    nome_empresa?: string
    razao_social?: string
    cnpj_cpf?: string
    cep?: string
    endereco?: string
    rua?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    pais?: string
    observacao?: string
    status?: 'em_atendimento' | 'aguardando' | 'finalizado'
    status_final?: 'ativo' | 'desativo'
  }
}

export default function LeadEditSidebar({
  isOpen,
  onClose,
  theme,
  chatId,
  initialData = {}
}: LeadEditSidebarProps) {
  if (!isOpen) return null

  // Estados para os campos do formulário
  const [formData, setFormData] = useState({
    nome_empresa: initialData.nome_empresa || '',
    razao_social: initialData.razao_social || '',
    cnpj_cpf: initialData.cnpj_cpf || '',
    cep: initialData.cep || '',
    endereco: initialData.endereco || '',
    rua: initialData.rua || '',
    numero: initialData.numero || '',
    bairro: initialData.bairro || '',
    cidade: initialData.cidade || '',
    estado: initialData.estado || '',
    pais: initialData.pais || 'Brasil',
    observacao: initialData.observacao || '',
    status: initialData.status || 'em_atendimento',
    status_final: initialData.status_final || 'ativo'
  })

  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Carregar dados existentes quando modal abre
  useEffect(() => {
    if (isOpen && chatId) {
      fetchLeadData()
    }
  }, [isOpen, chatId])

  // Função para carregar dados existentes do lead
  const fetchLeadData = async () => {
    try {
      setLoadingData(true)
      console.log('🔍 Carregando dados existentes do lead para chatId:', chatId)
      
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
      }
      
      const response = await fetch(`/api/chats/${encodeURIComponent(chatId)}/leads`, {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📋 Dados do lead carregados:', data)
        
        // Se encontrou dados, pré-popular o form
        if (data.data) {
          setFormData(prev => ({
            ...prev,
            ...data.data
          }))
          console.log('✅ Form pré-populado com dados existentes')
        } else {
          console.log('📝 Nenhum lead existente - form em branco')
        }
      } else {
        console.log('ℹ️ Nenhum lead encontrado - criando novo')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do lead:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Função para aplicar máscara no CEP
  const applyCepMask = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 8) {
      return numericValue.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return numericValue.substring(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  // Função para aplicar máscara no CPF/CNPJ
  const applyCnpjCpfMask = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    
    if (numericValue.length <= 11) {
      // CPF: 000.000.000-00
      return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      // CNPJ: 00.000.000/0000-00
      const cnpj = numericValue.substring(0, 14)
      return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    setLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
          endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
        }))
        console.log('📍 Endereço preenchido automaticamente:', data)
      } else {
        console.log('❌ CEP não encontrado')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error)
    } finally {
      setLoadingCep(false)
    }
  }

  // Função para atualizar campos do formulário
  const handleInputChange = (field: string, value: string) => {
    if (field === 'cep') {
      const maskedValue = applyCepMask(value)
      setFormData(prev => ({ ...prev, [field]: maskedValue }))
      
      // Buscar endereço automaticamente quando CEP estiver completo
      if (maskedValue.replace(/\D/g, '').length === 8) {
        fetchAddressByCep(maskedValue)
      }
    } else if (field === 'cnpj_cpf') {
      const maskedValue = applyCnpjCpfMask(value)
      setFormData(prev => ({ ...prev, [field]: maskedValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Função para salvar os dados
  const handleSave = async () => {
    setLoading(true)
    try {
      console.log('💾 Salvando dados do lead:', formData)
      
      // Salvar no backend via chat_leads - IGUAL TAGS
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
      }
      
      const response = await fetch(`/api/chats/${encodeURIComponent(chatId)}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        console.log('✅ Lead salvo com sucesso!')
        onClose()
      } else {
        console.error('❌ Erro ao salvar lead')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar lead:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`w-[800px] h-full flex flex-col transition-all duration-300 ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'
    } border-l ${
      theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {loadingData ? 'Carregando Lead...' : 'Editar Lead'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">{loading ? 'Salvando...' : 'Salvar'}</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className="space-y-6">
          
          {/* Seção: Dados da Empresa */}
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-white border'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-purple-500" />
              <h4 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Dados da Empresa
              </h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={formData.nome_empresa}
                  onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
                  placeholder="Ex: TappyOne Tecnologia"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Razão Social
                </label>
                <input
                  type="text"
                  value={formData.razao_social}
                  onChange={(e) => handleInputChange('razao_social', e.target.value)}
                  placeholder="Ex: TappyOne Tecnologia LTDA"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  CNPJ / CPF
                </label>
                <input
                  type="text"
                  value={formData.cnpj_cpf}
                  onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)}
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                  maxLength={18}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>

          {/* Seção: Endereço */}
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-white border'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h4 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Endereço
              </h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  CEP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      loadingCep ? 'pr-10' : ''
                    }`}
                  />
                  {loadingCep && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                {formData.cep && formData.cep.length === 9 && !loadingCep && (
                  <p className="text-xs text-green-500 mt-1">✓ Endereço preenchido automaticamente</p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Rua
                  </label>
                  <input
                    type="text"
                    value={formData.rua}
                    onChange={(e) => handleInputChange('rua', e.target.value)}
                    placeholder="Nome da rua"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="123"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Nome do bairro"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="Nome da cidade"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    placeholder="Ex: SP"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  País
                </label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) => handleInputChange('pais', e.target.value)}
                  placeholder="Brasil"
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>

          {/* Seção: Status */}
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-white border'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-green-500" />
              <h4 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Status do Lead
              </h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status do Atendimento
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="aguardando">Aguardando</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status Final
                </label>
                <select
                  value={formData.status_final}
                  onChange={(e) => handleInputChange('status_final', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="ativo">Ativo</option>
                  <option value="desativo">Desativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Observações */}
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-white border'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-yellow-500" />
              <h4 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Observações
              </h4>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Observações do Lead
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) => handleInputChange('observacao', e.target.value)}
                placeholder="Adicione observações sobre o lead..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                  theme === 'dark'
                    ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
