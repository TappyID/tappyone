import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Forçar rota dinâmica para permitir uso de headers
export const dynamic = 'force-dynamic'

const wahaUrl = 'http://159.65.34.199:3001'
const backendUrl = 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  try {
    
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Extrair userID e tipo do token JWT
    const token = authHeader.replace('Bearer ', '')
    let userID: string
    let userType: string
    
    try {
      const decoded = jwt.decode(token) as any
      userID = decoded?.user_id
      userType = decoded?.tipo || decoded?.type || 'admin'
      
      console.log('🔍 [WHATSAPP CHATS] UserID:', userID)
      console.log('🔍 [WHATSAPP CHATS] UserType:', userType)
      
      if (!userID) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Buscar TODAS as conexões ativas (não apenas do usuário)
    const connectionsResponse = await fetch(`${backendUrl}/api/connections/`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    if (!connectionsResponse.ok) {
      console.error('❌ [WHATSAPP CHATS] Erro ao buscar conexões:', connectionsResponse.status)
      return NextResponse.json({ error: 'Erro ao buscar conexões' }, { status: 500 })
    }

    const connectionsData = await connectionsResponse.json()
    console.log('📊 [WHATSAPP CHATS] Conexões encontradas:', connectionsData?.connections?.length || 0)
    
    // Buscar primeira conexão ativa do WhatsApp (da empresa)
    const whatsappConnection = connectionsData?.connections?.find(
      (conn: any) => conn.platform === 'whatsapp' && (conn.status === 'connected' || conn.status === 'WORKING')
    )
    
    if (!whatsappConnection) {
      console.log('⚠️ [WHATSAPP CHATS] Nenhuma conexão WhatsApp ativa encontrada')
      return NextResponse.json([], { status: 200 })
    }

    const sessionName = whatsappConnection.session_name
    console.log('✅ [WHATSAPP CHATS] Usando sessão:', sessionName)

    // 🚀 OTIMIZAÇÃO: Adicionar suporte a paginação e sessionName específico
    const url = new URL(request.url)
    const limit = url.searchParams.get('limit') || '50'
    const offset = url.searchParams.get('offset') || '0'
    const specificSession = url.searchParams.get('session')
    
    // Usar backend Go com Redis cache em vez de WAHA direto
    const response = await fetch(`${backendUrl}/api/whatsapp/chats/cached?session=${sessionName}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })


    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Erro WAHA: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
