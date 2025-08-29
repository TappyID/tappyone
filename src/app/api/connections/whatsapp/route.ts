import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [CONNECTIONS WHATSAPP] GET route chamado')
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [CONNECTIONS WHATSAPP] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🔑 [CONNECTIONS WHATSAPP] Token encontrado')
    console.log('📡 [CONNECTIONS WHATSAPP] Fazendo chamada para backend:', `${BACKEND_URL}/api/connections/whatsapp`)

    // Proxy para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/connections/whatsapp`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 [CONNECTIONS WHATSAPP] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CONNECTIONS WHATSAPP] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [CONNECTIONS WHATSAPP] Dados obtidos do backend:', data)
    
    // Se for array, pegar o primeiro item ativo
    if (Array.isArray(data) && data.length > 0) {
      const activeSession = data.find(session => session.ativo) || data[0]
      console.log('✅ [CONNECTIONS WHATSAPP] Sessão ativa encontrada:', activeSession)
      return NextResponse.json(activeSession)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [CONNECTIONS WHATSAPP] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [CONNECTIONS WHATSAPP] POST route chamado')
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 [CONNECTIONS WHATSAPP] Dados recebidos:', body)

    // Proxy para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/connections/whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('📡 [CONNECTIONS WHATSAPP] Status POST backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CONNECTIONS WHATSAPP] Erro POST backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [CONNECTIONS WHATSAPP] POST concluído:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [CONNECTIONS WHATSAPP] Erro POST interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
