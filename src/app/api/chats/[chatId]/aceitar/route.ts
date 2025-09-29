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
    const body = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log(`🆕 [ACEITAR] POST - ChatId: ${chatId}`)
    console.log('📋 [ACEITAR] Dados recebidos:', {
      responsavelId: body.responsavelId,
      filaId: body.filaId
    })

    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/chats/${chatId}/aceitar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ [ACEITAR] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [ACEITAR] Atendimento aceito com sucesso!')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [ACEITAR] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
