import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('👤 [sendContact] Iniciando...')
    const body = await request.json()
    const { chatId, contactId, name } = body
    
    console.log('📋 [sendContact] Dados recebidos:', {
      chatId,
      contactId,
      name
    })
    
    if (!chatId || !contactId || !name) {
      console.error('❌ [sendContact] Dados obrigatórios ausentes')
      return NextResponse.json({ error: 'ChatId, contactId e name são obrigatórios' }, { status: 400 })
    }

    // Usar WAHA API diretamente
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Payload no formato correto do WAHA para contato
    const payload = {
      chatId: chatId as string,
      contactId: contactId as string,
      name: name as string,
      session: 'user_fb8da1d7_1758158816675'
    }

    console.log('🌐 [sendContact] Payload WAHA:', payload)

    // Fazer requisição direta para WAHA
    const response = await fetch(`${wahaUrl}/api/sendContactVcard`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('📡 [sendContact] Resposta WAHA:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [sendContact] Erro WAHA:', response.status, errorText)
      return NextResponse.json({ error: 'Erro ao enviar contato' }, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ [sendContact] Contato enviado com sucesso!')
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 [sendContact] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
