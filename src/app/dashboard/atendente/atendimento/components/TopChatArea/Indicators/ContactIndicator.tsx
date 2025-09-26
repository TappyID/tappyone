'use client'

import React, { useState, useEffect } from 'react'
import { User, UserPlus } from 'lucide-react'

interface ContactIndicatorProps {
  chatId?: string | null
  onClick: () => void
}

export default function ContactIndicator({ chatId, onClick }: ContactIndicatorProps) {
  const [isContact, setIsContact] = useState(false)
  const [loading, setLoading] = useState(false)
  
  console.log('👤 [ContactIndicator] Renderizado com chatId:', chatId)

  // Verificar se o chat já é um contato
  useEffect(() => {
    console.log('👤 [ContactIndicator] useEffect disparado com chatId:', chatId)
    
    if (!chatId) {
      console.log('👤 [ContactIndicator] ChatId vazio, resetando estado')
      setIsContact(false)
      return
    }

    const checkContact = async () => {
      setLoading(true)
      console.log('🔍 [ContactIndicator] Verificando se chat é contato:', chatId)
      
      try {
        // Extrair numero do chatId (remover @c.us)
        const numero = chatId.replace('@c.us', '')
        
        const response = await fetch(`/api/contatos?telefone=${numero}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })
        
        console.log('🔍 [ContactIndicator] Status da resposta:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('🔍 [ContactIndicator] Resultado da busca:', result)
          console.log('🔍 [ContactIndicator] Tipo do resultado:', typeof result)
          console.log('🔍 [ContactIndicator] result.data:', result.data)
          
          // Verificar se tem dados válidos - MAIS RIGOROSO
          let hasContact = false
          
          console.log('🔍 [ContactIndicator] Analisando resultado completo:', JSON.stringify(result, null, 2))
          
          // A API está retornando TODOS os contatos! Preciso filtrar pelo telefone específico
          const targetPhone = numero // telefone que estamos procurando
          
          if (result && result.data && Array.isArray(result.data)) {
            // Formato: { data: [...] } - verificar se tem o telefone específico
            const specificContact = result.data.find(contact => contact.numeroTelefone === targetPhone)
            hasContact = !!specificContact
            console.log('🔍 [ContactIndicator] Formato data array - Procurando telefone:', targetPhone)
            console.log('🔍 [ContactIndicator] Contato específico encontrado:', !!specificContact)
            if (specificContact) {
              console.log('🔍 [ContactIndicator] ✅ Contato encontrado:', specificContact.nome, specificContact.id)
            }
          } else if (result && Array.isArray(result)) {
            // Formato: [...] - verificar se tem o telefone específico
            const specificContact = result.find(contact => contact.numeroTelefone === targetPhone)
            hasContact = !!specificContact
            console.log('🔍 [ContactIndicator] Formato array direto - Procurando telefone:', targetPhone)
            console.log('🔍 [ContactIndicator] Total de contatos retornados:', result.length)
            console.log('🔍 [ContactIndicator] Contato específico encontrado:', !!specificContact)
            if (specificContact) {
              console.log('🔍 [ContactIndicator] ✅ Contato encontrado:', specificContact.nome, specificContact.id)
            } else {
              console.log('🔍 [ContactIndicator] ❌ Telefone', targetPhone, 'NÃO encontrado no array')
              console.log('🔍 [ContactIndicator] Telefones no array:', result.map(c => c.numeroTelefone))
            }
          } else if (result && result.id && result.numeroTelefone === targetPhone) {
            // Formato: { id: "...", ... } (contato único) - verificar se é o telefone correto
            hasContact = true
            console.log('🔍 [ContactIndicator] ✅ Formato objeto único COM telefone correto - ID:', result.id, 'Nome:', result.nome)
          } else {
            // Qualquer outro caso = SEM CONTATO
            hasContact = false
            console.log('🔍 [ContactIndicator] ❌ SEM CONTATO - Resultado inválido, vazio ou telefone não encontrado')
          }
          
          setIsContact(hasContact)
          console.log('🔍 [ContactIndicator] É contato? FINAL:', hasContact)
        } else if (response.status === 404) {
          // 404 = não encontrou contato (correto)
          console.log('🔍 [ContactIndicator] 404 - Contato não encontrado (correto)')
          setIsContact(false)
        } else {
          // Outros erros
          console.log('🔍 [ContactIndicator] Erro na busca - Status:', response.status)
          const errorText = await response.text()
          console.log('🔍 [ContactIndicator] Erro:', errorText)
          setIsContact(false)
        }
      } catch (error) {
        console.error('❌ [ContactIndicator] Erro ao verificar contato:', error)
        setIsContact(false)
      } finally {
        setLoading(false)
      }
    }

    checkContact()
  }, [chatId])

  // Listener para quando contato for criado
  useEffect(() => {
    const handleContactCreated = (event: CustomEvent) => {
      const { chatId: createdChatId } = event.detail
      console.log('🎉 [ContactIndicator] Contato criado para chatId:', createdChatId)
      
      // Se o contato criado é para este chat, atualizar
      if (createdChatId === chatId) {
        console.log('🔄 [ContactIndicator] Atualizando status - contato criado!')
        setIsContact(true)
      }
    }

    window.addEventListener('contactCreated', handleContactCreated as EventListener)
    
    return () => {
      window.removeEventListener('contactCreated', handleContactCreated as EventListener)
    }
  }, [chatId])

  if (!chatId) return null

  const handleClick = () => {
    if (isContact) {
      // Se já é contato, mostrar mensagem
      alert('Lead já está no kanban! ✅')
    } else {
      // Se não é contato, abrir modal para criar
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`relative p-1 rounded-sm border transition-colors ${
        isContact 
          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/30' 
          : 'bg-red-500/20 hover:bg-red-500/30 border-red-400/30'
      }`}
      title={isContact ? 'Lead já no kanban' : 'Clique para criar contato'}
    >
      {isContact ? (
        <User className="w-4 h-4 text-emerald-600" />
      ) : (
        <UserPlus className="w-4 h-4 text-red-600" />
      )}
      
      {/* Badge indicador */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
        isContact ? 'bg-emerald-500' : 'bg-red-500'
      }`}>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500/20 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  )
}
