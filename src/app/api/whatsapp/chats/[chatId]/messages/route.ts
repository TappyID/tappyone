import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    console.log(' [WHATSAPP MESSAGES] GET route chamado para chat:', chatId)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log(' [WHATSAPP MESSAGES] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log(' [WHATSAPP MESSAGES] Token encontrado')
    console.log(' [WHATSAPP MESSAGES] Fazendo chamada para backend:', `${BACKEND_URL}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`)

    // Proxy para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    console.log(' [WHATSAPP MESSAGES] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(' [WHATSAPP MESSAGES] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(' [WHATSAPP MESSAGES] Dados obtidos do backend:', data?.length || 0, 'mensagens')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(' [WHATSAPP MESSAGES] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    console.log(' [WHATSAPP MESSAGES] POST route chamado para chat:', chatId)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const body = await request.json()
    console.log(' [WHATSAPP MESSAGES] Dados recebidos:', body)

    // Proxy para o backend Go
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log(' [WHATSAPP MESSAGES] Status POST backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(' [WHATSAPP MESSAGES] Erro POST backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(' [WHATSAPP MESSAGES] POST concluído:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error(' [WHATSAPP MESSAGES] Erro POST interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
