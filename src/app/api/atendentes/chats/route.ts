import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }
    
    const response = await fetch(`${BACKEND_URL}/api/atendentes/me/chats`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    })

    const text = await response.text()

    if (!response.ok) {
      try {
        const data = text ? JSON.parse(text) : { error: 'Erro desconhecido' }
        return NextResponse.json(data, { status: response.status })
      } catch {
        return NextResponse.json({ error: text || 'Erro ao processar resposta' }, { status: response.status })
      }
    }

    try {
      const data = text ? JSON.parse(text) : []
      return NextResponse.json(data, { status: 200 })
    } catch {
      // Se não for JSON válido, retornar array vazio
      return NextResponse.json([], { status: 200 })
    }
  } catch (error) {
    console.error('[ATENDENTES/CHATS] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar chats do atendente' },
      { status: 500 }
    )
  }
}
