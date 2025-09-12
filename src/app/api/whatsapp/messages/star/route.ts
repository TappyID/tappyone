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
    
    // Fazer request diretamente para WAHA API para obter sessões ativas
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_URL || 'http://159.65.34.199:8081'
    const wahaToken = process.env.WAHA_API_KEY || 'your-api-key'

    // Buscar sessões ativas na WAHA API
    const sessionsResponse = await fetch(`${wahaUrl}/api/sessions`, {
      method: 'GET',
      headers: {
        'X-Api-Key': wahaToken
      }
    })

    if (!sessionsResponse.ok) {
      console.error('❌ STARS - Erro ao obter sessões WAHA:', sessionsResponse.status)
      return NextResponse.json({ error: 'Erro ao obter sessão ativa' }, { status: 500 })
    }

    const sessions = await sessionsResponse.json()
    let activeSession = null

    // Encontrar sessão ativa (WORKING) - buscar por prefixo do token
    const userPrefix = `user_${token.substring(0, 8)}`
    
    for (const session of sessions) {
      if (session.name && session.name.startsWith(userPrefix) && session.status === 'WORKING') {
        activeSession = session
        break
      }
    }

    if (!activeSession) {
      console.error('❌ STARS - Nenhuma sessão ativa encontrada para usuário')
      return NextResponse.json({ error: 'Nenhuma sessão ativa encontrada' }, { status: 404 })
    }

    console.log('⭐ STARS - Sessão ativa encontrada:', activeSession.name)
    console.log('⭐ STARS - Ação:', action, 'messageId:', messageId)

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
