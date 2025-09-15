import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chatId = formData.get('chatId')
    const file = formData.get('file')
    
    if (!chatId || !file) {
      return NextResponse.json({ error: 'ChatId e arquivo são obrigatórios' }, { status: 400 })
    }

    // Criar FormData para WAHA API
    const wahaFormData = new FormData()
    wahaFormData.append('chatId', chatId as string)
    wahaFormData.append('file', file)
    if (formData.get('caption')) {
      wahaFormData.append('caption', formData.get('caption') as string)
    }
    
    // Usar WAHA API para envio direto de mídia
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Fazer requisição direta para WAHA
    const response = await fetch(`${wahaUrl}/api/sendImage`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey
      },
      body: wahaFormData
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
