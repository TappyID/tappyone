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
  console.log('🚨 [TRANSFERIR] ROTA EXECUTADA - Início')
  
  try {
    const chatId = decodeURIComponent(params.chatId)
    const token = request.headers.get('authorization')
    const body = await request.json()
    
    console.log(`🔄 [TRANSFERIR] POST - ChatId original: ${params.chatId}`)
    console.log(`🔄 [TRANSFERIR] POST - ChatId decodificado: ${chatId}`)
    console.log('📋 [TRANSFERIR] Dados recebidos:', JSON.stringify(body, null, 2))
    
    if (!token) {
      console.log('❌ [TRANSFERIR] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/chats/${chatId}/transferir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ [TRANSFERIR] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [TRANSFERIR] Atendimento transferido com sucesso!')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [TRANSFERIR] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
