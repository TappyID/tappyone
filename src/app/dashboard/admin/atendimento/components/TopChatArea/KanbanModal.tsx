'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GripVertical, User, Calendar, Clock, MessageSquare, CheckCircle2, Circle, AlertCircle, ChevronDown, Plus, LayoutDashboard } from 'lucide-react'

interface Quadro {
  id: string
  nome: string
  descricao?: string
  colunas: Coluna[]
}

interface Coluna {
  id: string
  nome: string
  posicao: number
  cor?: string
  cards?: any[]
}

interface CardMetadata {
  colunaId: string
  posicao: number
  nome?: string
  phone?: string
}

interface KanbanModalProps {
  isOpen: boolean
  onClose: () => void
  contatoId: string
  chatName?: string
}

export default function KanbanModal({ isOpen, onClose, contatoId, chatName }: KanbanModalProps) {
  const [quadros, setQuadros] = useState<Quadro[]>([])
  const [selectedQuadroId, setSelectedQuadroId] = useState<string | null>(null)
  const [selectedQuadro, setSelectedQuadro] = useState<Quadro | null>(null)
  const [currentColumnId, setCurrentColumnId] = useState<string | null>(null)
  const [cardMetadata, setCardMetadata] = useState<Record<string, CardMetadata>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showQuadroSelect, setShowQuadroSelect] = useState(false)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  
  const chatId = contatoId ? `${contatoId}@c.us` : null
  // Token - tentar pegar do localStorage ou usar o fixo que funciona
  const getToken = () => {
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('token')
      if (localToken) return localToken
    }
    // Token fixo como fallback
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
  }
  const token = getToken()
  
  // Carregar quadros do kanban
  useEffect(() => {
    if (isOpen) {
      console.log('📋 Modal aberto, carregando quadros...')
      loadQuadros()
    }
  }, [isOpen])

  // Função para buscar quadros
  const loadQuadros = async () => {
    try {
      setIsLoading(true)
      console.log('📋 Buscando quadros do kanban...')
      
      const response = await fetch('/api/kanban/quadros', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Quadros encontrados:', data)
        console.log('📋 Total de quadros:', data?.length || 0)
        setQuadros(data || [])
        
        // Se tiver quadros, buscar em qual o contato está
        if (data && data.length > 0 && chatId) {
          console.log('📋 Buscando contato nos quadros com chatId:', chatId)
          await findContactInQuadros(data, chatId)
        } else if (!chatId) {
          console.log('⚠️ Não há chatId para buscar nos quadros')
        }
      } else {
        console.error('❌ Erro na resposta:', response.status)
        setQuadros([])
      }
    } catch (error) {
      console.error('❌ Erro ao buscar quadros:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar onde o contato está nos quadros
  const findContactInQuadros = async (quadros: Quadro[], chatId: string) => {
    for (const quadro of quadros) {
      try {
        const metaResponse = await fetch(`/api/kanban/${quadro.id}/metadata`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (metaResponse.ok) {
          const metadata = await metaResponse.json()
          const cards = metadata.cards || {}
          
          // Se encontrou o chat neste quadro
          if (cards[chatId]) {
            console.log('📋 Contato encontrado no quadro:', quadro.nome)
            setSelectedQuadroId(quadro.id)
            await loadQuadroDetails(quadro.id)
            
            const cardInfo = cards[chatId]
            setCurrentColumnId(cardInfo.colunaId)
            setCardMetadata(cards)
            return
          }
        }
      } catch (error) {
        console.error('Erro ao buscar metadata:', error)
      }
    }
    
    // Se não encontrou em nenhum quadro e temos quadros, selecionar o primeiro
    if (quadros.length > 0) {
      setSelectedQuadroId(quadros[0].id)
      await loadQuadroDetails(quadros[0].id)
    }
  }
  
  // Carregar detalhes de um quadro específico
  const loadQuadroDetails = async (quadroId: string) => {
    try {
      const response = await fetch(`/api/kanban/quadros/${quadroId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const quadro = await response.json()
        console.log('📋 Detalhes do quadro:', quadro)
        setSelectedQuadro(quadro)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar quadro:', error)
    }
  }
  
  // Mudar coluna do contato
  const handleColumnClick = async (columnId: string) => {
    if (!selectedQuadroId || !chatId || columnId === currentColumnId) return
    
    try {
      setIsSaving(true)
      console.log('📋 Movendo para coluna:', columnId)
      console.log('📋 ChatId:', chatId)
      console.log('📋 QuadroId:', selectedQuadroId)
      
      // Atualizar metadata
      const newMetadata = {
        ...cardMetadata,
        [chatId]: {
          colunaId: columnId,
          posicao: 0,
          nome: chatName || 'Contato',
          phone: contatoId
        }
      }
      
      
      // Usar a API de movimentação de card com formato correto do Go
      const cardMovement = {
        CardID: chatId,
        QuadroID: selectedQuadroId, 
        SourceColumnID: currentColumnId || columnId, // Coluna atual (de onde vem)
        TargetColumnID: columnId, // Coluna de destino (para onde vai)
        Position: 0,
        Nome: chatName || 'Contato',
        Phone: contatoId
      }
      
      console.log('📋 Movendo card via card-movement:', cardMovement)
      
      const response = await fetch(`/api/kanban/card-movement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cardMovement)
      })
      
      console.log('📋 Resposta do servidor:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ Erro do servidor:', errorData)
      }
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Movido com sucesso!', result)
        setCurrentColumnId(columnId)
        setCardMetadata(newMetadata)
        
        // Emitir evento para atualizar o indicador
        window.dispatchEvent(new CustomEvent('kanbanUpdated', { 
          detail: { contatoId, columnId, quadroId: selectedQuadroId }
        }))
        
        // Recarregar página do kanban se estiver aberto
        if (window.location.pathname.includes('/kanban')) {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('❌ Erro ao mover:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  // Mudar quadro
  const handleQuadroChange = async (quadroId: string) => {
    setSelectedQuadroId(quadroId)
    await loadQuadroDetails(quadroId)
    
    // Buscar metadata do novo quadro
    try {
      const metaResponse = await fetch(`/api/kanban/${quadroId}/metadata`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (metaResponse.ok) {
        const metadata = await metaResponse.json()
        setCardMetadata(metadata.cards || {})
        
        if (chatId && metadata.cards && metadata.cards[chatId]) {
          setCurrentColumnId(metadata.cards[chatId].colunaId)
        } else {
          // Se não está neste quadro, adicionar na primeira coluna
          const quadro = quadros.find(q => q.id === quadroId)
          if (quadro && quadro.colunas && quadro.colunas.length > 0) {
            setCurrentColumnId(quadro.colunas[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar metadata do novo quadro:', error)
    }
  }
  
  // Drag and drop
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }
  
  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (targetColumnId !== currentColumnId) {
      await handleColumnClick(targetColumnId)
    }
  }

  const getStatusIcon = (columnId: string) => {
    switch (columnId) {
      case 'novo':
        return <Circle className="w-4 h-4" />
      case 'em-contato':
        return <MessageSquare className="w-4 h-4" />
      case 'negociacao':
        return <AlertCircle className="w-4 h-4" />
      case 'fechado':
        return <CheckCircle2 className="w-4 h-4" />
      case 'perdido':
        return <X className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getColumnColor = (coluna: Coluna) => {
    return coluna.cor || '#6b7280'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Kanban - {chatName || contatoId}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Arraste o card ou clique na coluna para mover
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Select do Quadro */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selecione o Quadro: {quadros.length > 0 && `(${quadros.length} disponíveis)`}
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => {
                        console.log('📋 Click no select - quadros:', quadros.length, 'showQuadroSelect:', !showQuadroSelect)
                        setShowQuadroSelect(!showQuadroSelect)
                      }}
                      disabled={quadros.length === 0 || isLoading}
                      className="w-full px-4 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        {selectedQuadro ? selectedQuadro.nome : 
                         quadros.length === 0 ? 'Nenhum quadro disponível' : 'Selecione um quadro...'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showQuadroSelect ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showQuadroSelect && quadros.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {quadros.map(quadro => (
                          <button
                            key={quadro.id}
                            onClick={() => {
                              handleQuadroChange(quadro.id)
                              setShowQuadroSelect(false)
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                              selectedQuadroId === quadro.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <span className="font-medium">{quadro.nome}</span>
                            {quadro.descricao && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{quadro.descricao}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tabs das Colunas */}
                {selectedQuadro && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {selectedQuadro.colunas.sort((a, b) => a.posicao - b.posicao).map((coluna) => (
                      <button
                        key={coluna.id}
                        onClick={() => handleColumnClick(coluna.id)}
                        onDragOver={(e) => handleDragOver(e, coluna.id)}
                        onDrop={(e) => handleDrop(e, coluna.id)}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                          currentColumnId === coluna.id
                            ? `text-white shadow-lg scale-105`
                            : dragOverColumn === coluna.id
                            ? 'bg-gray-200 dark:bg-gray-600 scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } ${
                          isSaving ? 'opacity-50 cursor-wait' : ''
                        }`}
                        style={{
                          backgroundColor: currentColumnId === coluna.id ? getColumnColor(coluna) : undefined
                        }}
                      >
                        {getStatusIcon(coluna.nome.toLowerCase())}
                        <span className="font-medium">{coluna.nome}</span>
                        {chatId && cardMetadata[chatId] && cardMetadata[chatId].colunaId === coluna.id && (
                          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Card Info */}
                {selectedQuadro && currentColumnId && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                      Informações do Card
                    </h3>
                    
                    <motion.div
                      draggable
                      onDragEnd={(e) => {
                        // Pode implementar drag real aqui no futuro
                        console.log('Drag ended')
                      }}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 cursor-move"
                      whileHover={{ scale: 1.02 }}
                      whileDrag={{ scale: 1.05, opacity: 0.9 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {chatName || 'Contato'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-3 h-3" />
                              <span>{contatoId}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <LayoutDashboard className="w-3 h-3" />
                              <span>Quadro: {selectedQuadro.nome}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Circle className="w-3 h-3" style={{ color: getColumnColor(selectedQuadro.colunas.find(c => c.id === currentColumnId)!) }} />
                              <span>Coluna: {selectedQuadro.colunas.find(c => c.id === currentColumnId)?.nome}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Status Info */}
                {selectedQuadro && currentColumnId && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">
                        {chatId && cardMetadata[chatId] ? (
                          <>Status atual: <strong>{selectedQuadro.colunas.find(c => c.id === currentColumnId)?.nome}</strong></>
                        ) : (
                          <>Contato será adicionado em: <strong>{selectedQuadro.colunas.find(c => c.id === currentColumnId)?.nome}</strong></>
                        )}
                      </span>
                    </div>
                    {isSaving && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Salvando...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
