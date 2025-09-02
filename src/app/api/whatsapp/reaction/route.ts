import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, reaction } = body
    
    if (!messageId) {
      return NextResponse.json({ error: 'messageId é obrigatório' }, { status: 400 })
    }

    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
    
    const response = await fetch(`${backendUrl}/api/whatsapp/messages/${messageId}/reaction`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ reaction }),
    })

    // Verificar se a resposta tem conteúdo antes de fazer parse
    let data = {}
    const responseText = await response.text()
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta do backend:', parseError)
        data = { message: 'Reação processada com sucesso' }
      }
    }

    if (!response.ok) {
      return NextResponse.json(data || { error: 'Erro no servidor' }, { status: response.status })
    }

    return NextResponse.json(data || { success: true })
  } catch (error) {
    console.error('Erro no proxy reaction:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
