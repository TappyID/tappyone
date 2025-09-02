import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:3001/'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }

    console.log('🏷️ [API ROUTE] Buscando tags do backend')
    const response = await fetch(`${BACKEND_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ [API ROUTE] Erro do backend ao buscar tags:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao buscar tags' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [API ROUTE] Tags encontradas:', data?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API de tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Token de autorização não fornecido' }, { status: 401 })
    }

    console.log('🏷️ [API ROUTE] Criando nova tag:', { nome: body.nome, categoria: body.categoria })
    const response = await fetch(`${BACKEND_URL}/api/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ [API ROUTE] Erro do backend ao criar tag:', { status: response.status, error })
      return NextResponse.json({ error: 'Erro ao criar tag' }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ [API ROUTE] Tag criada com sucesso:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro na API de tags:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
