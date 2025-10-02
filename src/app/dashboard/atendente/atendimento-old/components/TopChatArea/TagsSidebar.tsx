'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Plus, Search, Trash2 } from 'lucide-react'
import { getContactUUID } from './utils/getContactUUID'

interface TagsSidebarProps {
  isOpen: boolean
  onClose: () => void
  contatoId?: string | null
}

export default function TagsSidebar({ isOpen, onClose, contatoId }: TagsSidebarProps) {
  const [tags, setTags] = useState([])
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen && contatoId) {
      console.log('🏷️ [TagsSidebar] Carregando tags para contato:', contatoId)
      fetchTags()
      fetchAllTags()
    }
  }, [isOpen, contatoId])

  const fetchTags = async () => {
    setLoading(true)
    console.log('🏷️ [TagsSidebar] Buscando tags do contato (telefone):', contatoId)
    try {
      // 1. Buscar UUID do contato
      const contatoUUID = await getContactUUID(contatoId!)
      if (!contatoUUID) {
        console.log('🏷️ [TagsSidebar] UUID não encontrado')
        setTags([])
        return
      }
      
      console.log('🏷️ [TagsSidebar] UUID encontrado:', contatoUUID)
      
      // 2. Buscar tags usando o UUID
      const token = localStorage.getItem('token')
      const response = await fetch(`http://159.65.34.199:8081/api/contatos/${contatoUUID}/tags`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('🏷️ [TagsSidebar] Tags recebidas:', result)
        
        // A API retorna {data: Array, success: true}
        const tags = result.data || result || []
        setTags(Array.isArray(tags) ? tags : [])
        console.log('🏷️ [TagsSidebar] Total de tags:', tags.length)
      }
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTags = async () => {
    // NÃO BUSCAR TODAS AS TAGS - apenas as do contato
    console.log(' [TagsSidebar] Não buscando todas as tags - apenas do contato')
    setAllTags([])
  }

  const addTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/tags/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contato_id: contatoId, tagId })
      })
      
      if (response.ok) {
        fetchTags() // Recarregar tags
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const removeTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/tags/unassign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contato_id: contatoId, tagId })
      })
      
      if (response.ok) {
        fetchTags() // Recarregar tags
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const filteredTags = (Array.isArray(allTags) ? allTags : []).filter((tag: any) => 
    tag.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !(Array.isArray(tags) ? tags : []).find((t: any) => t.id === tag.id)
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl border-l">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold">Tags</h3>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
              {tags.length}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tags Aplicadas */}
        <div className="p-4 border-b">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tags Aplicadas</h4>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            </div>
          ) : (Array.isArray(tags) ? tags : []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(tags) ? tags : []).map((tag: any) => (
                <div 
                  key={tag.id} 
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                  style={{ backgroundColor: `${tag.cor}20`, color: tag.cor }}
                >
                  <span>{tag.nome}</span>
                  <button 
                    onClick={() => removeTag(tag.id)}
                    className="hover:bg-red-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma tag aplicada</p>
          )}
        </div>

        {/* Buscar e Adicionar Tags - OCULTO POR ENQUANTO */}
        <div className="p-4" style={{ display: 'none' }}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Adicionar Tags</h4>
          
          {/* Busca */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                       focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Lista de Tags Disponíveis */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTags.map((tag: any) => (
              <button
                key={tag.id}
                onClick={() => addTag(tag.id)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg text-left"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.cor }}
                  ></div>
                  <span className="text-sm">{tag.nome}</span>
                </div>
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            ))}
            
            {filteredTags.length === 0 && searchTerm && (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhuma tag encontrada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
