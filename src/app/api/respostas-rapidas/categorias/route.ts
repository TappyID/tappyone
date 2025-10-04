import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    console.log('📋 [CATEGORIAS] GET - Buscando categorias')

    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/categorias`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CATEGORIAS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [CATEGORIAS] Categorias recebidas:', data.length || 0)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [CATEGORIAS] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📋 [CATEGORIAS] POST - Criando categoria:', body)

    const response = await fetch(`${BACKEND_URL}/api/respostas-rapidas/categorias`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CATEGORIAS] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [CATEGORIAS] Categoria criada:', data)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ [CATEGORIAS] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}
