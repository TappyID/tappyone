import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001'

// GET - Buscar tags do contato
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }

    console.log('🏷️ [API] Buscando tags do contato:', params.chatId)
    const response = await fetch(`${BACKEND_URL}/api/contatos/${params.chatId}/tags`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ [API] Erro do backend ao buscar tags do contato:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao buscar tags do contato' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [API] Tags do contato encontradas:', data?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API de tags do contato:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar tags do contato
export async function PUT(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }

    const body = await request.json()
    const { tagIds } = body

    if (!Array.isArray(tagIds)) {
      return NextResponse.json({ error: 'tagIds deve ser um array' }, { status: 400 })
    }

    console.log('🏷️ [API] Atualizando tags do contato:', { chatId: params.chatId, tagIds })
    const response = await fetch(`${BACKEND_URL}/api/contatos/${params.chatId}/tags`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({ tagIds })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ [API] Erro do backend ao atualizar tags:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao atualizar tags do contato' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [API] Tags do contato atualizadas com sucesso:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API de atualização de tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
