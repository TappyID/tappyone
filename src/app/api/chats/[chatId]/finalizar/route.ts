import { NextRequest, NextResponse } from 'next/server'

// URL do backend baseado no ambiente
const getBackendUrl = () => {
  // Em produção, usar a URL da Digital Ocean
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || 'http://159.65.34.199:8081'
  }
  // Em desenvolvimento, tentar primeiro localhost, depois Digital Ocean
  return process.env.BACKEND_URL || 'http://159.65.34.199:8081'
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log(`🏁 [FINALIZAR] POST - ChatId: ${chatId}`)

    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/chats/${chatId}/finalizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ [FINALIZAR] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [FINALIZAR] Atendimento finalizado com sucesso!')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [FINALIZAR] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
