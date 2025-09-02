import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081/'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contatoId = searchParams.get('contato_id')
    const status = searchParams.get('status')
    
    // Pegar token JWT dos headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    // Construir URL com query params
    let url = `${BACKEND_URL}/api/orcamentos`
    const params = new URLSearchParams()
    
    if (contatoId) {
      params.append('contato_id', contatoId)
    }
    if (status) {
      params.append('status', status)
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    console.log('Fazendo requisição para:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Dados recebidos:', data.length, 'orçamentos')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Pegar token JWT dos headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('Criando orçamento:', body)

    const response = await fetch(`${BACKEND_URL}/api/orcamentos`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Orçamento criado:', data)
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
