import React, { useState, useEffect } from 'react'
import { Tag } from 'lucide-react'

interface TagsBadgeProps {
  cardId: string
  theme: string
}

export default function TagsBadge({ cardId, theme }: TagsBadgeProps) {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar tags para este card específico
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        const telefone = cardId.replace('@c.us', '')
        
        console.log('🏷️ [TagsBadge] Buscando tags para:', telefone)
        
        // 1. Buscar UUID do contato
        const contactResponse = await fetch(`/api/contatos?telefone=${telefone}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!contactResponse.ok) {
          console.log('🏷️ [TagsBadge] Contato não encontrado')
          setTags([])
          return
        }
        
        const contactData = await contactResponse.json()
        let contatoUUID = null
        let contatoTags = null
        
        if (Array.isArray(contactData) && contactData.length > 0) {
          const specificContact = contactData.find((c: any) => c.numeroTelefone === telefone)
          contatoUUID = specificContact?.id
          contatoTags = specificContact?.tags
        } else if (contactData?.data && Array.isArray(contactData.data)) {
          const specificContact = contactData.data.find((c: any) => c.numeroTelefone === telefone)
          contatoUUID = specificContact?.id
          contatoTags = specificContact?.tags
        }
        
        // Se já temos as tags no contato, usar diretamente
        if (contatoTags) {
          const tagsArray = Array.isArray(contatoTags) ? contatoTags : []
          console.log('🏷️ [TagsBadge] Tags encontradas no contato:', tagsArray.length)
          setTags(tagsArray)
          return
        }
        
        if (!contatoUUID) {
          console.log('🏷️ [TagsBadge] UUID não encontrado')
          setTags([])
          return
        }
        
        console.log('🏷️ [TagsBadge] UUID encontrado:', contatoUUID)
        
        // 2. Buscar tags do contato
        const tagsResponse = await fetch(`/api/contatos/${contatoUUID}/tags`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (tagsResponse.ok) {
          const data = await tagsResponse.json()
          let tagsData = data.data || data || []
          // Garantir que sempre seja um array
          if (!Array.isArray(tagsData)) {
            tagsData = []
          }
          console.log('🏷️ [TagsBadge] Tags encontradas:', tagsData.length)
          setTags(tagsData)
        } else {
          console.log('🏷️ [TagsBadge] Nenhuma tag encontrada')
          setTags([])
        }
      } catch (error) {
        console.error('🏷️ [TagsBadge] Erro:', error)
        setTags([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTags()
  }, [cardId])

  // Validação final - garantir que tags é um array
  if (!Array.isArray(tags) || tags.length === 0) return null

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: '#6366f120',
        borderColor: '#6366f140',
        color: '#6366f1'
      }}
      title={`${tags.length} tag(s): ${tags.map((t: any) => t.nome || t.name || 'Tag').join(', ')}`}
    >
      <Tag className="w-[11px] h-[11px]" />
      <span>{tags.length}</span>
    </div>
  )
}
