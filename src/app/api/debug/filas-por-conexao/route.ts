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
    
    // Processar dados para debug
    const debugData = data.connections?.map((conn: any) => {
      let modulation = null
      let filas = []
      
      try {
        if (conn.modulation) {
          modulation = typeof conn.modulation === 'string' 
            ? JSON.parse(conn.modulation) 
            : conn.modulation
          filas = modulation.selectedFilas || []
        }
      } catch (error) {
        console.error('Erro ao parsear modulation:', error)
      }

      return {
        id: conn.id,
        user_id: conn.user_id,
        session_name: conn.session_name,
        platform: conn.platform,
        status: conn.status,
        filas_selecionadas: filas,
        connection_name: modulation?.connectionName || 'Sem nome',
        created_at: conn.created_at,
        updated_at: conn.updated_at
      }
    }) || []

    return NextResponse.json({
      total: debugData.length,
      connections: debugData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao buscar dados de debug:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
