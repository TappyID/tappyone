'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Workflow, Plus } from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '../components/AdminLayout'
import ViewFluxosTab from './components/ViewFluxosTab'
import CreateFluxoTab from './components/CreateFluxoTab'

// Types
interface Fluxo {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  created_at: string
  updated_at: string
  quadro_id?: string
  nos_count?: number
  execucoes_count?: number
  ultima_execucao?: string
}

export default function FluxogramaPage() {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const primaryColor = 'blue'
  const { token } = useAuth()

  // Main states
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')
  const [fluxos, setFluxos] = useState<Fluxo[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Load fluxos on mount
  useEffect(() => {
    if (!token) return
    loadFluxos()
  }, [token])

  const loadFluxos = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/fluxos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFluxos(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar fluxos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFluxo = async (id: string, ativo: boolean) => {
    if (!token) return

    try {
      const response = await fetch(`/api/fluxos/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !ativo })
      })

      if (response.ok) {
        setFluxos(prev => prev.map(fluxo => 
          fluxo.id === id ? { ...fluxo, ativo: !ativo } : fluxo
        ))
      }
    } catch (error) {
      console.error('Erro ao alterar status do fluxo:', error)
    }
  }

  const handleExecuteFluxo = async (id: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/fluxos/${id}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        console.log('Fluxo executado com sucesso')
        loadFluxos() // Reload to get updated execution count
      }
    } catch (error) {
      console.error('Erro ao executar fluxo:', error)
    }
  }

  const filteredFluxos = fluxos.filter(fluxo => {
    if (filterStatus === 'active') return fluxo.ativo
    if (filterStatus === 'inactive') return !fluxo.ativo
    return true
  })

  return (
    <AdminLayout>
      <div className="p-6">
        <AtendimentosTopBar 
          title="Fluxograma de Automação"
          showSearch={false}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <Workflow className={`w-8 h-8 text-${primaryColor}-500`} />
            </div>
            
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                Automação de Fluxos
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Gerencie fluxos de automação para WhatsApp
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {activeTab === 'list' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('create')}
                className={`flex items-center space-x-2 px-6 py-3 bg-${primaryColor}-500 text-white rounded-xl font-medium hover:bg-${primaryColor}-600 transition-colors shadow-lg`}
              >
                <Plus className="w-5 h-5" />
                <span>Criar Fluxo</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? `border-${primaryColor}-500 text-${primaryColor}-600`
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              Fluxos ({filteredFluxos.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? `border-${primaryColor}-500 text-${primaryColor}-600`
                  : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              Criar Fluxo
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <ViewFluxosTab
          fluxos={filteredFluxos}
          loading={loading}
          onToggleFluxo={handleToggleFluxo}
          onExecuteFluxo={handleExecuteFluxo}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <CreateFluxoTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </AdminLayout>
  )
}
