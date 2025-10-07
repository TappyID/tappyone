import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  console.log('📞 [TAGS CHAT] GET route foi chamado para chatId:', params.chatId)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [TAGS CHAT] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    const url = `${BACKEND_URL}/api/chats/${encodeURIComponent(params.chatId)}/tags`
    console.log('📞 [TAGS CHAT] Fazendo requisição para backend:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  console.log('📞 [TAGS CHAT] POST route foi chamado para chatId:', params.chatId)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [TAGS CHAT] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    
    const url = `${BACKEND_URL}/api/chats/${encodeURIComponent(params.chatId)}/tags`
    console.log('📞 [TAGS CHAT] Adicionando tag no backend:', url, body)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      console.error('❌ [TAGS CHAT] Erro na resposta do backend:', response.status)
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [TAGS CHAT] Tag adicionada com sucesso:', data)
    
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
    console.error('❌ [TAGS CHAT] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
