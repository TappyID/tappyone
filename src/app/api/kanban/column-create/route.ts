import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const authorization = request.headers.get('authorization')
    
    console.log('🔑 [API ROUTE] Authorization recebido:', authorization?.substring(0, 50) + '...')
    
    if (!authorization) {
      console.error('❌ [API ROUTE] Nenhum token de autorização fornecido!')
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📤 [API ROUTE] Body recebido:', body)

    const backendEndpoint = `${backendUrl}/api/kanban/column-create`
    console.log('🌐 [API ROUTE] Chamando backend:', backendEndpoint)

    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('📥 [API ROUTE] Status do backend:', response.status)
    const data = await response.json()
    console.log('📥 [API ROUTE] Resposta do backend:', data)

    if (!response.ok) {
      console.error('❌ [API ROUTE] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar coluna:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
