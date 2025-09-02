import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chatId = formData.get('chatId')
    const file = formData.get('file')
    
    if (!chatId || !file) {
      return NextResponse.json({ error: 'ChatId e arquivo são obrigatórios' }, { status: 400 })
    }

    // Criar novo FormData com nome correto do campo
    const backendFormData = new FormData()
    backendFormData.append('image', file)
    if (formData.get('caption')) {
      backendFormData.append('caption', formData.get('caption') as string)
    }
    
    // Pegar o backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
    const token = request.headers.get('authorization')

    // Fazer proxy direto para o backend Go
    const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': token || ''
      },
      body: backendFormData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar imagem' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no sendImage:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
