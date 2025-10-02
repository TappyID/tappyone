import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const body = await request.json()
    const { conversaId, colunaId, nome, posicao } = body

    if (!conversaId || !colunaId || !nome) {
      return NextResponse.json(
        { error: 'conversaId, colunaId e nome são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('📤 [UPSERT CARD] Enviando para backend:', {
      conversaId,
      colunaId,
      nome,
      posicao
    })

    // Chamar backend Go
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://159.65.34.199:8081'
    const response = await fetch(`${backendUrl}/api/kanban/cards/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        conversaId,
        colunaId,
        nome,
        posicao: posicao || 0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [UPSERT CARD] Erro do backend:', errorText)
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [UPSERT CARD] Card salvo:', conversaId)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ [UPSERT CARD] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar card' },
      { status: 500 }
    )
  }
}
