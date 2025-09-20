import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { chatId, contacts } = await request.json()
    console.log('📞 [sendContactVcard] Enviando contatos para:', chatId)
    console.log('📞 [sendContactVcard] Quantidade de contatos:', contacts?.length)

    if (!chatId || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'chatId e array de contacts são obrigatórios' },
        { status: 400 }
      )
    }

    // Usar WAHA API diretamente
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Payload no formato correto do WAHA
    const payload = {
      chatId: chatId as string,
      contacts: contacts.map((contact: any) => {
        // Se já tem vcard, usar ele
        if (contact.vcard) {
          return { vcard: contact.vcard }
        }
        
        // Senão, criar do formato simplificado
        return {
          fullName: contact.name || contact.fullName,
          organization: contact.organization || '',
          phoneNumber: contact.phone || contact.phoneNumber,
          whatsappId: contact.whatsappId || contact.id?.replace('@c.us', ''),
          vcard: null
        }
      }),
      session: 'user_fb8da1d7_1758158816675'
    }

    console.log('🌐 [sendContactVcard] Payload WAHA:', JSON.stringify(payload, null, 2))

    // Fazer requisição direta para WAHA
    const response = await fetch(`${wahaUrl}/api/sendContactVcard`, {
      method: 'POST',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('📞 [sendContactVcard] Status WAHA:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [sendContactVcard] Erro WAHA:', errorText)
      throw new Error(`Erro na API WAHA: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ [sendContactVcard] Contatos enviados com sucesso!')

    return NextResponse.json({
      success: true,
      message: `${contacts.length} contato(s) enviado(s) com sucesso`,
      data: result
    })

  } catch (error) {
    console.error('💥 [sendContactVcard] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao enviar contatos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
