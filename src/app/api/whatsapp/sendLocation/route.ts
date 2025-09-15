import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📍 [sendLocation] Iniciando...')
    const body = await request.json()
    const { chatId, latitude, longitude, title, address } = body
    
    console.log('📋 [sendLocation] Dados recebidos:', {
      chatId,
      latitude,
      longitude,
      title,
      address
    })
    
    if (!chatId || latitude === undefined || longitude === undefined) {
      console.error('❌ [sendLocation] Dados obrigatórios ausentes')
      return NextResponse.json({ error: 'ChatId, latitude e longitude são obrigatórios' }, { status: 400 })
    }

    // Usar WAHA API diretamente
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Payload no formato correto do WAHA para localização
    const payload: any = {
      chatId: chatId as string,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      session: 'user_3a24ed72_1757773035131'
    }

    // Adicionar título e endereço se fornecidos
    if (title) {
      payload.title = title
    }
    if (address) {
      payload.address = address
    }

    console.log('🌐 [sendLocation] Payload WAHA:', payload)

    // Fazer requisição direta para WAHA
    const response = await fetch(`${wahaUrl}/api/sendLocation`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('📡 [sendLocation] Resposta WAHA:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [sendLocation] Erro WAHA:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar localização' }, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ [sendLocation] Localização enviada com sucesso!')
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 [sendLocation] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
