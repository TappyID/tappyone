import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, text, replyTo } = body

    if (!chatId || !text || !replyTo) {
      return NextResponse.json(
        { error: 'chatId, text e replyTo são obrigatórios' },
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

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const payload = {
      chatId,
      text,
      replyTo,
      session: `user_${token.replace('Bearer ', '')}`
    }

    const response = await fetch(`${backendUrl}/api/whatsapp/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend reply error:', errorText)
      return NextResponse.json(
        { error: 'Erro ao enviar reply' },
        { status: response.status }
      )
    }

    const result = await response.json().catch(() => ({}))
    return NextResponse.json(result)

  } catch (error) {
    console.error('Reply API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
