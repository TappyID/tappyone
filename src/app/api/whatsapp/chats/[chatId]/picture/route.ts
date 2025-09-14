import { NextRequest, NextResponse } from 'next/server'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    
    if (!chatId || chatId === 'undefined') {
      return NextResponse.json({ error: 'ChatId inválido' }, { status: 400 })
    }
    
    // Obter sessionId dinamicamente do header ou usar o que está ativo
    const authHeader = request.headers.get('authorization')
    let sessionId = 'user_d505e5c3-b965-4ec4-a21c-a024ae603f60' // Use o ID atual do usuário
    
    // Primeiro tentar listar sessões ativas
    const sessionsUrl = `${WAHA_URL}/api/sessions`
    const sessionsResponse = await fetch(sessionsUrl, {
      headers: {
        'X-Api-Key': process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'
      }
    })
    
    if (sessionsResponse.ok) {
      const sessions = await sessionsResponse.json()
      const activeSession = sessions.find((s: any) => s.status === 'WORKING')
      if (activeSession) {
        sessionId = activeSession.name
      }
    }
    
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
