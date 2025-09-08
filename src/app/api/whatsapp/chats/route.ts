import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

const wahaUrl = 'http://159.65.34.199:3001'
const backendUrl = 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [WHATSAPP CHATS] GET route chamado')
    
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 [WHATSAPP CHATS] AuthHeader:', authHeader ? `${authHeader.substring(0, 20)}...` : 'null')
    
    if (!authHeader) {
      console.log('❌ [WHATSAPP CHATS] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Extrair userID do token JWT
    const token = authHeader.replace('Bearer ', '')
    let userID: string
    
    try {
      const decoded = jwt.decode(token) as any
      userID = decoded?.user_id
      if (!userID) {
        console.log('❌ [WHATSAPP CHATS] UserID não encontrado no token')
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
      console.log('🔍 [WHATSAPP CHATS] UserID extraído do token:', userID)
    } catch (error) {
      console.log('❌ [WHATSAPP CHATS] Erro ao decodificar token:', error)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Buscar conexão ativa do usuário no backend
    console.log('🔍 [WHATSAPP CHATS] Buscando conexão do usuário no backend...')
    const connectionsResponse = await fetch(`${backendUrl}/api/connections/`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    if (!connectionsResponse.ok) {
      console.log('❌ [WHATSAPP CHATS] Erro ao buscar conexões:', connectionsResponse.status)
      return NextResponse.json({ error: 'Erro ao buscar conexões' }, { status: 500 })
    }

    const connectionsData = await connectionsResponse.json()
    console.log('📡 [WHATSAPP CHATS] Conexões encontradas:', connectionsData?.connections?.length || 0)
    
    // Buscar conexão ativa do WhatsApp
    const whatsappConnection = connectionsData?.connections?.find(
      (conn: any) => conn.platform === 'whatsapp' && conn.status === 'connected'
    )
    
    if (!whatsappConnection) {
      console.log('❌ [WHATSAPP CHATS] Nenhuma conexão WhatsApp ativa encontrada')
      return NextResponse.json([], { status: 200 })
    }

    const sessionName = whatsappConnection.session_name
    console.log('✅ [WHATSAPP CHATS] Sessão ativa encontrada:', sessionName)
    console.log('📡 [WHATSAPP CHATS] Fazendo chamada para WAHA:', `${wahaUrl}/api/${sessionName}/chats`)

    // Proxy direto para WAHA
    const response = await fetch(`${wahaUrl}/api/${sessionName}/chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'tappyone-waha-2024-secretkey'
      }
    })

    console.log('📡 [WHATSAPP CHATS] Status da resposta WAHA:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [WHATSAPP CHATS] Erro WAHA:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [WHATSAPP CHATS] Dados obtidos WAHA:', data?.length || 0, 'chats')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [WHATSAPP CHATS] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
