import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

const wahaUrl = 'http://159.65.34.199:3001'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [WHATSAPP GROUPS] GET route chamado')
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [WHATSAPP GROUPS] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Buscar sessões ativas diretamente no WAHA
    console.log('🔍 [WHATSAPP GROUPS] Buscando sessões ativas no WAHA...')
    const sessionsResponse = await fetch(`${wahaUrl}/api/sessions`, {
      headers: {
        'X-API-Key': 'tappyone-waha-2024-secretkey',
        'Content-Type': 'application/json'
      }
    })

    if (!sessionsResponse.ok) {
      console.log('❌ [WHATSAPP GROUPS] Erro ao buscar sessões WAHA:', sessionsResponse.status)
      return NextResponse.json({ error: 'Erro ao conectar com WAHA' }, { status: 500 })
    }

    const sessions = await sessionsResponse.json()
    console.log('📡 [WHATSAPP GROUPS] Sessões WAHA encontradas:', sessions.length)
    
    // Buscar primeira sessão ativa (WORKING)
    const activeSession = sessions.find((session: any) => session.status === 'WORKING')
    
    if (!activeSession) {
      console.log('❌ [WHATSAPP GROUPS] Nenhuma sessão ativa encontrada no WAHA')
      return NextResponse.json([], { status: 200 })
    }

    const sessionName = activeSession.name
    console.log('✅ [WHATSAPP GROUPS] Sessão ativa encontrada:', sessionName)
    console.log('📡 [WHATSAPP GROUPS] Fazendo chamada para WAHA:', `${wahaUrl}/api/${sessionName}/groups`)

    // Proxy direto para WAHA
    const response = await fetch(`${wahaUrl}/api/${sessionName}/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'tappyone-waha-2024-secretkey'
      }
    })

    console.log('📡 [WHATSAPP GROUPS] Status da resposta WAHA:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WHATSAPP GROUPS] Erro WAHA:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WHATSAPP GROUPS] Dados obtidos WAHA:', data?.length || 0, 'grupos')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WHATSAPP GROUPS] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
