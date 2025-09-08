import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: { sessionName: string } }) {
  try {
    console.log('🔄 [CONNECTIONS] PUT route chamado para session:', params.sessionName)
    
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:8081'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      console.log('❌ [CONNECTIONS] Token não fornecido')
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 [CONNECTIONS] Modulation recebida:', body)

    // Primeiro tentar criar/atualizar a conexão WhatsApp
    const connectionResponse = await fetch(`${backendUrl}/api/connections/whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'whatsapp',
        status: 'connected',
        session_name: params.sessionName,
        modulation: body.modulation
      })
    })

    if (!connectionResponse.ok) {
      const errorData = await connectionResponse.text()
      console.error('❌ [CONNECTIONS] Erro ao criar/atualizar conexão:', connectionResponse.status, errorData)
      return NextResponse.json({ error: `Erro ao criar conexão: ${connectionResponse.status}` }, { status: connectionResponse.status })
    }

    const connectionData = await connectionResponse.json()
    console.log('✅ [CONNECTIONS] Conexão criada/atualizada:', connectionData)
    
    return NextResponse.json(connectionData)
  } catch (error) {
    console.error('❌ [CONNECTIONS] Erro interno PUT:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { sessionName: string } }) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const response = await fetch(`${backendUrl}/api/connections/whatsapp/${params.sessionName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authorization,
      }
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({ message: 'Conexão WhatsApp removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover conexão WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
