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
    
    console.log('📞 [CONNECTIONS] Fazendo requisição para backend:', `${backendUrl}/api/connections`)

    const response = await fetch(`${backendUrl}/api/connections`, {
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
    console.log('✅ [CONNECTIONS] Dados recebidos do backend:', data)
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
