import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const caption = formData.get('caption') as string

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem fornecida' }, { status: 400 })
    }

    // Converter arquivo para FormData para enviar ao backend Go
    const backendFormData = new FormData()
    backendFormData.append('image', file)
    if (caption) {
      backendFormData.append('caption', caption)
    }

    // Enviar diretamente para o backend Go (que salvará no droplet)
    const backendUrl = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'
    const token = request.headers.get('authorization')

    const response = await fetch(`${backendUrl}/api/whatsapp/chats/${params.chatId}/image`, {
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
    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Erro no upload de imagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
