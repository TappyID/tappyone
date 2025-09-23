import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
const JWT_SECRET = process.env.JWT_SECRET || 'tappyone_jwt_secret_2024_secure_key_a8f9e2d1c5b7f3e6a4d8c9b2e5f1a7d3'

interface JwtPayload {
  userId: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.substring(7) || 'bypass'
    
    // Extrair cardIds e mapeamento do body
    const { cardIds, cardContactMapping } = await request.json()
    
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json({}, { status: 200 })
    }

    console.log('🚀 Batch Agendamentos - cardIds:', cardIds.length)
    console.log('🚀 Batch Agendamentos - mapeamento:', cardContactMapping)
    
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

    // Buscar agendamentos para cada telefone (mesma abordagem dos indicadores do chat)
    const result: Record<string, any[]> = {}
    
    // Processar cada card
    const promises = cardIds.map(async (cardId: string) => {
      const telefone = cardContactMapping[cardId]
      if (!telefone) {
        result[cardId] = []
        return
      }
      
      try {
        // 1. Buscar UUID do contato pelo telefone
        const contactResponse = await fetch(`${BACKEND_URL}/api/contatos?telefone=${telefone}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!contactResponse.ok) {
          result[cardId] = []
          return
        }
        
        const contactData = await contactResponse.json()
        let contatoUUID = null
        
        if (Array.isArray(contactData) && contactData.length > 0) {
          const specificContact = contactData.find((c: any) => c.numeroTelefone === telefone)
          contatoUUID = specificContact?.id
        } else if (contactData?.data && Array.isArray(contactData.data)) {
          const specificContact = contactData.data.find((c: any) => c.numeroTelefone === telefone)
          contatoUUID = specificContact?.id
        }
        
        if (!contatoUUID) {
          result[cardId] = []
          return
        }
        
        // 2. Buscar agendamentos usando o UUID
        const agendamentosResponse = await fetch(`${BACKEND_URL}/api/agendamentos?contato_id=${contatoUUID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (agendamentosResponse.ok) {
          const data = await agendamentosResponse.json()
          result[cardId] = data.data || data || []
        } else {
          result[cardId] = []
        }
      } catch (error) {
        console.error(`Erro ao buscar agendamentos para ${cardId}:`, error)
        result[cardId] = []
      }
    })
    
    await Promise.all(promises)
    
    console.log('✅ Agendamentos mapeados para cardIds:', result)
    console.log('✅ Batch Agendamentos OK:', Object.keys(result).length, 'cards')

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Erro na API batch agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
