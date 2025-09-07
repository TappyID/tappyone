'use client'

import { useState } from 'react'
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
  atendente: AtendenteComStats
  onClose: () => void
  onAtribuirFila: (atendenteId: string, filaId: string) => Promise<void>
}

export default function AtribuirFilaModal({ 
  atendente, 
  onClose, 
  onAtribuirFila 
}: AtribuirFilaModalProps) {
  const { actualTheme } = useTheme()
  const [selectedFila, setSelectedFila] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - em produção isso viria de uma API
  const filasDisponiveis: FilaOption[] = [
    {
      id: '1',
      nome: 'Suporte Técnico',
      cor: 'bg-blue-500',
      descricao: 'Atendimento de problemas técnicos',
      atendentesCount: 3
    },
    {
      id: '2',
      nome: 'Vendas',
      cor: 'bg-green-500',
      descricao: 'Atendimento comercial e vendas',
      atendentesCount: 5
    },
    {
      id: '3',
      nome: 'Financeiro',
      cor: 'bg-yellow-500',
      descricao: 'Questões financeiras e cobranças',
      atendentesCount: 2
    },
    {
      id: '4',
      nome: 'Jurídico',
      cor: 'bg-purple-500',
      descricao: 'Questões legais e contratos',
      atendentesCount: 1
    },
    {
      id: '5',
      nome: 'Geral',
      cor: 'bg-gray-500',
      descricao: 'Atendimento geral',
      atendentesCount: 8
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFila) {
      return
    }

    setIsLoading(true)
    try {
      await onAtribuirFila(atendente.id, selectedFila)
      onClose()
    } catch (error) {
      console.error('Erro ao atribuir fila:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedFilaInfo = filasDisponiveis.find(f => f.id === selectedFila)

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
                
                {filasDisponiveis.map((fila) => (
                  <label
                    key={fila.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFila === fila.id 
                        ? actualTheme === 'dark'
                          ? 'border-[#305e73] bg-blue-900/30'
                          : 'border-[#305e73] bg-blue-50'
                        : actualTheme === 'dark'
                          ? 'border-slate-600/50 hover:bg-slate-700/50'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fila"
                      value={fila.id}
                      checked={selectedFila === fila.id}
                      onChange={(e) => setSelectedFila(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-4 h-4 rounded-full ${fila.cor}`}></div>
                      
                      <div className="flex-1">
                        <div className={`font-medium ${
                          actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{fila.nome}</div>
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
                    
                    {selectedFila === fila.id && (
                      <Check className="w-5 h-5 text-[#305e73] ml-2" />
                    )}
                  </label>
                ))}
              </div>

              {selectedFilaInfo && (
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
                      Atribuir à fila "{selectedFilaInfo.nome}"
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    actualTheme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>
                    O atendente será adicionado à fila e poderá receber conversas deste tipo.
                  </p>
                </div>
              )}

              {!selectedFila && (
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
                      Selecione uma fila para continuar
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
                  disabled={!selectedFila || isLoading}
                  className="flex-1 px-4 py-2 bg-[#305e73] text-white rounded-lg hover:bg-[#273155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Atribuindo...
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      Atribuir à Fila
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
