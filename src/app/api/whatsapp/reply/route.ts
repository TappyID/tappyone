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

    // Validar JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    // Usar sessão fixa conhecida (mais estável)
    const sessionName = 'user_fb8da1d7_1758158816675'
    console.log('💬 REPLY - Usando sessão:', sessionName)
    console.log('💬 REPLY - Dados recebidos:', { chatId, text, replyTo })
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'
    const payload = {
      chatId,
      text,
      replyTo,
      session: sessionName
    }
    
    console.log('💬 REPLY - Enviando para backend:', backendUrl, payload)

    const response = await fetch(`${backendUrl}/api/whatsapp/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ REPLY - Backend error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erro ao enviar reply', details: errorText },
        { status: response.status }
      )
    }
    
    console.log('✅ REPLY - Sucesso no backend')

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
