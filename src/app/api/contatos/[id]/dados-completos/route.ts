import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.tappy.id'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obter token do header Authorization ao invés de cookies
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    console.log(`🔍 [DADOS-COMPLETOS] Buscando dados para chatId: ${params.id}`)

    // Buscar dados completos do contato pelo chatId (sem normalização)
    const response = await fetch(`${BACKEND_URL}/api/contatos/chat/${encodeURIComponent(params.id)}/dados-completos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 [DADOS-COMPLETOS] Response status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ℹ️ [DADOS-COMPLETOS] Chat ainda não é contato CRM: ${params.id}`)
        // Chat ainda não foi salvo como contato no CRM - isso é normal
        return NextResponse.json({
          id: params.id,
          fila: null,
          tags: [],
          atendente: null,
          kanbanBoard: null,
          orcamento: null,
          agendamento: null,
          isWhatsAppChat: true, // Flag para indicar que é um chat WAHA sem contato CRM
          whatsAppId: params.id
        })
      }
      
      const errorText = await response.text()
      console.error(`❌ [DADOS-COMPLETOS] Erro do backend: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ [DADOS-COMPLETOS] Dados retornados:`, { 
      id: data.id, 
      tagsCount: data.tags?.length || 0,
      tags: data.tags?.map((tag: any) => ({ id: tag.id, nome: tag.nome, cor: tag.cor })) || []
    })
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro ao buscar dados completos do contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
