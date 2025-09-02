'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MoreVertical, 
  Reply, 
  Forward, 
  Edit, 
  Trash2, 
  Star, 
  Copy,
  Download,
  Smile
} from 'lucide-react'
import { WhatsAppMessage } from '@/hooks/useInfiniteMessages'
import { DeleteConfirmTooltip } from './DeleteConfirmTooltip'

interface MessageContextMenuProps {
  message: WhatsAppMessage
  onReply: (message: WhatsAppMessage) => void
  onForward: (message: WhatsAppMessage) => void
  onEdit: (message: WhatsAppMessage) => void
  onDelete: (message: WhatsAppMessage) => void
  onStar: (message: WhatsAppMessage) => void
  onCopy: (text: string) => void
  isStarred?: boolean
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onStar,
  onCopy,
  isStarred = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 180
      const menuHeight = 280
      
      // Posiciona à esquerda do botão por padrão
      let left = rect.left - menuWidth - 5
      let top = rect.top
      
      // Se não couber à esquerda, coloca à direita
      if (left < 10) {
        left = rect.right + 5
      }
      
      // Se não couber à direita, centraliza
      if (left + menuWidth > window.innerWidth - 10) {
        left = rect.left - menuWidth / 2
      }
      
      // Ajusta verticalmente se necessário
      if (top + menuHeight > window.innerHeight - 10) {
        top = window.innerHeight - menuHeight - 10
      }
      
      if (top < 10) {
        top = 10
      }
      
      setMenuPosition({ top, left })
    }
    
    setIsOpen(true)
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const canEdit = message.fromMe && message.type === 'text'
  const canDelete = message.fromMe
  const hasText = message.body || message.caption

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggleMenu}
        className="p-1 rounded-full hover:bg-gray-100 transition-opacity"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div 
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px] max-w-[200px]"
          style={{
            top: '-10px',
            [message.fromMe ? 'right' : 'left']: '30px'
          }}
          onMouseLeave={() => setIsOpen(false)}
        >
            {/* Reações */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Reagir</div>
              <div className="flex gap-1">
                {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAction(() => {
                      // Fazer requisição para adicionar reação
                      const token = localStorage.getItem('token')
                      if (token) {
                        fetch('/api/whatsapp/reaction', {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            messageId: message.id,
                            reaction: emoji
                          })
                        }).catch(error => console.error('Erro ao adicionar reação:', error))
                      }
                    })}
                    className="w-8 h-8 rounded-full hover:bg-blue-50 flex items-center justify-center text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleAction(() => onReply(message))}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3 text-gray-700"
            >
              <Reply className="w-4 h-4 text-blue-600" />
              Responder
            </button>

            <button
              onClick={() => handleAction(() => onForward(message))}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3 text-gray-700"
            >
              <Forward className="w-4 h-4 text-blue-600" />
              Encaminhar
            </button>

            {canEdit && (
              <button
                onClick={() => handleAction(() => onEdit(message))}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3 text-gray-700"
              >
                <Edit className="w-4 h-4 text-blue-600" />
                Editar
              </button>
            )}

            <button
              onClick={() => handleAction(() => onStar(message))}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3 text-gray-700"
            >
              <Star className={`w-4 h-4 ${isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-blue-600'}`} />
              {isStarred ? 'Remover favorito' : 'Favoritar'}
            </button>

            {hasText && (
              <button
                onClick={() => handleAction(() => onCopy(message.body || message.caption || ''))}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3 text-gray-700"
              >
                <Copy className="w-4 h-4 text-blue-600" />
                Copiar texto
              </button>
            )}

            {message.mediaUrl && (
              <button
                onClick={() => handleAction(() => window.open(message.mediaUrl, '_blank'))}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3 text-gray-700"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Baixar mídia
              </button>
            )}

            {canDelete && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <DeleteConfirmTooltip onConfirm={() => handleAction(() => onDelete(message))}>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3">
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </button>
                </DeleteConfirmTooltip>
              </>
            )}
        </div>
      )}
    </>
  )
}
