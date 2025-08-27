'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Calendar, 
  Users, 
  MessageSquare, 
  User,
  Save,
  Play,
  ArrowLeft,
  Settings
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import FlowEditor from './FlowEditor'

interface Quadro {
  id: string
  nome: string
}

interface Fila {
  id: string
  nome: string
}

interface Atendente {
  id: string
  nome: string
  email: string
}

interface CreateFluxoTabProps {
  activeTab: 'list' | 'create'
  setActiveTab: (tab: 'list' | 'create') => void
}

export default function CreateFluxoTab({ activeTab, setActiveTab }: CreateFluxoTabProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const primaryColor = 'blue'
  const { token } = useAuth()

  // States
  const [currentStep, setCurrentStep] = useState(1)
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [automationType, setAutomationType] = useState<'quadro' | 'fila' | 'contato' | 'atendente' | 'livre'>('livre')
  const [selectedQuadro, setSelectedQuadro] = useState('')
  const [selectedFila, setSelectedFila] = useState('')
  const [selectedAtendente, setSelectedAtendente] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Data states
  const [quadros, setQuadros] = useState<Quadro[]>([])
  const [filas, setFilas] = useState<Fila[]>([])
  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // Load data when token is available
  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      setLoadingData(true)
      try {
        // Load quadros
        const quadrosResponse = await fetch('/api/kanban/quadros', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (quadrosResponse.ok) {
          const quadrosData = await quadrosResponse.json()
          setQuadros(quadrosData || [])
        }

        // Load filas (mock data for now)
        const filasData = [
          { id: '1', nome: 'Suporte Técnico' },
          { id: '2', nome: 'Vendas' },
          { id: '3', nome: 'Financeiro' }
        ]
        setFilas(filasData)

        // Load atendentes
        const atendentesResponse = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (atendentesResponse.ok) {
          const atendentesData = await atendentesResponse.json()
          setAtendentes(atendentesData || [])
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [token])

  const handleCreateFlow = async () => {
    if (!token) {
      console.error('Token não disponível')
      return
    }

    console.log('Token disponível:', token ? 'SIM' : 'NÃO')
    setSaving(true)
    try {
      // Backend expects camelCase quadroId and requires a quadro
      console.log('Quadros disponíveis:', quadros)
      console.log('Selected quadro:', selectedQuadro)
      
      if (!selectedQuadro && quadros.length === 0) {
        alert('Nenhum quadro encontrado. Crie um quadro primeiro no Kanban.')
        setSaving(false)
        return
      }

      const quadroId = selectedQuadro || quadros[0]?.id
      console.log('QuadroId que será enviado:', quadroId)

      const flowData = {
        nome: flowName,
        descricao: flowDescription,
        quadroId: quadroId,
        ativo: true
      }

      console.log('Enviando dados:', flowData)
      console.log('Headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })

      const response = await fetch('/api/fluxos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flowData)
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        // Reset form
        setFlowName('')
        setFlowDescription('')
        setAutomationType('livre')
        setSelectedQuadro('')
        setSelectedFila('')
        setSelectedAtendente('')
        setCurrentStep(1)
        setActiveTab('list')
      }
    } catch (error) {
      console.error('Erro ao criar fluxo:', error)
    } finally {
      setSaving(false)
    }
  }

  const automationOptions = [
    {
      id: 'livre',
      label: 'Fluxo Livre',
      description: 'Fluxo independente sem vinculação específica',
      icon: Bot,
      color: 'purple'
    },
    {
      id: 'quadro',
      label: 'Quadro Kanban',
      description: 'Vinculado a um quadro específico',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'fila',
      label: 'Fila de Atendimento',
      description: 'Automação para fila específica',
      icon: Users,
      color: 'green'
    },
    {
      id: 'contato',
      label: 'Contato Específico',
      description: 'Acionado por contato específico',
      icon: MessageSquare,
      color: 'orange'
    },
    {
      id: 'atendente',
      label: 'Atendente',
      description: 'Vinculado a um atendente específico',
      icon: User,
      color: 'red'
    }
  ]

  if (activeTab !== 'create') return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab('list')}
            className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Criar Novo Fluxo
          </h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? `bg-${primaryColor}-500 text-white`
                  : step < currentStep
                  ? `bg-green-500 text-white`
                  : `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Informações Básicas
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Nome do Fluxo
              </label>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-${primaryColor}-500 focus:border-transparent`}
                placeholder="Ex: Boas-vindas para novos clientes"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Descrição
              </label>
              <textarea
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-${primaryColor}-500 focus:border-transparent`}
                placeholder="Descreva o objetivo deste fluxo..."
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStep(2)}
              disabled={!flowName.trim()}
              className={`px-6 py-3 rounded-lg bg-${primaryColor}-500 text-white font-medium hover:bg-${primaryColor}-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              Próximo
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Automation Type */}
      {currentStep === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tipo de Automação
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {automationOptions.map((option) => {
              const Icon = option.icon
              const isSelected = automationType === option.id
              
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAutomationType(option.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50 ${isDark ? 'bg-opacity-10' : ''}`
                      : `border-gray-200 ${isDark ? 'border-gray-700 bg-gray-750' : 'bg-white'} hover:border-gray-300`
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? `text-${option.color}-500` : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {option.label}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {option.description}
                  </p>
                </motion.button>
              )
            })}
          </div>

          {/* Context Selectors */}
          {(automationType === 'quadro' || automationType === 'fila' || automationType === 'atendente') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              {automationType === 'quadro' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Selecionar Quadro
                  </label>
                  <select
                    value={selectedQuadro}
                    onChange={(e) => setSelectedQuadro(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-${primaryColor}-500`}
                    disabled={loadingData}
                  >
                    <option value="">Selecione um quadro...</option>
                    {quadros.map((quadro) => (
                      <option key={quadro.id} value={quadro.id}>
                        {quadro.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {automationType === 'fila' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Selecionar Fila
                  </label>
                  <select
                    value={selectedFila}
                    onChange={(e) => setSelectedFila(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-${primaryColor}-500`}
                    disabled={loadingData}
                  >
                    <option value="">Selecione uma fila...</option>
                    {filas.map((fila) => (
                      <option key={fila.id} value={fila.id}>
                        {fila.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {automationType === 'atendente' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Selecionar Atendente
                  </label>
                  <select
                    value={selectedAtendente}
                    onChange={(e) => setSelectedAtendente(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-${primaryColor}-500`}
                    disabled={loadingData}
                  >
                    <option value="">Selecione um atendente...</option>
                    {atendentes.map((atendente) => (
                      <option key={atendente.id} value={atendente.id}>
                        {atendente.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {loadingData && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
            </motion.div>
          )}

          <div className="flex justify-between mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStep(1)}
              className={`px-6 py-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} font-medium hover:bg-opacity-80 transition-colors`}
            >
              Anterior
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStep(3)}
              className={`px-6 py-3 rounded-lg bg-${primaryColor}-500 text-white font-medium hover:bg-${primaryColor}-600 transition-colors`}
            >
              Próximo
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Flow Editor */}
      {currentStep === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Editor de Fluxo
              </h3>
              
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(2)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} font-medium hover:bg-opacity-80 transition-colors`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2 inline" />
                  Anterior
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateFlow}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center`}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Salvando...' : 'Salvar Fluxo'}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="h-[600px]">
            <FlowEditor />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
