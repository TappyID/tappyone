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


    // Fazer requisição para o backend GO
    const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const backendUrl = `${BACKEND_URL}/api/chats/${encodeURIComponent(chatId)}/tags`

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })


    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
