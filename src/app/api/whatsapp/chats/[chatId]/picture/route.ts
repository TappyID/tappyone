import { NextRequest, NextResponse } from 'next/server'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    console.log('🖼️ [PICTURE] GET route chamado para chatId:', chatId)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [PICTURE] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🔑 [PICTURE] Token encontrado:', authHeader.substring(0, 20) + '...')
    console.log('📡 [PICTURE] Fazendo chamada para WAHA:', `${WAHA_URL}/api/whatsapp/chats/${chatId}/picture`)

    // Proxy para o backend WAHA
    const response = await fetch(`${WAHA_URL}/api/whatsapp/chats/${encodeURIComponent(chatId)}/picture`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 [PICTURE] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [PICTURE] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [PICTURE] Foto obtida do backend para chatId:', chatId)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [PICTURE] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
