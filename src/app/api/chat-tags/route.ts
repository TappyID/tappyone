import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Pegar chatId dos query params
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    
    if (!chatId) {
      return NextResponse.json({ error: 'chatId é obrigatório' }, { status: 400 })
    }

    // Pegar token do header
    const token = request.headers.get('authorization')
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🏷️ [API CHAT-TAGS] Proxy - ChatId:', chatId)

    // Fazer requisição para o backend GO
    const backendUrl = `http://159.65.34.199:8081/api/chats/${encodeURIComponent(chatId)}/tags`
    console.log('🏷️ [API CHAT-TAGS] URL do backend:', backendUrl)

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })

    console.log('🏷️ [API CHAT-TAGS] Status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('🏷️ [API CHAT-TAGS] Erro:', error)
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: response.status })
    }

    const data = await response.json()
    console.log('🏷️ [API CHAT-TAGS] Tags encontradas:', data.data?.length || 0)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [API CHAT-TAGS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
