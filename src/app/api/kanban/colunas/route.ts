import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }

    console.log('🌐 [API ROUTE] Recebendo dados para criar coluna:', {
      body: body,
      nome: body.nome,
      cor: body.cor,
      posicao: body.posicao,
      quadroId: body.quadroId,
      backendUrl: `${BACKEND_URL}/api/kanban/column-create`
    })

    const response = await fetch(`${BACKEND_URL}/api/kanban/column-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    })

    console.log('🌐 [API ROUTE] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ [API ROUTE] Erro do backend ao criar coluna:', {
        status: response.status,
        error: error,
        dadosEnviados: body
      })
      return NextResponse.json({ error: 'Erro ao criar coluna' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [API ROUTE] Coluna criada com sucesso:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API de colunas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
