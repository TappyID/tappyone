import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

const wahaUrl = 'http://159.65.34.199:3001'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [WHATSAPP CHATS] GET route chamado')
    
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 [WHATSAPP CHATS] AuthHeader:', authHeader ? `${authHeader.substring(0, 20)}...` : 'null')
    
    if (!authHeader) {
      console.log('❌ [WHATSAPP CHATS] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Buscar sessões ativas diretamente no WAHA
    console.log('🔍 [WHATSAPP CHATS] Buscando sessões ativas no WAHA...')
    const sessionsResponse = await fetch(`${wahaUrl}/api/sessions`, {
      headers: {
        'X-API-Key': 'tappyone-waha-2024-secretkey',
        'Content-Type': 'application/json'
      }
    })

    if (!sessionsResponse.ok) {
      console.log('❌ [WHATSAPP CHATS] Erro ao buscar sessões WAHA:', sessionsResponse.status)
      return NextResponse.json({ error: 'Erro ao conectar com WAHA' }, { status: 500 })
    }

    const sessions = await sessionsResponse.json()
    console.log('📡 [WHATSAPP CHATS] Sessões WAHA encontradas:', sessions.length)
    
    // Buscar primeira sessão ativa (WORKING)
    const activeSession = sessions.find((session: any) => session.status === 'WORKING')
    
    if (!activeSession) {
      console.log('❌ [WHATSAPP CHATS] Nenhuma sessão ativa encontrada no WAHA')
      return NextResponse.json([], { status: 200 })
    }

    const sessionName = activeSession.name
    console.log('✅ [WHATSAPP CHATS] Sessão ativa encontrada:', sessionName)
    console.log('📡 [WHATSAPP CHATS] Fazendo chamada para WAHA:', `${wahaUrl}/api/${sessionName}/chats`)

    // Proxy direto para WAHA
    const response = await fetch(`${wahaUrl}/api/${sessionName}/chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'tappyone-waha-2024-secretkey'
      }
    })

    console.log('📡 [WHATSAPP CHATS] Status da resposta WAHA:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WHATSAPP CHATS] Erro WAHA:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WHATSAPP CHATS] Dados obtidos WAHA:', data?.length || 0, 'chats')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WHATSAPP CHATS] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
