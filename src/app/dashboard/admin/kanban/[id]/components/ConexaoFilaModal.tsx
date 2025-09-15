import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Wifi, 
  WifiOff, 
  Users, 
  Layers3, 
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useConexaoFila } from '@/hooks/useConexaoFila'

interface ConexaoFilaModalProps {
  isOpen: boolean
  onClose: () => void
  card: {
    id: string
    nome?: string
    contato?: {
      id?: string
      numero_telefone?: string
      nome?: string
    }
  }
}

export default function ConexaoFilaModal({ isOpen, onClose, card }: ConexaoFilaModalProps) {
  console.log('🔗🔗🔗 MODAL CONEXAO PROPS:', { isOpen, card })
  const { theme } = useTheme()
  
  // 🎯 ESTRATÉGIA OTIMIZADA: Extrair múltiplas fontes de ID
  const contatoId = card.contato?.numero_telefone?.replace('@c.us', '') || card.id.replace('@c.us', '')
  const chatId = card.id // Chat WhatsApp completo com @c.us
  const contatoBancoId = card.contato?.id // ID do contato no banco (se vinculado)
  
  console.log('🔍 [CONEXAO MODAL] IDs disponíveis:', {
    contatoId,
    chatId, 
    contatoBancoId,
    cardData: card
  })
  
  const { 
    data, 
    loading, 
    hasConnection, 
    isConnected, 
    fila, 
    atendentes, 
    conexao,
    refetch 
  } = useConexaoFila({ 
    contatoId,
    chatId, // ✅ USAR CHAT ID COMPLETO COMO FONTE PRIMÁRIA
    enabled: isOpen && !!contatoId 
  })

  if (!isOpen) return null

  const getStatusColor = () => {
    if (hasConnection && isConnected && fila?.id) {
      return {
        bg: '#10b98120',
        border: '#10b98140',
        text: '#10b981',
        status: 'Totalmente Configurado'
      }
    } else if (hasConnection && isConnected) {
      return {
        bg: '#f59e0b20',
        border: '#f59e0b40',
        text: '#f59e0b',
        status: 'Parcialmente Configurado'
      }
    } else {
      return {
        bg: '#ef444420',
        border: '#ef444440',
        text: '#ef4444',
        status: 'Não Configurado'
      }
    }
  }

  const statusInfo = getStatusColor()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className={`relative rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
          theme === 'dark' 
            ? 'bg-slate-800 border border-slate-700' 
            : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <Settings className="w-5 h-5" style={{ color: statusInfo.text }} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Gerenciar Conexão & Fila
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {card.contato?.nome || card.nome || contatoId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className={`ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Carregando configurações...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Geral */}
              <div 
                className="p-4 rounded-lg border flex items-center gap-3"
                style={{
                  backgroundColor: statusInfo.bg,
                  borderColor: statusInfo.border
                }}
              >
                {hasConnection && isConnected && fila?.id ? (
                  <CheckCircle className="w-5 h-5" style={{ color: statusInfo.text }} />
                ) : (
                  <AlertCircle className="w-5 h-5" style={{ color: statusInfo.text }} />
                )}
                <div>
                  <p className="font-medium" style={{ color: statusInfo.text }}>
                    {statusInfo.status}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {hasConnection && isConnected && fila?.id 
                      ? 'Este contato está configurado para atendimento automatizado'
                      : hasConnection && isConnected
                      ? 'Conexão ativa, mas precisa configurar fila'
                      : 'Precisa configurar conexão WhatsApp e fila'
                    }
                  </p>
                </div>
              </div>

              {/* Conexão WhatsApp */}
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-slate-600 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {isConnected ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-500" />
                  )}
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Conexão WhatsApp
                  </h3>
                </div>
                
                {hasConnection ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Status:
                      </span>
                      <span className={`text-sm font-medium ${
                        isConnected ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {conexao?.status || 'Desconhecido'}
                      </span>
                    </div>
                    {conexao?.sessionName && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Sessão:
                        </span>
                        <span className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conexao.sessionName}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Este contato não está em nenhuma conexão ativa. Configure em 
                    <button 
                      className="ml-1 text-blue-600 hover:text-blue-700 underline"
                      onClick={() => window.open('/dashboard/admin/conexoes', '_blank')}
                    >
                      /dashboard/admin/conexoes
                    </button>
                  </p>
                )}
              </div>

              {/* Fila */}
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-slate-600 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Layers3 className="w-5 h-5" style={{ color: fila?.cor || '#6b7280' }} />
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Fila de Atendimento
                  </h3>
                </div>
                
                {fila?.id ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Nome:
                      </span>
                      <span 
                        className="text-sm font-medium px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: `${fila.cor}20`,
                          color: fila.cor 
                        }}
                      >
                        {fila.nome}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Este contato não está associado a nenhuma fila. Configure em 
                    <button 
                      className="ml-1 text-blue-600 hover:text-blue-700 underline"
                      onClick={() => window.open('/dashboard/admin/filas', '_blank')}
                    >
                      /dashboard/admin/filas
                    </button>
                  </p>
                )}
              </div>

              {/* Atendentes */}
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-slate-600 bg-slate-700/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Atendentes ({atendentes.length})
                  </h3>
                </div>
                
                {atendentes.length > 0 ? (
                  <div className="space-y-2">
                    {atendentes.map((atendente, index) => (
                      <div 
                        key={atendente.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {atendente.nome}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {atendente.email}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Nenhum atendente associado à fila. Configure em 
                    <button 
                      className="ml-1 text-blue-600 hover:text-blue-700 underline"
                      onClick={() => window.open('/dashboard/admin/atendentes', '_blank')}
                    >
                      /dashboard/admin/atendentes
                    </button>
                  </p>
                )}
              </div>

              {/* Próximos Passos */}
              {(!hasConnection || !isConnected || !fila?.id) && (
                <div className={`p-4 rounded-lg border border-blue-200 bg-blue-50 ${
                  theme === 'dark' ? 'border-blue-800 bg-blue-900/20' : ''
                }`}>
                  <h4 className={`font-medium mb-2 text-blue-800 ${
                    theme === 'dark' ? 'text-blue-300' : ''
                  }`}>
                    Próximos Passos para Configuração:
                  </h4>
                  <div className="space-y-2 text-sm">
                    {!hasConnection && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span>1. Criar conexão WhatsApp em /dashboard/admin/conexoes</span>
                      </div>
                    )}
                    {hasConnection && !isConnected && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span>1. Ativar conexão WhatsApp existente</span>
                      </div>
                    )}
                    {!fila?.id && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span>2. Associar este contato a uma fila</span>
                      </div>
                    )}
                    {fila?.id && atendentes.length === 0 && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span>3. Adicionar atendentes à fila</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            onClick={refetch}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Atualizar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
