import { NextRequest, NextResponse } from 'next/server'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Decodificar o token para pegar o user_id
    const token = authHeader.replace('Bearer ', '')
    const payload = JSON.parse(atob(token.split('.')[1]))
    const sessionName = `user_${payload.user_id}`

    // Try different WAHA API endpoints for contacts
    const possibleEndpoints = [
      `${WAHA_URL}/api/${sessionName}/contacts`,
      `${WAHA_URL}/api/${sessionName}/chats`,
      `${WAHA_URL}/api/sessions/${sessionName}/contacts`,
      `${WAHA_URL}/api/sessions/${sessionName}/chats`
    ]

    let response: Response | null = null
    let successUrl = ''

    for (const url of possibleEndpoints) {
      console.log('🔍 Tentando endpoint:', url)
      
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Api-Key': WAHA_API_KEY,
            'Content-Type': 'application/json'
          }
        })

        console.log('📡 Status:', response.status)
        
        if (response.ok) {
          successUrl = url
          console.log('✅ Endpoint funcionando:', url)
          break
        } else {
          console.log('❌ Falhou:', url, response.status)
        }
      } catch (err) {
        console.log('❌ Erro de rede:', url, err)
      }
    }

    if (!response || !response.ok) {
      console.error('❌ Todos os endpoints falharam')
      return NextResponse.json(
        { error: 'Nenhum endpoint de contatos WAHA funcionou' },
        { status: 404 }
      )
    }

    const data = await response.json()
    console.log('📋 Dados brutos da WAHA:', JSON.stringify(data.slice(0, 2), null, 2)) // Log primeiros 2 contatos
    
    // Mapear dados e buscar fotos de perfil para formato esperado pelo frontend
    const mappedData = Array.isArray(data) ? await Promise.all(data.map(async (contact: any) => {
      // Extrair phone do ID (formato: 5511999999999@c.us)
      let phone = ''
      let contactId = ''
      
      if (contact.id) {
        if (typeof contact.id === 'string') {
          contactId = contact.id
          phone = contact.id.replace('@c.us', '').replace(/\D/g, '')
        } else if (contact.id.user) {
          contactId = contact.id.user + '@c.us'
          phone = contact.id.user.replace(/\D/g, '')
        } else if (contact.id._serialized) {
          contactId = contact.id._serialized
          phone = contact.id._serialized.replace('@c.us', '').replace(/\D/g, '')
        }
      }

      // Buscar foto de perfil usando nossa API route interna
      let profilePictureUrl = contact.profilePictureUrl || contact.profilePicUrl || ''
      
      if (!profilePictureUrl && contactId) {
        try {
          // Fazer chamada interna para nossa própria API route
          const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
          const pictureResponse = await fetch(`${baseUrl}/api/whatsapp/chats/${encodeURIComponent(contactId)}/picture`, {
            headers: {
              'Authorization': request.headers.get('Authorization') || '',
              'Content-Type': 'application/json'
            }
          })
          
          if (pictureResponse.ok) {
            const pictureData = await pictureResponse.json()
            profilePictureUrl = pictureData.url || ''
          }
        } catch (error) {
          // Silenciar erros de foto de perfil (não críticos)
        }
      }
      
      return {
        id: contactId,
        name: contact.name || contact.pushname || contact.notify || '',
        pushname: contact.pushname || contact.notify || contact.name || '',
        phone: phone,
        profilePicUrl: profilePictureUrl,
        isGroup: contact.isGroup || false,
        isBlocked: contact.isBlocked || false
      }
    })) : data
    
    console.log('📋 Dados mapeados:', JSON.stringify(mappedData.slice(0, 2), null, 2)) // Log primeiros 2 mapeados
    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('❌ Erro no proxy WAHA contacts:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
