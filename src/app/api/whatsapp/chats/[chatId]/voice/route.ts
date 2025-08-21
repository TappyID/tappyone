import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('voice') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum áudio fornecido' }, { status: 400 })
    }

    // Converter arquivo para FormData para enviar ao backend Go
    const backendFormData = new FormData()
    backendFormData.append('voice', file)

    // Enviar diretamente para o backend Go (que salvará no droplet)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
    const token = request.headers.get('authorization')

    const response = await fetch(`${backendUrl}/api/whatsapp/chats/${params.chatId}/voice`, {
      method: 'POST',
      headers: {
        'Authorization': token || ''
      },
      body: backendFormData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar áudio' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Erro no upload de áudio:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
