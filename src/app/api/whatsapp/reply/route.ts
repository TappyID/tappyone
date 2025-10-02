import { NextRequest, NextResponse } from 'next/server'
import { getActiveSession } from '@/utils/getActiveSession'

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

    console.log('💬 REPLY - Dados recebidos:', { chatId, text, replyTo })

    // Buscar token e sessão ativa
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const sessionName = await getActiveSession(token)
    if (!sessionName) {
      return NextResponse.json({ error: 'Nenhuma sessão ativa encontrada' }, { status: 404 })
    }

    // Usar WAHA API diretamente (igual às outras APIs)
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Payload no formato WAHA
    const payload = {
      chatId,
      text,
      reply_to: replyTo, // WAHA usa reply_to ao invés de replyTo
      session: sessionName
    }
    
    console.log('💬 REPLY - Enviando para WAHA:', wahaUrl, payload)

    // Fazer requisição direta para WAHA (igual sendImage)
    const response = await fetch(`${wahaUrl}/api/sendText`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ REPLY - WAHA error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Erro ao enviar reply', details: errorText },
        { status: response.status }
      )
    }
    
    console.log('✅ REPLY - Sucesso no WAHA')

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Erro no reply:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
