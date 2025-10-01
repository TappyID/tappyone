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

  // Verificar se o chat já é um contato
  useEffect(() => {
    if (!chatId) {
      setIsContact(false)
      return
    }

    const checkContact = async () => {
      setLoading(true)

      try {
        // Extrair numero do chatId (remover @c.us)
        const numero = chatId.replace('@c.us', '')

        const response = await fetch(`/api/contatos?telefone=${numero}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })

        if (response.ok) {
          const result = await response.json()

          // Verificar se tem dados válidos - MAIS RIGOROSO
          let hasContact = false
          const targetPhone = numero

          if (result && result.data && Array.isArray(result.data)) {
            const specificContact = result.data.find(contact => contact.numeroTelefone === targetPhone)
            hasContact = !!specificContact
          } else if (result && Array.isArray(result)) {
            const specificContact = result.find(contact => contact.numeroTelefone === targetPhone)
            hasContact = !!specificContact
          } else if (result && result.id && result.numeroTelefone === targetPhone) {
            hasContact = true
          } else {
            hasContact = false
          }

          setIsContact(hasContact)
        } else if (response.status === 404) {
          // 404 = não encontrou contato (correto)
          setIsContact(false)
        } else {
          // Outros erros
          await response.text()
          setIsContact(false)
        }
      } catch {
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

      // Se o contato criado é para este chat, atualizar
      if (createdChatId === chatId) {
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
