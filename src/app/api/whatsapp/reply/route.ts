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

    // Fazer proxy para o backend Go para obter sessão ativa
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081'
    
    // Primeiro obter a sessão ativa do usuário via backend
    const sessionsResponse = await fetch(`${BACKEND_URL}/api/whatsapp/sessions`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    if (!sessionsResponse.ok) {
      console.error('❌ REPLY - Erro ao obter sessões:', sessionsResponse.status)
      return NextResponse.json({ error: 'Erro ao obter sessão ativa' }, { status: 500 })
    }

    const sessionsData = await sessionsResponse.json()
    let activeSession = null

    // Encontrar sessão ativa (WORKING)
    if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
      activeSession = sessionsData.sessions.find((session: any) => session.status === 'WORKING')
    }

    if (!activeSession) {
      console.error('❌ REPLY - Nenhuma sessão ativa encontrada')
      return NextResponse.json({ error: 'Nenhuma sessão ativa encontrada' }, { status: 404 })
    }

    console.log('💬 REPLY - Sessão ativa encontrada:', activeSession.name)
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081'
    const payload = {
      chatId,
      text,
      replyTo,
      session: activeSession.name
    }

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
