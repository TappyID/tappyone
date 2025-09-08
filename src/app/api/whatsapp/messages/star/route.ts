import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messageId, chatId, action } = await request.json()
    
    if (!messageId || !chatId) {
      return NextResponse.json({ 
        error: 'messageId e chatId são obrigatórios' 
      }, { status: 400 })
    }

    // Validar JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
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
      console.error('❌ STARS - Erro ao obter sessões:', sessionsResponse.status)
      return NextResponse.json({ error: 'Erro ao obter sessão ativa' }, { status: 500 })
    }

    const sessionsData = await sessionsResponse.json()
    let activeSession = null

    // Encontrar sessão ativa (WORKING)
    if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
      activeSession = sessionsData.sessions.find((session: any) => session.status === 'WORKING')
    }

    if (!activeSession) {
      console.error('❌ STARS - Nenhuma sessão ativa encontrada')
      return NextResponse.json({ error: 'Nenhuma sessão ativa encontrada' }, { status: 404 })
    }

    console.log('⭐ STARS - Sessão ativa encontrada:', activeSession.name)
    console.log('⭐ STARS - Ação:', action, 'messageId:', messageId)

    // Chamar WAHA API diretamente para star/unstar message
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_URL || 'http://159.65.34.199:3001/'
    const wahaToken = process.env.WAHA_API_KEY || 'your-api-key'

    const response = await fetch(`${wahaUrl}/api/${activeSession.name}/messages/${messageId}/star`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': wahaToken
      },
      body: JSON.stringify({
        star: action === 'star' ? true : false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ STARS - Erro WAHA:', response.status, errorText)
      return NextResponse.json({ 
        error: `Erro ao ${action === 'star' ? 'favoritar' : 'desfavoritar'} mensagem`, 
        details: errorText 
      }, { status: response.status })
    }

    const result = await response.json()
    console.log(`✅ STARS - ${action === 'star' ? 'Favoritar' : 'Desfavoritar'} realizado com sucesso`)

    return NextResponse.json({
      success: true,
      messageId,
      starred: action === 'star',
      action,
      ...result
    })

  } catch (error) {
    console.error('💥 Erro ao favoritar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
