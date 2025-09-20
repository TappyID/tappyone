import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit
    
    console.log('📞 [getContacts] Buscando contatos do WAHA', { page, limit, offset })
    
    // Usar WAHA API diretamente
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Buscar contatos do WAHA usando endpoint correto com paginação
    const response = await fetch(`${wahaUrl}/api/contacts/all?session=user_fb8da1d7_1758158816675&limit=${limit * 2}&offset=${offset}&sortBy=name&sortOrder=asc`, {
      method: 'GET',
      headers: {
        'X-API-Key': wahaApiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ [getContacts] Erro na API WAHA:', response.status)
      throw new Error(`Erro na API WAHA: ${response.status}`)
    }

    const contacts = await response.json()
    console.log('✅ [getContacts] Contatos encontrados:', contacts.length)

    // Filtrar apenas contatos reais (com nome ou pushname) e não grupos/lids
    const filteredContacts = contacts
      .filter((contact: any) => {
        const hasName = contact.name || contact.pushname
        const isNotGroup = !contact.isGroup
        const isNotLid = !contact.id.includes('@lid')
        const isNotNewsletter = !contact.id.includes('@newsletter')
        return hasName && isNotGroup && isNotLid && isNotNewsletter
      })
      .map((contact: any) => ({
        id: contact.id,
        name: contact.name || contact.pushname || 'Sem nome',
        phone: contact.number || contact.id.replace('@c.us', ''),
        profilePicture: contact.profilePictureUrl || null,
        isMyContact: contact.isMyContact || false,
        whatsappId: contact.id.replace('@c.us', ''),
        pushname: contact.pushname || '',
        shortName: contact.shortName || '',
        isWAContact: contact.isWAContact || false,
        isBlocked: contact.isBlocked || false,
        // Campos para VCARD completo
        organization: '', // Pode ser preenchido depois
        email: '', // Pode ser preenchido depois
        // VCARD será gerado dinamicamente
        vcard: null
      }))
      .slice(0, limit) // Aplicar limite final

    return NextResponse.json({
      success: true,
      contacts: filteredContacts,
      total: filteredContacts.length,
      page,
      limit,
      hasMore: filteredContacts.length === limit
    })

  } catch (error) {
    console.error('💥 [getContacts] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar contatos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}