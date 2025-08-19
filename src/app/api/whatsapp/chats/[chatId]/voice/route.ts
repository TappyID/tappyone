import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    const formData = await request.formData()
    const backendFormData = new FormData()
    
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value)
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'}/api/whatsapp/chats/${chatId}/voice`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: backendFormData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar áudio' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Erro no proxy de áudio:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
