import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, messageIds } = body

    if (!chatId || !messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'chatId e messageIds são obrigatórios' },
        { status: 400 }
      )
    }

    const token = request.headers.get('Authorization')
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const backendUrl = process.env.BACKEND_URL
    const payload = {
      chatId,
      messageIds,
      participant: null,
      session: 'user_fb8da1d7_1758158816675'
    }

    const response = await fetch(`${backendUrl}/api/whatsapp/sendSeen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend sendSeen error:', errorText)
      return NextResponse.json(
        { error: 'Erro ao marcar como visto' },
        { status: response.status }
      )
    }

    const result = await response.json().catch(() => ({}))
    return NextResponse.json(result)

  } catch (error) {
    console.error('SendSeen API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
