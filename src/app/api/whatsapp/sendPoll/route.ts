import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📊 [sendPoll] Iniciando...')
    const body = await request.json()
    const { chatId, name, options, multipleAnswers = false } = body
    
    console.log('📋 [sendPoll] Dados recebidos:', {
      chatId,
      name,
      options,
      multipleAnswers
    })
    
    if (!chatId || !name || !options || !Array.isArray(options) || options.length < 2) {
      console.error('❌ [sendPoll] Dados obrigatórios ausentes ou inválidos')
      return NextResponse.json({ error: 'ChatId, name e options (mín. 2) são obrigatórios' }, { status: 400 })
    }

    // Usar WAHA API diretamente
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Payload no formato correto do WAHA para enquete
    const payload = {
      chatId: chatId as string,
      poll: {
        name: name as string,  // Poll name dentro do objeto poll
        options: options as string[],
        multipleAnswers: Boolean(multipleAnswers)
      },
      session: 'user_3a24ed72_1757773035131'
    }

    console.log('🌐 [sendPoll] Payload WAHA:', payload)

    // Fazer requisição direta para WAHA
    const response = await fetch(`${wahaUrl}/api/sendPoll`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('📡 [sendPoll] Resposta WAHA:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [sendPoll] Erro WAHA:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar enquete' }, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ [sendPoll] Enquete enviada com sucesso!')
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 [sendPoll] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
