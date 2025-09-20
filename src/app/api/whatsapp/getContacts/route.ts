import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('📞 [getContacts] Buscando contatos do WAHA')
    
    // Usar WAHA API diretamente
    const wahaUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
    const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

    // Buscar contatos do WAHA usando endpoint correto
    const response = await fetch(`${wahaUrl}/api/contacts/all?session=user_fb8da1d7_1758158816675`, {
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
        return hasName && isNotGroup && isNotLid
      })
      .map((contact: any) => ({
        id: contact.id,
        name: contact.name || contact.pushname || 'Sem nome',
        phone: contact.number || contact.id.replace('@c.us', ''),
        profilePicture: contact.profilePictureUrl || null,
        isMyContact: contact.isMyContact || false,
        whatsappId: contact.id.replace('@c.us', ''),
        pushname: contact.pushname || ''
      }))
      .slice(0, 100) // Limitar a 100 contatos para evitar sobrecarga

    return NextResponse.json({
      success: true,
      contacts: filteredContacts,
      total: filteredContacts.length
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
