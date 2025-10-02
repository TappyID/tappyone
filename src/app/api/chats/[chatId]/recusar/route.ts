import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    console.log('🚫 [RECUSAR API] Recusando chat:', chatId)

    const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/recusar`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ [RECUSAR API] Erro do backend:', errorData)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [RECUSAR API] Chat recusado com sucesso')

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ [RECUSAR API] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao recusar atendimento', details: error.message },
      { status: 500 }
    )
  }
}
