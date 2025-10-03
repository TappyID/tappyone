import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  console.log('📞 [ORÇAMENTOS] GET route foi chamado para chatId:', params.chatId)
  
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [ORÇAMENTOS] Token não encontrado no header')
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    const url = `${BACKEND_URL}/api/chats/${encodeURIComponent(params.chatId)}/orcamentos`
    console.log('📞 [ORÇAMENTOS] Fazendo requisição para backend:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ [ORÇAMENTOS] Erro na resposta do backend:', response.status)
      return NextResponse.json({ error: 'Erro ao buscar orçamentos' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [ORÇAMENTOS] Dados recebidos do backend:', data)
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error) {
    console.error('❌ [ORÇAMENTOS] Erro na API proxy:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
