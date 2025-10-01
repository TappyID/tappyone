'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  X,
  Edit3,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  Save,
  StickyNote,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'

interface Anotacao {
  id: string
  titulo: string
  conteudo: string
  importante: boolean
  usuarioId: string
  contatoId: string
  criadoEm: string
  atualizadoEm: string
  usuario: {
    id: string
    nome: string
  }
  contato: {
    id: string
    nome: string
    telefone: string
  }
}

interface AnotacoesSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedContact?: any
  activeChatId?: string
}

// Funções da API - usando rotas relativas do Next.js
const apiCreateAnotacao = async (data: any) => {
  const token = localStorage.getItem('token')
  console.log('Token:', token)
  console.log('API URL:', '/api/anotacoes')
  console.log('Data:', data)
  
  if (!token) {
    throw new Error('Token de autenticação não encontrado')
  }
  
  const response = await fetch('/api/anotacoes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  console.log('Response status:', response.status)
  console.log('Response headers:', response.headers)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.log('Error response:', errorText)
    throw new Error(`Erro ao criar anotação: ${response.status} - ${errorText}`)
  }
  return response.json()
}

const apiUpdateAnotacao = async (id: string, data: any) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`/api/anotacoes/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Erro ao atualizar anotação')
  return response.json()
}

const apiDeleteAnotacao = async (id: string) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`/api/anotacoes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) throw new Error('Erro ao deletar anotação')
}
const apiFetchAnotacoes = async (contatoId: string) => {
  const token = localStorage.getItem('token')
  console.log('GET - Token:', token)
  console.log('GET - API URL:', `/api/anotacoes?contato_id=${contatoId}`)
  console.log('GET - Contato ID:', contatoId)
  
  const response = await fetch(`/api/anotacoes?contato_id=${encodeURIComponent(contatoId)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  console.log('GET Response status:', response.status)
  console.log('GET Response OK:', response.ok)
  
  if (!response.ok) throw new Error('Erro ao buscar anotações')
  const data = await response.json()
  console.log('GET Response data:', data)
  console.log('GET Response data length:', data?.length)
  return data
}

export default function AnotacoesSidebar({ 
  isOpen, 
  onClose, 
  selectedContact,
  activeChatId
}: AnotacoesSidebarProps) {
  const { actualTheme } = useTheme()
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newAnotacao, setNewAnotacao] = useState({ titulo: '', conteudo: '', importante: false })
  const [showAddForm, setShowAddForm] = useState(false)

  // Carregar anotações quando o componente monta ou contato muda
  useEffect(() => {
    const loadAnotacoes = async () => {
      if (!activeChatId && !selectedContact?.jid) return
      
      setLoading(true)
      try {
        const contatoId = activeChatId || selectedContact?.jid || ''
        console.log('🔄 Carregando anotações para contato:', contatoId)
        const data = await apiFetchAnotacoes(contatoId)
        console.log('📦 Dados recebidos:', data)
        console.log('📦 Quantidade de anotações:', data?.length || 0)
        setAnotacoes(data)
        console.log('✅ Estado anotacoes atualizado')
      } catch (error) {
        console.error('Erro ao carregar anotações:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadAnotacoes()
    }
  }, [isOpen, activeChatId, selectedContact?.jid])

  // Filtrar anotações - backend já filtra por contato
  const filteredAnotacoes = anotacoes.filter(anotacao => {
    const matchesSearch = anotacao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anotacao.conteudo.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })
  

  const handleAddAnotacao = async () => {
    if (!newAnotacao.titulo.trim() || !newAnotacao.conteudo.trim()) return
    if (!activeChatId && !selectedContact?.jid) return

    setLoading(true)
    try {
      const data = {
        titulo: newAnotacao.titulo,
        conteudo: newAnotacao.conteudo,
        importante: newAnotacao.importante,
        contato_id: activeChatId || selectedContact?.jid || ''
      }
      
      const novaAnotacao = await apiCreateAnotacao(data)
      setAnotacoes(prev => [novaAnotacao, ...prev])
      setNewAnotacao({ titulo: '', conteudo: '', importante: false })
      setShowAddForm(false)
    } catch (error) {
      console.error('Erro ao criar anotação:', error)
      alert('Erro ao criar anotação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAnotacao = async (id: string, dados: Partial<Anotacao>) => {
    setLoading(true)
    try {
      const updateData = {
        titulo: dados.titulo,
        conteudo: dados.conteudo,
        importante: dados.importante
      }
      
      const anotacaoAtualizada = await apiUpdateAnotacao(id, updateData)
      setAnotacoes(prev => prev.map(anotacao => 
        anotacao.id === id ? anotacaoAtualizada : anotacao
      ))
      setEditingId(null)
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error)
      alert('Erro ao atualizar anotação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnotacao = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return
    
    setLoading(true)
    try {
      await apiDeleteAnotacao(id)
      setAnotacoes(prev => prev.filter(anotacao => anotacao.id !== id))
    } catch (error) {
      console.error('Erro ao deletar anotação:', error)
      alert('Erro ao deletar anotação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -520, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed top-0 left-0 h-full w-[520px] shadow-2xl border-r z-50 pt-20 ${
            actualTheme === 'dark'
              ? 'bg-gradient-to-br from-[#1a1a1a] via-gray-900 to-[#1a1a1a] border-purple-500/20'
              : 'bg-gradient-to-br from-white via-gray-50 to-white border-purple-200'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-orange-200/50 dark:border-orange-500/20 bg-gradient-to-r from-orange-100/30 to-red-100/30 dark:from-orange-600/10 dark:to-red-600/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Anotações</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar anotações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Add Button */}
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full" 
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Anotação
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Add Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 p-4 border border-primary/20 rounded-lg bg-primary/5"
                >
                  <div className="space-y-3">
                    <Input
                      placeholder="Título da anotação..."
                      value={newAnotacao.titulo}
                      onChange={(e) => setNewAnotacao(prev => ({ ...prev, titulo: e.target.value }))}
                      className="bg-background"
                    />
                    <textarea
                      placeholder="Conteúdo da anotação..."
                      value={newAnotacao.conteudo}
                      onChange={(e) => setNewAnotacao(prev => ({ ...prev, conteudo: e.target.value }))}
                      className="bg-background min-h-[80px] w-full px-3 py-2 border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={newAnotacao.importante}
                        onChange={(e) => setNewAnotacao(prev => ({ ...prev, importante: e.target.checked }))}
                        className="rounded"
                      />
                      <label className="text-sm text-foreground">Marcar como importante</label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddAnotacao} size="sm" className="flex-1" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowAddForm(false)
                          setNewAnotacao({ titulo: '', conteudo: '', importante: false })
                        }}
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Anotações List */}
            <div className="space-y-3">
              {filteredAnotacoes.map(anotacao => (
                <AnotacaoCard
                  key={anotacao.id}
                  anotacao={anotacao}
                  isEditing={editingId === anotacao.id}
                  onEdit={(dados) => handleEditAnotacao(anotacao.id, dados)}
                  onDelete={() => handleDeleteAnotacao(anotacao.id)}
                  onStartEdit={() => setEditingId(anotacao.id)}
                  onCancelEdit={() => setEditingId(null)}
                />
              ))}
              
              {filteredAnotacoes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <StickyNote className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Nenhuma anotação encontrada</p>
                  <p className="text-sm">Clique em "Nova Anotação" para começar</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Componente para cada card de anotação
function AnotacaoCard({ 
  anotacao, 
  isEditing, 
  onEdit, 
  onDelete, 
  onStartEdit, 
  onCancelEdit 
}: {
  anotacao: Anotacao
  isEditing: boolean
  onEdit: (dados: Partial<Anotacao>) => void
  onDelete: () => void
  onStartEdit: () => void
  onCancelEdit: () => void
}) {
  const [editData, setEditData] = useState({
    titulo: anotacao.titulo,
    conteudo: anotacao.conteudo,
    importante: anotacao.importante
  })

  useEffect(() => {
    if (isEditing) {
      setEditData({
        titulo: anotacao.titulo,
        conteudo: anotacao.conteudo,
        importante: anotacao.importante
      })
    }
  }, [isEditing, anotacao])

  const handleSave = () => {
    onEdit({
      titulo: editData.titulo,
      conteudo: editData.conteudo,
      importante: editData.importante
    })
  }

  if (isEditing) {
    return (
      <motion.div
        layout
        className="p-4 border border-primary/20 rounded-lg bg-primary/5"
      >
        <div className="space-y-3">
          <Input
            value={editData.titulo}
            onChange={(e) => setEditData(prev => ({ ...prev, titulo: e.target.value }))}
            className="bg-background"
          />
          <textarea
            value={editData.conteudo}
            onChange={(e) => setEditData(prev => ({ ...prev, conteudo: e.target.value }))}
            className="bg-background min-h-[80px] w-full px-3 py-2 border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={editData.importante}
              onChange={(e) => setEditData(prev => ({ ...prev, importante: e.target.checked }))}
              className="rounded"
            />
            <label className="text-sm text-foreground">Marcar como importante</label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={onCancelEdit} variant="outline" size="sm" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={onStartEdit}
      className="p-4 border border-border rounded-lg hover:border-orange-400 hover:bg-orange-500/10 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground text-sm">{anotacao.titulo}</h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStartEdit()
            }}
            className="p-1 hover:bg-orange-500/20 rounded transition-colors"
            title="Editar"
          >
            <Edit3 className="w-3 h-3 text-orange-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
        {anotacao.conteudo}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {anotacao.importante && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
              <Tag className="w-2 h-2 mr-1" />
              Importante
            </span>
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(anotacao.atualizadoEm).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </motion.div>
  )
}
