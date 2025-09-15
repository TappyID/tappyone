import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

const wahaUrl = 'http://159.65.34.199:3001'

export async function GET(request: NextRequest) {
  try {
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Buscar sessões ativas diretamente no WAHA
    const sessionsResponse = await fetch(`${wahaUrl}/api/sessions`, {
      headers: {
        'X-API-Key': 'tappyone-waha-2024-secretkey',
        'Content-Type': 'application/json'
      }
    })

    if (!sessionsResponse.ok) {
      return NextResponse.json({ error: 'Erro ao conectar com WAHA' }, { status: 500 })
    }

    const sessions = await sessionsResponse.json()
    
    // Buscar primeira sessão ativa (WORKING)
    const activeSession = sessions.find((session: any) => session.status === 'WORKING')
    
    if (!activeSession) {
      return NextResponse.json([], { status: 200 })
    }

    const sessionName = activeSession.name
   
    // Proxy direto para WAHA
    const response = await fetch(`${wahaUrl}/api/${sessionName}/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'tappyone-waha-2024-secretkey'
      }
    })


    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
   
    
    // Mapear dados do WAHA para formato esperado pelo frontend
    const mappedGroups = Array.isArray(data) ? data.map(group => ({
      id: group.JID || group.id,
      name: group.Name || group.name,
      membros: group.ParticipantCount || 0,
      topic: group.Topic,
      created: group.GroupCreated,
      owner: group.OwnerJID
    })) : []
    
    return NextResponse.json(mappedGroups)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
