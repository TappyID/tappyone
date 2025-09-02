import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://159.65.34.199:8081/'

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
    let url = `${BACKEND_URL}/api/agendamentos`
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
    console.log('Dados recebidos:', data.length, 'agendamentos')
    
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
  console.log(' [API PROXY] POST route foi chamado!')
  
  try {
    const body = await request.json()
    console.log(' [AGENDAMENTOS API] Body parseado:', JSON.stringify(body, null, 2))
    console.log(' [AGENDAMENTOS API] Campos do body:', Object.keys(body))
    console.log(' [AGENDAMENTOS API] contato_id tipo:', typeof body.contato_id, 'valor:', body.contato_id)
    
    // Pegar token JWT dos headers
    const authHeader = request.headers.get('Authorization')
    console.log(' [API PROXY] Auth header:', authHeader ? 'presente' : 'ausente')
    
    if (!authHeader) {
      console.log(' [API PROXY] Token não fornecido')
      console.log('❌ [API PROXY] Token não fornecido')
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    console.log('🚀 [API PROXY] Dados recebidos do frontend:', JSON.stringify(body, null, 2))
    console.log('🚀 [API PROXY] Enviando para backend:', `${BACKEND_URL}/api/agendamentos`)

    const response = await fetch(`${BACKEND_URL}/api/agendamentos`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('📡 [API PROXY] Status da resposta do backend:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [API PROXY] Erro do backend:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro do backend: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [API PROXY] Agendamento criado:', data)
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('❌ [API PROXY] Erro na API proxy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
