  import { NextRequest, NextResponse } from 'next/server'

  const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'

  export async function GET(
    request: NextRequest,
    { params }: { params: { chatId: string } }
  ) {
    try {
      const { chatId } = params
      
      // WAHA usa formato diferente: /api/user_{SESSION_ID}/chats/{CHAT_ID}/picture
      const sessionId = 'user_ce065849-4fa7-4757-a2cb-5581cfec9225'
      const wahaUrl = `${WAHA_URL}/api/${sessionId}/chats/${encodeURIComponent(chatId)}/picture?refresh=true`

      // Proxy para o backend WAHA
      const response = await fetch(wahaUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey',
          'accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [PICTURE] Erro do WAHA:', response.status, errorText)
        return NextResponse.json(
          { error: `Erro do WAHA: ${response.status}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      
      return NextResponse.json(data)
    } catch (error) {
      console.error('❌ [PICTURE] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
