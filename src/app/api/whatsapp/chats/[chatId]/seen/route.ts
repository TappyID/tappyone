import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    console.log('👁️ [WHATSAPP SEEN] POST route chamado para chat:', chatId)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Proxy para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/chats/${encodeURIComponent(chatId)}/seen`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 [WHATSAPP SEEN] Status backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WHATSAPP SEEN] Erro backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WHATSAPP SEEN] Concluído:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WHATSAPP SEEN] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
