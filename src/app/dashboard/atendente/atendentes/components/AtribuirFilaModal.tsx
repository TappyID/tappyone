'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, Users, Check, AlertCircle } from 'lucide-react'
import { AtendenteComStats } from '@/hooks/useAtendentes'
import { useTheme } from '@/contexts/ThemeContext'

interface FilaOption {
  id: string
  nome: string
  cor: string
  descricao?: string
  atendentesCount: number
}

interface AtribuirFilaModalProps {
  atendente: AtendenteComStats | null
  isOpen: boolean
  onClose: () => void
  onAtribuirFila: (atendenteId: string, filaId: string) => Promise<void>
}

export default function AtribuirFilaModal({ 
  atendente, 
  isOpen,
  onClose, 
  onAtribuirFila 
}: AtribuirFilaModalProps) {
  const { actualTheme } = useTheme()
  const [selectedFilas, setSelectedFilas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filasDisponiveis, setFilasDisponiveis] = useState<FilaOption[]>([])
  const [loadingFilas, setLoadingFilas] = useState(false)
  const [filasAtuaisDoAtendente, setFilasAtuaisDoAtendente] = useState<string[]>([])

  // Buscar todas as filas disponíveis
  const fetchFilas = async () => {
    setLoadingFilas(true)
    try {
      console.log('🔍 [ATRIBUIR FILA] Buscando filas...')
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      console.log('🔍 [ATRIBUIR FILA] Status da resposta:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [ATRIBUIR FILA] Dados recebidos:', data)
        
        const filas = data.data || data || []
        console.log('✅ [ATRIBUIR FILA] Filas processadas:', filas)
        
        const filasFormatadas = filas.map((fila: any) => ({
          id: fila.id,
          nome: fila.nome,
          cor: fila.cor || 'bg-gray-500',
          descricao: fila.descricao || '',
          atendentesCount: 0
        }))
        
        console.log('✅ [ATRIBUIR FILA] Filas formatadas:', filasFormatadas)
        setFilasDisponiveis(filasFormatadas)
      } else {
        console.error('❌ [ATRIBUIR FILA] Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error('❌ [ATRIBUIR FILA] Erro ao buscar filas:', error)
      setFilasDisponiveis([])
    }
    setLoadingFilas(false)
  }

  // Buscar filas atuais do atendente
  const fetchFilasDoAtendente = async () => {
    if (!atendente?.id) return
    
    try {
      console.log('🔍 [ATRIBUIR FILA] Buscando filas do atendente:', atendente.id)
      const response = await fetch(`/api/users/${atendente.id}/filas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const filasDoAtendente = data.data || []
        const filasIds = filasDoAtendente.map((fila: any) => fila.id)
        
        console.log('✅ [ATRIBUIR FILA] Filas do atendente:', filasIds)
        setFilasAtuaisDoAtendente(filasIds)
        setSelectedFilas(filasIds)
      }
    } catch (error) {
      console.error('❌ [ATRIBUIR FILA] Erro ao buscar filas do atendente:', error)
    }
  }

  useEffect(() => {
    if (isOpen && atendente) {
      fetchFilas()
      fetchFilasDoAtendente()
    }
  }, [isOpen, atendente])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!atendente) return

    setIsLoading(true)
    try {
      // Usar nova API para atualizar múltiplas filas
      const response = await fetch(`/api/users/${atendente.id}/filas`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filas_ids: selectedFilas
        })
      })
      
      if (response.ok) {
        console.log('✅ [ATRIBUIR FILA] Filas atualizadas com sucesso')
        onClose()
        // Recarregar página ou atualizar lista
        window.location.reload()
      } else {
        console.error('❌ [ATRIBUIR FILA] Erro ao atualizar filas')
      }
    } catch (error) {
      console.error('❌ [ATRIBUIR FILA] Erro:', error)
    }
    setIsLoading(false)
  }

  const handleToggleFila = (filaId: string) => {
    if (selectedFilas.includes(filaId)) {
      setSelectedFilas(selectedFilas.filter(id => id !== filaId))
    } else {
      setSelectedFilas([...selectedFilas, filaId])
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden backdrop-blur-sm ${
            actualTheme === 'dark'
              ? 'bg-slate-800/90 border border-slate-700/50'
              : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#305e73] to-[#273155] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Atribuir à Fila</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Atendente Info */}
            <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${
              actualTheme === 'dark'
                ? 'bg-slate-700/50 border border-slate-600/50'
                : 'bg-gray-50'
            }`}>
              <div className="w-10 h-10 bg-[#305e73] rounded-full flex items-center justify-center text-white font-semibold">
                {atendente.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h3 className={`font-medium ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{atendente.nome}</h3>
                <p className={`text-sm ${
                  actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                }`}>{atendente.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-3 mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
                }`}>
                  Selecione uma fila:
                </label>
                
                {filasDisponiveis.map((fila) => {
                  const isSelected = selectedFilas.includes(fila.id)
                  const wasOriginallySelected = filasAtuaisDoAtendente.includes(fila.id)
                  
                  return (
                    <label
                      key={fila.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? actualTheme === 'dark'
                            ? 'border-[#305e73] bg-blue-900/30'
                            : 'border-[#305e73] bg-blue-50'
                          : actualTheme === 'dark'
                            ? 'border-slate-600/50 hover:bg-slate-700/50'
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleFila(fila.id)}
                        className="w-4 h-4 text-[#305e73] bg-gray-100 border-gray-300 rounded focus:ring-[#305e73] focus:ring-2"
                      />
                      
                      <div className="flex items-center gap-3 flex-1 ml-3">
                        <div className={`w-4 h-4 rounded-full ${fila.cor}`}></div>
                        
                        <div className="flex-1">
                          <div className={`font-medium ${
                            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {fila.nome}
                            {wasOriginallySelected && (
                              <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Atual
                              </span>
                            )}
                          </div>
                          {fila.descricao && (
                            <div className={`text-sm ${
                              actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                            }`}>{fila.descricao}</div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className={`flex items-center gap-1 text-sm ${
                            actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
                          }`}>
                            <Users className="w-4 h-4" />
                            {fila.atendentesCount}
                          </div>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>

              {selectedFilas.length > 0 && (
                <div className={`p-3 border rounded-lg mb-4 ${
                  actualTheme === 'dark'
                    ? 'bg-green-900/30 border-green-700/50'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className={`flex items-center gap-2 ${
                    actualTheme === 'dark' ? 'text-green-300' : 'text-green-800'
                  }`}>
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {selectedFilas.length} fila(s) selecionada(s)
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    actualTheme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>
                    O atendente poderá receber conversas destas filas selecionadas.
                  </p>
                </div>
              )}

              {selectedFilas.length === 0 && (
                <div className={`p-3 border rounded-lg mb-4 ${
                  actualTheme === 'dark'
                    ? 'bg-yellow-900/30 border-yellow-700/50'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className={`flex items-center gap-2 ${
                    actualTheme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Selecione pelo menos uma fila
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    actualTheme === 'dark'
                      ? 'text-white/80 border-slate-600/50 hover:bg-slate-700/50'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[#305e73] text-white rounded-lg hover:bg-[#273155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      Salvar Filas ({selectedFilas.length})
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
