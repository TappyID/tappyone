'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Plus,
  Search,
  Edit3,
  Trash2,
  Tag,
  Clock,
  Save,
  StickyNote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Anotacao {
  id: string
  titulo: string
  conteudo: string
  importante: boolean
  criado_em: string
  atualizado_em: string
  contato_id?: string
  usuario_id: string
}

interface AnotacoesModalProps {
  isOpen: boolean
  onClose: () => void
  contactData?: any
  chatId?: string
}

// Funções da API - usando rotas relativas do Next.js
const apiCreateAnotacao = async (data: any) => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Token de autenticação não encontrado')
  
  const response = await fetch('/api/anotacoes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
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
  console.log('🔄 Modal - Carregando anotações para contato:', contatoId)
  
  const response = await fetch(`/api/anotacoes?contato_id=${encodeURIComponent(contatoId)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) throw new Error('Erro ao buscar anotações')
  const data = await response.json()
  console.log('📦 Modal - Dados recebidos:', data)
  return data
}

export default function AnotacoesModal({ 
  isOpen, 
  onClose, 
  contactData,
  chatId
}: AnotacoesModalProps) {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newAnotacao, setNewAnotacao] = useState({ titulo: '', conteudo: '', importante: false })
  const [showAddForm, setShowAddForm] = useState(false)

  // Carregar anotações quando o modal abre
  useEffect(() => {
    const loadAnotacoes = async () => {
      const contatoId = chatId || contactData?.jid || ''
      console.log('🔍 KANBAN Modal - isOpen:', isOpen)
      console.log('🔍 KANBAN Modal - chatId:', chatId)
      console.log('🔍 KANBAN Modal - contactData:', contactData)
      console.log('🔍 KANBAN Modal - contatoId final:', contatoId)
      
      if (!contatoId) {
        console.log('❌ KANBAN Modal - Sem contatoId, não carregando anotações')
        return
      }
      
      setLoading(true)
      try {
        const data = await apiFetchAnotacoes(contatoId)
        setAnotacoes(data)
      } catch (error) {
        console.error('Erro ao carregar anotações:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadAnotacoes()
    }
  }, [isOpen, chatId, contactData?.jid])

  // Filtrar anotações - backend já filtra por contato
  const filteredAnotacoes = anotacoes.filter(anotacao => {
    const matchesSearch = anotacao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anotacao.conteudo.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const handleAddAnotacao = async () => {
    if (!newAnotacao.titulo.trim() || !newAnotacao.conteudo.trim()) return
    if (!chatId && !contactData?.jid) return

    setLoading(true)
    try {
      const data = {
        titulo: newAnotacao.titulo,
        conteudo: newAnotacao.conteudo,
        importante: newAnotacao.importante,
        contato_id: chatId || contactData?.jid || ''
      }
      
      const novaAnotacao = await apiCreateAnotacao(data)
      setAnotacoes(prev => [novaAnotacao, ...prev])
      setNewAnotacao({ titulo: '', conteudo: '', importante: false })
      setShowAddForm(false)
    } catch (error) {
      console.error('Erro ao criar anotação:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAnotacao = async (id: string, dados: Partial<Anotacao>) => {
    setLoading(true)
    try {
      const updatedAnotacao = await apiUpdateAnotacao(id, dados)
      setAnotacoes(prev => prev.map(anotacao => 
        anotacao.id === id ? updatedAnotacao : anotacao
      ))
      setEditingId(null)
    } catch (error) {
      console.error('Erro ao editar anotação:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnotacao = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta anotação?')) {
      setLoading(true)
      try {
        await apiDeleteAnotacao(id)
        setAnotacoes(prev => prev.filter(anotacao => anotacao.id !== id))
        setEditingId(null)
      } catch (error) {
        console.error('Erro ao deletar anotação:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <StickyNote className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Anotações</h2>
                {contactData && (
                  <p className="text-sm text-gray-500">
                    {contactData.name || contactData.pushname || 'Contato'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[70vh]">
            {/* Sidebar de busca e ações */}
            <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar anotações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Add Button */}
              <Button 
                onClick={() => setShowAddForm(true)}
                className="w-full mb-4" 
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Anotação
              </Button>

              {/* Lista de Anotações */}
              <div className="space-y-2">
                {filteredAnotacoes.map(anotacao => (
                  <motion.div
                    key={anotacao.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setEditingId(anotacao.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      editingId === anotacao.id 
                        ? 'border-orange-300 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-200 hover:bg-orange-25'
                    }`}
                  >
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      {anotacao.titulo}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {anotacao.conteudo}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {anotacao.importante && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800">
                            Importante
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(anotacao.atualizado_em).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {filteredAnotacoes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma anotação encontrada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Área principal */}
            <div className="flex-1 p-6">
              {showAddForm ? (
                <AddAnotacaoForm 
                  newAnotacao={newAnotacao}
                  setNewAnotacao={setNewAnotacao}
                  onSave={handleAddAnotacao}
                  onCancel={() => {
                    setShowAddForm(false)
                    setNewAnotacao({ titulo: '', conteudo: '', importante: false })
                  }}
                />
              ) : editingId ? (
                <EditAnotacaoForm
                  anotacao={filteredAnotacoes.find(a => a.id === editingId)!}
                  onSave={(dados) => handleEditAnotacao(editingId, dados)}
                  onDelete={() => handleDeleteAnotacao(editingId)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Selecione uma anotação para editar</p>
                    <p className="text-sm">ou clique em "Nova Anotação"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Componente para adicionar nova anotação
function AddAnotacaoForm({ 
  newAnotacao, 
  setNewAnotacao, 
  onSave, 
  onCancel 
}: {
  newAnotacao: { titulo: string; conteudo: string; importante: boolean }
  setNewAnotacao: (fn: (prev: any) => any) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Anotação</h3>
      
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <Input
            placeholder="Digite o título da anotação..."
            value={newAnotacao.titulo}
            onChange={(e) => setNewAnotacao(prev => ({ ...prev, titulo: e.target.value }))}
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo
          </label>
          <textarea
            placeholder="Digite o conteúdo da anotação..."
            value={newAnotacao.conteudo}
            onChange={(e) => setNewAnotacao(prev => ({ ...prev, conteudo: e.target.value }))}
            className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={newAnotacao.importante}
            onChange={(e) => setNewAnotacao(prev => ({ ...prev, importante: e.target.checked }))}
            className="rounded"
          />
          <label className="text-sm text-gray-700">Marcar como importante</label>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={onSave} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// Componente para editar anotação
function EditAnotacaoForm({ 
  anotacao, 
  onSave, 
  onDelete, 
  onCancel 
}: {
  anotacao: Anotacao
  onSave: (dados: Partial<Anotacao>) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState({
    titulo: anotacao?.titulo || '',
    conteudo: anotacao?.conteudo || '',
    importante: anotacao?.importante || false
  })

  const handleSave = () => {
    onSave({
      titulo: editData.titulo,
      conteudo: editData.conteudo,
      importante: editData.importante
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Editando Anotação</h3>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Excluir anotação"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <Input
            value={editData.titulo}
            onChange={(e) => setEditData(prev => ({ ...prev, titulo: e.target.value }))}
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo
          </label>
          <textarea
            value={editData.conteudo}
            onChange={(e) => setEditData(prev => ({ ...prev, conteudo: e.target.value }))}
            className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="checkbox"
            checked={editData.importante}
            onChange={(e) => setEditData(prev => ({ ...prev, importante: e.target.checked }))}
            className="rounded"
          />
          <label className="text-sm text-gray-700">Marcar como importante</label>
        </div>
        
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" />
            Criado: {new Date(anotacao.criado_em).toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            Atualizado: {new Date(anotacao.atualizado_em).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={handleSave} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
