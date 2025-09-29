import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Buscar todas as conexões
    const response = await fetch(`${backendUrl}/api/connections/`, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao buscar conexões' }, { status: 500 })
    }

    const data = await response.json()
    
    // Formatar dados para debug
    const debugData = data.connections?.map((conn: any) => ({
      id: conn.id,
      user_id: conn.user_id,
      session_name: conn.session_name,
      platform: conn.platform,
      status: conn.status,
      modulation: conn.modulation,
      created_at: conn.created_at,
      updated_at: conn.updated_at
    })) || []

    return NextResponse.json({
      total: debugData.length,
      connections: debugData
    })
  } catch (error) {
    console.error('Erro ao buscar conexões para debug:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
