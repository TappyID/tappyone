'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Tag, Plus, Palette, Hash } from 'lucide-react'

interface TagsBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function TagsBottomSheet({ isOpen, onClose, chatId }: TagsBottomSheetProps) {
  const [novaTag, setNovaTag] = useState('')
  const [corSelecionada, setCorSelecionada] = useState('#3b82f6')
  const [tagsExistentes] = useState([
    { id: '1', nome: 'Cliente VIP', cor: '#ef4444' },
    { id: '2', nome: 'Interessado', cor: '#f59e0b' },
    { id: '3', nome: 'Follow-up', cor: '#10b981' },
    { id: '4', nome: 'Proposta Enviada', cor: '#8b5cf6' }
  ])

  if (!isOpen) return null

  const cores = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#6b7280', '#059669'
  ]

  const handleCriarTag = async () => {
    if (!novaTag.trim()) return
    
    console.log('🏷️ Nova tag:', { nome: novaTag, cor: corSelecionada, chatId })
    
    try {
      // Extrair telefone do chatId
      const telefone = chatId ? chatId.replace('@c.us', '') : null
      if (!telefone) {
        console.error('❌ Telefone não encontrado')
        return
      }
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone
      console.log('📡 0. Buscando UUID do contato pelo telefone:', telefone)
      
      const contactResponse = await fetch(`/api/contatos?telefone=${telefone}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.error('❌ Erro ao buscar contato:', contactResponse.status)
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === telefone)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('✅ 0. UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === telefone)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('✅ 0. UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.error('❌ UUID do contato não encontrado')
        return
      }
      
      // 1. PRIMEIRO: Criar a tag
      const tagData = {
        nome: novaTag.trim(),
        cor: corSelecionada,
        ativo: true
      }
      
      console.log('📡 1. Criando tag:', tagData)
      
      const tagResponse = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData)
      })
      
      if (!tagResponse.ok) {
        const error = await tagResponse.json().catch(() => null)
        console.error('❌ Erro ao criar tag:', tagResponse.status, error)
        return
      }
      
      const tagResult = await tagResponse.json()
      console.log('✅ 1. Tag criada com sucesso:', tagResult)
      
      // 2. SEGUNDO: Vincular a tag ao contato
      console.log('📡 2. Vinculando tag ao contato:', contatoUUID)
      
      const vincularResponse = await fetch(`/api/contatos/${contatoUUID}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        },
        body: JSON.stringify({ tagIds: [tagResult.data.id] })
      })
      
      if (vincularResponse.ok) {
        console.log('✅ 2. Tag vinculada ao contato com sucesso!')
        
        // Toaster de sucesso
        alert(`✅ Tag "${novaTag}" criada com sucesso!`)
        
        setNovaTag('')
        onClose()
        
        // Disparar evento personalizado para atualizar indicadores
        window.dispatchEvent(new CustomEvent('tagCreated', { 
          detail: { contatoId: telefone, contatoUUID, tag: tagResult } 
        }))
      } else {
        const vincularError = await vincularResponse.json().catch(() => null)
        console.error('❌ Erro ao vincular tag ao contato:', vincularResponse.status, vincularError)
      }
      
    } catch (error) {
      console.error('❌ Erro de rede ao criar tag:', error)
    }
  }

  const handleAplicarTag = async (tagId: string) => {
    console.log('🏷️ Aplicar tag:', { tagId, chatId })
    
    try {
      // Extrair telefone do chatId
      const telefone = chatId ? chatId.replace('@c.us', '') : null
      if (!telefone) {
        console.error('❌ Telefone não encontrado')
        return
      }
      
      // Buscar o UUID do contato pelo telefone (mesmo processo da criação)
      console.log('📡 Buscando UUID do contato pelo telefone:', telefone)
      
      const contactResponse = await fetch(`/api/contatos?telefone=${telefone}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.error('❌ Erro ao buscar contato:', contactResponse.status)
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === telefone)
        if (specificContact) {
          contatoUUID = specificContact.id
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === telefone)
        if (specificContact) {
          contatoUUID = specificContact.id
        }
      }
      
      if (!contatoUUID) {
        console.error('❌ UUID do contato não encontrado')
        return
      }
      
      console.log('📡 Vinculando tag existente ao contato:', { tagId, contatoUUID })
      
      const vincularResponse = await fetch(`/api/contatos/${contatoUUID}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        },
        body: JSON.stringify({ tagIds: [tagId] })
      })
      
      if (vincularResponse.ok) {
        console.log('✅ Tag existente vinculada ao contato com sucesso!')
        onClose()
        
        // Disparar evento personalizado para atualizar indicadores
        window.dispatchEvent(new CustomEvent('tagCreated', { 
          detail: { contatoId: telefone, contatoUUID, tagId } 
        }))
      } else {
        const vincularError = await vincularResponse.json().catch(() => null)
        console.error('❌ Erro ao vincular tag existente ao contato:', vincularResponse.status, vincularError)
      }
      
    } catch (error) {
      console.error('❌ Erro de rede ao aplicar tag:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🏷️ Gerenciar Tags</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 pb-24">
          {/* Criar Nova Tag */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Criar Nova Tag</h3>
            
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={novaTag}
                  onChange={(e) => setNovaTag(e.target.value)}
                  placeholder="Nome da tag..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Cor</label>
                <div className="flex gap-2">
                  {cores.map((cor) => (
                    <button
                      key={cor}
                      onClick={() => setCorSelecionada(cor)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        corSelecionada === cor ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleCriarTag}
                disabled={!novaTag.trim()}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  !novaTag.trim()
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Criar Tag
              </button>
            </div>
          </div>

          {/* Tags Existentes */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Aplicar Tags Existentes</h3>
            <div className="grid grid-cols-2 gap-2">
              {tagsExistentes.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAplicarTag(tag.id)}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.cor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {tag.nome}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              💡 Sobre as tags:
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              • Organize seus contatos por categorias<br/>
              • Use cores para identificação rápida<br/>
              • Tags ajudam no follow-up e segmentação
            </p>
          </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
