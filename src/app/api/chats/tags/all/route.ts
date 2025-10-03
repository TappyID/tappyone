import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  console.log('📞 [TAGS] GET route foi chamado!')
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [TAGS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    console.log('📞 [TAGS] Fazendo requisição para backend:', `${BACKEND_URL}/api/chats/tags/all`)
    
    const response = await fetch(`${BACKEND_URL}/api/chats/tags/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [TAGS] Erro na resposta do backend:', response.status)
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [TAGS] Dados recebidos do backend:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [TAGS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
