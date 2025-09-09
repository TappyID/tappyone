import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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
      console.error('❌ FORWARD - Erro ao obter sessões:', sessionsResponse.status)
      return NextResponse.json({ error: 'Erro ao obter sessão ativa' }, { status: 500 })
    }

    const sessionsData = await sessionsResponse.json()
    let activeSession = null

    // Encontrar sessão ativa (WORKING)
    if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
      activeSession = sessionsData.sessions.find((session: any) => session.status === 'WORKING')
    }

    if (!activeSession) {
      console.error('❌ FORWARD - Nenhuma sessão ativa encontrada')
      return NextResponse.json({ error: 'Nenhuma sessão ativa encontrada' }, { status: 404 })
    }

    console.log('📤 FORWARD - Sessão ativa encontrada:', activeSession.name)

    // Adicionar sessão ao body
    const bodyWithSession = {
      ...body,
      session: activeSession.name
    }
    
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/messages/forward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(bodyWithSession),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro no proxy forward:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
