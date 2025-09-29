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

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log(`🔍 [LEADS] GET - ChatId: ${chatId}`)

    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/chats/${chatId}/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ [LEADS] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [LEADS] Lead encontrado:', data.data ? 'SIM' : 'NÃO')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [LEADS] Erro na API:', error)
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
    const chatId = params.chatId
    const token = request.headers.get('authorization')
    const body = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log(`💾 [LEADS] POST - ChatId: ${chatId}`)
    console.log('📋 [LEADS] Dados recebidos:', {
      nome_empresa: body.nome_empresa,
      cnpj_cpf: body.cnpj_cpf,
      cep: body.cep
    })

    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/chats/${chatId}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ [LEADS] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [LEADS] Lead salvo com sucesso!')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [LEADS] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    console.log(`🔄 [LEADS] PUT - ChatId: ${chatId}`)
    console.log('📋 [LEADS] Dados para atualizar:', body)

    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/chats/${chatId}/leads`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    })

    console.log('📡 [LEADS] Status da resposta:', response.status)
    
    // Verificar se a resposta tem conteúdo
    const responseText = await response.text()
    console.log('📄 [LEADS] Resposta raw:', responseText)
    
    let data
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error('❌ [LEADS] Erro ao parsear JSON:', parseError)
      console.error('📄 [LEADS] Resposta que causou erro:', responseText)
      return NextResponse.json(
        { error: 'Resposta inválida do backend', raw: responseText },
        { status: 500 }
      )
    }
    
    if (!response.ok) {
      console.error('❌ [LEADS] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [LEADS] Lead atualizado com sucesso!')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [LEADS] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log(`🗑️ [LEADS] DELETE - ChatId: ${chatId}`)

    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/chats/${chatId}/leads`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ [LEADS] Erro do backend:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ [LEADS] Lead removido com sucesso!')
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [LEADS] Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
