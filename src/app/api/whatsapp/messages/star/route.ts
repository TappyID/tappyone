import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messageId, chatId } = await request.json()
    
    if (!messageId || !chatId) {
      return NextResponse.json({ error: 'messageId e chatId são obrigatórios' }, { status: 400 })
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'
    
    // Salvar favorito no backend Go
    const backendResponse = await fetch(`${backendUrl}/api/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageId,
        chatId,
        starred: true
      })
    })

    if (!backendResponse.ok) {
      // Se backend não tem endpoint, usar só localStorage pelo frontend
      console.log('⚠️ Backend não suporta favoritos, usando localStorage')
      return NextResponse.json({ 
        success: true, 
        message: 'Favorito salvo localmente',
        useLocalStorage: true 
      })
    }

    const result = await backendResponse.json()
    console.log('✅ Mensagem favoritada no backend:', result)
    
    return NextResponse.json({ success: true, message: 'Mensagem favoritada com sucesso' })

  } catch (error) {
    console.error('💥 Erro ao favoritar mensagem:', error)
    // Fallback para localStorage
    return NextResponse.json({ 
      success: true, 
      message: 'Favorito salvo localmente (fallback)',
      useLocalStorage: true 
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { messageId, chatId, session } = await request.json()
    
    if (!messageId || !chatId) {
      return NextResponse.json({ error: 'messageId e chatId são obrigatórios' }, { status: 400 })
    }

    const wahaToken = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    
    // Buscar sessões ativas para obter a primeira sessão WORKING
    const sessionsResponse = await fetch(`${wahaUrl}/api/sessions`, {
      method: 'GET',
      headers: {
        'X-Api-Key': wahaToken,
        'Content-Type': 'application/json'
      }
    })

    if (!sessionsResponse.ok) {
      return NextResponse.json({ error: 'Erro ao obter sessão ativa' }, { status: 500 })
    }

    const sessions = await sessionsResponse.json()
    const activeSession = sessions.find((s: any) => s.status === 'WORKING')
    
    if (!activeSession) {
      return NextResponse.json({ error: 'Nenhuma sessão ativa encontrada' }, { status: 500 })
    }

    const sessionName = activeSession.name

    // Usar a API nativa do WAHA para remover favorito
    const unstarResponse = await fetch(`${wahaUrl}/api/star`, {
      method: 'PUT',
      headers: {
        'X-Api-Key': wahaToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageId: messageId,
        chatId: chatId,
        star: false,
        session: sessionName
      })
    })

    if (!unstarResponse.ok) {
      const errorText = await unstarResponse.text()
      return NextResponse.json({ error: `Erro ao remover favorito: ${errorText}` }, { status: unstarResponse.status })
    }

    const result = await unstarResponse.json()
    console.log('✅ Favorito removido com sucesso:', result)
    
    return NextResponse.json({ success: true, message: 'Favorito removido com sucesso' })

  } catch (error) {
    console.error('💥 Erro ao remover favorito:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
