import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

const WAHA_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || 'http://159.65.34.199:3001'
const WAHA_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [WHATSAPP CONTACTS] GET route chamado')
    
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 [WHATSAPP CONTACTS] AuthHeader:', authHeader ? `${authHeader.substring(0, 20)}...` : 'null')
    
    if (!authHeader) {
      console.log('❌ [WHATSAPP CONTACTS] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Buscar sessões ativas diretamente no WAHA (mesmo que chats/groups)
    console.log('🔍 [WHATSAPP CONTACTS] Buscando sessões ativas no WAHA...')
    const sessionsResponse = await fetch(`${WAHA_URL}/api/sessions`, {
      headers: {
        'X-API-Key': WAHA_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!sessionsResponse.ok) {
      console.log('❌ [WHATSAPP CONTACTS] Erro ao buscar sessões WAHA:', sessionsResponse.status)
      return NextResponse.json({ error: 'Erro ao conectar com WAHA' }, { status: 500 })
    }

    const sessions = await sessionsResponse.json()
    console.log('📡 [WHATSAPP CONTACTS] Sessões WAHA encontradas:', sessions.length)
    
    // Buscar primeira sessão ativa (WORKING)
    const activeSession = sessions.find((session: any) => session.status === 'WORKING')
    
    if (!activeSession) {
      console.log('❌ [WHATSAPP CONTACTS] Nenhuma sessão ativa encontrada no WAHA')
      return NextResponse.json([], { status: 200 })
    }

    const sessionName = activeSession.name
    console.log('✅ [WHATSAPP CONTACTS] Sessão ativa encontrada:', sessionName)

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
      console.log('🔍 [WHATSAPP CONTACTS] Tentando endpoint:', url)
      
      try {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Api-Key': WAHA_API_KEY,
            'Content-Type': 'application/json'
          }
        })

        console.log('📡 [WHATSAPP CONTACTS] Status:', response.status)
        
        if (response.ok) {
          successUrl = url
          console.log('✅ [WHATSAPP CONTACTS] Endpoint funcionando:', url)
          break
        } else {
          console.log('❌ [WHATSAPP CONTACTS] Falhou:', url, response.status)
        }
      } catch (err) {
        console.log('❌ [WHATSAPP CONTACTS] Erro de rede:', url, err)
      }
    }

    if (!response || !response.ok) {
      console.error('❌ [WHATSAPP CONTACTS] Todos os endpoints falharam')
      return NextResponse.json(
        { error: 'Nenhum endpoint de contatos WAHA funcionou' },
        { status: 404 }
      )
    }

    const data = await response.json()
    console.log('📋 [WHATSAPP CONTACTS] Dados brutos da WAHA:', JSON.stringify(data.slice(0, 2), null, 2))
    
    if (!Array.isArray(data)) {
      console.log('❌ [WHATSAPP CONTACTS] Dados não são um array:', data)
      return NextResponse.json([])
    }
    
    // Filtrar apenas contatos individuais (excluir grupos e números inválidos)
    const individualChats = data.filter((chat: any) => {
      const isGroup = chat.id && (chat.id.includes('@g.us') || chat.isGroup)
      const isInvalidNumber = chat.id === '0@c.us' || !chat.id || chat.id === 'status@broadcast'
      const hasValidPhone = chat.id && chat.id.includes('@c.us') && !chat.id.includes('@g.us')
      
      return !isGroup && !isInvalidNumber && hasValidPhone
    })
    
    console.log('📋 [WHATSAPP CONTACTS] Contatos individuais filtrados:', individualChats.length)
    
    // Se não temos contatos individuais, buscar do banco de dados como fallback
    if (individualChats.length === 0) {
      console.log('🔄 [WHATSAPP CONTACTS] Nenhum contato individual encontrado, buscando do banco...')
      
      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081'
        const backendResponse = await fetch(`${backendUrl}/api/contatos`, {
          headers: {
            'Authorization': request.headers.get('Authorization') || '',
            'Content-Type': 'application/json'
          }
        })
        
        if (backendResponse.ok) {
          const backendData = await backendResponse.json()
          const contatos = Array.isArray(backendData.data) ? backendData.data : []
          console.log('✅ [WHATSAPP CONTACTS] Contatos do banco encontrados:', contatos.length)
          
          const mappedBackendContacts = contatos.map((contato: any) => ({
            id: `${contato.telefone}@c.us`,
            name: contato.nome || '',
            pushname: contato.nome || '',
            phone: contato.telefone || '',
            profilePicUrl: '',
            isGroup: false,
            isBlocked: false,
            fromDatabase: true
          }))
          
          return NextResponse.json(mappedBackendContacts)
        }
      } catch (error) {
        console.error('❌ [WHATSAPP CONTACTS] Erro ao buscar contatos do banco:', error)
      }
      
      return NextResponse.json([])
    }
    
    // Mapear dados dos contatos individuais
    const mappedData = await Promise.all(individualChats.map(async (contact: any) => {
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
        name: contact.name || contact.pushname || contact.notify || phone,
        pushname: contact.pushname || contact.notify || contact.name || phone,
        phone: phone,
        profilePicUrl: profilePictureUrl,
        isGroup: false,
        isBlocked: contact.isBlocked || false
      }
    }))
    
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
