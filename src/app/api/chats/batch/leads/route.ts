import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    console.log('🔄 [BATCH LEADS] Recebendo requisição para', body.cardIds?.length || 0, 'chats')

    const response = await fetch(`${BACKEND_URL}/api/chats/batch/leads`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [BATCH LEADS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erro ao buscar leads' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [BATCH LEADS] Dados recebidos:', Object.keys(data).length, 'leads')
    
    // 🔍 DEBUG: Mostrar primeiro lead
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
      console.log('🔍 [BATCH LEADS] Exemplo:', JSON.stringify(data[firstKey], null, 2))
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [BATCH LEADS] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
