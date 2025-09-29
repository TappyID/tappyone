import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔗 [CONNECTIONS] GET route foi chamado!')
  
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      console.log('❌ [CONNECTIONS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }
    
    console.log('📞 [CONNECTIONS] Fazendo requisição para backend:', `${backendUrl}/api/connections/`)
    console.log('📞 [CONNECTIONS] Authorization header:', authorization ? `${authorization.substring(0, 20)}...` : 'null')

    const response = await fetch(`${backendUrl}/api/connections/`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ [CONNECTIONS] Erro na resposta do backend:', response.status)
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `Backend error: ${response.status}` }
      }
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    
    // 🔥 CONVERTER snake_case para camelCase
    if (data.connections) {
      data.connections = data.connections.map((conn: any) => ({
        ...conn,
        sessionName: conn.session_name,
        sessionData: conn.session_data,
        userId: conn.user_id,
        connectedAt: conn.connected_at,
        lastSyncAt: conn.last_sync_at,
        createdAt: conn.created_at,
        updatedAt: conn.updated_at
      }))
    }
    
    // 🔥 DEBUG: Verificar conversão
    console.log('🔍 [CONNECTIONS] Dados convertidos para camelCase:')
    if (data.connections) {
      data.connections.forEach((conn: any, index: number) => {
        console.log(`✅ [CONNECTIONS] Conexão ${index + 1}:`, {
          id: conn.id,
          sessionName: conn.sessionName,
          sessionData: conn.sessionData,
          status: conn.status
        })
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [CONNECTIONS] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🔗 [CONNECTIONS] POST route foi chamado!')
  
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${backendUrl}/api/connections`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      // Se não é JSON válido (como 404 HTML), retornar erro genérico
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `Backend error: ${response.status}` }
      }
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar conexão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
