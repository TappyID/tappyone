import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [WHATSAPP CHATS] GET route chamado')
    console.log('🔍 [WHATSAPP CHATS] BACKEND_URL:', BACKEND_URL)
    console.log('🔍 [WHATSAPP CHATS] NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [WHATSAPP CHATS] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🔑 [WHATSAPP CHATS] Token encontrado:', authHeader.substring(0, 20) + '...')
    console.log('📡 [WHATSAPP CHATS] Fazendo chamada para backend:', `${BACKEND_URL}/api/whatsapp/chats`)

    // Proxy para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/chats`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 [WHATSAPP CHATS] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WHATSAPP CHATS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WHATSAPP CHATS] Dados obtidos do backend:', data?.length || 0, 'chats')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WHATSAPP CHATS] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
