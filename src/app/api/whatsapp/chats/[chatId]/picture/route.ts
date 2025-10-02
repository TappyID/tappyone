import { NextRequest, NextResponse } from 'next/server'
import { getActiveSession } from '@/utils/getActiveSession'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    
    console.log('📸 [PICTURE] Requisição recebida para chat:', chatId)
    
    if (!chatId || chatId === 'undefined') {
      return NextResponse.json({ error: 'ChatId inválido' }, { status: 400 })
    }
    
    // Buscar authorization header completo
    const authHeader = request.headers.get('authorization') || ''
    console.log('🔑 [PICTURE] Token:', authHeader ? 'Encontrado' : 'NÃO encontrado')
    
    if (!authHeader) {
      console.error('❌ [PICTURE] Token não encontrado')
      return NextResponse.json({ 
        url: null,
        error: 'Token não encontrado' 
      }, { status: 200 }) // Retorna 200 com url null ao invés de 401
    }

    // Buscar sessão ativa do banco (passa o header completo com "Bearer ")
    console.log('🔍 [PICTURE] Chamando getActiveSession...')
    const sessionId = await getActiveSession(authHeader)
    console.log('📋 [PICTURE] Sessão retornada:', sessionId)
    
    if (!sessionId) {
      console.error('❌ [PICTURE] Nenhuma sessão ativa encontrada')
      return NextResponse.json({ 
        url: null,
        error: 'Nenhuma sessão ativa' 
      }, { status: 200 }) // Retorna 200 com url null ao invés de 404
    }

    console.log('📸 [PICTURE] Buscando foto do chat:', chatId, 'na sessão:', sessionId)
    
    const wahaUrl = `${WAHA_URL}/api/${sessionId}/chats/${encodeURIComponent(chatId)}/picture`

    // Proxy para o backend WAHA
    const response = await fetch(wahaUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey',
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      
      // Se não achou foto, retornar imagem padrão ou status específico
      if (response.status === 404) {
        return NextResponse.json({ 
          profilePictureURL: null,
          error: 'Foto não encontrada' 
        }, { status: 404 })
      }
      
      return NextResponse.json(
        { error: `Erro do WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
