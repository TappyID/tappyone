import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  console.log('📞 [WHATSAPP CACHED] GET route foi chamado')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [WHATSAPP CACHED] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    
    // Pegar query params (session, limit, offset)
    const searchParams = request.nextUrl.searchParams
    const session = searchParams.get('session') || 'user_fb8da1d7_1758158816675'
    const limit = searchParams.get('limit') || '10000'
    const offset = searchParams.get('offset') || '0'
    
    const url = `${BACKEND_URL}/api/whatsapp/chats/cached?session=${session}&limit=${limit}&offset=${offset}`
    console.log('📞 [WHATSAPP CACHED] Fazendo requisição para backend:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [WHATSAPP CACHED] Erro na resposta do backend:', response.status)
      return NextResponse.json({ error: 'Erro ao buscar chats cached' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [WHATSAPP CACHED] Dados recebidos do backend')
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [WHATSAPP CACHED] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
