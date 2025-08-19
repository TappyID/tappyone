import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    
    // Obter token de autorização
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    // Obter dados do FormData
    const formData = await request.formData()
    
    // Criar novo FormData para enviar ao backend
    const backendFormData = new FormData()
    
    // Copiar todos os campos do FormData original
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value)
    }

    // URL do backend Go
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'}/api/whatsapp/chats/${chatId}/image`
    
    console.log('Proxy image request para:', backendUrl)
    
    // Fazer request para o backend Go
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
      return NextResponse.json({ error: 'Erro ao enviar imagem' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Erro no proxy de imagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
