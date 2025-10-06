import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081'

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/atendentes/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    })

    // Verificar se a resposta tem conteúdo
    const text = await response.text()
    
    if (!response.ok) {
      try {
        const data = text ? JSON.parse(text) : { error: 'Erro desconhecido' }
        return NextResponse.json(data, { status: response.status })
      } catch {
        return NextResponse.json({ error: text || 'Erro ao processar resposta' }, { status: response.status })
      }
    }

    // Tentar fazer parse do JSON
    try {
      const data = text ? JSON.parse(text) : { success: true }
      return NextResponse.json(data, { status: 200 })
    } catch {
      // Se não for JSON, retornar sucesso
      return NextResponse.json({ success: true, message: text }, { status: 200 })
    }
  } catch (error) {
    console.error('[ATENDENTES/ME] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar dados do atendente' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }
    
    const response = await fetch(`${BACKEND_URL}/api/atendentes/me`, {
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
      const data = text ? JSON.parse(text) : {}
      return NextResponse.json(data, { status: 200 })
    } catch {
      return NextResponse.json({ error: 'Resposta inválida do servidor' }, { status: 500 })
    }
  } catch (error) {
    console.error('[ATENDENTES/ME] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do atendente' },
      { status: 500 }
    )
  }
}
